import { and, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { registrations } from "@/lib/db/schema";
import {
  ADMIN_TITLE_USER_IDS,
  BATTLE_GENIUS_MIN_COMPETITIONS,
  OWNER_USER_ID,
  TITLE_DEFINITIONS,
} from "@/lib/constants/user-titles";

export interface TitleInfo {
  key: string;
  name: string;
  priority: number;
  description: string;
}

const COUNTABLE_STATUSES = [
  "submitted",
  "approved",
  "rejected",
  "withdrawn",
] as const;

async function countDistinctCompetitions(userId: string): Promise<number> {
  if (!isDatabaseConfigured()) {
    return 0;
  }

  const db = getDb();
  const result = await db
    .select({
      count: sql<number>`count(distinct ${registrations.competitionId})::int`,
    })
    .from(registrations)
    .where(
      and(
        eq(registrations.applicantUserId, userId),
        inArray(registrations.status, [...COUNTABLE_STATUSES]),
      ),
    );

  return result[0]?.count ?? 0;
}

function toTitleInfo(key: string): TitleInfo {
  const def = TITLE_DEFINITIONS.find((d) => d.key === key)!;
  return {
    key: def.key,
    name: def.name,
    priority: def.priority,
    description: def.description,
  };
}

export async function resolveUserTitles(userId: string): Promise<TitleInfo[]> {
  const titles: TitleInfo[] = [];

  if (OWNER_USER_ID && userId === OWNER_USER_ID) {
    titles.push(toTitleInfo("founder"));
  }

  if (ADMIN_TITLE_USER_IDS.includes(userId)) {
    titles.push(toTitleInfo("admin"));
  }

  const competitionCount = await countDistinctCompetitions(userId);
  if (competitionCount >= BATTLE_GENIUS_MIN_COMPETITIONS) {
    titles.push(toTitleInfo("battleGenius"));
  }

  return titles.sort((a, b) => b.priority - a.priority);
}
