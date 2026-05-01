import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { mockAnswers, mockQuestions, type AnswerRecord } from "@/lib/mock-data";
import { answers, questions, users } from "@/lib/db/schema";

export interface AnswerWithAuthor {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  body: string;
  isAccepted: boolean;
  createdAt: string;
}

export interface CreateAnswerInput {
  questionId: string;
  authorId: string;
  body: string;
}

function formatRow(
  row: typeof answers.$inferSelect,
  authorName: string,
): AnswerWithAuthor {
  return {
    id: row.id,
    questionId: row.questionId,
    authorId: row.authorId,
    authorName,
    body: row.body,
    isAccepted: row.isAccepted,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAnswersByQuestion(
  questionId: string,
): Promise<AnswerWithAuthor[]> {
  if (!isDatabaseConfigured()) {
    return mockAnswers
      .filter((a) => a.questionId === questionId)
      .sort((a, b) => {
        if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1;
        return a.createdAt.localeCompare(b.createdAt);
      });
  }

  const db = getDb();
  const rows = await db
    .select({
      answer: answers,
      authorName: users.name,
    })
    .from(answers)
    .innerJoin(users, eq(answers.authorId, users.id))
    .where(eq(answers.questionId, questionId))
    .orderBy(desc(answers.isAccepted), asc(answers.createdAt));

  return rows.map((r) => formatRow(r.answer, r.authorName));
}

export async function createAnswer(input: CreateAnswerInput) {
  if (!isDatabaseConfigured()) {
    const now = new Date().toISOString();
    const mock: AnswerWithAuthor = {
      id: `A-${Date.now()}`,
      questionId: input.questionId,
      authorId: input.authorId,
      authorName: "当前用户",
      body: input.body,
      isAccepted: false,
      createdAt: now,
    };
    mockAnswers.push(mock as any);
    const q = mockQuestions.find((q) => q.id === input.questionId);
    if (q) q.answerCount++;
    return mock;
  }

  const db = getDb();
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(answers)
      .values({
        questionId: input.questionId,
        authorId: input.authorId,
        body: input.body,
      })
      .returning();

    await tx
      .update(questions)
      .set({
        answerCount: sql`${questions.answerCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, input.questionId));

    return row;
  });
}

export async function acceptAnswer(answerId: string, questionId: string) {
  if (!isDatabaseConfigured()) {
    for (const a of mockAnswers) {
      if (a.questionId === questionId) a.isAccepted = false;
    }
    const target = mockAnswers.find((a) => a.id === answerId);
    if (target) target.isAccepted = true;
    return target;
  }

  const db = getDb();
  return db.transaction(async (tx) => {
    await tx
      .update(answers)
      .set({ isAccepted: false, updatedAt: new Date() })
      .where(
        and(eq(answers.questionId, questionId), eq(answers.isAccepted, true)),
      );

    const [row] = await tx
      .update(answers)
      .set({ isAccepted: true, updatedAt: new Date() })
      .where(eq(answers.id, answerId))
      .returning();

    return row;
  });
}

export async function deleteAnswer(answerId: string, questionId: string) {
  if (!isDatabaseConfigured()) {
    const idx = mockAnswers.findIndex((a) => a.id === answerId);
    if (idx >= 0) {
      mockAnswers.splice(idx, 1);
      const q = mockQuestions.find((q) => q.id === questionId);
      if (q && q.answerCount > 0) q.answerCount--;
    }
    return { id: answerId };
  }

  const db = getDb();
  return db.transaction(async (tx) => {
    const [row] = await tx
      .delete(answers)
      .where(eq(answers.id, answerId))
      .returning({ id: answers.id });

    if (row) {
      await tx
        .update(questions)
        .set({
          answerCount: sql`greatest(${questions.answerCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, questionId));
    }

    return row;
  });
}
