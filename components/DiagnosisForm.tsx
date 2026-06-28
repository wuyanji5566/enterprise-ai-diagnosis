"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  LockKey,
  Sparkle,
  SpinnerGap,
  WarningCircle
} from "@phosphor-icons/react";
import {
  BUDGET_OPTIONS,
  EMPTY_QUESTIONNAIRE,
  INDUSTRIES,
  MARKETING_CHANNELS,
  RESPONDENT_ROLES,
  RESULT_TIMELINES,
  REVENUE_OPTIONS,
  STORAGE_KEYS
} from "@/lib/constants";
import { reportTypeLabels, siteConfig } from "@/lib/site-config";
import { MultiSelect } from "@/components/multi-select";
import { QuickScreeningPanel } from "@/components/QuickScreeningPanel";
import { StepProgress } from "@/components/step-progress";
import type {
  DiagnoseResponse,
  DiagnosisReportPreview,
  QuestionnaireData,
  ReportType,
  YesNo
} from "@/types/diagnosis";

const STEPS = [
  "企业基础信息",
  "业务流程结构",
  "客户与销售体系",
  "内容与营销能力",
  "成本与问题结构",
  "AI目标与痛点"
];

const STEP_COPY = [
  ["企业基础信息", "建立企业规模、主营业务和组织准备度基线。"],
  ["业务流程结构", "拆解获客、转化、交付与管理流程，识别人工依赖。"],
  ["客户与销售体系", "判断销售资料、标准动作和客户跟进机制是否具备AI基础。"],
  ["内容与营销能力", "评估渠道、素材和内容生产能力，识别增长生产线机会。"],
  ["成本与问题结构", "定位最耗时、最重复、最易出错和最影响成交的工作。"],
  ["AI目标与痛点", "明确首个结果周期、预算信号、MVP接受度与主要顾虑。"]
];

type ValidationIssue = {
  step: number;
  message: string;
};

function requiredText(
  value: string,
  label: string,
  step: number,
  minimumLength: number
): ValidationIssue | null {
  const length = value.trim().length;
  if (length === 0) {
    return { step, message: `请填写“${label}”。` };
  }
  if (length < minimumLength) {
    return {
      step,
      message: `“${label}”至少需要填写${minimumLength}个字。`
    };
  }
  return null;
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
  rows = 4
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea
        className="field min-h-28 resize-y"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={2000}
      />
      <span className="mt-1.5 block text-right text-xs text-slate-400">
        {value.length} / 2000
      </span>
    </label>
  );
}

