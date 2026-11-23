# 小游戏工作台多 Agent 协作调研 — 无缝切换规范

- 调研日期：2026-11-23（北京时间）
- 目标约束：单人、零成本优先、已有海外网页模板（`mini-games/template/`：单 HTML + Canvas + DOM HUD）、skill 在 `~/workspace/custom-skills/mini-game-dev/SKILL.md`（Stage 0–7）、工作台 Space `xiao-you-xi-gong-zuo-tai`（管线 / 选题池 / 模板中心 / 发布中心 / 多平台发布）
- 任务边界：只做研究，不部署、不注册、不花钱；官方未公布的数据一律写“查不到”，不编造；第三方文章只作参考，已标注冲突 / 不可信处
- 核心结论先说：**不要靠“把聊天记录发给下一个 Agent”来切换。切换的唯一载体是文件：`AGENTS.md`（规则）+ `SKILL.md`（流程）+ `HANDOFF.md`（当前任务状态）+ `LOG.md`（每款游戏的决策与复盘）。任何 Agent 都必须能只读这四个文件就冷启动接手，否则切换一定丢上下文。**

---

## 1. 五个 Agent 能力对照

### 1.1 对照表（以官方 / 官方博客为准，第三方为辅）

| 维度 | Muse（本环境） | Gemini（Gemini CLI / Antigravity 里的 Gemini） | Antigravity | Codex | Workbuddy |
|---|---|---|---|---|---|
| 定位 | 个人助手 / 编排器：规划、拆任务、派子 Agent、核验、汇报；模型为 Muse Spark 1.3 | 终端 Agent：大上下文读整个代码库、免费额度最大 | Agent-first 开发平台：IDE + Manager + CLI + SDK，多 Agent 并行编排 | 终端 / 云端工程 Agent：批量自主任务、测试、评审 | 桌面办公 Agent 工作台：办公 + 编码，中文生态、文档批量处理 |
| 底层模型 | Muse Spark 1.3（本环境实测的系统信息） | Gemini 2.5 Pro / Gemini 3（按版本）；免费层为 Gemini Code Assist | Gemini 3 / 3.1 / 3.5 / 3.8 Flash 为核心；Pro/Ultra 可用 Gemini 4 Argon；另可选 Claude、GPT-OSS（按套餐） | GPT-5.5 / GPT-5.6（Sol / Terra / Luna 三档，按版本） | Hy3 / Hy4（旗舰），Hy4 Flash（轻量）；另可切换 DeepSeek、GLM、Kimi、MiniMax 等，或自带 OpenAI 兼容端点 |
| 上下文窗口 | 1,048,576 tokens；单次最大输出 131,072 tokens（Meta Model API 公开口径） | 1,000,000 tokens（Google 官方博客：Gemini 2.5 Pro 1M 上下文） | 查不到独立数字——继承所选模型的窗口（Gemini 3 系列按模型计）；官方不公布 Antigravity 自己的窗口数 | 模型卡称 1,050,000 tokens，但 **CLI 实际有效上限约 272,000 tokens**（v0.144.6 写入的元数据，95% 有效倍率后约 258,400 可用）；旧版曾报 400K，口径随版本变，**以当前 CLI 版本为准** | 模型层 Hy4 / Hy4 Flash 为 1,000,000 tokens（TokenHub 官方页）；**Workbuddy 应用本身的会话窗口查不到**，不要把模型窗口当成应用窗口 |
| 免费额度 | Meta AI App 内免费使用；API 新账号一次性 $20 抵扣；OpenCode Zen 上列为 $0 的 Contributor  tier（见下行警告） | 个人 Google 账号登录：60 请求/分钟、1,000 请求/天（Google 官方博客原口径）；API Key 免费层仅 250 请求/天且限 Flash 模型（第三方整理） | 个人 $0，配额按周刷新，Tab 补全 / Command 请求不限；第三方整理称预览期约 20 次高质量请求/天（Gemini Pro），Flash 更高；**Google 不公布各套餐的具体请求数**，只说简单任务比复杂任务能发更多 | CLI 本身免费开源（Apache 2.0），用量不免费：免费 ChatGPT 账号可用但额度极小、无云端功能；日常起步约 ChatGPT Go $8/月或 Plus $20/月 | 免费 $0/月：100 credits/月 + 每日活跃奖励 30 credits，新账号另有 250 欢迎 credits（第三方整理，国际版与中国版可能不同）；Pro $10/月：1,000 + 1,000 奖励 credits/月 |
| 付费价 | API 标准 tier：输入 $1.25 / 百万 tokens，输出 $4.25 / 百万 tokens，缓存输入 $0.15；Contributor tier：输入 $0.10，输出 $0.20（**代价是提示与输出可能被 Meta 用于训练未来模型**） | 付费走 Google Cloud / Code Assist Standard（$19/用户/月）或 Enterprise（$45/用户/月），1,500 请求/天（第三方整理） | 无独立订阅，付费是 Google AI 订阅的附加权益：AI Pro $19.99/月，AI Ultra $99.99（5x）或 $199.99（20x）/月；Business 自 $30/座/月起；超额 AI credits $0.01/个（第三方整理，2026-11-09 复核价） | Plus $20/月，Pro $200/月（约 20x Plus），Business 约 $25–30/座/月；API 按 token：GPT-5.6 Sol 输入 $5 / 输出 $30，Terra $2.50 / $15，Luna $1 / $6（每百万）；**超 272K 输入后全单 2x 输入、1.5x 输出**（第三方对 GPT-5.6 的核实，签约前以官方价目为准） | Pro $10/月或 $96/年；Team $40/座/月；TokenHub credit 包：1,000 credits $7，2,600 $17，7,900 $51，15,900 $103/月（第三方整理） |
| 文件操作方式 | 工具调用 + 子 Agent：读写 `~/workspace/` 文件，artifact / cron / connector 工具；**无 IDE、无实时浏览器**，不能直接操作 Antigravity / VS Code 界面 | 终端 CLI（`gemini` 命令），开源 Apache 2.0；`GEMINI.md` 为项目指令文件（层级加载），`@file.md` 引用文件；本地 shell + MCP | 桌面 IDE（VS Code 分支）：Editor 视图 + Manager 视图（多 Agent 并行）+ Antigravity CLI（`gemini` 命令）+ Python SDK；Agent Skills、hooks、子 Agent、扩展（Antigravity 插件）；每次运行产出 Artifacts（任务清单、计划、截图、浏览器录制）供人验收 | 终端 CLI（Rust 二进制，`codex` 命令）+ 云端任务 + IDE 扩展；`AGENTS.md` 为项目指令（32 KiB 上限，第三方核实），`~/.codex/config.toml` 配模型 / 沙箱；沙箱隔离强，默认受限文件系统 / 网络 | 桌面应用：用户授权目录内直接读写本地文件、批量处理文档、生成 Word / Excel / PPT；MCP 接外部工具；Skills 包（Anthropic 式 Skills 规范）；100+ 领域专家（官方口径） |
| 擅长 | 编排与核验：拆任务、并行派活、收结果、对照清单验收、跨工具（Gmail / GitHub / Cloudflare / 统计）调用；中文沟通、长流程跟进；多模态读图 / 视频 / PDF | 大上下文一次性读库：整个中型代码库一遍读完；免费额度最大，适合“先读全库再动手”的评审与重构前摸底 | 端到端自主任务：plan → edit → run → verify 全闭环；多 Agent 并行（Manager 视图）；浏览器内实测验证（集成浏览器）；多模型按任务切换 | 批量自主任务：一次给清规范后自己跑测试、修测试、提 PR 式 diff；token 效率高（同类任务 token 用量约为竞品的 1/3–1/4，第三方对照）；沙箱 + 云端任务适合“跑 1–30 分钟再回来收结果” | 办公批量活：读 / 写原生 Word / Excel / PPT、数据整理、周报、会议纪要、行业研究；长文档一轮装进上下文；中文任务理解；多模型按任务类型切换 |
| 短板 | 不在用户本地 IDE 里，不能像 Antigravity / Codex 那样在编辑器内边写边跑；API 免费 Contributor tier 有训练数据代价，**密钥、隐私、客户数据绝不能贴进免费 tier**；token 配额是用户侧的紧约束（本项目用户已两次提醒省着用） | **免费 / Pro / Ultra 的个人用量已于 2026-06-18 迁移到 Antigravity CLI**：官方公告称当日 Gemini CLI 停止为 AI Pro / Ultra 及免费用户服务，相关 tier 改走 Antigravity CLI；开源仓库仍在（Apache 2.0），企业 / API Key 用户仍可用原 CLI——**不要再把“Gemini CLI 免费 1,000 次/天”当成现行个人路径**，要走 Antigravity CLI 复核 | 免费配额反复收紧（2025-11 上线 250 请求/天 → 2025-12 降至约 20 次/天 Pro 模型，第三方时间线），无稳定独立定价可做预算；预览期条款可变，建团队流程前必须复核当前页；重度使用必须上 Pro/Ultra | CLI 有效上下文被压到约 272K（不是模型卡的 1M），长会话易触发自动压缩且无接近阈值警告（第三方核实）；token credit 按 5 小时滚动窗口 + 周上限计费，忙起来会撞墙；只认 OpenAI 模型 | 国际版落后于中国版，credit 换算不透明（“烧一个月才知道”）；Hy4 免费窗口有多个冲突日期（有来源称 2026-11-04–15，有来源称免费至 2026-11-30），**以应用内当前提示为准，不要按文章日期排期**；编码深度不如专用 IDE Agent，复杂重构应交给 CodeBuddy（同栈 IDE/CLI）而非 Workbuddy 本体 |
| 适用 Stage（对本项目） | Stage 0–7 全程总控：选题、基建验收、上架、推广、数据复盘；**唯一适合当“主 Agent”的角色** | Stage 1 命名 / 文案 / 想法检查；Stage 6 大上下文代码评审（读全库找问题）；不适合写整个游戏文件（skill 已定） | **Stage 2 原型首版生成（skill 已定：Antigravity Pro 首版）**；Stage 3–4 的端到端验证（浏览器实测） | Stage 2 后的修 Bug / 小改（skill 已定：Copilot Free / OpenCode 优先，Codex 可作评审 / 批量改）；Stage 6 批量测试与重构 | Stage 1 调研整理、Stage 5–6 的文档 / 数据表 / 周报批量处理；中文运营素材整理；**不适合当第一编码 Agent** |

