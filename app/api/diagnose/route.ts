import { NextResponse } from "next/server";
import { z } from "zod";
import { DIAGNOSIS_SYSTEM_PROMPT } from "@/lib/ai-prompt";
import { diagnosisJsonSchema } from "@/lib/diagnosis-schema";
import { buildReportMarkdown } from "@/lib/report-template";
import { matchServicePackage } from "@/lib/service-matcher";
import { createLeadRecord, saveLead } from "@/lib/lead-storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { saveLockedReport } from "@/lib/report-storage";
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
  "aiPlan.dataConsent": "诊断服务授权"
};

const questionnaireSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  industry: z.string().trim().min(1).max(80),
  employees: z.number().int().positive().max(1000000),
  revenue: z.string().trim().min(1).max(80),
  mainOffering: z.string().trim().min(5).max(1000),
  respondentRole: z.string().trim().min(1).max(80),
  decisionAuthority,
  owners: z.object({
    marketing: yesNo,
    operations: yesNo,
    it: yesNo
  }),
  workflow: z.object({
    acquisition: z.string().trim().min(5).max(2000),
    sales: z.string().trim().min(5).max(2000),
    delivery: z.string().trim().min(5).max(2000),
    management: z.string().trim().min(5).max(2000),
    manualDependency: z.string().trim().min(5).max(2000),
    biggestBottleneck: z.string().trim().min(5).max(2000)
  }),
  salesSystem: z.object({
    customerList: yesNo,
    salesScript: yesNo,
    quoteTemplate: yesNo,
    followUpMechanism: yesNo,
    historicalRecords: yesNo,
    biggestProblem: z.string().trim().min(5).max(2000)
  }),
  marketingCapability: z.object({
    channels: z.array(z.string().trim().min(1).max(100)).min(1).max(12),
    productAssets: yesNo,
    consistentPublishing: yesNo,
    sellingPoints: yesNo,
    contentLibrary: yesNo,
    upgradeGoal: z.string().trim().min(5).max(2000)
  }),
  costStructure: z.object({
    mostLaborIntensive: z.string().trim().min(3).max(1000),
    mostRepetitive: z.string().trim().min(3).max(1000),
    errorProne: z.string().trim().min(3).max(1000),
    salesBottleneck: z.string().trim().min(3).max(1000),
    costToReduce: z.string().trim().min(3).max(1000),
    weeklyRecurring: z.string().trim().min(3).max(1000)
  }),
  aiPlan: z.object({
    primaryProblem: z.string().trim().min(5).max(2000),
    timeToResult: z.string().trim().min(1).max(80),
    budget: z.string().trim().min(1).max(80),
    mvpAccepted: mvpPreference,
    biggestConcern: z.string().trim().min(3).max(1000),
    dataConsent: yesNo
  })
});

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
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

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(request, "diagnose", 5, 60 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "生成次数过多，请稍后再试或联系管理员。" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) }
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "服务端尚未配置 OPENAI_API_KEY，请先在 .env.local 或 Vercel 中添加。" },
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

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        input: [
          { role: "system", content: DIAGNOSIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: `请诊断以下企业问卷：\n${JSON.stringify(parsed.data, null, 2)}`
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "enterprise_ai_factory_diagnosis",
            strict: true,
            schema: diagnosisJsonSchema
          }
        },
        max_output_tokens: 8000
      }),
      signal: AbortSignal.timeout(55000)
    });

    const payload = await openAIResponse.json();
    if (!openAIResponse.ok) {
      const message =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        payload.error &&
        typeof payload.error === "object" &&
        "message" in payload.error
          ? String(payload.error.message)
          : "OpenAI API 调用失败。";
      console.error("OpenAI API error:", message);
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

    let rawReport: Omit<
      DiagnosisReport,
      "companyName" | "generatedAt" | "reportType"
    >;
    try {
      rawReport = extractJson(outputText) as unknown as Omit<
        DiagnosisReport,
        "companyName" | "generatedAt" | "reportType"
      >;
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
        rawReport.reportMarkdown?.trim() ||
        buildReportMarkdown(reportBase)
    };

    const stored = await saveLockedReport(report);

    const leadSubmission: LeadSubmission = {
      companyName: parsed.data.companyName,
      industry: parsed.data.industry,
      employees: parsed.data.employees,
      maturityScore: report.maturityScore,
      clientFitLevel: ["A类客户", "B类客户", "C类客户", "D类客户"].includes(
        report.clientFitLevel
      )
        ? (report.clientFitLevel as LeadSubmission["clientFitLevel"])
        : "C类客户",
      budgetSignal: ["低", "中", "高"].includes(report.salesInsight.budgetSignal)
        ? (report.salesInsight.budgetSignal as LeadSubmission["budgetSignal"])
        : "未知",
      urgency: ["低", "中", "高"].includes(report.salesInsight.urgency)
        ? (report.salesInsight.urgency as LeadSubmission["urgency"])
        : "中",
      dataReadiness: ["弱", "中", "强"].includes(report.salesInsight.dataReadiness)
        ? (report.salesInsight.dataReadiness as LeadSubmission["dataReadiness"])
        : "弱",
      recommendedService: report.recommendedServicePackage.name,
      recommendedNextStep: [
        "免费沟通",
        "深度诊断",
        "样品验证",
        "正式报价",
        "暂不跟进"
      ].includes(report.salesInsight.nextAction)
        ? (report.salesInsight.nextAction as LeadSubmission["recommendedNextStep"])
        : "免费沟通",
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
