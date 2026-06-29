"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SpinnerGap, UserPlus } from "@phosphor-icons/react";
import { SiteHeader } from "@/components/SiteHeader";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "注册失败");
      router.push(next);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "注册失败，请稍后重试。");
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
            <UserPlus size={15} weight="fill" />
            CREATE ACCOUNT
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-ink">创建账号</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            用邮箱注册后，之后生成的诊断报告会自动保存，换设备也能找回。
          </p>
          <form className="mt-7 space-y-5" onSubmit={submit}>
            <label>
              <span className="field-label">称呼</span>
              <input
                className="field"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例如：王总"
                maxLength={80}
              />
            </label>
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
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 8 位"
                required
              />
            </label>
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            <button className="primary-button w-full" disabled={submitting} type="submit">
              {submitting && <SpinnerGap size={18} className="animate-spin" />}
              注册并进入我的报告
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            已有账号？{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-brand">
              去登录
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
