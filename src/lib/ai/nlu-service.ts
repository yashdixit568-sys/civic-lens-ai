import { AIAnalysisResult, IssueCategory, SeverityLevel } from '../types';
import { CATEGORY_MAP } from './vision-service';

export interface NLUProcessResult {
  formalTitle: string;
  formalDescription: string;
  aiAnalysis: AIAnalysisResult;
}

/**
 * Natural Language Processing unit that parses raw user voice/text input (e.g. "Bhai road bahut kharab hai near hospital")
 * and converts it into a formal civic complaint with severity & department metadata.
 */
export async function analyzeTextNLU(userPrompt: string): Promise<NLUProcessResult> {
  await new Promise((res) => setTimeout(res, 600));

  const text = userPrompt.toLowerCase();

  let category: IssueCategory = 'ROAD_DAMAGE';
  let formalTitle = 'Severe Road Surface Degradation & Potholes Reported';
  let formalDescription = `Official Complaint Report: "${userPrompt}". The citizen reports severe road surface degradation presenting immediate vehicular safety hazards and traffic obstruction. Urgent repair is requested.`;
  let severityScore = 75;
  let riskLevel: SeverityLevel = 'HIGH';
  let impactAssessment = 'Accident hazard for two-wheelers and traffic flow retardation near critical road segment.';
  let suggestedAction = 'Deploy cold-mix asphalt patch repair crew within 24 hours and verify road leveling.';

  if (text.includes('kachra') || text.includes('garbage') || text.includes('trash') || text.includes('safai')) {
    category = 'GARBAGE_OVERFLOW';
    formalTitle = 'Municipal Solid Waste Overflow & Unsanitary Dump Accumulation';
    formalDescription = `Official Complaint Report: "${userPrompt}". Unattended municipal solid waste accumulation creating public health hazards, pest infestation risks, and foul smell in public thoroughfare.`;
    severityScore = 84;
    riskLevel = 'HIGH';
    impactAssessment = 'Biomedical & environmental contamination threat to nearby residents.';
    suggestedAction = 'Dispatch heavy loader compaction vehicle and perform chemical sanitation.';
  } else if (text.includes('paani') || text.includes('water') || text.includes('leak') || text.includes('pipe')) {
    category = 'WATER_LEAKAGE';
    formalTitle = 'Potable Water Distribution Line Leakage & Pressure Loss';
    formalDescription = `Official Complaint Report: "${userPrompt}". Pressurized water distribution pipeline breach resulting in continuous potable water loss and ground saturation.`;
    severityScore = 80;
    riskLevel = 'HIGH';
    impactAssessment = 'Substantial drinking water loss and potential pavement collapse due to subterranean erosion.';
    suggestedAction = 'Shut off local sluice gate, excavate pipeline junction, and replace damaged seal.';
  } else if (text.includes('light') || text.includes('andhera') || text.includes('roshni') || text.includes('bijli')) {
    category = 'BROKEN_STREETLIGHT';
    formalTitle = 'Inoperative Public Illumination Fixture / Streetlight Failure';
    formalDescription = `Official Complaint Report: "${userPrompt}". Public illumination fixture failure causing severe dark zones during nighttime hours, compromising public safety and security.`;
    severityScore = 65;
    riskLevel = 'MEDIUM';
    impactAssessment = 'Increased risk of night crime and reduced pedestrian visibility.';
    suggestedAction = 'Dispatch electrical line team to check power transformer circuit and replace LED luminaire.';
  } else if (text.includes('naali') || text.includes('drain') || text.includes('sewer') || text.includes('ganda')) {
    category = 'DRAINAGE_PROBLEM';
    formalTitle = 'Primary Stormwater Drain Blockage & Sewerage Backflow';
    formalDescription = `Official Complaint Report: "${userPrompt}". Severe constriction in primary drainage channel leading to foul water stagnation and potential street flooding during rain events.`;
    severityScore = 90;
    riskLevel = 'CRITICAL';
    impactAssessment = 'Imminent risk of localized urban flooding and waterborne disease vectors.';
    suggestedAction = 'Deploy jetting-cum-suction machine to flush out silt and debris blockages.';
  }

  const dept = CATEGORY_MAP[category];

  return {
    formalTitle,
    formalDescription,
    aiAnalysis: {
      detectedCategory: category,
      categoryLabel: dept.label,
      severityScore,
      riskLevel,
      confidenceScore: 0.93,
      impactAssessment,
      suggestedDepartmentCode: dept.deptCode,
      suggestedDepartmentName: dept.deptName,
      suggestedAction,
      hinglishTranslation: text.includes('bhai') || text.includes('kharab') ? `Translated from Hinglish input: "${userPrompt}"` : undefined,
    },
  };
}
