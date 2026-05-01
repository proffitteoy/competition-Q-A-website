import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import {
  applications as mockApplications,
  type ApplicationRecord,
} from "@/lib/mock-data";
import type { UploadedFileMeta } from "@/lib/storage/types";
import {
  competitions,
  registrationAuditLogs,
  registrationFormFields,
  registrationForms,
  registrationFormVersions,
  registrations,
  registrationRevisions,
  roleAssignments,
  users,
} from "@/lib/db/schema";
import { formatAppDateTime } from "@/lib/date-time";
import { isActiveRegistration } from "@/server/services/application-status-service";

type RegistrationStatus = ApplicationRecord["status"];
type DbTx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

const ACTIVE_REGISTRATION_STATUSES: RegistrationStatus[] = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "withdrawn",
];

const MOCK_WRITE_DISABLED_MESSAGE =
  "数据库未配置，写操作已禁用。";

function defaultNoteByStatus(status: RegistrationStatus) {
  if (status === "draft") return "草稿未提交。";
  if (status === "submitted") return "已提交，待审核。";
  if (status === "approved") return "审核已通过。";
  if (status === "rejected") return "审核未通过，请补充后重新提交。";
  if (status === "withdrawn") return "已由申请人撤回。";
  return "已取消。";
}

function buildApplicationId(sequence: number) {
  const year = new Date().getFullYear();
  return `APP-${year}-${String(sequence).padStart(4, "0")}`;
}

async function nextRegistrationNo(tx: DbTx) {
  const result = await tx
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(registrations);
  const count = result[0]?.count ?? 0;
  return buildApplicationId(count + 1);
}

export interface SubmitApplicationInput {
  competitionId: string;
  competitionTitle: string;
  applicantUserId?: string;
  applicantName: string;
  studentId: string;
  college: string;
  major: string;
  grade: string;
  phone: string;
  email: string;
  statement: string;
  teamName?: string;
  attachments?: UploadedFileMeta[];
  mode: ApplicationRecord["mode"];
}

async function ensureApplicantUser(tx: DbTx, input: SubmitApplicationInput) {
  if (input.applicantUserId) {
    const existingById = await tx.query.users.findFirst({
      where: eq(users.id, input.applicantUserId),
    });
    if (!existingById) {
      throw new Error("登录会话已失效，请重新登录后重试。");
    }

    if (
      existingById.email &&
      existingById.email.toLowerCase() !== input.email.toLowerCase()
    ) {
      throw new Error("报名邮箱必须与当前登录账号一致。");
    }

    const updated = await tx
      .update(users)
      .set({
        name: input.applicantName,
        email: input.email,
        studentNo: input.studentId,
        college: input.college,
        major: input.major,
        grade: input.grade,
        phone: input.phone,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.applicantUserId))
      .returning();

    return updated[0] ?? existingById;
  }

  const existingByEmail = await tx.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingByEmail) {
    const updated = await tx
      .update(users)
      .set({
        name: input.applicantName,
        studentNo: input.studentId,
        college: input.college,
        major: input.major,
        grade: input.grade,
        phone: input.phone,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingByEmail.id))
      .returning();
    return updated[0] ?? existingByEmail;
  }

  const existingByStudentNo = await tx.query.users.findFirst({
    where: eq(users.studentNo, input.studentId),
  });

  if (existingByStudentNo) {
    const updated = await tx
      .update(users)
      .set({
        name: input.applicantName,
        email: input.email,
        college: input.college,
        major: input.major,
        grade: input.grade,
        phone: input.phone,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingByStudentNo.id))
      .returning();
    return updated[0] ?? existingByStudentNo;
  }

  const created = await tx
    .insert(users)
    .values({
      name: input.applicantName,
      email: input.email,
      studentNo: input.studentId,
      college: input.college,
      major: input.major,
      grade: input.grade,
      phone: input.phone,
      status: "active",
    })
    .returning();

  const applicant = created[0];
  if (!applicant) {
    throw new Error("创建报名用户失败。");
  }

  await tx
    .insert(roleAssignments)
    .values({
      userId: applicant.id,
      role: "student_user",
      scopeType: "global",
    })
    .onConflictDoNothing();

  return applicant;
}

