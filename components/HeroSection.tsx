import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  ClipboardText,
  Factory,
  Lightning,
  PlayCircle,
  TrendUp
} from "@phosphor-icons/react/dist/ssr";

const productionLines = [
  ["01", "10分钟AI诊断", "先判断企业最值得做的第一个AI项目"],
  ["02", "输出切入方向", "营销获客、效率自动化、知识库、MVP或培训"],
  ["03", "匹配样品验证", "先做可演示样品，再决定是否加大投入"],
  ["04", "进入成交路径", "报告解锁、人工诊断、样品包或升级服务"]
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200">
      <div className="page-shell grid min-h-[680px] items-center gap-14 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
        <div>
          <div className="eyebrow">
            <Factory size={15} weight="fill" />
            ENTERPRISE AI DIAGNOSIS
          </div>
          <h1 className="mt-7 max-w-3xl text-5xl font-black tracking-[-0.055em] text-ink sm:text-6xl lg:text-[68px] lg:leading-[1.04]">
            10分钟找出你企业
            <br />
            <span className="text-brand">最值得做的第一个AI项目</span>
          </h1>
          <p className="mt-7 max-w-2xl text-xl font-semibold leading-8 tracking-tight text-slate-700">
            不盲目买工具，不直接上大系统。先通过AI诊断，判断你的企业应该从营销获客、效率自动化、企业知识库、业务系统MVP还是团队培训切入。
          </p>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
            先诊断、先验证、再投入。报告会把真实业务需求拆成可诊断、可演示、可报价、可交付的AI项目路径。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/diagnosis" className="primary-button">
              免费开始AI诊断
              <ArrowRight size={17} />
            </Link>
            <Link href="/samples" className="secondary-button">
              <PlayCircle size={18} />
              查看AI样品案例
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
            {["无需注册", "真实API生成报告", "加微信后解锁完整报告"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle size={17} className="text-emerald-500" weight="fill" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_90px_rgba(15,23,42,.12)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Diagnosis Console
                </p>
                <p className="mt-1 font-bold text-ink">企业AI诊断成交漏斗</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500" />
                可开始
              </span>
            </div>
            <div className="grid gap-0 divide-y divide-slate-100">
              {productionLines.map(([number, title, output], index) => (
                <div
                  key={number}
                  className="group grid grid-cols-[52px_1fr_auto] items-center gap-4 px-6 py-5 transition hover:bg-slate-50"
                >
                  <span className="font-mono text-sm font-bold text-brand">{number}</span>
                  <div>
                    <p className="font-bold text-ink">{title}</p>
                    <p className="mt-1 text-sm text-slate-500">{output}</p>
                  </div>
                  <span
                    className={`grid size-9 place-items-center rounded-xl ${
                      index === 0
                        ? "bg-blue-50 text-brand"
                        : index === 1
                          ? "bg-violet-50 text-violet-600"
                          : index === 2
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {index === 0 ? (
                      <ClipboardText size={18} weight="duotone" />
                    ) : index % 2 === 0 ? (
                      <Lightning size={18} weight="duotone" />
                    ) : (
                      <TrendUp size={18} weight="duotone" />
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 border-t border-slate-200 bg-slate-50">
              {[
                ["7天", "样品验证"],
                ["30天", "ROI复盘"],
                ["90天", "系统升级"]
              ].map(([value, label]) => (
                <div key={value} className="border-r border-slate-200 px-4 py-5 text-center last:border-0">
                  <p className="text-xl font-black tracking-tight text-ink">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
