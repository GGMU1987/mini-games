# HANDOFF — Zodiac Merge 原型首版（Stage 2，Antigravity）

## 目标
第一款生肖合成掉落可玩原型：点击/触摸掉落生肖球，相同合成升级，合出火羊胜利，堆满溢出结束。2026-12-20 前上线可玩版。

## 当前状态
原型首版已完成，未上架、未内测、未接任何平台 SDK。

## 改了哪些文件（只改这两处）
- `games/zodiac-merge/`：从 `template/` 全量复制；改 config.js（slug/title/红金主题/英文分享文案/gameSlug=zodiac-merge）、style.css（仅 :root 春节红金）、main.js（仅 TODO-1/2：13 档合成、重力+圆形碰撞、危险线溢出、掉落器输入）。main.js 353 行，状态机/暂停/重开/统计未动。
- `mini-games/AGENTS.md`（新建，28 行）：不变量——零成本、单 HTML、无构建、事件名冻结。
- 另有 `LOG.md` 记决策；index.html 未改（标题由 config 注入）。

## 验证（真实输出，2026-11-23）
- `node --check main.js && node --check config.js` → `main.js OK` / `config.js OK`，exit 0。
- `python3 -m http.server 8137` + curl：index.html / style.css / main.js / config.js / analytics/analytics.js 全部 `200`。
- `grep -c "emoji:" main.js` → `13`，顺序 🐀🐂🐅🐇🐉🐍🐴🐐🐒🐓🐕🐖🐏 正确。

## 已知问题
- 未在真机浏览器点玩过：物理手感（球滑/粘、合成连锁节奏）未调，需 Stage 3 内测反馈。
- GA Measurement ID 留空，只走本地 fallback；上架前从主站抄。
- `dist()` 辅助函数现未被调用，留作备用，无害。

## 下一步唯一动作
本地开服点玩一局（`python3 -m http.server` + 浏览器开 index.html），确认能掉落、能合成、能溢出结束，再进 Stage 3 内测。

## 待读文件（≤5）
1. `games/zodiac-merge/main.js` 2. `games/zodiac-merge/config.js` 3. `games/zodiac-merge/LOG.md` 4. `mini-games/AGENTS.md` 5. `mini-games/docs/release-checklist.md`

## 不要重做的事
不要重写状态机/暂停/统计；不要引入框架、构建、平台 SDK、微信适配；不要改工作台和其他游戏。

## HANDOFF（Codex）

## 目标
多 Agent 交接验证第二棒：冷启动只读指定文件，重跑验证，修 HANDOFF 首版提到的 `dist()` 未被调用这 1 个小 Bug，不加功能。

## 当前状态
已修完并验证通过。原型仍未上架、未内测、未接任何平台 SDK；未在真机浏览器点玩过。

## 改了哪个文件哪几行
- 只改 `games/zodiac-merge/main.js` 第 201 行，1 行：`var d = Math.sqrt(dx * dx + dy * dy) || 0.01;` → `var d = dist(a, b) || 0.01;`（update 碰撞循环内接上真实调用，dx/dy 仍保留供方向向量用，数学等价，无行为变化）。
- 未改 config.js，未改 template，未碰工作台和其他游戏。

## 验证命令 + 实际输出
- `node --check main.js && node --check config.js` → `main.js OK` / `config.js OK`，exit 0（改前改后各跑一次，均通过）。
- `grep -n "dist(" main.js` → 改前仅 255 行定义（`grep -c` 为 1）；改后 201 行调用 + 255 行定义。
- 本地 http：`python3 -m http.server 8141/8142` + curl → index.html / style.css / main.js / config.js 全部 `200`（改后 8142 复测亦全 200）。
- Mismatch（已报未猜改）：首次用 8137 端口跑 curl 四个文件全 `404`；查清是 8137 已被旧 python3 进程（pid 7817）占用、服务于别的目录，新服务因端口占用未能启动，并非代码缺文件（`ls` 确认四文件都在）。换 8141/8142 端口重跑即全 200。

## 已知问题
- 未在真机浏览器点玩过：物理手感（球滑/粘、合成连锁节奏）未调，需 Stage 3 内测反馈。
- GA Measurement ID 留空，只走本地 fallback；上架前从主站抄。
- 8137 端口仍被旧 python3 进程（pid 7817）占用，属遗留进程，未动它。

## 下一步唯一动作
本地开服点玩一局（`python3 -m http.server` 换一个空闲端口 + 浏览器开 index.html），确认能掉落、能合成、能溢出结束，再进 Stage 3 内测。

## 待读文件（≤5）
1. `games/zodiac-merge/main.js` 2. `games/zodiac-merge/config.js` 3. `games/zodiac-merge/LOG.md` 4. `mini-games/AGENTS.md` 5. `mini-games/docs/release-checklist.md`
