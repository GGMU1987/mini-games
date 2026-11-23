# 小游戏副业 · 基建

只搭架子，不写第一款游戏本体。架子搭好后，一款游戏 = 复制模板 + 换皮 + 走清单上线，目标 2 周内跑通一款。

## 目录

```
mini-games/
  README.md                  # 本页
  template/                  # 可复用游戏模板（config.js / index.html / style.css / main.js）
    README.md                # 换皮 5 步
    assets/                  # 模板自带素材占位说明
  games/                     # 一款游戏一个文件夹；现在是空的，等选题定下再建
  assets/shared/             # 多游戏共用素材（通用音效/图标）
  analytics/
    analytics.js             # GA4 + 本地 fallback（localStorage），模板已接好
  docs/
    topic-research.md        # 选题玩法调研：填表 → 筛掉 2 个 → 留 1 个（半天封顶）
    workflow.md              # 开发运营流程：选题 → 换皮 → 自测 → 上线 → 分发 → 7 天复盘
    deployment-cloudflare-pages.md   # 方案 A：Pages 免费部署（先走这个）
    deployment-zodiac-games.md       # 方案 B：挂主站 zodiacportrait.com/games/（后走这个）
    analytics-ga4.md         # GA4 事件命名规范（game_start / game_over / share_click…）
    release-checklist.md     # 每次上线检查清单 + 版本规则
```

## 先后顺序（不要跳步）

1. **选题**：按 `docs/topic-research.md` 填表，定 1 款（半天）。定不下来默认先做“生肖合成”。
2. **换皮**：`cp -r template games/<slug>/`，按 `template/README.md` 的 5 步改。
3. **自测 + 上线**：按 `docs/release-checklist.md` 逐项过，先走方案 A（Pages `pages.dev`）上线。
4. **分发 + 复盘**：按 `docs/workflow.md` 上 itch/CrazyGames、发 1 条短视频；7 天后看数据，结论只选一个：迭代 / 复制 / 停掉。
5. **挂主站**：数据证明有人玩之后，再按 `docs/deployment-zodiac-games.md` 挂到 `zodiacportrait.com/games/`。

## 原则

- 零成本：不注册付费服务、不买域名、不投广告；Cloudflare Pages 免费版 + 已有 GA4。
- 无构建：纯静态 HTML/CSS/JS，不加框架、不加 npm，直接托管就能跑。
- 事件名不改：GA4 事件名定下来就冻结，改了历史数据就断了。
- 模板是源头：游戏在 `mini-games/` 开发测好，再发布；主站 `/games/` 那份只是发布副本。

## 当前状态（2026-11-23）

- [x] 模板、统计、部署文档、发布清单、选题表、流程文档已建好
- [x] 选题调研已完成：`research-2026-11-23.md`（首选生肖合成掉落，备选生肖方块消除；12 月 20 日前上线赶春节窗口）
- [ ] 第一款游戏未建（待从 `template/` 复制到 `games/zodiac-merge/`，按 `template/README.md` 换皮）
- [ ] 未部署、未注册、未花钱
