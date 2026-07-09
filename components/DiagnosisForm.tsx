"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import { StepProgress } from "@/components/step-progress";
import type {
  DiagnoseResponse,
  DiagnosisReportPreview,
  QuestionnaireData,
  ReportType,
  YesNo
} from "@/types/diagnosis";

const STEPS = [
  "企业基本情况",
  "业务流程与交付",
  "客户与销售系统",
  "内容与营销能力",
  "成本与重复工作",
  "AI目标与预算"
];

const STEP_COPY = [
  ["企业基本情况", "先确认企业规模、行业、业务类型和决策条件。"],
  ["业务流程与交付", "用选择题快速判断业务从哪里来、怎么成交、怎么交付。"],
  ["客户与销售系统", "判断销售资产、客户跟进和报价机制是否具备AI改造基础。"],
  ["内容与营销能力", "判断是否适合从AI营销素材、产品图、短视频或内容生产切入。"],
  ["成本与重复工作", "定位最耗人、最重复、最容易出错和最影响成交的工作。"],
  ["AI目标与预算", "明确第一个AI项目的方向、预算、周期和主要顾虑。"]
];

type ValidationIssue = {
  step: number;
  message: string;
};

type OptionQuestionProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  columns?: "two" | "three";
};

function requiredText(value: string, label: string, step: number): ValidationIssue | null {
  if (!value.trim()) return { step, message: `请选择“${label}”。` };
  return null;
}

