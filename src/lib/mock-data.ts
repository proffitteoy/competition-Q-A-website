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
  {
    id: "USR-005",
    name: "陈思远",
    role: "student_user",
    college: "数学学院",
    email: "chensy@stu.example",
    status: "active",
  },
  {
    id: "USR-006",
    name: "李卓航",
    role: "student_user",
    college: "智能制造学院",
    email: "lizh@stu.example",
    status: "active",
  },
  {
    id: "USR-007",
    name: "周若宁",
    role: "student_user",
    college: "计算机学院",
    email: "zhournl@stu.example",
    status: "active",
  },
  {
    id: "USR-008",
    name: "林晓薇",
    role: "student_user",
    college: "商学院",
    email: "linxw@stu.example",
    status: "active",
  },
  {
    id: "USR-009",
    name: "吴泽宇",
    role: "student_user",
    college: "计算机学院",
    email: "wuzy@stu.example",
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

export interface HallOfFameEntry {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  college: string;
  tag: string;
  bio: string;
  displayOrder: number;
}

export interface ExperiencePost {
  id: string;
  userId: string;
  userName: string;
  competitionId: string | null;
  competitionTitle: string;
  title: string;
  content: string;
  awardLevel: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string;
}

export const hallOfFameEntries: HallOfFameEntry[] = [
  {
    id: "HOF-001",
    userId: "USR-003",
    userName: "张雨桐",
    userImage: null,
    college: "数学学院",
    tag: "国赛一等奖",
    bio: "连续两年参加数学建模竞赛，2025 年获全国一等奖，擅长优化建模与数据分析。",
    displayOrder: 1,
  },
  {
    id: "HOF-002",
    userId: "USR-005",
    userName: "陈思远",
    userImage: null,
    college: "数学学院",
    tag: "省赛一等奖",
    bio: "统计学专业，数学建模省赛一等奖，专注时间序列分析与预测模型。",
    displayOrder: 2,
  },
  {
    id: "HOF-003",
    userId: "USR-006",
    userName: "李卓航",
    userImage: null,
    college: "智能制造学院",
    tag: "最佳创新奖",
    bio: "机器人工程专业，智能机器人创新挑战赛最佳创新奖，主攻视觉导航与路径规划。",
    displayOrder: 3,
  },
  {
    id: "HOF-004",
    userId: "USR-007",
    userName: "周若宁",
    userImage: null,
    college: "计算机学院",
    tag: "金牌选手",
    bio: "ACM/ICPC 区域赛金牌，校赛连续两年第一名，算法竞赛教练组成员。",
    displayOrder: 4,
  },
  {
    id: "HOF-005",
    userId: "USR-008",
    userName: "林晓薇",
    userImage: null,
    college: "商学院",
    tag: "全国二等奖",
    bio: "商业分析案例大赛全国二等奖，擅长市场调研与商业模型构建。",
    displayOrder: 5,
  },
  {
    id: "HOF-006",
    userId: "USR-009",
    userName: "吴泽宇",
    userImage: null,
    college: "计算机学院",
    tag: "省赛特等奖",
    bio: "程序设计竞赛省赛特等奖，全栈开发能力突出，开源项目贡献者。",
    displayOrder: 6,
  },
];

export const experiencePosts: ExperiencePost[] = [
  {
    id: "EXP-001",
    userId: "USR-003",
    userName: "张雨桐",
    competitionId: "math-modeling-2026",
    competitionTitle: "2026 全国大学生数学建模竞赛院内选拔",
    title: "数学建模国赛备赛全流程复盘",
    content: `<h2>赛前准备</h2><p>从大二开始系统学习建模方法，重点掌握了线性规划、动态规划和蒙特卡洛模拟三大类方法。建议新手先从往届 B 题入手，难度适中且数据获取方便。</p><h2>组队经验</h2><p>三人分工很关键：一人主建模、一人主编程、一人主论文。但实际比赛中角色会有交叉，所以每个人都需要对全流程有基本了解。</p><h2>比赛期间</h2><p>72 小时的比赛节奏非常紧张。我们的策略是前 12 小时充分讨论选题和建模思路，中间 36 小时并行推进模型实现和论文框架，最后 24 小时集中打磨论文。</p><h2>给学弟学妹的建议</h2><p>多参加校内模拟赛，熟悉比赛节奏比掌握更多算法更重要。论文写作能力往往是拉开差距的关键。</p>`,
    awardLevel: "国家级一等奖",
    coverImage: null,
    isPublished: true,
    publishedAt: "2025-12-15",
  },
  {
    id: "EXP-002",
    userId: "USR-006",
    userName: "李卓航",
    competitionId: "robot-innovation-2026",
    competitionTitle: "2026 智能机器人创新挑战赛",
    title: "从零搭建视觉导航机器人的参赛历程",
    content: `<h2>项目背景</h2><p>我们团队选择了室内视觉导航赛道，目标是让机器人在未知环境中自主完成路径规划和避障。</p><h2>技术方案</h2><p>采用 ROS2 + OpenCV 的技术栈，视觉部分使用深度相机获取点云数据，路径规划基于改进的 A* 算法。最大的挑战是实时性——需要在 100ms 内完成一次完整的感知-决策-执行循环。</p><h2>踩过的坑</h2><p>硬件调试占了将近一半的时间。建议提前准备备用传感器，比赛现场环境光线和地面材质都可能和实验室不同。</p>`,
    awardLevel: "最佳创新奖",
    coverImage: null,
    isPublished: true,
    publishedAt: "2025-11-20",
  },
  {
    id: "EXP-003",
    userId: "USR-007",
    userName: "周若宁",
    competitionId: "programming-contest-2026",
    competitionTitle: "2026 程序设计校赛",
    title: "ACM 竞赛两年训练路线分享",
    content: `<h2>入门阶段</h2><p>大一下学期开始接触算法竞赛，从基础数据结构和排序算法开始。推荐先刷完《算法竞赛入门经典》的前六章，建立基本的算法思维。</p><h2>进阶训练</h2><p>大二上学期开始系统训练图论、动态规划和数论。每周保持 3-4 场虚拟赛的频率，重点是赛后补题和总结。</p><h2>比赛策略</h2><p>5 小时的比赛中，前 30 分钟快速浏览所有题目并标记难度。先做有把握的签到题，再攻中等难度题，最后看难题。团队赛中沟通效率比个人能力更重要。</p>`,
    awardLevel: "金牌",
    coverImage: null,
    isPublished: true,
    publishedAt: "2026-01-10",
  },
  {
    id: "EXP-004",
    userId: "USR-008",
    userName: "林晓薇",
    competitionId: "finance-case-2025",
    competitionTitle: "2025 商业分析案例大赛",
    title: "商业案例分析大赛的准备与答辩技巧",
    content: `<h2>案例分析框架</h2><p>商业案例分析最核心的是建立清晰的分析框架。我们常用的是"问题定义-数据收集-分析建模-方案设计-风险评估"五步法。</p><h2>答辩准备</h2><p>答辩环节占总分的 40%，准备时要特别注意：PPT 不超过 20 页，每页一个核心观点；预留充足的 Q&A 准备时间，评委最常问的是数据来源和假设合理性。</p>`,
    awardLevel: "全国二等奖",
    coverImage: null,
    isPublished: true,
    publishedAt: "2025-12-20",
  },
  {
    id: "EXP-005",
    userId: "USR-003",
    userName: "张雨桐",
    competitionId: null,
    competitionTitle: "",
    title: "竞赛经历对求职的帮助",
    content: `<p>这是一篇未发布的草稿。</p>`,
    awardLevel: "",
    coverImage: null,
    isPublished: false,
    publishedAt: "",
  },
];

export function getCompetitionById(id: string) {
  return competitions.find((competition) => competition.id === id);
}

export function getApplicationsForCompetition(id: string) {
  return applications.filter((application) => application.competitionId === id);
}
