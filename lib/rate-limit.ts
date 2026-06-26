import { createHash } from "crypto";
import { getDb } from "@/lib/db";

let schemaReady: Promise<void> | null = null;

async function ensureRateLimitSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = getDb()
    .execute(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `)
    .then(() => undefined);
  return schemaReady;
}

function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export async function checkRateLimit(
  request: Request,
  namespace: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  await ensureRateLimitSchema();
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const expiresAt = windowStart + windowSeconds;
  const key = createHash("sha256")
    .update(`${namespace}:${getClientAddress(request)}:${windowStart}`)
    .digest("hex");

  await db.execute({
    sql: `INSERT INTO rate_limits (key, count, expires_at)
          VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET count = count + 1`,
    args: [key, expiresAt]
  });

  const result = await db.execute({
    sql: "SELECT count FROM rate_limits WHERE key = ?",
    args: [key]
  });
  const count = Number(result.rows[0]?.count ?? limit + 1);

  if (Math.random() < 0.02) {
    await db.execute({
      sql: "DELETE FROM rate_limits WHERE expires_at < ?",
      args: [now]
    });
  }

  return {
    allowed: count <= limit,
    retryAfter: Math.max(1, expiresAt - now)
  };
}
