// 数据库迁移脚本
// 开发时运行：npx tsx db/migrate.ts

import { createClient } from "@libsql/client";

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    process.exit(1);
  }

  const db = createClient({ url: tursoUrl, authToken: tursoToken });

  const statements = [
    `CREATE TABLE IF NOT EXISTS leads (
      id                 TEXT PRIMARY KEY,
      company_name       TEXT NOT NULL,
      industry           TEXT NOT NULL DEFAULT '',
      employees          INTEGER NOT NULL DEFAULT 0,
      maturity_score     INTEGER NOT NULL DEFAULT 0,
      client_fit_level   TEXT NOT NULL DEFAULT 'C类客户',
      budget_signal      TEXT NOT NULL DEFAULT '未知',
      urgency            TEXT NOT NULL DEFAULT '中',
      data_readiness     TEXT NOT NULL DEFAULT '弱',
      recommended_service TEXT NOT NULL DEFAULT '',
      recommended_next_step TEXT NOT NULL DEFAULT '免费沟通',
      diagnosis_type     TEXT NOT NULL DEFAULT '免费初筛',
      wechat_added       TEXT NOT NULL DEFAULT '未知',
      paid99             TEXT NOT NULL DEFAULT '未知',
      referral_source    TEXT NOT NULL DEFAULT '自然访问',
      referrer           TEXT NOT NULL DEFAULT '',
      collection_next_action TEXT NOT NULL DEFAULT '发诊断链接',
      submitted_at       TEXT NOT NULL,
      status             TEXT NOT NULL DEFAULT '新线索',
      note               TEXT NOT NULL DEFAULT '',
      contact_name       TEXT DEFAULT NULL,
      contact_method     TEXT DEFAULT NULL,
      source             TEXT NOT NULL DEFAULT 'AI诊断'
    )`,
    `CREATE TABLE IF NOT EXISTS reports (
      id              TEXT PRIMARY KEY,
      company_name    TEXT NOT NULL,
      report_type     TEXT NOT NULL DEFAULT 'free',
      report_json     TEXT NOT NULL,
      diagnosis_code  TEXT DEFAULT NULL,
      access_token_hash TEXT DEFAULT NULL,
      status          TEXT NOT NULL DEFAULT 'locked',
      created_at      TEXT NOT NULL,
      unlocked_at     TEXT DEFAULT NULL
    )`,
    `ALTER TABLE reports ADD COLUMN access_token_hash TEXT DEFAULT NULL`,
    `ALTER TABLE reports ADD COLUMN status TEXT NOT NULL DEFAULT 'locked'`,
    `ALTER TABLE reports ADD COLUMN unlocked_at TEXT DEFAULT NULL`,
    `CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON leads(submitted_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
    `CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source)`,
    `CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_reports_status_created_at ON reports(status, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )`
  ];

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
    } catch (error) {
      if (
        stmt.startsWith("ALTER TABLE") &&
        String(error).toLowerCase().includes("duplicate column")
      ) {
        continue;
      }
      throw error;
    }
  }

  console.log("✅ Database migration applied successfully");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
