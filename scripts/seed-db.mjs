import process from "node:process";

import pg from "pg";
import { hash } from "bcryptjs";

const { Client } = pg;

const userSeeds = [
  {
    name: "王老师",
    role: "competition_admin",
    college: "数学学院",
    email: "wang@college.example",
    status: "active",
  },
  {
    name: "赵老师",
    role: "content_editor",
    college: "智能制造学院",
    email: "zhao@college.example",
    status: "active",
  },
  {
    name: "张雨桐",
    role: "student_user",
    college: "数学学院",
    email: "zhangyt@stu.example",
    status: "active",
  },
  {
    name: "平台管理员",
    role: "super_admin",
    college: "信息中心",
    email: "super@college.example",
    status: "active",
  },
];

const competitionSeeds = [
  {
    slug: "math-modeling-2026",
    title: "2026 全国大学生数学建模竞赛院内选拔",
    category: "数学建模",
    status: "registration_open",
    summary:
      "面向全院开放的建模选拔赛，要求 3 人组队，提供往届题库、讲义和训练营支持。",
    department: "信息与计算科学系",
    registrationMode: "team",
    registrationWindow: "2026-05-01 至 2026-05-20",
    eventWindow: "2026-06-01 至 2026-08-31",
    location: "理科楼 A301 / 线上协作",
    coverLabel: "建模训练营",
    description:
      "学生需要在截止日前提交组队信息、方向偏好与基础能力说明。",
    highlights: ["3 人组队报名", "院内训练营支持", "提供历史资料包"],
    timeline: [
      {
        label: "报名开启",
        date: "2026-05-01",
        description: "开放学生报名和团队信息填写。",
      },
      {
        label: "报名截止",
        date: "2026-05-20",
        description: "停止新增报名，进入院内资格审查。",
      },
    ],
    faqs: [
      {
        question: "没有完整团队是否可以先报名？",
        answer: "可以，后台会在审核意见中要求后续补齐。",
      },
    ],
    attachments: ["报名说明.pdf", "训练营日程.xlsx"],
    relatedQuestions: ["如何准备建模选题方向？"],
  },
  {
    slug: "robot-innovation-2026",
    title: "2026 智能机器人创新挑战赛",
    category: "创新创业",
    status: "upcoming",
    summary: "聚焦机器人视觉、路径规划与原型展示。",
    department: "智能制造学院",
    registrationMode: "team",
    registrationWindow: "2026-05-18 至 2026-06-08",
    eventWindow: "2026-06-20 至 2026-09-15",
    location: "创新工坊一层",
    coverLabel: "机器人专项",
    description: "强调作品展示与项目管理，支持附件补交。",
    highlights: ["支持项目摘要上传", "阶段性答辩", "作品展示专区"],
    timeline: [
      {
        label: "报名预告",
        date: "2026-05-18",
        description: "公布赛事主题与赛道方向。",
      },
    ],
    faqs: [
      {
        question: "可以跨学院组队吗？",
        answer: "允许，但需由本学院学生担任队长。",
      },
    ],
    attachments: ["赛事章程.pdf", "项目摘要模板.docx"],
    relatedQuestions: ["项目摘要写到什么深度？"],
  },
  {
    slug: "programming-contest-2026",
    title: "2026 程序设计校赛",
    category: "程序设计",
    status: "in_progress",
    summary: "ACM/ICPC 风格校内程序设计竞赛，已进入集训阶段。",
    department: "计算机学院",
    registrationMode: "individual",
    registrationWindow: "2026-03-10 至 2026-03-31",
    eventWindow: "2026-04-10 至 2026-06-10",
    location: "软件楼实验中心",
    coverLabel: "算法集训",
    description: "报名入口关闭后仍展示通知、答疑与附件。",
    highlights: ["个人报名", "赛前集训", "题单与讲评同步更新"],
    timeline: [
      {
        label: "集训阶段",
        date: "2026-04-10",
        description: "每周训练与榜单讲评。",
      },
    ],
    faqs: [],
    attachments: ["校赛题单.pdf"],
    relatedQuestions: ["比赛时使用什么语言环境？"],
  },
  {
    slug: "finance-case-2025",
    title: "2025 商业分析案例大赛",
    category: "案例分析",
    status: "finished",
    summary: "已完赛赛事，用于展示归档资料沉淀。",
    department: "商学院",
    registrationMode: "team",
    registrationWindow: "2025-09-01 至 2025-09-20",
    eventWindow: "2025-10-01 至 2025-12-01",
    location: "商学院报告厅",
    coverLabel: "案例复盘",
    description: "保留归档资料、复盘通知和常见问题。",
    highlights: ["往届资料归档", "评审反馈复盘"],
    timeline: [
      {
        label: "赛事结束",
        date: "2025-12-01",
        description: "获奖名单已发布并归档。",
      },
    ],
    faqs: [],
    attachments: ["获奖名单.pdf"],
    relatedQuestions: ["评审最看重哪些维度？"],
  },
];

