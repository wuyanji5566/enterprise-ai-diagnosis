import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

const LOGIN_PATH = "/admin/login";
const JWT_ISSUER = "enterprise-ai-factory";
const JWT_AUDIENCE = "enterprise-ai-factory-admin";

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function verifyAdminToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature) return false;

    const header = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedHeader))
    ) as { alg?: string };
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload))
    ) as {
      role?: string;
      exp?: number;
      iss?: string;
      aud?: string | string[];
    };
    if (header.alg !== "HS256") return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signatureValid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    const audienceValid = Array.isArray(payload.aud)
      ? payload.aud.includes(JWT_AUDIENCE)
      : payload.aud === JWT_AUDIENCE;

    return Boolean(
      signatureValid &&
        payload.role === "admin" &&
        payload.iss === JWT_ISSUER &&
        audienceValid &&
        payload.exp &&
        payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只保护 /admin 路由，不保护 /admin/login 本身
  if (!pathname.startsWith("/admin") || pathname === LOGIN_PATH) {
    return NextResponse.next();
  }

  // API 路由也用 token 验证
  if (pathname.startsWith("/api/")) {
    return NextResponse.next(); // API 自己处理鉴权
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!(await verifyAdminToken(token))) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