### 1.2 特别说明：两个容易踩的坑

- **Gemini CLI ≠ Antigravity。** Gemini CLI 是开源终端 Agent；Antigravity 是 Google 的 agent-first 平台（2025-11-18 随 Gemini 3 发布，2026-05-19 升级 2.0：独立桌面 App + IDE + CLI + SDK）。2026-06-18 起个人免费 / Pro / Ultra 的终端体验迁移到 Antigravity CLI，原 Gemini CLI 只剩开源仓库 + 企业 / API 路径。本项目 skill 里写的“用 Gemini 做命名 / 文案”仍然成立，但“用 Gemini CLI 跑终端任务”要改走 Antigravity CLI，写交接包时必须写清到底是哪一个。
- **Workbuddy 有两个同名叙述，不要混用。** 腾讯官方（Tencent Cloud）说的是：WorkBuddy 是 2026-03 上线的全场景 AI 办公工作台，由 CodeBuddy 升级而来，桌面应用，办公 + 编码，多模型 + MCP + Skills。另有一篇第三方博客（TreeRouter《WorkBuddy vs Codex》）描述的 WorkBuddy 是“IDE 插件、Go AST、17ms 本地索引、三个物理隔离层”，与腾讯官方产品描述对不上，**该文的可信度低，本调研不采信其技术细节**，只采信腾讯官方页 + 多家独立评测一致的部分（桌面应用、多模型、credit 制、Hy4）。

