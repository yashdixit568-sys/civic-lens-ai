import { LocationInfo, SeverityLevel } from '../types';

export interface PriorityScoreBreakdown {
  finalScore: number; // 0 - 100
  baseSeverity: number;
  crowdReportMultiplier: number;
  hospitalBonus: number;
  schoolBonus: number;
  trafficBonus: number;
  weatherRiskBonus: number;
  communityVotesBonus: number;
  priorityLevel: SeverityLevel;
}

/**
 * Calculates dynamic multi-factor AI Priority Score (0-100) based on
 * severity, crowd reports, proximity to hospitals/schools, traffic density, weather risk, and citizen votes.
 */
export function calculateAIPriorityScore(
  baseSeverity: number,
  reportCount: number,
  location: LocationInfo,
  upvotes: number = 0,
  isEmergency: boolean = false
): PriorityScoreBreakdown {
  const crowdReportMultiplier = Math.min((reportCount - 1) * 3, 25);
  const hospitalBonus = location.nearHospital ? 15 : 0;
  const schoolBonus = location.nearSchool ? 10 : 0;
  const trafficBonus = location.trafficDensity === 'HIGH' ? 12 : location.trafficDensity === 'MODERATE' ? 5 : 0;
  const weatherRiskBonus = 10; // Active monsoon/rain season risk factor
  const communityVotesBonus = Math.min(Math.floor(upvotes * 1.5), 15);
  const emergencyBonus = isEmergency ? 25 : 0;

  const rawScore =
    baseSeverity * 0.45 +
    crowdReportMultiplier +
    hospitalBonus +
    schoolBonus +
    trafficBonus +
    weatherRiskBonus +
    communityVotesBonus +
    emergencyBonus;

  const finalScore = Math.min(Math.max(Math.round(rawScore), 10), 100);

  let priorityLevel: SeverityLevel = 'LOW';
  if (finalScore >= 85) priorityLevel = 'CRITICAL';
  else if (finalScore >= 70) priorityLevel = 'HIGH';
  else if (finalScore >= 45) priorityLevel = 'MEDIUM';

  return {
    finalScore,
    baseSeverity,
    crowdReportMultiplier,
    hospitalBonus,
    schoolBonus,
    trafficBonus,
    weatherRiskBonus,
    communityVotesBonus,
    priorityLevel,
  };
}
