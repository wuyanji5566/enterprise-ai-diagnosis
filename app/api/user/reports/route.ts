import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/user-auth";
import { listReportsForUser } from "@/lib/report-storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getUserSession(request);
  if (!session) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const reports = await listReportsForUser(session.userId);
  return NextResponse.json({ reports });
}
