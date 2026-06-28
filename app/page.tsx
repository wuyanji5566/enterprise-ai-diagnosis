import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ChartLineUp,
  CheckCircle,
  Gauge,
  Handshake,
  Target
} from "@phosphor-icons/react/dist/ssr";
import { CTASection } from "@/components/CTASection";
import {
  ClientFitSection,
  FAQSection,
  PrivacyNotice,
  SampleValidationSection
} from "@/components/CommercialSections";
import { HeroSection } from "@/components/HeroSection";
import { MethodSection } from "@/components/MethodSection";
import { ProblemSection } from "@/components/ProblemSection";
import { SampleCard } from "@/components/SampleCard";
import { ServiceMatrix } from "@/components/ServiceMatrix";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WechatCTA } from "@/components/WechatCTA";
import { SAMPLE_DATA } from "@/lib/sample-data";
import { siteConfig } from "@/lib/site-config";

const reportOutputs = [
  {
    icon: Gauge,
    title: "AI成熟度评分",
    description: "看清企业当前的资料基础、流程标准化、团队执行和预算准备度。"
  },
  {
    icon: Target,
    title: "当前最适合切入的AI方向",
    description: "判断更适合从营销获客、效率自动化、企业知识库、业务系统MVP还是团队培训开始。"
  },
  {
    icon: ChartLineUp,
    title: "TOP3可落地项目建议",
    description: "每个项目包含适用原因、第一阶段动作、预算区间、风险和样品验证建议。"
  },
  {
    icon: CalendarCheck,
    title: "7天/30天/90天行动路线",
    description: "先做什么、什么时候复盘、什么情况下再投入系统或长期服务。"
  }
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <section className="section-space bg-slate-50/70">
          <div className="page-shell">
            <div className="section-heading">
              <span className="eyebrow">REPORT OUTPUT</span>
              <h2>你将得到什么</h2>
              <p>
                诊断报告不是泛泛介绍AI工具，而是帮你判断第一个AI项目应该怎么选、怎么验证、怎么报价。
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {reportOutputs.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="surface-card p-6">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                      <Icon size={23} weight="duotone" />
                    </span>
                    <h3 className="mt-5 text-lg font-black tracking-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <ProblemSection />
        <MethodSection />
        <ServiceMatrix />
        <ClientFitSection />
        <section className="section-space border-y border-slate-200 bg-white">
          <div className="page-shell grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <span className="eyebrow">
                <Handshake size={15} weight="fill" />
                FOUNDER TRUST
              </span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                由伍老师主理，专注企业AI应用落地陪跑
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-500">
                不是只讲AI工具，而是把企业真实需求拆成可诊断、可演示、可报价、可交付的AI项目。已围绕企业主Codex实战、AI产品图、企业PPT、AI视频、业务系统MVP等场景进行陪跑与样品验证。
              </p>
              <Link href="/services#consultation" className="primary-button mt-7">
                预约一次AI落地沟通
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "先诊断业务价值，再推荐工具或系统",
                "先做样品验证，再扩大预算",
                "不卖焦虑，不承诺AI替代所有员工",
                "报告可作为团队内部讨论和报价前置材料"
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <CheckCircle size={20} className="text-emerald-600" weight="fill" />
                  <p className="mt-3 text-sm font-bold leading-6 text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <SampleValidationSection />
        <WechatCTA
          title="添加微信，获取你的企业AI落地建议"
          description={`完成诊断后，可发送报告截图，我们会根据企业行业、资料基础和预算，判断适合先做样品验证、员工培训，还是业务系统MVP。微信号：${siteConfig.contact.wechatId}`}
        />
        <section className="section-space bg-slate-50/70">
          <div className="page-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="section-heading text-left">
                <span className="eyebrow">PROVEN SAMPLES</span>
                <h2>精选AI样品案例</h2>
                <p>
                  样品不是最终大项目，而是用来验证方向、预算和客户接受度的第一步。
                </p>
              </div>
              <Link href="/samples" className="secondary-button self-start lg:self-auto">
                查看全部样品
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {SAMPLE_DATA.slice(0, 4).map((sample) => (
                <SampleCard key={sample.id} sample={sample} />
              ))}
            </div>
          </div>
        </section>
        <FAQSection />
        <PrivacyNotice />
        <CTASection />
      </main>
      <SiteFooter />
    </>
  );
}
