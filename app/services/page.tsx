import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  CurrencyCny
} from "@phosphor-icons/react/dist/ssr";
import { CTASection } from "@/components/CTASection";
import { ContactCard } from "@/components/ContactCard";
import {
  FAQSection,
  PrivacyNotice,
  SampleValidationSection
} from "@/components/CommercialSections";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SERVICE_PACKAGES } from "@/lib/service-matcher";

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-slate-50/70 py-16 sm:py-20">
          <div className="page-shell">
            <span className="eyebrow">SERVICE PACKAGES</span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">
              企业AI数字工厂服务方案
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-500">
              诊断不是终点，真正的价值在于把AI机会转化为可交付、可验收、可继续扩展的项目。
            </p>
          </div>
        </section>
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
          <div className="page-shell">
            <div className="grid overflow-hidden rounded-3xl border border-blue-200 bg-brand-soft lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="p-7 sm:p-9">
                <span className="eyebrow">LOW-RISK FIRST STEP</span>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-ink">
                  先用AI诊断，避免一开始做错AI项目
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                  完成六步问卷后，AI自动生成诊断报告。支付¥99解锁完整内容，包含TOP3项目建议、ROI测算和微信解读，帮助企业判断第一步最应该做什么。
                </p>
              </div>
              <div className="border-t border-blue-200 p-7 lg:border-l lg:border-t-0 lg:p-9">
                <p className="text-4xl font-black text-brand">¥99</p>
                <div className="mt-5 flex flex-col gap-3">
                  <Link href="/diagnosis" className="primary-button">
                    开始AI诊断
                  </Link>
                  <Link href="/samples" className="secondary-button">
                    查看AI样品
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-space">
          <div className="page-shell grid gap-5 lg:grid-cols-2">
            {SERVICE_PACKAGES.map((service, index) => (
              <article
                key={service.id}
                className={`surface-card p-7 sm:p-8 ${
                  index === 1 ? "border-blue-200 ring-1 ring-blue-100" : ""
                }`}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand">
                      SERVICE 0{index + 1}
                    </span>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">
                      {service.name}
                    </h2>
                  </div>
                  <span className="tag whitespace-nowrap">{service.price}</span>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-500">
                  <strong className="text-slate-800">适合：</strong>
                  {service.clientFit}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  <strong className="text-slate-800">解决：</strong>
                  {service.problem}
                </p>
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    交付内容
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-0.5 grid size-5 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check size={12} weight="bold" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-slate-200 pt-5 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <Clock size={17} className="text-brand" />
                    {service.cycle}
                  </span>
                  <span className="flex items-center gap-2">
                    <CurrencyCny size={17} className="text-brand" />
                    {service.price}
                  </span>
                </div>
                <Link href="/diagnosis" className="primary-button mt-7">
                  先诊断是否适合
                  <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <SampleValidationSection />
        <section className="section-space">
          <div className="page-shell grid gap-8 lg:grid-cols-2">
            <div>
              <span className="eyebrow">DELIVERY BOUNDARY</span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-ink">
                服务边界与交付说明
              </h2>
              <ul className="mt-7 space-y-3 text-sm leading-7 text-slate-600">
                {[
                  "AI诊断不等于完整咨询方案",
                  "样品验证不等于完整系统开发",
                  "MVP不包含复杂权限、真实支付、多端适配，除非另行约定",
                  "培训课不包含无限制代做项目",
                  "内容制作不包含无限次修改",
                  "系统维护、数据迁移和员工培训需按范围单独计费",
                  "所有服务按阶段交付，不承诺一次性解决所有问题"
                ].map((item) => <li key={item}>· {item}</li>)}
              </ul>
            </div>
            <div className="rounded-3xl bg-ink p-8 text-white sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">
                PRIVATE QUOTE
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-tight">
                为什么最终价格需要诊断后确认？
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                企业AI落地涉及业务流程、资料基础、功能复杂度、修改次数、交付周期和团队参与度。因此页面仅展示参考预算，正式报价将在诊断与需求拆解后给出。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/diagnosis" className="primary-button">先做AI诊断</Link>
                <Link href="#consultation" className="secondary-button">获取私人报价</Link>
              </div>
            </div>
          </div>
        </section>
        <FAQSection />
        <PrivacyNotice />
        <section id="consultation" className="section-space bg-slate-50/70">
          <div className="page-shell grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
            <div>
              <span className="eyebrow">PRIVATE CONSULTATION</span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-ink">
                预约深度沟通与私人报价
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-500">
                添加微信后，可继续沟通样品验证、人工诊断或正式项目报价。AI诊断中的¥99解锁为微信私域收单，不会在网页内进行真实支付。
              </p>
            </div>
            <ContactCard title="添加微信，获取私人报价" />
          </div>
        </section>
        <div>
          <CTASection
            title="想把AI机会变成真实落地项目？"
            description="先完成诊断，我们会给出服务包匹配、第一阶段交付内容和建议预算，再决定是否预约深度沟通。"
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