const applicationSeeds = [
  {
    id: "APP-2026-001",
    competitionSlug: "math-modeling-2026",
    applicantName: "张雨桐",
    college: "数学学院",
    major: "信息与计算科学",
    grade: "2023 级",
    submittedAt: "2026-05-03 14:22",
    mode: "team",
    status: "submitted",
    reviewer: null,
    note: "团队信息已提交，待核验队员学籍。",
  },
  {
    id: "APP-2026-002",
    competitionSlug: "math-modeling-2026",
    applicantName: "陈思远",
    college: "数学学院",
    major: "统计学",
    grade: "2022 级",
    submittedAt: "2026-05-04 09:10",
    mode: "team",
    status: "approved",
    reviewer: "王老师",
    note: "队伍材料齐全，已进入训练营名单。",
  },
  {
    id: "APP-2026-003",
    competitionSlug: "robot-innovation-2026",
    applicantName: "李卓航",
    college: "智能制造学院",
    major: "机器人工程",
    grade: "2023 级",
    submittedAt: "2026-05-21 18:40",
    mode: "team",
    status: "rejected",
    reviewer: "赵老师",
    note: "项目摘要过于简略，请补充原型说明和分工计划。",
  },
  {
    id: "APP-2026-004",
    competitionSlug: "programming-contest-2026",
    applicantName: "周若宁",
    college: "计算机学院",
    major: "软件工程",
    grade: "2024 级",
    submittedAt: "2026-03-20 11:36",
    mode: "individual",
    status: "approved",
    reviewer: "王老师",
    note: "已进入校赛集训名单。",
  },
];

function parseDateTime(raw) {
  const normalized = raw.replace(" ", "T") + (raw.length === 16 ? ":00" : "");
  return new Date(normalized);
}

