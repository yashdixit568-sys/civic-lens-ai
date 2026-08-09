import { prisma } from '@/lib/prisma';
import { IssueCategory, SeverityLevel, Status } from '@prisma/client';
import { calculateHaversineDistanceMeters } from '@/lib/ai/duplicate-detector';
import { calculateAIPriorityScore } from '@/lib/ai/priority-engine';
import { createAuditLog } from './audit-service';
import { createUserNotification } from './notification-service';

export interface GetComplaintsParams {
  status?: Status;
  category?: IssueCategory;
  departmentCode?: string;
  ward?: string;
  citizenId?: string;
  page?: number;
  limit?: number;
}

export async function getComplaints(params: GetComplaintsParams = {}) {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.category) where.category = params.category;
  if (params.citizenId) where.citizenId = params.citizenId;
  if (params.departmentCode) {
    where.department = { code: params.departmentCode };
  }
  if (params.ward) {
    where.location = { ward: { contains: params.ward, mode: 'insensitive' } };
  }

  const [items, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: {
        citizen: true,
        department: true,
        location: true,
        aiAnalysis: true,
        proofOfWork: true,
        history: { orderBy: { timestamp: 'asc' } },
        votes: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { priorityScore: 'desc' },
      skip,
      take: limit,
    }),
    prisma.complaint.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getComplaintById(idOrTicket: string) {
  return await prisma.complaint.findFirst({
    where: {
      OR: [{ id: idOrTicket }, { ticketId: idOrTicket }],
    },
    include: {
      citizen: true,
      department: true,
      location: true,
      aiAnalysis: true,
      proofOfWork: true,
      history: { orderBy: { timestamp: 'asc' } },
      votes: true,
      comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
    },
  });
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: IssueCategory;
  imageUrl?: string;
  audioUrl?: string;
  transcription?: string;
  citizenId?: string;
  location: {
    address: string;
    ward: string;
    zone?: string;
    latitude: number;
    longitude: number;
    nearHospital?: boolean;
    nearSchool?: boolean;
    trafficDensity?: 'LOW' | 'MODERATE' | 'HIGH';
  };
  aiAnalysis?: {
    detectedObject: string;
    visualSeverityScore: number;
    impactAssessment: string;
    riskLevel: SeverityLevel;
    suggestedDepartmentCode: string;
    suggestedDepartmentName: string;
    suggestedAction: string;
    hinglishParsedText?: string;
  };
}

