import Link from "next/link";
import { ArrowRight, WechatLogo } from "@phosphor-icons/react/dist/ssr";

export function WechatCTA({
  title = "想获得一份更正式的企业AI诊断报告？",
  description = "完成免费AI诊断后，支付99元即可解锁完整报告、TOP3项目建议、ROI测算和一次微信简要解读。",
  secondaryLabel = "开始AI诊断"
}: {
  title?: string;
  description?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="section-space bg-slate-950">
      <div className="page-shell">
        <div className="relative overflow-hidden rounded-[30px] border border-cyan-300/20 bg-white/[.045] p-8 text-white shadow-[0_24px_90px_rgba(14,165,233,.12)] sm:p-12 lg:p-14">
          <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-200">
                <WechatLogo size={16} weight="fill" />
                WECHAT PRIVATE SERVICE
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-4xl">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/diagnosis" className="ai-primary-button">
                {secondaryLabel}
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
