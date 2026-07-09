import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Database,
  Factory,
  Lightning,
  Package,
  PlayCircle,
  RocketLaunch,
  Sparkle,
  UserCircle
} from "@phosphor-icons/react/dist/ssr";

const projectDirections = [
  { name: "营销获客", active: true },
  { name: "效率自动化", active: false },
  { name: "知识库", active: false },
  { name: "MVP系统", active: false },
  { name: "团队培训", active: false }
];

const topProjects = [
  {
    title: "短视频营销素材工厂",
    detail: "适合已有产品资料、想先验证获客内容的企业。"
  },
  {
    title: "企业资料知识库问答",
    detail: "适合资料分散、销售和客服重复答疑多的团队。"
  },
  {
    title: "报价单自动生成系统",
    detail: "适合报价规则稳定、交付前沟通成本高的业务。"
  }
];

const quickEntries = [
  { href: "/diagnosis", label: "AI诊断", desc: "10分钟生成方向建议", icon: Sparkle },
  { href: "/samples", label: "样品库", desc: "上传图片/视频看样品", icon: Package },
  { href: "/services", label: "服务方案", desc: "查看99/999/1999档", icon: Factory },
  { href: "/account", label: "我的报告", desc: "登录后保存和查看", icon: UserCircle }
];

export function HeroSection() {
  return (
    <section className="ai-hero-bg relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0">
        <div className="ai-noise" />
        <div className="ai-vignette" />
        <div className="ai-glow ai-glow-cyan left-[8%] top-[16%]" />
        <div className="ai-glow ai-glow-violet right-[2%] top-[-10%]" />
        <div className="ai-grid-overlay" />
      </div>

      <div className="page-shell relative z-10 grid min-h-[calc(100vh-72px)] items-center gap-12 py-12 lg:grid-cols-[.9fr_1.1fr] lg:py-16">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          <div className="ai-eyebrow mx-auto lg:mx-0">
            <Sparkle size={15} weight="fill" />
            AI DELIVERY OPERATING SYSTEM
          </div>

          <h1 className="mt-7 text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl lg:text-[68px] lg:leading-[1.04]">
            企业AI落地，从一份
            <span className="ai-gradient-text block">可成交的诊断报告开始</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg font-semibold leading-8 text-slate-300 sm:text-xl lg:mx-0">
            10分钟判断你的企业第一个AI项目该做什么。先看清优先级、预算区间、样品验证路径和下一步成交动作，再决定是否正式投入。
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/diagnosis" className="ai-primary-button">
              开始AI诊断
              <ArrowRight size={17} />
            </Link>
            <Link href="/samples" className="ai-secondary-button">
              <PlayCircle size={18} />
              上传素材做样品
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {["登录后保存报告", "真实API生成建议", "加微信领取解读"].map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm font-bold text-slate-200 backdrop-blur"
              >
                <CheckCircle size={17} className="text-cyan-300" weight="fill" />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickEntries.map((entry) => {
              const Icon = entry.icon;
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="group rounded-2xl border border-white/10 bg-white/[.045] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/[.07]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-cyan-300/12 text-cyan-300">
                      <Icon size={21} weight="duotone" />
                    </span>
                    <div>
                      <p className="font-black text-white">{entry.label}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">{entry.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="ai-dashboard-card">
            <div className="grid gap-5 border-b border-white/10 p-5 sm:grid-cols-[230px_1fr] sm:p-6">
              <div className="rounded-3xl border border-white/10 bg-white/[.045] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200/80">
                    Project Radar
                  </p>
                  <span className="size-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.85)]" />
                </div>
                <div className="mt-5 grid gap-2">
                  {projectDirections.map((item) => (
                    <div
                      key={item.name}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                        item.active
                          ? "bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-300/30"
                          : "bg-white/[.035] text-slate-400"
                      }`}
                    >
                      <span
                        className={`h-7 w-1 rounded-full ${
                          item.active ? "bg-cyan-300" : "bg-slate-600"
                        }`}
                      />
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      AI Maturity Score
                    </p>
                    <div className="mt-3 flex items-end gap-3">
                      <span className="text-6xl font-black tracking-[-0.06em] text-cyan-200">
                        B+
                      </span>
                      <span className="pb-2 text-sm font-bold text-slate-400">76 / 100</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-100">
                    建议先做样品验证
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {topProjects.map((project, index) => (
                    <div
                      key={project.title}
                      className="group rounded-2xl border border-white/10 bg-white/[.045] p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/[.07]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-cyan-300/15 text-sm font-black text-cyan-100">
                          {index + 1}
                        </span>
                        <h3 className="font-black text-white">{project.title}</h3>
                      </div>
                      <p className="mt-2 pl-12 text-sm leading-6 text-slate-400">
                        {project.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
              {[
                { icon: Brain, title: "判断优先级", desc: "先做最容易验证的AI项目" },
                { icon: Database, title: "匹配资料基础", desc: "看企业资料是否能支撑落地" },
                { icon: RocketLaunch, title: "进入成交路径", desc: "报告、样品、服务包自然承接" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[.045] p-4">
                    <Icon size={24} className="text-cyan-300" weight="duotone" />
                    <p className="mt-3 font-black text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute -right-3 -top-4 hidden rounded-2xl border border-violet-300/20 bg-violet-300/10 px-4 py-3 text-sm font-bold text-violet-100 shadow-[0_0_40px_rgba(124,58,237,.2)] lg:block">
            <Lightning size={16} className="mr-2 inline" weight="fill" />
            报告生成中
          </div>

          <div className="absolute -bottom-5 left-8 hidden rounded-2xl border border-cyan-300/20 bg-slate-950/90 px-5 py-4 text-sm font-bold text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,.18)] lg:block">
            <Factory size={16} className="mr-2 inline" weight="duotone" />
            诊断 → 样品 → MVP → 陪跑
          </div>
        </div>
      </div>
    </section>
  );
}
