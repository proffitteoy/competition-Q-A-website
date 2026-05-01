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

function isValidDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "postgresql:" || parsed.protocol === "postgres:";
  } catch {
    return false;
  }
}

export function getDatabaseUrl() {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct) {
    return direct;
  }
  return buildDatabaseUrlFromParts();
}

export function isDatabaseConfigured() {
  const url = getDatabaseUrl();
  if (!url) {
    return false;
  }
  return isValidDatabaseUrl(url);
}

export function assertDatabaseUrl() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "数据库未配置：请设置 DATABASE_URL，或同时设置 PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD。",
    );
  }
  if (!isValidDatabaseUrl(url)) {
    throw new Error("DATABASE_URL 格式不合法，必须是 postgres/postgresql 协议地址。");
  }
  return url;
}
