import Link from "next/link";
import { Factory } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-ink text-white">
              <Factory size={20} weight="duotone" />
            </span>
            <span className="font-bold text-ink">{siteConfig.brandName}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            从AI诊断开始，用样品验证价值，再进入自动化、业务系统、团队陪跑与长期交付。
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-ink">产品入口</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-500">
            <Link href="/diagnosis">企业AI诊断（¥99解锁完整报告）</Link>
            <Link href="/samples">AI应用样品库</Link>
            <Link href="/services">服务方案</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-ink">交付原则</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-500">
            <span>先诊断，再验证</span>
            <span>先MVP，再系统化</span>
            <span>结果可展示、可衡量</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400 flex flex-wrap items-center justify-center gap-3">
        <span>{siteConfig.brandName} V0.4 · 本系统诊断结果用于项目初筛，不替代正式咨询尽调</span>
        <span className="text-slate-300">|</span>
        <Link href="/privacy" className="hover:text-slate-600 transition-colors">隐私政策</Link>
        <span className="text-slate-300">|</span>
        <Link href="/terms" className="hover:text-slate-600 transition-colors">服务条款</Link>
      </div>
    </footer>
  );
}
