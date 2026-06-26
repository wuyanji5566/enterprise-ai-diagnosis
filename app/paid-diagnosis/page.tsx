import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  LockKey,
  ShieldCheck
} from "@phosphor-icons/react/dist/ssr";
import { ContactCard } from "@/components/ContactCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";

const reportBenefits = [
  "完整企业AI成熟度评分与业务流程分析",
  "AI机会评分矩阵与7/30/90天落地路线",
  "TOP3 AI项目的执行步骤、周期与预算建议",
  "成本下降、人效提升与回本周期测算",
  "可复制、可打印的正式诊断报告",
  "一次微信简要解读"
];

export default function PaidDiagnosisPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-slate-50/70 py-16 sm:py-20">
          <div className="page-shell grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <span className="eyebrow">
                <LockKey size={15} weight="fill" />
                FULL REPORT
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">
                用一份完整诊断报告，确定企业AI落地的第一步
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">
                先完成六步AI诊断，报告生成后支付¥{siteConfig.unlockPrice}解锁完整内容。当前采用微信私域收单，不会在网页内自动扣款。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/diagnosis" className="primary-button">
                  开始AI诊断
                  <ArrowRight size={17} />
                </Link>
                <Link href="/services" className="secondary-button">
                  查看服务方案
                </Link>
              </div>
            </div>

            <div className="surface-card p-7 sm:p-9">
              <div className="flex items-end justify-between border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm font-bold text-slate-400">完整报告解锁</p>
                  <p className="mt-2 text-5xl font-black tracking-[-0.05em] text-brand">
                    ¥{siteConfig.unlockPrice}
                  </p>
                </div>
                <ShieldCheck size={42} className="text-brand" weight="duotone" />
              </div>
              <ul className="mt-6 space-y-3">
                {reportBenefits.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <CheckCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                      weight="fill"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/diagnosis" className="primary-button mt-7 w-full">
                开始生成我的诊断报告
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="page-shell grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <span className="eyebrow">WECHAT PAYMENT</span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-ink">
                添加微信，完成付款与报告解读
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-500">
                完成问卷并生成报告后，添加微信并支付{siteConfig.unlockPrice}元。发送报告编号，管理员确认收款后即可查看完整报告。
              </p>
            </div>
            <ContactCard />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