### 1.3 本项目已验证的本地事实（不是网上抄的）

- Muse（本 Agent）已在用的免费资源：Gemini API（custom.gemini，`gemini-3.1-flash-lite` 免费层可用，`gemini-2.5-flash` 404，Bearer 直调 generateContent 会 401，只能走 OpenAI 兼容路径）；HeyGen（免费模型 TTS 可用至 2026-11-30）；Rime（`mistv2`，3 字母语言码，无中文）；Copilot Free + OpenCode 1.19.6（已装，11 个免费模型，实测 60 秒无回复一次）；Kaggle GPU（T4 x2 已验证）。
- Antigravity Pro：用户已订阅（见 MEMORY.md / skill），是 Stage 2 首版生成的指定工具。
- 模板现状：`template/` 为单 HTML + `config.js` + `style.css` + `main.js`，换皮只改 `config.js` + `:root` + 2 处 TODO，`node --check` 通过，本地 `python3 -m http.server` 实测 200。**这意味着任何 Agent 接手时都不需要装依赖、不用构建**——这是多 Agent 切换能成立的前提；一旦引入构建步骤，切换成本立刻翻倍。

---

## 2. 多 Agent 协作的最佳实践（业界）

### 2.1 三层指令，不要一个文件写满所有事

来源：BetterClaw《AGENTS.md for Multi-Agent Systems》（2026）、Capstone《AI Project Setup》、Harness《The Agent-Native Repo》、PromptStaging《Share AI Coding Agent Memory》——四家结论一致：

| 层 | 文件 | 放什么 | 不放什么 |
|---|---|---|---|
| Layer 1 根不变量 | `AGENTS.md`（仓库根，不超过 60 行） | 所有 Agent、所有目录都成立的规则：安装 / 构建 / 测试命令原样、不可碰的边界（always / ask-first / never 三档）、“完成”的定义 | 具体任务细节、长篇背景、某个 Agent 专属的写法 |
| Layer 2 范围文件 | `games/<slug>/AGENTS.md`、`template/AGENTS.md` 等嵌套文件 | 该目录自己的约定（例如模板只改 2 处 TODO、GA4 事件名冻结） | 根规则的重复 |
| Layer 3 任务文件 | `SKILL.md`（可复用流程）+ `HANDOFF.md`（当前任务） | SKILL 放“每次都一样的流程”；HANDOFF 放“这次做到哪了” | 不要把 HANDOFF 写进 AGENTS.md——它是临时状态，做完就删 / 归档 |

关键规则（多家一致）：
- **最近的文件获胜**：离被改文件最近的 AGENTS.md 优先；聊天里直接 typed 的指令压过一切文件。
- **工具加载顺序不同**：Claude Code 先读 `CLAUDE.md`，无 `CLAUDE.md` 才 fallback 到 `AGENTS.md`；Gemini CLI 读 `GEMINI.md`（层级加载，`@file.md` 引用）；Codex 读 `AGENTS.md`。**所以不要只写一个文件名就以为五家都读到了**——要在根文件里用 `@AGENTS.md` import 或在各工具的入口文件里互相引用，并每次交接时让接手方报出它实际加载了哪个文件。**
- **上下文文件不是越多越好**：ETH Zurich 2026-02 研究（四家 Agent、SWE-bench）：任何上下文文件都让推理成本与步数上升 20%+；LLM 生成的文件让成功率微降，人写的让成功率微升约 4%，两者均不显著。结论：**只放 Agent 自己推不出来的东西**（命令原样、代码里看不出的约定、约束及原因链接、做到哪了、边界三档），其余交给 linter / 测试 / 类型检查去管。58/100 的热门仓库 AGENTS.md 在复述 linter 已检查的规则——不要学。

### 2.2 仓库即系统记录（Repo as system of record）

- Agent 每次会话都从代码 + 已提交文件 + 任务开始，**之前没有其他上下文**。开会定的决定、邮件里的约束，写进 `docs/` 之前对 Agent 是不可见的。OpenAI Codex 团队同样把版本化 `docs/` 当作系统记录。
- 计算型检查（脚本：formatter、测试、类型检查、CI）优先于推断型检查（再让一个模型评审）。能用脚本判定的事，不要用模型判定。
- **评审用全新上下文**：让评审 Agent 在一个干净会话里只读最终 diff + 验收清单做评审，不要复用写代码那个 Agent 的会话（它会为自己的代码辩护）。

### 2.3 任务拆分：写成 Job 图，不是写成散文

来源：DEV《How to run multiple coding agents in parallel without them fighting》、OrgaBot《How to run multiple coding agents in parallel》：

