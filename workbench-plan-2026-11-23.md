# 小游戏工作台规划 — 业界最佳实践调研版

- 日期：2026-11-23
- 定位：单人、零成本、批量上线海外网页休闲小游戏
- 依据：三线并行调研（平台文档 / 流水线 SOP / 管理模板），原始调研文件见 `/tmp/platform-research.md`、`/tmp/pipeline-research.md`、`/tmp/template-research.md`
- 配套现状：`~/workspace/custom-skills/mini-game-dev/SKILL.md`（Stage 0–7 流程已定）、`~/workspace/mini-games/`（基建：模板 / 部署 / 统计已在搭建）、工作台 Space（`xiao-you-xi-gong-zuo-tai`，在建）
- 方法说明：只做研究，未注册、未部署。凡写“查不到”即本次检索未找到可信公开数字，不代表不存在。数字均附来源，提交前请按链接复核当前版本——平台文档随时会变。

---

## 1. 先说结论：这个工作台要解决什么

### 1.1 流水线的本质是“低成本批量杀想法”，不是“做游戏”

Voodoo 高峰期每年测试约 1,000–1,500 个原型，全年只完整上线约 4 款，其中约 1 款成爆款（通过率约 0.4%）；早期内部要求每人每周出 1 个原型。来源：Deconstructor of Fun（2025-06-02）https://www.deconstructoroffun.com/blog/2025/06/02/how-voodoo-builds-hits-four-product-lessons-from-a-2000-prototypes-a-year-machine

单人复制不了这个量，但要复制纪律：

- 动工前写死阈值再动手
- 一次只验证一个假设
- Iterate 最多一次，不可连续两次
- 失败即归档进素材库，不是删掉
- Kanban 在制品 WIP 上限：单人 2–3 个进行中，超了必须先完结一个再开新卡

工作台的第一职责就是**让“杀”变得便宜、可见、可复盘**，而不是让“做”变得好看。

### 1.2 2023 年后风向已变，别抄 2019 年老阈值

Voodoo 2023 年退出纯超休闲、转向混合休闲（hybrid-casual）；gate 从“低 CPI + D1 留存”改为“能活到第二年吗：第 500 关还好玩吗、有不靠噱头的成长结构吗、D7/D30 留存 + 长期 ROAS”。

照抄 2019 年老阈值（D1 55% / CPI $0.15）会错杀爆款。Voodoo 自己举的反例：Aquapark.io D7 仅 17% 仍成 2019 年下载第一；Push 'Em All D1 仅 46% 但可规模化。

**对单人做网页游戏的直接推论：主验证场应该是 CrazyGames / Poki 的站内实测，而不是买量测 CPI。** Web 端无须买量、无须过 App Store 审核，CrazyGames Basic Launch 官方 KPI 全公开；Poki 是人工精选 + 分阶段实测，门槛高但流量大。移动端超休闲验证依赖买量测 CPI，单人预算下很难跑出统计意义。

### 1.3 批量上线的真相：没有“一键群发”

四家平台均无公开的批量建游戏 / 批量上架 API。唯一可自动化的是 itch.io 的官方 API + butler CLI（`butler push ./dist USERNAME/GAME-NAME:html5`，可脚本化单游戏上传；游戏页面本身仍需在面板逐个创建；新账号软上限 20 个项目页）。CrazyGames / Poki / GameDistribution 的提交都是人工 QA 环节。

所以工作台的“批量”只能是**逐个提交的流水线批量**：同一套素材、同一套检查清单、同一套发布流程，一个游戏走完再走下一个；不是无人值守群发。任何承诺“一键发四家”的方案都是假的。

---

## 2. 平台现实（决定工作台字段怎么设计）

| 维度 | CrazyGames | Poki | itch.io | GameDistribution |
|---|---|---|---|---|
| 准入 | 策展：QA → Basic Launch → Full Launch | 严格策展：申请 + 五步测试漏斗 | 开放：无前置审批，上线≠被收录 | 开放提交 + QA 激活 |
| 分成（开发者得） | 官方不公布固定 %（查不到） | 直接流量 100%；Poki 流量 50/50 | 自定，默认 itch.io 拿 10%（可设 0%–100%） | 净收入 33%（条款 §3.1，2025-06-19 版） |
| 独家 | 非独家 | 默认 web 独家 5 年（指示性，以合同为准；含 Discord / YouTube Playables，Steam / 应用商店 / 主机除外） | 非独家 | 非独家 |
| SDK | Basic 可选，Full 强制 | 强制 | 无 | 强制 |
| 起付门槛 | €100/月 | 查不到 | Collected 模式 $5；Direct 模式无门槛 | €100（条款；FAQ 另有 PayPal €50 口径，不一致） |
| 初始下载上限 | ≤50MB（移动首页 ≤20MB）；总量 ≤250MB；≤1,500 文件 | 建议 ≤5MB（二级来源，未在官方页核实） | 解压总量 ≤500MB / ≤1,000 文件 | 查不到 |
| 批量 / API | 无（查不到） | 无（查不到） | 有 API + butler CLI（可脚本化上传） | 无（查不到） |

来源：
- CrazyGames：https://docs.crazygames.com/ （Requirements / FAQ / Game covers）
- Poki：https://developers.poki.com/guide/working-with-poki 、https://developers.poki.com/guide/how-testing-works 、https://developers.poki.com/guide/revenue-deal-types
- itch.io：https://itch.io/docs/creators/quality-guidelines 、https://itch.io/docs/api/serverside
- GameDistribution：条款 / 指南 / SDK 文档为 static.gamedistribution.com 托管的 PDF 与帮助页，本次通过转述官方文档的二级汇总核对，未直接打开 PDF 原文，签约前请直读原文。

