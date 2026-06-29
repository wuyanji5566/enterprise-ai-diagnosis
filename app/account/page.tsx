"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardText,
  LockKey,
  SignOut,
  SpinnerGap
} from "@phosphor-icons/react";
import { SiteHeader } from "@/components/SiteHeader";
import type { DiagnosisReportPreview } from "@/types/diagnosis";

type User = {
  id: string;
  email: string;
  name: string;
};

type UserReport = {
  id: string;
  companyName: string;
  status: "locked" | "unlocked";
  reportType: string;
  createdAt: string;
  unlockedAt: string | null;
  preview: DiagnosisReportPreview;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const meResponse = await fetch("/api/user/me", { cache: "no-store" });
        const meData = (await meResponse.json()) as { user: User | null };
        if (!meData.user) {
          router.replace("/login?next=/account");
          return;
        }
        setUser(meData.user);

        const reportResponse = await fetch("/api/user/reports", { cache: "no-store" });
        const reportData = (await reportResponse.json()) as {
          reports?: UserReport[];
          error?: string;
        };
        if (!reportResponse.ok) throw new Error(reportData.error || "读取报告失败");
        setReports(reportData.reports ?? []);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "读取账号信息失败");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  async function logout() {
    await fetch("/api/user/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-72px)] bg-slate-50/70 py-12 sm:py-16">
        <div className="page-shell">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <span className="eyebrow">MY REPORTS</span>
                <h1 className="mt-5 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                  我的企业AI诊断报告
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  {user ? `${user.name || user.email}，这里会保存你登录后生成的报告。` : "正在读取账号信息..."}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/diagnosis" className="primary-button">
                  生成新报告
                  <ArrowRight size={17} />
                </Link>
                <button type="button" className="secondary-button" onClick={logout}>
                  <SignOut size={17} />
                  退出
                </button>
              </div>
            </div>

            {loading ? (
              <div className="surface-card mt-10 flex items-center gap-3 p-8 text-slate-500">
                <SpinnerGap size={20} className="animate-spin" />
                正在读取报告...
              </div>
            ) : error ? (
              <div className="surface-card mt-10 p-8 text-red-600">{error}</div>
            ) : reports.length === 0 ? (
              <div className="surface-card mt-10 p-8 text-center sm:p-12">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <ClipboardText size={28} weight="duotone" />
                </span>
                <h2 className="mt-5 text-2xl font-black text-ink">还没有保存的报告</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  请先登录账号，再完成AI诊断。生成后的报告会自动出现在这里。
                </p>
                <Link href="/diagnosis" className="primary-button mt-7">
                  开始AI诊断
                </Link>
              </div>
            ) : (
              <div className="mt-10 grid gap-5">
                {reports.map((report) => (
                  <article key={report.id} className="surface-card p-6">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                              report.status === "unlocked"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <LockKey size={13} weight="fill" />
                            {report.status === "unlocked" ? "已解锁" : "待解锁"}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(report.createdAt).toLocaleString("zh-CN")}
                          </span>
                        </div>
                        <h2 className="mt-3 text-xl font-black text-ink">
                          {report.companyName}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          成熟度 {report.preview.maturityScore}/100 ·{" "}
                          {report.preview.maturityLevel}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {report.preview.businessConclusion}
                        </p>
                      </div>
                      <Link
                        href={`/account/reports/${encodeURIComponent(report.id)}`}
                        className="secondary-button shrink-0"
                      >
                        查看报告
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