async function ensureCompetitionFormVersion(
  tx: DbTx,
  competitionId: string,
  mode: SubmitApplicationInput["mode"],
  createdBy: string,
) {
  let form = await tx.query.registrationForms.findFirst({
    where: eq(registrationForms.competitionId, competitionId),
  });

  if (!form) {
    const created = await tx
      .insert(registrationForms)
      .values({
        competitionId,
        status: "published",
        applyMode: mode === "team" ? "team" : "individual",
        maxTeamSize: mode === "team" ? 5 : 1,
        createdBy,
      })
      .returning();
    form = created[0];
  }

  if (!form) {
    throw new Error("初始化报名表失败。");
  }

  if (form.currentVersionId) {
    const currentVersion = await tx.query.registrationFormVersions.findFirst({
      where: eq(registrationFormVersions.id, form.currentVersionId),
    });
    if (currentVersion) {
      return currentVersion.id;
    }
  }

  const latestVersion = await tx.query.registrationFormVersions.findFirst({
    where: eq(registrationFormVersions.formId, form.id),
    orderBy: desc(registrationFormVersions.versionNo),
  });

  if (latestVersion) {
    await tx
      .update(registrationForms)
      .set({
        currentVersionId: latestVersion.id,
        status: "published",
        updatedAt: new Date(),
      })
      .where(eq(registrationForms.id, form.id));
    return latestVersion.id;
  }

  const createdVersion = await tx
    .insert(registrationFormVersions)
    .values({
      formId: form.id,
      versionNo: 1,
      status: "active",
      changeNote: "MVP default version",
      publishedAt: new Date(),
      createdBy,
    })
    .returning();

  const version = createdVersion[0];
  if (!version) {
    throw new Error("初始化报名表版本失败。");
  }

  await tx
    .insert(registrationFormFields)
    .values([
      {
        formVersionId: version.id,
        fieldKey: "applicant_name",
        label: "Applicant Name",
        fieldType: "text",
        scope: "registration",
        isRequired: true,
        displayOrder: 1,
        exportOrder: 1,
        exportLabel: "Applicant Name",
      },
      {
        formVersionId: version.id,
        fieldKey: "college",
        label: "College",
        fieldType: "text",
        scope: "registration",
        isRequired: true,
        displayOrder: 2,
        exportOrder: 2,
        exportLabel: "College",
      },
      {
        formVersionId: version.id,
        fieldKey: "major",
        label: "Major",
        fieldType: "text",
        scope: "registration",
        isRequired: true,
        displayOrder: 3,
        exportOrder: 3,
        exportLabel: "Major",
      },
      {
        formVersionId: version.id,
        fieldKey: "grade",
        label: "Grade",
        fieldType: "text",
        scope: "registration",
        isRequired: true,
        displayOrder: 4,
        exportOrder: 4,
        exportLabel: "Grade",
      },
    ])
    .onConflictDoNothing();

  await tx
    .update(registrationForms)
    .set({
      currentVersionId: version.id,
      status: "published",
      updatedAt: new Date(),
    })
    .where(eq(registrationForms.id, form.id));

  return version.id;
}

function mapReviewAction(toStatus: RegistrationStatus) {
  if (toStatus === "approved") return "approve";
  if (toStatus === "rejected") return "reject";
  if (toStatus === "withdrawn") return "withdraw";
  if (toStatus === "cancelled") return "cancel";
  return "submit";
}

const applicantUser = alias(users, "applicant_user");
const reviewerUser = alias(users, "reviewer_user");

type QueryFilters = {
  applicationId?: string;
  keyword?: string;
  status?: RegistrationStatus;
  competitionId?: string;
  applicantName?: string;
  applicantUserId?: string;
  allowedCompetitionIds?: string[];
};

function queryMockApplications(filters: QueryFilters = {}) {
  if (filters.allowedCompetitionIds && filters.allowedCompetitionIds.length === 0) {
    return [];
  }

  const keyword = filters.keyword?.trim().toLowerCase();

  return [...mockApplications]
    .filter((item) => {
      if (filters.applicationId && item.id !== filters.applicationId) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.competitionId && item.competitionId !== filters.competitionId) return false;
      if (filters.applicantName && item.applicantName !== filters.applicantName) return false;
      if (filters.applicantUserId) return false;
      if (
        filters.allowedCompetitionIds &&
        filters.allowedCompetitionIds.length > 0 &&
        !filters.allowedCompetitionIds.includes(item.competitionId)
      ) {
        return false;
      }

      if (!keyword) return true;

      return [item.competitionTitle, item.applicantName, item.college].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    })
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

