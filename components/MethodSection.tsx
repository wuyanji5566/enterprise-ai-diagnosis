const methods = [
  ["01", "诊断业务", "识别真实需求、伪需求和优先级，先确定问题是否值得做。"],
  ["02", "设计样品", "先做一个可演示、可验证的小成果，让决策不再只靠想象。"],
  ["03", "小步验证", "用7天/30天周期验证ROI、用户接受度和流程可行性。"],
  ["04", "系统交付", "再进入培训、自动化、系统开发和长期陪跑。"]
];

export function MethodSection() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="section-heading">
          <span className="eyebrow">DELIVERY METHOD</span>
          <h2>企业AI落地四步法</h2>
          <p>把高风险的大项目拆成四个可验收阶段，让每一次投入都有明确的业务证据。</p>
        </div>
        <div className="mt-12 grid border-y border-slate-200 md:grid-cols-2 xl:grid-cols-4">
          {methods.map(([number, title, copy]) => (
            <article
              key={number}
              className="border-b border-slate-200 px-2 py-8 md:border-r md:px-7 xl:border-b-0 first:pl-0 last:border-r-0"
            >
              <span className="font-mono text-sm font-bold text-brand">{number}</span>
              <h3 className="mt-8 text-xl font-black tracking-tight text-ink">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-500">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