### 2.1 各平台硬性要求（工作台发布检查清单的来源）

**CrazyGames — 素材最严，以它为准做一套素材复用三家：**
- 必须有英文本地化；PEGI 12 合规、面向 13+；内容原创；无外部广告、无其他门户品牌；Chrome/Edge 必须流畅。
- 封面 3 张强制：横版 16:9 1920×1080、竖版 2:3 800×1200、方形 1:1 800×800，三张视觉一致；禁边框、禁除标题外的文字、禁图标/商店 logo。
- 预览视频：15–20 秒、≤50MB、1080p 横版 + 1080p 竖版各一（均为强制）、无声、首帧用静态封面。
- Full Launch 后可在 Experiments 页 A/B 测试封面/视频（每游戏同时 1 个实验、每月最多 2 个、最多 14 天）。

**Poki — 门槛最高，当“第二站”而非“第一站”：**
- 测试漏斗五步：上传构建/原型 → Playtesting（每轮返回 10 条真实玩家录像）→ Player Fit Test → Web Fit Test → Final review（1–2 周内决定；通过后从签约到全球发布约 2–3 个月）。
- Player Fit 硬线：500 名玩家，平均游玩 ≥3 分钟且 ≥25% 的游玩超过 3 分钟。
- Web Fit 目标：C2P（进入玩法转化）≥65%、平均游玩 ≥5 分钟（管理/模拟类 ≥10 分钟）；官方背景值：Poki 平均游戏约 70% 转化、6+ 分钟游玩。
- 默认 web 独家 5 年——同一游戏不能再上 CrazyGames / GD / itch.io 网页版，**投放前必须先定独家策略**。非独家替代方案为一次性固定授权费（金额不公布）。

**itch.io — 铺量第一站：**
- 零审批：建页面、传 ZIP、设 Public 即上线；上线 ≠ 被收录，进 browse/search/recommendations 须符合质量指南。
- 禁换皮 / 大量微改页面刷 Most Recent；禁误导内容、冒充、遮挡式广告与第三方登录墙；须准确填写生成式 AI 披露（AI 制作且人工输入极少的内容按 spam 处理）。
- ZIP 上限（转述官方 HTML5 文档）：解压后 ≤1,000 文件、≤500MB 总量、单文件 ≤200MB；入口须为 `index.html`；只能用相对路径。
- 封面尺寸官方质量指南页正文未给数字；二级来源称建议 630×500。分类 1 个 genre + 最多 10 个标签。
- 浏览器游戏只能收捐赠，要收费须把项目类型设为 Downloadable。定价：免费 / 付费 / pay-what-you-want / 捐赠。

**GameDistribution — 分发网络，不是玩家门户：**
- 一次上传分发给网络内 2,000+ 发布商网站，但分成只有 33% 且规则最严：SDK 强制；preroll + midroll 强制；禁一切出站链接；禁非 GD 广告；禁收集个人数据、禁追踪 cookie、禁 Google Analytics 或任何分析工具；禁内购与追踪软件（条款 2.6.8）；必须有声音。
- 素材（二级来源转述官方 spec，未直接核实）：缩略图 512×512、512×384、200×120 三张；描述与玩法说明各 200–500 字符。
- 审核最长 2–3 周；更新也要重新审核。

### 2.2 验证阈值（工作台“Go / Iterate / Kill”决策的刻度）

**主刻度：CrazyGames Basic Launch（官方文档，2026-11-23 现行，最适合单人）**
- 测试期 7–21 天，≥7 天且 ≥500 次游玩即结束；未达 500 次则 21 天自动结束。
- 成功线：平均游玩时长 10+ 分钟；D1 留存 10–15%；转化率（开始后玩 ≥1 分钟的玩家占比）80%+（加载 <10 秒、包体 <20MB）；CTR 为同品类 Basic Launch 前 20%（2026-11-23 起新增为第四指标）。
- Basic Launch 阶段无需 SDK、无变现，KPI 自动追踪；通过 → Full Launch（接 SDK 变现）。

**辅助刻度：Poki（高门槛高回报的第二站）**
- 见 2.1：Player Fit 平均 ≥3 分钟且 25% 超 3 分钟；Web Fit C2P ≥65%、平均游玩 ≥5 分钟。

**历史口径，仅作参考线，不当 kill 线：**
- Voodoo 混合休闲现行口径：D1 ≥45%、D7 ≥15%（解谜 20%）、D30 ≥10%、长期 ROAS D120 150%、长期 200–300%。
- 超休闲发行经验阈值（Supersonic / GameDeveloper 文章）：CPI 目标 <$0.25–0.30；D1 留存 ≥38%（Android）；APPU D7 >2000 秒。**不是通用标准，不同品类与地区差异大。**
- 各发行商现行 CPI 上限：查不到。CrazyGames 不靠 CPI，靠站内 KPI。

---

## 3. 流水线：单人版（从 12–18 个月压缩到每月 1 原型）

大团队混合休闲全流程是：原型 1–3 周 → 留存测试 3–6 周 → Meta/经济 1–3 个月 → 软启动 2–6 个月，总计 12–18 个月。单人做网页休闲游戏，砍掉移动端买量与全套 Meta，压缩为以下节奏（与 `mini-game-dev` skill 的 Stage 0–7 对齐）：

