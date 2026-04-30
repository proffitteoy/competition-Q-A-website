import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

import {
  applications as seedApplications,
  competitions as seedCompetitions,
  notices as seedNotices,
  users as seedUsers,
} from "@/lib/mock-data";
import { getDb } from "@/lib/db/client";
import {
  authAccounts,
  authSessions,
  authVerificationTokens,
  competitionAttachments,
  competitionFaqs,
  competitionNotices,
  competitions,
  competitionStatusLogs,
  registrationAuditLogs,
  registrationFormFields,
  registrationForms,
  registrationFormVersions,
  registrations,
  registrationRevisions,
  registrationTeamMembers,
  roleAssignments,
  users,
} from "@/lib/db/schema";

const db = getDb();

function parseDateTime(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  const normalized = value.includes("T")
    ? value
    : value.replace(" ", "T") + (value.length === 16 ? ":00" : "");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateRange(range: string) {
  const [start, end] = range.split("至").map((item) => item.trim());
  return {
    startAt: start ? parseDateTime(`${start} 00:00`) : null,
    endAt: end ? parseDateTime(`${end} 23:59`) : null,
  };
}

async function clearAll() {
  await db.transaction(async (tx) => {
    await tx.delete(registrationAuditLogs);
    await tx.delete(registrationRevisions);
    await tx.delete(registrationTeamMembers);
    await tx.delete(registrations);
    await tx.delete(registrationFormFields);
    await tx.delete(registrationFormVersions);
    await tx.delete(registrationForms);
    await tx.delete(competitionStatusLogs);
    await tx.delete(competitionFaqs);
    await tx.delete(competitionAttachments);
    await tx.delete(competitionNotices);
    await tx.delete(roleAssignments);
    await tx.delete(authAccounts);
    await tx.delete(authSessions);
    await tx.delete(authVerificationTokens);
    await tx.delete(competitions);
    await tx.delete(users);
  });
}

async function seedUsersAndRoles() {
  const defaultPassword = process.env.MVP_BOOTSTRAP_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hash(defaultPassword, 10);

  await db.insert(users).values(
    seedUsers.map((user) => ({
      name: user.name,
      email: user.email,
      college: user.college,
      status: user.status,
      passwordHash,
    })),
  );

  const userRows = await db.select().from(users);
  const userIdByName = new Map(userRows.map((item) => [item.name, item.id]));

  const competitionRows = await db.select().from(competitions);
  const competitionIdBySlug = new Map(
    competitionRows.map((item) => [item.slug, item.id]),
  );

  const globalRoles = seedUsers.filter(
    (user) => user.role === "super_admin" || user.role === "student_user",
  );
  if (globalRoles.length) {
    await db.insert(roleAssignments).values(
      globalRoles
        .map((user) => {
          const userId = userIdByName.get(user.name);
          if (!userId) return null;
          return {
            userId,
            role: user.role,
            scopeType: "global" as const,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    );
  }

  const scopedRoles = seedUsers.filter(
    (user) => user.role === "competition_admin" || user.role === "content_editor",
  );
  for (const user of scopedRoles) {
    const userId = userIdByName.get(user.name);
    if (!userId) continue;

    const reviewedCompetitionSlugs = seedApplications
      .filter((item) => item.reviewer === user.name)
      .map((item) => item.competitionId);
    const scopedCompetitionIds = reviewedCompetitionSlugs
      .map((slug) => competitionIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id));

    const finalScopedIds =
      scopedCompetitionIds.length > 0
        ? scopedCompetitionIds
        : competitionRows.slice(0, 1).map((item) => item.id);

    await db.insert(roleAssignments).values(
      finalScopedIds.map((competitionId) => ({
        userId,
        role: user.role,
        scopeType: "competition" as const,
        competitionId,
      })),
    );
  }
}

async function seedCompetitionData() {
  for (const competition of seedCompetitions) {
    const registrationRange = parseDateRange(competition.registrationWindow);
    const eventRange = parseDateRange(competition.eventWindow);

    await db.insert(competitions).values({
      slug: competition.id,
      title: competition.title,
      category: competition.category,
      status: competition.status,
      summary: competition.summary,
      department: competition.department,
      registrationMode:
        competition.registrationMode === "team" ? "team" : "individual",
      registrationStartAt: registrationRange.startAt,
      registrationEndAt: registrationRange.endAt,
      eventStartAt: eventRange.startAt,
      eventEndAt: eventRange.endAt,
      location: competition.location,
      coverLabel: competition.coverLabel,
      description: competition.description,
      highlightsJson: competition.highlights,
      timelineJson: competition.timeline,
      relatedQuestionsJson: competition.relatedQuestions,
    });
  }

  const competitionRows = await db.select().from(competitions);
  const competitionIdBySlug = new Map(
    competitionRows.map((item) => [item.slug, item.id]),
  );

  for (const competition of seedCompetitions) {
    const competitionId = competitionIdBySlug.get(competition.id);
    if (!competitionId) continue;

    if (competition.faqs.length > 0) {
      await db.insert(competitionFaqs).values(
        competition.faqs.map((faq, index) => ({
          competitionId,
          question: faq.question,
          answer: faq.answer,
          displayOrder: index + 1,
        })),
      );
    }

    if (competition.attachments.length > 0) {
      await db.insert(competitionAttachments).values(
        competition.attachments.map((attachment) => ({
          competitionId,
          name: attachment,
          storageKey: `seed/${competition.id}/${attachment}`,
        })),
      );
    }
  }

  for (const notice of seedNotices) {
    const relatedCompetition = seedCompetitions.find(
      (item) => item.title === notice.competition,
    );
    if (!relatedCompetition) continue;
    const competitionId = competitionIdBySlug.get(relatedCompetition.id);
    if (!competitionId) continue;

    await db.insert(competitionNotices).values({
      competitionId,
      title: notice.title,
      content: `${notice.title}\n\n（Seed 数据）`,
      status: notice.status,
      publishedAt: notice.status === "published" ? new Date() : null,
    });
  }
}

async function seedFormsAndRegistrations() {
  const competitionRows = await db.select().from(competitions);
  const competitionIdBySlug = new Map(
    competitionRows.map((item) => [item.slug, item.id]),
  );

  const userRows = await db.select().from(users);
  const userIdByName = new Map(userRows.map((item) => [item.name, item.id]));

  const formVersionIdByCompetitionId = new Map<string, string>();

  for (const competition of seedCompetitions) {
    const competitionId = competitionIdBySlug.get(competition.id);
    if (!competitionId) continue;
    const creatorId =
      userIdByName.get("平台管理员") ??
      userRows.find((item) => item.name === "平台管理员")?.id ??
      userRows[0]?.id;
    if (!creatorId) continue;

    const formInserted = await db
      .insert(registrationForms)
      .values({
        competitionId,
        status: "published",
        applyMode: competition.registrationMode === "team" ? "team" : "individual",
        maxTeamSize: competition.registrationMode === "team" ? 5 : 1,
        createdBy: creatorId,
      })
      .returning();

    const form = formInserted[0];
    if (!form) continue;

    const versionInserted = await db
      .insert(registrationFormVersions)
      .values({
        formId: form.id,
        versionNo: 1,
        status: "active",
        changeNote: "Seed 默认版本",
        publishedAt: new Date(),
        createdBy: creatorId,
      })
      .returning();

    const version = versionInserted[0];
    if (!version) continue;

    formVersionIdByCompetitionId.set(competitionId, version.id);
    await db
      .update(registrationForms)
      .set({ currentVersionId: version.id, updatedAt: new Date() })
      .where(eq(registrationForms.id, form.id));

    await db.insert(registrationFormFields).values([
      {
        formVersionId: version.id,
        fieldKey: "applicant_name",
        label: "申请人姓名",
        fieldType: "text",
        scope: "registration",
        isRequired: true,
        displayOrder: 1,
        exportOrder: 1,
        exportLabel: "申请人姓名",
      },
      {
        formVersionId: version.id,
        fieldKey: "college",
        label: "学院",
        fieldType: "text",
        scope: "registration",
        isRequired: true,
        displayOrder: 2,
        exportOrder: 2,
        exportLabel: "学院",
      },
      {
        formVersionId: version.id,
        fieldKey: "major",
        label: "专业",
        fieldType: "text",
        scope: "registration",
        isRequired: true,
        displayOrder: 3,
        exportOrder: 3,
        exportLabel: "专业",
      },
      {
        formVersionId: version.id,
        fieldKey: "grade",
        label: "年级",
        fieldType: "text",
        scope: "registration",
        isRequired: true,
        displayOrder: 4,
        exportOrder: 4,
        exportLabel: "年级",
      },
    ]);
  }

  for (const application of seedApplications) {
    const competitionId = competitionIdBySlug.get(application.competitionId);
    if (!competitionId) continue;
    const applicantUserId = userIdByName.get(application.applicantName);
    if (!applicantUserId) continue;
    const reviewerId =
      application.reviewer === "待分配"
        ? null
        : (userIdByName.get(application.reviewer) ?? null);
    const formVersionId = formVersionIdByCompetitionId.get(competitionId);
    if (!formVersionId) continue;

    const submittedAt = parseDateTime(application.submittedAt) ?? new Date();
    const payload = {
      applicantName: application.applicantName,
      college: application.college,
      major: application.major,
      grade: application.grade,
    };
    const snapshot = {
      userId: applicantUserId,
      name: application.applicantName,
      college: application.college,
      major: application.major,
      grade: application.grade,
      capturedAt: submittedAt.toISOString(),
    };

    const inserted = await db
      .insert(registrations)
      .values({
        registrationNo: application.id,
        competitionId,
        formVersionId,
        applicantUserId,
        applyMode: application.mode,
        status: application.status,
        revisionNo: 1,
        payloadJson: payload,
        applicantSnapshotJson: snapshot,
        submittedAt,
        approvedAt: application.status === "approved" ? submittedAt : null,
        lastReviewedAt: reviewerId ? submittedAt : null,
        lastReviewedBy: reviewerId,
        latestReviewComment: application.note,
      })
      .returning();

    const registration = inserted[0];
    if (!registration) continue;

    await db.insert(registrationRevisions).values({
      registrationId: registration.id,
      revisionNo: 1,
      actionType: "submit",
      payloadSnapshotJson: payload,
      teamSnapshotJson: [],
      applicantSnapshotJson: snapshot,
      formVersionId,
      createdBy: applicantUserId,
      createdAt: submittedAt,
    });

    await db.insert(registrationAuditLogs).values({
      registrationId: registration.id,
      fromStatus: "submitted",
      toStatus: application.status,
      action:
        application.status === "approved"
          ? "approve"
          : application.status === "rejected"
            ? "reject"
            : application.status === "withdrawn"
              ? "withdraw"
              : "submit",
      operatorUserId: reviewerId ?? applicantUserId,
      operatorRole: reviewerId ? "competition_admin" : "student_user",
      comment: application.note,
      createdAt: submittedAt,
    });
  }
}

async function main() {
  await clearAll();
  await seedCompetitionData();
  await seedUsersAndRoles();
  await seedFormsAndRegistrations();
  const userRows = await db.select().from(users);
  console.log(`[seed] completed, users=${userRows.length}`);
}

main().catch((error) => {
  console.error("[seed] failed", error);
  process.exitCode = 1;
});
