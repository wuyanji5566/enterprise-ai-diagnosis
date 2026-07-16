export type YesNo = "是" | "否";
export type DecisionAuthority = "是" | "否" | "需要向上汇报";
export type MvpPreference = "接受" | "不确定" | "希望直接做完整项目";
export type ReportType = "free" | "paid99" | "manual999";

export interface QuestionnaireData {
  companyName: string;
  industry: string;
  employees: number;
  revenue: string;
  mainOffering: string;
  respondentRole: string;
  decisionAuthority: DecisionAuthority;
  owners: {
    marketing: YesNo;
    operations: YesNo;
    it: YesNo;
  };
  workflow: {
    acquisition: string;
    sales: string;
    delivery: string;
    management: string;
    manualDependency: string;
    biggestBottleneck: string;
  };
  salesSystem: {
    customerList: YesNo;
    salesScript: YesNo;
    quoteTemplate: YesNo;
    followUpMechanism: YesNo;
    historicalRecords: YesNo;
    biggestProblem: string;
  };
  marketingCapability: {
    channels: string[];
    productAssets: YesNo;
    consistentPublishing: YesNo;
    sellingPoints: YesNo;
    contentLibrary: YesNo;
    upgradeGoal: string;
  };
  costStructure: {
    mostLaborIntensive: string;
    mostRepetitive: string;
    errorProne: string;
    salesBottleneck: string;
    costToReduce: string;
    weeklyRecurring: string;
  };
  aiPlan: {
    primaryProblem: string;
    timeToResult: string;
    budget: string;
    mvpAccepted: MvpPreference;
    biggestConcern: string;
    dataConsent: YesNo;
  };
  stepNotes: {
    basic: string;
    workflow: string;
    sales: string;
    marketing: string;
    cost: string;
    aiPlan: string;
  };
}

export interface WorkflowAnalysis {
  acquisition: string;
  conversion: string;
  delivery: string;
  management: string;
}

export interface OpportunityMatrixItem {
  area: string;
  repeatability: number;
  standardization: number;
  dataReadiness: number;
  roiPotential: number;
  totalScore: number;
  explanation: string;
}

export interface ImplementationRoadmap {
  sevenDays: string[];
  thirtyDays: string[];
  ninetyDays: string[];
  notRecommended: string[];
}

export interface AIProject {
  name: string;
  category: string;
  reason: string;
  steps: string[];
  expectedOutcome: string;
  difficulty: string;
  estimatedCycle: string;
  recommendedBudget: string;
  risk: string;
  sampleValidationSuggestion: string;
  suggestedOwner?: string;
  acceptanceMetrics?: string[];
}

export interface ROIAnalysis {
  costReduction: string;
  efficiencyGain: string;
  paybackPeriod: string;
  roiSummary: string;
  assumptions: string[];
}

export interface RecommendedServicePackage {
  name: string;
  reason: string;
  deliverables: string[];
  suggestedNextStep: string;
  referenceBudget: string;
  requiresPrivateQuote: boolean;
}

export interface PreQuoteMaterial {
  materialName: string;
  reason: string;
}

export interface SalesInsight {
  clientType: string;
  urgency: string;
  budgetSignal: string;
  dataReadiness: string;
  bestConversionPath: string;
  nextAction: string;
}

export interface DiagnosisReport {
  reportType: ReportType;
  companyName: string;
  maturityScore: number;
  maturityLevel: string;
  executiveSummary?: string;
  businessConclusion: string;
  clientFitLevel: string;
  clientFitReason: string;
  workflowAnalysis: WorkflowAnalysis;
  opportunityMatrix: OpportunityMatrixItem[];
  implementationRoadmap: ImplementationRoadmap;
  topProjects: AIProject[];
  roiAnalysis: ROIAnalysis;
  recommendedServicePackage: RecommendedServicePackage;
  preQuoteRequiredMaterials: PreQuoteMaterial[];
  salesInsight: SalesInsight;
  reportMarkdown: string;
  generatedAt: string;
}

export interface DiagnosisReportPreview {
  companyName: string;
  maturityScore: number;
  maturityLevel: string;
  businessConclusion: string;
  generatedAt: string;
}

export interface DiagnoseResponse {
  /** @deprecated 新流程不会向浏览器返回完整报告。 */
  report?: DiagnosisReport;
  requestId?: string;
  reportId?: string;
  accessToken?: string;
  preview?: DiagnosisReportPreview;
  status?: "locked" | "unlocked";
  error?: string;
  details?: string;
}
