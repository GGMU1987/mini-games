# Zodiac Merge — LOG

## 2026-11-23 Stage 2 原型首版（Antigravity）
- 从 `template/` 复制，结构不变，只改 config / style :root / main.js TODO-1/2。
- 玩法：Suika-like 掉落合成。13 档：鼠→牛→虎→兔→龙→蛇→马→羊→猴→鸡→狗→猪→火羊（终局）。
- 掉落球 tier 只随机 0–4（鼠/牛/虎/兔/龙），权重 35/25/18/14/8，避免开局出大球。
- 物理：手写圆形碰撞 + 重力 900px/s²，无外部引擎；合成每帧每对最多一次，合后立即 return 下帧继续。
- 溢出：球顶越过 y=90 危险线且基本停稳，累计 1.2 秒结束。
- 得分：合成得 (新档+1)×10 分；合出火羊即胜利 endGame(true)。
- 配色：春节红金（bg #5b0f0f / panel #7f1d1d / accent #fbbf24 / text #fef3c7）。
- 统计：沿用模板 Analytics 调用，gameSlug=zodiac-merge，GA ID 留空走本地 fallback。
- 不做的事：不接 CrazyGames/GD/Poki SDK，不做微信适配，不做关卡/皮肤商店。

## 2026-11-23 Codex 二棒（交接验证）
- 修 `dist()` 未被调用：main.js:201 改为 `dist(a, b)` 真实调用，仅 1 行，无行为变化；`node --check` main.js/config.js 均 OK；本地 http（8142 端口）四文件全 200；8137 端口首次 curl 全 404 系旧进程占端口所致，已换端口复测通过。未在真机点玩。
