import {
  ChartLineDown,
  CirclesThreePlus,
  GraduationCap,
  Path,
  Wrench
} from "@phosphor-icons/react/dist/ssr";

const problems = [
  ["听了很多AI课，但不知道怎么用到业务里", GraduationCap],
  ["想做AI视频，但无法形成稳定获客系统", ChartLineDown],
  ["想做ERP、小程序、知识库，却不知道先做MVP还是完整系统", CirclesThreePlus],
  ["员工不会用AI，老板也不知道怎么带", Wrench],
  ["工具很多，但没有流程、标准和交付方法", Path]
];

export function ProblemSection() {
  return (
    <section className="section-space bg-slate-50/70">
      <div className="page-shell">
        <div className="section-heading">
          <span className="eyebrow">THE REAL BLOCKER</span>
          <h2>企业不是缺AI工具，而是缺一套落地路径</h2>
          <p>真正的难点不是知道多少工具，而是把业务问题转成一个能验证、能交付、能复用的AI项目。</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {problems.map(([title, Icon], index) => (
            <article key={title as string} className="surface-card min-h-56 p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon size={22} weight="duotone" />
                </span>
                <span className="font-mono text-xs text-slate-300">0{index + 1}</span>
              </div>
              <p className="mt-8 text-base font-bold leading-7 text-ink">{title as string}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

