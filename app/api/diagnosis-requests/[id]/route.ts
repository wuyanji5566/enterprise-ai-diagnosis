import { NextResponse } from "next/server";
import { readDiagnosisRequestForCustomer } from "@/lib/diagnosis-request-storage";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  if (!accessToken) {
    return NextResponse.json({ error: "缺少诊断访问凭证。" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await readDiagnosisRequestForCustomer(id, accessToken);
    if (!result) {
      return NextResponse.json({ error: "诊断不存在或访问凭证无效。" }, { status: 404 });
    }
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, private" }
    });
  } catch (error) {
    console.error("Diagnosis request read error:", error);
    return NextResponse.json({ error: "读取诊断状态失败。" }, { status: 500 });
  }
}
