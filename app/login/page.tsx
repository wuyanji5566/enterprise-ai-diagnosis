"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SignIn, SpinnerGap } from "@phosphor-icons/react";
import { SiteHeader } from "@/components/SiteHeader";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "登录失败");
      router.push(next);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-72px)] bg-slate-50/70 px-5 py-14">
        <section className="surface-card mx-auto max-w-md p-8 sm:p-10">
          <span className="eyebrow">
            <SignIn size={15} weight="fill" />
            USER LOGIN
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-ink">登录账号</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            登录后，之后生成的企业AI诊断报告会自动保存到“我的报告”。
          </p>
          <form className="mt-7 space-y-5" onSubmit={submit}>
            <label>
              <span className="field-label">邮箱</span>
              <input
                className="field"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
              />
            </label>
            <label>
              <span className="field-label">密码</span>
              <input
                className="field"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                required
              />
            </label>
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            <button className="primary-button w-full" disabled={submitting} type="submit">
              {submitting && <SpinnerGap size={18} className="animate-spin" />}
              登录并查看报告
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            还没有账号？{" "}
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-brand">
              立即注册
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
