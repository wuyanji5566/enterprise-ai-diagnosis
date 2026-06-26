import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
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

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <MethodSection />
        <ServiceMatrix />
        <ClientFitSection />
        <SampleValidationSection />
        <WechatCTA
          title="想要更正式的企业AI报告？"
          description="完成免费诊断后支付99元即可解锁完整报告，包含TOP3项目建议、ROI测算和微信解读，可发给合伙人或团队查看。"
        />
        <section className="section-space bg-slate-50/70">
          <div className="page-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="section-heading text-left">
                <span className="eyebrow">PROVEN SAMPLES</span>
                <h2>精选AI应用样品</h2>
                <p>不是概念清单，而是可继续定制、扩展和交付的企业AI生产线样品。</p>
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
