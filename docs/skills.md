# skills

> 来源：本文件根据本机 `C:\Users\84025\.codex\skills` 的实际目录摘录整理。
> 范围：仅统计存在 `SKILL.md` 的条目。当前共 42 个，其中用户级/本地 skills 37 个，`.system` 内置 skills 5 个。
> 用途：这是一个“skills 导引”，不是要求每次都把所有 skills 读一遍。

## 1. 先看什么，后看什么

判断顺序应固定如下：

1. 用户当前消息的明确要求
2. 当前仓库自己的 `AGENTS.md`
3. 当前仓库的 `docs/`、`README.md`、脚本说明、示例
4. 当前任务是否明显命中某个 skill
5. 命中后再打开对应 `SKILL.md`

结论：

- 默认不是“先看 skills 再做事”。
- 默认是“先看仓库上下文，再判断要不要看 skill”。
- 不要为了使用 skill 而使用 skill。

## 2. 什么时候应该看 skill

建议触发条件：

- 用户明确点名某个 skill
- 任务明显属于某个专门领域
- 该 skill 提供了专用工作流、模板、脚本或验证方式，确实能提高正确性

典型例子：

- `.docx` / Word：看 `docx`
- `.pptx` / 演示文稿：看 `pptx`
- `.pdf`：看 `pdf`
- 表格 / `.xlsx` / `.csv`：看 `xlsx`
- 前端视觉设计：看 `frontend-design`
- 本地网页联调：看 `webapp-testing`
- OpenAI 官方文档与模型升级：看 `.system/openai-docs`
- MCP 服务开发：看 `mcp-builder`
- 写 SOP：看 `sop-generator`
- 需要把模板裁成项目契约：优先看本目录的 `AGENTS.md` 与 `冷启动.md`，不是 skill

## 3. 什么时候通常不需要看

以下场景通常直接按仓库上下文做即可：

- 普通 bug 修复
- 常规接口开发
- 类型调整
- 小范围测试补充
- 不涉及专门文件格式的简单代码改动
- 已经被项目级 `AGENTS.md` 说明清楚的常规工作

## 4. 使用原则

- 只打开当前任务真正命中的那一个或少数几个 skill。
- skill 是补充，不是顶层规则。
- 如果项目已经把 skill 映射关系写进了项目级 `AGENTS.md`，以项目级规则为准。
- 如果一个 skill 的内容和当前仓库事实冲突，优先服从仓库事实。

## 5. 本机可用 skills 清单

### 5.1 `.system` 内置 skills

| Skill | 用途 |
|:---|:---|
| `.system/imagegen` | 生成或编辑位图图像，适合插画、贴图、UI mock、透明背景素材等 |
| `.system/openai-docs` | 查询 OpenAI 产品/API 的最新官方文档、模型选择与升级说明 |
| `.system/plugin-creator` | 创建 Codex 本地插件骨架与 `.codex-plugin/plugin.json` |
| `.system/skill-creator` | 创建或更新 skill 的系统级指导 |
| `.system/skill-installer` | 从 curated 列表或 GitHub 路径安装 skills 到本地 |

### 5.2 文档、知识与办公交付

| Skill | 用途 |
|:---|:---|
| `ddd-doc-steward` | 文档驱动开发文档管家，盘点仓库并维护 docs 作为 SSOT |
| `doc-coauthoring` | 结构化共写文档、方案、规范、RFC、决策文档 |
| `docx` | Word / `.docx` 的读取、编辑、生成、排版与替换 |
| `internal-comms` | 写内部沟通材料，如周报、汇报、FAQ、事故通报 |
| `markdown-to-epub` | 将 Markdown 与本地图片稳定转换为 EPUB |
| `pdf` | 处理 PDF：提取、合并、拆分、OCR、表单、加水印等 |
| `pptx` | 处理演示文稿、幻灯片、`.pptx` |
| `sop-generator` | 把零散资料整理成可执行 SOP / 操作规程 / 流程说明 |
| `xlsx` | 处理 Excel / `.xlsx` / `.csv` / `.tsv` 等表格文件 |

