import {
  ArrowUpRight,
  ChalkboardTeacher,
  FlowArrow,
  Megaphone,
  Robot,
  SquaresFour
} from "@phosphor-icons/react/dist/ssr";

const lines = [
  {
    name: "AI营销增长生产线",
    output: "产品营销视频、AI产品图、短视频脚本、内容矩阵、产品详情页视觉",
    icon: Megaphone,
    tone: "text-blue-600 bg-blue-50"
  },
  {
    name: "企业AI陪跑生产线",
    output: "老板AI实战课、员工训练营、Codex与多媒体AI实操、真实项目陪跑",
    icon: ChalkboardTeacher,
    tone: "text-violet-600 bg-violet-50"
  },
  {
    name: "业务系统MVP生产线",
    output: "报价系统、知识库、CRM、小程序、ERP原型、管理后台",
    icon: SquaresFour,
    tone: "text-amber-600 bg-amber-50"
  },
  {
    name: "效率自动化生产线",
    output: "Excel自动整理、报表生成、客户资料归档、客服话术库、流程自动化",
    icon: FlowArrow,
    tone: "text-emerald-600 bg-emerald-50"
  }
];

export function ServiceMatrix() {
  return (
    <section className="section-space bg-ink text-white">
      <div className="page-shell">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span className="eyebrow border-white/10 bg-white/5 text-blue-300">
              <Robot size={15} />
              FACTORY SYSTEM
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              四条生产线，把AI机会变成可交付成果
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-400">
            每条生产线都从真实业务问题出发，输出可以演示、验收和继续扩展的企业级样品或MVP。
          </p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {lines.map((line) => (
            <article
              key={line.name}
              className="group rounded-2xl border border-white/10 bg-white/[.04] p-7 transition hover:border-white/20 hover:bg-white/[.07]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`grid size-12 place-items-center rounded-2xl ${line.tone}`}>
                  <line.icon size={24} weight="duotone" />
                </span>
                <ArrowUpRight
                  size={21}
                  className="text-slate-600 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                />
              </div>
              <h3 className="mt-8 text-xl font-bold">{line.name}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{line.output}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

