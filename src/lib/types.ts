export type UserRole = 'CITIZEN' | 'AUTHORITY' | 'ADMIN';

export type IssueCategory =
  | 'ROAD_DAMAGE'
  | 'GARBAGE_OVERFLOW'
  | 'WATER_LEAKAGE'
  | 'BROKEN_STREETLIGHT'
  | 'TRAFFIC_SIGNAL_FAILURE'
  | 'ILLEGAL_DUMPING'
  | 'ELECTRIC_POLE_DAMAGE'
  | 'DRAINAGE_PROBLEM'
  | 'WALL_DAMAGE'
  | 'CONSTRUCTION_WASTE'
  | 'ANIMAL_HAZARD'
  | 'OTHER_CIVIC_ISSUE';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Status =
  | 'PENDING'
  | 'MERGED_DUPLICATE'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'CITIZEN_VERIFICATION'
  | 'RESOLVED'
  | 'REJECTED';

export type TierBadge = 'BRONZE' | 'SILVER' | 'GOLD' | 'VERIFIED_REPORTER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  reputationScore: number;
  tier: TierBadge;
  departmentCode?: string;
  departmentName?: string;
  resolvedCount: number;
  reportedCount: number;
}

export interface DepartmentInfo {
  id: string;
  code: string;
  name: string;
  headOfficer: string;
  contactEmail: string;
  contactPhone: string;
  slaHours: number;
  activeTickets: number;
  resolvedTickets: number;
  avgResolutionDays: number;
}

export interface LocationInfo {
  address: string;
  ward: string;
  zone: string;
  latitude: number;
  longitude: number;
  nearHospital: boolean;
  nearSchool: boolean;
  trafficDensity: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface AIAnalysisResult {
  detectedCategory: IssueCategory;
  categoryLabel: string;
  severityScore: number; // 0-100
  riskLevel: SeverityLevel;
  confidenceScore: number; // 0-1
  impactAssessment: string;
  suggestedDepartmentCode: string;
  suggestedDepartmentName: string;
  suggestedAction: string;
  hinglishTranslation?: string;
  floodRiskPercent?: number;
}

export interface ProofOfWork {
  beforeImageUrl: string;
  afterImageUrl: string;
  officialNotes: string;
  aiVerificationScore: number;
  resolvedByEngineer: string;
  timestamp: string;
}

export interface ComplaintHistoryEntry {
  id: string;
  status: Status;
  actorName: string;
  note: string;
  timestamp: string;
}

export interface ComplaintItem {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: IssueCategory;
  categoryLabel: string;
  severity: SeverityLevel;
  status: Status;
  priorityScore: number; // 0 - 100
  confidenceScore: number;
  reportCount: number;
  isDuplicate: boolean;
  duplicateGroupId?: string;
  
  citizenId: string;
  citizenName: string;
  citizenAvatar: string;
  
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  
  departmentCode: string;
  departmentName: string;
  
  location: LocationInfo;
  
  imageUrl?: string;
  afterImageUrl?: string;
  audioUrl?: string;
  transcription?: string;
  
  aiAnalysis: AIAnalysisResult;
  proofOfWork?: ProofOfWork;
  
  upvotes: number;
  hasUpvoted?: boolean;
  commentsCount: number;
  
  history: ComplaintHistoryEntry[];
  
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  ticketId?: string;
  type: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'DUPLICATE_MERGE' | 'ACHIEVEMENT';
  read: boolean;
  createdAt: string;
}

export interface PredictiveRiskReport {
  ward: string;
  floodRiskPercent: number;
  garbageOverflowRiskPercent: number;
  roadDamageProbabilityPercent: number;
  recommendedAction: string;
  riskTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface SystemAuditLog {
  id: string;
  actor: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}
