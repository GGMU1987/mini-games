# mini-games AGENTS — 不变量（只读规则，任何 agent 都遵守）

## 成本与技术栈
- 零成本：不用任何付费服务、付费 API、付费素材。
- 单 HTML 游戏：index.html + config.js + main.js + style.css，无框架。
- 无构建步骤：改完直接静态托管就能跑，不引入打包器、TS、npm。

## 代码纪律
- 状态机只有 menu → playing ⇄ paused → over，不发明新状态。
- 换皮只改 config.js + style.css :root + main.js 的 TODO-GAME-1/2。
- 不加登录、账号、服务器、3D、联机、支付、密钥。
- 不在代码里放任何密钥、token、真实 Measurement ID 以外的值。

## 数据与事件
- GA4 事件名冻结：game_start / game_over / score_milestone / game_pause /
  game_resume / share_click，全部带 game_slug。
- analytics.gameSlug 必须 = games/<slug>/ 文件夹名。
- 不收集任何个人信息；本地 fallback 只存事件，不存身份。

## 文件即真相
- workspace/mini-games/ 下的文件就是真源，汇报只写实际验证过的结果。
- 不编造数据、收入预测、平台分成；查不到就写“查不到”。
- 每款游戏一个文件夹 games/<slug>/，一个 LOG.md 记决策。

## 流程
- 一次只做一款原型；下一款等当前款上架 itch.io 后再开。
- 原型 1 天可玩：打开即玩、1 局 1–3 分钟、有分数/重开/分享。
- 上线前跑 release-checklist.md；7 天后只做 Go / Iterate / Kill 三选一。
