"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Copy,
  LockKey,
  SpinnerGap
} from "@phosphor-icons/react";
import type { StoredReportSummary } from "@/lib/report-storage";

export function ReportUnlockPanel() {
  const [reports, setReports] = useState<StoredReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/reports", { cache: "no-store" });
      const data = (await response.json()) as {
        reports?: StoredReportSummary[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "读取报告失败。");
      setReports(data.reports ?? []);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "读取报告失败。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  async function unlock(id: string, companyName: string) {
    if (!window.confirm(`确认已收到 ${companyName} 的99元报告费用，并立即解锁？`)) {
      return;
    }

    setWorkingId(id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/reports/${encodeURIComponent(id)}/unlock`,
        { method: "POST" }
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "解锁失败。");
      await loadReports();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "解锁失败。");
    } finally {
      setWorkingId("");
    }
  }

  async function copyReportId(id: string) {
    await navigator.clipboard.writeText(id);
  }

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-ink">报告收款与解锁</h2>
          <p className="mt-1 text-sm text-slate-500">
            客户付款后核对报告编号，再执行解锁。解锁后不可撤销。
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={loadReports}>
          刷新列表
        </button>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
          <SpinnerGap size={18} className="animate-spin" />
          正在读取报告
        </div>
      ) : reports.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">暂无诊断报告</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">企业 / 报告编号</th>
                <th className="px-6 py-4">生成时间</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">解锁时间</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-5">
                    <p className="font-bold text-ink">{report.companyName}</p>
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-brand"
                      onClick={() => copyReportId(report.id)}
                    >
                      {report.id}
                      <Copy size={13} />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-slate-500">
                    {new Date(report.createdAt).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-6 py-5">
                    {report.status === "unlocked" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle size={14} weight="fill" />
                        已解锁
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                        <LockKey size={14} weight="fill" />
                        待付款
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-slate-500">
                    {report.unlockedAt ? (
                      new Date(report.unlockedAt).toLocaleString("zh-CN")
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Clock size={14} />
                        尚未解锁
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      type="button"
                      className="primary-button ml-auto"
                      disabled={report.status === "unlocked" || workingId === report.id}
                      onClick={() => unlock(report.id, report.companyName)}
                    >
                      {workingId === report.id ? (
                        <SpinnerGap size={17} className="animate-spin" />
                      ) : (
                        <LockKey size={17} />
                      )}
                      {report.status === "unlocked" ? "已完成" : "确认收款并解锁"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