1. **一个 Job 只给一个 Agent**：一个 Job 就是一个 Agent 冷启动能做完的单元；如果一个 Job 需要两个 Agent，它其实是两个 Job。
2. **依赖写死成边**：迁移 → 接口 → UI；原型 → 内测 → 上架。依赖没完成，Job 就是“不可用”，不是“不建议做”——Agent 听从你强制的结构，不听你描述的结构。
3. **只派已就绪的 Job**：空闲 Agent 只能领依赖已全部完成的 Job，不用任何人判断“安不安全”。
4. **完成即解锁下一个**：Job 完成（验收通过）才解锁下游 Job，不要靠口头通知。

对本项目的映射（skill Stage 0–7 已是 Job 图）：
- Stage 0 基建 → Stage 1 选题 → Stage 2 原型 → Stage 3 内测 → Stage 4 上架 → Stage 5 推广 → Stage 6 数据 → Stage 7 变现。
- **并行只允许在三条轨道上**：Track A 研究、Track B 基建、Track C 当前游戏原型；**两个原型绝不并行**（skill 原话），下一个原型必须等当前游戏上了 itch.io 再开。

### 2.4 隔离第一：一个 Agent 一个工作区

这是并行时最先坏的东西，不是模型质量问题：

- **共享 checkout 的故障**：两个 Agent 改同一份文件，会读到对方改了一半的文件、对着别人改到一半的树跑测试、把不属于自己的改动 commit 上去。最常见的不是 dramatic conflict，而是“测试过了，但没人能重构出它为什么过”。
- **结构修复：`git worktree`**：`git worktree add ../<game>-<agent> -b <branch>`，每个 Agent 一个独立工作目录 + 独立分支，共享同一个对象库（`.git/objects`）和 remote。每个 Agent 只能弄坏自己的分支，测试只跑自己的树，review 时看的是分支。
  - 必须同时隔离的还有**端口与状态**：两个 Agent 都在 3000 / 8000 起 dev server，第二个会静默拿到第一个的输出；本地数据库、缓存、服务同理。**每个 worktree 一个端口**（本项目：`python3 -m http.server 8000+n`，n 按 Agent 编号分配，写进交接包）。
  - 新 worktree 里没有 `node_modules`、没有 build 产物、没有 `.env`（都是 gitignore 的）。不要 symlink 主 checkout 的 `node_modules`——有真实案例是某个 worker 的重装删掉了共享依赖树，全体并行任务一起挂。每个 worktree 自己装依赖；本项目无依赖、无构建，这一步是零成本，但**仍要把 `.env` / GA4 ID 等复制规则写进交接包**（本项目 GA4 ID 从主站抄，不编造）。
  - 工具自带 worktree 支持：Claude Code `claude --worktree <name>`（在 `.claude/worktrees/<name>/` 建，分支 `worktree-<name>`）；Codex 文档同样以 worktree 为并行标准做法；Cursor 同理。
- **本项目的降级方案（当前 `~/workspace/mini-games/` 不是 git 仓库时）**：先不要为并行去搭 git——用文件夹隔离代替：
  - `games/<slug>/` 为主目录（唯一真源）；
  - 并行改同一款游戏时，Agent 在 `games/<slug>-<agent>-<yyyymmdd>/` 里做副本，完成并验收后再由主 Agent 合并回主目录，合并时只合它被允许改的文件；
  - **任何时候主目录同一时刻只有一个写者**，写者身份写进工作台任务的 `locked_by` 字段（见 §3）。
  - 一旦游戏数超过 3 款或并行 Agent 超过 2 个，立即 `git init` + 改走 worktree，不要继续用文件夹复制——复制的合并成本会超过 git 的学习成本。

### 2.5 交接包（Handoff）应该含什么

综合四家最佳实践 + 本项目 skill 的 LOG.md 要求，交接包不是“把聊天记录贴过去”，而是**一个 Agent 写给下一个 Agent 的、能独立成立的文件**：

| 必须有 | 为什么 | 本项目对应字段 |
|---|---|---|
| 目标（一句话）+ 验收标准（可检查的清单） | 接手方不知道“做到什么算做完”就会自己发明标准 | `goal` + `acceptance[]`（照抄 SKILL.md 该 Stage 的 Acceptance 原文） |
| 当前状态（做到哪一步、卡在哪一步） | 避免接手方从头重做或重复已失败的尝试 | `status`（Stage + 子步骤）+ `blocked_by` |
| 已改文件（逐个列出 + 改了什么 + 为什么） | 聊天记录里“改了 main.js”是不够的，要精确到文件与行 / TODO 点 | `changed_files[]`（path + diff 摘要 + 原因） |
| 验证结果（跑过的命令 + 实际输出） | “我测过了”是不可信的，要贴命令与结果 | `verification[]`（command + result + 时间） |
| 已知问题 / 未做完的事 | 否则接手方会在同一个坑里再摔一次 | `known_issues[]` + `todo[]` |
| 下一步（唯一、具体、一个动作） | “继续优化”不是下一步；“把 TODO-GAME-1 的碰撞半径从 X 改成 Y，再跑 release-checklist 第 3 项”是 | `next_step`（单条，动词开头） |
| 不要重做的事 | 防止接手方推翻已验收的决定 | `do_not_redo[]` |
| 接下来要读的文件（最多 5 个，带路径） | 控制上下文成本；超过 5 个说明任务拆得不够细 | `read_next[]`（path + 读它的原因，一行） |
| 锁与归属（谁在写哪个文件、哪个端口） | 防止并发冲突 | `lock`（agent + files + port + branch/worktree） |

**不要放进交接包的**：完整聊天记录、模型内部推理、密钥 / 密码 / 真实 GA4 ID 以外的值、与任务无关的背景。

