import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";

export function CTASection({
  title = "不确定企业第一步该做什么AI应用？",
  description = "先做一次AI诊断，判断你的企业更适合从营销、效率、知识库、系统还是团队培训切入。"
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="relative overflow-hidden rounded-[30px] bg-slate-950 px-7 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-24 size-80 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -bottom-32 left-16 size-80 rounded-full bg-violet-500/20 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
              <Sparkle size={15} weight="fill" />
              Start with diagnosis
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
            <Link href="/diagnosis" className="ai-primary-button mt-8">
              开始AI诊断
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
