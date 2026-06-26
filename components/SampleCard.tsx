import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { SampleItem } from "@/types/sample";

export function SampleCard({ sample }: { sample: SampleItem }) {
  return (
    <article className="surface-card group flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="tag">{sample.category}</span>
            {sample.assetStatus !== "ready" && (
              <span className="tag bg-amber-50 text-amber-700">
                {sample.assetStatus === "mock" ? "演示样品" : "待替换真实素材"}
              </span>
            )}
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
      <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {sample.mediaType} placeholder
        </p>
        <p className="mt-2 text-sm font-bold text-slate-700">{sample.mediaPlaceholder}</p>
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
        <div>
          <dt className="font-bold text-slate-400">AI生产线</dt>
          <dd className="mt-1.5 font-bold leading-6 text-brand">{sample.productionLine}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-400">商业价值</dt>
          <dd className="mt-1.5 leading-6 text-slate-700">{sample.businessValue}</dd>
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
      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">可延展服务</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {sample.extendableServices.join(" · ")}
        </p>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-emerald-700">
        <CheckCircle size={17} weight="fill" />
        {sample.status}
      </div>
    </article>
  );
}
