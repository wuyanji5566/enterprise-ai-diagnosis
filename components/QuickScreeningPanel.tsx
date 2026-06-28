"use client";

import { useMemo, useState } from "react";
import { ArrowDown, CheckCircle, Compass, Sparkle } from "@phosphor-icons/react";

const QUESTIONS = [
  {
    key: "problem",
    title: "你最想解决的问题是什么？",
    options: ["客户和线索不够", "重复人工太多", "资料和客服问答混乱", "业务流程需要系统化", "团队不会真正用AI"]
  },
  {
    key: "material",
    title: "企业目前有没有产品/业务资料？",
    options: ["资料比较完整", "有一些零散资料", "主要靠员工经验", "暂时很少"]
  },
  {
    key: "owner",
    title: "是否有人负责执行？",
    options: ["老板亲自推进", "有市场/运营负责人", "有IT或数字化负责人", "暂时没人负责"]
  },
  {
    key: "firstStep",
    title: "更想先做样品、培训还是系统？",
    options: ["先做样品验证", "先做团队培训", "先做业务系统", "先看诊断建议"]
  },
  {
    key: "budget",
    title: "预算大概在哪个区间？",
    options: ["¥1000以内", "¥1000-5000", "¥5000-20000", "¥20000以上", "先看方案"]
  }
];

const DIRECTIONS = {
  marketing: {
    title: "AI营销增长",
    summary: "更适合先做产品卖点、详情页视觉、短视频脚本或私域获客样品，用低成本验证客户是否愿意咨询。"
  },
  automation: {
    title: "效率自动化",
    summary: "更适合先选一个高频重复流程，例如Excel报表、资料整理、报价或周报，验证节省工时和错误率下降。"
  },
  knowledge: {
    title: "企业知识库",
    summary: "更适合先整理高频资料和问答，做一个可演示的知识库或客服问答Demo，再评估是否接入业务渠道。"
  },
  system: {
    title: "业务系统MVP",
    summary: "更适合先把报价、项目、客户、课程或门店管理拆成MVP，不建议一开始直接做完整大系统。"
  },
  training: {
    title: "企业AI培训陪跑",
    summary: "更适合先做企业AI实战陪跑，让团队围绕真实业务任务形成可复用流程，而不是只学工具功能。"
  }
};

type DirectionKey = keyof typeof DIRECTIONS;

function pickDirection(answers: Record<string, string>): DirectionKey {
  const text = Object.values(answers).join(" ");
  if (text.includes("客户") || text.includes("线索") || text.includes("样品")) return "marketing";
  if (text.includes("重复") || text.includes("人工") || text.includes("报表")) return "automation";
  if (text.includes("资料") || text.includes("客服") || text.includes("问答")) return "knowledge";
  if (text.includes("系统") || text.includes("流程")) return "system";
  return "training";
}

export function QuickScreeningPanel() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const completed = Object.keys(answers).length;
  const direction = useMemo(() => DIRECTIONS[pickDirection(answers)], [answers]);
  const canSubmit = completed === QUESTIONS.length;

  return (
    <section className="mb-10 rounded-3xl border border-blue-200 bg-brand-soft/50 p-5 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="eyebrow bg-white">
            <Compass size={14} weight="fill" />
            快速初筛模式
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-ink">
            不确定是否适合完整诊断？先做30秒快速初筛
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            初筛只给初步方向，不生成正式报告。完整六步诊断会继续输出成熟度评分、TOP3项目、预算和行动路线。
          </p>
        </div>
        <div className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-brand shadow-sm">
          已完成 {completed} / {QUESTIONS.length}
        </div>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-5">
        {QUESTIONS.map((question, index) => (
          <div key={question.key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-400">Q{index + 1}</p>
            <h3 className="mt-2 min-h-10 text-sm font-black leading-5 text-ink">
              {question.title}
            </h3>
            <div className="mt-3 grid gap-2">
              {question.options.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAnswers((current) => ({ ...current, [question.key]: value }));
                    setSubmitted(false);
                  }}
                  className={`min-h-10 rounded-xl border px-3 py-2 text-left text-xs font-bold leading-5 transition ${
                    answers[question.key] === value
                      ? "border-brand bg-brand text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="primary-button"
          disabled={!canSubmit}
          onClick={() => setSubmitted(true)}
        >
          <Sparkle size={17} weight="fill" />
          快速提交，查看初步方向
        </button>
        <a href="#formal-diagnosis" className="secondary-button">
          继续填写完整诊断
          <ArrowDown size={17} />
        </a>
      </div>

      {submitted && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle size={20} weight="fill" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                初步方向
              </p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-ink">
                {direction.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{direction.summary}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-brand">
                建议继续完成完整六步诊断，系统会进一步给出项目优先级、预算区间和7/30/90天路线。
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