### 2.6 LOG.md / 交接文档格式（本项目已定，沿用，不另起格式）

skill 已定：每款游戏一个 `~/workspace/mini-games/<game-slug>/LOG.md`，记游玩、来源、测试反馈、每次改动带日期。工作台的游戏档案（M3）是 LOG.md 的索引，不另建复盘库。

```markdown
# LOG — <game-slug>
- 游戏：<一句话>
- 当前 Stage：<Stage 0–7>
- 当前负责人 Agent：<agent_id>（<工具/模型>）
- 锁：<agent_id> 正在写 <文件列表>，端口 <port>，分支/目录 <branch-or-dir>

## 2026-11-23 — <Agent> — <做了什么>
- 改了：<文件> — <改了什么，为什么>
- 验证：<命令> — <结果，贴实际输出>
- 数据：<游玩/来源/反馈，带日期>
- 决定：<Go / Iterate / Kill + 数字依据>

## HANDOFF — 交给 <下一个 Agent>
- 目标：<一句话>
- 状态：<做到哪>
- 下一步：<唯一具体动作>
- 待读：<最多 5 个文件路径>
- 别重做：<已验收的决定>
```

---

## 3. 落到小游戏工作台的设计

### 3.1 Agent 注册表（Registry）字段清单

工作台新增一个模块 **M10 多 Agent 协作**（与 M1–M9 平级，放在模板中心之后、发布中心之前）。注册表每行一个 Agent：

| 字段 | 类型 | 说明 / 取值 |
|---|---|---|
| `agent_id` | string（kebab-case） | 唯一键，例如 `muse`、`gemini-cli`、`antigravity`、`codex`、`workbuddy` |
| `display_name` | string | 显示名，例如 Muse / Gemini CLI / Antigravity / Codex / Workbuddy |
| `provider` | string | Meta / Google / OpenAI / Tencent |
| `model` | string | 当前实际用的模型，例如 Muse Spark 1.3 / Gemini 3.8 Flash / GPT-5.6 Terra / Hy4 |
| `entry_point` | string | 怎么启动它：Muse 对话 / Antigravity IDE / 终端 `gemini` / 终端 `codex` / Workbuddy 桌面 |
| `context_window` | string | 如 §1 表，写数字 + 来源；查不到写“查不到” |
| `cost_model` | string | 免费额度 + 付费价，如 §1 表；Contributor tier 等代价要写进 `notes` |
| `strengths` | string[] | 最多 3 条，照 §1 表抄 |
| `weaknesses` | string[] | 最多 3 条，照 §1 表抄 |
| `best_stages` | Stage[] | 最适合的 Stage，例如 Antigravity: [Stage 2]，Codex: [Stage 2-fix, Stage 6] |
| `forbidden` | string[] | 绝不能让它做的事，例如 Gemini: 不写整个游戏文件；Workbuddy: 不当第一编码 Agent；Codex: 不超 272K 上下文硬塞全库 |
| `file_scope` | string[] | 允许碰的目录，例如 `games/<slug>/`、`template/`、`docs/`；默认不含密钥与账号文件 |
| `status` | enum | `available` / `busy` / `offline` / `quota_exhausted` |
| `current_task_id` | string \| null | 正在做的任务 ID；为空才能领新 Job |
| `last_used` | date | 上次用它的日期；配额类 Agent 靠它判断是否已冷却 |
| `notes` | string | 特殊事项，例如“Contributor tier 不贴密钥”、“免费窗口已迁到 Antigravity CLI” |

**初始注册表（按 §1 填，先上 5 行，不预置假数据以外的行）：**

| agent_id | model | best_stages | status 初始值 |
|---|---|---|---|
| `muse` | Muse Spark 1.3 | Stage 0–7 总控 | `available`（主 Agent 常驻） |
| `antigravity` | Gemini 3.8 Flash（Pro/Ultra 可用 Gemini 4 Argon） | Stage 2 首版生成 | `available` |
| `gemini-cli` | Gemini 3（原 Gemini CLI 路径已迁，见 §1.2） | Stage 1 命名/文案、Stage 6 大上下文评审 | `available`（走 Antigravity CLI 复核） |
| `codex` | GPT-5.6（Terra 常用） | Stage 2-fix 修 Bug、Stage 6 批量测试 | `available` |
| `workbuddy` | Hy4 / Hy4 Flash | Stage 1 调研整理、Stage 5–6 文档/数据表 | `available` |

### 3.2 任务指派（Task Assignment）字段清单

工作台的任务板（M4）每张卡加以下字段（已有字段不动）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `task_id` | string | 唯一键，例如 `zodiac-merge-stage2-prototype` |
| `game_slug` | string | 所属游戏，例如 `zodiac-merge` |
| `stage` | Stage 0–7 | 对应 skill 的 Stage |
| `title` | string | 一句话，动词开头 |
| `owner_agent_id` | string | 负责人 Agent（注册表里的 `agent_id`）；**同一时刻一个任务只能有一个 owner** |
| `backup_agent_id` | string \| null | 接手候选（切换时不用现找） |
| `status` | enum | `ready`（依赖已完成，可领）/ `in_progress` / `blocked` / `review` / `done`（验收通过） |
| `dependencies` | task_id[] | 前置任务 ID；全部 `done` 之前本任务不可领 |
| `input_files` | path[] | 允许读的文件（最多 5 个起步，超了说明任务太大） |
| `output_files` | path[] | 允许写的文件；**不在此列表的文件一律不许碰** |
| `forbidden_files` | path[] | 明确禁区，例如密钥文件、其他 Agent 的 worktree、已验收的 `config.js`（除非任务就是改它） |
| `acceptance` | string[] | 照抄 SKILL.md 该 Stage 的 Acceptance 原文，逐条可勾选 |
| `handoff_id` | string \| null | 当前交接包 ID；切换时更新 |
| `locked_by` | agent_id \| null | 正在写 `output_files` 的 Agent；非空时其他 Agent 只读 |
| `worktree_or_dir` | string | 隔离位置：`git worktree` 路径或 `games/<slug>-<agent>-<date>/` |
| `port` | int \| null | 本地预览端口（8000+n），防端口冲突 |
| `due` | date \| null | 截止日，例如首款原型 2026-12-20 前的可玩版节点 |

