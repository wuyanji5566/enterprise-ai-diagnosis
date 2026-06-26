import { NextResponse } from "next/server";
import { readReportForCustomer } from "@/lib/report-storage";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!accessToken) {
    return NextResponse.json({ error: "缺少报告访问凭证。" }, { status: 401 });
  }

  try {
    const result = await readReportForCustomer(id, accessToken);
    if (!result) {
      return NextResponse.json({ error: "报告不存在或访问凭证无效。" }, { status: 404 });
    }
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, private" }
    });
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "读取报告失败。" }, { status: 500 });
  }
}