| 阶段 | 时间盒 | 目的（回答什么问题） | 输出 | 退出标准 |
|---|---|---|---|---|
| Stage 0 基建 | 1 天，只做一次 | 模板、部署、统计、账号是否就绪 | 可部署的空白模板 + 发布检查清单 | 空白模板能部署到公网，手机和桌面都能玩 |
| Stage 1 选题 | 半天 | 值得做吗（四问） | 一页概念简报 + 可证伪假设 + 预设阈值 | 简报通过 + 阈值已写；否则回炉或丢弃 |
| Stage 2 原型 | 1 天可玩（超休闲原型上限 1–3 周，单人取下限） | 核心机制几秒内是否好玩、看得懂 | 可玩原型（1 机制 + 1 障碍 + 1 奖励反馈 + 1 失败态）+ 15 秒实录视频 | 陌生人无需解释能玩；否则 Kill 或回 Stage 1（不直接精修美术） |
| Stage 3 内测 | 3–5 人 | 真人会不会卡住、愿不愿再玩 | 内测记录 | 至少 3 人通关一局，至少 2 人愿意再玩一局，10 秒内无人卡住；两人以上反馈才修 |
| Stage 4 上架 | 半天 / 款 / 平台 | 能否通过平台 QA | itch.io → GameDistribution → CrazyGames（顺序固定，见 §4） | 逐平台 Live；被驳回记原因、改后重提 |
| Stage 5 推广 | 首周至少 5 条短视频 | 呈现方式能否低成本获客 | 15–30 秒真实玩法录屏，前 3 秒钩子 | 发完、记数据；不以播放量单独判死刑 |
| Stage 6 数据迭代 | 每周一看 | 玩家第二天还回来吗、哪里流失 | 每周一行数据 + 最差 3 关 | <100 游玩砍掉；早期流失单点改；>1000 游玩或分享率 >5% 才换皮 |
| Stage 7 变现 | 通过后再做 | 能不能赚钱 | 平台广告分成 → 1000 游玩后加 1 个 $0.99–2.99 内购 | 不投付费广告（沿用 Zodiac 转化未证明不花钱的规矩） |

**四问选题验证（每个不确定性单独给证据）：**
1. 看得懂吗 — 3 秒内明白要干什么、无需教程
2. 好玩吗 — 核心循环的手感、反馈、失败-重试节奏（失败 1 秒内重开）
3. 做得出来吗 — 最难的技术/内容点能否以可接受成本做出来（先做风险最高的 spike，不做美术）
4. 买得到量吗 — 呈现方式（视频/缩略图）能否低成本获客（15 秒竖屏实录视频；Web 端看缩略图 CTR）

**Go / Iterate / Kill 决策（动工前就把阈值写进简报）：**
- Go：全部 gate 达标 → 进入下一阶段，并启用更高阈值。
- Iterate：仅 1–2 个指标未达标且数据指向明确可修原因（某关卡簇异常流失、某新手步骤、某条歪曲玩法的素材）。只给一个 sprint + 一个明确假设，然后终局 Go/Kill。**Iterate 不可连续两次。**
- Kill：未达标且无明确原因，或 Iterate 失败。机制、关卡与教训归档进框架素材库（不是删掉）。
- 决策会材料（一页 readout）：简报假设与阈值原文、每项指标值 + cohort 量 + 趋势、最差的 3 个关卡及原因、创意结果、带具体理由的建议。会上只讨论建议，不重新发现数据。

**单人节奏：每月 1 个原型。** Week 1 选题 + 简报 + 阈值 → Week 2 原型 → Week 3 创意/CPI 或 CrazyGames Basic Launch → Week 4 Go/Iterate/Kill 决策会（一页 readout）。通过的游戏再进 3–6 周留存测试；留存通过再做 Meta；全程 Kanban WIP ≤3。

**可抄 vs 不可抄（流水线层面）：**
- 可抄：模板化 LiveOps（赛季通行证/收藏/活动逻辑一次写好，只换配置 + 美术，如 Royal Match → Royal Kingdom）、一核多皮（先验证机制模板再换主题，每个变体仍要过 gate）、Web 端先行验证、每月 1 原型节奏、Kanban WIP 上限 2–3。
- 不可抄：Voodoo 式年测上千原型、买 $100 源码批量换皮上架（同质化 + 平台风控 + 毁口碑）、无 gate 的铺量、混合休闲 Meta 一次做满、照搬 2019 年硬阈值当 kill 线。

---

## 4. 推荐模块清单（工作台的 9 个模块）

设计原则：**6 个核心库是底线，9 个模块是完备版。** 模板调研的结论是最小保留集 6 个库；本规划在此基础上为“批量上线 + 变现”补 3 个（发布管理、推广、变现本就是 6 库里“三合一小表”的展开，单人前期可先合并不必分家——见每个模块末尾的“单人降级”）。

模块总览：

