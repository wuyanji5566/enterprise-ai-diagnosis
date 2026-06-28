"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { ResultReport } from "@/components/ResultReport";
import { SiteHeader } from "@/components/SiteHeader";
import type { DiagnosisReport } from "@/types/diagnosis";

type PageState =
  | { kind: "loading" }
  | { kind: "report"; report: DiagnosisReport }
  | { kind: "error"; message: string };

export default function AdminReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<PageState>({ kind: "loading" });

  useEffect(() => {
    async function loadReport() {
      try {
        const response = await fetch(
          `/api/admin/reports/${encodeURIComponent(params.id)}`,
          { cache: "no-store" }
        );
        if (response.status === 401) {
          router.replace(`/admin/login?redirect=/admin/reports/${encodeURIComponent(params.id)}`);
          return;
        }
        const data = (await response.json()) as {
          report?: DiagnosisReport;
          error?: string;
        };
        if (!response.ok || !data.report) {
          throw new Error(data.error || "读取报告失败。");
        }
        setState({ kind: "report", report: data.report });
      } catch (error) {
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "读取报告失败。"
        });
      }
    }

    void loadReport();
  }, [params.id, router]);

  if (state.kind === "loading") {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50/70 px-5">
          <div className="surface-card flex items-center gap-3 p-6 text-sm font-bold text-slate-600">
            <SpinnerGap size={18} className="animate-spin text-brand" />
            正在读取报告
          </div>
        </main>
      </>
    );
  }

  if (state.kind === "error") {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50/70 px-5">
          <div className="surface-card max-w-xl p-8 text-center">
            <WarningCircle size={34} className="mx-auto text-red-500" weight="fill" />
            <h1 className="mt-4 text-2xl font-black text-ink">报告读取失败</h1>
            <p className="mt-3 text-sm leading-6 text-red-600">{state.message}</p>
            <Link href="/admin" className="secondary-button mt-6">
              <ArrowLeft size={17} />
              返回后台
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-[60] border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="page-shell flex min-h-14 items-center justify-between gap-3 py-2">
          <Link href="/admin" className="secondary-button min-h-10 px-4 py-2">
            <ArrowLeft size={17} />
            返回后台
          </Link>
          <p className="text-xs font-bold text-slate-400">管理员查看完整报告</p>
        </div>
      </div>
      <ResultReport report={state.report} />
    </>
  );
}
