export type CompetitionStatus =
  | "draft"
  | "registration_open"
  | "upcoming"
  | "in_progress"
  | "finished"
  | "archived";

export type RegistrationMode = "individual" | "team";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "cancelled";

export type UserRole =
  | "super_admin"
  | "competition_admin"
  | "content_editor"
  | "student_user";

export interface Competition {
  id: string;
  title: string;
  category: string;
  status: CompetitionStatus;
  summary: string;
  department: string;
  registrationMode: RegistrationMode;
  registrationWindow: string;
  eventWindow: string;
  location: string;
  coverLabel: string;
  description: string;
  highlights: string[];
  timeline: Array<{
    label: string;
    date: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  attachments: string[];
  relatedQuestions: string[];
}

export interface ApplicationRecord {
  id: string;
  competitionId: string;
  competitionTitle: string;
  applicantName: string;
  college: string;
  major: string;
  grade: string;
  submittedAt: string;
  mode: RegistrationMode;
  status: ApplicationStatus;
  reviewer: string;
  note: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  role: UserRole;
  college: string;
  email: string;
  status: "active" | "pending_verification" | "disabled";
}

export interface NoticeRecord {
  id: string;
  title: string;
  competition: string;
  status: "published" | "draft" | "withdrawn";
  updatedAt: string;
}

export const platformStats = [
  { label: "年度在管竞赛", value: "18", description: "覆盖学科竞赛、双创赛事与校企专项" },
  { label: "累计报名记录", value: "1,286", description: "学生报名、团队报名与材料提交总量" },
  { label: "近三年获奖", value: "214", description: "省级及以上奖项沉淀到统一资料库" },
  { label: "待审核申请", value: "32", description: "后台工作台可直接筛选、批量审核与导出" },
];

export const competitions: Competition[] = [
  {
    id: "math-modeling-2026",
    title: "2026 全国大学生数学建模竞赛院内选拔",
    category: "数学建模",
    status: "registration_open",
    summary: "面向全院开放的建模选拔赛，要求 3 人组队，提供往届题库、讲义和训练营支持。",
    department: "信息与计算科学系",
    registrationMode: "team",
    registrationWindow: "2026-05-01 至 2026-05-20",
    eventWindow: "2026-06-01 至 2026-08-31",
    location: "理科楼 A301 / 线上协作",
    coverLabel: "建模训练营",
    description:
      "平台第一阶段重点承接此类有明确报名窗口、材料要求和审核链路的比赛。学生需要在截止日前提交组队信息、方向偏好与基础能力说明。",
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
      {
        label: "训练营开始",
        date: "2026-06-01",
        description: "组织线下集训与模拟赛。",
      },
    ],
    faqs: [
      {
        question: "没有完整团队是否可以先报名？",
        answer: "可以先提交个人意向，后台会将其标记为待组队，并在审核意见中给出补充说明。",
      },
      {
        question: "训练营资料在哪里下载？",
        answer: "比赛详情页附件区会统一提供讲义、模板和往届题库压缩包。",
      },
    ],
    attachments: ["报名说明.pdf", "训练营日程.xlsx", "往届题库.zip"],
    relatedQuestions: ["如何准备建模选题方向？", "跨专业组队是否允许？"],
  },
  {
    id: "robot-innovation-2026",
    title: "2026 智能机器人创新挑战赛",
    category: "创新创业",
    status: "upcoming",
    summary: "聚焦机器人视觉、路径规划与原型展示，支持个人或团队报名，需提交项目摘要。",
    department: "智能制造学院",
    registrationMode: "team",
    registrationWindow: "2026-05-18 至 2026-06-08",
    eventWindow: "2026-06-20 至 2026-09-15",
    location: "创新工坊一层",
    coverLabel: "机器人专项",
    description:
      "本赛事更强调作品展示与项目管理，需要后台支持项目摘要收集、阶段审核与附件补交。",
    highlights: ["支持项目摘要上传", "阶段性答辩", "作品展示专区"],
    timeline: [
      {
        label: "报名预告",
        date: "2026-05-18",
        description: "公布赛事主题与赛道方向。",
      },
      {
        label: "初审材料截止",
        date: "2026-06-08",
        description: "提交项目摘要、成员信息和导师建议。",
      },
      {
        label: "作品答辩",
        date: "2026-07-12",
        description: "线下展示与阶段评审。",
      },
    ],
    faqs: [
      {
        question: "可以跨学院组队吗？",
        answer: "允许，但必须由本学院学生担任队长，并在报名时填写完整的跨学院成员信息。",
      },
      {
        question: "需要提交哪些附件？",
        answer: "至少需要项目摘要、原型草图或演示视频链接。",
      },
    ],
    attachments: ["赛事章程.pdf", "项目摘要模板.docx"],
    relatedQuestions: ["项目摘要写到什么深度？", "可以提交往届项目迭代版吗？"],
  },
  {
    id: "programming-contest-2026",
    title: "2026 程序设计校赛",
    category: "程序设计",
    status: "in_progress",
    summary: "ACM/ICPC 风格校内程序设计竞赛，已进入集训阶段，比赛详情页主要承接通知和 FAQ。",
    department: "计算机学院",
    registrationMode: "individual",
    registrationWindow: "2026-03-10 至 2026-03-31",
    eventWindow: "2026-04-10 至 2026-06-10",
    location: "软件楼实验中心",
    coverLabel: "算法集训",
    description:
      "此类正在进行中的比赛更适合作为门户和通知展示的重点案例，报名入口关闭后，前台仍然需要承接集训通知、答疑与附件分发。",
    highlights: ["个人报名", "赛前集训", "题单与讲评同步更新"],
    timeline: [
      {
        label: "校赛报名结束",
        date: "2026-03-31",
        description: "进入赛前集训名单确认。",
      },
      {
        label: "集训阶段",
        date: "2026-04-10",
        description: "每周训练与榜单讲评。",
      },
      {
        label: "正式比赛",
        date: "2026-06-10",
        description: "集中竞赛和排名发布。",
      },
    ],
    faqs: [
      {
        question: "题单更新在哪里查看？",
        answer: "统一通过比赛详情页通知区发布，不再在群文件中重复分发。",
      },
    ],
    attachments: ["校赛题单.pdf", "集训规则.md"],
    relatedQuestions: ["比赛时使用什么语言环境？"],
  },
  {
    id: "finance-case-2025",
    title: "2025 商业分析案例大赛",
    category: "案例分析",
    status: "finished",
    summary: "已完赛赛事，用于展示归档后的资料沉淀、FAQ 与问答内容组织方式。",
    department: "商学院",
    registrationMode: "team",
    registrationWindow: "2025-09-01 至 2025-09-20",
    eventWindow: "2025-10-01 至 2025-12-01",
    location: "商学院报告厅",
    coverLabel: "案例复盘",
    description:
      "已结束的比赛仍需要保留归档资料、复盘通知和常见问题，支持学生参考往届内容。",
    highlights: ["往届资料归档", "评审反馈复盘", "案例模板下载"],
    timeline: [
      {
        label: "赛事结束",
        date: "2025-12-01",
        description: "获奖名单已发布并归档。",
      },
    ],
    faqs: [
      {
        question: "往届案例模板是否仍可下载？",
        answer: "可以，平台归档区会长期保留允许公开的附件。",
      },
    ],
    attachments: ["获奖名单.pdf", "案例模板.pptx"],
    relatedQuestions: ["评审最看重哪些维度？"],
  },
];

