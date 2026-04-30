import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import {
  competitions as mockCompetitions,
  type Competition,
} from "@/lib/mock-data";
import {
  competitionAttachments,
  competitionFaqs,
  competitions as competitionsTable,
} from "@/lib/db/schema";

function toDateString(value: Date | null | undefined) {
  if (!value) return "待定";
  return value.toISOString().slice(0, 10);
}

function buildWindow(startAt: Date | null | undefined, endAt: Date | null | undefined) {
  if (!startAt && !endAt) return "待定";
  return `${toDateString(startAt)} 至 ${toDateString(endAt)}`;
}

type CompetitionRow = typeof competitionsTable.$inferSelect;

interface BuildCompetitionOptions {
  row: CompetitionRow;
  faqs: Array<{ question: string; answer: string }>;
  attachments: string[];
}

function buildCompetition({
  row,
  faqs,
  attachments,
}: BuildCompetitionOptions): Competition {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    summary: row.summary,
    department: row.department,
    registrationMode:
      row.registrationMode === "both" ? "team" : row.registrationMode,
    registrationWindow: buildWindow(row.registrationStartAt, row.registrationEndAt),
    eventWindow: buildWindow(row.eventStartAt, row.eventEndAt),
    location: row.location ?? "待定",
    coverLabel: row.coverLabel ?? "竞赛信息",
    description: row.description ?? row.summary,
    highlights: row.highlightsJson ?? [],
    timeline: row.timelineJson ?? [],
    faqs,
    attachments,
    relatedQuestions: row.relatedQuestionsJson ?? [],
  };
}

export async function listCompetitions() {
  if (!isDatabaseConfigured()) {
    return mockCompetitions;
  }

  const db = getDb();
  const competitionRows = await db
    .select()
    .from(competitionsTable)
    .orderBy(desc(competitionsTable.createdAt));

  if (competitionRows.length === 0) {
    return [] as Competition[];
  }

  const competitionIds = competitionRows.map((item) => item.id);

  const [faqRows, attachmentRows] = await Promise.all([
    db
      .select({
        competitionId: competitionFaqs.competitionId,
        question: competitionFaqs.question,
        answer: competitionFaqs.answer,
      })
      .from(competitionFaqs),
    db
      .select({
        competitionId: competitionAttachments.competitionId,
        name: competitionAttachments.name,
      })
      .from(competitionAttachments),
  ]);

  const faqMap = new Map<string, Array<{ question: string; answer: string }>>();
  for (const row of faqRows) {
    if (!competitionIds.includes(row.competitionId)) continue;
    const list = faqMap.get(row.competitionId) ?? [];
    list.push({ question: row.question, answer: row.answer });
    faqMap.set(row.competitionId, list);
  }

  const attachmentMap = new Map<string, string[]>();
  for (const row of attachmentRows) {
    if (!competitionIds.includes(row.competitionId)) continue;
    const list = attachmentMap.get(row.competitionId) ?? [];
    list.push(row.name);
    attachmentMap.set(row.competitionId, list);
  }

  return competitionRows.map((row) =>
    buildCompetition({
      row,
      faqs: faqMap.get(row.id) ?? [],
      attachments: attachmentMap.get(row.id) ?? [],
    }),
  );
}

export async function getCompetitionById(id: string) {
  if (!isDatabaseConfigured()) {
    return mockCompetitions.find((competition) => competition.id === id);
  }

  const db = getDb();
  const row = await db.query.competitions.findFirst({
    where: eq(competitionsTable.id, id),
  });
  if (!row) {
    return undefined;
  }

  const [faqRows, attachmentRows] = await Promise.all([
    db
      .select({
        question: competitionFaqs.question,
        answer: competitionFaqs.answer,
      })
      .from(competitionFaqs)
      .where(eq(competitionFaqs.competitionId, id)),
    db
      .select({
        name: competitionAttachments.name,
      })
      .from(competitionAttachments)
      .where(eq(competitionAttachments.competitionId, id)),
  ]);

  return buildCompetition({
    row,
    faqs: faqRows,
    attachments: attachmentRows.map((item) => item.name),
  });
}

export async function createCompetition(input: Competition) {
  if (!isDatabaseConfigured()) {
    throw new Error("当前未配置数据库，无法创建比赛。请先配置 DATABASE_URL。");
  }

  const db = getDb();
  const inserted = await db
    .insert(competitionsTable)
    .values({
      slug: input.id,
      title: input.title,
      category: input.category,
      status: input.status,
      summary: input.summary,
      department: input.department,
      registrationMode:
        input.registrationMode === "team" ? "team" : "individual",
      location: input.location,
      coverLabel: input.coverLabel,
      description: input.description,
      highlightsJson: input.highlights,
      timelineJson: input.timeline,
      relatedQuestionsJson: input.relatedQuestions,
    })
    .returning();

  const row = inserted[0];
  if (!row) {
    throw new Error("创建比赛失败");
  }

  return buildCompetition({
    row,
    faqs: input.faqs,
    attachments: input.attachments,
  });
}
