import { NextResponse } from "next/server";
import { POST as generateLegacyDiagnosis } from "@/app/api/diagnose/route";
import { verifyAdmin } from "@/lib/auth";
import {
  markDiagnosisRequestFailed,
  markDiagnosisRequestGenerating,
  markDiagnosisRequestUnlocked,
  readDiagnosisRequestForAdmin
} from "@/lib/diagnosis-request-storage";
import { unlockReportWithAccessHash } from "@/lib/report-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  const { id } = await params;
  const queued = await readDiagnosisRequestForAdmin(id);
  if (!queued) {
    return NextResponse.json({ error: "待确认诊断不存在。" }, { status: 404 });
  }
  if (!(await markDiagnosisRequestGenerating(id))) {
    return NextResponse.json({ error: "该诊断正在生成或已经完成，请刷新列表。" }, { status: 409 });
  }

  try {
    const internalRequest = new Request(new URL("/api/diagnose", request.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `admin-confirm-${id}`
      },
      body: JSON.stringify(queued.questionnaire)
    });
    const response = await generateLegacyDiagnosis(internalRequest);
    const data = (await response.json()) as { reportId?: string; error?: string; details?: string };
    if (!response.ok || !data.reportId) {
      throw new Error(data.details ? `${data.error ?? "报告生成失败"}：${data.details}` : data.error ?? "报告生成失败");
    }
    const unlocked = await unlockReportWithAccessHash(data.reportId, queued.accessTokenHash);
    if (!unlocked) throw new Error("报告生成成功，但解锁失败。");
    await markDiagnosisRequestUnlocked(id, data.reportId);
    return NextResponse.json({ success: true, reportId: data.reportId, status: "unlocked" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "报告生成失败，请稍后重试。";
    await markDiagnosisRequestFailed(id, message);
    console.error("Admin diagnosis confirmation error:", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