function normalizeYesNo(value: unknown): YesNo {
  return value === "是" ? "是" : "否";
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-black text-slate-100">{label}</span>
      <select
        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-[15px] text-white outline-none transition focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">请选择</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-950">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function InputField({
  label,
  type = "text",
  value,
  placeholder,
  onChange
}: {
  label: string;
  type?: "text" | "number";
  value: string | number;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-black text-slate-100">{label}</span>
      <input
        type={type}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function OptionQuestion({
  label,
  value,
  options,
  onChange,
  columns = "two"
}: OptionQuestionProps) {
  return (
    <fieldset>
      <legend className="block text-sm font-black text-slate-100">{label}</legend>
      <div
        className={`mt-3 grid gap-3 ${
          columns === "three" ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-sm font-bold leading-6 transition ${
              value === option
                ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-[0_18px_44px_rgba(34,211,238,.18)]"
                : "border-white/10 bg-white/[.055] text-slate-200 hover:border-cyan-300/30 hover:bg-white/[.08]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
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
    <OptionQuestion
      label={label}
      value={value}
      options={["是", "否"]}
      onChange={(option) => onChange(option as YesNo)}
    />
  );
}

function migrateLegacyForm(value: unknown): QuestionnaireData {
  if (!value || typeof value !== "object") return EMPTY_QUESTIONNAIRE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacy = value as Record<string, any>;
  return {
    ...EMPTY_QUESTIONNAIRE,
    ...legacy,
    decisionAuthority:
      legacy.decisionAuthority === "是"
        ? "是"
        : legacy.decisionAuthority === "否"
          ? "否"
          : "需要向上汇报",
    owners: {
      ...EMPTY_QUESTIONNAIRE.owners,
      ...legacy.owners,
      marketing: normalizeYesNo(legacy.owners?.marketing),
      operations: normalizeYesNo(legacy.owners?.operations),
      it: normalizeYesNo(legacy.owners?.it)
    },
    workflow: { ...EMPTY_QUESTIONNAIRE.workflow, ...legacy.workflow },
    salesSystem: {
      ...EMPTY_QUESTIONNAIRE.salesSystem,
      ...legacy.salesSystem,
      customerList: normalizeYesNo(legacy.salesSystem?.customerList),
      salesScript: normalizeYesNo(legacy.salesSystem?.salesScript),
      quoteTemplate: normalizeYesNo(legacy.salesSystem?.quoteTemplate),
      followUpMechanism: normalizeYesNo(legacy.salesSystem?.followUpMechanism),
      historicalRecords: normalizeYesNo(legacy.salesSystem?.historicalRecords)
    },
    marketingCapability: {
      ...EMPTY_QUESTIONNAIRE.marketingCapability,
      ...legacy.marketingCapability,
      channels: Array.isArray(legacy.marketingCapability?.channels)
        ? legacy.marketingCapability.channels
        : [],
      productAssets: normalizeYesNo(legacy.marketingCapability?.productAssets),
      consistentPublishing: normalizeYesNo(legacy.marketingCapability?.consistentPublishing),
      sellingPoints: normalizeYesNo(legacy.marketingCapability?.sellingPoints),
      contentLibrary: normalizeYesNo(legacy.marketingCapability?.contentLibrary)
    },
    costStructure: { ...EMPTY_QUESTIONNAIRE.costStructure, ...legacy.costStructure },
    aiPlan: {
      ...EMPTY_QUESTIONNAIRE.aiPlan,
      ...legacy.aiPlan,
      mvpAccepted:
        legacy.aiPlan?.mvpAccepted === "希望直接做完整项目"
          ? "希望直接做完整项目"
          : legacy.aiPlan?.mvpAccepted === "不确定"
            ? "不确定"
            : "接受",
      dataConsent: normalizeYesNo(legacy.aiPlan?.dataConsent)
    }
  } as QuestionnaireData;
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
    if (savedReportType === "manual999") setReportType(savedReportType);
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
      form.workflow.biggestBottleneck,
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
        (!form.companyName.trim() ? { step: 0, message: "请填写企业名称。" } : null) ??
        (!form.industry ? { step: 0, message: "请选择所属行业。" } : null) ??
        (form.employees <= 0 ? { step: 0, message: "请填写员工人数。" } : null) ??
        (!form.revenue ? { step: 0, message: "请选择年营业收入。" } : null) ??
        requiredText(form.mainOffering, "主营产品 / 服务", 0) ??
        (!form.respondentRole ? { step: 0, message: "请选择填写人角色。" } : null)
      );
    }
    if (target === 1) {
      return (
        requiredText(form.workflow.acquisition, "主要获客方式", 1) ??
        requiredText(form.workflow.sales, "销售转化流程", 1) ??
        requiredText(form.workflow.delivery, "交付服务流程", 1) ??
        requiredText(form.workflow.management, "内部管理流程", 1) ??
        requiredText(form.workflow.manualDependency, "最依赖人工的环节", 1) ??
        requiredText(form.workflow.biggestBottleneck, "最容易拖慢业务的环节", 1)
      );
    }
    if (target === 2) return requiredText(form.salesSystem.biggestProblem, "当前销售环节最大问题", 2);
    if (target === 3) {
      return (
        (form.marketingCapability.channels.length === 0
          ? { step: 3, message: "请至少选择一个营销渠道。" }
          : null) ?? requiredText(form.marketingCapability.upgradeGoal, "最想提升的营销能力", 3)
      );
    }
    if (target === 4) {
      return (
        requiredText(form.costStructure.mostLaborIntensive, "最耗费人工的工作", 4) ??
        requiredText(form.costStructure.mostRepetitive, "重复频率最高的工作", 4) ??
        requiredText(form.costStructure.errorProne, "最容易出错的工作", 4) ??
        requiredText(form.costStructure.salesBottleneck, "最影响销售成交的工作", 4) ??
        requiredText(form.costStructure.costToReduce, "最希望降低的成本", 4) ??
        requiredText(form.costStructure.weeklyRecurring, "每周重复发生的工作", 4)
      );
    }
    if (target === 5) {
      return (
        requiredText(form.aiPlan.primaryProblem, "最想用AI解决的问题", 5) ??
        (!form.aiPlan.timeToResult ? { step: 5, message: "请选择结果周期。" } : null) ??
        (!form.aiPlan.budget ? { step: 5, message: "请选择预算区间。" } : null) ??
        requiredText(form.aiPlan.biggestConcern, "对AI最大的担心", 5)
      );
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
    if (issue) return showValidationIssue(issue);
    setStep((current) => Math.min(current + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function findFirstValidationIssue(): ValidationIssue | null {
    for (let target = 0; target < STEPS.length; target += 1) {
      const issue = validateStep(target);
      if (issue) return issue;
    }
    return null;
  }

  async function submitDiagnosis() {
    const issue = findFirstValidationIssue();
    if (issue) return showValidationIssue(issue);
    if (!agreed) {
      setError("请阅读并同意《诊断服务授权与免责声明》后再生成报告。");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
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
      if (!response.ok || !data.reportId || !data.accessToken || !data.preview) {
        throw new Error(
          data.details
            ? `${data.error || "问卷数据校验失败"}：${data.details}`
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
      router.push(`/result?id=${encodeURIComponent(reportId)}&token=${encodeURIComponent(accessToken)}`);
      return;
    }
    router.push("/result");
  }

  function toggleChannel(channel: string) {
    updateNested(
      "marketingCapability",
      "channels",
      form.marketingCapability.channels.includes(channel)
        ? form.marketingCapability.channels.filter((item) => item !== channel)
        : [...form.marketingCapability.channels, channel]
    );
  }

  return (
    <main className="ai-page-bg text-white">
      <div className="page-shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-14">
        <section className="min-w-0">
          <div className="mb-10">
            <span className="ai-eyebrow">
              <Sparkle size={14} weight="fill" />
              AI DIAGNOSIS
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
              10分钟企业AI诊断
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              正式问卷已改成选择题为主。企业主只需要按当前情况选择最接近的一项，系统会根据选择生成诊断报告。
            </p>
            {showPaywall ? (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-100">
                <LockKey size={13} weight="fill" />
                待支付解锁
              </div>
            ) : (
              <div className="mt-4 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
                当前报告类型：{reportTypeLabels[reportType]}
              </div>
            )}
          </div>

          {!showPaywall ? (
            <>
              <div id="formal-diagnosis" className="scroll-mt-24" />
              <div className="rounded-[28px] border border-white/10 bg-white/[.045] p-5 shadow-[0_24px_80px_rgba(2,6,23,.22)] backdrop-blur sm:p-7">
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
                      if (issue) return showValidationIssue(issue);
                    }
                    setStep(index);
                    setError("");
                  }}
                />

                <div className="mt-9 border-t border-white/10 pt-9">
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                      Step {step + 1} of 6
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                      {STEP_COPY[step][0]}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {STEP_COPY[step][1]}
                    </p>
                  </div>

                  <div className="space-y-7">
                    {step === 0 && (
                      <>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <InputField
                            label="企业名称"
                            value={form.companyName}
                            onChange={(value) => update("companyName", value)}
                            placeholder="例如：某某智能装备有限公司"
                          />
                          <InputField
                            label="员工人数"
                            type="number"
                            value={form.employees || ""}
                            onChange={(value) => update("employees", Number(value))}
                            placeholder="例如：35"
                          />
                          <SelectField
                            label="所属行业"
                            value={form.industry}
                            options={INDUSTRIES}
                            onChange={(value) => update("industry", value)}
                          />
                          <SelectField
                            label="年营业收入"
                            value={form.revenue}
                            options={REVENUE_OPTIONS}
                            onChange={(value) => update("revenue", value)}
                          />
                          <SelectField
                            label="填写人角色"
                            value={form.respondentRole}
                            options={RESPONDENT_ROLES}
                            onChange={(value) => update("respondentRole", value)}
                          />
                          <SelectField
                            label="你是否有项目决策权"
                            value={form.decisionAuthority}
                            options={["是", "否", "需要向上汇报"]}
                            onChange={(value) =>
                              update("decisionAuthority", value as QuestionnaireData["decisionAuthority"])
                            }
                          />
                        </div>
                        <OptionQuestion
                          label="主营产品 / 服务"
                          value={form.mainOffering}
                          options={[
                            "标准产品销售：有明确产品、价格和客户群，适合先做AI营销素材。",
                            "非标项目交付：需要先沟通需求、报价和交付方案，适合做报价/项目MVP。",
                            "服务型业务：依赖咨询、课程、培训或服务交付，适合做知识库和销售话术。",
                            "多业务混合：产品、服务和项目都有，当前需要先做AI诊断梳理优先级。"
                          ]}
                          onChange={(value) => update("mainOffering", value)}
                        />
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <OptionQuestion
                          label="主要获客方式"
                          value={form.workflow.acquisition}
                          options={[
                            "主要靠老客户转介绍和熟人资源，线上获客还不稳定。",
                            "主要靠销售拜访、展会、电话或地推，获客过程偏人工。",
                            "主要靠抖音、小红书、视频号、官网等线上渠道，但内容转化不稳定。",
                            "暂时没有稳定获客渠道，需要先验证营销素材和线索承接。"
                          ]}
                          onChange={(value) => updateNested("workflow", "acquisition", value)}
                        />
                        <OptionQuestion
                          label="销售转化流程"
                          value={form.workflow.sales}
                          options={[
                            "客户咨询后加微信沟通，发资料、约会议、再报价，容易卡在跟进和报价。",
                            "销售主要靠个人经验成交，没有统一话术、案例和报价模板。",
                            "已有标准销售流程，但线索分级、跟进提醒和成交复盘还不完善。",
                            "成交周期较长，需要多次解释价值，客户资料和案例不够有说服力。"
                          ]}
                          onChange={(value) => updateNested("workflow", "sales", value)}
                        />
                        <OptionQuestion
                          label="交付服务流程"
                          value={form.workflow.delivery}
                          options={[
                            "交付依赖人工沟通和经验，流程没有完全标准化。",
                            "已有交付流程，但需求、进度、验收和售后分散在不同表格或聊天记录里。",
                            "交付过程比较清晰，适合先做项目看板或客户交付系统MVP。",
                            "交付内容重复度高，适合先做知识库、模板库或自动化工具。"
                          ]}
                          onChange={(value) => updateNested("workflow", "delivery", value)}
                        />
                        <OptionQuestion
                          label="内部管理流程"
                          value={form.workflow.management}
                          options={[
                            "客户、报价、合同、项目进度和回款分散记录，老板查看不方便。",
                            "主要靠表格和微信群管理，容易漏跟进、漏更新。",
                            "已有管理系统，但员工使用不充分，数据沉淀不完整。",
                            "内部流程还不清晰，建议先做诊断和流程梳理。"
                          ]}
                          onChange={(value) => updateNested("workflow", "management", value)}
                        />
                        <OptionQuestion
                          label="最依赖人工的环节"
                          value={form.workflow.manualDependency}
                          options={[
                            "获客内容生产和客户资料整理最依赖人工。",
                            "销售跟进、报价和方案撰写最依赖人工。",
                            "交付进度、售后问答和项目协调最依赖人工。",
                            "报表、数据整理和内部管理最依赖人工。"
                          ]}
                          onChange={(value) => updateNested("workflow", "manualDependency", value)}
                        />
                        <OptionQuestion
                          label="最容易拖慢业务的环节"
                          value={form.workflow.biggestBottleneck}
                          options={[
                            "线索少或线索质量不稳定，前端获客拖慢业务。",
                            "客户咨询后转化慢，资料、案例和报价不够快。",
                            "交付过程依赖人工协调，项目进度不透明。",
                            "老板无法及时看到经营数据，管理决策滞后。"
                          ]}
                          onChange={(value) => updateNested("workflow", "biggestBottleneck", value)}
                        />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <YesNoField label="是否有客户名单 / 线索表" value={form.salesSystem.customerList} onChange={(value) => updateNested("salesSystem", "customerList", value)} />
                          <YesNoField label="是否有标准销售话术" value={form.salesSystem.salesScript} onChange={(value) => updateNested("salesSystem", "salesScript", value)} />
                          <YesNoField label="是否有标准报价模板" value={form.salesSystem.quoteTemplate} onChange={(value) => updateNested("salesSystem", "quoteTemplate", value)} />
                          <YesNoField label="是否有客户跟进机制" value={form.salesSystem.followUpMechanism} onChange={(value) => updateNested("salesSystem", "followUpMechanism", value)} />
                          <YesNoField label="是否保留历史成交记录" value={form.salesSystem.historicalRecords} onChange={(value) => updateNested("salesSystem", "historicalRecords", value)} />
                        </div>
                        <OptionQuestion
                          label="当前销售环节最大问题"
                          value={form.salesSystem.biggestProblem}
                          options={[
                            "线索进入后不知道该发什么资料，销售话术和案例不统一。",
                            "报价慢、方案慢，很多内容需要临时整理。",
                            "跟进不及时，客户状态和下一步动作没有统一记录。",
                            "客户看不懂价值，需要更专业的产品图、案例页或短视频说明。"
                          ]}
                          onChange={(value) => updateNested("salesSystem", "biggestProblem", value)}
                        />
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div>
                          <p className="text-sm font-black text-slate-100">当前使用的营销渠道</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {MARKETING_CHANNELS.map((channel) => (
                              <button
                                key={channel}
                                type="button"
                                onClick={() => toggleChannel(channel)}
                                className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                                  form.marketingCapability.channels.includes(channel)
                                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                                    : "border-white/10 bg-white/[.055] text-slate-200 hover:border-cyan-300/30"
                                }`}
                              >
                                {channel}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <YesNoField label="是否已有产品图 / 案例 / 视频素材" value={form.marketingCapability.productAssets} onChange={(value) => updateNested("marketingCapability", "productAssets", value)} />
                          <YesNoField label="是否能稳定发布内容" value={form.marketingCapability.consistentPublishing} onChange={(value) => updateNested("marketingCapability", "consistentPublishing", value)} />
                          <YesNoField label="是否已梳理清楚核心卖点" value={form.marketingCapability.sellingPoints} onChange={(value) => updateNested("marketingCapability", "sellingPoints", value)} />
                          <YesNoField label="是否有可复用内容库" value={form.marketingCapability.contentLibrary} onChange={(value) => updateNested("marketingCapability", "contentLibrary", value)} />
                        </div>
                        <OptionQuestion
                          label="最想提升的营销能力"
                          value={form.marketingCapability.upgradeGoal}
                          options={[
                            "想先做销售可直接转发的产品图、案例图和短视频素材。",
                            "想提升短视频/小红书/视频号内容生产效率。",
                            "想把产品卖点、案例、报价说明整理成一套标准内容库。",
                            "想先判断企业到底适合做AI营销、知识库还是业务系统。"
                          ]}
                          onChange={(value) => updateNested("marketingCapability", "upgradeGoal", value)}
                        />
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <OptionQuestion
                          label="最耗费人工的工作"
                          value={form.costStructure.mostLaborIntensive}
                          options={["整理报价和方案最耗人工。", "制作产品图、视频、PPT和案例资料最耗人工。", "客户问答、售后解释和资料查找最耗人工。", "报表汇总、数据整理和项目进度同步最耗人工。"]}
                          onChange={(value) => updateNested("costStructure", "mostLaborIntensive", value)}
                        />
                        <OptionQuestion
                          label="重复频率最高的工作"
                          value={form.costStructure.mostRepetitive}
                          options={["每天重复回复类似客户问题。", "每周重复整理客户、销售或项目报表。", "每个客户都要重复发资料、写方案、做报价。", "每个项目都要重复协调进度、验收和售后。"]}
                          onChange={(value) => updateNested("costStructure", "mostRepetitive", value)}
                        />
                        <OptionQuestion
                          label="最容易出错的工作"
                          value={form.costStructure.errorProne}
                          options={["报价漏项或价格版本混乱。", "客户信息、需求和跟进记录容易漏。", "项目进度、交付节点和回款状态容易不同步。", "资料、案例、话术版本不统一，员工容易发错。"]}
                          onChange={(value) => updateNested("costStructure", "errorProne", value)}
                        />
                        <OptionQuestion
                          label="最影响销售成交的工作"
                          value={form.costStructure.salesBottleneck}
                          options={["客户看不懂价值，缺少有说服力的案例和素材。", "回复慢、报价慢，客户等待时间太长。", "销售话术不统一，新销售成交能力弱。", "线索质量不稳定，前端获客成本高。"]}
                          onChange={(value) => updateNested("costStructure", "salesBottleneck", value)}
                        />
                        <OptionQuestion
                          label="最希望降低的成本"
                          value={form.costStructure.costToReduce}
                          options={["降低获客和营销内容制作成本。", "降低销售跟进、报价和方案的人力成本。", "降低客服、售后和内部问答成本。", "降低项目管理、报表和重复录入成本。"]}
                          onChange={(value) => updateNested("costStructure", "costToReduce", value)}
                        />
                        <OptionQuestion
                          label="每周重复发生的工作"
                          value={form.costStructure.weeklyRecurring}
                          options={["每周整理销售线索和客户跟进。", "每周做报表、复盘和经营汇总。", "每周整理项目进度、交付问题和回款。", "每周产出营销内容、产品图或短视频。"]}
                          onChange={(value) => updateNested("costStructure", "weeklyRecurring", value)}
                        />
                      </>
                    )}

                    {step === 5 && (
                      <>
                        <OptionQuestion
                          label="最想用AI解决的第一个问题"
                          value={form.aiPlan.primaryProblem}
                          options={[
                            "先做一套AI营销素材，帮助销售获客和转化。",
                            "先做一个内部效率自动化工具，减少重复表格、报表和文档工作。",
                            "先做企业知识库 / 客服问答Demo，统一资料和话术。",
                            "先做轻量业务系统MVP，比如报价、CRM、项目管理或小程序。"
                          ]}
                          onChange={(value) => updateNested("aiPlan", "primaryProblem", value)}
                        />
                        <div className="grid gap-6 sm:grid-cols-3">
                          <SelectField label="希望多久看到第一个结果" value={form.aiPlan.timeToResult} options={RESULT_TIMELINES} onChange={(value) => updateNested("aiPlan", "timeToResult", value)} />
                          <SelectField label="第一阶段预算区间" value={form.aiPlan.budget} options={BUDGET_OPTIONS} onChange={(value) => updateNested("aiPlan", "budget", value)} />
                          <SelectField
                            label="是否接受先做MVP / 样品验证"
                            value={form.aiPlan.mvpAccepted}
                            options={["接受", "不确定", "希望直接做完整项目"]}
                            onChange={(value) => updateNested("aiPlan", "mvpAccepted", value as QuestionnaireData["aiPlan"]["mvpAccepted"])}
                          />
                        </div>
                        <OptionQuestion
                          label="你对AI最大的担心"
                          value={form.aiPlan.biggestConcern}
                          options={[
                            "担心做出来不能真正用，最后只是演示。",
                            "担心员工不会执行，工具落不了地。",
                            "担心数据安全和客户资料泄露。",
                            "担心预算花了但没有实际成交或效率提升。"
                          ]}
                          onChange={(value) => updateNested("aiPlan", "biggestConcern", value)}
                        />
                        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 text-xs leading-6 text-slate-400">
                          <p className="font-black text-slate-200">诊断服务授权与免责声明</p>
                          <p className="mt-2">
                            AI诊断结果是基于你选择的信息生成的初步方向建议，不等于正式咨询方案或投资建议。选择越接近真实情况，报告越准确。
                          </p>
                          <label className="mt-4 flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={agreed}
                              onChange={(event) => setAgreed(event.target.checked)}
                              className="mt-0.5 size-4 accent-cyan-300"
                            />
                            <span>
                              我已阅读并同意上述说明，确认所选信息真实有效。详见
                              <a href="/terms" target="_blank" className="mx-1 font-bold text-cyan-200 underline">服务条款</a>
                              和
                              <a href="/privacy" target="_blank" className="mx-1 font-bold text-cyan-200 underline">隐私政策</a>
                              。
                            </span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div role="alert" className="mt-7 flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                      <WarningCircle className="mt-0.5 shrink-0" size={18} weight="fill" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="mt-9 flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" className="ai-secondary-button" disabled={step === 0 || submitting} onClick={() => { setStep((current) => Math.max(current - 1, 0)); setError(""); }}>
                      <ArrowLeft size={17} />
                      上一步
                    </button>
                    {step < 5 ? (
                      <button type="button" className="ai-primary-button" onClick={nextStep}>
                        下一步
                        <ArrowRight size={17} />
                      </button>
                    ) : (
                      <button type="button" className="ai-primary-button min-w-44" disabled={submitting} onClick={submitDiagnosis}>
                        {submitting ? (
                          <>
                            <SpinnerGap className="animate-spin" size={18} />
                            AI分析中
                          </>
                        ) : (
                          <>
                            <Sparkle size={18} weight="fill" />
                            生成详细诊断报告
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-white/10 bg-white/[.045] p-8 shadow-[0_24px_80px_rgba(2,6,23,.22)] sm:p-10">
              <div className="text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-300/15 text-amber-200">
                  <LockKey size={32} weight="fill" />
                </span>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {generatedPreview?.companyName || form.companyName || "企业"} 的诊断报告已生成
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  AI已完成六大维度分析，支付 <strong className="text-white">¥{siteConfig.unlockPrice}</strong> 即可解锁完整诊断报告。
                </p>
              </div>
              {generatedPreview && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/45 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">免费预览</p>
                  <p className="mt-2 text-2xl font-black text-white">AI成熟度 {generatedPreview.maturityScore} / 100</p>
                  <p className="mt-1 text-sm font-bold text-cyan-200">{generatedPreview.maturityLevel}</p>
                  <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-7 text-slate-200">{generatedPreview.businessConclusion}</p>
                  <p className="mt-4 font-mono text-xs text-slate-400">报告编号：{generatedReportId}</p>
                </div>
              )}
              <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/[.06] p-6 text-white sm:p-8">
                <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
                  <div className="rounded-2xl border border-white/10 bg-white p-3 shadow-[0_18px_45px_rgba(34,211,238,.18)]">
                    <Image
                      src={siteConfig.contact.qrCodeUrl}
                      alt={`添加${siteConfig.contact.wechatId}微信解锁报告`}
                      width={420}
                      height={600}
                      className="h-auto w-full rounded-xl"
                      priority
                    />
                    <p className="mt-3 text-center text-xs font-bold text-slate-700">扫码添加微信</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-cyan-100">添加微信并支付后解锁</p>
                    <p className="mt-2 text-5xl font-black tracking-[-0.05em]">¥{siteConfig.unlockPrice}</p>
                    <p className="mt-5 text-sm leading-7 text-slate-200">
                      请先扫码添加微信 <strong className="text-white">{siteConfig.contact.wechatId}</strong>，
                      发送报告编号并支付{siteConfig.unlockPrice}元。管理员确认收款后，点击下方按钮即可查看完整报告。
                    </p>
                    <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/35 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">解锁流程</p>
                      <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                        <li>1. 扫码添加微信，备注“AI诊断报告”。</li>
                        <li>2. 发送报告编号：<span className="font-mono text-cyan-100">{generatedReportId}</span></li>
                        <li>3. 微信支付 ¥{siteConfig.unlockPrice} 后，等待管理员确认解锁。</li>
                      </ol>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button type="button" className="ai-primary-button" onClick={viewReportStatus}>
                        <Sparkle size={18} weight="fill" />
                        我已添加微信并付款，查看解锁状态
                      </button>
                      <button type="button" className="ai-secondary-button" onClick={() => setShowPaywall(false)}>
                        <ArrowLeft size={17} />
                        返回修改问卷
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-[28px] border border-white/10 bg-white/[.045] p-6 shadow-[0_24px_80px_rgba(2,6,23,.2)] backdrop-blur lg:sticky lg:top-[96px]">
          <div className="space-y-7">
            <div>
              <p className="text-sm font-black text-white">保存状态</p>
              <div className="mt-4 flex items-start gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-emerald-300/15 text-emerald-200">
                  <CheckCircle size={18} weight="fill" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">已自动保存</p>
                  <p className="mt-1 text-xs text-slate-500">{savedAt ? savedAt.toLocaleTimeString("zh-CN") : "等待首次保存"}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-7">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-white">整体完成度</p>
                <span className="text-sm font-black text-cyan-200">{completion}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300 transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
              <div className="mt-5 flex items-center gap-3 text-cyan-200">
                <Clock size={25} />
                <div>
                  <p className="text-lg font-black">约 5-8 分钟</p>
                  <p className="text-xs text-slate-500">选择越接近真实情况，报告越准确</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-7">
              <p className="text-sm font-black text-white">完整报告会包含</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {["企业AI成熟度评分", "业务流程与机会矩阵", "TOP3可执行AI项目", "7/30/90天落地路线", "ROI与回本周期", "推荐服务包与下一步"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle size={17} className="text-cyan-200" weight="fill" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-start gap-3 border-t border-white/10 pt-7 text-xs leading-5 text-slate-500">
              <LockKey size={17} className="mt-0.5 shrink-0" />
              <p>问卷自动保存在当前浏览器，生成后的报告会保存到服务器和登录账号下。</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
