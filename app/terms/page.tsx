import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款"
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white py-16 sm:py-24">
        <div className="page-shell max-w-3xl">
          <h1 className="text-4xl font-black tracking-[-0.04em] text-ink">服务条款</h1>
          <p className="mt-3 text-sm text-slate-400">最后更新：2026年6月25日</p>

          <section className="mt-12 space-y-4 text-sm leading-7 text-slate-600">
            <h2 className="text-lg font-bold text-ink">1. 服务说明</h2>
            <p>
              企业AI数字工厂（以下简称“本系统”）提供企业AI诊断、AI应用样品展示、AI服务方案匹配及相关咨询服务。诊断结果基于AI模型分析生成，用于项目初筛和方向判断，不替代正式咨询尽调。
            </p>

            <h2 className="text-lg font-bold text-ink">2. 免费诊断服务</h2>
            <p>
              免费AI初筛诊断提供初步的企业AI成熟度评估和方向建议。免费诊断结果的准确性和完整性受限于问卷信息的完整度，本系统不对免费诊断结果的具体实施效果做出保证。
            </p>

            <h2 className="text-lg font-bold text-ink">3. 诊断报告解锁（99元）</h2>
            <p>完成六步问卷后，AI自动生成诊断报告。支付99元可解锁完整报告内容，包含：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>企业AI成熟度详细分析</li>
              <li>四维业务机会矩阵</li>
              <li>TOP3可执行AI项目建议</li>
              <li>ROI测算与实施路线图</li>
              <li>服务包匹配建议</li>
              <li>正式PDF报告</li>
              <li>一次微信简要解读</li>
            </ul>
            <p>报告解锁后概不退款。如AI生成结果存在明显质量问题，可联系客服申请人工复核。</p>

            <h2 className="text-lg font-bold text-ink">4. 人工诊断服务（999元起）</h2>
            <p>
              人工深度诊断包含人工访谈、资料分析和正式落地方案建议。具体服务内容和报价将在初步沟通后确定。服务过程中如客户单方面中止，已完成的阶段工作不予退款。
            </p>

            <h2 className="text-lg font-bold text-ink">5. 用户责任</h2>
            <p>使用本系统时，你同意：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>提供真实、准确的企业信息</li>
              <li>不利用本系统从事违法活动</li>
              <li>不对本系统进行逆向工程或未授权访问</li>
              <li>妥善保管管理员账号密码</li>
            </ul>

            <h2 className="text-lg font-bold text-ink">6. 免责声明</h2>
            <p>
              本系统提供的诊断结果和建议基于AI模型分析，仅供参考。企业在做出任何商业决策前，应结合自身实际情况进行独立判断。本系统不对因使用诊断结果而导致的任何直接或间接损失承担责任。
            </p>

            <h2 className="text-lg font-bold text-ink">7. 知识产权</h2>
            <p>
              本系统的代码、设计、诊断模型、报告模板和服务方案均为运营方的知识产权。诊断生成的报告内容归用户所有，但报告结构和分析方法的知识产权仍归运营方。
            </p>

            <h2 className="text-lg font-bold text-ink">8. 服务变更与终止</h2>
            <p>
              本系统保留随时修改或终止服务的权利。服务价格、内容和可用性可能随时调整，已付费的服务不受影响。
            </p>

            <h2 className="text-lg font-bold text-ink">9. 条款更新</h2>
            <p>
              我们可能会不时更新本服务条款。更新后的条款将在本页面发布，继续使用本系统即表示你接受更新后的条款。
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
