import type { LeadRecord, LeadSubmission } from "@/types/lead";

export const MOCK_LEADS: LeadRecord[] = [
  {
    id: "mock-1",
    companyName: "华东精工材料",
    industry: "制造业",
    employees: 86,
    maturityScore: 61,
    clientFitLevel: "B类客户",
    budgetSignal: "中",
    urgency: "中",
    dataReadiness: "中",
    recommendedService: "AI营销增长样品包",
    recommendedNextStep: "样品验证",
    diagnosisType: "免费初筛",
    wechatAdded: "是",
    paid99: "否",
    referralSource: "内容引流",
    referrer: "",
    collectionNextAction: "推荐样品验证",
    submittedAt: "2026-06-22T09:30:00.000Z",
    status: "已沟通",
    note: "希望先做一条产品营销视频。",
    source: "示例数据"
  },
  {
    id: "mock-2",
    companyName: "启航企业服务",
    industry: "企业服务",
    employees: 42,
    maturityScore: 73,
    clientFitLevel: "A类客户",
    budgetSignal: "高",
    urgency: "高",
    dataReadiness: "强",
    recommendedService: "企业AI效率自动化包",
    recommendedNextStep: "正式报价",
    diagnosisType: "99元深度诊断",
    wechatAdded: "是",
    paid99: "是",
    referralSource: "朋友推荐",
    referrer: "华东精工材料",
    collectionNextAction: "人工解读",
    submittedAt: "2026-06-23T03:20:00.000Z",
    status: "新线索",
    note: "报表整理和客户归档耗时较高。",
    source: "示例数据"
  }
];

export function createLeadRecord(submission: LeadSubmission): LeadRecord {
  return {
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    companyName: submission.companyName,
    industry: submission.industry,
    employees: submission.employees,
    maturityScore: submission.maturityScore,
    clientFitLevel: submission.clientFitLevel ?? "C类客户",
    budgetSignal: submission.budgetSignal ?? "未知",
    urgency: submission.urgency ?? "中",
    dataReadiness: submission.dataReadiness ?? "弱",
    recommendedService: submission.recommendedService,
    recommendedNextStep: submission.recommendedNextStep ?? "免费沟通",
    diagnosisType: submission.diagnosisType ?? "免费初筛",
    wechatAdded: submission.wechatAdded ?? "未知",
    paid99: submission.paid99 ?? "未知",
    referralSource: submission.referralSource ?? "自然访问",
    referrer: submission.referrer ?? "",
    collectionNextAction: submission.collectionNextAction ?? "发诊断链接",
    submittedAt: new Date().toISOString(),
    status: "新线索",
    note: submission.note ?? "",
    contactName: submission.contactName,
    contactMethod: submission.contactMethod,
    source: submission.source ?? "AI诊断"
  };
}
