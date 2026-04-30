import { desc, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { users as mockUsers, type PlatformUser, type UserRole } from "@/lib/mock-data";
import {
  competitions,
  roleAssignments,
  users as usersTable,
} from "@/lib/db/schema";

const WRITE_DISABLED_MESSAGE =
  "当前未配置数据库，写操作已禁用。请先配置 DATABASE_URL。";

export interface AdminRoleAssignmentRecord {
  id: string;
  role: UserRole;
  scopeType: "global" | "competition";
  competitionId: string | null;
  competitionTitle: string | null;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  status: PlatformUser["status"];
  primaryRole: UserRole;
  roleAssignments: AdminRoleAssignmentRecord[];
}

function pickPrimaryRole(assignments: Array<{ role: UserRole }>) {
  if (assignments.some((item) => item.role === "super_admin")) return "super_admin";
  if (assignments.some((item) => item.role === "competition_admin")) {
    return "competition_admin";
  }
  if (assignments.some((item) => item.role === "content_editor")) {
    return "content_editor";
  }
  return "student_user";
}

function mapMockUsers() {
  return mockUsers.map<AdminUserRecord>((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    college: item.college,
    status: item.status,
    primaryRole: item.role,
    roleAssignments: [
      {
        id: `mock-${item.id}`,
        role: item.role,
        scopeType: "global",
        competitionId: null,
        competitionTitle: null,
      },
    ],
  }));
}

export async function listAdminUsers() {
  if (!isDatabaseConfigured()) {
    return mapMockUsers();
  }

  const db = getDb();
  const [userRows, roleRows] = await Promise.all([
    db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        college: usersTable.college,
        status: usersTable.status,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt)),
    db
      .select({
        id: roleAssignments.id,
        userId: roleAssignments.userId,
        role: roleAssignments.role,
        scopeType: roleAssignments.scopeType,
        competitionId: roleAssignments.competitionId,
      })
      .from(roleAssignments)
      .where(isNull(roleAssignments.revokedAt)),
  ]);

  const competitionIds = roleRows
    .map((item) => item.competitionId)
    .filter((item): item is string => Boolean(item));

  const competitionMap = new Map<string, string>();
  if (competitionIds.length > 0) {
    const competitionRows = await db
      .select({
        id: competitions.id,
        title: competitions.title,
      })
      .from(competitions)
      .where(inArray(competitions.id, competitionIds));

    for (const item of competitionRows) {
      competitionMap.set(item.id, item.title);
    }
  }

  const assignmentMap = new Map<string, AdminRoleAssignmentRecord[]>();
  for (const row of roleRows) {
    const list = assignmentMap.get(row.userId) ?? [];
    list.push({
      id: row.id,
      role: row.role,
      scopeType: row.scopeType,
      competitionId: row.competitionId,
      competitionTitle: row.competitionId
        ? competitionMap.get(row.competitionId) ?? null
        : null,
    });
    assignmentMap.set(row.userId, list);
  }

  return userRows.map<AdminUserRecord>((row) => {
    const roleList = assignmentMap.get(row.id) ?? [];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      college: row.college ?? "-",
      status: row.status,
      primaryRole: pickPrimaryRole(roleList),
      roleAssignments: roleList,
    };
  });
}

export async function getAdminUserById(userId: string) {
  const users = await listAdminUsers();
  return users.find((item) => item.id === userId);
}

export async function updateUserStatus(
  userId: string,
  status: PlatformUser["status"],
) {
  if (!isDatabaseConfigured()) {
    throw new Error(WRITE_DISABLED_MESSAGE);
  }

  const db = getDb();
  const updated = await db
    .update(usersTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id });

  if (updated.length === 0) {
    throw new Error("用户不存在");
  }

  return getAdminUserById(userId);
}

interface SetUserPrimaryRoleInput {
  userId: string;
  role: UserRole;
  competitionId?: string;
  grantedBy?: string;
}

export async function setUserPrimaryRole(input: SetUserPrimaryRoleInput) {
  if (!isDatabaseConfigured()) {
    throw new Error(WRITE_DISABLED_MESSAGE);
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(usersTable.id, input.userId),
  });
  if (!user) {
    throw new Error("用户不存在");
  }

  const scopeType =
    input.role === "super_admin" || input.role === "student_user"
      ? "global"
      : "competition";

  let nextCompetitionId: string | null = null;
  if (scopeType === "competition") {
    if (!input.competitionId) {
      throw new Error("competition_admin/content_editor 必须指定比赛作用域");
    }
    const competition = await db.query.competitions.findFirst({
      where: eq(competitions.id, input.competitionId),
    });
    if (!competition) {
      throw new Error("指定的比赛不存在");
    }
    nextCompetitionId = competition.id;
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(roleAssignments)
      .set({ revokedAt: now })
      .where(eq(roleAssignments.userId, input.userId));

    await tx.insert(roleAssignments).values({
      userId: input.userId,
      role: input.role,
      scopeType,
      competitionId: nextCompetitionId,
      grantedBy: input.grantedBy ?? null,
      revokedAt: null,
    });
  });

  return getAdminUserById(input.userId);
}
