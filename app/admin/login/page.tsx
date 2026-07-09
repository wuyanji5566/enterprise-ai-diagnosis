"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "@phosphor-icons/react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        const redirect = params.get("redirect") ?? "/admin";
        router.push(redirect);
      } else {
        const data = await res.json();
        setError(data.error ?? "登录失败");
      }
    } catch {
      setError("网络错误，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[.055] p-8 shadow-[0_24px_80px_rgba(2,6,23,.28)] backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_14px_34px_rgba(34,211,238,.24)]">
            <Lock size={21} weight="bold" />
          </span>
          <div>
            <h1 className="text-lg font-black text-white">管理员登录</h1>
            <p className="text-sm text-slate-400">星宇AI数字工厂</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-200">
              管理密码
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
              placeholder="请输入管理员密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-300/20 bg-red-400/10 px-4 py-2.5 text-sm text-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="ai-primary-button w-full"
          >
            {loading ? "验证中..." : "登录后台"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        仅限管理员访问 · 星宇AI数字工厂
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="ai-page-bg relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="ai-noise" />
        <div className="ai-vignette" />
        <div className="ai-grid-overlay" />
      </div>
      <div className="relative z-10 w-full">
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-sm animate-pulse">
              <div className="rounded-[28px] border border-white/10 bg-white/[.055] p-8">
                <div className="mb-6 h-11 w-11 rounded-2xl bg-white/10" />
                <div className="h-6 w-32 rounded bg-white/10" />
                <div className="mt-4 h-12 rounded-xl bg-white/10" />
                <div className="mt-4 h-12 rounded-xl bg-white/10" />
              </div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
