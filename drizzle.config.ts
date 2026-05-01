import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

function normalizeDatabaseUrl(rawUrl: string) {
  const value = rawUrl.trim();
  try {
    new URL(value);
    return value;
  } catch {
    const schemeIndex = value.indexOf("://");
    if (schemeIndex <= 0) {
      throw new Error("DATABASE_URL 格式不合法。");
    }
    const prefix = value.slice(0, schemeIndex + 3);
    const rest = value.slice(schemeIndex + 3);
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

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    return normalizeDatabaseUrl(process.env.DATABASE_URL);
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