export const applications: ApplicationRecord[] = [
  {
    id: "APP-2026-001",
    competitionId: "math-modeling-2026",
    competitionTitle: "2026 全国大学生数学建模竞赛院内选拔",
    applicantName: "张雨桐",
    college: "数学学院",
    major: "信息与计算科学",
    grade: "2023 级",
    submittedAt: "2026-05-03 14:22",
    mode: "team",
    status: "submitted",
    reviewer: "待分配",
    note: "团队信息已提交，待核验队员学籍。",
  },
  {
    id: "APP-2026-002",
    competitionId: "math-modeling-2026",
    competitionTitle: "2026 全国大学生数学建模竞赛院内选拔",
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
    competitionId: "robot-innovation-2026",
    competitionTitle: "2026 智能机器人创新挑战赛",
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
    competitionId: "programming-contest-2026",
    competitionTitle: "2026 程序设计校赛",
    applicantName: "周若宁",
    college: "计算机学院",
    major: "软件工程",
    grade: "2024 级",
    submittedAt: "2026-03-20 11:36",
    mode: "individual",
    status: "approved",
    reviewer: "刘老师",
    note: "已进入校赛集训名单。",
  },
];

export const users: PlatformUser[] = [
  {
    id: "USR-001",
    name: "王老师",
    role: "competition_admin",
    college: "数学学院",
    email: "wang@college.example",
    status: "active",
  },
  {
    id: "USR-002",
    name: "赵老师",
    role: "content_editor",
    college: "智能制造学院",
    email: "zhao@college.example",
    status: "active",
  },
  {
    id: "USR-003",
    name: "张雨桐",
    role: "student_user",
    college: "数学学院",
    email: "zhangyt@stu.example",
    status: "active",
  },
  {
    id: "USR-004",
    name: "平台管理员",
    role: "super_admin",
    college: "信息中心",
    email: "super@college.example",
    status: "active",
  },
];

export const notices: NoticeRecord[] = [
  {
    id: "NOTICE-001",
    title: "建模竞赛训练营安排发布",
    competition: "2026 全国大学生数学建模竞赛院内选拔",
    status: "published",
    updatedAt: "2026-05-05 09:00",
  },
  {
    id: "NOTICE-002",
    title: "机器人创新挑战赛赛题方向说明",
    competition: "2026 智能机器人创新挑战赛",
    status: "draft",
    updatedAt: "2026-05-06 16:30",
  },
];

export const homepageFaqs = [
  {
    question: "平台第一版最先解决什么问题？",
    answer:
      "第一版优先打通比赛门户、学生报名、管理员审核和导出，不先铺开论坛化功能。",
  },
  {
    question: "学生端和后台为什么要共用一套组件底座？",
    answer:
      "这样可以统一状态语言、按钮层级和视觉规范，避免首页和后台像两套系统拼起来。",
  },
  {
    question: "为什么不直接做完整社区？",
    answer:
      "问答在这个项目里是辅助模块，应该服务竞赛答疑和知识沉淀，而不是反客为主。",
  },
];

export function getCompetitionById(id: string) {
  return competitions.find((competition) => competition.id === id);
}

export function getApplicationsForCompetition(id: string) {
  return applications.filter((application) => application.competitionId === id);
}
