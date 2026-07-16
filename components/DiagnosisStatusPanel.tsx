"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Copy, SpinnerGap, WechatLogo } from "@phosphor-icons/react";
import { siteConfig } from "@/lib/site-config";
import type { DiagnosisRequestPublicStatus } from "@/types/diagnosis-request";

type PanelState =
  | { kind: "loading" }
  | { kind: "ready"; request: DiagnosisRequestPublicStatus }
  | { kind: "error"; message: string };

export function DiagnosisStatusPanel({
  requestId,
  accessToken
}: {
  requestId: string;
  accessToken: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<PanelState>({ kind: "loading" });
  const [copied, setCopied] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/diagnosis-requests/" + encodeURIComponent(requestId), {
        headers: { Authorization: "Bearer " + accessToken },
        cache: "no-store"
      });
      const data = (await response.json()) as DiagnosisRequestPublicStatus & { error?: string };
      if (!response.ok) throw new Error(data.error || "读取诊断状态失败。");
      if (data.status === "unlocked" && data.reportId) {
        router.replace(
          "/result?id=" + encodeURIComponent(data.reportId) + "&token=" + encodeURIComponent(accessToken)
        );
        return;
      }
      setState({ kind: "ready", request: data });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "读取诊断状态失败。"
      });
    }
  }, [accessToken, requestId, router]);

  useEffect(() => {
    void loadStatus();
    const timer = window.setInterval(() => void loadStatus(), 5000);
    return () => window.clearInterval(timer);
  }, [loadStatus]);

  async function copyRequestId() {
    await navigator.clipboard.writeText(requestId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const statusLabel =
    state.kind === "ready" && state.request.status === "generating"
      ? "顾问已确认，正在生成专属报告"
      : state.kind === "ready" && state.request.status === "failed"
        ? "报告生成遇到问题，顾问正在处理"
        : "等待顾问确认";

  return (
    <main className="ai-page-bg min-h-[calc(100vh-72px)] py-10 text-white sm:py-16">
      <div className="page-shell mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[.045] shadow-[0_30px_100px_rgba(2,6,23,.35)]">
          <div className="border-b border-white/10 px-6 py-8 sm:px-10 sm:py-10">
            <span className="ai-eyebrow">
              <CheckCircle size={15} weight="fill" />
              DIAGNOSIS SUBMITTED
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-[-0.045em] sm:text-5xl">
              诊断资料已提交
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              你无需等待 AI 在手机上长时间生成。添加顾问微信并发送诊断编号后，我们会核对业务背景并生成更贴合企业实际的完整报告。
            </p>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[.95fr_1.05fr]">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[.06] p-6 sm:p-8">
              <div className="flex items-center gap-3 text-cyan-100">
                {state.kind === "loading" ? (
                  <SpinnerGap size={21} className="animate-spin" />
                ) : (
                  <Clock size={21} weight="duotone" />
                )}
                <p className="font-black">{statusLabel}</p>
              </div>
              <div className="mt-7 space-y-4">
                {[
                  ["01", "资料已安全提交", "系统已保存你的问卷，无需重新填写。"],
                  ["02", "添加微信并发送编号", "顾问核对企业背景、目标与优先级。"],
                  ["03", "确认后自动打开报告", "页面每 5 秒检查状态，生成完成会自动跳转。"]
                ].map(([index, title, description]) => (
                  <div key={index} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-cyan-200/25 bg-slate-950/40 text-xs font-black text-cyan-200">
                      {index}
                    </span>
                    <div>
                      <p className="font-bold text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {state.kind === "error" && (
                <p className="mt-6 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                  {state.message} 你的诊断编号已保留，请稍后刷新此页面。
                </p>
              )}
              {state.kind === "ready" && state.request.failureMessage && (
                <p className="mt-6 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                  顾问已收到提醒，正在重新处理你的报告。
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center">
                <div className="rounded-2xl bg-white p-3 shadow-[0_18px_45px_rgba(34,211,238,.14)]">
                  <Image
                    src={siteConfig.contact.qrCodeUrl}
                    alt="企业 AI 诊断顾问微信二维码"
                    width={420}
                    height={600}
                    className="h-auto w-full rounded-xl"
                    priority
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <WechatLogo size={20} weight="fill" />
                    <p className="font-black">添加顾问微信</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    微信号：<strong className="text-white">{siteConfig.contact.wechatId}</strong>
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    添加后请发送下面的诊断编号，并备注“AI 诊断报告”。
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.05] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">诊断编号</p>
                <p className="mt-3 break-all font-mono text-lg font-black text-cyan-100">{requestId}</p>
                <button type="button" className="ai-secondary-button mt-4 w-full" onClick={copyRequestId}>
                  <Copy size={17} />
                  {copied ? "诊断编号已复制" : "复制诊断编号"}
                </button>
              </div>
              <button type="button" className="ai-primary-button mt-4 w-full" onClick={() => void loadStatus()}>
                <SpinnerGap size={18} className={state.kind === "loading" ? "animate-spin" : ""} />
                刷新确认状态
              </button>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                请保留此页面或收藏链接；后台确认后将自动跳转到完整企业 AI 诊断报告。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
