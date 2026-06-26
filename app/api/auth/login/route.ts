import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { signToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function secretsMatch(input: string, expected: string) {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(request, "admin-login", 10, 15 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "登录尝试过多，请稍后再试。" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) }
        }
      );
    }

    const { password } = (await request.json()) as { password?: string };
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "服务端未配置 ADMIN_PASSWORD，请联系管理员。" },
        { status: 500 }
      );
    }

    if (!password || !secretsMatch(password, adminPassword)) {
      return NextResponse.json(
        { error: "密码错误，请重试。" },
        { status: 401 }
      );
    }

    const token = await signToken({ role: "admin" });

    const response = NextResponse.json({ success: true });
    response.cookies.set("ai_factory_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
