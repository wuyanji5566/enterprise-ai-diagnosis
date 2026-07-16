import { createHash, randomBytes } from "crypto";
import { getDb } from "@/lib/db";
import type {
  DiagnosisReport,
  DiagnosisReportPreview
} from "@/types/diagnosis";

export type ReportStatus = "locked" | "unlocked";

export interface StoredReportSummary {
  id: string;
  companyName: string;
  status: ReportStatus;
  reportType: string;
  createdAt: string;
  unlockedAt: string | null;
}

export interface UserReportSummary extends StoredReportSummary {
  preview: DiagnosisReportPreview;
}

let schemaReady: Promise<void> | null = null;

async function ensureReportSchema() {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const db = getDb();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        report_type TEXT NOT NULL DEFAULT 'free',
        report_json TEXT NOT NULL,
        diagnosis_code TEXT DEFAULT NULL,
        access_token_hash TEXT DEFAULT NULL,
        status TEXT NOT NULL DEFAULT 'locked',
        created_at TEXT NOT NULL,
        unlocked_at TEXT DEFAULT NULL,
        user_id TEXT DEFAULT NULL
      )
    `);

    for (const statement of [
      "ALTER TABLE reports ADD COLUMN access_token_hash TEXT DEFAULT NULL",
      "ALTER TABLE reports ADD COLUMN status TEXT NOT NULL DEFAULT 'locked'",
      "ALTER TABLE reports ADD COLUMN unlocked_at TEXT DEFAULT NULL",
      "ALTER TABLE reports ADD COLUMN user_id TEXT DEFAULT NULL"
    ]) {
      try {
        await db.execute(statement);
      } catch (error) {
        if (!String(error).toLowerCase().includes("duplicate column")) {
          throw error;
        }
      }
    }

    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_reports_status_created_at ON reports(status, created_at DESC)"
    );
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_reports_user_created_at ON reports(user_id, created_at DESC)"
    );
  })();

  return schemaReady;
}

function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parseReport(value: unknown): DiagnosisReport | null {
  try {
    return JSON.parse(String(value)) as DiagnosisReport;
  } catch {
    return null;
  }
}

export function createReportPreview(report: DiagnosisReport): DiagnosisReportPreview {
  return {
    companyName: report.companyName,
    maturityScore: report.maturityScore,
    maturityLevel: report.maturityLevel,
    businessConclusion: report.businessConclusion,
    generatedAt: report.generatedAt
  };
}

export async function saveLockedReport(
  report: DiagnosisReport,
  userId?: string | null
): Promise<{
  reportId: string;
  accessToken: string;
  preview: DiagnosisReportPreview;
}> {
  await ensureReportSchema();
  const db = getDb();
  const reportId = `rpt-${Date.now()}-${randomBytes(6).toString("hex")}`;
  const accessToken = randomBytes(32).toString("base64url");

  await db.execute({
    sql: `INSERT INTO reports (
      id, company_name, report_type, report_json, diagnosis_code,
      access_token_hash, status, created_at, unlocked_at, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, 'locked', ?, NULL, ?)`,
    args: [
      reportId,
      report.companyName,
      report.reportType,
      JSON.stringify(report),
      null,
      hashAccessToken(accessToken),
      report.generatedAt,
      userId || null
    ]
  });

  return {
    reportId,
    accessToken,
    preview: createReportPreview(report)
  };
}

export async function readReportForCustomer(
  id: string,
  accessToken: string
): Promise<
  | { status: "locked"; preview: DiagnosisReportPreview }
  | { status: "unlocked"; report: DiagnosisReport }
  | null
> {
  await ensureReportSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT report_json, status, access_token_hash
          FROM reports WHERE id = ? LIMIT 1`,
    args: [id]
  });
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const expectedHash = String(row.access_token_hash ?? "");
  if (!expectedHash || hashAccessToken(accessToken) !== expectedHash) return null;

  const report = parseReport(row.report_json);
  if (!report) return null;

  if (String(row.status) !== "unlocked") {
    return { status: "locked", preview: createReportPreview(report) };
  }

  return {
    status: "unlocked",
    report: { ...report, reportType: "paid99" }
  };
}

