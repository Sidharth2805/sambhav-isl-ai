export type InteractionState = 
  | 'IDLE'
  | 'HOVER'
  | 'FOCUSED'
  | 'SELECTED'
  | 'CORRECT'
  | 'INCORRECT'
  | 'EXHAUSTED'
  | 'DISABLED'
  | 'COMPLETED';

export type CareerEventType = 
  | 'TASK_STARTED'
  | 'OBJECT_INSPECTED'
  | 'TOOL_SELECTED'
  | 'ACTION_CORRECT'
  | 'ACTION_INCORRECT'
  | 'CLICKS_EXHAUSTED'
  | 'TASK_RETRIED'
  | 'TASK_COMPLETED';

export type CareerAssessmentViewMode = 
  | 'LANDING'
  | 'DOMAIN_SELECT'
  | 'WORKING_ON_IT'
  | 'ASSESSMENT'
  | 'RESULTS'
  | 'ROADMAP_VIEW';

export type EngineeringTradeId = 
  | 'electrical' 
  | 'mechanical' 
  | 'civil' 
  | 'software' 
  | 'metallurgy';

export interface CareerDomain {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  icon: string;
  isAvailable: boolean;
  badgeText: string;
  totalSubdisciplines?: number;
  highlightSkills: string[];
}

export interface EngineeringTopic {
  id: EngineeringTradeId;
  name: string;
  title: string;
  tradeNumber: number;
  description: string;
  environmentImage: string;
  icon: string;
  accentColor: string;
  questionsCount: number;
}

export interface CareerEvent {
  sessionId: string;
  taskId: string;
  timestamp: number;
  eventType: CareerEventType;
  objectId?: string;
  payload?: Record<string, unknown>;
}

export interface TaskEvidence {
  studentId: string;
  sessionId: string;
  taskId: string;
  phase: string;
  attempts: number;
  clicksUsed?: number;
  maxClicksAllowed?: number;
  correctActions: number;
  incorrectActions: number;
  hintsUsed: number;
  guidanceCount: number;
  errorsCorrected: number;
  startTime: number;
  completionTime?: number;
  independentCompletion: boolean;
  inspectedToolsCount?: number;
}

export interface ScoreBreakdown {
  accuracyScore: number;       // max 50 pts
  speedScore: number;          // max 25 pts
  analyticalScore: number;     // max 15 pts
  resilienceScore: number;     // max 10 pts
  totalMarks: number;          // max 100 pts
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  gradeTitle: string;
  speedRating: 'Lightning Fast' | 'Optimal Pace' | 'Methodical & Steady' | 'Thorough Analysis' | 'Extended Session';
  speedEfficiencyIndex: number; // 0 - 100
}

export interface SkillProfile {
  diagnosticReasoning: number;   // 0 - 100
  speedEfficiency: number;       // 0 - 100
  safetyProtocol: number;        // 0 - 100
  toolLiteracy: number;          // 0 - 100
  problemResilience: number;     // 0 - 100
}

export interface CareerMatch {
  id: string;
  title: string;
  matchPercentage: number;
  demandLevel: 'High' | 'Very High' | 'Growing';
  description: string;
  rationale: string;
  skillsGained: string[];
}

export interface SalaryTier {
  level: 'Entry / Average' | 'Proficient / Experienced' | 'Pro / Senior Specialist';
  rangeLPA: string;
  experienceYears: string;
  typicalJobRole: string;
  keyCompetenciesExpected: string[];
}

export interface JobRoadmapPhase {
  phaseNumber: number;
  phaseName: string;
  timeline: string;
  coreMilestones: string[];
  recommendedMajorsAndSubjects: string[];
  certificationsAndProjects: string[];
}

export interface JobPathwayDetailed {
  id: string;
  title: string;
  topicId: EngineeringTradeId;
  topicName: string;
  category: string;
  matchPercentage: number;
  demandLevel: 'High' | 'Very High' | 'Growing';
  overview: string;
  rationale: string;
  recommendedMajors: string[];
  coreSubjectsToMaster: string[];
  salaryTiers: SalaryTier[];
  roadmapPhases: JobRoadmapPhase[];
  deafAccessibilityAdvantages: string[];
  imageAssetKey?: string;
}

export interface EngineeringTopicScore {
  topicId: EngineeringTradeId;
  topicName: string;
  marksObtained: number; // out of 100
  questionsAttempted: number;
  questionsSolved: number;
  avgDurationSec: number;
}

export interface QuestionResult {
  taskId: string;
  taskTitle: string;
  questionNumber: number;
  topicId?: EngineeringTradeId;
  attempts: number;
  clicksUsed: number;
  isCorrect: boolean;
  durationSec: number;
  inspectedToolsCount: number;
  marks: number;
}

export interface TaskScoreReport {
  reportId: string;
  sessionId: string;
  studentId: string;
  taskId: string;
  taskTitle: string;
  environmentName: string;
  timestamp: number;
  durationSec: number;
  attempts: number;
  clicksUsed?: number;
  inspectedToolsCount: number;
  scoreBreakdown: ScoreBreakdown;
  skillProfile: SkillProfile;
  careerMatches: CareerMatch[];
  strengths: string[];
  areasForGrowth: string[];
  recommendations: string[];
  questionResults?: QuestionResult[];
  topicScores?: EngineeringTopicScore[];
  totalQuestionsAttempted?: number;
  totalQuestionsCorrect?: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: 'diagnostic' | 'mechanical' | 'wirework' | 'safety';
  technicalRole: string;
  educationalDescription: string;
  safetyNotes: string;
  isCorrect: boolean;
  feedbackMessage: string;
  spriteRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  standaloneAssetKey?: string;
}

export interface WorkspaceHotspot {
  id: string;
  toolId: string;
  label: string;
  ariaLabel: string;
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
  description: string;
}

export interface TaskDefinition {
  id: string;
  topicId?: EngineeringTradeId;
  topicName?: string;
  questionNumber?: number;
  topicQuestionIndex?: number; // 1 to 5
  title: string;
  environmentName: string;
  environmentImage?: string;
  mission: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  phase: string;
  availableTools: ToolDefinition[];
  workspaceHotspots: WorkspaceHotspot[];
  correctToolId: string;
  instructionalFeedbackOnSuccess: string;
  relatedPathways?: {
    id: string;
    title: string;
    description: string;
    imageAssetKey: string;
  }[];
}
