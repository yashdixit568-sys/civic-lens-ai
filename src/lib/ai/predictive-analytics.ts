import { PredictiveRiskReport } from '../types';

export const WARD_LIST = [
  'Ward 1 (Central Commercial)',
  'Ward 2 (Civil Lines)',
  'Ward 3 (Industrial Zone)',
  'Ward 4 (Green Park)',
  'Ward 5 (Station Junction)',
  'Ward 6 (Metro Corridor)',
  'Ward 7 (Lakeview Colony)',
  'Ward 8 (Old City Market)',
  'Ward 9 (University Tech Hub)',
  'Ward 10 (Riverbank East)',
];

/**
 * Generates Predictive AI Civic Risk Assessment for municipal wards.
 */
export function getPredictiveWardRiskReports(): PredictiveRiskReport[] {
  return [
    {
      ward: 'Ward 8 (Old City Market)',
      floodRiskPercent: 88,
      garbageOverflowRiskPercent: 92,
      roadDamageProbabilityPercent: 74,
      recommendedAction: 'Increase drain desilting frequency to twice weekly; deploy 3 extra sanitation loaders ahead of monsoon spell.',
      riskTrend: 'INCREASING',
    },
    {
      ward: 'Ward 5 (Station Junction)',
      floodRiskPercent: 76,
      garbageOverflowRiskPercent: 85,
      roadDamageProbabilityPercent: 82,
      recommendedAction: 'Perform preventive pothole cold-mix capping on station flyover approach road before heavy transit hours.',
      riskTrend: 'INCREASING',
    },
    {
      ward: 'Ward 3 (Industrial Zone)',
      floodRiskPercent: 62,
      garbageOverflowRiskPercent: 78,
      roadDamageProbabilityPercent: 89,
      recommendedAction: 'Inspect heavy vehicle axle weight compliance and repair damaged storm culvert near gate 4.',
      riskTrend: 'STABLE',
    },
    {
      ward: 'Ward 10 (Riverbank East)',
      floodRiskPercent: 94,
      garbageOverflowRiskPercent: 55,
      roadDamageProbabilityPercent: 65,
      recommendedAction: 'Activate high-capacity emergency diesel water pumps and inspect embankment retaining wall integrity.',
      riskTrend: 'INCREASING',
    },
    {
      ward: 'Ward 4 (Green Park)',
      floodRiskPercent: 25,
      garbageOverflowRiskPercent: 30,
      roadDamageProbabilityPercent: 20,
      recommendedAction: 'Standard routine municipal maintenance; maintain weekly green waste collection cycle.',
      riskTrend: 'DECREASING',
    },
  ];
}

/**
 * Generates automated LLM Insights summary for Executive Dashboards.
 */
export function getExecutiveAIInsightsSummary(): {
  highlightHeadline: string;
  keyObservation: string;
  recommendedIntervention: string;
  wardImpactStat: string;
} {
  return {
    highlightHeadline: 'Ward 8 has experienced a 37% surge in drainage complaints over the past 14 days.',
    keyObservation: 'Monsoon pre-shower runoff coupled with plastic debris blockages in Ward 8 stormwater drains has increased localized waterlogging complaints by 3.8x compared to seasonal baseline.',
    recommendedIntervention: 'Inter-departmental dispatch: Municipal Sanitation + Drainage Dept to conduct joint emergency desilting in Ward 8 and Ward 10 within 48 hours.',
    wardImpactStat: 'Preventative action in Ward 8 can reduce potential flood damage complaints by up to 64%.',
  };
}
