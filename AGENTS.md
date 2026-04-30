# AGENTS.md

## 回答与协作

- 默认使用中文回答。
- 先遵守用户当前要求，再遵守本文件，再参考 `docs/`。
- 优先做最小可验证修改，不擅自大规模重构。

## 当前项目事实

当前仓库根目录已经承接了实际项目骨架：

- `src/`：当前项目源码主目录
- `public/`：当前项目静态资源
- `docs/`：项目产品与实施文档

当前项目定位：

**学院竞赛管理与问答平台**

不是普通论坛，不是通用 CMS，不是模板演示站。

## 目录角色

### 当前应优先修改的目录

- `src/app`
- `src/components`
- `src/lib`
- `src/contexts`
- `src/hooks`
- `public`
- `docs`

### 当前不应直接当作主项目修改的目录

以下目录目前是上游或参考来源，后续可删除，但默认不要继续在里面做业务开发：

- `shadcn-dashboard-landing-template-main`
- `launch-ui-main`
- `ui-main`
- `lucide-main`
- `sonner-main`
- `recharts-main`
- `fullcalendar-main`
- `dnd-kit-main`

如果需要从这些目录搬代码，应把代码复制到当前根项目结构后再改。

## 技术栈

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- `TanStack Table`
- `React Hook Form`
- `Zod`
- `Recharts`
- `Sonner`

## 关键路由与组件分层

### 当前主路径

- `/`
- `/competitions`
- `/competitions/[id]`
- `/competitions/[id]/apply`
- `/me/applications`
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/admin`
- `/admin/competitions`
- `/admin/applications`
- `/admin/notices`
- `/admin/users`
- `/admin/schedule`

当前根项目已清理模板演示路由，仅保留与竞赛平台 MVP 相关页面。

### 组件分层

- `src/components/marketing`：学生门户与首页展示
- `src/components/competitions`：竞赛与报名业务组件
- `src/components/admin`：后台业务组件
- `src/components/shared`：跨页面复用组件
- `src/components/forms`：表单与上传组件
- `src/components/ui`：`shadcn/ui` 底座组件

新增业务组件时，优先放到以上目录，不要继续把业务组件塞回模板演示目录。

## 命令入口

当前根项目已具备以下脚本定义：

- `dev`
- `build`
- `start`
- `lint`

执行前先确认依赖是否已安装。

## 当前阶段约束

- 第一阶段优先做纯前端 Mock 和业务组件骨架。
- 报名链路、审核工作台、比赛门户优先级高于问答和花哨动效。
- 首页可做展示增强，但后台页不要引入营销化特效。
- 不要把模板自带的演示页语义继续扩散到新代码里。

## 文档同步

涉及产品范围、模板策略、组件策略时，优先参考：

- `docs/README.md`
- `docs/项目定位与需求基线.md`
- `docs/技术选型与模板映射.md`
- `docs/组件选型与分层策略.md`
- `docs/页面结构与用户流程.md`
- `docs/MVP与迭代路线.md`
- `docs/视觉与交互规范.md`
