import type { QuestionnaireData } from "@/types/diagnosis";

export const STORAGE_KEYS = {
  questionnaire: "ai-factory-questionnaire-v2",
  legacyQuestionnaire: "ai-diagnosis-questionnaire-v1",
  report: "ai-factory-report-v2",
  reportId: "ai-factory-report-id-v1",
  reportAccessToken: "ai-factory-report-access-token-v1",
  reportType: "ai-factory-report-type-v1",
  legacyReport: "ai-diagnosis-report-v1",
  paidUnlock: "ai-factory-paid-unlock-v1"
} as const;

export const EMPTY_QUESTIONNAIRE: QuestionnaireData = {
  companyName: "",
  industry: "",
  employees: 0,
  revenue: "",
  mainOffering: "",
  respondentRole: "",
  decisionAuthority: "需要向上汇报",
  owners: {
    marketing: "否",
    operations: "否",
    it: "否"
  },
  workflow: {
    acquisition: "",
    sales: "",
    delivery: "",
    management: "",
    manualDependency: "",
    biggestBottleneck: ""
  },
  salesSystem: {
    customerList: "否",
    salesScript: "否",
    quoteTemplate: "否",
    followUpMechanism: "否",
    historicalRecords: "否",
    biggestProblem: ""
  },
  marketingCapability: {
    channels: [],
    productAssets: "否",
    consistentPublishing: "否",
    sellingPoints: "否",
    contentLibrary: "否",
    upgradeGoal: ""
  },
  costStructure: {
    mostLaborIntensive: "",
    mostRepetitive: "",
    errorProne: "",
    salesBottleneck: "",
    costToReduce: "",
    weeklyRecurring: ""
  },
  aiPlan: {
    primaryProblem: "",
    timeToResult: "",
    budget: "",
    mvpAccepted: "接受",
    biggestConcern: "",
    dataConsent: "否"
  },
  stepNotes: {
    basic: "",
    workflow: "",
    sales: "",
    marketing: "",
    cost: "",
    aiPlan: ""
  }
};

export const INDUSTRIES = [
  "制造业",
  "企业服务",
  "零售与电商",
  "教育培训",
  "医疗健康",
  "金融与保险",
  "房地产与建筑",
  "物流与供应链",
  "文化传媒",
  "其他"
];

export const REVENUE_OPTIONS = [
  "500万元以下",
  "500万-3000万元",
  "3000万-1亿元",
  "1亿-5亿元",
  "5亿元以上"
];

export const MARKETING_CHANNELS = [
  "抖音",
  "小红书",
  "视频号",
  "公众号",
  "官网/SEO",
  "行业展会",
  "销售转介绍",
  "暂未稳定运营"
];

export const RESULT_TIMELINES = ["7天", "30天", "90天", "不确定"];

export const BUDGET_OPTIONS = [
  "1000以内",
  "1000-3000",
  "3000-10000",
  "10000以上",
  "先看方案"
];

export const RESPONDENT_ROLES = [
  "老板/创始人",
  "高管",
  "运营负责人",
  "销售负责人",
  "员工",
  "其他"
];