| # | 模块 | 用途一句话 | 来源 |
|---|---|---|---|
| M1 | 选题库 | 想法先入库，批量对比后只把 1 个推进原型 | Indie Game Dev OS Scope Board；Command Center Lite；ICE/RICE |
| M2 | 概念简报 / 活 GDD | 一页写清核心循环 + 阈值，代替长文档 | NotoMantra 免费 GDD；HacknPlan Game Design Model |
| M3 | 游戏档案 | 一款游戏一条记录，全流程的锚点 | Command Center Lite Games 库（单人退化为 1 行/款） |
| M4 | 本周任务板 | 本周只做这几件事，唯一每天打开的板 | Trello 工程板；Indie Game Dev OS Blocked 视图；UGO 工时对比 |
| M5 | Bug 表 | 崩溃与阻塞永远置顶 | Command Center Lite；Venom Board Bug triage |
| M6 | 资产库 | 知道什么能直接用、什么还是占位、什么版权不清 | Indie Game Dev OS Assets 三视图；Notion Asset Management System（$35，结构可抄、不用买） |
| M7 | 发布管理 | 每个平台的上架是一串有截止日的检查项 | Command Center Lite Releases 库；Maxmini Build & Release Checklist；Steam Launch Planner |
| M8 | 推广日历 | 按固定节奏发内容，把“发了什么、有用吗”记下来 | Indie Game Dev OS Marketing 页；Indie Game Marketing Toolkit（6 周上线系统） |
| M9 | 数据 + 变现 | 每周只看 5 个数；知道每款游戏真实盈亏、钱什么时候到账 | Indie Game Dev OS Money 页 + Playtesting 页；CrazyGames Dashboard；Poki Inspector |

### M1. 选题库 / Idea Vault

- **用途：** 想法先入库不直接开工；批量对比后只把 1 个推进到原型。防“脑子里有个想法就开工”。
- **核心字段：** 名称、一句话核心玩法（Core loop）、品类/机制标签（timing / agility / puzzle / swerve / merge 五大家族覆盖绝大多数出货）、参考游戏/爆款视频链接、目标平台、预估开发天数、美术/音频是否现成、ICE 分（Impact 1–10 × Confidence 1–10 × Ease 1–10）、状态、验证结果（CPI / D1 / 去留结论 + Kill 原因）。
- **打分排序：** ICE 适合快速排一堆小实验；RICE（(Reach × Impact × Confidence) / Effort）适合排大功能，单人场景 Reach 常可省、退化成 ICE；MoSCoW（Must / Should / Could / Won't）——Indie Game Dev OS 的 Scope Board 就是 Core / Should Have / Nice to Have / Cut 四档，“Cut”要显式留档、防反复。
- **状态流转：** Inbox（随手记）→ Scored（已打分）→ Shortlisted（进候选）→ Prototyping（做原型）→ Validated（数据过关，立项）/ Killed（数据不过，归档并写死原因）→ Backlog（过关但暂缓）。
- **超休闲专用加法（模板里没有，需自加）：** CPI 实测值、D1 留存、APPU D7。原型只做 2 个可循环关卡即可测，不要先做 40 关。
- **来源：** Indie Game Dev Command Center — Lite（https://www.notion.com/templates/indie-game-dev-command-center-lite）；Indie Game Dev OS（https://notomantra.gumroad.com/l/game_dev_os）；Supersonic / GameDeveloper 公开经验阈值（CPI <$0.25–0.30、D1 ≥38%、APPU D7 >2000 秒，作参考线即可）。

### M2. 概念简报 / 活 GDD

- **用途：** 一句话核心循环 + 机制/关卡/角色/敌人/UI/音频逐条清单，代替写完就过时的长文档。动工前必须写完，否则不进原型。
- **核心字段：** 目标玩家、核心活动（一句话：玩家每分钟在干什么，不是背景故事）、独特承诺（凭什么值得选）、目标感受、首局结果（新玩家第一次会话结束时应理解/完成什么）、可证伪假设、预设阈值（Gate 指标 + 定义 + cohort 口径）、Element 清单（名称 / Type：Mechanic / Level / Character / Enemy / UI / Quest / Audio / 一句话描述 / Why it exists / Priority / Status / Milestone / Open questions）。
- **状态流转：** Idea → Designed → Building → In playtest → Done；另设 Cut 档。
- **抄点：** NotoMantra 免费 GDD 的 “Why it exists” 列最值得抄——不服务核心循环的功能直接砍；HacknPlan 的 Game Design Model 是同一思想的产品化版（设计元素直接挂任务）；Indie Game Dev OS 另有 Decision Log（决策不再反复争论）。
- **来源：** NotoMantra 免费 GDD（https://www.notomantra.com/free/game-design-document/）；HacknPlan（https://hacknplan.com）；Indie Game Dev OS。

### M3. 游戏档案（Game Record）

- **用途：** 一款游戏一条记录，是 M2–M9 的锚点。所有任务、Bug、资产、发布行、推广内容、数据行都挂到这条记录上，查一款游戏只看这一页。
- **核心字段：** 游戏名 / slug、选题库来源、核心机制、当前阶段（Stage 0–7）、当前平台状态摘要、模板版本（复用的机制模板名）、换皮来源（如果是变体，写清母版）、上线日期、累计游玩、累计收入、状态（进行中 / 已上线 / 已 Kill / 维护中）。
- **状态流转：** 选题 → 原型 → 内测 → 上架中 → 已上线 → LiveOps → 维护 / 下架；Kill 的游戏进档案库，不删除（机制、关卡与教训归档进框架素材库）。
- **单人降级：** Command Center Lite 的 Games 库是为多项目准备的；单人一次只做一款，Games 库退化为 1 行记录/款，或直接以“游戏档案页”代替独立库。
- **来源：** Indie Game Dev Command Center — Lite（Games / Tasks / Bugs / Releases 四库）；Indie Game Dev OS（每款游戏 duplicate 一份的官方建议）。

### M4. 本周任务板

