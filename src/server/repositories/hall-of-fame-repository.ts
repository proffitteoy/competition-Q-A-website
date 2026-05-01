import { eq, desc, asc } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { hallOfFameEntries, users } from "@/lib/db/schema";

export type HallOfFameStatus = "candidate" | "active" | "hidden";

export interface HallOfFameRow {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  college: string | null;
  tag: string;
  bio: string;
  adminBio: string | null;
  status: HallOfFameStatus;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHallOfFameInput {
  userId: string;
  tag: string;
  bio?: string;
  adminBio?: string | null;
  status?: HallOfFameStatus;
  displayOrder?: number;
}

export interface UpdateHallOfFameInput {
  tag?: string;
  bio?: string;
  adminBio?: string | null;
  status?: HallOfFameStatus;
  displayOrder?: number;
}

function assertDb() {
  if (!isDatabaseConfigured()) {
    throw new Error("数据库未配置。");
  }
  return getDb();
}

async function enrichRow(
  r: typeof hallOfFameEntries.$inferSelect,
): Promise<HallOfFameRow> {
  const db = getDb();
  const userRow = await db.query.users.findFirst({
    where: eq(users.id, r.userId),
  });
  return {
    id: r.id,
    userId: r.userId,
    userName: userRow?.name ?? "",
    userEmail: userRow?.email ?? "",
    userImage: userRow?.image ?? null,
    college: userRow?.college ?? null,
    tag: r.tag,
    bio: r.bio,
    adminBio: r.adminBio,
    status: r.status,
    displayOrder: r.displayOrder,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function listAllAdmin(): Promise<HallOfFameRow[]> {
  const db = assertDb();
  const rows = await db.query.hallOfFameEntries.findMany({
    orderBy: asc(hallOfFameEntries.displayOrder),
  });
  return Promise.all(rows.map(enrichRow));
}

export async function getOneAdmin(id: string): Promise<HallOfFameRow | null> {
  const db = assertDb();
  const row = await db.query.hallOfFameEntries.findFirst({
    where: eq(hallOfFameEntries.id, id),
  });
  return row ? enrichRow(row) : null;
}

export async function createHallOfFameEntry(
  input: CreateHallOfFameInput,
  createdBy?: string,
): Promise<HallOfFameRow> {
  const db = assertDb();
  const [row] = await db
    .insert(hallOfFameEntries)
    .values({
      userId: input.userId,
      tag: input.tag,
      bio: input.bio ?? "",
      adminBio: input.adminBio ?? null,
      status: input.status ?? "candidate",
      displayOrder: input.displayOrder ?? 0,
      createdBy: createdBy ?? null,
    })
    .returning();
  return enrichRow(row);
}

export async function updateHallOfFameEntry(
  id: string,
  input: UpdateHallOfFameInput,
): Promise<HallOfFameRow> {
  const db = assertDb();
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.tag !== undefined) updates.tag = input.tag;
  if (input.bio !== undefined) updates.bio = input.bio;
  if (input.adminBio !== undefined) updates.adminBio = input.adminBio;
  if (input.status !== undefined) updates.status = input.status;
  if (input.displayOrder !== undefined) updates.displayOrder = input.displayOrder;

  const [row] = await db
    .update(hallOfFameEntries)
    .set(updates)
    .where(eq(hallOfFameEntries.id, id))
    .returning();
  if (!row) throw new Error("名人堂条目不存在。");
  return enrichRow(row);
}

export async function deleteHallOfFameEntry(id: string): Promise<void> {
  const db = assertDb();
  await db.delete(hallOfFameEntries).where(eq(hallOfFameEntries.id, id));
}

export async function listActive(): Promise<HallOfFameRow[]> {
  const db = assertDb();
  const rows = await db.query.hallOfFameEntries.findMany({
    where: eq(hallOfFameEntries.status, "active"),
    orderBy: asc(hallOfFameEntries.displayOrder),
  });
  return Promise.all(rows.map(enrichRow));
}

export async function getForUser(
  userId: string,
): Promise<HallOfFameRow | null> {
  const db = assertDb();
  const row = await db.query.hallOfFameEntries.findFirst({
    where: eq(hallOfFameEntries.userId, userId),
  });
  return row ? enrichRow(row) : null;
}
