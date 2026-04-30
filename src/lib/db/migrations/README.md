# Migrations

当前仓库已提供首版初始化迁移：

- `0000_init.sql`：阶段 2 核心表与枚举

说明：

- 受当前执行环境的 `spawn EPERM` 限制，`drizzle-kit generate` 无法在本会话内直接运行。
- 因此首版迁移先以手工 SQL 方式落地，并保持与 `src/lib/db/schema/index.ts` 对齐。
- 后续在本机权限正常环境下执行 `npm run db:generate` 时，可用 drizzle 官方产物替换本文件。
