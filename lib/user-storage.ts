import { randomBytes } from "crypto";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth-password";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

let userSchemaReady: Promise<void> | null = null;

export async function ensureUserSchema() {
  if (userSchemaReady) return userSchemaReady;

  userSchemaReady = (async () => {
    const db = getDb();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_login_at TEXT DEFAULT NULL
      )
    `);

    await db.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");

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
        unlocked_at TEXT DEFAULT NULL
      )
    `);

    try {
      await db.execute("ALTER TABLE reports ADD COLUMN user_id TEXT DEFAULT NULL");
    } catch (error) {
      if (!String(error).toLowerCase().includes("duplicate column")) {
        throw error;
      }
    }

    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_reports_user_created_at ON reports(user_id, created_at DESC)"
    );
  })();

  return userSchemaReady;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createUser({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name?: string;
}): Promise<AppUser> {
  await ensureUserSchema();
  const db = getDb();
  const normalizedEmail = normalizeEmail(email);
  const now = new Date().toISOString();
  const user: AppUser = {
    id: `usr-${Date.now()}-${randomBytes(6).toString("hex")}`,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split("@")[0] || "用户",
    createdAt: now
  };

  await db.execute({
    sql: `INSERT INTO users (id, email, name, password_hash, created_at, last_login_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [user.id, user.email, user.name, hashPassword(password), now, now]
  });

  return user;
}

export async function findUserByEmail(email: string): Promise<
  | (AppUser & {
      passwordHash: string;
    })
  | null
> {
  await ensureUserSchema();
  const result = await getDb().execute({
    sql: "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
    args: [normalizeEmail(email)]
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name ?? ""),
    passwordHash: String(row.password_hash),
    createdAt: String(row.created_at)
  };
}

export async function verifyUserLogin(email: string, password: string): Promise<AppUser | null> {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;

  await getDb().execute({
    sql: "UPDATE users SET last_login_at = ? WHERE id = ?",
    args: [new Date().toISOString(), user.id]
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  };
}

export async function findUserById(id: string): Promise<AppUser | null> {
  await ensureUserSchema();
  const result = await getDb().execute({
    sql: "SELECT id, email, name, created_at FROM users WHERE id = ? LIMIT 1",
    args: [id]
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name ?? ""),
    createdAt: String(row.created_at)
  };
}
