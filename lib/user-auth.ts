import { SignJWT, jwtVerify } from "jose";

export const USER_AUTH_COOKIE = "ai_factory_user_token";

const JWT_EXPIRES = "30d";
const JWT_ISSUER = "enterprise-ai-factory";
const JWT_AUDIENCE = "enterprise-ai-factory-user";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET environment variable");
  return new TextEncoder().encode(secret);
}

export async function signUserToken(payload: {
  userId: string;
  email: string;
  name?: string;
}) {
  return new SignJWT({ ...payload, role: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(JWT_EXPIRES)
    .sign(getSecret());
}

export async function verifyUserToken(token: string): Promise<{
  userId: string;
  email: string;
  name?: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });
    if (
      payload.role !== "user" ||
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : undefined
    };
  } catch {
    return null;
  }
}

export async function getUserSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies[USER_AUTH_COOKIE];
  if (!token) return null;
  return verifyUserToken(token);
}

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key) result[key] = decodeURIComponent(rest.join("="));
  }
  return result;
}
