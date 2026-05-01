import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "pending_verification",
  "disabled",
]);

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "competition_admin",
  "content_editor",
  "student_user",
]);

export const roleScopeEnum = pgEnum("role_scope", ["global", "competition"]);

export const competitionStatusEnum = pgEnum("competition_status", [
  "draft",
  "upcoming",
  "registration_open",
  "in_progress",
  "finished",
  "archived",
]);

export const registrationModeEnum = pgEnum("registration_mode", [
  "individual",
  "team",
  "both",
]);

export const registrationApplyModeEnum = pgEnum("registration_apply_mode", [
  "individual",
  "team",
]);

export const registrationFormStatusEnum = pgEnum("registration_form_status", [
  "draft",
  "published",
  "archived",
]);

export const registrationFormVersionStatusEnum = pgEnum(
  "registration_form_version_status",
  ["draft", "active", "retired"],
);

export const registrationFieldScopeEnum = pgEnum("registration_field_scope", [
  "registration",
  "team_member",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "withdrawn",
  "cancelled",
]);

export const registrationRevisionActionEnum = pgEnum(
  "registration_revision_action",
  ["save_draft", "submit", "resubmit", "withdraw"],
);

export const registrationAuditActionEnum = pgEnum("registration_audit_action", [
  "submit",
  "resubmit",
  "approve",
  "reject",
  "withdraw",
  "cancel",
  "system_cancel",
]);

export const noticeStatusEnum = pgEnum("notice_status", [
  "draft",
  "published",
  "withdrawn",
]);

export const attachmentVisibilityEnum = pgEnum("attachment_visibility", [
  "public",
  "admin_only",
]);

export const questionStatusEnum = pgEnum("question_status", [
  "open",
  "closed",
  "hidden",
]);

export const users = pgTable(
  "user",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    image: text("image"),
    passwordHash: text("password_hash"),
    studentNo: varchar("student_no", { length: 64 }),
    college: varchar("college", { length: 120 }),
    major: varchar("major", { length: 120 }),
    grade: varchar("grade", { length: 64 }),
    phone: varchar("phone", { length: 64 }),
    status: userStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("user_email_unique").on(table.email),
  }),
);

export const competitions = pgTable(
  "competition",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 128 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    category: varchar("category", { length: 120 }).notNull(),
    status: competitionStatusEnum("status").default("draft").notNull(),
    summary: text("summary").notNull(),
    department: varchar("department", { length: 120 }).notNull(),
    registrationMode: registrationModeEnum("registration_mode")
      .default("individual")
      .notNull(),
    registrationStartAt: timestamp("registration_start_at", { withTimezone: true }),
    registrationEndAt: timestamp("registration_end_at", { withTimezone: true }),
    eventStartAt: timestamp("event_start_at", { withTimezone: true }),
    eventEndAt: timestamp("event_end_at", { withTimezone: true }),
    location: varchar("location", { length: 255 }),
    coverLabel: varchar("cover_label", { length: 120 }),
    description: text("description"),
    highlightsJson: jsonb("highlights_json")
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    timelineJson: jsonb("timeline_json")
      .$type<Array<{ label: string; date: string; description: string }>>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    relatedQuestionsJson: jsonb("related_questions_json")
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("competition_slug_unique").on(table.slug),
    statusIdx: index("competition_status_idx").on(table.status),
  }),
);

export const roleAssignments = pgTable(
  "role_assignment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
    scopeType: roleScopeEnum("scope_type").notNull(),
    competitionId: uuid("competition_id").references(() => competitions.id, {
      onDelete: "cascade",
    }),
    grantedBy: uuid("granted_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => ({
    userRoleScopeUnique: uniqueIndex("role_assignment_user_role_scope_unique")
      .on(table.userId, table.role, table.scopeType, table.competitionId)
      .where(sql`${table.revokedAt} is null`),
    userIdx: index("role_assignment_user_idx").on(table.userId),
    competitionIdx: index("role_assignment_competition_idx").on(
      table.competitionId,
    ),
  }),
);

