import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/user-auth";
import { readReportForUser } from "@/lib/report-storage";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession(request);
  if (!session) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const { id } = await params;
  const result = await readReportForUser(id, session.userId);
  if (!result) {
    return NextResponse.json({ error: "没有找到这份报告。" }, { status: 404 });
  }

  return NextResponse.json(result);
}
