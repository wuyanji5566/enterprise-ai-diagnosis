"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { LeadTable } from "@/components/LeadTable";
import { ReportUnlockPanel } from "@/components/ReportUnlockPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MOCK_LEADS } from "@/lib/lead-factory";
import type { LeadRecord, LeadStatus } from "@/types/lead";

type AdminState = "loading" | "authenticated" | "unauthenticated" | "error";

export default function AdminPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AdminState>("loading");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [dataState, setDataState] = useState<"loading" | "ready" | "empty" | "error">("loading");

  // 认证检查 + 数据加载
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/leads");
        if (res.status === 401) {
          setAuthState("unauthenticated");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch leads");
        const data = await res.json();
        setAuthState("authenticated");

        if (data.leads && data.leads.length > 0) {
          setLeads(data.leads);
          setDataState("ready");
        } else {
          setLeads(MOCK_LEADS); // 空数据库时显示示例
          setDataState("empty");
        }
      } catch {
        setAuthState("error");
        setDataState("error");
      }
    }
    init();
  }, []);

  // 线索字段更新
  const handleUpdateField = useCallback(
    async (id: string, field: string, value: unknown) => {
      // 乐观更新
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
      );
      try {
        await fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, value })
        });
      } catch {
        // 回滚：重新加载
        const res = await fetch("/api/leads");
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads);
        }
      }
    },
    []
  );

  const handleUpdateStatus = useCallback(
    async (id: string, status: string) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: status as LeadStatus } : l))
      );
      try {
        await fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        });
      } catch {
        const res = await fetch("/api/leads");
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads);
        }
      }
    },
    []
  );

  const handleUpdateNote = useCallback(
    async (id: string, note: string) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, note } : l))
      );
      try {
        await fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note })
        });
      } catch {
        const res = await fetch("/api/leads");
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads);
        }
      }
    },
    []
  );

  const handleExportCSV = useCallback(async () => {
    try {
      const res = await fetch("/api/leads/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败，请稍后重试。");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }, [router]);

  // 未认证状态
  if (authState === "unauthenticated") {
    router.replace("/admin/login");
    return null;
  }

  // 加载状态
  if (authState === "loading" || dataState === "loading") {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-slate-50/70 py-12 sm:py-16">
          <div className="page-shell">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 rounded bg-slate-200" />
              <div className="h-4 w-96 rounded bg-slate-100" />
              <div className="grid gap-4 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-slate-100" />
                ))}
              </div>
              <div className="h-96 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // 错误状态
  if (authState === "error" || dataState === "error") {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen items-center justify-center bg-slate-50/70">
          <div className="text-center">
            <p className="text-2xl font-bold text-ink">数据加载失败</p>
            <p className="mt-3 text-slate-500">请检查网络连接后刷新页面</p>
            <button
              className="primary-button mt-6"
              onClick={() => window.location.reload()}
            >
              重新加载
            </button>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50/70 py-12 sm:py-16">
        <div className="page-shell">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow">LEAD OPERATIONS</span>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] text-ink">
                线索后台
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                实时企业AI诊断线索管理
                {dataState === "empty" && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    暂无数据 · 显示示例
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="secondary-button" onClick={handleExportCSV}>
                导出 CSV
              </button>
              <button
                className="secondary-button text-red-500 hover:border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <SignOut size={17} />
                退出
              </button>
            </div>
          </div>

          <div className="mt-10">
            <ReportUnlockPanel />
          </div>

          <div className="mt-8">
            <LeadTable
              leads={leads}
              onUpdateField={handleUpdateField}
              onUpdateStatus={handleUpdateStatus}
              onUpdateNote={handleUpdateNote}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
