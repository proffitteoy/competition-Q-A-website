import "dotenv/config";
import { defineConfig } from "drizzle-kit";

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;

  if (!host || !port || !database || !user) {
    return undefined;
  }

  const encodedPassword = encodeURIComponent(password ?? "");
  return `postgresql://${encodeURIComponent(user)}:${encodedPassword}@${host}:${port}/${database}`;
}

const databaseUrl = buildDatabaseUrl();

if (!databaseUrl) {
  throw new Error(
    "缺少数据库配置。请设置 DATABASE_URL，或同时设置 PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD。",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
