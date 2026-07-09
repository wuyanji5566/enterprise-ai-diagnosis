import type {
  DiagnosisReport,
  QuestionnaireData,
  RecommendedServicePackage
} from "@/types/diagnosis";

export interface ServicePackageDefinition extends RecommendedServicePackage {
  id: string;
  clientFit: string;
  problem: string;
  cycle: string;
  price: string;
}

export const SERVICE_PACKAGES: ServicePackageDefinition[] = [
  {
    id: "diagnosis",
    name: "AI诊断与落地建议",
    clientFit: "还不清楚企业第一步该做什么AI应用的客户",
    problem: "需求方向多、优先级不清，缺少预算与实施边界判断。",
    deliverables: ["企业AI成熟度分析", "AI机会识别", "TOP3项目建议", "初步ROI测算", "一次人工解读沟通"],
    cycle: "1-3天",
    price: "免费体验 / 深度诊断 ¥999 起",
    referenceBudget: "免费体验 / 深度诊断 ¥999 起",
    requiresPrivateQuote: false,
    reason: "适合先把模糊需求结构化，再决定是否进入样品验证。",
    suggestedNextStep: "补充关键业务资料，预约一次诊断解读。"
  },
  {
    id: "marketing-growth",
    name: "AI营销增长样品包",
    clientFit: "产品型企业、传统工厂、品牌商、服务型企业",
    problem: "产品有价值但内容弱，获客渠道不稳定，缺少持续可复用的营销资产。",
    deliverables: ["产品卖点拆解", "AI产品图与详情页视觉", "15秒/30秒产品营销视频", "短视频脚本与分镜设计", "发布与渠道建议"],
    cycle: "7-21天",
    price: "¥999-¥9,999 起",
    referenceBudget: "¥999-¥9,999 起",
    requiresPrivateQuote: true,
    reason: "适合先用一组可展示、可转发的营销样品验证获客价值。",
    suggestedNextStep: "选择一个核心产品，完成一次营销资产样品验证。"
  },
  {
    id: "automation",
    name: "企业AI效率自动化包",
    clientFit: "有大量表格、文档、报表和内部流程处理的企业",
    problem: "重复人工多、资料分散、报表整理慢，流程高度依赖个人。",
    deliverables: ["业务流程诊断", "自动化流程设计", "Excel/文档/报表自动处理", "轻量工具Demo", "员工使用培训"],
    cycle: "14-30天",
    price: "¥3,000-¥30,000 起",
    referenceBudget: "¥5,000-¥30,000 起",
    requiresPrivateQuote: true,
    reason: "适合从高频重复任务切入，用节省工时快速验证ROI。",
    suggestedNextStep: "选出一个每周重复发生的流程，做7天自动化验证。"
  },
  {
    id: "coaching",
    name: "企业AI实战陪跑课",
    clientFit: "企业主、创始人、运营团队、销售团队",
    problem: "团队知道AI重要，但缺少真实业务场景、工具方法和持续执行机制。",
    deliverables: ["老板AI认知课", "员工AI工具课", "Codex/AI视频/AI图片/PPT实操", "企业真实项目陪跑", "课后复盘"],
    cycle: "2-4周",
    price: "¥3,000-¥20,000 起",
    referenceBudget: "¥3,000-¥20,000 起",
    requiresPrivateQuote: true,
    reason: "适合组织准备度不足、需要边做边学的团队。",
    suggestedNextStep: "选择一个真实业务任务，安排一次团队实战工作坊。"
  },
  {
    id: "mvp-system",
    name: "轻量业务系统MVP",
    clientFit: "计划建设ERP、CRM、小程序、报价或项目管理系统的企业",
    problem: "业务需求复杂，但尚未验证流程，不适合直接投入完整系统。",
    deliverables: ["业务流程梳理", "页面原型", "可演示MVP", "Mock数据验证", "后续开发报价方案"],
    cycle: "3-6周",
    price: "¥8,000-¥50,000 起",
    referenceBudget: "¥8,000-¥50,000 起",
    requiresPrivateQuote: true,
    reason: "适合先验证核心流程与使用意愿，再决定是否进入完整开发。",
    suggestedNextStep: "锁定一个关键流程，完成MVP范围和验收指标定义。"
  },
  {
    id: "knowledge-agent",
    name: "企业知识库 / 客服Agent",
    clientFit: "产品资料多、客服量大、销售问答重复的企业",
    problem: "资料有人写但没人整理，客户和销售重复询问相同问题。",
    deliverables: ["资料整理", "FAQ结构化", "企业知识库", "智能问答Demo", "客服/销售话术库"],
    cycle: "2-4周",
    price: "¥5,000-¥30,000 起",
    referenceBudget: "¥5,000-¥30,000 起",
    requiresPrivateQuote: true,
    reason: "适合把分散文档转化为团队可检索、客户可使用的知识资产。",
    suggestedNextStep: "整理首批50份高频资料，验证问答命中率和节省时间。"
  }
];

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function matchServicePackage(
  questionnaire: QuestionnaireData,
  report?: Partial<DiagnosisReport>
): RecommendedServicePackage {
  const searchable = JSON.stringify(questionnaire);
  const scores = new Map(SERVICE_PACKAGES.map((item) => [item.id, 0]));

  if (
    questionnaire.marketingCapability.channels.length > 0 ||
    questionnaire.marketingCapability.consistentPublishing === "否" ||
    includesAny(searchable, ["视频", "内容", "获客", "产品图", "营销", "抖音", "小红书"])
  ) {
    scores.set("marketing-growth", (scores.get("marketing-growth") ?? 0) + 4);
  }

  if (includesAny(searchable, ["表格", "报表", "重复", "整理", "人工", "自动化", "审批"])) {
    scores.set("automation", (scores.get("automation") ?? 0) + 5);
  }

  if (
    questionnaire.owners.it === "否" ||
    includesAny(searchable, ["培训", "不会", "陪跑", "团队", "员工"])
  ) {
    scores.set("coaching", (scores.get("coaching") ?? 0) + 3);
  }

  if (includesAny(searchable, ["ERP", "CRM", "小程序", "系统", "报价", "项目管理", "看板"])) {
    scores.set("mvp-system", (scores.get("mvp-system") ?? 0) + 6);
  }

  if (
    questionnaire.salesSystem.salesScript === "否" ||
    includesAny(searchable, ["知识库", "客服", "资料", "话术", "问答", "FAQ"])
  ) {
    scores.set("knowledge-agent", (scores.get("knowledge-agent") ?? 0) + 4);
  }

  if (questionnaire.aiPlan.mvpAccepted === "希望直接做完整项目") {
    scores.set("coaching", (scores.get("coaching") ?? 0) + 2);
  }

  if (
    questionnaire.aiPlan.budget === "1000以内" ||
    questionnaire.aiPlan.budget === "先看方案" ||
    questionnaire.decisionAuthority !== "是"
  ) {
    scores.set("diagnosis", (scores.get("diagnosis") ?? 0) + 3);
  }

  const matched =
    [...SERVICE_PACKAGES].sort(
      (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0)
    )[0] ?? SERVICE_PACKAGES[1];

  return {
    name: matched.name,
    reason:
      report?.recommendedServicePackage?.reason?.trim() ||
      `${matched.reason} 当前问卷与诊断信号表明，这个服务包最容易形成第一阶段可量化结果。`,
    deliverables: matched.deliverables,
    suggestedNextStep: matched.suggestedNextStep,
    referenceBudget: matched.referenceBudget,
    requiresPrivateQuote: matched.requiresPrivateQuote
  };
}
