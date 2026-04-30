import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import {
  competitions as mockCompetitions,
  type Competition,
  type CompetitionStatus,
  type RegistrationMode,
} from "@/lib/mock-data";
import {
  competitionAttachments,
  competitionFaqs,
  competitions as competitionsTable,
} from "@/lib/db/schema";

function toDateString(value: Date | null | undefined) {
  if (!value) return "TBD";
  return value.toISOString().slice(0, 10);
}

function buildWindow(startAt: Date | null | undefined, endAt: Date | null | undefined) {
  if (!startAt && !endAt) return "TBD";
  return `${toDateString(startAt)} to ${toDateString(endAt)}`;
}

function slugify(input: string) {
  const normalized = input.trim().toLowerCase();
  return normalized
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeFileSegment(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
    location: row.location ?? "TBD",
    coverLabel: row.coverLabel ?? "Competition",
    description: row.description ?? row.summary,
    highlights: row.highlightsJson ?? [],
    timeline: row.timelineJson ?? [],
    faqs,
    attachments,
    relatedQuestions: row.relatedQuestionsJson ?? [],
  };
}

export interface CompetitionWriteInput {
  slug?: string;
  title: string;
  category: string;
  summary: string;
  department: string;
  registrationMode: RegistrationMode;
  status?: CompetitionStatus;
  registrationStartAt?: Date | null;
  registrationEndAt?: Date | null;
  eventStartAt?: Date | null;
  eventEndAt?: Date | null;
  location?: string | null;
  coverLabel?: string | null;
  description?: string | null;
  highlights?: string[];
  timeline?: Array<{ label: string; date: string; description: string }>;
  relatedQuestions?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  attachments?: string[];
  createdBy?: string;
}

export type CompetitionUpdateInput = Partial<CompetitionWriteInput>;

function assertDbConfigured() {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "Database is not configured. Write operations are disabled.",
    );
  }
}

async function listFaqRows(competitionId: string) {
  const db = getDb();
  return db
    .select({
      question: competitionFaqs.question,
      answer: competitionFaqs.answer,
    })
    .from(competitionFaqs)
    .where(eq(competitionFaqs.competitionId, competitionId));
}

async function listAttachmentRows(competitionId: string) {
  const db = getDb();
  return db
    .select({
      name: competitionAttachments.name,
    })
    .from(competitionAttachments)
    .where(eq(competitionAttachments.competitionId, competitionId));
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

  const competitionIds = new Set(competitionRows.map((item) => item.id));

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
    if (!competitionIds.has(row.competitionId)) continue;
    const list = faqMap.get(row.competitionId) ?? [];
    list.push({ question: row.question, answer: row.answer });
    faqMap.set(row.competitionId, list);
  }

  const attachmentMap = new Map<string, string[]>();
  for (const row of attachmentRows) {
    if (!competitionIds.has(row.competitionId)) continue;
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
    listFaqRows(id),
    listAttachmentRows(id),
  ]);

  return buildCompetition({
    row,
    faqs: faqRows,
    attachments: attachmentRows.map((item) => item.name),
  });
}

export async function createCompetition(input: CompetitionWriteInput) {
  assertDbConfigured();
  const db = getDb();

  const now = new Date();
  const effectiveSlug =
    input.slug?.trim() || `${slugify(input.title)}-${now.getTime()}`;

  const inserted = await db
    .insert(competitionsTable)
    .values({
      slug: effectiveSlug,
      title: input.title,
      category: input.category,
      status: input.status ?? "draft",
      summary: input.summary,
      department: input.department,
      registrationMode:
        input.registrationMode === "team" ? "team" : "individual",
      registrationStartAt: input.registrationStartAt ?? null,
      registrationEndAt: input.registrationEndAt ?? null,
      eventStartAt: input.eventStartAt ?? null,
      eventEndAt: input.eventEndAt ?? null,
      location: input.location ?? null,
      coverLabel: input.coverLabel ?? null,
      description: input.description ?? null,
      highlightsJson: input.highlights ?? [],
      timelineJson: input.timeline ?? [],
      relatedQuestionsJson: input.relatedQuestions ?? [],
      createdBy: input.createdBy ?? null,
    })
    .returning({ id: competitionsTable.id });

  const created = inserted[0];
  if (!created) {
    throw new Error("Failed to create competition.");
  }

  if (input.faqs && input.faqs.length > 0) {
    await db.insert(competitionFaqs).values(
      input.faqs.map((faq, index) => ({
        competitionId: created.id,
        question: faq.question,
        answer: faq.answer,
        displayOrder: index + 1,
      })),
    );
  }

  if (input.attachments && input.attachments.length > 0) {
    await db.insert(competitionAttachments).values(
      input.attachments.map((name, index) => ({
        competitionId: created.id,
        name,
        storageKey: `competition/${created.id}/${index + 1}-${sanitizeFileSegment(name)}`,
      })),
    );
  }

  const competition = await getCompetitionById(created.id);
  if (!competition) {
    throw new Error("Competition created, but fetch failed.");
  }
  return competition;
}

