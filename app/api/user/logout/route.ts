import { NextResponse } from "next/server";
import { USER_AUTH_COOKIE } from "@/lib/user-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(USER_AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
  return response;
}
