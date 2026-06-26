import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { listReportsForAdmin } from "@/lib/report-storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  try {
    return NextResponse.json(
      { reports: await listReportsForAdmin() },
      { headers: { "Cache-Control": "no-store, private" } }
    );
  } catch (error) {
    console.error("Admin reports GET error:", error);
    return NextResponse.json({ error: "读取报告列表失败。" }, { status: 500 });
  }
}
