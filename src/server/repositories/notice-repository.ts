import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import {
  notices as mockNotices,
  type NoticeRecord,
  competitions as mockCompetitions,
} from "@/lib/mock-data";
import { competitionNotices, competitions } from "@/lib/db/schema";

const WRITE_DISABLED_MESSAGE =
  "当前未配置数据库，写操作已禁用。请先配置 DATABASE_URL。";

export interface AdminNoticeRecord extends NoticeRecord {
  competitionId: string;
  content?: string;
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "-";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function mapMockNotice(notice: NoticeRecord): AdminNoticeRecord {
  const matchedCompetition = mockCompetitions.find(
    (item) => item.title === notice.competition,
  );

  return {
    ...notice,
    competitionId: matchedCompetition?.id ?? "",
    content: "",
  };
}

export async function listNotices() {
  if (!isDatabaseConfigured()) {
    return mockNotices.map(mapMockNotice);
  }

  const db = getDb();
  const rows = await db
    .select({
      id: competitionNotices.id,
      competitionId: competitionNotices.competitionId,
      title: competitionNotices.title,
      content: competitionNotices.content,
      status: competitionNotices.status,
      updatedAt: competitionNotices.updatedAt,
      competitionTitle: competitions.title,
    })
    .from(competitionNotices)
    .innerJoin(competitions, eq(competitionNotices.competitionId, competitions.id))
    .orderBy(desc(competitionNotices.updatedAt));

  return rows.map<AdminNoticeRecord>((row) => ({
    id: row.id,
    competitionId: row.competitionId,
    title: row.title,
    competition: row.competitionTitle,
    status: row.status,
    updatedAt: formatDateTime(row.updatedAt),
    content: row.content,
  }));
}

export async function getNoticeById(id: string) {
  const notices = await listNotices();
  return notices.find((item) => item.id === id);
}

interface NoticeWriteInput {
  competitionId: string;
  title: string;
  content: string;
  status: "draft" | "published" | "withdrawn";
  operatorUserId?: string;
}

export async function createNotice(input: NoticeWriteInput) {
  if (!isDatabaseConfigured()) {
    throw new Error(WRITE_DISABLED_MESSAGE);
  }

  const db = getDb();
  const inserted = await db
    .insert(competitionNotices)
    .values({
      competitionId: input.competitionId,
      title: input.title,
      content: input.content,
      status: input.status,
      publishedAt: input.status === "published" ? new Date() : null,
      createdBy: input.operatorUserId ?? null,
      updatedBy: input.operatorUserId ?? null,
    })
    .returning({ id: competitionNotices.id });

  const next = inserted[0];
  if (!next) {
    throw new Error("Failed to create notice.");
  }

  return (await getNoticeById(next.id))!;
}

interface NoticeUpdateInput {
  competitionId?: string;
  title?: string;
  content?: string;
  status?: "draft" | "published" | "withdrawn";
  operatorUserId?: string;
}

export async function updateNotice(id: string, input: NoticeUpdateInput) {
  if (!isDatabaseConfigured()) {
    throw new Error(WRITE_DISABLED_MESSAGE);
  }

  const db = getDb();
  const updated = await db
    .update(competitionNotices)
    .set({
      competitionId: input.competitionId,
      title: input.title,
      content: input.content,
      status: input.status,
      publishedAt:
        input.status === "published"
          ? new Date()
          : input.status === "draft"
            ? null
            : undefined,
      updatedBy: input.operatorUserId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(competitionNotices.id, id))
    .returning({ id: competitionNotices.id });

  if (updated.length === 0) {
    throw new Error("Notice not found.");
  }

  return (await getNoticeById(id))!;
}

export async function deleteNotice(id: string) {
  if (!isDatabaseConfigured()) {
    throw new Error(WRITE_DISABLED_MESSAGE);
  }

  const db = getDb();
  const deleted = await db
    .delete(competitionNotices)
    .where(eq(competitionNotices.id, id))
    .returning({ id: competitionNotices.id });

  return deleted.length > 0;
}
