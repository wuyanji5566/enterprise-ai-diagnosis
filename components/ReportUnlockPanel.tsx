"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Copy,
  Eye,
  LockKey,
  SpinnerGap,
  WarningCircle
} from "@phosphor-icons/react";
import type { StoredReportSummary } from "@/lib/report-storage";
import type { DiagnosisRequestAdminSummary } from "@/lib/diagnosis-request-storage";

export function ReportUnlockPanel() {
  const [requests, setRequests] = useState<DiagnosisRequestAdminSummary[]>([]);
  const [reports, setReports] = useState<StoredReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [requestResponse, reportResponse] = await Promise.all([
        fetch("/api/admin/diagnosis-requests", { cache: "no-store" }),
        fetch("/api/admin/reports", { cache: "no-store" })
      ]);
      const requestData = (await requestResponse.json()) as {
        requests?: DiagnosisRequestAdminSummary[];
        error?: string;
      };
      const reportData = (await reportResponse.json()) as {
        reports?: StoredReportSummary[];
        error?: string;
      };
      if (!requestResponse.ok) throw new Error(requestData.error || "读取待确认诊断失败。");
      if (!reportResponse.ok) throw new Error(reportData.error || "读取报告列表失败。");
      setRequests(requestData.requests ?? []);
      setReports(reportData.reports ?? []);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "读取后台数据失败。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function confirmAndGenerate(id: string, companyName: string) {
    if (!window.confirm("确认已与“" + companyName + "”完成微信沟通，并开始生成完整诊断报告？")) {
      return;
    }
    setWorkingId(id);
    setError("");
    try {
      const response = await fetch(
        "/api/admin/diagnosis-requests/" + encodeURIComponent(id) + "/confirm",
        { method: "POST" }
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "报告生成失败。");
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "报告生成失败。");
      await loadData();
    } finally {
      setWorkingId("");
    }
  }

  async function copyId(id: string) {
    await navigator.clipboard.writeText(id);
  }

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">CONSULTANT QUEUE</span>
          <h2 className="mt-3 text-xl font-black text-ink">微信确认与报告生成</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            用户提交后会停留在确认页。你确认沟通后点击生成，用户页面会自动打开完整报告。
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadData()}>
          刷新列表
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
          <SpinnerGap size={18} className="animate-spin" />
          正在读取待确认诊断
        </div>
      ) : (
        <>
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
            <p className="text-sm font-black text-ink">待确认诊断（{requests.length}）</p>
          </div>
          {requests.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">暂时没有新的企业诊断提交。</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((item) => {
                const isWorking = workingId === item.id || item.status === "generating";
                const canGenerate = item.status === "pending_contact" || item.status === "failed";
                const label =
                  item.status === "unlocked"
                    ? "已完成"
                    : item.status === "generating"
                      ? "生成中"
                      : item.status === "failed"
                        ? "可重试"
                        : "待确认";

                return (
                  <article key={item.id} className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-black text-ink">{item.companyName}</h3>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {item.industry}
                        </span>
                        <span className={
                          "rounded-full px-3 py-1 text-xs font-bold " +
                          (item.status === "unlocked"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "failed"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700")
                        }>
                          {label}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-slate-400 hover:text-brand"
                        onClick={() => void copyId(item.id)}
                      >
                        {item.id}
                        <Copy size={13} />
                      </button>
                      <p className="mt-2 text-xs text-slate-400">
                        提交于 {new Date(item.submittedAt).toLocaleString("zh-CN")}
                      </p>
                      {item.failureMessage && (
                        <p className="mt-3 max-w-xl rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                          上次生成失败：{item.failureMessage}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {item.status === "unlocked" && item.reportId && (
                        <Link href={"/admin/reports/" + encodeURIComponent(item.reportId)} className="secondary-button min-h-10 px-4 py-2">
                          <Eye size={17} />
                          查看报告
                        </Link>
                      )}
                      <button
                        type="button"
                        className="primary-button min-h-10 px-4 py-2"
                        disabled={!canGenerate || isWorking}
                        onClick={() => void confirmAndGenerate(item.id, item.companyName)}
                      >
                        {isWorking ? <SpinnerGap size={17} className="animate-spin" /> : <LockKey size={17} />}
                        {item.status === "failed" ? "重新生成报告" : item.status === "generating" ? "正在生成" : item.status === "unlocked" ? "已完成" : "确认并生成报告"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="border-b border-t border-slate-200 bg-slate-50/70 px-6 py-4">
            <p className="text-sm font-black text-ink">历史报告（{reports.length}）</p>
          </div>
          <div className="divide-y divide-slate-100">
            {reports.slice(0, 8).map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-bold text-ink">{report.companyName}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(report.createdAt).toLocaleString("zh-CN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    {report.status === "unlocked" ? <CheckCircle size={15} weight="fill" className="text-emerald-600" /> : <Clock size={15} />}
                    {report.status === "unlocked" ? "已解锁" : "待解锁"}
                  </span>
                  <Link href={"/admin/reports/" + encodeURIComponent(report.id)} className="secondary-button min-h-9 px-3 py-1.5 text-xs">
                    查看
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
