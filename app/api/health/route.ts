import { NextResponse } from "next/server";
import { getDb, DatabaseConfigError } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const env = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    openaiModel: process.env.OPENAI_MODEL || "gpt-5-mini",
    tursoUrl: Boolean(process.env.TURSO_DATABASE_URL),
    tursoToken: Boolean(process.env.TURSO_AUTH_TOKEN),
    databaseMode: process.env.DATABASE_MODE || "remote",
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
    jwtSecret: Boolean(process.env.JWT_SECRET)
  };

  try {
    await getDb().execute("SELECT 1");
    return NextResponse.json({
      ok: true,
      database: "connected",
      env
    });
  } catch (error) {
    const isConfigError = error instanceof DatabaseConfigError;
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        ok: false,
        database: isConfigError ? "not_configured" : "connection_failed",
        env,
        error: isConfigError
          ? "生产数据库未配置，请设置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN。"
          : "数据库连接失败，请检查 Turso 地址、Token 或 Render 网络日志。"
      },
      { status: 503 }
    );
  }
}