- **用途：** 本周只做这几件事；是唯一每天打开的板。
- **核心字段：** 任务、所属游戏/里程碑、Discipline（code / art / audio / design / writing / marketing）、Status、Priority、预估工时、实际工时、Blocked 原因、关联 Bug / 资产。
- **状态流转：** Backlog → To Do（本周）→ Doing（单人建议 WIP ≤2）→ Review/Testing → Done（归档不删除）。Trello 工程板是 Backlog → Design → To Do → Doing → Code Review → Testing → Done；单人可砍掉 Code Review，合并为“自测清单”。
- **抄点：** Indie Game Dev OS 的 Blocked 视图（先清阻塞再开新活）；UGO 的“实际 vs 预估工时”（估算能力是单人最大短板）；Command Center Lite 的按 priority / area / deadline / project 四维视图；每卡 ≤2 天工作量；总排期留 30–50% 缓冲；范围控制 MoSCoW，砍功能顺序：皮肤外观 → 支线内容 → 额外模式 → 系统深度 → 内容量 → 最后才动核心循环。
- **来源：** Trello 公开模板板 Game Development（https://trello.com/b/qbWcz9pj/game-development）；Indie Game Dev OS；Ultimate GameDev Organizer（https://www.mineogames.com/2025/05/14/UGO-PRESENTATION/）。

### M5. Bug 表

- **用途：** 崩溃与阻塞永远置顶，别让 bug 淹没在任务里。
- **核心字段：** 标题、Severity（Crash / Blocker > Major > Minor > Polish）、Status、复现步骤、出现版本/平台、关联任务、验证人/验证结果。
- **状态流转：** New → Confirmed（可复现）→ Fixing → Fixed（待验证）→ Verified / Closed；无法复现进 Cannot Reproduce 归档。
- **抄点：** Command Center Lite 要求必填“复现步骤 + 验证”；Indie Game Dev OS 首页置顶 “Shipping Risk：未修崩溃与阻塞”；Venom Board 的 Bug triage 按 crash / major / minor / polish 分 lane。
- **单人降级：** 前期可并进 M4 任务板，用 Severity 标签 + 置顶视图代替独立库；第一款游戏上线前必须独立出来。
- **来源：** Indie Game Dev Command Center — Lite；Venom Board（https://venomboard.com/templates）。

### M6. 资产库

- **用途：** 知道什么能直接用、什么还是占位、什么版权不清——上线周才发现占位图 / 无授权音乐是常见死因。
- **核心字段：** 资产名、Type（Sprite / Model / Sound / Music / VFX / Font / UI / 代码模板）、所属游戏/关卡、来源（自制 / 购买 / 免费 / CC0 / AI 生成）、License（授权与署名要求）、文件链接（Drive / GitHub / 仓库路径）、缩略图、Status、版本号/最后修改。
- **状态流转：** Needed → Placeholder（占位）→ WIP → Review → Final；另设 License Check 视图（授权不明 / 缺署名的全部列出）。
- **抄点：** 不要建庞大 DAM；单人只要“占位清单 + 授权清单 + credits 清单”三张视图（Indie Game Dev OS 的 Assets 页最值得抄的三视图：Placeholders Still in Game、License Check、Credits List，可直接粘进片尾字幕）。代码模板当成一种资产 Type=“代码模板/脚手架”，文件链接指向 GitHub 仓库/tag。Airtable 的附件 + 缩略图 + 标签 + 筛选视图适合做“可搜索的图库”，但文件本体仍放 Drive，Airtable 只存索引与元数据；Zapier + AI 自动打标签的方案要付费，零成本不做。
- **来源：** Indie Game Dev OS Assets 页；Notion Asset Management System for Game Developers（$35，https://www.notion.com/templates/asset-management-system-for-game-developers，结构可抄、不用买）；Butterscotch Shenanigans 用 Airtable 管 Levelhead 关卡与徽章内容的案例。

### M7. 发布管理

- **用途：** 每个平台的上架是一串有截止日的检查项，不是“发了就行”。批量上线的核心模块。
- **核心字段（每平台一行）：** 平台（itch.io / GameDistribution / CrazyGames / Poki）、游戏版本、构建版本、商店页状态、审核状态、上架日期、价格/折扣、商店素材状态（封面 3 张 / 截图 / 预告片 2 条是否齐全）、SDK 状态（未接 / 已接 / 已验证）、Demo 状态、备注 / 驳回原因。
- **状态流转（每平台一行）：** Not started → Store page draft → Submitted / In review → Changes requested（附驳回原因）→ Approved / Live → Update pending → Live。
- **上架顺序（固定，写死在工作台里）：** itch.io（零审批、可 butler 脚本化上传，第一站验证）→ GameDistribution（一次分发 2,000+ 站，但分成 33% 且规则最严）→ CrazyGames（Basic Launch 7–21 天、≥500 游玩，不锁独家）→ Poki（最后，只有数据过关的游戏才投；默认 web 独家 5 年，投前先定独家策略）。
- **检查清单来源：** Maxmini 的 Build & Release Checklist：预构建验证（测试通过、无控制台报错）→ 平台检查（HTML5 画布尺寸、移动端触摸）→ 上传步骤（itch.io、压缩、描述更新）→ 发布后 24h 监控（首日数据、崩溃报告）。CrazyGames 素材清单见 §2.1（3 封面 + 2 视频为硬性要求）。GD 检查清单：SDK 验证（后台 iframe 里完整看完一次测试 preroll）、禁外链/禁分析工具/禁内购 UI 的自查项。
- **来源：** Command Center Lite Releases 库 + Release calendar；Maxmini《5 Free Notion Templates Every Indie Game Developer Needs》（https://medium.com/@maxmini0214/5-free-notion-templates-every-indie-game-developer-needs-f13c21985174）；Steam Launch Planner（https://www.strayspark.studio/tools/steam-launch-planner，愿望单阈值等 Steam 部分不适用网页游戏，只抄 readiness 评分思路）。

