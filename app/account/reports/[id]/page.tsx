"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, LockKey, SpinnerGap } from "@phosphor-icons/react";
import { ContactCard } from "@/components/ContactCard";
import { ResultReport } from "@/components/ResultReport";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import type { DiagnosisReport, DiagnosisReportPreview } from "@/types/diagnosis";

type State =
  | { kind: "loading" }
  | { kind: "report"; report: DiagnosisReport }
  | { kind: "locked"; preview: DiagnosisReportPreview }
  | { kind: "error"; message: string };

export default function AccountReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/user/reports/${encodeURIComponent(params.id)}`, {
          cache: "no-store"
        });
        const data = (await response.json()) as {
          status?: "locked" | "unlocked";
          preview?: DiagnosisReportPreview;
          report?: DiagnosisReport;
          error?: string;
        };
        if (response.status === 401) {
          router.replace(`/login?next=/account/reports/${encodeURIComponent(params.id)}`);
          return;
        }
        if (!response.ok) throw new Error(data.error || "读取报告失败");
        if (data.status === "unlocked" && data.report) {
          setState({ kind: "report", report: data.report });
          return;
        }
        if (data.status === "locked" && data.preview) {
          setState({ kind: "locked", preview: data.preview });
          return;
        }
        throw new Error("报告状态异常");
      } catch (cause) {
        setState({
          kind: "error",
          message: cause instanceof Error ? cause.message : "读取报告失败"
        });
      }
    }
    void load();
  }, [params.id, router]);

  if (state.kind === "report") {
    return <ResultReport report={state.report} />;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-72px)] bg-slate-50/70 py-12 sm:py-16">
        <div className="page-shell">
          <div className="mx-auto max-w-4xl">
            <Link href="/account" className="secondary-button mb-6">
              <ArrowLeft size={17} />
              返回我的报告
            </Link>

            {state.kind === "loading" ? (
              <section className="surface-card flex items-center gap-3 p-8 text-slate-500">
                <SpinnerGap size={20} className="animate-spin" />
                正在读取报告...
              </section>
            ) : state.kind === "error" ? (
              <section className="surface-card p-8 text-red-600">{state.message}</section>
            ) : (
              <>
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
                      这份报告已经保存到你的账号。管理员确认收款并解锁后，
                      你重新打开“我的报告”即可查看完整报告。
                    </p>
                  </div>
                </section>
                <div className="mt-8">
                  <ContactCard
                    title={`添加微信，支付¥${siteConfig.unlockPrice}解锁报告`}
                    description={`添加后请发送报告编号：${params.id}`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