**指派规则（写死在工作台里）：**
- 任务只能从 `ready` 领，`blocked` 的任务不派给任何 Agent。
- 一个 Agent 同一时刻只能有一个 `in_progress` 任务（单人项目，WIP ≤2 是给“人 + Agent”合起来算的，不是每个 Agent 各 2 个）。
- 任务完成必须走 `review`：由**另一个 Agent 或主 Agent 在全新上下文里**按 `acceptance` 逐条核验，通过才变 `done`，不通过回 `in_progress` 并写清哪条没过。

### 3.3 交接记录（Handoff Record）字段清单

工作台每款游戏的档案页（M3）下挂交接记录列表，每条一次切换：

| 字段 | 类型 | 说明 |
|---|---|---|
| `handoff_id` | string | 例如 `zodiac-merge-handoff-001` |
| `task_id` | string | 关联任务 |
| `from_agent_id` | string | 交出方 |
| `to_agent_id` | string | 接手方 |
| `at` | datetime | 交接时间 |
| `goal` | string | 一句话目标 |
| `status_summary` | string | 做到哪、卡在哪 |
| `changed_files` | {path, what, why}[] | 逐个文件 |
| `verification` | {command, result}[] | 贴实际命令与输出，不写“我测过了” |
| `known_issues` | string[] | 已知问题 |
| `next_step` | string | 唯一具体动作 |
| `read_next` | path[] | 最多 5 个 |
| `do_not_redo` | string[] | 已验收、不许推翻的决定 |
| `lock` | {agent, files[], port, branch_or_dir} | 交接后的锁归属 |

交接记录的文件载体就是 `games/<slug>/LOG.md` 里的 `## HANDOFF` 段（见 §2.6），工作台只做索引与状态同步，不另建一套交接库——**文件是真源，工作台是视图**。

### 3.4 切换流程（A 做到一半 → B 接手不丢上下文）

**前提：切换只在干净边界发生。** 不要在 Agent 正在改一半文件时切。A 必须先停在一个“能验证的状态”（文件可保存、测试可跑、LOG 已写），再交接。

```
Step 1 — A 停手并固化
  A 停在当前子步骤结束处，不再改文件。
  A 跑一遍验收清单里已能跑的部分，贴出实际结果。

Step 2 — A 写交接包（文件，不是聊天）
  A 更新 games/<slug>/LOG.md，追加 ## HANDOFF 段（格式见 §2.6）。
  A 更新工作台任务状态：in_progress → review（待 B 接手核验）或 blocked（卡住，写清 blocked_by）。

Step 3 — 主 Agent（Muse）做交接登记
  主 Agent 检查交接包是否齐全（§2.5 的 9 项缺一不可）。
  缺项打回 A 补齐，不许直接派给 B。
  主 Agent 更新工作台：handoff_id、owner 从 A 改成 B、locked_by 改成 B、port/目录同步更新。

Step 4 — B 冷启动，只读文件
  B 只读：AGENTS.md（根）+ SKILL.md + HANDOFF（LOG.md 里最新一段）+ 模板 README + read_next 里的文件。
  B 不读聊天记录，不问 A“你刚才做了什么”。
  B 先报出它实际加载了哪个指令文件（AGENTS.md / GEMINI.md / CLAUDE.md 三者加载顺序不同，见 §2.1）。

Step 5 — B 先核验，再动手
  B 按 verification 里写的命令重跑一遍（node --check、本地 http 200、release-checklist 对应项）。
  结果与交接包不符 → B 停手，先报 mismatch（哪个文件、哪条命令、期望 vs 实际），等主 Agent 裁决，不许自己猜着改。
  结果相符 → B 进入 Step 6。

Step 6 — B 只改它被允许的文件
  B 只写 output_files 里的文件，只用分配到的端口与 worktree/目录。
  B 每改一个文件，在 LOG.md 里记一行（文件 + 改了什么 + 为什么）。

Step 7 — B 写新的交接包，闭环
  B 完成或到边界时，重复 Step 1–2，写下一段 HANDOFF。
  主 Agent 按 acceptance 逐条验收，通过 → 任务 done，解锁下游 Job；不通过 → 回 in_progress，写清哪条没过。
```

**切换成本控制：**
- 交接包正文控制在 800 tokens 以内（目标 + 状态 + 已改文件 + 验证 + 下一步 + 待读文件）。超过说明任务拆得太大，要先拆 Job 再切 Agent。
- 待读文件不超过 5 个。B 需要第 6 个文件时，先问主 Agent 是不是任务边界错了。
- 同一款游戏 24 小时内切换不超过 2 次；超过说明任务定义不清，停下来先由主 Agent 重写任务卡。

### 3.5 冲突规则（写死，不靠自觉）