### 5.3 前端、设计与视觉表达

| Skill | 用途 |
|:---|:---|
| `algorithmic-art` | 用 p5.js 生成算法艺术、生成式图形、粒子/流场作品 |
| `brand-guidelines` | 套用 Anthropic 品牌色彩与字体规范 |
| `canvas-design` | 生成海报、静态视觉作品、`.png` / `.pdf` 设计稿 |
| `canvas-dev` | 以白板为唯一真相源进行架构设计、重构、评审与编码 |
| `frontend-design` | 生成高质量、非模板化的前端页面与组件视觉实现 |
| `slack-gif-creator` | 生成适合 Slack 使用的 GIF 动图 |
| `snapdom` | 将 DOM/HTML 元素高保真转为 SVG/PNG/JPG/WebP |
| `theme-factory` | 为文档、网页、汇报、幻灯片等应用现成主题 |
| `web-artifacts-builder` | 构建复杂的 React/Tailwind/shadcn 前端 artifact |
| `webapp-testing` | 用 Playwright 联调和测试本地 Web 应用 |

### 5.4 AI、技能与平台开发

| Skill | 用途 |
|:---|:---|
| `claude-api` | 构建、调试、迁移 Anthropic / Claude API 应用 |
| `claude-code-guide` | Claude Code 高级使用与开发工作流中文指南 |
| `claude-cookbooks` | Claude API 示例、教程和最佳实践 |
| `headless-cli` | 无头批量调用 Gemini / Claude / Codex CLI |
| `mcp-builder` | 设计和实现 MCP 服务器 |
| `skill-creator` | 新建、改写、评测、优化 skills |
| `skills-skills` | 把 docs / API / 代码材料提炼成可复用 skill |
| `telegram-dev` | Telegram Bot、Mini Apps、MTProto 生态开发 |
| `tmux-autopilot` | 自动读取/广播/救援 tmux session、window、pane |

### 5.5 数据库、网络与基础设施

| Skill | 用途 |
|:---|:---|
| `postgresql` | PostgreSQL 查询、建模、管理、调优与高级特性 |
| `proxychains` | 遇到网络超时、DNS 失败、访问受限时自动走代理 |
| `timescaledb` | TimescaleDB 时序分析、hypertable、连续聚合、压缩 |

### 5.6 加密、交易、行情与外部数据源

| Skill | 用途 |
|:---|:---|
| `ccxt` | 统一对接多交易所 API，做下单、行情、账户与交易自动化 |
| `coingecko` | 使用 CoinGecko API 获取币价、市值、历史行情 |
| `cryptofeed` | 接入多交易所 WebSocket 实时行情与订单簿 |
| `hummingbot` | 使用 Hummingbot 做做市、套利和交易机器人开发 |
| `polymarket` | 对接 Polymarket 预测市场 API 与实时数据 |
| `twscrape` | 抓取 Twitter/X 数据，支持账户轮换和异步抓取 |

## 6. 推荐映射写法

如果你希望某个项目里的行为更稳定，建议把高频映射直接写到项目级 `AGENTS.md`，例如：

```md
涉及以下任务时优先查看对应 skill：
- Word / `.docx`：`docx`
- PPT / `.pptx`：`pptx`
- PDF：`pdf`
- 表格：`xlsx`
- 前端视觉设计：`frontend-design`
- 本地网页联调：`webapp-testing`
- OpenAI API / 模型升级：`.system/openai-docs`
- MCP 服务开发：`mcp-builder`

普通代码修复、接口开发、测试补充默认不使用 skill，除非用户明确要求。
```

## 7. 维护方式

- 这个清单依赖本机 `C:\Users\84025\.codex\skills` 的实际内容，不保证和别的机器一致。
- 新装、删改 skill 后，应同步更新本文件。
- 若某个 skill 长期只在单一项目内使用，优先把它的触发规则下沉到那个项目自己的 `AGENTS.md`。
