import { createClient, type Client } from "@libsql/client";

let _db: Client | null = null;

export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

export function getDb(): Client {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const forceLocal = process.env.DATABASE_MODE === "local";

  if (forceLocal) {
    // 本地 SQLite 文件（仅限开发环境）
    _db = createClient({ url: "file:./data.db" });
  } else if (url && authToken) {
    // Turso 远程数据库（生产环境）
    _db = createClient({ url, authToken });
  } else if (process.env.NODE_ENV === "production") {
    throw new DatabaseConfigError(
      "生产环境缺少 TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN。请在 Render Environment Variables 中配置 Turso 数据库。"
    );
  } else {
    // 本地开发兜底
    _db = createClient({ url: "file:./data.db" });
  }

  return _db;
}
