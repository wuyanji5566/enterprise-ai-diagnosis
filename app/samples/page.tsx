"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { SampleCard } from "@/components/SampleCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SAMPLE_DATA } from "@/lib/sample-data";

const categories = ["全部", ...Array.from(new Set(SAMPLE_DATA.map((item) => item.category)))];

export default function SamplesPage() {
  const [active, setActive] = useState("全部");
  const samples = useMemo(
    () =>
      active === "全部"
        ? SAMPLE_DATA
        : SAMPLE_DATA.filter((item) => item.category === active),
    [active]
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-slate-50/70 py-16 sm:py-20">
          <div className="page-shell">
            <span className="eyebrow">AI SAMPLE LIBRARY</span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">
              可复制、可定制、可成交的AI样品库
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-500">
              每个样品都对应一种真实企业问题：先用小样品验证价值，再决定是否进入培训、自动化或系统MVP交付。
            </p>
          </div>
        </section>
        <section className="section-space">
          <div className="page-shell">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="样品分类">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active === category}
                  onClick={() => setActive(category)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    active === category
                      ? "bg-ink text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {samples.map((sample) => (
                <SampleCard key={sample.id} sample={sample} />
              ))}
            </div>
            <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/diagnosis" className="primary-button">
                查看适合我的AI方案
              </Link>
              <Link href="/services#consultation" className="secondary-button">
                申请类似样品
              </Link>
            </div>
          </div>
        </section>
        <CTASection
          title="想把某个样品变成你企业的版本？"
          description="先完成AI诊断，我会根据你的行业、资料基础、预算和成交目标，判断从哪个样品切入最稳。"
        />
      </main>
      <SiteFooter />
    </>
  );
}
