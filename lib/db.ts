import { createClient, type Client } from "@libsql/client";

let _db: Client | null = null;

export function getDb(): Client {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const forceLocal = process.env.DATABASE_MODE === "local";

  if (!forceLocal && url && authToken) {
    // Turso 远程数据库（生产 / Vercel）
    _db = createClient({ url, authToken });
  } else {
    // 本地 SQLite 文件（开发环境）
    _db = createClient({ url: "file:./data.db" });
  }

  return _db;
}
