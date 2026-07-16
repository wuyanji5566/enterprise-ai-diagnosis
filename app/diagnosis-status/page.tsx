import { DiagnosisStatusPanel } from "@/components/DiagnosisStatusPanel";
import { SiteHeader } from "@/components/SiteHeader";

export default async function DiagnosisStatusPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const { id, token } = await searchParams;

  return (
    <>
      <SiteHeader />
      {id && token ? (
        <DiagnosisStatusPanel requestId={id} accessToken={token} />
      ) : (
        <main className="ai-page-bg flex min-h-[calc(100vh-72px)] items-center justify-center px-5 text-white">
          <div className="rounded-3xl border border-white/10 bg-white/[.05] p-8 text-center">
            <h1 className="text-2xl font-black">缺少诊断访问凭证</h1>
            <p className="mt-3 text-sm text-slate-300">请从提交成功后的链接重新进入。</p>
          </div>
        </main>
      )}
    </>
  );
}
