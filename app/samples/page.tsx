"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChartLineUp,
  ChatCircleText,
  Funnel,
  MonitorPlay,
  SquaresFour
} from "@phosphor-icons/react";
import { CTASection } from "@/components/CTASection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const sampleCategories = ["全部", "AI营销", "产品视觉", "知识库", "系统MVP"];

const demoSamples = [
  {
    title: "15秒AI营销视频样品",
    category: "AI营销",
    icon: MonitorPlay,
    problem: "产品卖点复杂，销售团队缺少能快速转发、让客户一眼看懂价值的短视频素材。",
    judgment: "适合先做一条高转化脚本样片，用来验证卖点、画面风格和客户反馈。",
    result: "交付短视频脚本、分镜结构、封面方向和一条可演示样片。",
    fit: "制造业、招商加盟、产品型企业、服务业门店",
    budget: "¥999 - ¥2999"
  },
  {
    title: "产品图与详情页视觉样品",
    category: "产品视觉",
    icon: ChartLineUp,
    problem: "产品图不统一，详情页只是在堆参数，客户看不出差异化价值。",
    judgment: "适合先用核心产品做一套主视觉和卖点信息图，验证是否能提升咨询率。",
    result: "交付主视觉、场景图、卖点信息图、详情页模块结构。",
    fit: "电商、工厂、设备商、消费品品牌",
    budget: "¥1999 - ¥6000"
  },
  {
    title: "企业知识库问答Demo",
    category: "知识库",
    icon: ChatCircleText,
    problem: "资料分散，员工和销售经常找不到标准答案，客户问题反复靠人工解释。",
    judgment: "适合先整理一批高频资料，做可引用来源的问答Demo，验证命中率。",
    result: "交付资料结构、FAQ体系、问答Demo、命中率复盘建议。",
    fit: "培训机构、服务型企业、客服团队、销售团队",
    budget: "¥1999 - ¥8000"
  },
  {
    title: "报价与项目管理系统MVP",
    category: "系统MVP",
    icon: SquaresFour,
    problem: "报价、合同、项目进度和回款分散在多个表格里，老板难以及时看经营状态。",
    judgment: "适合先做一个小型MVP，把关键流程跑通，不直接上大系统。",
    result: "交付报价台、客户档案、项目看板、经营概览和后续开发建议。",
    fit: "企业服务、工程交付、定制制造、咨询服务",
    budget: "¥8000起"
  }
];

export default function SamplesPage() {
  const [active, setActive] = useState("全部");

  const samples = useMemo(
    () =>
      active === "全部"
        ? demoSamples
        : demoSamples.filter((item) => item.category === active),
    [active]
  );

  return (
    <>
      <SiteHeader />
      <main className="ai-page-bg text-white">
        <section className="ai-hero-bg relative overflow-hidden border-b border-white/10 py-14 sm:py-18">
          <div className="pointer-events-none absolute inset-0">
            <div className="ai-noise" />
            <div className="ai-vignette" />
            <div className="ai-grid-overlay" />
          </div>
          <div className="page-shell relative z-10 grid gap-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
            <div>
              <span className="ai-eyebrow">DEMO SAMPLE LIBRARY</span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
                脱敏AI样品库：先看方向，再决定做哪类AI样品验证
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                这里展示的是常见企业AI落地场景的脱敏演示样品，不是空白占位。
                你可以先判断自己的业务更接近营销增长、产品视觉、知识库，还是业务系统MVP。
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/diagnosis" className="ai-primary-button">
                  先做AI诊断
                  <ArrowRight size={17} />
                </Link>
                <Link href="/services#consultation" className="ai-secondary-button">
                  申请类似样品
                </Link>
              </div>
            </div>

            <div className="ai-dashboard-card p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                    SAMPLE SIGNAL
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">样品验证看板</h2>
                </div>
                <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  可预约
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["4类", "高频样品方向"],
                  ["7-21天", "常见验证周期"],
                  ["先验证", "再决定投入"],
                  ["可升级", "报告/样品/MVP"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/[.06] p-4">
                <p className="text-sm font-bold text-cyan-100">
                  建议先用一个小样品验证客户是否买单，再决定是否进入正式项目。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="page-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <span className="ai-eyebrow">
                  <Funnel size={14} weight="bold" />
                  SAMPLE FILTER
                </span>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-white">
                  选择你更接近的样品类型
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  每张卡片都按“原始问题、诊断判断、交付成果、适合企业、预算区间”展示，方便你判断客户项目怎么切入。
                </p>
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="样品分类">
                {sampleCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active === category}
                    onClick={() => setActive(category)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      active === category
                        ? "bg-cyan-300 text-slate-950"
                        : "border border-white/10 bg-white/[.055] text-slate-200 hover:border-cyan-300/30"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {samples.map((sample) => {
                const Icon = sample.icon;
                return (
                  <article key={sample.title} className="ai-surface-card flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                        {sample.category}
                      </span>
                      <span className="grid size-10 place-items-center rounded-2xl bg-white/[.08] text-cyan-200">
                        <Icon size={21} weight="duotone" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-black leading-7 tracking-tight text-white">
                      {sample.title}
                    </h3>
                    <dl className="mt-5 grid gap-4 text-sm">
                      <div>
                        <dt className="font-bold text-slate-400">原始问题</dt>
                        <dd className="mt-1.5 leading-6 text-slate-200">{sample.problem}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-400">诊断判断</dt>
                        <dd className="mt-1.5 leading-6 text-slate-200">{sample.judgment}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-400">交付成果</dt>
                        <dd className="mt-1.5 leading-6 text-slate-200">{sample.result}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-400">适合企业</dt>
                        <dd className="mt-1.5 leading-6 text-slate-200">{sample.fit}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-400">预算区间</dt>
                        <dd className="mt-1.5 font-black text-cyan-200">{sample.budget}</dd>
                      </div>
                    </dl>
                    <div className="mt-6 grid gap-3 pt-2">
                      <Link href="/services#consultation" className="ai-primary-button px-4">
                        申请类似样品
                      </Link>
                      <Link href="/diagnosis" className="ai-secondary-button px-4">
                        查看适合我的方案
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <CTASection
          title="不确定你的企业适合哪种AI样品？"
          description="先做一次10分钟AI诊断，我会根据行业、资料基础、预算和成交目标，判断从哪个样品切入最稳。"
        />
      </main>
      <SiteFooter />
    </>
  );
}
