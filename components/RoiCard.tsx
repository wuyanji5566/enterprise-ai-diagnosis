import { TrendUp } from "@phosphor-icons/react/dist/ssr";
import type { ROIAnalysis } from "@/types/diagnosis";

export function RoiCard({ roi }: { roi: ROIAnalysis }) {
  return (
    <section className="surface-card p-7 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <TrendUp size={23} weight="duotone" />
        </span>
        <div>
          <h2 className="text-lg font-black text-ink">ROI分析</h2>
          <p className="text-sm text-slate-500">基于区间和明确假设，不做虚假精确</p>
        </div>
      </div>
      <div className="mt-7 grid gap-5 sm:grid-cols-3">
        {[
          ["成本下降", roi.costReduction],
          ["人效提升", roi.efficiencyGain],
          ["回本周期", roi.paybackPeriod]
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-bold text-slate-400">{label}</p>
            <p className="mt-2 text-lg font-black leading-7 text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">ROI总结</p>
        <p className="mt-2 text-sm font-semibold leading-7 text-emerald-950">
          {roi.roiSummary}
        </p>
      </div>
      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">测算假设</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
          {roi.assumptions.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

