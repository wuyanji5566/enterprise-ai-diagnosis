import { createHash, randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import type { QuestionnaireData } from "@/types/diagnosis";
import type {
  DiagnosisRequestPublicStatus,
  DiagnosisRequestStatus
} from "@/types/diagnosis-request";

interface DiagnosisRequestRow {
  id: string;
  questionnaire_json: string;
  company_name: string;
  access_token_hash: string;
  status: string;
  failure_message: string | null;
  report_id: string | null;
  user_id: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
}

export interface DiagnosisRequestForGeneration {
  id: string;
  questionnaire: QuestionnaireData;
  companyName: string;
  accessTokenHash: string;
  userId: string | null;
}

export interface DiagnosisRequestAdminSummary extends DiagnosisRequestPublicStatus {
  industry: string;
  failureMessage?: string;
}

let schemaReady: Promise<void> | null = null;

function hashAccessToken(accessToken: string) {
  return createHash("sha256").update(accessToken).digest("hex");
}

function toStatus(value: unknown): DiagnosisRequestStatus {
  return ["pending_contact", "generating", "unlocked", "failed"].includes(String(value))
    ? (value as DiagnosisRequestStatus)
    : "pending_contact";
}

function toPublicStatus(row: DiagnosisRequestRow): DiagnosisRequestPublicStatus {
  const status = toStatus(row.status);
  return {
    id: row.id,
    companyName: row.company_name,
    status,
    submittedAt: row.created_at,
    failureMessage: status === "failed" && row.failure_message ? row.failure_message : undefined,
    reportId: status === "unlocked" && row.report_id ? row.report_id : undefined
  };
}

async function ensureDiagnosisRequestSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const db = getDb();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS diagnosis_requests (
        id TEXT PRIMARY KEY,
        questionnaire_json TEXT NOT NULL,
        company_name TEXT NOT NULL,
        access_token_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending_contact',
        failure_message TEXT DEFAULT NULL,
        report_id TEXT DEFAULT NULL,
        user_id TEXT DEFAULT NULL,
        created_at TEXT NOT NULL,
        confirmed_at TEXT DEFAULT NULL,
        completed_at TEXT DEFAULT NULL
      )
    `);
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_status_created_at ON diagnosis_requests(status, created_at DESC)"
    );
  })();
  return schemaReady;
}

export function canStartDiagnosisGeneration(status: DiagnosisRequestStatus) {
  return status === "pending_contact" || status === "failed";
}

export async function createDiagnosisRequest(
  questionnaire: QuestionnaireData,
  userId?: string | null
) {
  await ensureDiagnosisRequestSchema();
  const id = `DX-${randomBytes(7).toString("hex").toUpperCase()}`;
  const accessToken = randomBytes(32).toString("base64url");
  const createdAt = new Date().toISOString();

  await getDb().execute({
    sql: `INSERT INTO diagnosis_requests (
      id, questionnaire_json, company_name, access_token_hash, status, user_id, created_at
    ) VALUES (?, ?, ?, ?, 'pending_contact', ?, ?)`,
    args: [
      id,
      JSON.stringify(questionnaire),
      questionnaire.companyName,
      hashAccessToken(accessToken),
      userId ?? null,
      createdAt
    ]
  });

  return {
    requestId: id,
    accessToken,
    companyName: questionnaire.companyName,
    submittedAt: createdAt
  };
}

export async function readDiagnosisRequestForCustomer(
  id: string,
  accessToken: string
): Promise<DiagnosisRequestPublicStatus | null> {
  await ensureDiagnosisRequestSchema();
  const result = await getDb().execute({
    sql: `SELECT id, questionnaire_json, company_name, access_token_hash, status,
      failure_message, report_id, user_id, created_at, confirmed_at, completed_at
      FROM diagnosis_requests WHERE id = ? LIMIT 1`,
    args: [id]
  });
  const row = result.rows[0] as unknown as DiagnosisRequestRow | undefined;
  if (!row || hashAccessToken(accessToken) !== row.access_token_hash) return null;
  return toPublicStatus(row);
}

export async function readDiagnosisRequestForAdmin(
  id: string
): Promise<DiagnosisRequestForGeneration | null> {
  await ensureDiagnosisRequestSchema();
  const result = await getDb().execute({
    sql: `SELECT id, questionnaire_json, company_name, access_token_hash, status,
      failure_message, report_id, user_id, created_at, confirmed_at, completed_at
      FROM diagnosis_requests WHERE id = ? LIMIT 1`,
    args: [id]
  });
  const row = result.rows[0] as unknown as DiagnosisRequestRow | undefined;
  if (!row) return null;

  try {
    return {
      id: row.id,
      questionnaire: JSON.parse(row.questionnaire_json) as QuestionnaireData,
      companyName: row.company_name,
      accessTokenHash: row.access_token_hash,
      userId: row.user_id
    };
  } catch {
    return null;
  }
}

export async function listDiagnosisRequestsForAdmin(): Promise<DiagnosisRequestAdminSummary[]> {
  await ensureDiagnosisRequestSchema();
  const result = await getDb().execute(`
    SELECT id, questionnaire_json, company_name, access_token_hash, status,
      failure_message, report_id, user_id, created_at, confirmed_at, completed_at
    FROM diagnosis_requests
    ORDER BY created_at DESC
    LIMIT 200
  `);

  return result.rows.map((item) => {
    const row = item as unknown as DiagnosisRequestRow;
    let industry = "";
    try {
      industry = (JSON.parse(row.questionnaire_json) as QuestionnaireData).industry;
    } catch {
      industry = "未填写";
    }
    return { ...toPublicStatus(row), industry };
  });
}

export async function markDiagnosisRequestGenerating(id: string) {
  await ensureDiagnosisRequestSchema();
  const result = await getDb().execute({
    sql: `UPDATE diagnosis_requests
      SET status = 'generating', failure_message = NULL, confirmed_at = ?
      WHERE id = ? AND status IN ('pending_contact', 'failed')`,
    args: [new Date().toISOString(), id]
  });
  return Number(result.rowsAffected) > 0;
}

export async function markDiagnosisRequestFailed(id: string, message: string) {
  await ensureDiagnosisRequestSchema();
  await getDb().execute({
    sql: `UPDATE diagnosis_requests
      SET status = 'failed', failure_message = ?, completed_at = ?
      WHERE id = ?`,
    args: [message.slice(0, 500), new Date().toISOString(), id]
  });
}

export async function markDiagnosisRequestUnlocked(id: string, reportId: string) {
  await ensureDiagnosisRequestSchema();
  await getDb().execute({
    sql: `UPDATE diagnosis_requests
      SET status = 'unlocked', report_id = ?, failure_message = NULL, completed_at = ?
      WHERE id = ?`,
    args: [reportId, new Date().toISOString(), id]
  });
}
