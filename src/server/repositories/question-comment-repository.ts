import { and, asc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { mockComments, type QuestionCommentRecord } from "@/lib/mock-data";
import { questionComments, users } from "@/lib/db/schema";

export interface CommentWithAuthor {
  id: string;
  questionId: string;
  answerId: string | null;
  parentId: string | null;
  depth: number;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface CreateCommentInput {
  questionId: string;
  answerId?: string | null;
  parentId?: string | null;
  authorId: string;
  body: string;
}

function formatRow(
  row: typeof questionComments.$inferSelect,
  authorName: string,
): CommentWithAuthor {
  return {
    id: row.id,
    questionId: row.questionId,
    answerId: row.answerId,
    parentId: row.parentId,
    depth: row.depth,
    authorId: row.authorId,
    authorName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listCommentsByQuestion(
  questionId: string,
  answerId?: string | null,
): Promise<CommentWithAuthor[]> {
  if (!isDatabaseConfigured()) {
    return mockComments
      .filter((c) => {
        if (c.questionId !== questionId) return false;
        if (answerId !== undefined) return c.answerId === answerId;
        return true;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const db = getDb();
  const conditions = [eq(questionComments.questionId, questionId)];
  if (answerId !== undefined) {
    if (answerId === null) {
      conditions.push(isNull(questionComments.answerId));
    } else {
      conditions.push(eq(questionComments.answerId, answerId));
    }
  }

  const rows = await db
    .select({
      comment: questionComments,
      authorName: users.name,
    })
    .from(questionComments)
    .innerJoin(users, eq(questionComments.authorId, users.id))
    .where(and(...conditions))
    .orderBy(asc(questionComments.createdAt));

  return rows.map((r) => formatRow(r.comment, r.authorName));
}

export async function createComment(input: CreateCommentInput) {
  if (!isDatabaseConfigured()) {
    let depth = 0;
    if (input.parentId) {
      const parent = mockComments.find((c) => c.id === input.parentId);
      if (!parent) throw new Error("父评论不存在。");
      depth = parent.depth + 1;
    }
    const mock: QuestionCommentRecord = {
      id: `C-${Date.now()}`,
      questionId: input.questionId,
      answerId: input.answerId ?? null,
      parentId: input.parentId ?? null,
      depth,
      authorId: input.authorId,
      authorName: "当前用户",
      body: input.body,
      createdAt: new Date().toISOString(),
    };
    mockComments.push(mock);
    return mock;
  }

  const db = getDb();

  let depth = 0;
  if (input.parentId) {
    const [parent] = await db
      .select({ depth: questionComments.depth })
      .from(questionComments)
      .where(eq(questionComments.id, input.parentId))
      .limit(1);

    if (!parent) {
      throw new Error("父评论不存在。");
    }
    depth = parent.depth + 1;
  }

  const [row] = await db
    .insert(questionComments)
    .values({
      questionId: input.questionId,
      answerId: input.answerId ?? null,
      parentId: input.parentId ?? null,
      depth,
      authorId: input.authorId,
      body: input.body,
    })
    .returning();

  return row;
}

export async function deleteComment(id: string) {
  if (!isDatabaseConfigured()) {
    const idx = mockComments.findIndex((c) => c.id === id);
    if (idx >= 0) mockComments.splice(idx, 1);
    return { id };
  }

  const db = getDb();
  const [row] = await db
    .delete(questionComments)
    .where(eq(questionComments.id, id))
    .returning({ id: questionComments.id });
  return row;
}
