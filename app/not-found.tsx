import Link from "next/link";
import { House } from "@phosphor-icons/react/dist/ssr";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="text-center">
        <p className="text-8xl font-black tracking-[-0.08em] text-slate-200">404</p>
        <h1 className="mt-6 text-2xl font-bold text-ink">页面未找到</h1>
        <p className="mt-3 text-slate-500">你访问的页面不存在或已被移除。</p>
        <Link href="/" className="primary-button mt-8 inline-flex">
          <House size={17} />
          返回首页
        </Link>
      </div>
    </div>
  );
}