### M8. 推广日历 / 内容管线

- **用途：** 按固定节奏发内容，把“发了什么、有用吗”记下来；不是灵感库。
- **核心字段：** 内容标题、形式（短视频 / 截图 / GIF / 预告片 / devlog）、平台（TikTok / YouTube Shorts / X / Reddit / Discord）、发布日期、关联游戏/版本/机制、素材链接、状态、数据（播放 / 点赞 / 转发 / 点击 / 新增游玩）。
- **状态流转：** Idea → Scripting / Draft → Recorded / Produced → Editing → Scheduled → Published → 复盘（记数据与结论）。
- **抄点：** Indie Game Dev OS 的 Marketing 页：Content pipeline + Content calendar + Weekly wishlist log + What Worked（按播放量排帖子）；Indie Game Marketing Toolkit：6 周上线前清单（每周任务）+ Post-Launch Calendar + Distribution Plan；Maxmini 的 Marketing Timeline 按阶段排：Pre-announcement → Announcement → Pre-launch → Launch week → Post-launch。单人执行标准（沿用 skill）：真实玩法录屏 15–30 秒，前 3 秒钩子，HeyGen 免费模型 / Rime（3 字母语言码，无中文）配音，首周至少 5 条，TikTok + Shorts 同日发。
- **来源：** Indie Game Dev OS Marketing 页；Indie Game Marketing Toolkit（https://krishnamohanyag.medium.com/stop-letting-great-games-go-unnoticed-launch-smarter-with-the-indie-game-marketing-toolkit-c89653e33498）。

### M9. 数据 + 变现

- **用途：** 每周只看 5 个数；知道每款游戏真实盈亏、钱什么时候到账。单人零成本场景下重点是“收入到账跟踪”而不是“成本核算”。
- **数据看板核心字段（每周一行）：** 日期、总游玩、平均游玩时长、D1 留存、转化率（进入玩法 ≥1 分钟占比）、CTR、分享率、通关率、各来源游玩、试玩反馈（玩家原话/行为、关联机制、出现频次 Heard Most、结论 Fix It / 保留进预告片的优点 / 不做）。
- **变现结算核心字段（收入）：** 平台、结算周期、账期、应收、实收、手续费/平台抽成、到账日期、到账状态（待结算 / 已出账单 / 已到账）、提现方式；广告变现另加广告平台、eCPM、展示、收入。
- **变现结算核心字段（支出）：** 日期、类别（素材 / 工具订阅 / 域名 / 服务费）、金额、是否订阅（自动续费提醒）。零成本阶段支出表可只留订阅续费提醒。
- **抄点：** Indie Game Dev OS 的 Money 页最完整：Where You Stand（实时盈亏）、一本总账、Spend by Category 图、Subscriptions、Money In；Playtesting 页的 Heard Most / Fix It, Nothing Done Yet / What They Loved。CrazyGames Dashboard 默认提供 Players、Average playtime、Gameplay conversion、Retention、Revenue；进阶分析官方推荐免费工具 ByteBrew。Poki 提供 Poki Inspector（对照要求自查）。
- **注意：** 所有免费模板的数据看板都是手工填表；没有哪个免费模板能自动拉 Steam / GA 数据。自动拉数要另接 API，不属于模板范畴。单人前期每周手填 5 个数足够。
- **来源：** Indie Game Dev OS Money 页 + Playtesting 页；CrazyGames 文档（https://docs.crazygames.com/）；Poki 开发者文档（https://developers.poki.com/guide/working-with-poki）。

---

## 5. 要抄的 vs 要砍掉的

### 5.1 要抄的（按优先级）

| 抄什么 | 来源 | 为什么适合单人 |
|---|---|---|
| Games / Tasks / Bugs / Releases 四库骨架 | Indie Game Dev Command Center — Lite（免费） | 最轻的全套骨架，零成本最快起点 |
| 选题库 ICE 打分 + Cut 显式留档 | Indie Game Dev OS Scope Board | 快速排一堆小实验，防反复开已砍的想法 |
| 活 GDD + “Why it exists”列 + Decision Log | NotoMantra 免费 GDD；HacknPlan Game Design Model | 不服务核心循环的功能直接砍；决策不再反复争论 |
| Blocked 视图 + 实际 vs 预估工时 | Indie Game Dev OS；UGO | 先清阻塞再开新活；估算能力是单人最大短板 |
| 资产三视图（占位 / 授权 / credits） | Indie Game Dev OS Assets 页 | 上线周才发现占位图/无授权音乐是常见死因 |
| 发布检查清单（预构建 → 平台检查 → 上传 → 发布后 24h 监控） | Maxmini Build & Release Checklist | 批量上线的核心，防漏项 |
| 推广管线 + What Worked 复盘 | Indie Game Dev OS Marketing 页 | 按播放量排帖子，知道什么内容有用 |
| Money 总账 + 订阅提醒 + 收入到账跟踪 | Indie Game Dev OS Money 页 | 知道钱什么时候到账，防订阅悄悄扣费 |
| 模板化 LiveOps + 一核多皮 | Dream Games / Merge Mansion 做法；Balancy 模板化 LiveOps 文章 | 逻辑一次写好，只换配置 + 美术；每个变体仍要过 gate |
| 每月 1 原型 + 一页 readout 决策会 | Voodoo / CMZ Soft Go/Kill 框架 | 保留杀的纪律，降频到单人能承受的节奏 |