| # | 规则 | 违反时怎么办 |
|---|---|---|
| R1 | 同一时刻、同一文件、只有一个写者（`locked_by` 非空时其他 Agent 只读） | 后来的 Agent 停手，等锁释放或由主 Agent 改派；不许“先改了再说” |
| R2 | 同一款游戏，同一时刻只能有一个 Agent 在 `games/<slug>/` 主目录里写 | 并行改同一款游戏必须走 worktree 或 `-<agent>-<date>` 副本目录，验收后由主 Agent 合并 |
| R3 | `output_files` 之外的文件一律不许碰；`forbidden_files` 碰了即视为事故 | 主 Agent 回滚该文件，任务回 `in_progress`，在交接记录里记一笔 |
| R4 | 两个 Agent 不许同时跑同一个端口的本地预览 | 端口按 Agent 编号分配（8000+n），冲突时后启动的 Agent 必须换端口并更新交接包 |
| R5 | 不许两个 Agent 同时改 `HANDOFF` / `LOG.md` 的同一段 | LOG 追加只允许当前 owner 写；交接时上一段封存（不再改），新开一段 |
| R6 | 不许在共享 checkout 里 `git add -A` / `git checkout` / `git reset` / `git stash` | 用 worktree 后每个 Agent 只在自己的 worktree 里操作 git；无 git 时不许用 git 命令碰主目录 |
| R7 | 评审 Agent 必须用全新上下文，不许复用写代码的 Agent 的会话 | 违反时评审无效，重做一次评审 |
| R8 | 密钥、密码、真实 GA4 ID 以外的值、客户数据，不许进交接包，不许贴进免费 Contributor tier（Muse Spark Contributor / 任何“以训练数据换免费”的 tier） | 发现即删，任务回 `blocked`，由主 Agent 用安全通道重发 |
| R9 | 任务完成不许只写“做完了”，必须贴验收清单逐条结果 + 命令输出 | 缺验证即不算 `done`，打回补验证 |
| R10 | 工作台是视图，文件是真源；两者不一致时以文件为准 | 主 Agent 以文件为准修正工作台，不许反过来改文件去凑工作台 |

---

## 4. 每个 Agent 的提示词模板差异

**通用底座（五家共用，贴在每个任务的最前面）：**

```
游戏：<slug> — <一句话>
Stage：<Stage N — 名称>
目标：<一句话>
验收：<照抄 SKILL.md 该 Stage 的 Acceptance，逐条>
只读：<最多 5 个文件路径>
只改：<output_files 列表，之外一律不许碰>
验证：<跑什么命令，贴实际输出>
交接：做完在 games/<slug>/LOG.md 追加 ## HANDOFF，含目标/状态/已改文件/验证/下一步/待读文件/别重做
```

**差异只在“怎么交代它干活”，不在目标本身：**

### Muse（主 Agent / 总控）

```
你是主 Agent。先读 AGENTS.md + SKILL.md + LOG.md 最新 HANDOFF，再拆任务。
把任务拆成 Job 图（依赖写死），只派 ready 的 Job，一次只派一个给一个 Agent。
每个子 Agent 回来后，按 acceptance 逐条验收，不通过打回并写清哪条没过。
不要自己把子 Agent 的活全做了；你的产出是拆分、验收与汇报。
```

### Gemini（命名 / 文案 / 大上下文评审）

```
读 GEMINI.md（层级加载）+ SKILL.md 里“Name and copy check”模板。
任务：<命名 / 文案 / 评审，全库通读>。
利用你的 1M 上下文先通读 <input_files> 再动手，不要只读片段。
输出：<5 个名字 / 2 句描述 / 15 秒脚本，或评审清单>，不要输出整个游戏文件。
```

### Antigravity（原型首版生成）

```
在 Antigravity IDE 里开一个 Agent 任务，模型选 Gemini 3.8 Flash（Pro/Ultra 可用 Gemini 4 Argon）。
任务：按 SKILL.md “Generate a game”模板生成单 HTML 游戏（<800 行，内联 CSS/JS，无外部资源）。
产出 Artifacts（计划 + 截图/浏览器录制）供验收；跑通后把文件落到 games/<slug>/，并在 LOG.md 记验证结果。
注意免费配额按周刷新，任务一次给清，不要拆成多轮小问。
```

### Codex（修 Bug / 批量改 / 评审）

```
读 AGENTS.md（32 KiB 上限，根文件保持精简）。
任务：<修一个 Bug / 按规范批量改 N 个文件>，附精确复现步骤与期望/实际。
规则：最小改动，不重写整个文件，不加新功能；改完跑测试并贴输出。
注意 CLI 有效上下文约 272K，不要一次塞全库；先让它读 input_files 里的文件。
```

### Workbuddy（调研整理 / 文档批量）

```
用中文自然语言下任务。任务：<整理调研 / 批量处理文档 / 做数据表>。
输入在 <input_files>，输出落到 <output_files>（Word/Excel/PPT/ Markdown 按任务定）。
可以读写授权目录内的本地文件，批量处理时先做 1 个样本给我确认格式，再批量跑其余的。
编码任务不要直接给 Workbuddy，先交给 CodeBuddy（同栈 IDE/CLI）；Workbuddy 只做文档与整理。
```

---

## 5. 落地清单（给工作台 M10 用）

