import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import {
  mockQuestions,
  type QuestionRecord,
  type QuestionStatus,
} from "@/lib/mock-data";
import { questions, users } from "@/lib/db/schema";

export interface QuestionWithAuthor {
  id: string;
  competitionId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  status: QuestionStatus;
  isPinned: boolean;
  answerCount: number;
  createdAt: string;
}

export interface CreateQuestionInput {
  competitionId: string;
  authorId: string;
  title: string;
  body: string;
}

export interface UpdateQuestionInput {
  title?: string;
  body?: string;
  status?: QuestionStatus;
  isPinned?: boolean;
}

function formatRow(
  row: typeof questions.$inferSelect,
  authorName: string,
): QuestionWithAuthor {
  return {
    id: row.id,
    competitionId: row.competitionId,
    authorId: row.authorId,
    authorName,
    title: row.title,
    body: row.body,
    status: row.status as QuestionStatus,
    isPinned: row.isPinned,
    answerCount: row.answerCount,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listQuestionsByCompetition(
  competitionId: string,
  options?: { includeHidden?: boolean },
): Promise<QuestionWithAuthor[]> {
  if (!isDatabaseConfigured()) {
    let result = mockQuestions.filter(
      (q) => q.competitionId === competitionId,
    );
    if (!options?.includeHidden) {
      result = result.filter((q) => q.status !== "hidden");
    }
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return result;
  }

  const db = getDb();
  const conditions = [eq(questions.competitionId, competitionId)];
  if (!options?.includeHidden) {
    conditions.push(ne(questions.status, "hidden"));
  }

  const rows = await db
    .select({
      question: questions,
      authorName: users.name,
    })
    .from(questions)
    .innerJoin(users, eq(questions.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(questions.isPinned), desc(questions.createdAt));

  return rows.map((r) => formatRow(r.question, r.authorName));
}

export async function getQuestionById(
  id: string,
): Promise<QuestionWithAuthor | null> {
  if (!isDatabaseConfigured()) {
    const q = mockQuestions.find((q) => q.id === id);
    return q ?? null;
  }

  const db = getDb();
  const rows = await db
    .select({
      question: questions,
      authorName: users.name,
    })
    .from(questions)
    .innerJoin(users, eq(questions.authorId, users.id))
    .where(eq(questions.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  return formatRow(rows[0].question, rows[0].authorName);
}

export async function getQuestionSummaryByCompetition(
  competitionId: string,
  limit = 5,
): Promise<QuestionWithAuthor[]> {
  if (!isDatabaseConfigured()) {
    return mockQuestions
      .filter(
        (q) => q.competitionId === competitionId && q.status !== "hidden",
      )
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, limit);
  }

  const db = getDb();
  const rows = await db
    .select({
      question: questions,
      authorName: users.name,
    })
    .from(questions)
    .innerJoin(users, eq(questions.authorId, users.id))
    .where(
      and(
        eq(questions.competitionId, competitionId),
        ne(questions.status, "hidden"),
      ),
    )
    .orderBy(desc(questions.isPinned), desc(questions.createdAt))
    .limit(limit);

  return rows.map((r) => formatRow(r.question, r.authorName));
}

export async function countQuestionsByCompetition(
  competitionId: string,
): Promise<number> {
  if (!isDatabaseConfigured()) {
    return mockQuestions.filter(
      (q) => q.competitionId === competitionId && q.status !== "hidden",
    ).length;
  }

  const db = getDb();
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questions)
    .where(
      and(
        eq(questions.competitionId, competitionId),
        ne(questions.status, "hidden"),
      ),
    );

  return result[0]?.count ?? 0;
}

export async function createQuestion(input: CreateQuestionInput) {
  if (!isDatabaseConfigured()) {
    const now = new Date().toISOString();
    const mock: QuestionWithAuthor = {
      id: `Q-${Date.now()}`,
      competitionId: input.competitionId,
      authorId: input.authorId,
      authorName: "当前用户",
      title: input.title,
      body: input.body,
      status: "open",
      isPinned: false,
      answerCount: 0,
      createdAt: now,
    };
    mockQuestions.unshift(mock as any);
    return mock;
  }

  const db = getDb();
  const [row] = await db
    .insert(questions)
    .values({
      competitionId: input.competitionId,
      authorId: input.authorId,
      title: input.title,
      body: input.body,
    })
    .returning();
  return row;
}

export async function updateQuestion(id: string, input: UpdateQuestionInput) {
  if (!isDatabaseConfigured()) {
    const q = mockQuestions.find((q) => q.id === id);
    if (q) Object.assign(q, input);
    return q;
  }

  const db = getDb();
  const [row] = await db
    .update(questions)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(questions.id, id))
    .returning();
  return row;
}

export async function deleteQuestion(id: string) {
  if (!isDatabaseConfigured()) {
    const idx = mockQuestions.findIndex((q) => q.id === id);
    if (idx >= 0) mockQuestions.splice(idx, 1);
    return { id };
  }

  const db = getDb();
  const [row] = await db
    .delete(questions)
    .where(eq(questions.id, id))
    .returning({ id: questions.id });
  return row;
}
