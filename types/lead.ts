export type LeadStatus = "新线索" | "已沟通" | "已报价" | "已成交" | "暂不跟进";
export type ClientFitLevel = "A类客户" | "B类客户" | "C类客户" | "D类客户";
export type SignalLevel = "低" | "中" | "高" | "未知";
export type DataReadinessLevel = "弱" | "中" | "强";
export type RecommendedNextStep =
  | "免费沟通"
  | "深度诊断"
  | "样品验证"
  | "正式报价"
  | "暂不跟进";
export type TriState = "是" | "否" | "未知";
export type ReferralSource = "自然访问" | "朋友推荐" | "内容引流" | "手动录入";
export type CollectionNextAction =
  | "发诊断链接"
  | "生成PDF"
  | "人工解读"
  | "推荐样品验证"
  | "正式报价";
export type DiagnosisType = "免费初筛" | "99元深度诊断" | "999元人工诊断";

export interface LeadRecord {
  id: string;
  companyName: string;
  industry: string;
  employees: number;
  maturityScore: number;
  clientFitLevel: ClientFitLevel;
  budgetSignal: SignalLevel;
  urgency: Exclude<SignalLevel, "未知">;
  dataReadiness: DataReadinessLevel;
  recommendedService: string;
  recommendedNextStep: RecommendedNextStep;
  diagnosisType: DiagnosisType;
  wechatAdded: TriState;
  paid99: TriState;
  referralSource: ReferralSource;
  referrer: string;
  collectionNextAction: CollectionNextAction;
  submittedAt: string;
  status: LeadStatus;
  note: string;
  contactName?: string;
  contactMethod?: string;
  source: "AI诊断" | "预约沟通" | "示例数据";
}

export interface LeadSubmission {
  companyName: string;
  industry: string;
  employees: number;
  maturityScore: number;
  clientFitLevel?: ClientFitLevel;
  budgetSignal?: SignalLevel;
  urgency?: Exclude<SignalLevel, "未知">;
  dataReadiness?: DataReadinessLevel;
  recommendedService: string;
  recommendedNextStep?: RecommendedNextStep;
  diagnosisType?: DiagnosisType;
  wechatAdded?: TriState;
  paid99?: TriState;
  referralSource?: ReferralSource;
  referrer?: string;
  collectionNextAction?: CollectionNextAction;
  note?: string;
  contactName?: string;
  contactMethod?: string;
  source?: LeadRecord["source"];
}
