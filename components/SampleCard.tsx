import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle,
  CurrencyCny,
  Package
} from "@phosphor-icons/react/dist/ssr";
import type { SampleItem } from "@/types/sample";

const mediaLabels: Record<SampleItem["mediaType"], string> = {
  image: "视觉样品",
  video: "视频样品",
  system: "系统Demo",
  document: "文档流程"
};

export function SampleCard({ sample }: { sample: SampleItem }) {
  return (
    <article className="surface-card group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <Image
          src={sample.coverImage}
          alt={`${sample.title}封面`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="tag bg-white/90 text-brand shadow-sm">{sample.category}</span>
          <span className="tag bg-ink/90 text-white shadow-sm">{mediaLabels[sample.mediaType]}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="tag bg-emerald-50 text-emerald-700">{sample.status}</span>
              <span className="tag bg-blue-50 text-brand">脱敏演示样品</span>
            </div>
            <h3 className="mt-4 text-xl font-black leading-7 tracking-tight text-ink">
              {sample.title}
            </h3>
          </div>
          <ArrowUpRight
            size={20}
            className="shrink-0 text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand"
          />
        </div>
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Package size={15} className="text-brand" weight="duotone" />
              {sample.mediaPlaceholder}
            </p>
            <p className="flex shrink-0 items-center gap-1 text-xs font-black text-brand">
              <CurrencyCny size={14} weight="bold" />
              {sample.referenceBudget.replace("¥", "")}
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{sample.realAssetNote}</p>
        </div>
        <dl className="mt-6 grid gap-4 text-sm">
          <div>
            <dt className="font-bold text-slate-400">适合客户</dt>
            <dd className="mt-1.5 leading-6 text-slate-700">{sample.clientType}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-400">原始问题</dt>
            <dd className="mt-1.5 leading-6 text-slate-700">{sample.originalProblem}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-400">诊断判断</dt>
            <dd className="mt-1.5 leading-6 text-slate-700">{sample.diagnosisJudgment}</dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">交付成果</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sample.deliverables.map((item) => (
              <span key={item} className="tag bg-slate-50 text-slate-600">
                {item}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600">{sample.businessValue}</p>
        <div className="mt-auto pt-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-700">
            <CheckCircle size={17} weight="fill" />
            可按行业定制升级：{sample.extendableServices.join(" / ")}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/services#consultation" className="primary-button px-4">
              申请类似样品
            </Link>
            <Link href="/diagnosis" className="secondary-button px-4">
              查看适合我的方案
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
