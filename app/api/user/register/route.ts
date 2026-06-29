import { NextResponse } from "next/server";
import { z } from "zod";
import { USER_AUTH_COOKIE, signUserToken } from "@/lib/user-auth";
import { createUser, findUserByEmail } from "@/lib/user-storage";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(80),
  name: z.string().trim().max(80).optional()
});

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(request, "user-register", 20, 60 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "注册尝试过多，请稍后再试。" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "请填写有效邮箱，密码至少 8 位。" },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(parsed.data.email);
    if (existing) {
      return NextResponse.json(
        { error: "这个邮箱已经注册，请直接登录。" },
        { status: 409 }
      );
    }

    const user = await createUser(parsed.data);
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
    console.error("User register error:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