function YesNoField({
  label,
  value,
  onChange
}: {
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
}) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        {(["是", "否"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            className={`min-h-12 rounded-xl border px-4 text-sm font-bold transition ${
              value === option
                ? "border-brand bg-brand-soft text-brand ring-1 ring-brand"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function migrateLegacyForm(value: unknown): QuestionnaireData {
  if (!value || typeof value !== "object") return EMPTY_QUESTIONNAIRE;
  // Legacy questionnaire versions have a flexible nested shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacy = value as Record<string, any>;
  if (legacy.mainOffering && legacy.salesSystem) {
    return {
      ...EMPTY_QUESTIONNAIRE,
      ...legacy,
      owners: { ...EMPTY_QUESTIONNAIRE.owners, ...legacy.owners },
      workflow: { ...EMPTY_QUESTIONNAIRE.workflow, ...legacy.workflow },
      salesSystem: { ...EMPTY_QUESTIONNAIRE.salesSystem, ...legacy.salesSystem },
      marketingCapability: {
        ...EMPTY_QUESTIONNAIRE.marketingCapability,
        ...legacy.marketingCapability
      },
      costStructure: { ...EMPTY_QUESTIONNAIRE.costStructure, ...legacy.costStructure },
      aiPlan: {
        ...EMPTY_QUESTIONNAIRE.aiPlan,
        ...legacy.aiPlan,
        mvpAccepted:
          legacy.aiPlan?.mvpAccepted === "是"
            ? "接受"
            : legacy.aiPlan?.mvpAccepted === "否"
              ? "不确定"
              : legacy.aiPlan?.mvpAccepted ?? "接受"
      }
    } as QuestionnaireData;
  }
  return {
    ...EMPTY_QUESTIONNAIRE,
    companyName: legacy.companyName ?? "",
    industry: legacy.industry ?? "",
    employees: legacy.employees ?? 0,
    revenue: legacy.revenue ?? "",
    workflow: {
      ...EMPTY_QUESTIONNAIRE.workflow,
      acquisition: legacy.workflow?.acquisition ?? "",
      sales: legacy.workflow?.sales ?? "",
      delivery: legacy.workflow?.delivery ?? ""
    },
    marketingCapability: {
      ...EMPTY_QUESTIONNAIRE.marketingCapability,
      upgradeGoal: legacy.marketing ?? ""
    },
    costStructure: {
      ...EMPTY_QUESTIONNAIRE.costStructure,
      mostLaborIntensive: legacy.costIssues?.join("；") ?? "",
      mostRepetitive: legacy.costIssues?.join("；") ?? ""
    },
    aiPlan: {
      ...EMPTY_QUESTIONNAIRE.aiPlan,
      primaryProblem: legacy.painPoints?.join("；") ?? "",
      biggestConcern: legacy.aiGoals?.join("；") ?? ""
    }
  };
}

export function DiagnosisForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<QuestionnaireData>(EMPTY_QUESTIONNAIRE);
  const [reportType, setReportType] = useState<ReportType>("free");
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [generatedPreview, setGeneratedPreview] =
    useState<DiagnosisReportPreview | null>(null);
  const [generatedReportId, setGeneratedReportId] = useState("");
  const [generatedAccessToken, setGeneratedAccessToken] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const savedReportType = window.localStorage.getItem(STORAGE_KEYS.reportType);
    if (savedReportType === "manual999") {
      setReportType(savedReportType);
    }
    const paid = window.localStorage.getItem(STORAGE_KEYS.paidUnlock);
    if (paid === "true") {
      // already paid — could redirect to result directly, but let them re-diagnose if they want
    }
    const saved =
      window.localStorage.getItem(STORAGE_KEYS.questionnaire) ??
      window.localStorage.getItem(STORAGE_KEYS.legacyQuestionnaire);
    if (saved) {
      try {
        setForm(migrateLegacyForm(JSON.parse(saved)));
      } catch {
        window.localStorage.removeItem(STORAGE_KEYS.questionnaire);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEYS.questionnaire, JSON.stringify(form));
      setSavedAt(new Date());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [form, hydrated]);

  const update = useCallback(
    <K extends keyof QuestionnaireData>(key: K, value: QuestionnaireData[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
      setError("");
    },
    []
  );

  const updateNested = useCallback(
    <
      K extends keyof QuestionnaireData,
      NK extends keyof QuestionnaireData[K]
    >(
      key: K,
      nestedKey: NK,
      value: QuestionnaireData[K][NK]
    ) => {
      setForm((current) => ({
        ...current,
        [key]: {
          ...(current[key] as object),
          [nestedKey]: value
        }
      }));
      setError("");
    },
    []
  );

  const completion = useMemo(() => {
    const values = [
      form.companyName,
      form.industry,
      form.employees > 0 ? String(form.employees) : "",
      form.revenue,
      form.mainOffering,
      form.respondentRole,
      form.decisionAuthority,
      form.workflow.acquisition,
      form.workflow.sales,
      form.workflow.delivery,
      form.workflow.management,
      form.workflow.manualDependency,
      form.salesSystem.biggestProblem,
      form.marketingCapability.channels.length ? "yes" : "",
      form.marketingCapability.upgradeGoal,
      ...Object.values(form.costStructure),
      form.aiPlan.primaryProblem,
      form.aiPlan.timeToResult,
      form.aiPlan.budget,
      form.aiPlan.biggestConcern
    ];
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  }, [form]);

  function validateStep(target: number): ValidationIssue | null {
    if (target === 0) {
      return (
        requiredText(form.companyName, "企业名称", 0, 2) ??
        (!form.industry ? { step: 0, message: "请选择“所属行业”。" } : null) ??
        (form.employees <= 0
          ? { step: 0, message: "请填写有效的“员工人数”。" }
          : null) ??
        (!form.revenue ? { step: 0, message: "请选择“年营业收入”。" } : null) ??
        requiredText(form.mainOffering, "主营产品 / 服务", 0, 5) ??
        (!form.respondentRole
          ? { step: 0, message: "请选择“填写人角色”。" }
          : null)
      );
    }

    if (target === 1) {
      return (
        requiredText(form.workflow.acquisition, "当前主要获客方式", 1, 5) ??
        requiredText(form.workflow.sales, "销售转化流程", 1, 5) ??
        requiredText(form.workflow.delivery, "交付服务流程", 1, 5) ??
        requiredText(form.workflow.management, "内部管理流程", 1, 5) ??
        requiredText(form.workflow.manualDependency, "当前最依赖人工的环节", 1, 5) ??
        requiredText(form.workflow.biggestBottleneck, "最容易拖慢业务的环节", 1, 5)
      );
    }

    if (target === 2) {
      return requiredText(form.salesSystem.biggestProblem, "当前销售环节最大问题", 2, 5);
    }

    if (target === 3) {
      return (
        (form.marketingCapability.channels.length === 0
          ? { step: 3, message: "请至少选择一个“当前使用的营销渠道”。" }
          : null) ??
        requiredText(form.marketingCapability.upgradeGoal, "最想提升的营销能力", 3, 5)
      );
    }

    if (target === 4) {
      return (
        requiredText(form.costStructure.mostLaborIntensive, "最耗费人工的工作", 4, 3) ??
        requiredText(form.costStructure.mostRepetitive, "重复频率最高的工作", 4, 3) ??
        requiredText(form.costStructure.errorProne, "最容易出错的工作", 4, 3) ??
        requiredText(form.costStructure.salesBottleneck, "最影响销售成交的工作", 4, 3) ??
        requiredText(form.costStructure.costToReduce, "最希望降低的成本", 4, 3) ??
        requiredText(form.costStructure.weeklyRecurring, "每周重复发生的工作", 4, 3)
      );
    }

    if (target === 5) {
      return (
        requiredText(form.aiPlan.primaryProblem, "最想用AI解决的问题", 5, 5) ??
        (!form.aiPlan.timeToResult
          ? { step: 5, message: "请选择“希望多久看到第一个结果”。" }
          : null) ??
        (!form.aiPlan.budget
          ? { step: 5, message: "请选择“第一阶段预算区间”。" }
          : null) ??
        requiredText(form.aiPlan.biggestConcern, "对AI最大的担心", 5, 3)
      );
    }

    return null;
  }

  function findFirstValidationIssue(): ValidationIssue | null {
    for (let target = 0; target < STEPS.length; target += 1) {
      const issue = validateStep(target);
      if (issue) return issue;
    }
    return null;
  }

  function showValidationIssue(issue: ValidationIssue) {
    setStep(issue.step);
    setError(`${STEPS[issue.step]}：${issue.message}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextStep() {
    const issue = validateStep(step);
    if (issue) {
      showValidationIssue(issue);
      return;
    }
    setStep((current) => Math.min(current + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitDiagnosis() {
    const issue = findFirstValidationIssue();
    if (issue) {
      showValidationIssue(issue);
      return;
    }
    if (!agreed) {
      setError("请阅读并同意《诊断服务授权与免责声明》后再生成报告。");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      // 基于同意勾选设置 dataConsent
      const submissionData = {
        ...form,
        aiPlan: { ...form.aiPlan, dataConsent: agreed ? "是" as const : "否" as const }
      };
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });
      const data = (await response.json()) as DiagnoseResponse;
      if (
        !response.ok ||
        !data.reportId ||
        !data.accessToken ||
        !data.preview
      ) {
        throw new Error(
          data.details
            ? `${data.error || "问卷数据校验失败"}（${data.details}）`
            : data.error || "诊断生成失败，请稍后重试。"
        );
      }
      window.localStorage.setItem(STORAGE_KEYS.questionnaire, JSON.stringify(form));
      window.localStorage.removeItem(STORAGE_KEYS.report);
      window.localStorage.setItem(STORAGE_KEYS.reportId, data.reportId);
      window.localStorage.setItem(STORAGE_KEYS.reportAccessToken, data.accessToken);
      window.localStorage.setItem(STORAGE_KEYS.reportType, "free");
      setGeneratedReportId(data.reportId);
      setGeneratedAccessToken(data.accessToken);
      setGeneratedPreview(data.preview);
      setShowPaywall(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "诊断生成失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  function viewReportStatus() {
    const reportId =
      generatedReportId || window.localStorage.getItem(STORAGE_KEYS.reportId) || "";
    const accessToken =
      generatedAccessToken ||
      window.localStorage.getItem(STORAGE_KEYS.reportAccessToken) ||
      "";

    if (reportId && accessToken) {
      router.push(
        `/result?id=${encodeURIComponent(reportId)}&token=${encodeURIComponent(
          accessToken
        )}`
      );
      return;
    }

    router.push("/result");
  }

  return (
    <main className="bg-white">
      <div className="mx-auto grid max-w-[1480px] lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14 xl:px-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10">
              <span className="eyebrow">
                <Sparkle size={14} weight="fill" />
                AI DIAGNOSIS
              </span>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">
                企业AI诊断系统
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                通过六大维度评估企业现状，生成AI成熟度、机会矩阵、落地项目、服务匹配与ROI诊断报告。
              </p>
              {showPaywall ? (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  <LockKey size={13} weight="fill" />
                  待支付解锁
                </div>
              ) : (
                <div className="mt-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
                  当前报告类型：{reportTypeLabels[reportType]}
                </div>
              )}
            </div>

            {!showPaywall ? (
              <>
                <QuickScreeningPanel />
                <div id="formal-diagnosis" className="scroll-mt-24" />
                <StepProgress
                  steps={STEPS}
                  current={step}
                  onStepClick={(index) => {
                    if (index <= step) {
                      setStep(index);
                      setError("");
                      return;
                    }
                    for (let target = step; target < index; target += 1) {
                      const issue = validateStep(target);
                      if (issue) {
                        showValidationIssue(issue);
                        return;
                      }
                    }
                    setStep(index);
                    setError("");
                  }}
                />

                <div className="mt-9 border-t border-slate-200 pt-9">
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Step {step + 1} of 6
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">
                      {STEP_COPY[step][0]}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {STEP_COPY[step][1]}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {step === 0 && (
                      <>
                        <label>
                          <span className="field-label">企业名称</span>
                          <input
                            className="field"
                            value={form.companyName}
                            onChange={(event) => update("companyName", event.target.value)}
                            placeholder="请输入企业全称"
                          />
                        </label>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <label>
                            <span className="field-label">所属行业</span>
                            <select
                              className="field"
                              value={form.industry}
                              onChange={(event) => update("industry", event.target.value)}
                            >
                              <option value="">请选择所属行业</option>
                              {INDUSTRIES.map((item) => (
                                <option key={item}>{item}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span className="field-label">员工人数</span>
                            <input
                              className="field"
                              type="number"
                              min={1}
                              value={form.employees || ""}
                              onChange={(event) =>
                                update("employees", Number(event.target.value))
                              }
                              placeholder="例如：120"
                            />
                          </label>
                        </div>
                        <label>
                          <span className="field-label">年营业收入</span>
                          <select
                            className="field"
                            value={form.revenue}
                            onChange={(event) => update("revenue", event.target.value)}
                          >
                            <option value="">请选择收入区间</option>
                            {REVENUE_OPTIONS.map((item) => (
                              <option key={item}>{item}</option>
                            ))}
                          </select>
                        </label>
                        <TextAreaField
                          label="主营产品 / 服务"
                          value={form.mainOffering}
                          onChange={(value) => update("mainOffering", value)}
                          placeholder="请说明主要产品、服务、客单价和目标客户。"
                        />
                        <div className="grid gap-6 sm:grid-cols-2">
                          <label>
                            <span className="field-label">填写人角色</span>
                            <select
                              className="field"
                              value={form.respondentRole}
                              onChange={(event) => update("respondentRole", event.target.value)}
                            >
                              <option value="">请选择角色</option>
                              {RESPONDENT_ROLES.map((item) => (
                                <option key={item}>{item}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span className="field-label">是否有决策权</span>
                            <select
                              className="field"
                              value={form.decisionAuthority}
                              onChange={(event) =>
                                update(
                                  "decisionAuthority",
                                  event.target.value as QuestionnaireData["decisionAuthority"]
                                )
                              }
                            >
                              {["是", "否", "需要向上汇报"].map((item) => (
                                <option key={item}>{item}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-3">
                          <YesNoField
                            label="有专人负责营销"
                            value={form.owners.marketing}
                            onChange={(value) => updateNested("owners", "marketing", value)}
                          />
                          <YesNoField
                            label="有专人负责运营"
                            value={form.owners.operations}
                            onChange={(value) => updateNested("owners", "operations", value)}
                          />
                          <YesNoField
                            label="有专人负责IT"
                            value={form.owners.it}
                            onChange={(value) => updateNested("owners", "it", value)}
                          />
                        </div>
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <TextAreaField
                          label="当前主要获客方式"
                          value={form.workflow.acquisition}
                          onChange={(value) => updateNested("workflow", "acquisition", value)}
                          placeholder="例如：官网、短视频、展会、转介绍、渠道合作。"
                        />
                        <TextAreaField
                          label="销售转化流程"
                          value={form.workflow.sales}
                          onChange={(value) => updateNested("workflow", "sales", value)}
                          placeholder="请描述线索分配、跟进、报价、谈判和签约。"
                        />
                        <TextAreaField
                          label="交付服务流程"
                          value={form.workflow.delivery}
                          onChange={(value) => updateNested("workflow", "delivery", value)}
                          placeholder="请描述签约后到验收、售后和复购的流程。"
                        />
                        <TextAreaField
                          label="内部管理流程"
                          value={form.workflow.management}
                          onChange={(value) => updateNested("workflow", "management", value)}
                          placeholder="请描述数据汇总、审批、会议、项目和经营管理方式。"
                        />
                        <TextAreaField
                          label="当前最依赖人工的环节"
                          value={form.workflow.manualDependency}
                          onChange={(value) =>
                            updateNested("workflow", "manualDependency", value)
                          }
                          placeholder="请指出必须由某个人反复处理、难以替代的环节。"
                        />
                        <TextAreaField
                          label="哪个环节最容易拖慢业务"
                          value={form.workflow.biggestBottleneck}
                          onChange={(value) =>
                            updateNested("workflow", "biggestBottleneck", value)
                          }
                          placeholder="请描述等待、返工、审批或信息断点最严重的环节。"
                        />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <YesNoField
                            label="有客户资料表"
                            value={form.salesSystem.customerList}
                            onChange={(value) =>
                              updateNested("salesSystem", "customerList", value)
                            }
                          />
                          <YesNoField
                            label="有标准销售话术"
                            value={form.salesSystem.salesScript}
                            onChange={(value) =>
                              updateNested("salesSystem", "salesScript", value)
                            }
                          />
                          <YesNoField
                            label="有报价模板"
                            value={form.salesSystem.quoteTemplate}
                            onChange={(value) =>
                              updateNested("salesSystem", "quoteTemplate", value)
                            }
                          />
                          <YesNoField
                            label="有客户跟进机制"
                            value={form.salesSystem.followUpMechanism}
                            onChange={(value) =>
                              updateNested("salesSystem", "followUpMechanism", value)
                            }
                          />
                          <YesNoField
                            label="有历史成交记录整理"
                            value={form.salesSystem.historicalRecords}
                            onChange={(value) =>
                              updateNested("salesSystem", "historicalRecords", value)
                            }
                          />
                        </div>
                        <TextAreaField
                          label="当前销售环节最大问题"
                          value={form.salesSystem.biggestProblem}
                          onChange={(value) =>
                            updateNested("salesSystem", "biggestProblem", value)
                          }
                          placeholder="例如：线索质量低、跟进不及时、报价慢、话术不统一。"
                          rows={6}
                        />
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div>
                          <span className="field-label">当前使用的营销渠道</span>
                          <MultiSelect
                            options={MARKETING_CHANNELS}
                            value={form.marketingCapability.channels}
                            onChange={(value) =>
                              updateNested("marketingCapability", "channels", value)
                            }
                          />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-3">
                          <YesNoField
                            label="有产品图片/视频素材"
                            value={form.marketingCapability.productAssets}
                            onChange={(value) =>
                              updateNested("marketingCapability", "productAssets", value)
                            }
                          />
                          <YesNoField
                            label="有稳定内容发布"
                            value={form.marketingCapability.consistentPublishing}
                            onChange={(value) =>
                              updateNested(
                                "marketingCapability",
                                "consistentPublishing",
                                value
                              )
                            }
                          />
                          <YesNoField
                            label="有产品卖点文案"
                            value={form.marketingCapability.sellingPoints}
                            onChange={(value) =>
                              updateNested("marketingCapability", "sellingPoints", value)
                            }
                          />
                          <YesNoField
                            label="有脚本 / 内容选题库"
                            value={form.marketingCapability.contentLibrary}
                            onChange={(value) =>
                              updateNested("marketingCapability", "contentLibrary", value)
                            }
                          />
                        </div>
                        <TextAreaField
                          label="最想提升的营销能力"
                          value={form.marketingCapability.upgradeGoal}
                          onChange={(value) =>
                            updateNested("marketingCapability", "upgradeGoal", value)
                          }
                          placeholder="例如：稳定产出短视频、提升官网转化、建立销售素材库。"
                        />
                      </>
                    )}

                    {step === 4 && (
                      <>
                        {[
                          ["mostLaborIntensive", "最耗费人工的工作"],
                          ["mostRepetitive", "最重复的工作"],
                          ["errorProne", "最容易出错的工作"],
                          ["salesBottleneck", "最影响成交的瓶颈"],
                          ["costToReduce", "当前最想降低的成本"],
                          ["weeklyRecurring", "每周都会反复做的工作"]
                        ].map(([key, label]) => (
                          <TextAreaField
                            key={key}
                            label={label}
                            value={
                              form.costStructure[key as keyof QuestionnaireData["costStructure"]]
                            }
                            onChange={(value) =>
                              updateNested(
                                "costStructure",
                                key as keyof QuestionnaireData["costStructure"],
                                value
                              )
                            }
                            placeholder={`请具体描述${label}，最好包含频率、涉及人员或影响。`}
                            rows={3}
                          />
                        ))}
                      </>
                    )}

                    {step === 5 && (
                      <>
                        <TextAreaField
                          label="最想用AI解决的问题"
                          value={form.aiPlan.primaryProblem}
                          onChange={(value) =>
                            updateNested("aiPlan", "primaryProblem", value)
                          }
                          placeholder="请只写第一阶段最重要的一个问题。"
                          rows={5}
                        />
                        <div className="grid gap-6 sm:grid-cols-2">
                          <label>
                            <span className="field-label">希望多久看到第一个结果</span>
                            <select
                              className="field"
                              value={form.aiPlan.timeToResult}
                              onChange={(event) =>
                                updateNested("aiPlan", "timeToResult", event.target.value)
                              }
                            >
                              <option value="">请选择结果周期</option>
                              {RESULT_TIMELINES.map((item) => (
                                <option key={item}>{item}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span className="field-label">第一阶段预算区间</span>
                            <select
                              className="field"
                              value={form.aiPlan.budget}
                              onChange={(event) =>
                                updateNested("aiPlan", "budget", event.target.value)
                              }
                            >
                              <option value="">请选择预算区间</option>
                              {BUDGET_OPTIONS.map((item) => (
                                <option key={item}>{item}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <label>
                          <span className="field-label">是否接受先做MVP样品验证</span>
                          <select
                            className="field"
                            value={form.aiPlan.mvpAccepted}
                            onChange={(event) =>
                              updateNested(
                                "aiPlan",
                                "mvpAccepted",
                                event.target.value as QuestionnaireData["aiPlan"]["mvpAccepted"]
                              )
                            }
                          >
                            {["接受", "不确定", "希望直接做完整项目"].map((item) => (
                              <option key={item}>{item}</option>
                            ))}
                          </select>
                        </label>
                        <TextAreaField
                          label="对AI最大的担心"
                          value={form.aiPlan.biggestConcern}
                          onChange={(value) =>
                            updateNested("aiPlan", "biggestConcern", value)
                          }
                          placeholder="例如：投入无法回本、员工不会用、数据安全、系统难维护。"
                        />
                        {/* ───── 授权同意勾选 ───── */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                          <h3 className="text-sm font-bold text-ink">诊断服务授权与免责声明</h3>
                          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-600">
                            <p className="font-bold">一、授权范围</p>
                            <p>您授权企业AI数字工厂（下称“本站”）基于您填写的企业信息进行AI诊断分析，包括但不限于：企业规模、行业、业务流程、客户与销售体系、营销能力、成本结构和AI目标。该授权仅限于本次诊断服务及后续人工沟通使用。</p>
                            <p className="mt-3 font-bold">二、数据使用与保密</p>
                            <p>1. 您的企业信息仅用于生成诊断报告和后续服务沟通，不会未经您明确同意而公开展示、作为公开案例或转交第三方。</p>
                            <p>2. 诊断过程中产生的数据将存储在安全的云数据库中（Turso/LibSQL），仅本站管理员可访问。</p>
                            <p>3. AI诊断通过 OpenAI API 进行处理，数据传输经过加密。OpenAI 不会使用您的数据训练模型（API 调用遵循 OpenAI 数据使用政策）。</p>
                            <p className="mt-3 font-bold">三、免责声明</p>
                            <p>1. AI诊断结果为初步方向性建议，不构成正式商业咨询或投资建议。具体落地需结合人工访谈、资料验证和实际业务场景进一步确认。</p>
                            <p>2. AI生成的评分、ROI测算和项目建议基于您填写的信息，信息越完整，结果越精准。信息不足或偏差可能导致诊断结果与实际情况存在差异。</p>
                            <p>3. 本站不对因使用AI诊断结果而产生的任何直接或间接损失承担责任。</p>
                            <p>4. 99元为报告解锁服务费，一经解锁概不退款。如报告存在明显质量问题，可联系客服申请人工复核。</p>
                            <p className="mt-3 font-bold">四、用户责任</p>
                            <p>您应确保所填信息真实、准确、完整。不得利用本站从事违法活动，不得对系统进行逆向工程或未授权访问。</p>
                          </div>
                          <label className="mt-4 flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={agreed}
                              onChange={(event) => setAgreed(event.target.checked)}
                              className="mt-0.5 size-4 accent-brand"
                            />
                            <span className="text-xs leading-5 text-slate-600">
                              我已阅读并同意以上<b>《诊断服务授权与免责声明》</b>，确认所填信息真实有效，同意本站基于上述条款进行AI诊断分析。详见
                              <a
                                href="/terms"
                                target="_blank"
                                className="mx-0.5 font-bold text-brand underline hover:text-blue-700"
                              >
                                服务条款
                              </a>
                              与
                              <a
                                href="/privacy"
                                target="_blank"
                                className="mx-0.5 font-bold text-brand underline hover:text-blue-700"
                              >
                                隐私政策
                              </a>
                              。
                            </span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mt-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      <WarningCircle className="mt-0.5 shrink-0" size={18} weight="fill" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={step === 0 || submitting}
                      onClick={() => {
                        setStep((current) => Math.max(current - 1, 0));
                        setError("");
                      }}
                    >
                      <ArrowLeft size={17} />
                      上一步
                    </button>
                    {step < 5 ? (
                      <button type="button" className="primary-button" onClick={nextStep}>
                        下一步
                        <ArrowRight size={17} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="primary-button min-w-44"
                        disabled={submitting}
                        onClick={submitDiagnosis}
                      >
                        {submitting ? (
                          <>
                            <SpinnerGap className="animate-spin" size={18} />
                            AI分析中
                          </>
                        ) : (
                          <>
                            <Sparkle size={18} weight="fill" />
                            生成诊断报告
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ───── 99元付费解锁 ───── */}
                <div className="mt-9 border-t border-slate-200 pt-9">
                <div className="surface-card p-8 sm:p-10">
                  <div className="text-center">
                    <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 text-amber-600">
                      <LockKey size={32} weight="fill" />
                    </span>
                    <h2 className="mt-5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
                      {generatedPreview?.companyName || form.companyName || "企业"} 的诊断报告已生成
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      AI已完成六大维度分析，支付 <strong className="text-ink">¥{siteConfig.unlockPrice}</strong> 即可解锁完整诊断报告。
                    </p>
                  </div>

                  {generatedPreview && (
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            免费预览
                          </p>
                          <p className="mt-2 text-2xl font-black text-ink">
                            AI成熟度 {generatedPreview.maturityScore} / 100
                          </p>
                          <p className="mt-1 text-sm font-bold text-brand">
                            {generatedPreview.maturityLevel}
                          </p>
                        </div>
                        <div className="max-w-xl">
                          <p className="text-xs font-bold text-slate-400">一句话商业结论</p>
                          <p className="mt-2 text-sm leading-7 text-slate-700">
                            {generatedPreview.businessConclusion}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 border-t border-slate-200 pt-4 font-mono text-xs text-slate-400">
                        报告编号：{generatedReportId}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        点击下方“查看解锁状态”会进入这份报告的专属查看链接。退出后请用该链接返回，后台解锁后可直接查看完整报告。
                      </p>
                    </div>
                  )}

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                      <CheckCircle size={20} className="text-emerald-600" weight="fill" />
                      <p className="mt-3 text-sm font-bold text-ink">已生成内容</p>
                      <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-500">
                        <li>· 企业AI成熟度评分</li>
                        <li>· 业务流程分析</li>
                        <li>· AI机会评分矩阵</li>
                        <li>· 7/30/90天路线图</li>
                        <li>· TOP3 AI项目建议</li>
                        <li>· ROI初步测算</li>
                        <li>· 推荐服务包匹配</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border-2 border-brand bg-brand-soft/30 p-5">
                      <Sparkle size={20} className="text-brand" weight="fill" />
                      <p className="mt-3 text-sm font-bold text-ink">付费解锁后获得</p>
                      <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-600">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-brand" weight="fill" />
                          完整企业AI诊断报告
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-brand" weight="fill" />
                          TOP3项目详细步骤与预算
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-brand" weight="fill" />
                          ROI区间与回本周期测算
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-brand" weight="fill" />
                          可发给团队的正式PDF报告
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-brand" weight="fill" />
                          一次微信简要解读
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-brand to-blue-700 p-7 text-white sm:p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-blue-100">解锁价格</p>
                        <p className="mt-2 text-5xl font-black tracking-[-0.05em]">¥{siteConfig.unlockPrice}</p>
                        <p className="mt-2 text-sm text-blue-100">一次性支付 · 含微信简要解读</p>
                      </div>
                      <div className="hidden sm:block">
                        <span className="grid size-16 place-items-center rounded-2xl bg-white/20 text-3xl font-black">99</span>
                      </div>
                    </div>
                    <div className="mt-7 border-t border-white/20 pt-6">
                      <p className="text-xs font-bold text-blue-100">当前采用微信私域收单</p>
                      <p className="mt-2 text-sm leading-6 text-blue-50">
                        添加微信 <strong className="text-white">{siteConfig.contact.wechatId}</strong>，发送报告编号并支付{siteConfig.unlockPrice}元。管理员确认收款后，点击下方按钮即可查看完整报告。
                      </p>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand transition hover:-translate-y-0.5 hover:shadow-xl"
                        onClick={viewReportStatus}
                      >
                        <Sparkle size={18} weight="fill" />
                        我已付款，查看解锁状态
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                        onClick={() => {
                          setShowPaywall(false);
                          setGeneratedPreview(null);
                          setGeneratedReportId("");
                          setGeneratedAccessToken("");
                        }}
                      >
                        <ArrowLeft size={17} />
                        返回修改问卷
                      </button>
                    </div>
                    <p className="mt-4 text-center text-xs text-blue-200">
                      完整报告保存在服务器，未确认收款前无法通过页面或接口绕过解锁。
                    </p>
                  </div>
                </div>
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="border-t border-slate-200 bg-slate-50/70 px-6 py-10 lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:border-l lg:border-t-0 lg:px-8">
          <div className="mx-auto max-w-md space-y-8 lg:max-w-none">
            {showPaywall ? (
              <>
                <div>
                  <p className="text-sm font-bold text-ink">报告状态</p>
                  <div className="mt-4 flex items-start gap-3">
                    <span className="grid size-7 place-items-center rounded-full bg-amber-100 text-amber-600">
                      <LockKey size={18} weight="fill" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">待解锁</p>
                      <p className="mt-1 text-xs text-slate-400">支付¥{siteConfig.unlockPrice}后查看完整报告</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-7">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-bold text-ink">¥{siteConfig.unlockPrice} 解锁包含</p>
                    <ul className="mt-3 space-y-2 text-xs text-slate-600">
                      {[
                        "完整AI诊断报告",
                        "TOP3项目详细步骤与预算",
                        "ROI与回本周期",
                        "正式PDF报告",
                        "一次微信简要解读"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-brand" weight="fill" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-slate-200 pt-7 text-xs leading-5 text-slate-500">
                  <LockKey size={17} className="mt-0.5 shrink-0" />
                  <p>当前采用微信私域收单，添加 {siteConfig.contact.wechatId} 并发送报告编号。管理员确认收款后即可解锁。</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm font-bold text-ink">保存状态</p>
                  <div className="mt-4 flex items-start gap-3">
                    <span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle size={18} weight="fill" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">已自动保存</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {savedAt ? savedAt.toLocaleTimeString("zh-CN") : "等待首次保存"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-7">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">整体完成度</p>
                    <span className="text-sm font-bold text-brand">{completion}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-brand">
                    <Clock size={25} />
                    <div>
                      <p className="text-lg font-bold">约 8–12 分钟</p>
                      <p className="text-xs text-slate-500">完成全部六个模块</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-7">
                  <p className="text-sm font-bold text-ink">最终报告包含</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    {[
                      "企业AI成熟度评分",
                      "业务流程与机会矩阵",
                      "TOP3可执行AI项目",
                      "7/30/90天落地路线",
                      "ROI与回本周期",
                      "推荐服务包与下一步"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle size={17} className="text-brand" weight="fill" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-start gap-3 border-t border-slate-200 pt-7 text-xs leading-5 text-slate-500">
                  <LockKey size={17} className="mt-0.5 shrink-0" />
                  <p>问卷保存在当前浏览器；API密钥仅从服务端环境变量读取。</p>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