export const competitionStatusLogs = pgTable(
  "competition_status_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    fromStatus: competitionStatusEnum("from_status").notNull(),
    toStatus: competitionStatusEnum("to_status").notNull(),
    operatorUserId: uuid("operator_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    operatorRole: userRoleEnum("operator_role").notNull(),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionCreatedAtIdx: index("competition_status_log_competition_created_idx").on(
      table.competitionId,
      table.createdAt,
    ),
  }),
);

export const competitionNotices = pgTable(
  "competition_notice",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: noticeStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionIdx: index("competition_notice_competition_idx").on(table.competitionId),
  }),
);

export const competitionAttachments = pgTable(
  "competition_attachment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    storageKey: varchar("storage_key", { length: 512 }).notNull(),
    mimeType: varchar("mime_type", { length: 128 }),
    sizeBytes: integer("size_bytes"),
    visibility: attachmentVisibilityEnum("visibility")
      .default("public")
      .notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionIdx: index("competition_attachment_competition_idx").on(
      table.competitionId,
    ),
  }),
);

export const competitionFaqs = pgTable(
  "competition_faq",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionIdx: index("competition_faq_competition_idx").on(table.competitionId),
  }),
);

export const registrationForms = pgTable(
  "registration_form",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    status: registrationFormStatusEnum("status").default("draft").notNull(),
    applyMode: registrationModeEnum("apply_mode").default("individual").notNull(),
    maxTeamSize: integer("max_team_size").default(1).notNull(),
    currentVersionId: uuid("current_version_id"),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionUnique: uniqueIndex("registration_form_competition_unique").on(
      table.competitionId,
    ),
  }),
);

export const registrationFormVersions = pgTable(
  "registration_form_version",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => registrationForms.id, { onDelete: "cascade" }),
    versionNo: integer("version_no").notNull(),
    status: registrationFormVersionStatusEnum("status").default("draft").notNull(),
    changeNote: text("change_note"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    versionUnique: unique("registration_form_version_form_version_unique").on(
      table.formId,
      table.versionNo,
    ),
    formIdx: index("registration_form_version_form_idx").on(table.formId),
  }),
);

export const registrationFormFields = pgTable(
  "registration_form_field",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formVersionId: uuid("form_version_id")
      .notNull()
      .references(() => registrationFormVersions.id, { onDelete: "cascade" }),
    fieldKey: varchar("field_key", { length: 120 }).notNull(),
    label: varchar("label", { length: 160 }).notNull(),
    fieldType: varchar("field_type", { length: 80 }).notNull(),
    scope: registrationFieldScopeEnum("scope").default("registration").notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    exportOrder: integer("export_order").default(0).notNull(),
    exportLabel: varchar("export_label", { length: 160 }),
    placeholder: text("placeholder"),
    helpText: text("help_text"),
    defaultValueJson: jsonb("default_value_json")
      .$type<Record<string, unknown> | string | number | boolean | null>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    optionsJson: jsonb("options_json")
      .$type<Array<Record<string, unknown>>>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    validationJson: jsonb("validation_json")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    visibilityRuleJson: jsonb("visibility_rule_json")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    fieldKeyUnique: unique("registration_form_field_version_field_key_unique").on(
      table.formVersionId,
      table.fieldKey,
    ),
    formVersionIdx: index("registration_form_field_form_version_idx").on(
      table.formVersionId,
    ),
  }),
);

export const registrations = pgTable(
  "registration",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationNo: varchar("registration_no", { length: 32 }).notNull(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    formVersionId: uuid("form_version_id")
      .notNull()
      .references(() => registrationFormVersions.id, { onDelete: "restrict" }),
    applicantUserId: uuid("applicant_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    applyMode: registrationApplyModeEnum("apply_mode").notNull(),
    status: registrationStatusEnum("status").default("draft").notNull(),
    revisionNo: integer("revision_no").default(0).notNull(),
    payloadJson: jsonb("payload_json")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    applicantSnapshotJson: jsonb("applicant_snapshot_json")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    lastReviewedBy: uuid("last_reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    latestReviewComment: text("latest_review_comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    registrationNoUnique: uniqueIndex("registration_no_unique").on(
      table.registrationNo,
    ),
    statusIdx: index("registration_status_idx").on(table.status),
    competitionStatusIdx: index("registration_competition_status_idx").on(
      table.competitionId,
      table.status,
    ),
    activeRegistrationUnique: uniqueIndex(
      "registration_competition_applicant_active_unique",
    )
      .on(table.competitionId, table.applicantUserId)
      .where(
        sql`${table.status} in ('draft', 'submitted', 'approved', 'rejected', 'withdrawn')`,
      ),
  }),
);

export const registrationTeamMembers = pgTable(
  "registration_team_member",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    isLeader: boolean("is_leader").default(false).notNull(),
    memberRole: varchar("member_role", { length: 120 }),
    name: varchar("name", { length: 100 }).notNull(),
    studentNo: varchar("student_no", { length: 64 }),
    college: varchar("college", { length: 120 }),
    major: varchar("major", { length: 120 }),
    grade: varchar("grade", { length: 64 }),
    phone: varchar("phone", { length: 64 }),
    email: varchar("email", { length: 255 }),
    memberPayloadJson: jsonb("member_payload_json")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    registrationIdx: index("registration_team_member_registration_idx").on(
      table.registrationId,
    ),
  }),
);

