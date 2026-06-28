"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ClipboardText,
  LockKey,
  SpinnerGap
} from "@phosphor-icons/react";
import { ContactCard } from "@/components/ContactCard";
import { ResultReport } from "@/components/ResultReport";
import { SiteHeader } from "@/components/SiteHeader";
import { DEMO_REPORT } from "@/lib/demo-report";
import { STORAGE_KEYS } from "@/lib/constants";
import { siteConfig } from "@/lib/site-config";
import type {
  DiagnosisReport,
  DiagnosisReportPreview
} from "@/types/diagnosis";

function normalizeReport(report: DiagnosisReport): DiagnosisReport {
  return {
    ...report,
    reportType: report.reportType ?? "free",
    clientFitLevel: report.clientFitLevel ?? "C类客户",
    clientFitReason:
      report.clientFitReason ?? "当前信息仍需人工复核，建议先补充资料并进行小范围验证。",
    topProjects: report.topProjects.map((project) => ({
      ...project,
      sampleValidationSuggestion:
        project.sampleValidationSuggestion ?? "先做一个7天可演示样品，确认流程与验收指标。"
    })),
    recommendedServicePackage: {
      ...report.recommendedServicePackage,
      referenceBudget: report.recommendedServicePackage.referenceBudget ?? "诊断后报价",
      requiresPrivateQuote:
        report.recommendedServicePackage.requiresPrivateQuote ?? true
    },
    preQuoteRequiredMaterials: report.preQuoteRequiredMaterials ?? [
      { materialName: "业务流程资料", reason: "用于确认项目范围与实施边界。" },
      { materialName: "现有样本", reason: "用于评估数据质量和样品可行性。" },
      { materialName: "验收目标", reason: "用于定义阶段性交付标准。" }
    ],
    salesInsight: {
      ...report.salesInsight,
      dataReadiness: report.salesInsight.dataReadiness ?? "弱",
      nextAction: report.salesInsight.nextAction ?? "深度诊断"
    }
  };
}

type PageState =
  | { kind: "loading" }
  | { kind: "report"; report: DiagnosisReport }
  | { kind: "locked"; preview: DiagnosisReportPreview; reportId: string }
  | { kind: "empty" }
  | { kind: "error"; message: string };