export async function createComplaint(input: CreateComplaintInput) {
  // Ensure default citizen exists
  const citizenId = input.citizenId || 'usr-citizen-01';

  // Find or create department
  const deptCode = input.aiAnalysis?.suggestedDepartmentCode || 'PWD';
  let department = await prisma.department.findUnique({ where: { code: deptCode } });
  if (!department) {
    department = await prisma.department.findFirst({ where: { code: 'PWD' } });
    if (!department) {
      department = await prisma.department.create({
        data: {
          code: 'PWD',
          name: 'Public Works Department',
          description: 'Roads & Infrastructure',
          headOfficer: 'Er. Rajesh Varma',
          contactEmail: 'pwd@civiclens.gov.in',
          contactPhone: '+91 11 2345 6789',
        },
      });
    }
  }

  // Create Location record
  const location = await prisma.location.create({
    data: {
      address: input.location.address,
      ward: input.location.ward || 'Ward 2 (Civil Lines)',
      zone: input.location.zone || 'Central Zone',
      latitude: input.location.latitude,
      longitude: input.location.longitude,
      nearHospital: input.location.nearHospital || false,
      nearSchool: input.location.nearSchool || false,
      trafficDensity: input.location.trafficDensity || 'MODERATE',
    },
  });

  // Check spatial duplicates within 180 meters
  const activeComplaints = await prisma.complaint.findMany({
    where: {
      category: input.category,
      status: { notIn: ['RESOLVED', 'REJECTED'] },
    },
    include: { location: true },
  });

  let duplicateMaster: (typeof activeComplaints)[0] | null = null;
  for (const cmp of activeComplaints) {
    const dist = calculateHaversineDistanceMeters(
      input.location.latitude,
      input.location.longitude,
      cmp.location.latitude,
      cmp.location.longitude
    );
    if (dist <= 180) {
      duplicateMaster = cmp;
      break;
    }
  }

  // If spatial duplicate exists, merge into master
  if (duplicateMaster) {
    const updatedCount = duplicateMaster.reportCount + 1;
    const priorityBreakdown = calculateAIPriorityScore(
      duplicateMaster.priorityScore,
      updatedCount,
      {
        address: duplicateMaster.location.address,
        ward: duplicateMaster.location.ward,
        zone: duplicateMaster.location.zone,
        latitude: duplicateMaster.location.latitude,
        longitude: duplicateMaster.location.longitude,
        nearHospital: duplicateMaster.location.nearHospital,
        nearSchool: duplicateMaster.location.nearSchool,
        trafficDensity: duplicateMaster.location.trafficDensity as any,
      }
    );

    const merged = await prisma.complaint.update({
      where: { id: duplicateMaster.id },
      data: {
        reportCount: updatedCount,
        priorityScore: priorityBreakdown.finalScore,
        history: {
          create: {
            status: duplicateMaster.status,
            actorName: 'AI Spatial Merge Engine',
            note: `Spatial Duplicate Merged: New report at ${input.location.address}. Total report count escalated to ${updatedCount}.`,
          },
        },
      },
      include: {
        citizen: true,
        department: true,
        location: true,
        history: true,
      },
    });

    await createAuditLog({
      userId: citizenId,
      action: 'SPATIAL_DUPLICATE_MERGE',
      resource: `Complaint:${merged.ticketId}`,
      details: `Merged duplicate report into ${merged.ticketId}. Report count escalated to ${updatedCount}.`,
    });

    return merged;
  }

  // Otherwise, create new master Complaint
  const ticketId = `TICK-${department.code}-${Math.floor(1000 + Math.random() * 9000)}`;
  const priority = calculateAIPriorityScore(
    input.aiAnalysis?.visualSeverityScore || 75,
    1,
    {
      address: input.location.address,
      ward: input.location.ward,
      zone: input.location.zone || 'Central Zone',
      latitude: input.location.latitude,
      longitude: input.location.longitude,
      nearHospital: input.location.nearHospital || false,
      nearSchool: input.location.nearSchool || false,
      trafficDensity: input.location.trafficDensity || 'MODERATE',
    }
  );

  const newComplaint = await prisma.complaint.create({
    data: {
      ticketId,
      title: input.title,
      description: input.description,
      category: input.category,
      severity: input.aiAnalysis?.riskLevel || 'MEDIUM',
      status: 'PENDING',
      priorityScore: priority.finalScore,
      confidenceScore: 0.94,
      imageUrl: input.imageUrl,
      audioUrl: input.audioUrl,
      transcription: input.transcription,
      citizenId,
      departmentId: department.id,
      locationId: location.id,
      aiAnalysis: input.aiAnalysis
        ? {
            create: {
              detectedObject: input.aiAnalysis.detectedObject,
              visualSeverityScore: input.aiAnalysis.visualSeverityScore,
              impactAssessment: input.aiAnalysis.impactAssessment,
              riskLevel: input.aiAnalysis.riskLevel,
              suggestedAction: input.aiAnalysis.suggestedAction,
              hinglishParsedText: input.aiAnalysis.hinglishParsedText,
            },
          }
        : undefined,
      history: {
        create: {
          status: 'PENDING',
          actorName: 'Citizen Reporter',
          note: `New complaint ${ticketId} created and routed to ${department.name}. Priority score: ${priority.finalScore}/100.`,
        },
      },
    },
    include: {
      citizen: true,
      department: true,
      location: true,
      aiAnalysis: true,
      history: true,
    },
  });

  await createUserNotification({
    userId: citizenId,
    title: 'Report Received',
    message: `Your complaint ${newComplaint.ticketId} has been registered and routed to ${department.name}.`,
    link: `/complaints/${newComplaint.id}`,
  });

  await createAuditLog({
    userId: citizenId,
    action: 'CREATE_COMPLAINT',
    resource: `Complaint:${newComplaint.ticketId}`,
    details: `Created new complaint ${newComplaint.ticketId} in ward ${location.ward}.`,
  });

  return newComplaint;
}

export async function voteComplaint(complaintId: string, userId: string = 'usr-citizen-01') {
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_complaintId: { userId, complaintId },
    },
  });

  if (existingVote) {
    return await getComplaintById(complaintId);
  }

  await prisma.vote.create({
    data: {
      userId,
      complaintId,
      type: 'UPVOTE',
    },
  });

  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { location: true },
  });

  if (complaint) {
    const newUpvotes = (complaint as any).upvotes ? (complaint as any).upvotes + 1 : 1;
    const priority = calculateAIPriorityScore(
      complaint.priorityScore,
      complaint.reportCount,
      {
        address: complaint.location.address,
        ward: complaint.location.ward,
        zone: complaint.location.zone,
        latitude: complaint.location.latitude,
        longitude: complaint.location.longitude,
        nearHospital: complaint.location.nearHospital,
        nearSchool: complaint.location.nearSchool,
        trafficDensity: complaint.location.trafficDensity as any,
      },
      newUpvotes
    );

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        priorityScore: priority.finalScore,
      },
    });
  }

  return await getComplaintById(complaintId);
}

export async function addComment(complaintId: string, content: string, userId: string = 'usr-citizen-01') {
  if (!content.trim() || content.length > 1000) {
    throw new Error('Comment content must be between 1 and 1000 characters.');
  }

  await prisma.comment.create({
    data: {
      userId,
      complaintId,
      content,
    },
  });

  return await getComplaintById(complaintId);
}
