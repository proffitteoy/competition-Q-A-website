function buildDatabaseUrlFromParts() {
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;

  if (!host || !port || !database || !user) {
    return undefined;
  }

  const password = process.env.PGPASSWORD ?? "";
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? buildDatabaseUrlFromParts();
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}

export function assertDatabaseUrl() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "数据库未配置：请设置 DATABASE_URL，或同时设置 PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD。",
    );
  }
  return url;
}
