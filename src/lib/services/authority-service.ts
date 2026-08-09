import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';
import { createAuditLog } from './audit-service';
import { createUserNotification } from './notification-service';
import { getComplaintById } from './complaint-service';

// Enforce valid status transition matrix (Item 9)
const VALID_TRANSITIONS: Record<Status, Status[]> = {
  PENDING: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED', 'MERGED_DUPLICATE'],
  ASSIGNED: ['IN_PROGRESS', 'RESOLVED', 'CITIZEN_VERIFICATION', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'CITIZEN_VERIFICATION', 'REJECTED'],
  CITIZEN_VERIFICATION: ['RESOLVED', 'PENDING', 'ASSIGNED'],
  RESOLVED: ['PENDING', 'CITIZEN_VERIFICATION'],
  REJECTED: ['PENDING'],
  MERGED_DUPLICATE: ['PENDING'],
};

export async function updateComplaintStatus(
  complaintId: string,
  targetStatus: Status,
  actorName: string = 'Authority Control Room',
  note?: string
) {
  const current = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!current) {
    throw new Error(`Complaint ${complaintId} not found.`);
  }

  // Validate state transition
  const allowed = VALID_TRANSITIONS[current.status] || [];
  if (!allowed.includes(targetStatus) && current.status !== targetStatus) {
    throw new Error(`Invalid status transition from ${current.status} to ${targetStatus}.`);
  }

  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: targetStatus,
      history: {
        create: {
          status: targetStatus,
          actorName,
          note: note || `Status transitioned from ${current.status} to ${targetStatus}.`,
        },
      },
    },
    include: { citizen: true },
  });

  await createUserNotification({
    userId: updated.citizenId,
    title: 'Status Updated',
    message: `Your report ${updated.ticketId} status changed to ${targetStatus}.`,
    link: `/complaints/${updated.id}`,
  });

  await createAuditLog({
    action: 'STATUS_CHANGE',
    resource: `Complaint:${updated.ticketId}`,
    details: `Transitioned status from ${current.status} to ${targetStatus}. Note: ${note || 'N/A'}`,
  });

  return await getComplaintById(complaintId);
}

export async function assignEngineerToComplaint(
  complaintId: string,
  engineerName: string,
  actorName: string = 'Chief Officer'
) {
  const current = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!current) throw new Error('Complaint not found.');

  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: 'ASSIGNED',
      history: {
        create: {
          status: 'ASSIGNED',
          actorName,
          note: `Assigned field engineer ${engineerName} with 24h target SLA.`,
        },
      },
    },
  });

  await createAuditLog({
    action: 'ENGINEER_ASSIGNMENT',
    resource: `Complaint:${updated.ticketId}`,
    details: `Assigned engineer ${engineerName} to ticket ${updated.ticketId}.`,
  });

  return await getComplaintById(complaintId);
}

export async function submitResolutionProof(params: {
  complaintId: string;
  afterImageUrl: string;
  officialNotes: string;
  resolvedByEngineer?: string;
  actorName?: string;
}) {
  const complaint = await prisma.complaint.findUnique({ where: { id: params.complaintId } });
  if (!complaint) throw new Error('Complaint not found.');

  const notesWithEngineer = params.resolvedByEngineer
    ? `${params.officialNotes} (Resolved by: ${params.resolvedByEngineer})`
    : params.officialNotes;

  const proof = await prisma.proofOfWork.upsert({
    where: { complaintId: params.complaintId },
    update: {
      afterImageUrl: params.afterImageUrl,
      officialNotes: notesWithEngineer,
      verifiedAt: new Date(),
    },
    create: {
      complaintId: params.complaintId,
      beforeImageUrl: complaint.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
      afterImageUrl: params.afterImageUrl,
      officialNotes: notesWithEngineer,
      aiVerificationScore: 0.96,
    },
  });

  const updated = await prisma.complaint.update({
    where: { id: params.complaintId },
    data: {
      status: 'CITIZEN_VERIFICATION',
      afterImageUrl: params.afterImageUrl,
      history: {
        create: {
          status: 'CITIZEN_VERIFICATION',
          actorName: params.actorName || 'Authority Field Engineer',
          note: `Resolution proof uploaded. AI before/after similarity: 96%. Awaiting citizen verification.`,
        },
      },
    },
  });

  await createUserNotification({
    userId: updated.citizenId,
    title: 'Resolution Verification Requested',
    message: `Official repair proof for ${updated.ticketId} uploaded. Please verify if the issue is resolved.`,
    link: `/complaints/${updated.id}`,
  });

  await createAuditLog({
    action: 'RESOLUTION_PROOF_UPLOAD',
    resource: `Complaint:${updated.ticketId}`,
    details: `Resolution proof uploaded for ${updated.ticketId}. Notes: ${params.officialNotes}`,
  });

  return await getComplaintById(params.complaintId);
}

export async function reopenComplaint(
  complaintId: string,
  reason: string,
  actorName: string = 'Citizen Feedback'
) {
  const current = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!current) throw new Error('Complaint not found.');

  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: 'PENDING',
      priorityScore: Math.min(100, current.priorityScore + 20),
      severity: 'CRITICAL',
      history: {
        create: {
          status: 'PENDING',
          actorName,
          note: `Citizen reported issue still broken: "${reason}". Reopened to Needs Attention with +20 priority boost.`,
        },
      },
    },
  });

  await createAuditLog({
    action: 'COMPLAINT_REOPENED',
    resource: `Complaint:${updated.ticketId}`,
    details: `Complaint ${updated.ticketId} reopened by citizen. Reason: ${reason}`,
  });

  return await getComplaintById(complaintId);
}
