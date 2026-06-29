import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/user-auth";
import { findUserById } from "@/lib/user-storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getUserSession(request);
  if (!session) return NextResponse.json({ user: null });

  const user = await findUserById(session.userId);
  return NextResponse.json({ user });
}
