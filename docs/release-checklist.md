# 发布检查清单（每次上线逐项打勾，不过不发）

版本规则：语义化 `主.次.修`（如 `0.1.0`）
- `0.1.0`：第一个可玩版本
- 修 Bug / 改数值：`0.1.1`、`0.1.2`……
- 加玩法 / 加关卡：`0.2.0`
- `1.0.0`：数据验证过、有人玩、分享率达标之后再给
- 每次上线：`config.js` 的 `version`、`VERSION` 文件、`CHANGELOG.md` 三处一起改，保持一致

## 上线前（本地）

- [ ] `config.js`：`slug` = 文件夹名；`title/description` 已改成真实文案（不是 Template）；`version` 已 bump；`analytics.gameSlug` = slug
- [ ] `style.css`：`:root` 颜色已换皮；手机 360px 宽下 HUD/按钮不溢出、不重叠
- [ ] `main.js`：`TODO-GAME-1`（规则）和 `TODO-GAME-2`（画面）都已改完，没有占位玩法残留
- [ ] 本地起服务验证（不要直接双击文件测，模块/路径行为会不一样）：
  ```bash
  cd games/<slug> && python3 -m http.server 8000
  # 打开 http://localhost:8000
  ```
- [ ] 引用路径：`analytics.js` 的引用在部署方式下能找到（见部署文档“引用路径”一节）
- [ ] 桌面 Chrome + 手机（或手机模式）各完整玩 3 局：开始、得分、暂停/恢复、结束、重开、分享按钮都有反应
- [ ] 无控制台报错（F12 Console 干净）；切后台再回来自动暂停，不会直接死掉
- [ ] 音效开关：开/关都正常，刷新后记住上次选择

## 上线当天（线上）

- [ ] 线上 URL 能打开（Pages 的 `pages.dev` 或主站 `/games/<slug>/`）
- [ ] 线上完整玩 2 局（桌面 1 局 + 手机 1 局）
- [ ] 本地 fallback 有事件：控制台执行 `MGAnalytics.dump()`，能看到 `game_start` / `game_over`
- [ ] GA4 实时里能看到 `game_start`，且 `game_slug` 正确（GA4 实时有延迟，等 10–30 分钟再看一次；完整报表延迟 24–48 小时是正常的）
- [ ] 分享出去的链接打开就是游戏页（不是 404、不是首页）
- [ ] 记下线上版本号 + 部署时间，写进 `games/<slug>/CHANGELOG.md`

## 上线后 7 天（数据复盘，决定做不做下一个）

- [ ] 开始率（`game_start` / 页面浏览）：太低先改开始屏文案和按钮
- [ ] 局均时长（`game_over` 的 `duration_sec` 平均）：目标 1–3 分钟
- [ ] 分享率（`share_click` / `game_over`）：>2% 值得继续推，<0.5% 先改分享
- [ ] 结论写进 `games/<slug>/README.md`：继续迭代 / 换皮复制 / 停掉，三个结论只选一个

## 回滚

- Pages：Deployments → 选上一版 → Rollback
- 主站 /games/：删掉 `public/games/<slug>/` → 重新部署主站
- 回滚后在 `CHANGELOG.md` 记一行：为什么回滚、回滚到哪个版本
