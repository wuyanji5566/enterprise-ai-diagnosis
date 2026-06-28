import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardText,
  Clock,
  CurrencyCny,
  Sparkle
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
import { siteConfig } from "@/lib/site-config";

const entryPaths = [
  {
    name: "企业AI初筛报告",
    price: "¥99",
    badge: "报告解锁",
    fit: "已经完成AI诊断，想看完整评分、TOP3项目建议、ROI测算和下一步服务路径。",
    deliver: ["完整诊断报告", "AI成熟度评分", "TOP3项目建议", "7/30/90天行动路线", "一次微信简要解读"],
    exclude: "不包含人工深度访谈、资料审计、正式项目方案书和长期咨询。",
    next: "先完成AI诊断，添加微信并发送报告编号，管理员确认后解锁。",
    href: "/diagnosis"
  },
  {
    name: "深度诊断与人工解读",
    price: "¥999起",
    badge: "决策前梳理",
    fit: "老板或负责人已经有AI预算，但不确定先做营销、自动化、知识库、MVP还是培训。",
    deliver: ["一次人工访谈", "业务资料梳理", "落地路径建议", "第一阶段预算拆分", "风险与边界说明"],
    exclude: "不包含成片制作、系统开发、长期培训、广告投放和无限次修改。",
    next: "添加微信，发送行业、规模、预算和当前最痛的问题，再确认诊断范围。",
    href: "#consultation"
  },
  {
    name: "AI样品验证包",
    price: "¥1999起",
    badge: "先验证再投入",
    fit: "已经明确一个方向，希望先做出可展示样品，用来验证老板、团队或客户是否认可。",
    deliver: ["样品范围定义", "脚本/流程/页面原型", "可演示样品", "复盘建议", "升级服务判断"],
    exclude: "不包含完整系统开发、广告投放费用、客户内部数据治理和长期运维。",
    next: "从样品库选择一个相近案例，预约沟通后确认第一阶段交付范围。",
    href: "/samples"
  }
];

