# 部署方案 A：Cloudflare Pages（免费，首选）

目标：零成本、零构建、改完文件就能上线。模板是纯静态文件（HTML/CSS/JS），不需要 Node、不需要构建命令。

## 为什么选 Pages

- 免费版不用绑卡；静态托管 + 全球 CDN + 自动 HTTPS 都在免费额度内
- 每次 push / 拖文件都自动重新部署，自带预览链接，出问题可一键回滚到上一版
- 和 zodiac 主站同在 Cloudflare 账号下（主站已用 Cloudflare Worker 部署），域名/DNS 在同一处管

## 方案 A1：拖文件上线（最快，适合第一个游戏验证）

1. 打开 Cloudflare Dashboard → Workers & Pages → Create → Pages → **Upload assets**
2. 项目名：`mini-games`（以后所有游戏共用这一个项目，用文件夹区分）
3. 把 `mini-games/` 里要上线的游戏文件夹内容拖进去——**只拖游戏文件夹内的文件**，不是整个 `mini-games/`：
   - 例如上线 `games/zodiac-merge/` 时，拖 `index.html / config.js / style.css / main.js / assets/`
   - 注意：`analytics.js` 在模板里是 `../analytics/analytics.js` 引用，拖文件方式要先把它复制进游戏文件夹内、并把 `index.html` 里的引用改成 `analytics.js`（见下“引用路径”一节）
4. Deploy → 得到 `https://mini-games.pages.dev`，打开验证（按 `release-checklist.md` 测一遍）
5. 以后更新：同一项目 → Create deployment → 重新拖新版文件

## 方案 A2：连 GitHub 自动部署（推荐，第二个游戏起用）

1. 把 `mini-games/` 推到 GitHub（新建私有仓即可，如 `GGMU1987/mini-games`，不要和 zodiac 主站仓混在一起）
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → **Connect to Git**
3. 选仓、选分支 `main`；Build settings：
   - Framework preset：`None`
   - Build command：（留空）
   - Build output directory：`games/<当前主推游戏的 slug>` —— 每次换主推游戏改这里，或见“多游戏路由”一节
4. Save and Deploy。以后每次 `git push` 自动部署，`pages.dev` 域名不变

## 多游戏路由（一个项目、多个游戏）

- 结构：`games/zodiac-merge/`、`games/goat-jump/` 各自是独立可部署单元
- Pages 项目的输出目录一次只能指向一个文件夹，所以：
  - 验证期：一个项目只放当前主推的 1 个游戏（A1 拖文件最方便）
  - 稳定期：每个游戏建一个 Pages 项目（`zodiac-merge`、`goat-jump`……），或改用方案 B 挂到主站 `/games/<slug>/` 下统一路由
- 不要为了“一次部署全部游戏”去加构建脚本——那会把免费部署变复杂，违背本基建的原则

## 引用路径注意事项

- 模板默认引用 `../analytics/analytics.js`（仓库内开发时好用）
- **上线前必须处理二选一**：
  1. 把 `analytics/analytics.js` 复制到游戏文件夹内，`index.html` 改成 `<script src="analytics.js">`，或
  2. 部署整个 `mini-games/` 仓库、输出目录设为仓库根目录（URL 会变成 `/games/<slug>/`，适合方案 B）
- 上线检查清单里有一项专门核对这个，见 `release-checklist.md`

## 自定义域名（可选，不急）

- 验证期不用买域名，直接用 `*.pages.dev`
- 稳定期再考虑：Pages 项目 → Custom domains → 绑 `games.zodiacportrait.com` 或主站子路径（见 `deployment-zodiac-games.md`）
- 域名本身不是免费的；如果已有域名，绑定这一步不额外花钱

## 成本

- Cloudflare Pages 免费版：$0，不绑卡。免费额度以部署时 Dashboard 显示为准，验证期流量远到不了上限；如果某天提示超限，先看是哪个指标，再决定是拆项目还是升级，不要提前付费。

## 回滚

- Pages → 项目 → Deployments → 选上一版 → Rollback。每次上线前记下当前线上版本号（`config.js` 的 version），出问题先回滚再修，不要在线上直接改。
