import { eq, and, desc } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { experiencePosts } from "@/lib/db/schema";

export type ExperiencePostStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "offline";

export interface ExperiencePostRow {
  id: string;
  userId: string;
  competitionId: string | null;
  competitionTitle: string | null;
  title: string;
  content: string;
  awardLevel: string | null;
  coverImage: string | null;
  status: ExperiencePostStatus;
  reviewComment: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExperiencePostInput {
  competitionId?: string | null;
  competitionTitle?: string | null;
  title: string;
  content?: string;
  awardLevel?: string | null;
  coverImage?: string | null;
}

export interface UpdateExperiencePostInput {
  competitionId?: string | null;
  competitionTitle?: string | null;
  title?: string;
  content?: string;
  awardLevel?: string | null;
  coverImage?: string | null;
}

function toRow(r: typeof experiencePosts.$inferSelect): ExperiencePostRow {
  return {
    id: r.id,
    userId: r.userId,
    competitionId: r.competitionId,
    competitionTitle: r.competitionTitle,
    title: r.title,
    content: r.content,
    awardLevel: r.awardLevel,
    coverImage: r.coverImage,
    status: r.status,
    reviewComment: r.reviewComment,
    publishedAt: r.publishedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function assertDb() {
  if (!isDatabaseConfigured()) {
    throw new Error("数据库未配置。");
  }
  return getDb();
}

export async function listMyExperiencePosts(
  userId: string,
): Promise<ExperiencePostRow[]> {
  const db = assertDb();
  const rows = await db.query.experiencePosts.findMany({
    where: eq(experiencePosts.userId, userId),
    orderBy: desc(experiencePosts.updatedAt),
  });
  return rows.map(toRow);
}

export async function getMyExperiencePost(
  userId: string,
  postId: string,
): Promise<ExperiencePostRow | null> {
  const db = assertDb();
  const row = await db.query.experiencePosts.findFirst({
    where: and(
      eq(experiencePosts.id, postId),
      eq(experiencePosts.userId, userId),
    ),
  });
  return row ? toRow(row) : null;
}

export async function createExperiencePost(
  userId: string,
  input: CreateExperiencePostInput,
): Promise<ExperiencePostRow> {
  const db = assertDb();
  const [row] = await db
    .insert(experiencePosts)
    .values({
      userId,
      competitionId: input.competitionId ?? null,
      competitionTitle: input.competitionTitle ?? null,
      title: input.title,
      content: input.content ?? "",
      awardLevel: input.awardLevel ?? null,
      coverImage: input.coverImage ?? null,
    })
    .returning();
  return toRow(row);
}

// PLACEHOLDER_REMAINING_FUNCTIONS

export async function updateExperiencePost(
  userId: string,
  postId: string,
  input: UpdateExperiencePostInput,
): Promise<ExperiencePostRow> {
  const db = assertDb();
  const existing = await getMyExperiencePost(userId, postId);
  if (!existing) throw new Error("文章不存在。");
  if (existing.status !== "draft" && existing.status !== "offline") {
    throw new Error("仅草稿或已下线的文章可编辑。");
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updates.title = input.title;
  if (input.content !== undefined) updates.content = input.content;
  if (input.competitionId !== undefined)
    updates.competitionId = input.competitionId;
  if (input.competitionTitle !== undefined)
    updates.competitionTitle = input.competitionTitle;
  if (input.awardLevel !== undefined) updates.awardLevel = input.awardLevel;
  if (input.coverImage !== undefined) updates.coverImage = input.coverImage;

  const [row] = await db
    .update(experiencePosts)
    .set(updates)
    .where(
      and(eq(experiencePosts.id, postId), eq(experiencePosts.userId, userId)),
    )
    .returning();
  return toRow(row);
}

export async function submitExperiencePost(
  userId: string,
  postId: string,
): Promise<void> {
  const db = assertDb();
  const existing = await getMyExperiencePost(userId, postId);
  if (!existing) throw new Error("文章不存在。");
  if (existing.status !== "draft") {
    throw new Error("仅草稿状态可提交审核。");
  }
  await db
    .update(experiencePosts)
    .set({ status: "pending_review", updatedAt: new Date() })
    .where(
      and(eq(experiencePosts.id, postId), eq(experiencePosts.userId, userId)),
    );
}

export async function withdrawExperiencePost(
  userId: string,
  postId: string,
): Promise<void> {
  const db = assertDb();
  const existing = await getMyExperiencePost(userId, postId);
  if (!existing) throw new Error("文章不存在。");
  if (existing.status !== "pending_review") {
    throw new Error("仅待审核状态可撤回。");
  }
  await db
    .update(experiencePosts)
    .set({ status: "draft", updatedAt: new Date() })
    .where(
      and(eq(experiencePosts.id, postId), eq(experiencePosts.userId, userId)),
    );
}

export async function offlineExperiencePost(
  userId: string,
  postId: string,
): Promise<void> {
  const db = assertDb();
  const existing = await getMyExperiencePost(userId, postId);
  if (!existing) throw new Error("文章不存在。");
  if (existing.status !== "published") {
    throw new Error("仅已发布的文章可下线。");
  }
  await db
    .update(experiencePosts)
    .set({ status: "offline", updatedAt: new Date() })
    .where(
      and(eq(experiencePosts.id, postId), eq(experiencePosts.userId, userId)),
    );
}

export async function deleteExperiencePost(
  userId: string,
  postId: string,
): Promise<void> {
  const db = assertDb();
  const existing = await getMyExperiencePost(userId, postId);
  if (!existing) throw new Error("文章不存在。");
  if (existing.status === "published") {
    throw new Error("已发布的文章请先下线再删除。");
  }
  await db
    .delete(experiencePosts)
    .where(
      and(eq(experiencePosts.id, postId), eq(experiencePosts.userId, userId)),
    );
}

export async function getPublishedPostsForUser(
  userId: string,
): Promise<ExperiencePostRow[]> {
  const db = assertDb();
  const rows = await db.query.experiencePosts.findMany({
    where: and(
      eq(experiencePosts.userId, userId),
      eq(experiencePosts.status, "published"),
    ),
    orderBy: desc(experiencePosts.publishedAt),
  });
  return rows.map(toRow);
}

export async function getPublishedPostById(
  postId: string,
): Promise<ExperiencePostRow | null> {
  const db = assertDb();
  const row = await db.query.experiencePosts.findFirst({
    where: and(
      eq(experiencePosts.id, postId),
      eq(experiencePosts.status, "published"),
    ),
  });
  return row ? toRow(row) : null;
}

// --- Admin functions ---

export async function listForReview(
  statusFilter?: ExperiencePostStatus,
): Promise<ExperiencePostRow[]> {
  const db = assertDb();
  const where = statusFilter
    ? eq(experiencePosts.status, statusFilter)
    : undefined;
  const rows = await db.query.experiencePosts.findMany({
    where,
    orderBy: desc(experiencePosts.updatedAt),
  });
  return rows.map(toRow);
}

export async function reviewPost(
  postId: string,
  action: "approve" | "reject",
  reviewerId: string,
  comment?: string,
): Promise<void> {
  const db = assertDb();
  const row = await db.query.experiencePosts.findFirst({
    where: eq(experiencePosts.id, postId),
  });
  if (!row) throw new Error("文章不存在。");
  if (row.status !== "pending_review") {
    throw new Error("仅待审核的文章可审核。");
  }

  const now = new Date();
  if (action === "approve") {
    await db
      .update(experiencePosts)
      .set({
        status: "published",
        reviewerId,
        reviewComment: comment ?? null,
        reviewedAt: now,
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(experiencePosts.id, postId));
  } else {
    await db
      .update(experiencePosts)
      .set({
        status: "draft",
        reviewerId,
        reviewComment: comment ?? "审核未通过",
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(experiencePosts.id, postId));
  }
}

export async function adminOfflinePost(
  postId: string,
  reviewerId: string,
  comment?: string,
): Promise<void> {
  const db = assertDb();
  const row = await db.query.experiencePosts.findFirst({
    where: eq(experiencePosts.id, postId),
  });
  if (!row) throw new Error("文章不存在。");
  if (row.status !== "published") {
    throw new Error("仅已发布的文章可强制下线。");
  }
  await db
    .update(experiencePosts)
    .set({
      status: "offline",
      reviewerId,
      reviewComment: comment ?? "管理员强制下线",
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(experiencePosts.id, postId));
}
