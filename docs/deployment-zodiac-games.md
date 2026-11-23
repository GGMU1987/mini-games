# 部署方案 B：挂到 zodiacportrait.com/games/（主站引流用）

目标：游戏住在主站域名下，`zodiacportrait.com/games/<slug>/`，给主站导流、共用主站 GA4 和品牌。**这是第二步，不是第一步**——先用方案 A（Pages）在 `pages.dev` 上把游戏跑通、数据跑出来，再挂主站。

## 前置条件（动手前先核对，不要假设）

- 主站仓库：`GGMU1987/shipwords-zodiac`（2026-11-16 已确认 GitHub App 已安装）
- 主站部署方式：Cloudflare Worker（2026-11-16/17 部署记录写的是 Worker，不是 Pages）
- 主站 GA4：已接入，事件体系见 `docs/analytics-ga4.md`（Measurement ID 从主站现有配置里抄，不要新申请、不要编一个）

> 如果上面三点有任何一项变了（换了仓库、换了部署方式），先更新本节再动手。不要凭记忆改主站。

## 推荐做法：主站加静态路由（不动主站业务代码）

1. 在主站仓库里新建静态目录放游戏，例如 `public/games/<slug>/`（具体目录名以主站现有静态资源目录为准，先读仓库再定）
2. 把 `games/<slug>/` 的四个文件 + `assets/` 原样拷进去；`analytics.js` 的引用按方案 A 的“引用路径”一节处理成相对路径
3. 确认 Worker 的路由/静态资源配置能透传 `/games/*`（只读配置，先看、后改；改动只加路由，不动生成/支付/登录相关代码）
4. 先部署到主站 staging（2026-11-17 已有 staging Worker 的验证流程），按 `release-checklist.md` 全项测一遍，确认：
   - 游戏能打开、能玩、分数/暂停/重开正常
   - 主站首页、生成、支付流程没被影响（只加页面，不改流程）
   - GA4 里出现 `game_start` 事件，且 `game_slug` = 新游戏 slug
5. 再上 production，验证 `https://zodiacportrait.com/games/<slug>/` 真实可玩

## 不推荐的做法

- 不要把游戏代码嵌进主站首页/生成页里：主站是 AI 头像产品，游戏是引流入口，混在一起主站出问题会连带游戏、游戏出问题会连带主站
- 不要为游戏单独再买域名：先用主站子路径，流量起来后再评估独立域名
- 不要在主站仓库里直接开发游戏：游戏在 `mini-games/` 仓库开发、测好，再拷一份到主站；`mini-games/` 永远是源头，主站那份是发布副本

## 两个方案怎么分工

| | 方案 A：Pages | 方案 B：主站 /games/ |
|---|---|---|
| 用途 | 快速验证、投 itch/CrazyGames 时给外链 | 主站引流、SEO、共用 GA4/品牌 |
| 域名 | `*.pages.dev`（免费） | `zodiacportrait.com/games/<slug>/` |
| 上线速度 | 拖文件几分钟 | 要过 staging，慢半天到一天 |
| 风险 | 几乎为零，不碰主站 | 改错会影响主站，必须走 staging |

顺序：A 先跑通 → 数据证明有人玩 → 再做 B。不要两个方案同时开工。

## 挂主站后的检查（上线当天）

- [ ] `zodiacportrait.com/games/<slug>/` 桌面 + 手机都能打开、能玩
- [ ] 主站首页、`/finder`、生成、支付入口都正常（抽查 3 个页面）
- [ ] GA4 实时里能看到 `game_start`（`game_slug` 正确）
- [ ] 首页/相关页面加了游戏入口链接（1 处即可，不要全站加）
- [ ] 回滚方案就绪：删掉 `/games/<slug>/` 目录 + 重新部署主站即可下线游戏