### 5.2 要砍掉的（单人零成本不做）

| 砍掉 / 降级 | 理由 | 降级成什么 |
|---|---|---|
| 双周 Sprint / 燃尽图 / Gantt / 速率统计 | 单人没有“团队速率”可统计；UGO / HacknPlan 的燃尽图、Gantt 图都是团队产物 | “本周三件事”清单 |
| Owner / 审批流 / RACI | 只有一个人，Owner 字段纯属摆设 | 删掉 assignee / owner 列 |
| 世界观 / 场景库 / 隐藏要素库 | 超休闲/小体量游戏根本没有世界观可管 | 并进 GDD 一页 |
| 复杂资产 DAM（AI 自动打标签、版本审批、艺术家派单） | Notion $35 资产系统、Zapier + OpenAI 方案都是为 5–20 人团队做的；Zapier 付费 + OpenAI key 不适合零成本 | M6 三视图 |
| Sponsor CRM、大规模 Press 外联管线 | 单人前期没有赞助可谈 | 1 个“创作者/媒体联系表”（姓名/渠道/状态/上次联系），等有量再扩 |
| 多币种结算、发票、税务、多币种大账本 | Indie Game Dev OS 的 Money 页全套照搬太重 | M9 收入到账跟踪 + 订阅提醒两张小表 |
| 自动化数据看板（自动拉 Steam / 广告平台数据、BI 图表） | 免费模板都做不到，都是手填；别为“自动”再搭一套系统 | 每周手填 5 个数 |
| 独立的复盘/日报/周报库、PARA 文档体系 | UGO 的 PARA + 每日日志对单人是负担 | 复盘写进试玩记录与 Killed 原因里 |
| 公开路线图 + 玩家反馈收集系统（Canny / Featurebase 类） | 没玩家时是空壳 | Trello 公开板或 Notion 公开页占位，等有玩家再接 Codecks User Reports |
| 多游戏并行管理（Games 总库、跨游戏仪表盘） | 单人一次只做一款 | M3 一款游戏一份档案；模板按“一款游戏一份拷贝”用 |
| Code Review 环节、QA 团队流程 | Trello 工程板里的 Code Review、Testing 分离 | 合并为“自测清单” |
| Voodoo 式年测上千原型、每人每周 1 原型 | 量级需要 100+ 团队与发行商买量预算 | 每月 1–2 个高质量原型，保留同样的 kill 纪律 |
| 买 ThemeForest 等 $100 以下源码批量换皮上架 | 同质化、平台风控、毁口碑；“换皮月入百万”类说法无可验证收入证据 | 一核多皮：先验证机制模板再换主题，每个变体过 gate |
| 无 gate 的批量铺量（做 20 个换皮一起上） | 没有 CPI/留存 gate 的铺量只是把失败复制 20 份；单人维护 20 款的 LiveOps/客服/合规成本会拖垮 | 每款过 gate 才上架 |
| 混合休闲全套 Meta/经济一次做满 | 1–3 个月工作量 | 留存验证通过后再投入；先做最小可演进结构 |

**付费模板提醒：** 本次查到的 $4.99–$35 付费模板没有哪个模块是免费版拼不出来的，买的是排版与示例数据；付费模板内部字段只看了官方介绍页，未购买核实。**不要为模板付费。**

### 5.3 最小保留集（如果只能做 6 个）

模板调研的结论，工作台第一版先保这 6 个，其余可后补：

1. 选题库（含 ICE + CPI/D1/APPU 字段）
2. GDD 活文档（Mechanic 清单）
3. 本周任务板（WIP ≤2）
4. Bug 表（Severity 置顶）
5. 资产三视图（占位 / 授权 / credits）
6. 发布 + 推广 + 钱的三合一小表（每平台一行上架状态；每周一行内容 + 游玩；每月一行收入到账）

这 6 个基本就是 Indie Game Dev Command Center Lite（Games / Tasks / Bugs / Releases 四库）+ 选题库 + 钱表。

---

## 6. 落地到工作台：怎么建、怎么跑通

### 6.1 工作台形态建议

- **载体：** 在建的 Space 工作台（`xiao-you-xi-gong-zuo-tai`）为主界面；`~/workspace/mini-games/` 为文件后端（模板 / 游戏 / 资产 / 文档），两者一一对应，不要各搞一套字段。
- **一屏总览（首页必须有的 5 个数）：** 进行中游戏数（WIP）、本周待办、待修 Crash/Blocker 数、本周总游玩、待结算/已到账收入。首页不放长文。
- **一条游戏 = 一条流水线：** M3 游戏档案页内嵌该游戏的 M2 简报、M4 任务、M5 Bug、M6 资产、M7 各平台发布行、M8 推广内容、M9 数据行。查一款游戏只看这一页。
- **批量 = 复制档案，不是复制游戏：** 新游戏从“机制模板”复制档案（Stage 0 模板库已含开始屏、分数、重开、分享、暂停、静音、手机触控），只换主题、角色、关卡配置；每个变体仍要过 Stage 2–3 的 gate。

### 6.2 跑通标准（验收什么叫“落地并跑通”）

用第一款游戏走完全流程才算跑通，不是把 9 个模块建完就算：

