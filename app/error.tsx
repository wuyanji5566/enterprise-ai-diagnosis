"use client";

import Link from "next/link";
import { ArrowCounterClockwise, House } from "@phosphor-icons/react";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
          <div className="text-center">
            <p className="text-8xl font-black tracking-[-0.08em] text-slate-200">500</p>
            <h1 className="mt-6 text-2xl font-bold text-ink">系统发生错误</h1>
            <p className="mt-3 text-slate-500">抱歉，系统遇到了意外问题，请重试。</p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button className="primary-button" onClick={reset}>
                <ArrowCounterClockwise size={17} />
                重试
              </button>
              <Link href="/" className="secondary-button">
                <House size={17} />
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