async function queryApplications(filters: QueryFilters = {}) {
  if (filters.allowedCompetitionIds && filters.allowedCompetitionIds.length === 0) {
    return [];
  }

  if (!isDatabaseConfigured()) {
    return queryMockApplications(filters);
  }

  const db = getDb();
  const conditions: SQL[] = [];

  if (filters.keyword) {
    const keyword = `%${filters.keyword}%`;
    conditions.push(
      or(
        ilike(competitions.title, keyword),
        ilike(applicantUser.name, keyword),
        ilike(applicantUser.college, keyword),
      )!,
    );
  }

  if (filters.status) {
    conditions.push(eq(registrations.status, filters.status));
  }

  if (filters.applicationId) {
    conditions.push(eq(registrations.registrationNo, filters.applicationId));
  }

  if (filters.competitionId) {
    conditions.push(eq(registrations.competitionId, filters.competitionId));
  }

  if (filters.allowedCompetitionIds && filters.allowedCompetitionIds.length > 0) {
    conditions.push(inArray(registrations.competitionId, filters.allowedCompetitionIds));
  }

  if (filters.applicantUserId) {
    conditions.push(eq(registrations.applicantUserId, filters.applicantUserId));
  }

  if (filters.applicantName) {
    conditions.push(eq(applicantUser.name, filters.applicantName));
  }

  const rows = await db
    .select({
      registrationId: registrations.id,
      registrationNo: registrations.registrationNo,
      competitionId: registrations.competitionId,
      competitionTitle: competitions.title,
      applicantName: applicantUser.name,
      applicantCollege: applicantUser.college,
      applicantMajor: applicantUser.major,
      applicantGrade: applicantUser.grade,
      submittedAt: registrations.submittedAt,
      applyMode: registrations.applyMode,
      status: registrations.status,
      reviewerName: reviewerUser.name,
      latestReviewComment: registrations.latestReviewComment,
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .innerJoin(applicantUser, eq(registrations.applicantUserId, applicantUser.id))
    .leftJoin(reviewerUser, eq(registrations.lastReviewedBy, reviewerUser.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(registrations.updatedAt));

  return rows.map<ApplicationRecord>((row) => ({
    id: row.registrationNo,
    competitionId: row.competitionId,
    competitionTitle: row.competitionTitle,
    applicantName: row.applicantName,
    college: row.applicantCollege ?? "-",
    major: row.applicantMajor ?? "-",
    grade: row.applicantGrade ?? "-",
    submittedAt: formatAppDateTime(row.submittedAt, "未提交"),
    mode: row.applyMode,
    status: row.status,
    reviewer: row.reviewerName ?? "待分配",
    note: row.latestReviewComment ?? defaultNoteByStatus(row.status),
  }));
}

export async function listApplications() {
  return queryApplications();
}

export async function listApplicationsWithFilters(filters: QueryFilters) {
  return queryApplications(filters);
}

export async function listApplicationsByApplicant(applicantName: string) {
  return queryApplications({ applicantName });
}

export async function listApplicationsByApplicantUserId(applicantUserId: string) {
  return queryApplications({ applicantUserId });
}

export async function getApplicationById(id: string) {
  const rows = await queryApplications({ applicationId: id });
  return rows[0];
}

export async function submitApplication(input: SubmitApplicationInput) {
  if (!isDatabaseConfigured()) {
    throw new Error(MOCK_WRITE_DISABLED_MESSAGE);
  }

  const db = getDb();
  const insertedNo = await db.transaction(async (tx) => {
    const competition = await tx.query.competitions.findFirst({
      where: eq(competitions.id, input.competitionId),
    });
    if (!competition) {
      throw new Error("比赛不存在。");
    }

    const applicant = await ensureApplicantUser(tx, input);

    const duplicated = await tx.query.registrations.findFirst({
      where: and(
        eq(registrations.competitionId, input.competitionId),
        eq(registrations.applicantUserId, applicant.id),
        inArray(registrations.status, ACTIVE_REGISTRATION_STATUSES),
      ),
    });
    if (duplicated && isActiveRegistration(duplicated.status)) {
      throw new Error("该比赛已存在一条活跃报名记录。");
    }

    const formVersionId = await ensureCompetitionFormVersion(
      tx,
      input.competitionId,
      input.mode,
      applicant.id,
    );
    const registrationNo = await nextRegistrationNo(tx);
    const now = new Date();

    const payload = {
      applicantName: input.applicantName,
      studentId: input.studentId,
      college: input.college,
      major: input.major,
      grade: input.grade,
      phone: input.phone,
      email: input.email,
      statement: input.statement,
      teamName: input.teamName ?? null,
      attachments: input.attachments ?? [],
    } as Record<string, unknown>;

    const applicantSnapshot = {
      userId: applicant.id,
      name: input.applicantName,
      studentId: input.studentId,
      college: input.college,
      major: input.major,
      grade: input.grade,
      phone: input.phone,
      email: input.email,
      capturedAt: now.toISOString(),
    };

    const teamSnapshot =
      input.mode === "team" && input.teamName
        ? [
            {
              teamName: input.teamName,
              leaderName: input.applicantName,
              leaderStudentId: input.studentId,
            },
          ]
        : [];

    const created = await tx
      .insert(registrations)
      .values({
        registrationNo,
        competitionId: input.competitionId,
        formVersionId,
        applicantUserId: applicant.id,
        applyMode: input.mode,
        status: "submitted",
        revisionNo: 1,
        payloadJson: payload,
        applicantSnapshotJson: applicantSnapshot,
        submittedAt: now,
        latestReviewComment: "已提交，待审核。",
      })
      .returning();

    const registration = created[0];
    if (!registration) {
      throw new Error("创建报名记录失败。");
    }

    await tx.insert(registrationRevisions).values({
      registrationId: registration.id,
      revisionNo: 1,
      actionType: "submit",
      payloadSnapshotJson: payload,
      teamSnapshotJson: teamSnapshot,
      applicantSnapshotJson: applicantSnapshot,
      formVersionId,
      createdBy: applicant.id,
    });

    await tx.insert(registrationAuditLogs).values({
      registrationId: registration.id,
      fromStatus: "submitted",
      toStatus: "submitted",
      action: "submit",
      operatorUserId: applicant.id,
      operatorRole: "student_user",
      comment: "学生提交报名。",
    });

    return registrationNo;
  });

  const latest = await getApplicationById(insertedNo);
  if (!latest) {
    throw new Error("报名已提交，但读取最新记录失败。");
  }
  return latest;
}

export async function reviewApplication(
  id: string,
  toStatus: RegistrationStatus,
  operator: { userId?: string; role: "super_admin" | "competition_admin"; name: string },
  comment: string,
) {
  if (!isDatabaseConfigured()) {
    throw new Error(MOCK_WRITE_DISABLED_MESSAGE);
  }

  const db = getDb();
  await db.transaction(async (tx) => {
    const current = await tx.query.registrations.findFirst({
      where: eq(registrations.registrationNo, id),
    });
    if (!current) {
      throw new Error("报名记录不存在。");
    }

    const now = new Date();
    await tx
      .update(registrations)
      .set({
        status: toStatus,
        lastReviewedAt: now,
        lastReviewedBy: operator.userId ?? null,
        latestReviewComment: comment,
        approvedAt: toStatus === "approved" ? now : current.approvedAt,
        updatedAt: now,
      })
      .where(eq(registrations.id, current.id));

    await tx.insert(registrationAuditLogs).values({
      registrationId: current.id,
      fromStatus: current.status,
      toStatus,
      action: mapReviewAction(toStatus),
      operatorUserId: operator.userId ?? null,
      operatorRole: operator.role,
      comment,
    });
  });

  const refreshed = await getApplicationById(id);
  if (!refreshed) {
    throw new Error("审核已完成，但读取更新后的记录失败。");
  }
  return refreshed;
}

export async function bulkReviewApplications(input: {
  ids: string[];
  toStatus: RegistrationStatus;
  operator: { userId?: string; role: "super_admin" | "competition_admin"; name: string };
  comment: string;
}) {
  if (!isDatabaseConfigured()) {
    throw new Error(MOCK_WRITE_DISABLED_MESSAGE);
  }

  if (input.ids.length === 0) {
    return { updated: 0 };
  }

  let updatedCount = 0;
  for (const id of input.ids) {
    try {
      await reviewApplication(id, input.toStatus, input.operator, input.comment);
      updatedCount += 1;
    } catch {
      // Continue for other records in batch mode.
    }
  }

  return { updated: updatedCount };
}

export async function listRegistrationAuditLogsByApplicationIds(
  applicationIds: string[],
) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  if (applicationIds.length === 0) {
    return [];
  }

  const db = getDb();
  const registrationRows = await db
    .select({
      id: registrations.id,
      registrationNo: registrations.registrationNo,
    })
    .from(registrations)
    .where(inArray(registrations.registrationNo, applicationIds));

  if (registrationRows.length === 0) {
    return [];
  }

  const mapByRegistrationId = new Map(
    registrationRows.map((row) => [row.id, row.registrationNo]),
  );

  const reviewerAlias = alias(users, "audit_operator");
  const logs = await db
    .select({
      registrationId: registrationAuditLogs.registrationId,
      fromStatus: registrationAuditLogs.fromStatus,
      toStatus: registrationAuditLogs.toStatus,
      action: registrationAuditLogs.action,
      comment: registrationAuditLogs.comment,
      createdAt: registrationAuditLogs.createdAt,
      operatorName: reviewerAlias.name,
    })
    .from(registrationAuditLogs)
    .leftJoin(
      reviewerAlias,
      eq(registrationAuditLogs.operatorUserId, reviewerAlias.id),
    )
    .where(inArray(registrationAuditLogs.registrationId, [...mapByRegistrationId.keys()]))
    .orderBy(asc(registrationAuditLogs.createdAt));

  return logs.map((item) => ({
    applicationId: mapByRegistrationId.get(item.registrationId) ?? "",
    fromStatus: item.fromStatus,
    toStatus: item.toStatus,
    action: item.action,
    comment: item.comment,
    createdAt: formatAppDateTime(item.createdAt),
    operatorName: item.operatorName ?? "系统",
  }));
}
