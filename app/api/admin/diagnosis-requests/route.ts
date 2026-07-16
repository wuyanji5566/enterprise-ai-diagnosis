import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { listDiagnosisRequestsForAdmin } from "@/lib/diagnosis-request-storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }
  try {
    return NextResponse.json(
      { requests: await listDiagnosisRequestsForAdmin() },
      { headers: { "Cache-Control": "no-store, private" } }
    );
  } catch (error) {
    console.error("Admin diagnosis requests read error:", error);
    return NextResponse.json({ error: "读取待确认诊断失败。" }, { status: 500 });
  }
}
