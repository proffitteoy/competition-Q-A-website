import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { config as loadEnv } from "dotenv";
import pg from "pg";

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
      const dbPath = rest.slice(slashIndex + 1);
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
      return `${prefix}${user}:${password}@${host}/${dbPath}`;
    }
  }

  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD ?? "";
  if (!host || !port || !database || !user) {
    throw new Error(
      "缺少数据库配置。请设置 DATABASE_URL 或 PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD。",
    );
  }
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function main() {
  const migrationsDir = path.join(
    process.cwd(),
    "src",
    "lib",
    "db",
    "migrations",
  );
  const files = await readdir(migrationsDir);
  const sqlFiles = files
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (sqlFiles.length === 0) {
    console.log("[migration] No SQL files found.");
    return;
  }

  const client = new Client({
    connectionString: buildDatabaseUrl(),
  });

  await client.connect();
  try {
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = await readFile(filePath, "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sqlContent);
        await client.query("COMMIT");
        console.log(`[migration] ${file} applied.`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${error.message}`);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("[migration] failed:", error);
  process.exitCode = 1;
});
