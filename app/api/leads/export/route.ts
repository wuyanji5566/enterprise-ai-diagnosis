import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { exportLeadsCSV } from "@/lib/lead-storage";

// GET：导出线索 CSV（需管理员权限）
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  try {
    const csv = await exportLeadsCSV();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  } catch (error) {
    console.error("Leads export error:", error);
    return NextResponse.json({ error: "导出失败。" }, { status: 500 });
  }
}
