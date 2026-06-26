import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  FileLock,
  Flask,
  XCircle
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const validationPacks = [
  ["AI营销样品验证包", "¥999–3,999 起"],
  ["企业知识库Demo验证包", "¥1,999–4,999 起"],
  ["自动化流程Demo验证包", "¥1,999–6,999 起"],
  ["业务系统MVP验证包", "¥3,999–9,999 起"],
  ["企业AI陪跑体验包", "¥1,999–3,999 起"]
];

const faq = [
  ["AI诊断是免费的吗？", "六步问卷和AI诊断免费完成；查看完整报告（含TOP3项目建议、ROI测算和PDF报告）需支付99元解锁。人工访谈与正式方案为999元起。"],
  ["为什么不建议一上来做完整ERP或大系统？", "业务流程和验收标准没有验证前，大系统会放大需求错误。先做样品或MVP，更容易控制预算和返工风险。"],
  ["样品验证和正式项目有什么区别？", "样品验证只证明方向、关键流程和ROI假设；正式项目才包含完整范围、稳定性、部署、培训和持续维护。"],
  ["最终价格为什么需要私人沟通？", "价格取决于资料基础、流程复杂度、功能边界、修改次数、周期和团队参与度，页面只能提供参考区间。"],
  ["企业资料是否安全？", "资料仅用于本次诊断和沟通，不会未经允许公开展示，也不会自动成为公开案例。"],
  ["能不能给员工培训？", "可以。培训会围绕企业真实任务设计，覆盖老板认知、员工工具实操和项目陪跑。"],
  ["后期能不能长期陪跑？", "可以在首个样品或MVP验证通过后，按月或按阶段进入自动化、系统开发、培训和复盘。"],
  ["如果暂不适合AI落地怎么办？", "报告会明确暂不建议事项，并优先给出资料整理、流程标准化或基础培训等低风险准备动作。"]
];

export function ClientFitSection() {
  const suitable = [
    "有真实产品或服务",
    "存在营销、销售、交付或管理问题",
    "有重复流程、表格、文档、客服或内容需求",
    "愿意先从小样品 / MVP验证开始",
    "企业主或负责人愿意参与反馈"
  ];
  const unsuitable = [
    "只想免费咨询，不愿提供资料",
    "需求极度模糊却想一次性做大系统",
    "预算明显低于交付复杂度",
    "期待AI立刻替代所有员工",
    "不接受阶段性交付和样品验证"
  ];
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="section-heading">
          <span className="eyebrow">CLIENT FIT</span>
          <h2>哪些企业适合进入AI数字工厂？</h2>
          <p>合作是否有效，取决于真实问题、决策参与和阶段性验证意愿，而不只是预算。</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {([
            ["适合进入", suitable, CheckCircle, "text-emerald-700 bg-emerald-50"],
            ["暂不适合", unsuitable, XCircle, "text-slate-600 bg-slate-100"]
          ] as Array<[string, string[], Icon, string]>).map(([title, items, ItemIcon, tone]) => (
            <article key={title as string} className="surface-card p-7 sm:p-8">
              <div className="flex items-center gap-3">
                <span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
                  <ItemIcon size={23} weight="duotone" />
                </span>
                <h3 className="text-xl font-black text-ink">{title as string}</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SampleValidationSection() {
  return (
    <section className="section-space bg-slate-50/70">
      <div className="page-shell grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <span className="eyebrow"><Flask size={15} /> VALIDATION FIRST</span>
          <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-ink sm:text-4xl">
            不确定要不要做大项目？先做一个AI样品验证。
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-500">
            用7天左右做出可演示、可评估、可复盘的小成果，先验证AI是否适合真实业务，再决定是否进入正式项目。
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/services#consultation" className="primary-button">申请样品验证 <ArrowRight size={17} /></Link>
            <Link href="/diagnosis" className="secondary-button">先做AI诊断</Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {validationPacks.map(([name, price]) => (
            <div key={name} className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold text-ink">{name}</span>
              <span className="text-sm font-black text-brand">{price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="section-heading">
          <span className="eyebrow">FAQ</span>
          <h2>合作前常见问题</h2>
        </div>
        <div className="mx-auto mt-12 max-w-4xl divide-y divide-slate-200 border-y border-slate-200">
          {faq.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="cursor-pointer list-none pr-8 font-bold text-ink">{question}</summary>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PrivacyNotice() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/70">
      <div className="page-shell flex items-start gap-4 py-8">
        <FileLock size={24} className="mt-1 shrink-0 text-brand" weight="duotone" />
        <div>
          <h2 className="font-black text-ink">隐私与数据说明</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            企业填写的信息仅用于本次AI诊断和后续人工沟通，不会未经允许公开展示，也不会作为公开案例使用。诊断结果为初步建议，正式落地方案需结合人工访谈、资料基础和预算进一步确认。
          </p>
        </div>
      </div>
    </section>
  );
}
