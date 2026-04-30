import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { assertDatabaseUrl } from "@/lib/db/config";
import * as schema from "@/lib/db/schema";

type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;
export type Database = DrizzleDatabase;

const globalForDb = globalThis as unknown as {
  __competitionPool?: Pool;
  __competitionDb?: DrizzleDatabase;
};

function createDatabase() {
  const pool = new Pool({
    connectionString: assertDatabaseUrl(),
    max: Number(process.env.PG_POOL_MAX ?? "10"),
  });

  const database = drizzle(pool, { schema });
  return { pool, database };
}

function getDatabase() {
  if (process.env.NODE_ENV === "production") {
    return createDatabase().database;
  }

  if (!globalForDb.__competitionDb || !globalForDb.__competitionPool) {
    const { pool, database } = createDatabase();
    globalForDb.__competitionPool = pool;
    globalForDb.__competitionDb = database;
  }

  return globalForDb.__competitionDb;
}

export function getDb() {
  return getDatabase();
}
