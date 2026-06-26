import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";

export function CTASection({
  title = "不确定企业第一步该做什么AI应用？",
  description = "先做一次AI诊断，判断你的企业最适合从营销、效率、知识库、系统还是团队培训切入。"
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="relative overflow-hidden rounded-[30px] bg-brand px-7 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
              <Sparkle size={15} weight="fill" />
              Start with diagnosis
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">{description}</p>
            <Link
              href="/diagnosis"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              开始AI诊断
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="absolute -bottom-28 -right-20 size-80 rounded-full border-[56px] border-white/10" />
        </div>
      </div>
    </section>
  );
}

