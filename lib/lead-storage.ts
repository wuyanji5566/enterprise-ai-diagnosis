import { getDb } from "@/lib/db";
import type { LeadRecord, LeadStatus } from "@/types/lead";

export { createLeadRecord, MOCK_LEADS } from "./lead-factory";

let schemaReady: Promise<void> | null = null;

async function ensureLeadSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const db = getDb();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        industry TEXT NOT NULL DEFAULT '',
        employees INTEGER NOT NULL DEFAULT 0,
        maturity_score INTEGER NOT NULL DEFAULT 0,
        client_fit_level TEXT NOT NULL DEFAULT 'C类客户',
        budget_signal TEXT NOT NULL DEFAULT '未知',
        urgency TEXT NOT NULL DEFAULT '中',
        data_readiness TEXT NOT NULL DEFAULT '弱',
        recommended_service TEXT NOT NULL DEFAULT '',
        recommended_next_step TEXT NOT NULL DEFAULT '免费沟通',
        diagnosis_type TEXT NOT NULL DEFAULT '免费初筛',
        wechat_added TEXT NOT NULL DEFAULT '未知',
        paid99 TEXT NOT NULL DEFAULT '未知',
        referral_source TEXT NOT NULL DEFAULT '自然访问',
        referrer TEXT NOT NULL DEFAULT '',
        collection_next_action TEXT NOT NULL DEFAULT '发诊断链接',
        submitted_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT '新线索',
        note TEXT NOT NULL DEFAULT '',
        contact_name TEXT DEFAULT NULL,
        contact_method TEXT DEFAULT NULL,
        source TEXT NOT NULL DEFAULT 'AI诊断'
      )
    `);
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON leads(submitted_at DESC)"
    );
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)"
    );
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source)"
    );
  })();
  return schemaReady;
}

/** 从数据库读取所有线索 */
export async function readLeads(): Promise<LeadRecord[]> {
  try {
    await ensureLeadSchema();
    const db = getDb();
    const result = await db.execute(
      "SELECT * FROM leads ORDER BY submitted_at DESC LIMIT 200"
    );
    return result.rows.map(rowToLead);
  } catch (error) {
    console.error("readLeads error:", error);
    return [];
  }
}

/** 按 ID 读取单条线索 */
export async function readLeadById(id: string): Promise<LeadRecord | null> {
  try {
    await ensureLeadSchema();
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM leads WHERE id = ?",
      args: [id]
    });
    if (result.rows.length === 0) return null;
    return rowToLead(result.rows[0]);
  } catch (error) {
    console.error("readLeadById error:", error);
    return null;
  }
}

/** 保存线索（新增或按 company+service 去重更新） */
export async function saveLead(record: LeadRecord): Promise<LeadRecord[]> {
  try {
    await ensureLeadSchema();
    const db = getDb();
    const existing = await db.execute({
      sql: "SELECT id FROM leads WHERE company_name = ? AND recommended_service = ?",
      args: [record.companyName, record.recommendedService]
    });

    if (existing.rows.length > 0) {
      await updateLeadInDb(db, existing.rows[0].id as string, record);
    } else {
      await insertLead(db, record);
    }

    return readLeads();
  } catch (error) {
    console.error("saveLead error:", error);
    return [];
  }
}

/** 更新线索状态 */
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<LeadRecord[]> {
  try {
    await ensureLeadSchema();
    const db = getDb();
    await db.execute({
      sql: "UPDATE leads SET status = ? WHERE id = ?",
      args: [status, id]
    });
    return readLeads();
  } catch (error) {
    console.error("updateLeadStatus error:", error);
    return [];
  }
}

/** 更新线索备注 */
export async function updateLeadNote(id: string, note: string): Promise<LeadRecord[]> {
  try {
    await ensureLeadSchema();
    const db = getDb();
    await db.execute({
      sql: "UPDATE leads SET note = ? WHERE id = ?",
      args: [note, id]
    });
    return readLeads();
  } catch (error) {
    console.error("updateLeadNote error:", error);
    return [];
  }
}

/** 更新线索任意字段 */
export async function updateLeadField<K extends keyof LeadRecord>(
  id: string,
  field: K,
  value: LeadRecord[K]
): Promise<LeadRecord[]> {
  try {
    await ensureLeadSchema();
    const db = getDb();
    const column = leadColumnMap[field];
    if (!column) throw new Error(`Unsupported lead field: ${String(field)}`);
    await db.execute({
      sql: `UPDATE leads SET ${column} = ? WHERE id = ?`,
      args: [String(value ?? ""), id]
    });
    return readLeads();
  } catch (error) {
    console.error("updateLeadField error:", error);
    return [];
  }
}

/** 删除线索 */
export async function deleteLead(id: string): Promise<void> {
  try {
    await ensureLeadSchema();
    const db = getDb();
    await db.execute({ sql: "DELETE FROM leads WHERE id = ?", args: [id] });
  } catch (error) {
    console.error("deleteLead error:", error);
  }
}

/** 导出 CSV（UTF-8 BOM，兼容 Excel 中文） */
export async function exportLeadsCSV(): Promise<string> {
  const leads = await readLeads();
  const headers = [
    "ID", "企业名称", "行业", "员工数", "AI成熟度",
    "客户等级", "预算信号", "紧迫度", "数据完善度",
    "推荐服务", "下一步", "诊断类型", "微信已加", "已付费",
    "来源渠道", "推荐人", "采集动作", "提交时间", "状态", "备注",
    "联系人", "联系方式"
  ];

  const rows = leads.map((l) => [
    l.id, l.companyName, l.industry, l.employees, l.maturityScore,
    l.clientFitLevel, l.budgetSignal, l.urgency, l.dataReadiness,
    l.recommendedService, l.recommendedNextStep, l.diagnosisType,
    l.wechatAdded, l.paid99, l.referralSource, l.referrer,
    l.collectionNextAction, l.submittedAt, l.status, l.note,
    l.contactName ?? "", l.contactMethod ?? ""
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  return "﻿" + csvContent; // BOM for Excel
}

// ── 内部工具函数 ──

function escapeCSV(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const leadColumnMap: Partial<Record<keyof LeadRecord, string>> = {
  companyName: "company_name",
  industry: "industry",
  employees: "employees",
  maturityScore: "maturity_score",
  clientFitLevel: "client_fit_level",
  budgetSignal: "budget_signal",
  urgency: "urgency",
  dataReadiness: "data_readiness",
  recommendedService: "recommended_service",
  recommendedNextStep: "recommended_next_step",
  diagnosisType: "diagnosis_type",
  wechatAdded: "wechat_added",
  paid99: "paid99",
  referralSource: "referral_source",
  referrer: "referrer",
  collectionNextAction: "collection_next_action",
  status: "status",
  note: "note",
  contactName: "contact_name",
  contactMethod: "contact_method",
  source: "source"
};

function rowToLead(row: Record<string, unknown>): LeadRecord {
  return {
    id: String(row.id ?? ""),
    companyName: String(row.company_name ?? ""),
    industry: String(row.industry ?? ""),
    employees: Number(row.employees ?? 0),
    maturityScore: Number(row.maturity_score ?? 0),
    clientFitLevel: String(row.client_fit_level ?? "C类客户") as LeadRecord["clientFitLevel"],
    budgetSignal: String(row.budget_signal ?? "未知") as LeadRecord["budgetSignal"],
    urgency: String(row.urgency ?? "中") as LeadRecord["urgency"],
    dataReadiness: String(row.data_readiness ?? "弱") as LeadRecord["dataReadiness"],
    recommendedService: String(row.recommended_service ?? ""),
    recommendedNextStep: String(row.recommended_next_step ?? "免费沟通") as LeadRecord["recommendedNextStep"],
    diagnosisType: String(row.diagnosis_type ?? "免费初筛") as LeadRecord["diagnosisType"],
    wechatAdded: String(row.wechat_added ?? "未知") as LeadRecord["wechatAdded"],
    paid99: String(row.paid99 ?? "未知") as LeadRecord["paid99"],
    referralSource: String(row.referral_source ?? "自然访问") as LeadRecord["referralSource"],
    referrer: String(row.referrer ?? ""),
    collectionNextAction: String(row.collection_next_action ?? "发诊断链接") as LeadRecord["collectionNextAction"],
    submittedAt: String(row.submitted_at ?? new Date().toISOString()),
    status: String(row.status ?? "新线索") as LeadRecord["status"],
    note: String(row.note ?? ""),
    contactName: row.contact_name ? String(row.contact_name) : undefined,
    contactMethod: row.contact_method ? String(row.contact_method) : undefined,
    source: String(row.source ?? "AI诊断") as LeadRecord["source"]
  };
}

async function insertLead(db: ReturnType<typeof getDb>, record: LeadRecord): Promise<void> {
  await db.execute({
    sql: `INSERT INTO leads (
      id, company_name, industry, employees, maturity_score,
      client_fit_level, budget_signal, urgency, data_readiness,
      recommended_service, recommended_next_step, diagnosis_type,
      wechat_added, paid99, referral_source, referrer,
      collection_next_action, submitted_at, status, note,
      contact_name, contact_method, source
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )`,
    args: [
      record.id, record.companyName, record.industry, record.employees, record.maturityScore,
      record.clientFitLevel, record.budgetSignal, record.urgency, record.dataReadiness,
      record.recommendedService, record.recommendedNextStep, record.diagnosisType,
      record.wechatAdded, record.paid99, record.referralSource, record.referrer,
      record.collectionNextAction, record.submittedAt, record.status, record.note,
      record.contactName ?? null, record.contactMethod ?? null, record.source
    ]
  });
}

async function updateLeadInDb(
  db: ReturnType<typeof getDb>,
  id: string,
  record: LeadRecord
): Promise<void> {
  await db.execute({
    sql: `UPDATE leads SET
      company_name = ?, industry = ?, employees = ?, maturity_score = ?,
      client_fit_level = ?, budget_signal = ?, urgency = ?, data_readiness = ?,
      recommended_service = ?, recommended_next_step = ?, diagnosis_type = ?,
      wechat_added = ?, paid99 = ?, referral_source = ?, referrer = ?,
      collection_next_action = ?, submitted_at = ?, status = ?, note = ?,
      contact_name = ?, contact_method = ?, source = ?
    WHERE id = ?`,
    args: [
      record.companyName, record.industry, record.employees, record.maturityScore,
      record.clientFitLevel, record.budgetSignal, record.urgency, record.dataReadiness,
      record.recommendedService, record.recommendedNextStep, record.diagnosisType,
      record.wechatAdded, record.paid99, record.referralSource, record.referrer,
      record.collectionNextAction, record.submittedAt, record.status, record.note,
      record.contactName ?? null, record.contactMethod ?? null, record.source,
      id
    ]
  });
}
