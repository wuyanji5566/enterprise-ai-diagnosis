import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { unlockReport } from "@/lib/report-storage";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const unlocked = await unlockReport(id);
    if (!unlocked) {
      return NextResponse.json({ error: "报告不存在。" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report unlock error:", error);
    return NextResponse.json({ error: "报告解锁失败。" }, { status: 500 });
  }
}
