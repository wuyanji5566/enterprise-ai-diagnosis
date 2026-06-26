import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策"
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white py-16 sm:py-24">
        <div className="page-shell max-w-3xl">
          <h1 className="text-4xl font-black tracking-[-0.04em] text-ink">隐私政策</h1>
          <p className="mt-3 text-sm text-slate-400">最后更新：2026年6月25日</p>

          <section className="mt-12 space-y-4 text-sm leading-7 text-slate-600">
            <h2 className="text-lg font-bold text-ink">1. 信息收集</h2>
            <p>
              企业AI数字工厂（以下简称“本系统”）在提供企业AI诊断服务时，会收集你主动填写的信息，包括但不限于：企业名称、所属行业、员工规模、营收范围、主营业务、问卷填写人角色、业务链路描述、销售体系信息、营销能力信息、成本结构信息以及AI规划偏好。
            </p>
            <p>
              收集这些信息的目的仅限于：生成企业AI诊断报告、匹配适合的AI服务方案、以及后续的服务沟通与报价参考。
            </p>

            <h2 className="text-lg font-bold text-ink">2. 信息使用</h2>
            <p>你提供的企业信息将用于以下用途：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>通过AI模型生成针对性的企业AI诊断报告</li>
              <li>根据诊断结果推荐匹配的企业AI服务方案</li>
              <li>运营团队进行后续的服务沟通与跟进</li>
              <li>改进本系统的诊断算法和服务匹配模型</li>
            </ul>

            <h2 className="text-lg font-bold text-ink">3. 信息存储与安全</h2>
            <p>
              你的问卷数据和诊断报告将存储在云端数据库中。我们采用行业标准的安全措施保护你的数据，但无法保证互联网传输的绝对安全。诊断过程中，问卷数据会被发送至OpenAI API进行处理，OpenAI不会使用通过API发送的数据进行模型训练。
            </p>

            <h2 className="text-lg font-bold text-ink">4. 信息共享</h2>
            <p>
              未经你的明确同意，我们不会将你的企业信息出售、交易或转让给第三方。以下情况除外：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>法律要求或政府部门依法要求披露</li>
              <li>保护本系统的合法权益</li>
              <li>诊断服务所必需的AI处理（如OpenAI API）</li>
            </ul>

            <h2 className="text-lg font-bold text-ink">5. Cookie</h2>
            <p>
              本系统使用必要的Cookie来维持诊断问卷的会话状态和管理员登录状态。Cookie不包含个人身份信息。你可以在浏览器设置中禁用Cookie，但这可能影响问卷进度的保存功能。
            </p>

            <h2 className="text-lg font-bold text-ink">6. 你的权利</h2>
            <p>你有权要求：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>查看我们持有的你的企业数据</li>
              <li>更正不准确的信息</li>
              <li>删除你的企业数据</li>
              <li>撤回数据处理的同意</li>
            </ul>
            <p>如需行使上述权利，请通过微信联系运营方。</p>

            <h2 className="text-lg font-bold text-ink">7. 政策更新</h2>
            <p>
              我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，重大变更将通过适当方式通知。
            </p>

            <h2 className="text-lg font-bold text-ink">8. 联系方式</h2>
            <p>如对本隐私政策有任何疑问，请通过以下方式联系我们：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>微信：请查看页面底部联系方式</li>
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
