import { NextResponse } from "next/server";
import { z } from "zod";
import { DIAGNOSIS_SYSTEM_PROMPT } from "@/lib/ai-prompt";
import { diagnosisJsonSchema } from "@/lib/diagnosis-schema";
import { buildReportMarkdown } from "@/lib/report-template";
import { matchServicePackage } from "@/lib/service-matcher";
import { createLeadRecord, saveLead } from "@/lib/lead-storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { saveLockedReport } from "@/lib/report-storage";
import { DatabaseConfigError } from "@/lib/db";
import { getUserSession } from "@/lib/user-auth";
import type { DiagnosisReport } from "@/types/diagnosis";
import type { LeadSubmission } from "@/types/lead";

export const runtime = "nodejs";
export const maxDuration = 60;

const yesNo = z.enum(["是", "否"]);
const decisionAuthority = z.enum(["是", "否", "需要向上汇报"]);
const mvpPreference = z.enum(["接受", "不确定", "希望直接做完整项目"]);

const questionnaireFieldLabels: Record<string, string> = {
  companyName: "企业名称",
  industry: "所属行业",
  employees: "员工人数",
  revenue: "年营业收入",
  mainOffering: "主营产品 / 服务",
  respondentRole: "填写人角色",
  decisionAuthority: "是否有决策权",
  "workflow.acquisition": "当前主要获客方式",
  "workflow.sales": "销售转化流程",
  "workflow.delivery": "交付服务流程",
  "workflow.management": "内部管理流程",
  "workflow.manualDependency": "当前最依赖人工的环节",
  "workflow.biggestBottleneck": "最容易拖慢业务的环节",
  "salesSystem.biggestProblem": "当前销售环节最大问题",
  "marketingCapability.channels": "当前使用的营销渠道",
  "marketingCapability.upgradeGoal": "最想提升的营销能力",
  "costStructure.mostLaborIntensive": "最耗费人工的工作",
  "costStructure.mostRepetitive": "重复频率最高的工作",
  "costStructure.errorProne": "最容易出错的工作",
  "costStructure.salesBottleneck": "最影响销售成交的工作",
  "costStructure.costToReduce": "最希望降低的成本",
  "costStructure.weeklyRecurring": "每周重复发生的工作",
  "aiPlan.primaryProblem": "最想用AI解决的问题",
  "aiPlan.timeToResult": "希望多久看到第一个结果",
  "aiPlan.budget": "第一阶段预算区间",
  "aiPlan.mvpAccepted": "是否接受先做MVP样品验证",
  "aiPlan.biggestConcern": "对AI最大的担心",
  "aiPlan.dataConsent": "诊断服务授权",
  "stepNotes.basic": "企业基本情况补充",
  "stepNotes.workflow": "业务流程补充",
  "stepNotes.sales": "销售系统补充",
  "stepNotes.marketing": "营销能力补充",
  "stepNotes.cost": "成本重复工作补充",
  "stepNotes.aiPlan": "AI目标预算补充"
};

const optionalNote = z.string().trim().max(500).default("");

const questionnaireSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  industry: z.string().trim().min(1).max(80),
  employees: z.number().int().positive().max(1000000),
  revenue: z.string().trim().min(1).max(80),
  mainOffering: z.string().trim().min(8).max(1000),
  respondentRole: z.string().trim().min(1).max(80),
  decisionAuthority,
  owners: z.object({
    marketing: yesNo,
    operations: yesNo,
    it: yesNo
  }),
  workflow: z.object({
    acquisition: z.string().trim().min(10).max(2000),
    sales: z.string().trim().min(10).max(2000),
    delivery: z.string().trim().min(10).max(2000),
    management: z.string().trim().min(10).max(2000),
    manualDependency: z.string().trim().min(8).max(2000),
    biggestBottleneck: z.string().trim().min(8).max(2000)
  }),
  salesSystem: z.object({
    customerList: yesNo,
    salesScript: yesNo,
    quoteTemplate: yesNo,
    followUpMechanism: yesNo,
    historicalRecords: yesNo,
    biggestProblem: z.string().trim().min(10).max(2000)
  }),
  marketingCapability: z.object({
    channels: z.array(z.string().trim().min(1).max(100)).min(1).max(12),
    productAssets: yesNo,
    consistentPublishing: yesNo,
    sellingPoints: yesNo,
    contentLibrary: yesNo,
    upgradeGoal: z.string().trim().min(10).max(2000)
  }),
  costStructure: z.object({
    mostLaborIntensive: z.string().trim().min(5).max(1000),
    mostRepetitive: z.string().trim().min(5).max(1000),
    errorProne: z.string().trim().min(5).max(1000),
    salesBottleneck: z.string().trim().min(5).max(1000),
    costToReduce: z.string().trim().min(5).max(1000),
    weeklyRecurring: z.string().trim().min(5).max(1000)
  }),
  aiPlan: z.object({
    primaryProblem: z.string().trim().min(10).max(2000),
    timeToResult: z.string().trim().min(1).max(80),
    budget: z.string().trim().min(1).max(80),
    mvpAccepted: mvpPreference,
    biggestConcern: z.string().trim().min(5).max(1000),
    dataConsent: yesNo
  }),
  stepNotes: z.object({
    basic: optionalNote,
    workflow: optionalNote,
    sales: optionalNote,
    marketing: optionalNote,
    cost: optionalNote,
    aiPlan: optionalNote
  }).default({
    basic: "",
    workflow: "",
    sales: "",
    marketing: "",
    cost: "",
    aiPlan: ""
  })
});

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const chatContent = response.choices?.[0]?.message?.content?.trim();
  if (chatContent) return chatContent;
  if (response.output_text) return response.output_text;
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return null;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    if (fenced) return JSON.parse(fenced) as Record<string, unknown>;
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("AI返回内容不是可解析的JSON。");
  }
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function selectReportPayload(value: unknown): Record<string, unknown> {
  const root = asObject(value);
  if (!root) throw new Error("AI report payload is not an object.");
  const candidates = [
    root,
    asObject(root.report),
    asObject(root.diagnosisReport),
    asObject(root.data),
    asObject(root.result)
  ].filter(Boolean) as Record<string, unknown>[];
  return (
    candidates.find(
      (candidate) =>
        "maturityScore" in candidate &&
        "businessConclusion" in candidate &&
        "topProjects" in candidate
    ) ?? root
  );
}

function validateReportPayload(report: Record<string, unknown>) {
  const requiredFields = [
    "maturityScore",
    "maturityLevel",
    "executiveSummary",
    "businessConclusion",
    "clientFitLevel",
    "clientFitReason",
    "workflowAnalysis",
    "opportunityMatrix",
    "implementationRoadmap",
    "topProjects",
    "roiAnalysis",
    "recommendedServicePackage",
    "preQuoteRequiredMaterials",
    "salesInsight"
  ];
  const missing = requiredFields.filter((field) => report[field] == null);
  if (missing.length > 0) throw new Error(`AI report missing fields: ${missing.join(", ")}`);
  if (typeof report.maturityScore !== "number") throw new Error("AI report maturityScore must be a number.");
  if (!Array.isArray(report.topProjects) || report.topProjects.length < 3) {
    throw new Error("AI report topProjects must include at least 3 items.");
  }
  if (typeof report.executiveSummary !== "string" || report.executiveSummary.trim().length < 80) {
    throw new Error("AI report executiveSummary is missing or too short.");
  }
  if (
    !(report.topProjects as Array<Record<string, unknown>>).every(
      (project) =>
        typeof project.suggestedOwner === "string" &&
        Array.isArray(project.acceptanceMetrics) &&
        project.acceptanceMetrics.length >= 2
    )
  ) {
    throw new Error("AI report topProjects must include owners and acceptance metrics.");
  }
  if (!Array.isArray(report.opportunityMatrix) || report.opportunityMatrix.length < 3) {
    throw new Error("AI report opportunityMatrix must include at least 3 items.");
  }
}

function normalizeFitLevel(value: string): LeadSubmission["clientFitLevel"] {
  return ["A类客户", "B类客户", "C类客户", "D类客户"].includes(value)
    ? (value as LeadSubmission["clientFitLevel"])
    : "C类客户";
}