export async function listReportsForAdmin(): Promise<StoredReportSummary[]> {
  await ensureReportSchema();
  const db = getDb();
  const result = await db.execute(`
    SELECT id, company_name, status, report_type, created_at, unlocked_at
    FROM reports
    ORDER BY created_at DESC
    LIMIT 200
  `);
  return result.rows.map((row) => ({
    id: String(row.id),
    companyName: String(row.company_name),
    status: String(row.status) === "unlocked" ? "unlocked" : "locked",
    reportType: String(row.report_type),
    createdAt: String(row.created_at),
    unlockedAt: row.unlocked_at ? String(row.unlocked_at) : null
  }));
}

export async function readReportForAdmin(id: string): Promise<DiagnosisReport | null> {
  await ensureReportSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT report_json FROM reports WHERE id = ? LIMIT 1",
    args: [id]
  });
  if (result.rows.length === 0) return null;
  return parseReport(result.rows[0].report_json);
}

export async function listReportsForUser(userId: string): Promise<UserReportSummary[]> {
  await ensureReportSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, company_name, status, report_type, report_json, created_at, unlocked_at
          FROM reports
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 100`,
    args: [userId]
  });

  return result.rows
    .map((row) => {
      const report = parseReport(row.report_json);
      if (!report) return null;
      return {
        id: String(row.id),
        companyName: String(row.company_name),
        status: String(row.status) === "unlocked" ? "unlocked" : "locked",
        reportType: String(row.report_type),
        createdAt: String(row.created_at),
        unlockedAt: row.unlocked_at ? String(row.unlocked_at) : null,
        preview: createReportPreview(report)
      } satisfies UserReportSummary;
    })
    .filter(Boolean) as UserReportSummary[];
}

export async function readReportForUser(
  id: string,
  userId: string
): Promise<
  | { status: "locked"; preview: DiagnosisReportPreview }
  | { status: "unlocked"; report: DiagnosisReport }
  | null
> {
  await ensureReportSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT report_json, status FROM reports WHERE id = ? AND user_id = ? LIMIT 1",
    args: [id, userId]
  });
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const report = parseReport(row.report_json);
  if (!report) return null;

  if (String(row.status) !== "unlocked") {
    return { status: "locked", preview: createReportPreview(report) };
  }

  return {
    status: "unlocked",
    report: { ...report, reportType: "paid99" }
  };
}

export async function unlockReport(id: string): Promise<boolean> {
  await ensureReportSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `UPDATE reports
          SET status = 'unlocked', report_type = 'paid99', unlocked_at = ?
          WHERE id = ?`,
    args: [new Date().toISOString(), id]
  });
  if (Number(result.rowsAffected) > 0) {
    try {
      await db.execute({
        sql: `UPDATE leads
              SET paid99 = '是', diagnosis_type = '99元深度诊断'
              WHERE note LIKE ?`,
        args: [`%报告编号：${id}%`]
      });
    } catch (error) {
      console.error("Report unlock lead sync error:", error);
    }
  }
  return Number(result.rowsAffected) > 0;
}

export async function unlockReportWithAccessHash(
  id: string,
  accessTokenHash: string
): Promise<boolean> {
  await ensureReportSchema();
  const result = await getDb().execute({
    sql: `UPDATE reports
          SET status = 'unlocked', report_type = 'paid99', unlocked_at = ?, access_token_hash = ?
          WHERE id = ?`,
    args: [new Date().toISOString(), accessTokenHash, id]
  });
  return Number(result.rowsAffected) > 0;
}

export async function deleteReport(id: string): Promise<boolean> {
  await ensureReportSchema();
  const result = await getDb().execute({
    sql: "DELETE FROM reports WHERE id = ?",
    args: [id]
  });
  return Number(result.rowsAffected) > 0;
}

export async function getReportByCode(code: string): Promise<DiagnosisReport | null> {
  await ensureReportSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT report_json FROM reports WHERE diagnosis_code = ?",
    args: [code]
  });
  if (result.rows.length === 0) return null;
  return parseReport(result.rows[0].report_json);
}