function parseDateRange(raw) {
  const [start, end] = raw.split("至").map((item) => item.trim());
  return {
    startAt: new Date(`${start}T00:00:00`),
    endAt: new Date(`${end}T23:59:00`),
  };
}

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD ?? "";
  if (!host || !port || !database || !user) {
    throw new Error(
      "缺少数据库配置。请设置 DATABASE_URL 或 PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD。",
    );
  }
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function main() {
  const client = new Client({ connectionString: buildDatabaseUrl() });
  await client.connect();
  await client.query("BEGIN");

  try {
    const passwordHash = await hash(
      process.env.MVP_BOOTSTRAP_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!",
      10,
    );

    await client.query(`
      TRUNCATE TABLE
        registration_audit_log,
        registration_revision,
        registration_team_member,
        registration,
        registration_form_field,
        registration_form_version,
        registration_form,
        competition_status_log,
        competition_attachment,
        competition_faq,
        competition_notice,
        role_assignment,
        auth_account,
        auth_session,
        auth_verification_token,
        competition,
        "user"
      RESTART IDENTITY CASCADE
    `);

    const userIdByName = new Map();
    for (const user of userSeeds) {
      const result = await client.query(
        `INSERT INTO "user" (name, email, college, status, password_hash)
         VALUES ($1, $2, $3, $4::user_status, $5)
         RETURNING id`,
        [user.name, user.email, user.college, user.status, passwordHash],
      );
      userIdByName.set(user.name, result.rows[0].id);
    }

    for (const app of applicationSeeds) {
      if (!userIdByName.has(app.applicantName)) {
        const result = await client.query(
          `INSERT INTO "user" (name, email, college, major, grade, status, password_hash)
           VALUES ($1, $2, $3, $4, $5, 'active'::user_status, $6)
           RETURNING id`,
          [
            app.applicantName,
            `${app.applicantName}-${Date.now()}@stu.example`,
            app.college,
            app.major,
            app.grade,
            passwordHash,
          ],
        );
        userIdByName.set(app.applicantName, result.rows[0].id);
      }
    }

    const competitionIdBySlug = new Map();
    for (const item of competitionSeeds) {
      const reg = parseDateRange(item.registrationWindow);
      const evt = parseDateRange(item.eventWindow);
      const result = await client.query(
        `INSERT INTO competition
         (slug, title, category, status, summary, department, registration_mode, registration_start_at, registration_end_at, event_start_at, event_end_at, location, cover_label, description, highlights_json, timeline_json, related_questions_json)
         VALUES
         ($1, $2, $3, $4::competition_status, $5, $6, $7::registration_mode, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb, $17::jsonb)
         RETURNING id`,
        [
          item.slug,
          item.title,
          item.category,
          item.status,
          item.summary,
          item.department,
          item.registrationMode,
          reg.startAt,
          reg.endAt,
          evt.startAt,
          evt.endAt,
          item.location,
          item.coverLabel,
          item.description,
          JSON.stringify(item.highlights),
          JSON.stringify(item.timeline),
          JSON.stringify(item.relatedQuestions),
        ],
      );
      const competitionId = result.rows[0].id;
      competitionIdBySlug.set(item.slug, competitionId);

      for (let i = 0; i < item.faqs.length; i += 1) {
        const faq = item.faqs[i];
        await client.query(
          `INSERT INTO competition_faq (competition_id, question, answer, display_order)
           VALUES ($1, $2, $3, $4)`,
          [competitionId, faq.question, faq.answer, i + 1],
        );
      }

      for (const attachment of item.attachments) {
        await client.query(
          `INSERT INTO competition_attachment (competition_id, name, storage_key)
           VALUES ($1, $2, $3)`,
          [competitionId, attachment, `seed/${item.slug}/${attachment}`],
        );
      }
    }

    const adminId = userIdByName.get("平台管理员");
    if (adminId) {
      await client.query(
        `INSERT INTO role_assignment (user_id, role, scope_type) VALUES ($1, 'super_admin'::user_role, 'global'::role_scope)`,
        [adminId],
      );
    }
    const studentId = userIdByName.get("张雨桐");
    if (studentId) {
      await client.query(
        `INSERT INTO role_assignment (user_id, role, scope_type) VALUES ($1, 'student_user'::user_role, 'global'::role_scope)`,
        [studentId],
      );
    }
    const compAdminId = userIdByName.get("王老师");
    if (compAdminId) {
      await client.query(
        `INSERT INTO role_assignment (user_id, role, scope_type, competition_id)
         VALUES ($1, 'competition_admin'::user_role, 'competition'::role_scope, $2)`,
        [compAdminId, competitionIdBySlug.get("math-modeling-2026")],
      );
    }
    const editorId = userIdByName.get("赵老师");
    if (editorId) {
      await client.query(
        `INSERT INTO role_assignment (user_id, role, scope_type, competition_id)
         VALUES ($1, 'content_editor'::user_role, 'competition'::role_scope, $2)`,
        [editorId, competitionIdBySlug.get("robot-innovation-2026")],
      );
    }

    const formVersionByCompetitionId = new Map();
    for (const item of competitionSeeds) {
      const competitionId = competitionIdBySlug.get(item.slug);
      if (!competitionId) continue;
      const form = await client.query(
        `INSERT INTO registration_form (competition_id, status, apply_mode, max_team_size, created_by)
         VALUES ($1, 'published'::registration_form_status, $2::registration_mode, $3, $4)
         RETURNING id`,
        [
          competitionId,
          item.registrationMode,
          item.registrationMode === "team" ? 5 : 1,
          adminId ?? null,
        ],
      );
      const formId = form.rows[0].id;
      const version = await client.query(
        `INSERT INTO registration_form_version (form_id, version_no, status, change_note, published_at, created_by)
         VALUES ($1, 1, 'active'::registration_form_version_status, 'Seed 默认版本', now(), $2)
         RETURNING id`,
        [formId, adminId ?? null],
      );
      const versionId = version.rows[0].id;
      formVersionByCompetitionId.set(competitionId, versionId);
      await client.query(
        `UPDATE registration_form SET current_version_id = $1 WHERE id = $2`,
        [versionId, formId],
      );

      const fields = [
        ["applicant_name", "申请人姓名", 1],
        ["college", "学院", 2],
        ["major", "专业", 3],
        ["grade", "年级", 4],
      ];
      for (const [fieldKey, label, order] of fields) {
        await client.query(
          `INSERT INTO registration_form_field
           (form_version_id, field_key, label, field_type, scope, is_required, display_order, export_order, export_label)
           VALUES
           ($1, $2, $3, 'text', 'registration'::registration_field_scope, true, $4, $4, $3)`,
          [versionId, fieldKey, label, order],
        );
      }
    }

    for (const item of applicationSeeds) {
      const competitionId = competitionIdBySlug.get(item.competitionSlug);
      const applicantUserId = userIdByName.get(item.applicantName);
      const formVersionId = competitionId
        ? formVersionByCompetitionId.get(competitionId)
        : null;
      if (!competitionId || !applicantUserId || !formVersionId) continue;

      const submittedAt = parseDateTime(item.submittedAt);
      const reviewerId = item.reviewer ? userIdByName.get(item.reviewer) ?? null : null;

      const registration = await client.query(
        `INSERT INTO registration
         (registration_no, competition_id, form_version_id, applicant_user_id, apply_mode, status, revision_no, payload_json, applicant_snapshot_json, submitted_at, approved_at, last_reviewed_at, last_reviewed_by, latest_review_comment)
         VALUES
         ($1, $2, $3, $4, $5::registration_apply_mode, $6::registration_status, 1, $7::jsonb, $8::jsonb, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          item.id,
          competitionId,
          formVersionId,
          applicantUserId,
          item.mode,
          item.status,
          JSON.stringify({
            applicantName: item.applicantName,
            college: item.college,
            major: item.major,
            grade: item.grade,
          }),
          JSON.stringify({
            userId: applicantUserId,
            name: item.applicantName,
            college: item.college,
            major: item.major,
            grade: item.grade,
            capturedAt: submittedAt.toISOString(),
          }),
          submittedAt,
          item.status === "approved" ? submittedAt : null,
          reviewerId ? submittedAt : null,
          reviewerId,
          item.note,
        ],
      );
      const registrationId = registration.rows[0].id;

      await client.query(
        `INSERT INTO registration_revision
         (registration_id, revision_no, action_type, payload_snapshot_json, team_snapshot_json, applicant_snapshot_json, form_version_id, created_by, created_at)
         VALUES
         ($1, 1, 'submit'::registration_revision_action, $2::jsonb, '[]'::jsonb, $3::jsonb, $4, $5, $6)`,
        [
          registrationId,
          JSON.stringify({
            applicantName: item.applicantName,
            college: item.college,
            major: item.major,
            grade: item.grade,
          }),
          JSON.stringify({
            userId: applicantUserId,
            name: item.applicantName,
            college: item.college,
            major: item.major,
            grade: item.grade,
            capturedAt: submittedAt.toISOString(),
          }),
          formVersionId,
          applicantUserId,
          submittedAt,
        ],
      );

      const auditAction =
        item.status === "approved"
          ? "approve"
          : item.status === "rejected"
            ? "reject"
            : item.status === "withdrawn"
              ? "withdraw"
              : "submit";
      await client.query(
        `INSERT INTO registration_audit_log
         (registration_id, from_status, to_status, action, operator_user_id, operator_role, comment, created_at)
         VALUES
         ($1, 'submitted'::registration_status, $2::registration_status, $3::registration_audit_action, $4, $5::user_role, $6, $7)`,
        [
          registrationId,
          item.status,
          auditAction,
          reviewerId ?? applicantUserId,
          reviewerId ? "competition_admin" : "student_user",
          item.note,
          submittedAt,
        ],
      );
    }

    await client.query("COMMIT");
    console.log("[seed] completed.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("[seed] failed:", error);
  process.exitCode = 1;
});