function normalizeSignal(value: string): LeadSubmission["budgetSignal"] {
  return ["低", "中", "高"].includes(value) ? (value as LeadSubmission["budgetSignal"]) : "未知";
}

function normalizeUrgency(value: string): LeadSubmission["urgency"] {
  return ["低", "中", "高"].includes(value) ? (value as LeadSubmission["urgency"]) : "中";
}

function normalizeDataReadiness(value: string): LeadSubmission["dataReadiness"] {
  return ["弱", "中", "强"].includes(value) ? (value as LeadSubmission["dataReadiness"]) : "弱";
}

function normalizeNextAction(value: string): LeadSubmission["recommendedNextStep"] {
  return ["免费沟通", "深度诊断", "样品验证", "正式报价", "暂不跟进"].includes(value)
    ? (value as LeadSubmission["recommendedNextStep"])
    : "免费沟通";
}

export async function POST(request: Request) {
  try {
    let rateLimit: { allowed: boolean; retryAfter: number };
    try {
      rateLimit = await checkRateLimit(request, "diagnose", 5, 60 * 60);
    } catch (error) {
      console.error("Diagnosis rate limit error:", error);
      const message =
        error instanceof DatabaseConfigError
          ? "生产数据库尚未配置。请在 Render Environment Variables 中配置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN。"
          : "数据库连接失败，暂时无法生成报告。请检查 Render 的 TURSO_DATABASE_URL / TURSO_AUTH_TOKEN 配置。";
      return NextResponse.json({ error: message }, { status: 503 });
    }

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "生成次数过多，请稍后再试或联系管理员。" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "服务端尚未配置 DEEPSEEK_API_KEY，请先在 Render Environment 中添加。" },
        { status: 503 }
      );
    }

    const parsed = questionnaireSchema.safeParse(await request.json());
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue?.path.join(".") ?? "";
      const fieldLabel = questionnaireFieldLabels[fieldPath] ?? fieldPath;
      return NextResponse.json(
        {
          error: "问卷数据不完整，请返回对应模块补充后重试。",
          details: fieldLabel ? `请检查“${fieldLabel}”` : "请检查必填字段"
        },
        { status: 400 }
      );
    }

    const deepSeekBaseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    const deepSeekModel = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
    const deepSeekResponse = await fetch(`${deepSeekBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: deepSeekModel,
        messages: [
          { role: "system", content: DIAGNOSIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              "请诊断以下企业问卷，并只返回一个严格 JSON 对象。",
              "不要返回 Markdown 代码块，不要返回解释文字，不要把报告包在 report/data/result 字段里。",
              "JSON 顶层必须直接包含 schema.required 里的所有字段。",
              "每一份报告必须高度差异化：所有评分、TOP3项目、ROI、风险、样品验证建议、推荐服务包和销售跟进判断，都必须直接引用问卷里的行业、主营业务、获客方式、销售问题、交付流程、成本痛点、预算、周期和顾虑。",
              "如果企业问卷里的 stepNotes 有内容，这些是企业主补充的一手真实情况，必须优先引用并用于修正报告判断，不能忽略。",
              "reportMarkdown 必须是一份完整中文咨询报告，建议 1800-3000 字，包含：企业现状摘要、核心判断、成熟度评分解释、业务流程拆解、TOP3项目详细执行步骤、7/30/90天路线、ROI假设、暂不建议事项、推荐服务包、下一步成交建议。",
              "为了方便后期转化，businessConclusion 要写成可用于销售开场的一句话；clientFitReason 要说明为什么值得跟进或为什么暂缓；salesInsight.bestConversionPath 必须给出最适合销售转化的路径。",
              "salesInsight.nextAction 必须从 免费沟通、深度诊断、样品验证、正式报价、暂不跟进 中选择一个。",
              "clientFitLevel 只能是 A类客户、B类客户、C类客户、D类客户。",
              "salesInsight.urgency 和 salesInsight.budgetSignal 只能是 低、中、高；salesInsight.dataReadiness 只能是 弱、中、强。",
              "TOP3项目必须按成交优先级排序，每个项目都要包含低成本样品验证动作，预算和周期必须贴合客户填写的预算、时间要求和数据成熟度。",
              "如果客户需求不清、预算过低、资料基础弱或决策权不足，必须降低评分并明确建议先补资料或做样品验证，不要为了好看而给高分。",
              `JSON Schema: ${JSON.stringify(diagnosisJsonSchema)}`,
              `企业问卷: ${JSON.stringify(parsed.data, null, 2)}`
            ].join("\n\n")
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 8000,
        stream: false
      }),
      signal: AbortSignal.timeout(55000)
    });

    const payload = await deepSeekResponse.json();
    if (!deepSeekResponse.ok) {
      const message =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        payload.error &&
        typeof payload.error === "object" &&
        "message" in payload.error
          ? String(payload.error.message)
          : "DeepSeek API 调用失败。";
      console.error("DeepSeek API error:", message);
      return NextResponse.json(
        { error: "AI诊断服务暂时不可用，请稍后重试。" },
        { status: 502 }
      );
    }

    const outputText = extractOutputText(payload);
    if (!outputText) {
      return NextResponse.json(
        { error: "AI已响应，但没有返回可用报告，请重新生成。" },
        { status: 502 }
      );
    }

    let rawReport: Omit<DiagnosisReport, "companyName" | "generatedAt" | "reportType">;
    try {
      rawReport = selectReportPayload(extractJson(outputText)) as unknown as Omit<
        DiagnosisReport,
        "companyName" | "generatedAt" | "reportType"
      >;
      validateReportPayload(rawReport as unknown as Record<string, unknown>);
    } catch (error) {
      console.error("Diagnosis JSON parse error:", error);
      return NextResponse.json(
        {
          error: "AI报告格式解析失败，请重新生成。",
          details: "服务端未能从AI响应中提取结构化JSON。"
        },
        { status: 502 }
      );
    }

    const generatedAt = new Date().toISOString();
    const deterministicService = matchServicePackage(parsed.data, rawReport);
    const reportBase = {
      ...rawReport,
      companyName: parsed.data.companyName,
      generatedAt,
      reportType: "free" as const,
      recommendedServicePackage: deterministicService
    };

    const report: DiagnosisReport = {
      ...reportBase,
      reportMarkdown:
        rawReport.reportMarkdown?.trim() || buildReportMarkdown(reportBase)
    };

    let stored: Awaited<ReturnType<typeof saveLockedReport>>;
    try {
      const userSession = await getUserSession(request);
      stored = await saveLockedReport(report, userSession?.userId);
    } catch (error) {
      console.error("Diagnosis report persistence error:", error);
      const message =
        error instanceof DatabaseConfigError
          ? "生产数据库尚未配置。请在 Render Environment Variables 中配置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN。"
          : "报告已生成，但保存到数据库失败。请检查 Render 的 Turso 数据库配置后重试。";
      return NextResponse.json({ error: message }, { status: 503 });
    }

    const leadSubmission: LeadSubmission = {
      companyName: parsed.data.companyName,
      industry: parsed.data.industry,
      employees: parsed.data.employees,
      maturityScore: report.maturityScore,
      clientFitLevel: normalizeFitLevel(report.clientFitLevel),
      budgetSignal: normalizeSignal(report.salesInsight.budgetSignal),
      urgency: normalizeUrgency(report.salesInsight.urgency),
      dataReadiness: normalizeDataReadiness(report.salesInsight.dataReadiness),
      recommendedService: report.recommendedServicePackage.name,
      recommendedNextStep: normalizeNextAction(report.salesInsight.nextAction),
      diagnosisType: "免费初筛",
      paid99: "否",
      collectionNextAction: "发诊断链接",
      note: `报告编号：${stored.reportId}；待付费解锁；${report.salesInsight.bestConversionPath}`,
      source: "AI诊断"
    };

    try {
      await saveLead(createLeadRecord(leadSubmission));
    } catch (leadError) {
      console.error("Diagnosis lead persistence error:", leadError);
    }

    return NextResponse.json({
      reportId: stored.reportId,
      accessToken: stored.accessToken,
      preview: stored.preview,
      status: "locked"
    });
  } catch (error) {
    console.error("Diagnosis route error:", error);
    return NextResponse.json(
      { error: "生成诊断报告时发生异常，请稍后重试。" },
      { status: 500 }
    );
  }
}