export async function updateCompetition(
  id: string,
  input: CompetitionUpdateInput,
) {
  assertDbConfigured();
  const db = getDb();

  const values: Partial<typeof competitionsTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.slug !== undefined) values.slug = input.slug;
  if (input.title !== undefined) values.title = input.title;
  if (input.category !== undefined) values.category = input.category;
  if (input.summary !== undefined) values.summary = input.summary;
  if (input.department !== undefined) values.department = input.department;
  if (input.registrationMode !== undefined) {
    values.registrationMode =
      input.registrationMode === "team" ? "team" : "individual";
  }
  if (input.registrationStartAt !== undefined) {
    values.registrationStartAt = input.registrationStartAt;
  }
  if (input.registrationEndAt !== undefined) {
    values.registrationEndAt = input.registrationEndAt;
  }
  if (input.eventStartAt !== undefined) values.eventStartAt = input.eventStartAt;
  if (input.eventEndAt !== undefined) values.eventEndAt = input.eventEndAt;
  if (input.location !== undefined) values.location = input.location;
  if (input.coverLabel !== undefined) values.coverLabel = input.coverLabel;
  if (input.description !== undefined) values.description = input.description;
  if (input.highlights !== undefined) values.highlightsJson = input.highlights;
  if (input.timeline !== undefined) values.timelineJson = input.timeline;
  if (input.relatedQuestions !== undefined) {
    values.relatedQuestionsJson = input.relatedQuestions;
  }

  const updated = await db
    .update(competitionsTable)
    .set(values)
    .where(eq(competitionsTable.id, id))
    .returning({ id: competitionsTable.id });

  if (updated.length === 0) {
    throw new Error("Competition not found.");
  }

  if (input.faqs !== undefined) {
    await db.transaction(async (tx) => {
      await tx.delete(competitionFaqs).where(eq(competitionFaqs.competitionId, id));
      if (input.faqs && input.faqs.length > 0) {
        await tx.insert(competitionFaqs).values(
          input.faqs.map((faq, index) => ({
            competitionId: id,
            question: faq.question,
            answer: faq.answer,
            displayOrder: index + 1,
          })),
        );
      }
    });
  }

  if (input.attachments !== undefined) {
    await db.transaction(async (tx) => {
      await tx
        .delete(competitionAttachments)
        .where(eq(competitionAttachments.competitionId, id));
      if (input.attachments && input.attachments.length > 0) {
        await tx.insert(competitionAttachments).values(
          input.attachments.map((name, index) => ({
            competitionId: id,
            name,
            storageKey: `competition/${id}/${index + 1}-${sanitizeFileSegment(name)}`,
          })),
        );
      }
    });
  }

  const refreshed = await getCompetitionById(id);
  if (!refreshed) {
    throw new Error("Competition updated, but fetch failed.");
  }
  return refreshed;
}

export async function deleteCompetition(id: string) {
  assertDbConfigured();
  const db = getDb();
  const deleted = await db
    .delete(competitionsTable)
    .where(and(eq(competitionsTable.id, id)))
    .returning({ id: competitionsTable.id });
  return deleted.length > 0;
}
