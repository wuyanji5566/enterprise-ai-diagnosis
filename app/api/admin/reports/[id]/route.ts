import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { deleteReport, readReportForAdmin } from "@/lib/report-storage";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const report = await readReportForAdmin(id);
    if (!report) {
      return NextResponse.json({ error: "报告不存在。" }, { status: 404 });
    }
    return NextResponse.json(
      { report },
      { headers: { "Cache-Control": "no-store, private" } }
    );
  } catch (error) {
    console.error("Admin report GET error:", error);
    return NextResponse.json({ error: "读取报告失败。" }, { status: 500 });
  }
}

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