1. 工作台新增 **M10 多 Agent 协作**模块：注册表（§3.1）+ 任务指派扩展字段（§3.2）+ 交接记录索引（§3.3），与 M1–M9 平级。
2. 仓库根加 `AGENTS.md`（<60 行，只放根不变量 + 命令原样 + 边界三档 + 完成定义），各工具入口文件互相引用（`GEMINI.md` / `CLAUDE.md` 如需则建同名薄适配文件，只写一行 `@AGENTS.md` 引用，不另写一套规则）。
3. 每款游戏目录加 `HANDOFF` 约定：`LOG.md` 里的 `## HANDOFF` 段为唯一交接载体，工作台只索引，不另建库。
4. 任务卡强制字段：`owner_agent_id`、`output_files`、`acceptance`、`locked_by`、`port`、`worktree_or_dir`——缺一不可，否则任务不可领。
5. 首款游戏（生肖合成掉落，`zodiac-merge`）的推荐分工：
   - Stage 1 选题：Muse 总控 + Gemini 命名检查
   - Stage 2 原型：Antigravity Pro 首版生成
   - Stage 2-fix：Codex（或 Copilot Free / OpenCode，按 skill 原定）
   - Stage 3 内测记录整理：Workbuddy
   - Stage 4–7 上架 / 推广 / 数据 / 变现：Muse 总控，Workbuddy 做表
6. 切换演练（跑通标准）：拿 `zodiac-merge` 做一次 A→B 切换——A（Antigravity）生成原型后写 HANDOFF，B（Codex）在只读文件的情况下重跑 `node --check` + 本地 http 200 验证通过，再修 1 个小 Bug 并写新 HANDOFF——全程无聊天记录传递，即算跑通。

---

## 6. 查不到 / 未验证清单

- Antigravity 各套餐的具体请求数：Google 不公布（官方文档原话：简单任务比复杂任务能发更多）；第三方整理的“约 20 次/天 Pro 模型”只是预览期口径，签约前以官方定价页为准。
- Codex CLI 有效上下文：模型卡 1.05M vs CLI 272K 的口径冲突已按 v0.144.6 的第三方核实写，当前版本可能已变，**以你本地 `codex --version` 对应的元数据为准**。
- Workbuddy 应用本身的会话窗口、国际版与中国版的 credit 换算细节：查不到；Hy4 免费窗口的结束日期在不同来源是 2026-11-15 与 2026-11-30 两个版本，**以应用内当前提示为准**。
- Muse 在 Muse App 内的个人用量配额（本项目用户侧的 token 配额）：属于用户账号侧的限制，非公开价目，本文不写具体数字；只记“用户已两次提醒省着用”这一本地约束。
- 各 Agent 在本项目模板上的实测表现（例如 Antigravity 生成一次的成功率、Codex 修 Bug 的平均轮次）：本次未实测，**不要把 §1 的“擅长”当成实测结论**；跑通标准里的切换演练（§5.6）就是第一次实测，跑完再把数字补进注册表的 `notes`。
- TreeRouter《WorkBuddy vs Codex》一文描述的 WorkBuddy 技术细节（Go AST、17ms 索引、三层物理隔离）：与腾讯官方产品描述对不上，**不采信**，见 §1.2。

---

## 来源

- Muse Spark：https://rzautomate.com/models/muse-spark ；https://www.datacamp.com/blog/muse-spark-1-1 ；https://www.wuweiai.io/blog/use-muse-spark-1-3-in-opencode ；https://developer.puter.com/ai/meta/muse-spark-1.1/
- Gemini CLI：https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemini-cli-open-source-ai-agent/ ；https://www.tembo.io/blog/codex-vs-claude-code-vs-gemini-cli
- Antigravity：https://antigravity.google/ （经第三方整理转述）；https://realpython.com/ref/ai-coding-tools/google-antigravity/ ；https://justinmckelvey.com/blog/google-antigravity-pricing ；https://ai.vi.ki/google-antigravity/history/1 ；https://www.flobotics.io/blog/what-is-google-antigravity
- Codex：https://aiterm.app/blog/codex-cli-guide/ ；https://codex.danielvaughan.com/2026/07/25/codex-cli-gpt-5-6-272k-context-window-pricing-threshold-auto-compaction-cost-defence/ ；https://www.aicoderscope.com/blog/openai-codex-cli-review-2026/ ；https://codegen.com/comparisons/copilot-vs-codex/
- Workbuddy：https://www.tencentcloud.com/en/products/workbuddy ；https://iadecider.com/articles/workbuddy-review ；https://news.the9.pro/p/hy4-flash-does-everyday-work-as-well-as-claude-haiku-5-5-at-7619/ ；https://api.treerouter.ai/en/blog/tencent-workbuddy-ai-agent-guide ；https://www.progressiverobot.com/2026/08/30/workbuddy-hy4-preview-work-and-coding-tasks/
- 多 Agent 协作：https://www.betterclaw.io/blog/agents-md-multi-agent-best-practices ；https://capstone.alexulbrich.com/guides/ai-project-setup/ ；https://promptstaging.site/article-share-ai-coding-agent-memory.html ；https://www.harness.io/blog/the-agent-native-repo-why-agents-md-is-the-new-standard
- 并行与 worktree：http://dev.to/zordhalo/how-to-run-multiple-coding-agents-in-parallel-without-them-fighting-55ai ；https://www.orga.bot/run-multiple-coding-agents-in-parallel ；https://dev.to/eliran_kotzero_e1781dc487/parallel-agents-with-git-worktrees-in-claude-code-codex-and-cursor-1c95 ；https://www.smfclearinghouse.com/blog/worktree-parallel-coding-agents-git-isolation/
- 本地文件：`~/workspace/custom-skills/mini-game-dev/SKILL.md`；`~/workspace/mini-games/workbench-plan-2026-11-23.md`；`~/workspace/mini-games/multi-platform-2026-11-23.md`；`~/workspace/mini-games/template/README.md`
