import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { deleteReport } from "@/lib/report-storage";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteReport(id);
    if (!deleted) {
      return NextResponse.json({ error: "报告不存在。" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report delete error:", error);
    return NextResponse.json({ error: "删除报告失败。" }, { status: 500 });
  }
}
