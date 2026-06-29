import { NextResponse } from "next/server";
import { z } from "zod";
import { USER_AUTH_COOKIE, signUserToken } from "@/lib/user-auth";
import { verifyUserLogin } from "@/lib/user-storage";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(80)
});

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(request, "user-login", 20, 15 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "登录尝试过多，请稍后再试。" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "请填写有效邮箱和密码。" },
        { status: 400 }
      );
    }

    const user = await verifyUserLogin(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json(
        { error: "邮箱或密码错误，请重试。" },
        { status: 401 }
      );
    }

    const token = await signUserToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json({ user });
    response.cookies.set(USER_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });
    return response;
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