export const registrationRevisions = pgTable(
  "registration_revision",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    revisionNo: integer("revision_no").notNull(),
    actionType: registrationRevisionActionEnum("action_type").notNull(),
    payloadSnapshotJson: jsonb("payload_snapshot_json")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    teamSnapshotJson: jsonb("team_snapshot_json")
      .$type<Array<Record<string, unknown>>>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    applicantSnapshotJson: jsonb("applicant_snapshot_json")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    formVersionId: uuid("form_version_id")
      .notNull()
      .references(() => registrationFormVersions.id, { onDelete: "restrict" }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    registrationRevisionUnique: unique(
      "registration_revision_registration_revision_no_unique",
    ).on(table.registrationId, table.revisionNo),
    registrationIdx: index("registration_revision_registration_idx").on(
      table.registrationId,
    ),
  }),
);

export const registrationAuditLogs = pgTable(
  "registration_audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    fromStatus: registrationStatusEnum("from_status").notNull(),
    toStatus: registrationStatusEnum("to_status").notNull(),
    action: registrationAuditActionEnum("action").notNull(),
    operatorUserId: uuid("operator_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    operatorRole: userRoleEnum("operator_role").notNull(),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    registrationCreatedAtIdx: index("registration_audit_log_registration_created_idx").on(
      table.registrationId,
      table.createdAt,
    ),
  }),
);

export const questions = pgTable(
  "question",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body").notNull(),
    status: questionStatusEnum("status").default("open").notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    answerCount: integer("answer_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionStatusIdx: index("question_competition_status_idx").on(
      table.competitionId,
      table.status,
    ),
    authorIdx: index("question_author_idx").on(table.authorId),
  }),
);

export const answers = pgTable(
  "answer",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    isAccepted: boolean("is_accepted").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    questionIdx: index("answer_question_idx").on(table.questionId),
    authorIdx: index("answer_author_idx").on(table.authorId),
  }),
);

export const questionComments = pgTable(
  "question_comment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    answerId: uuid("answer_id").references(() => answers.id, {
      onDelete: "cascade",
    }),
    parentId: uuid("parent_id"),
    depth: integer("depth").default(0).notNull(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    questionIdx: index("question_comment_question_idx").on(table.questionId),
    parentIdx: index("question_comment_parent_idx").on(table.parentId),
  }),
);

export const authAccounts = pgTable(
  "auth_account",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(),
    provider: varchar("provider", { length: 64 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 191 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 32 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.provider, table.providerAccountId],
      name: "auth_account_provider_provider_account_pk",
    }),
  }),
);

export const authSessions = pgTable(
  "auth_session",
  {
    sessionToken: varchar("session_token", { length: 191 }).notNull().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => ({
    userIdx: index("auth_session_user_idx").on(table.userId),
  }),
);

export const authVerificationTokens = pgTable(
  "auth_verification_token",
  {
    identifier: varchar("identifier", { length: 191 }).notNull(),
    token: varchar("token", { length: 191 }).notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.identifier, table.token],
      name: "auth_verification_token_identifier_token_pk",
    }),
  }),
);

export const authSchema = {
  usersTable: users,
  accountsTable: authAccounts,
  sessionsTable: authSessions,
  verificationTokensTable: authVerificationTokens,
};
