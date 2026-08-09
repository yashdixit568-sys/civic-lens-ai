import { ComplaintItem } from '../types';
import { calculateAIPriorityScore } from './priority-engine';

/**
 * Computes Haversine distance in meters between two lat/lng coordinates.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedMasterComplaint?: ComplaintItem;
  distanceMeters?: number;
  confidenceScore: number;
}

/**
 * Evaluates whether a newly submitted complaint is a duplicate of existing active complaints
 * within a 150-meter radius under the same category.
 */
export function detectDuplicateComplaint(
  newLat: number,
  newLng: number,
  category: string,
  existingComplaints: ComplaintItem[]
): DuplicateCheckResult {
  const DUPLICATE_RADIUS_METERS = 180;

  for (const item of existingComplaints) {
    if (item.status === 'RESOLVED' || item.status === 'REJECTED') continue;
    if (item.category !== category) continue;

    const dist = calculateHaversineDistanceMeters(
      newLat,
      newLng,
      item.location.latitude,
      item.location.longitude
    );

    if (dist <= DUPLICATE_RADIUS_METERS) {
      // Calculate duplicate confidence based on proximity
      const confidenceScore = Math.max(0.7, 1 - dist / DUPLICATE_RADIUS_METERS);
      return {
        isDuplicate: true,
        matchedMasterComplaint: item,
        distanceMeters: Math.round(dist),
        confidenceScore: parseFloat(confidenceScore.toFixed(2)),
      };
    }
  }

  return {
    isDuplicate: false,
    confidenceScore: 0.95,
  };
}

/**
 * Merges a duplicate complaint into a master complaint:
 * Increments report count, recalculates priority score, and appends history entry.
 */
export function mergeDuplicateIntoMaster(
  master: ComplaintItem,
  reportingCitizenName: string
): ComplaintItem {
  const updatedReportCount = master.reportCount + 1;
  const updatedUpvotes = master.upvotes + 2; // Auto upvote on duplication

  const priorityBreakdown = calculateAIPriorityScore(
    master.aiAnalysis.severityScore,
    updatedReportCount,
    master.location,
    updatedUpvotes
  );

  return {
    ...master,
    reportCount: updatedReportCount,
    upvotes: updatedUpvotes,
    priorityScore: priorityBreakdown.finalScore,
    severity: priorityBreakdown.priorityLevel,
    confidenceScore: Math.min(0.99, master.confidenceScore + 0.02),
    history: [
      ...master.history,
      {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        status: master.status,
        actorName: 'AI Spatial Merge Engine',
        note: `Merged duplicate report from citizen ${reportingCitizenName}. Total report count escalated to ${updatedReportCount} citizens. Priority elevated to ${priorityBreakdown.finalScore}/100.`,
        timestamp: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}
