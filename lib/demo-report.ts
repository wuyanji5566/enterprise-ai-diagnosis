import { buildReportMarkdown } from "@/lib/report-template";
import type { DiagnosisReport } from "@/types/diagnosis";

const base: Omit<DiagnosisReport, "reportMarkdown"> = {
  reportType: "free",
  companyName: "星海智能科技有限公司",
  maturityScore: 72,
  maturityLevel: "规模化准备期",
  clientFitLevel: "A类客户",
  clientFitReason: "业务问题明确、具备决策权和试点预算，已有资料基础，适合进入样品验证与正式报价。",
  businessConclusion:
    "现在应以销售知识助手和交付自动化为双试点，在90天内用节省工时与转化率提升验证价值，再决定是否平台化扩张。",
  workflowAnalysis: {
    acquisition:
      "官网内容、行业活动和客户转介绍共同获客，但线索归集与优先级判断依赖人工。",
    conversion:
      "销售使用表格跟进客户，报价、需求分析和案例匹配依赖个人经验。",
    delivery:
      "已有基础交付模板，但会议纪要、周报、验收和复盘材料仍由人工整理。",
    management:
      "业务数据分散在多个表格和渠道后台，管理层通常在月底才能看到汇总结果。"
  },
  opportunityMatrix: [
    {
      area: "销售知识与跟进",
      repeatability: 88,
      standardization: 76,
      dataReadiness: 64,
      roiPotential: 86,
      totalScore: 79,
      explanation: "销售资料和高频问答已经存在，先整理知识与跟进流程即可快速验证。"
    },
    {
      area: "交付文档自动化",
      repeatability: 92,
      standardization: 82,
      dataReadiness: 72,
      roiPotential: 84,
      totalScore: 83,
      explanation: "周报、纪要和验收文档频率高、模板稳定，是首批自动化优先场景。"
    },
    {
      area: "营销内容生产",
      repeatability: 81,
      standardization: 69,
      dataReadiness: 58,
      roiPotential: 78,
      totalScore: 72,
      explanation: "已有产品资料，但品牌规范和渠道模板需要先补齐。"
    }
  ],
  implementationRoadmap: {
    sevenDays: ["整理销售高频资料", "建立会议纪要模板", "完成首批内容样品"],
    thirtyDays: ["上线销售知识助手", "运行交付文档自动化试点", "建立内容模板库"],
    ninetyDays: ["接入CRM跟进流程", "形成项目知识中台", "上线经营异常提醒"],
    notRecommended: ["完全替代销售人员", "无审核自动报价", "一次性重构全部业务系统"]
  },
  topProjects: [
    {
      name: "销售知识与跟进助手",
      category: "企业知识库 / 客服Agent",
      reason: "销售经验分散，优秀话术与案例无法复用，新人上手成本高。",
      steps: ["整理高频资料", "建立知识库", "配置引用与权限", "接入销售工作台"],
      expectedOutcome: "资料检索时间下降60%，新人上手周期缩短30%。",
      difficulty: "中",
      estimatedCycle: "3–4周",
      recommendedBudget: "3万–6万元",
      risk: "资料版本混乱会导致回答不一致，必须先建立内容负责人和更新机制。",
      sampleValidationSuggestion: "先用50份高频资料制作7天问答Demo，验证命中率与销售使用频率。"
    },
    {
      name: "交付文档自动化",
      category: "企业AI效率自动化",
      reason: "文档频率高、结构稳定，最容易直接测量节省工时。",
      steps: ["确定标准模板", "接入项目记录", "配置人工审核", "统计节省工时"],
      expectedOutcome: "交付文档工时下降50%，项目风险反馈提前3–5天。",
      difficulty: "低",
      estimatedCycle: "2–3周",
      recommendedBudget: "2万–4万元",
      risk: "原始项目记录不完整时，自动生成内容仍需项目经理复核。",
      sampleValidationSuggestion: "选择一份周报和一份验收文档，先跑通输入、生成、人工复核闭环。"
    },
    {
      name: "营销内容生产流水线",
      category: "AI营销增长",
      reason: "团队多平台重复改写内容，现有产品资料可以转化为持续内容资产。",
      steps: ["沉淀品牌规范", "建立选题库", "配置渠道模板", "上线审核发布"],
      expectedOutcome: "内容生产周期缩短65%，单月有效内容产量提升2倍。",
      difficulty: "中",
      estimatedCycle: "2–4周",
      recommendedBudget: "1.5万–3万元",
      risk: "没有统一品牌标准时，批量生成会放大表达不一致问题。",
      sampleValidationSuggestion: "以一个核心产品制作3条脚本、1套视觉和1条15秒成片。"
    }
  ],
  roiAnalysis: {
    costReduction: "年度运营成本预计下降 12%–18%",
    efficiencyGain: "核心岗位人效预计提升 25%–40%",
    paybackPeriod: "预计 3–6个月",
    roiSummary:
      "首期建议投入8万–15万元覆盖三个试点，以每周节省工时、文档通过率和销售跟进效率作为验收指标。",
    assumptions: [
      "按120人规模、15个销售及10个项目交付岗位测算",
      "AI项目先覆盖高频任务，并保留人工审核",
      "收益未包含新增订单带来的收入增量"
    ]
  },
  recommendedServicePackage: {
    name: "企业AI效率自动化包",
    reason:
      "企业当前重复人工和交付文档问题最明确，先做自动化试点最容易形成可量化ROI。",
    deliverables: [
      "业务流程诊断",
      "自动化流程设计",
      "文档与报表自动处理",
      "轻量工具Demo",
      "员工使用培训"
    ],
    suggestedNextStep: "选择一个每周重复发生的交付流程，进行7天自动化样品验证。",
    referenceBudget: "¥5,000–30,000 起",
    requiresPrivateQuote: true
  },
  preQuoteRequiredMaterials: [
    { materialName: "表格样本", reason: "确认字段、数据质量和真实处理量。" },
    { materialName: "处理规则", reason: "明确自动化判断逻辑与人工审核边界。" },
    { materialName: "输出格式", reason: "定义样品验收标准和后续交付接口。" },
    { materialName: "异常情况", reason: "识别流程风险并估算开发复杂度。" }
  ],
  salesInsight: {
    clientType: "成长型企业服务公司",
    urgency: "高",
    budgetSignal: "高",
    dataReadiness: "强",
    bestConversionPath: "先以交付文档自动化样品建立信任，再扩展销售知识助手。",
    nextAction: "样品验证"
  },
  generatedAt: "2026-06-24T03:00:00.000Z"
};

export const DEMO_REPORT: DiagnosisReport = {
  ...base,
  reportMarkdown: buildReportMarkdown(base)
};
