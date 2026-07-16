"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Gauge,
  Info,
  Printer,
  RocketLaunch,
  ShareNetwork,
  Warning
} from "@phosphor-icons/react";
import { ContactCard } from "@/components/ContactCard";
import { ConsultationForm } from "@/components/ConsultationForm";
import { RoiCard } from "@/components/RoiCard";
import { reportToMarkdown } from "@/lib/report";
import { reportTypeLabels, siteConfig } from "@/lib/site-config";
import type { DiagnosisReport } from "@/types/diagnosis";

function copyText(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const succeeded = document.execCommand("copy");
  document.body.removeChild(textarea);
  return succeeded;
}

export function ResultReport({ report }: { report: DiagnosisReport }) {
  const [copied, setCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  async function copyReport() {
    const markdown = reportToMarkdown(report);
    try {
      let succeeded = copyText(markdown);
      if (!succeeded && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(markdown);
        succeeded = true;
      }
      if (!succeeded) throw new Error("copy failed");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("请复制以下报告内容：", markdown);
    }
  }

  async function copyReferral() {
    const text =
      "我刚做了一份企业AI诊断报告，可以帮企业判断适合先做AI营销、效率自动化、知识库、业务系统还是团队AI陪跑。你也可以免费体验一次初步诊断。";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      copyText(text);
    }
    setReferralCopied(true);
    window.setTimeout(() => setReferralCopied(false), 1800);
  }

  const workflow = [
    ["获客", report.workflowAnalysis.acquisition],
    ["转化", report.workflowAnalysis.conversion],
    ["交付", report.workflowAnalysis.delivery],
    ["管理", report.workflowAnalysis.management]
  ];
  const roadmap = [
    ["7天可做", report.implementationRoadmap.sevenDays, "bg-emerald-500"],
    ["30天可做", report.implementationRoadmap.thirtyDays, "bg-brand"],
    ["90天可做", report.implementationRoadmap.ninetyDays, "bg-violet-500"],
    ["暂不建议", report.implementationRoadmap.notRecommended, "bg-slate-400"]
  ] as const;

  return (
    <main className="report-page bg-slate-50/70">
      <div className="page-shell py-10 sm:py-14">
        <section className="print-cover hidden">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.22em] text-brand">
              Enterprise AI Diagnosis
            </p>
            <h1 className="mt-16 text-5xl font-black leading-tight text-ink">
              《{report.companyName || "企业AI落地"} AI落地诊断报告》
            </h1>
            <p className="mt-6 text-xl text-slate-600">
              企业AI成熟度、机会识别与落地项目建议
            </p>
          </div>
          <dl className="grid gap-5 border-t border-slate-300 pt-8 text-sm">
            <div><dt>企业名称</dt><dd>{report.companyName || "未填写企业名称"}</dd></div>
            <div><dt>诊断日期</dt><dd>{new Date(report.generatedAt).toLocaleDateString("zh-CN")}</dd></div>
            <div><dt>报告类型</dt><dd>{reportTypeLabels[report.reportType]}</dd></div>
            <div><dt>出品方</dt><dd>{siteConfig.brandName}</dd></div>
          </dl>
        </section>

        <div className="print-hide flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Enterprise AI Diagnosis Report
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              {report.companyName} AI诊断报告
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              {reportTypeLabels[report.reportType]} · 生成于{" "}
              {new Date(report.generatedAt).toLocaleString("zh-CN")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {report.reportType === "free" && (
              <Link href="/diagnosis" className="secondary-button">
                ¥99解锁完整报告
              </Link>
            )}
            <Link href="/diagnosis" className="secondary-button">
              <ArrowLeft size={17} />
              修改问卷
            </Link>
            <button type="button" className="primary-button" onClick={copyReport}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "已复制" : "复制报告"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => window.print()}
            >
              <Printer size={18} />
              生成PDF报告
            </button>
          </div>
        </div>

        <section className="mt-9 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,.08)] lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col justify-between bg-ink p-8 text-white sm:p-10">
            <div>
              <p className="text-sm font-semibold text-blue-200">企业AI成熟度</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-7xl font-black tracking-[-0.06em]">
                  {report.maturityScore}
                </span>
                <span className="mb-2 text-lg text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="mt-10">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-blue-100">
                {report.maturityLevel}
              </span>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-blue-400"
                  style={{ width: `${report.maturityScore}%` }}
                />
              </div>
            </div>
          </div>
          <div className="p-8 sm:p-10 lg:p-12">
            <p className="text-sm font-bold text-brand">一句话商业结论</p>
            <p className="mt-4 max-w-4xl text-xl font-bold leading-9 tracking-tight text-ink sm:text-2xl">
              {report.businessConclusion}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["客户适配等级", report.clientFitLevel],
                ["项目紧迫度", report.salesInsight.urgency],
                ["预算信号", report.salesInsight.budgetSignal],
                ["资料完整度", report.salesInsight.dataReadiness]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {report.executiveSummary && (
          <section className="mt-7 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-[0_20px_60px_rgba(37,99,235,.08)]">
            <div className="border-b border-blue-100 bg-blue-50/70 px-7 py-5 sm:px-9">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">EXECUTIVE BRIEF</p>
              <h2 className="mt-2 text-xl font-black text-ink">给企业负责人的决策摘要</h2>
            </div>
            <p className="px-7 py-7 text-base font-semibold leading-8 text-slate-700 sm:px-9 sm:py-8">
              {report.executiveSummary}
            </p>
          </section>
        )}

        <section className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-7 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Info size={23} weight="duotone" />
            </span>
            <div>
              <h2 className="text-xl font-black text-amber-950">当前不建议你盲目做大系统</h2>
              <p className="mt-3 text-sm leading-7 text-amber-900">
                {report.clientFitReason} 当前更稳妥的路径是先完成资料整理与样品验证，用7天或30天证明业务价值，再决定是否进入ERP、小程序或完整AI系统建设。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7 surface-card p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <Gauge size={23} weight="duotone" />
            </span>
            <div>
              <h2 className="text-lg font-black text-ink">AI机会评分矩阵</h2>
              <p className="text-sm text-slate-500">按具体业务区域评估落地条件</p>
            </div>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {report.opportunityMatrix.map((item) => (
              <article key={item.area} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-ink">{item.area}</h3>
                  <span className="text-xl font-black text-brand">{item.totalScore}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["重复性", item.repeatability],
                    ["标准化", item.standardization],
                    ["数据基础", item.dataReadiness],
                    ["ROI潜力", item.roiPotential]
                  ].map(([label, score]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">{label as string}</span>
                        <span className="font-bold text-slate-700">{score as number}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-5 text-slate-500">{item.explanation}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-5">
            <h2 className="text-xl font-black text-ink">业务流程分析</h2>
            <p className="mt-1 text-sm text-slate-500">从获客到管理的四条业务链路</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map(([stage, content], index) => (
              <article key={stage} className="surface-card p-6">
                <span className="font-mono text-xs font-bold text-brand">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-black text-ink">{stage}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{content}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-7 surface-card p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <RocketLaunch size={23} weight="duotone" />
            </span>
            <div>
              <h2 className="text-lg font-black text-ink">TOP3 AI项目建议</h2>
              <p className="text-sm text-slate-500">按价值、速度和实施风险综合排序</p>
            </div>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {report.topProjects.map((project, index) => (
              <article key={project.name} className="rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    Top {index + 1} · {project.category}
                  </span>
                  <span className="tag bg-slate-100 text-slate-600">{project.difficulty}</span>
                </div>
                <h3 className="mt-4 text-xl font-black tracking-tight text-ink">
                  {project.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{project.reason}</p>
                <ol className="mt-5 space-y-3">
                  {project.steps.map((item, stepIndex) => (
                    <li key={item} className="flex gap-3 text-sm leading-5 text-slate-700">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
                        {stepIndex + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
                <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
                  {project.expectedOutcome}
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-5 text-xs">
                  <div>
                    <dt className="font-bold text-slate-400">周期</dt>
                    <dd className="mt-1 font-bold text-slate-700">{project.estimatedCycle}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-400">建议预算</dt>
                    <dd className="mt-1 font-bold text-slate-700">{project.recommendedBudget}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-amber-700">
                  <Warning size={16} className="mt-0.5 shrink-0" weight="fill" />
                  {project.risk}
                </div>
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800">
                  <strong>样品验证：</strong>
                  {project.sampleValidationSuggestion}
                </div>
                <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-4 text-xs leading-5 text-violet-800">
                  <p><strong>建议负责人：</strong>{project.suggestedOwner || "由业务负责人牵头，销售/运营共同参与。"}</p>
                  <p className="mt-2 font-bold">验收指标</p>
                  <ul className="mt-1 space-y-1">
                    {(project.acceptanceMetrics?.length ? project.acceptanceMetrics : ["明确样品使用范围与责任人", "以业务效率或转化指标完成首轮验证"]).map((metric) => (
                      <li key={metric}>· {metric}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-xl font-black text-ink">AI落地路线图</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roadmap.map(([title, items, tone]) => (
              <article key={title} className="surface-card p-6">
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${tone}`} />
                  <h3 className="font-black text-ink">{title}</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                  {items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-7">
          <RoiCard roi={report.roiAnalysis} />
        </div>

        <section className="mt-7 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-[0_20px_60px_rgba(37,99,235,.08)]">
          <div className="grid lg:grid-cols-[1fr_360px]">
            <div className="p-8 sm:p-10">
              <span className="eyebrow">RECOMMENDED SERVICE</span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-ink">
                {report.recommendedServicePackage.name}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                {report.recommendedServicePackage.reason}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {report.recommendedServicePackage.deliverables.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    <Check size={15} className="text-brand" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
                <span className="tag">{report.recommendedServicePackage.referenceBudget}</span>
                <span className="tag bg-slate-100 text-slate-600">
                  {report.recommendedServicePackage.requiresPrivateQuote
                    ? "需要私人报价"
                    : "可按参考价启动"}
                </span>
              </div>
            </div>
            <div className="bg-brand p-8 text-white sm:p-10">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                建议下一步
              </p>
              <p className="mt-4 text-lg font-black leading-8">
                {report.recommendedServicePackage.suggestedNextStep}
              </p>
              <p className="mt-6 text-sm leading-7 text-blue-100">
                最佳转化路径：{report.salesInsight.bestConversionPath}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7 surface-card p-7 sm:p-8">
          <h2 className="text-xl font-black text-ink">报价前需要补充的资料</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            资料越完整，报价范围、周期和验收标准越准确。
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {report.preQuoteRequiredMaterials.map((item) => (
              <div key={item.materialName} className="rounded-xl border border-slate-200 p-5">
                <p className="font-bold text-ink">{item.materialName}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7 surface-card p-7 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <ShareNetwork size={23} weight="duotone" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-black text-ink">企业AI诊断推荐权益</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                本报告附赠一次「企业AI诊断推荐权益」。你可以邀请一位同样有企业数字化、AI落地、营销增长或效率自动化需求的企业朋友，免费体验一次企业AI初步诊断。
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                推荐成功后，若对方解锁完整诊断报告或进入后续项目服务，你将获得一次免费报告升级或专项方案解读权益。
              </p>
              <button
                type="button"
                className="print-hide secondary-button mt-5"
                onClick={copyReferral}
              >
                {referralCopied ? <Check size={17} /> : <Copy size={17} />}
                {referralCopied ? "推荐说明已复制" : "复制推荐说明"}
              </button>
            </div>
          </div>
        </section>

        <section className="print-only-note mt-7 rounded-2xl border border-slate-200 bg-white p-7">
          <h2 className="font-black text-ink">隐私说明</h2>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            本报告仅用于企业AI项目初步判断。企业资料不会未经允许公开展示或作为公开案例；正式落地方案仍需结合人工访谈、资料基础与预算进一步确认。
          </p>
        </section>

        <section className="print-hide mt-7" id="wechat-contact">
          <ContactCard
            title="添加微信，申请报告解锁或样品验证"
            description="如果你需要解锁完整诊断报告（¥99）、人工解读、样品验证或私人报价，可复制微信号继续沟通。"
          />
        </section>

        <section
          id="consultation"
          className="print-hide mt-7 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-10 lg:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                NEXT ACTION
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight">
                选择最适合你的下一步
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                留下联系方式，当前MVP会把预约保存到本地线索后台，方便后续跟进和演示完整成交闭环。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#consultation-form" className="primary-button bg-white text-brand hover:bg-blue-50">
                  申请样品验证
                </a>
                <a href="#consultation-form" className="secondary-button">
                  预约深度沟通
                </a>
                <button type="button" className="secondary-button" onClick={copyReport}>
                  <Copy size={17} />
                  {copied ? "已复制报告" : "复制诊断报告"}
                </button>
              </div>
            </div>
            <div id="consultation-form">
              <ConsultationForm report={report} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