1. 选题库里有 ≥5 个已打分选题，1 个进原型，阈值写死在简报里。
2. 原型 1 天可玩：打开即玩、无登录、加载 ≤2 秒、1 局 1–3 分钟、有分数、重开、分享、静音，手机和桌面都可用。
3. 内测 3–5 人记录完整（通关 / 再玩 / 卡住点）。
4. itch.io 已上线（Public），GameDistribution / CrazyGames 至少进入 Submitted / In review，驳回原因有记录。
5. 推广日历首周 ≥5 条短视频已发布，数据已记。
6. 数据看板有第一周的 5 个数（总游玩、平均时长、D1、转化率、分享率），并据此做出 Go / Iterate / Kill 决策，写进复盘。
7. 变现表有第一笔应收（哪怕是 €0 / $0 的待结算行），结算周期与起付门槛已填。

### 6.3 与现有基建的衔接

- `~/workspace/mini-games/template/`：Stage 0 模板库，M6 代码模板资产的一种，M3 档案里记模板版本。
- `~/workspace/mini-games/games/<slug>/`：每款游戏一个目录，含 `LOG.md`（决策与复盘写这里，不另建复盘库）。
- `~/workspace/mini-games/analytics/`：M9 数据行的文件后端，每周一行手填。
- `~/workspace/custom-skills/mini-game-dev/SKILL.md`：流程 skill（Stage 0–7）是工作台的操作手册，工作台是 skill 的执行界面；改流程先改 skill，再改工作台字段，不要两边各改各的。
- 部署：Cloudflare Pages 免费版；统计：GA4 事件命名规范（game_start、game_over、share_click 等）+ 轻量本地统计 fallback。GD 平台上禁任何分析工具，该平台的构建须去掉 GA（见 M7 检查清单）。

### 6.4 下一步（按顺序）

1. 按 §5.3 最小 6 库先搭工作台第一版，不要一次上 9 个模块。
2. 把 `research-2026-11-23.md` 的前 5 选题导进 M1，打分、定 1 个主选 + 2 个备选。
3. 用第一款游戏走 §6.2 的 7 步跑通，跑通后再补 M5 独立 Bug 表、M8 复盘视图、M9 支出表。
4. 第一款游戏数据过关（CrazyGames Basic Launch 成功线或 Poki Player Fit 线）后再谈第二款换皮；没过关就 Kill 归档，不开第二款。

---

## 7. 未核实 / 查不到清单（提交前复核）

- CrazyGames 分成比例：官方不公布固定比例（查不到）；二级来源称 GameMaker jam 条款开发者得广告收入 60%、内购 70%，可选 2 个月独家 +50% 补偿，仅供参考，签约前以条款为准。
- CrazyGames Basic Launch 时长 7–21 天：官方文档现行口径（2026-11-23）；此前二级来源的 7–21 天说法与官方一致，已采信。
- Poki 起付门槛：官方未公布（查不到）；二级来源有称 €100 起付，未在本次打开的官方页核实，不采信。
- Poki 缩略图尺寸、初始下载 5MB/8MB、软发布细节：本次未直接打开官方 Requirements/Release 页核实，引用前以 developers.poki.com 为准。
- Poki 独占期 5 年 vs 7 年：来源冲突，以合同为准；本规划按官方 revenue-deal-types 页的 5 年（指示性）写。
- GameDistribution 官方条款/指南原文（static.gamedistribution.com PDF）本次未直接打开，33% 与 €100 以多家转述一致的条款 §3.1/§3.3 为准，签约前请直读 PDF 原文；GD 缩略图尺寸、描述字数、后台 Reports 指标、构建体积上限均查不到/未核实。
- itch.io 封面 630×500、HTML5 ZIP 上限、Collected 模式 $5 起付：为转述官方文档的二级来源口径，官方质量指南原文只确认了“须有封面”等定性要求。
- Voodoo 每年原型数 1,000 / 1,500 / 2,000 三种口径并存，取 1,000–1,500 为较稳区间；Voodoo 现行里程碑付款（$20k/$180k 为历史口径）是否仍有效：查不到。
- 各发行商现行 CPI 上限：查不到。
- 付费模板（Indie Game Dev OS、Asset Management System 等）内部字段只看了官方介绍页，未购买、未逐字段核实。
- CPI <$0.25–0.30、D1 ≥38%、APPU D7 >2000 秒是 Supersonic / GameDeveloper 文章里的超休闲发行经验阈值，不是通用标准。

---

## 来源总览

- 平台文档：CrazyGames https://docs.crazygames.com/ ；Poki https://developers.poki.com/guide/working-with-poki ；itch.io https://itch.io/docs/creators/quality-guidelines 、https://itch.io/docs/api/serverside ；GameDistribution（二级汇总 https://portalready.world/portals/gamedistribution/ ）
- 流水线：Voodoo 方法论 https://www.deconstructoroffun.com/blog/2025/06/02/how-voodoo-builds-hits-four-product-lessons-from-a-2000-prototypes-a-year-machine ；Go/Kill 框架 https://cmzsoft.com/en/insights/go-kill-framework-for-mobile-game-prototypes ；CrazyGames Basic Launch 指标 https://docs.crazygames.com/resources/basic-launch-metrics/ ；模板化 LiveOps https://balancy.co/blog/2026/05/08/how-to-use-templates-to-scale-your-game-business/
- 模板：Indie Game Dev Command Center — Lite https://www.notion.com/templates/indie-game-dev-command-center-lite ；Indie Game Dev OS https://notomantra.gumroad.com/l/game_dev_os ；NotoMantra 免费 GDD https://www.notomantra.com/free/game-design-document/ ；HacknPlan https://hacknplan.com ；Codecks https://codecks.io ；Trello Game Development https://trello.com/b/qbWcz9pj/game-development ；Venom Board https://venomboard.com/templates ；UGO https://www.mineogames.com/2025/05/14/UGO-PRESENTATION/
