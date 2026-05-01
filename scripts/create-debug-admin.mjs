import process from "node:process";

import { config as loadEnv } from "dotenv";
import pg from "pg";
import { hash } from "bcryptjs";

const { Client } = pg;

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    const raw = process.env.DATABASE_URL.trim();
    try {
      new URL(raw);
      return raw;
    } catch {
      const schemeIndex = raw.indexOf("://");
      if (schemeIndex <= 0) {
        throw new Error("DATABASE_URL 格式不合法。");
      }

      const prefix = raw.slice(0, schemeIndex + 3);
      const rest = raw.slice(schemeIndex + 3);
      const slashIndex = rest.indexOf("/");
      if (slashIndex < 0) {
        throw new Error("DATABASE_URL 格式不合法。");
      }

      const authority = rest.slice(0, slashIndex);
      const path = rest.slice(slashIndex + 1);
      const atIndex = authority.lastIndexOf("@");
      if (atIndex < 0) {
        throw new Error("DATABASE_URL 缺少账号信息。");
      }

      const rawAuth = authority.slice(0, atIndex);
      const host = authority.slice(atIndex + 1);
      const colonIndex = rawAuth.indexOf(":");
      if (colonIndex < 0) {
        throw new Error("DATABASE_URL 缺少密码信息。");
      }

      const rawUser = rawAuth.slice(0, colonIndex);
      const rawPassword = rawAuth.slice(colonIndex + 1);
      const user = encodeURIComponent(decodeURIComponent(rawUser));
      const password = encodeURIComponent(decodeURIComponent(rawPassword));
      return `${prefix}${user}:${password}@${host}/${path}`;
    }
  }

  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD ?? "";

  if (!host || !port || !database || !user) {
    throw new Error(
      "缺少数据库配置：请设置 DATABASE_URL 或 PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD。",
    );
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function main() {
  const email = (
    process.env.DEBUG_ADMIN_EMAIL ?? "debug.admin@college.example"
  ).trim().toLowerCase();
  const password = process.env.DEBUG_ADMIN_PASSWORD ?? "DebugAdmin2026!";
  const name = (process.env.DEBUG_ADMIN_NAME ?? "调试管理员").trim();

  if (password.length < 8) {
    throw new Error("DEBUG_ADMIN_PASSWORD 长度至少 8 位。");
  }

  const client = new Client({ connectionString: buildDatabaseUrl() });
  await client.connect();

  try {
    await client.query("BEGIN");

    const passwordHash = await hash(password, 10);
    const existing = await client.query(
      `SELECT id FROM "user" WHERE email = $1 LIMIT 1`,
      [email],
    );

    let userId;
    if (existing.rows[0]?.id) {
      userId = existing.rows[0].id;
      await client.query(
        `UPDATE "user"
         SET name = $1, status = 'active'::user_status, password_hash = $2, updated_at = now()
         WHERE id = $3`,
        [name, passwordHash, userId],
      );
    } else {
      const inserted = await client.query(
        `INSERT INTO "user" (name, email, status, password_hash)
         VALUES ($1, $2, 'active'::user_status, $3)
         RETURNING id`,
        [name, email, passwordHash],
      );
      userId = inserted.rows[0]?.id;
    }

    if (!userId) {
      throw new Error("创建调试管理员失败。");
    }

    await client.query(
      `INSERT INTO role_assignment (user_id, role, scope_type)
       SELECT $1, 'super_admin'::user_role, 'global'::role_scope
       WHERE NOT EXISTS (
         SELECT 1 FROM role_assignment
         WHERE user_id = $1
           AND role = 'super_admin'::user_role
           AND scope_type = 'global'::role_scope
           AND revoked_at IS NULL
       )`,
      [userId],
    );

    await client.query("COMMIT");

    console.log("DEBUG_ADMIN_CREATED");
    console.log(`email=${email}`);
    console.log(`password=${password}`);
    console.log(`name=${name}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("[create-debug-admin] failed:", error);
  process.exitCode = 1;
});
