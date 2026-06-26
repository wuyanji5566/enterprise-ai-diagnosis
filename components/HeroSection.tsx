import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Factory,
  Lightning,
  PlayCircle,
  TrendUp
} from "@phosphor-icons/react/dist/ssr";

const productionLines = [
  ["01", "诊断业务", "识别优先级与ROI"],
  ["02", "设计样品", "形成可演示成果"],
  ["03", "小步验证", "7–30天验证价值"],
  ["04", "系统交付", "培训、自动化与开发"]
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200">
      <div className="page-shell grid min-h-[680px] items-center gap-14 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
        <div>
          <div className="eyebrow">
            <Factory size={15} weight="fill" />
            ENTERPRISE AI DELIVERY
          </div>
          <h1 className="mt-7 max-w-3xl text-5xl font-black tracking-[-0.055em] text-ink sm:text-6xl lg:text-[72px] lg:leading-[1.02]">
            企业AI
            <br />
            <span className="text-brand">数字工厂</span>
          </h1>
          <p className="mt-7 max-w-2xl text-xl font-semibold leading-8 tracking-tight text-slate-700">
            从AI诊断到样品验证，再到系统交付，帮企业找到第一个真正能落地的AI应用场景。
          </p>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
            不是直接卖工具，也不是盲目上系统。先诊断企业业务，再识别AI机会，最后用低成本样品验证价值。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/diagnosis" className="primary-button">
              开始3分钟AI诊断
              <ArrowRight size={17} />
            </Link>
            <Link href="/samples" className="secondary-button">
              <PlayCircle size={18} />
              查看AI样品库
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
            {["无需注册", "自动生成报告", "匹配落地服务"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle size={17} className="text-emerald-500" weight="fill" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,.12),transparent_65%)]" />
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_90px_rgba(15,23,42,.12)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Factory Console
                </p>
                <p className="mt-1 font-bold text-ink">AI落地生产流程</p>
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
                    {index % 2 === 0 ? (
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
                ["7天", "首个样品"],
                ["30天", "验证ROI"],
                ["90天", "形成系统"]
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

