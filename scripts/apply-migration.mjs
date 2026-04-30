import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import pg from "pg";

const { Client } = pg;

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
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
  const migrationPath = path.join(
    process.cwd(),
    "src",
    "lib",
    "db",
    "migrations",
    "0000_init.sql",
  );
  const sql = await readFile(migrationPath, "utf8");
  const client = new Client({
    connectionString: buildDatabaseUrl(),
  });

  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("[migration] 0000_init.sql applied.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("[migration] failed:", error);
  process.exitCode = 1;
});
