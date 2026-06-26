"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "@phosphor-icons/react/dist/ssr";

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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Lock size={20} weight="bold" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-ink">管理员登录</h1>
            <p className="text-sm text-muted">企业AI数字工厂</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="field-label">
              管理密码
            </label>
            <input
              id="password"
              type="password"
              className="field"
              placeholder="请输入管理员密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="primary-button w-full"
          >
            {loading ? "验证中…" : "登录后台"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        仅限管理员访问 · 企业AI数字工厂
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <Suspense fallback={
        <div className="w-full max-w-sm animate-pulse">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="mb-6 h-10 w-10 rounded-xl bg-slate-100" />
            <div className="h-6 w-32 rounded bg-slate-100" />
            <div className="mt-4 h-12 rounded-xl bg-slate-50" />
            <div className="mt-4 h-12 rounded-xl bg-slate-50" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
