import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET environment variable");
  return new TextEncoder().encode(secret);
};

const JWT_EXPIRES = "7d";
const JWT_ISSUER = "enterprise-ai-factory";
const JWT_AUDIENCE = "enterprise-ai-factory-admin";

/** 签发 JWT Token（Node.js / Edge 均可） */
export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(JWT_EXPIRES)
    .sign(getSecret());
}

/** 验证 JWT Token（Node.js / Edge 均可） */
export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE = "ai_factory_admin_token";

/** API 路由鉴权：从 cookie 验证 admin 身份 */
export async function verifyAdmin(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies[AUTH_COOKIE];
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === "admin";
}

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key) result[key] = rest.join("=");
  }
  return result;
}