export default function ResultPage() {
  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [wechatConfirmed, setWechatConfirmed] = useState(false);

  const loadReport = useCallback(async () => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      setState({ kind: "report", report: normalizeReport(DEMO_REPORT) });
      return;
    }

    const reportId = window.localStorage.getItem(STORAGE_KEYS.reportId);
    const accessToken = window.localStorage.getItem(STORAGE_KEYS.reportAccessToken);

    if (reportId && accessToken) {
      try {
        const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store"
        });
        const data = (await response.json()) as {
          status?: "locked" | "unlocked";
          preview?: DiagnosisReportPreview;
          report?: DiagnosisReport;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "读取报告失败。");
        }
        if (data.status === "unlocked" && data.report) {
          const report = normalizeReport(data.report);
          window.localStorage.setItem(STORAGE_KEYS.report, JSON.stringify(report));
          window.localStorage.setItem(STORAGE_KEYS.reportType, "paid99");
          window.localStorage.setItem(STORAGE_KEYS.paidUnlock, "true");
          setState({ kind: "report", report });
          return;
        }
        if (data.status === "locked" && data.preview) {
          setState({ kind: "locked", preview: data.preview, reportId });
          return;
        }
      } catch (error) {
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "读取报告失败。"
        });
        return;
      }
    }

    setState({ kind: "empty" });
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  async function refreshUnlockStatus() {
    setRefreshing(true);
    await loadReport();
    setRefreshing(false);
  }

  return (
    <>
      <SiteHeader />
      {state.kind === "report" ? (
        <ResultReport report={state.report} />
      ) : state.kind === "locked" ? (
        <main className="min-h-[calc(100vh-72px)] bg-slate-50/70 py-12 sm:py-16">
          <div className="page-shell">
            <div className="mx-auto max-w-4xl">
              <section className="surface-card overflow-hidden">
                <div className="bg-ink p-8 text-white sm:p-10">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100">
                    <LockKey size={15} weight="fill" />
                    完整报告待解锁
                  </span>
                  <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
                    {state.preview.companyName} AI诊断报告
                  </h1>
                  <div className="mt-8 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
                    <div>
                      <p className="text-sm text-slate-400">AI成熟度</p>
                      <p className="mt-2 text-6xl font-black">
                        {state.preview.maturityScore}
                        <span className="ml-1 text-base text-slate-400">/100</span>
                      </p>
                      <p className="mt-2 text-sm font-bold text-blue-300">
                        {state.preview.maturityLevel}
                      </p>
                    </div>
                    <div className="border-t border-white/15 pt-5 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
                      <p className="text-xs font-bold text-blue-300">一句话商业结论</p>
                      <p className="mt-3 text-base font-semibold leading-8 text-slate-100">
                        {state.preview.businessConclusion}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 sm:p-10">
                  <h2 className="text-2xl font-black text-ink">
                    支付 ¥{siteConfig.unlockPrice} 解锁完整报告
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    添加微信并发送下方报告编号。管理员确认收款后，点击“刷新解锁状态”即可查看TOP3项目、ROI、路线图并生成PDF。
                  </p>
                  <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-400">报告编号</p>
                    <p className="mt-2 break-all font-mono text-sm font-black text-ink">
                      {state.reportId}
                    </p>
                  </div>
                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-left">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 rounded border-slate-300 text-brand"
                      checked={wechatConfirmed}
                      onChange={(event) => setWechatConfirmed(event.target.checked)}
                    />
                    <span className="text-sm font-semibold leading-6 text-slate-700">
                      我已添加微信 {siteConfig.contact.wechatId}，并发送上方报告编号。
                      管理员确认后再刷新解锁状态。
                    </span>
                  </label>
                  <button
                    type="button"
                    className="primary-button mt-6 w-full"
                    disabled={refreshing || !wechatConfirmed}
                    onClick={refreshUnlockStatus}
                  >
                    {refreshing ? (
                      <SpinnerGap size={18} className="animate-spin" />
                    ) : (
                      <LockKey size={18} weight="fill" />
                    )}
                    {refreshing ? "正在查询" : "我已付款，刷新解锁状态"}
                  </button>
                </div>
              </section>
              <div className="mt-8">
                <ContactCard
                  title={`添加微信，支付¥${siteConfig.unlockPrice}解锁报告`}
                  description={`添加后请发送报告编号：${state.reportId}`}
                />
              </div>
            </div>
          </div>
        </main>
      ) : state.kind === "error" ? (
        <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-2xl items-center px-5 py-16">
          <div className="surface-card w-full p-8 text-center sm:p-12">
            <h1 className="text-2xl font-black text-ink">报告读取失败</h1>
            <p className="mt-3 text-sm leading-6 text-red-600">{state.message}</p>
            <button className="primary-button mt-7" onClick={refreshUnlockStatus}>
              重新读取
            </button>
          </div>
        </main>
      ) : state.kind === "empty" ? (
        <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-2xl items-center px-5 py-16">
          <div className="surface-card w-full p-8 text-center sm:p-12">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
              <ClipboardText size={28} weight="duotone" />
            </span>
            <h1 className="mt-6 text-2xl font-black text-ink">还没有诊断报告</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              请先完成六步问卷并生成企业AI诊断报告。
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/diagnosis" className="primary-button">
                <ArrowLeft size={17} />
                开始诊断
              </Link>
              <Link href="/result?demo=1" className="secondary-button">
                查看演示报告
              </Link>
            </div>
          </div>
        </main>
      ) : null}
    </>
  );
}