const upgradeServices = [
  {
    name: "AI营销增长包",
    price: "¥999 - ¥9999起",
    cycle: "7-21天",
    fit: "产品型企业、制造工厂、服务品牌、招商团队。",
    deliver: ["卖点拆解", "产品图/详情页视觉", "短视频脚本与分镜", "渠道发布建议"],
    exclude: "不包含广告代投、无限成片修改和全品牌体系设计。",
    next: "先选一个核心产品或服务，做一组能被销售直接使用的样品。"
  },
  {
    name: "效率自动化验证",
    price: "¥1999 - ¥10000起",
    cycle: "7-30天",
    fit: "每周重复处理表格、报表、文档、审批或内部资料的团队。",
    deliver: ["流程梳理", "自动化Demo", "异常校验", "操作说明与交接"],
    exclude: "不包含老系统深度改造、复杂权限和长期运维。",
    next: "先选一个高频流程，验证节省工时和错误率下降。"
  },
  {
    name: "知识库 / 客服Agent",
    price: "¥5000起",
    cycle: "2-4周",
    fit: "资料多、客服问答重复、销售口径不一致的企业。",
    deliver: ["资料清洗", "FAQ结构", "问答Demo", "引用来源", "命中率复盘"],
    exclude: "不包含全量知识治理、多部门权限体系和大规模客服坐席接入。",
    next: "先整理一批高频资料，做问答命中率验证。"
  },
  {
    name: "业务系统MVP",
    price: "¥8000起",
    cycle: "3-6周",
    fit: "想做CRM、报价系统、项目管理、小程序或内部管理后台的企业。",
    deliver: ["流程梳理", "页面原型", "可演示MVP", "Mock数据验证", "后续开发方案"],
    exclude: "不包含完整ERP、真实支付、复杂审批、多端全适配，除非另行报价。",
    next: "先锁定一个核心流程，做可演示MVP，不直接做大系统。"
  }
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-slate-50/70 py-16 sm:py-20">
          <div className="page-shell">
            <span className="eyebrow">SERVICE PATH</span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">
              先诊断，先验证，再决定是否投入项目预算
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-500">
              不建议一开始就买大项目。先用诊断判断方向，再用样品验证价值，最后再进入培训、自动化或系统MVP交付。
            </p>
          </div>
        </section>

        <section className="section-space">
          <div className="page-shell">
            <div className="section-heading">
              <span className="eyebrow">FIRST STEP</span>
              <h2>三档成交路径</h2>
              <p>从¥99企业AI初筛报告开始，也可以进入人工深度诊断或AI样品验证包。</p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {entryPaths.map((item, index) => (
                <article
                  key={item.name}
                  className={`surface-card flex h-full flex-col p-7 ${
                    index === 0 ? "border-blue-200 ring-1 ring-blue-100" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="tag">{item.badge}</span>
                      <h3 className="mt-4 text-2xl font-black tracking-tight text-ink">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-3xl font-black tracking-tight text-brand">{item.price}</p>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    <strong className="text-ink">适合谁：</strong>
                    {item.fit}
                  </p>
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      交付什么
                    </p>
                    <ul className="mt-4 grid gap-3">
                      {item.deliver.map((deliverable) => (
                        <li key={deliverable} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-0.5 grid size-5 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                            <Check size={12} weight="bold" />
                          </span>
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    <strong className="text-ink">不包含：</strong>
                    {item.exclude}
                  </div>
                  <p className="mt-4 text-sm font-bold leading-6 text-brand">
                    下一步：{item.next}
                  </p>
                  <Link href={item.href} className="primary-button mt-auto">
                    进入这一步
                    <ArrowRight size={17} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SampleValidationSection />

        <section className="section-space bg-slate-50/70">
          <div className="page-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="section-heading text-left">
                <span className="eyebrow">UPGRADE SERVICES</span>
                <h2>可升级服务</h2>
                <p>
                  这些不是一上来就建议购买的大包，而是诊断或样品验证后，根据业务价值和预算再升级的服务。
                </p>
              </div>
              <Link href="/diagnosis" className="secondary-button self-start lg:self-auto">
                先做10分钟AI诊断
              </Link>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {upgradeServices.map((service) => (
                <article key={service.name} className="surface-card p-7">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <span className="eyebrow bg-white">
                        <Sparkle size={14} weight="fill" />
                        可升级服务
                      </span>
                      <h3 className="mt-4 text-2xl font-black tracking-tight text-ink">
                        {service.name}
                      </h3>
                    </div>
                    <span className="tag whitespace-nowrap">{service.price}</span>
                  </div>
                  <div className="mt-5 grid gap-4 text-sm leading-7 text-slate-600">
                    <p>
                      <strong className="text-ink">适合谁：</strong>
                      {service.fit}
                    </p>
                    <div>
                      <p className="font-bold text-ink">交付什么：</p>
                      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                        {service.deliver.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-0.5 grid size-5 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                              <Check size={12} weight="bold" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="rounded-xl bg-white p-4">
                      <strong className="text-ink">不包含：</strong>
                      {service.exclude}
                    </p>
                    <p className="font-bold text-brand">下一步：{service.next}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-slate-200 pt-5 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <Clock size={17} className="text-brand" />
                      {service.cycle}
                    </span>
                    <span className="flex items-center gap-2">
                      <CurrencyCny size={17} className="text-brand" />
                      {service.price}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="page-shell grid gap-8 lg:grid-cols-2">
            <div>
              <span className="eyebrow">
                <ClipboardText size={14} weight="fill" />
                DELIVERY BOUNDARY
              </span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-ink">
                服务边界先说清楚
              </h2>
              <ul className="mt-7 space-y-3 text-sm leading-7 text-slate-600">
                {[
                  "AI诊断是方向判断，不等于完整咨询方案。正式方案需要人工访谈和资料验证。",
                  "样品验证是为了先验证方向和价值，不等于完整系统开发。",
                  "MVP默认不包含复杂权限、真实支付、多端适配和长期运维。",
                  "培训课不承诺让AI替代所有员工，重点是让团队形成可复用工作流。",
                  "所有服务按阶段交付，不承诺一次性解决企业所有问题。"
                ].map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-ink p-8 text-white sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">
                PRIVATE QUOTE
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-tight">
                为什么正式报价需要诊断后确认？
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                企业AI落地涉及业务流程、资料基础、功能复杂度、修改次数、交付周期和团队参与度。页面只展示参考预算，正式报价会在诊断和需求拆解后给出。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/diagnosis" className="primary-button">先做AI诊断</Link>
                <Link href="#consultation" className="secondary-button">预约沟通</Link>
              </div>
            </div>
          </div>
        </section>

        <FAQSection />
        <PrivacyNotice />
        <section id="consultation" className="section-space bg-slate-50/70">
          <div className="page-shell grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
            <div>
              <span className="eyebrow">WECHAT CONSULTATION</span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-ink">
                添加微信，获取你的企业AI落地建议
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-500">
                完成诊断后，可发送报告截图，我们会根据企业行业、资料基础和预算，判断适合先做样品验证、员工培训，还是业务系统MVP。
              </p>
            </div>
            <ContactCard
              title="添加微信，获取你的企业AI落地建议"
              description={`完成诊断后，可发送报告截图，我们会根据企业行业、资料基础和预算，判断适合先做样品验证、员工培训，还是业务系统MVP。微信号：${siteConfig.contact.wechatId}`}
            />
          </div>
        </section>
        <CTASection
          title="先诊断，再决定要不要投入项目预算"
          description="完成10分钟AI诊断后，你会得到更清晰的项目方向，再决定是否解锁报告、预约人工诊断或做样品验证。"
        />
      </main>
      <SiteFooter />
    </>
  );
}
