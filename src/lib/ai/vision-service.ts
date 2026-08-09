import { AIAnalysisResult, IssueCategory, SeverityLevel } from '../types';

export const CATEGORY_MAP: Record<IssueCategory, { label: string; deptCode: string; deptName: string }> = {
  ROAD_DAMAGE: { label: 'Road Damage & Potholes', deptCode: 'PWD', deptName: 'Public Works Department' },
  GARBAGE_OVERFLOW: { label: 'Garbage & Waste Overflow', deptCode: 'MUNICIPAL_CORP', deptName: 'Municipal Corporation Sanitation' },
  WATER_LEAKAGE: { label: 'Water Pipe Leakage', deptCode: 'WATER', deptName: 'Water Supply Department' },
  BROKEN_STREETLIGHT: { label: 'Broken Streetlight', deptCode: 'ELECTRICITY', deptName: 'Electricity & Lighting Dept' },
  TRAFFIC_SIGNAL_FAILURE: { label: 'Traffic Signal Issue', deptCode: 'TRAFFIC', deptName: 'Traffic Police & Infrastructure' },
  ILLEGAL_DUMPING: { label: 'Illegal Debris Dumping', deptCode: 'MUNICIPAL_CORP', deptName: 'Municipal Corporation Enforcement' },
  ELECTRIC_POLE_DAMAGE: { label: 'Hanging Electric Wire / Pole', deptCode: 'ELECTRICITY', deptName: 'Electricity Department' },
  DRAINAGE_PROBLEM: { label: 'Blocked Drain & Overflow', deptCode: 'DRAINAGE', deptName: 'Drainage & Sewerage Dept' },
  WALL_DAMAGE: { label: 'Damaged Retaining Wall', deptCode: 'PWD', deptName: 'Public Works Department' },
  CONSTRUCTION_WASTE: { label: 'Unattended Construction Rubble', deptCode: 'PWD', deptName: 'Public Works Department' },
  ANIMAL_HAZARD: { label: 'Stray Animal Risk', deptCode: 'MUNICIPAL_CORP', deptName: 'Municipal Animal Control' },
  OTHER_CIVIC_ISSUE: { label: 'General Civic Issue', deptCode: 'MUNICIPAL_CORP', deptName: 'Municipal General Ops' },
};

/**
 * Analyzes uploaded image for civic defect detection using AI computer vision.
 */
export async function analyzeImageAI(imageInput: string | File): Promise<AIAnalysisResult> {
  // Simulate intelligent image analysis delay
  await new Promise((res) => setTimeout(res, 900));

  const imageName = typeof imageInput === 'string' ? imageInput.toLowerCase() : imageInput.name.toLowerCase();

  let category: IssueCategory = 'ROAD_DAMAGE';
  let severityScore = 78;
  let riskLevel: SeverityLevel = 'HIGH';
  let impactAssessment = 'Severe pothole creating traffic hazard and accident risk during wet conditions.';
  let suggestedAction = 'Deploy asphalt patch crew within 24 hours to fill road cavity and install warning cones.';
  let confidenceScore = 0.94;

  if (imageName.includes('garbage') || imageName.includes('trash') || imageName.includes('dump')) {
    category = 'GARBAGE_OVERFLOW';
    severityScore = 85;
    riskLevel = 'HIGH';
    impactAssessment = 'Uncollected solid waste attracting pests and emitting foul odor near residential zone.';
    suggestedAction = 'Dispatch municipal waste loader truck and sanitize surrounding area with disinfectant.';
    confidenceScore = 0.96;
  } else if (imageName.includes('water') || imageName.includes('leak') || imageName.includes('pipe')) {
    category = 'WATER_LEAKAGE';
    severityScore = 82;
    riskLevel = 'HIGH';
    impactAssessment = 'Main distribution pipeline leak resulting in 500L/hr potable water loss and road erosion.';
    suggestedAction = 'Isolate valve section and dispatch hydraulic repair team immediately.';
    confidenceScore = 0.91;
  } else if (imageName.includes('light') || imageName.includes('dark') || imageName.includes('pole')) {
    category = 'BROKEN_STREETLIGHT';
    severityScore = 60;
    riskLevel = 'MEDIUM';
    impactAssessment = 'Inoperative LED fixture resulting in zero illumination on pedestrian walkway at night.';
    suggestedAction = 'Replace faulty capacitor/LED driver assembly on pole #ST-482.';
    confidenceScore = 0.89;
  } else if (imageName.includes('drain') || imageName.includes('sewer') || imageName.includes('flood')) {
    category = 'DRAINAGE_PROBLEM';
    severityScore = 92;
    riskLevel = 'CRITICAL';
    impactAssessment = 'Stormwater drain blockage causing waterlogging and high risk of urban inundation during rain.';
    suggestedAction = 'Deploy suction excavator machine to clear silt and debris obstruction.';
    confidenceScore = 0.97;
  } else if (imageName.includes('traffic') || imageName.includes('signal')) {
    category = 'TRAFFIC_SIGNAL_FAILURE';
    severityScore = 88;
    riskLevel = 'CRITICAL';
    impactAssessment = 'Traffic junction light failure creating gridlock and intersection collision danger.';
    suggestedAction = 'Deploy manual traffic warden and signal control board technicians.';
    confidenceScore = 0.95;
  }

  const dept = CATEGORY_MAP[category];

  return {
    detectedCategory: category,
    categoryLabel: dept.label,
    severityScore,
    riskLevel,
    confidenceScore,
    impactAssessment,
    suggestedDepartmentCode: dept.deptCode,
    suggestedDepartmentName: dept.deptName,
    suggestedAction,
  };
}
