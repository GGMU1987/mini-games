# 数据统计：GA4 事件命名规范 + 本地 fallback

原则：**事件名一旦定下来就不要改**，改了历史数据就断了；新游戏只加参数、不加新事件名，除非下面“新增事件”流程走完。

## 前置：Measurement ID 从哪里来

- 用 zodiac 主站**现有的** GA4 Measurement ID（`G-XXXXXXX`），从主站代码/配置里抄
- 不要新申请、不要编一个、不要把 ID 写进公开文档；只填进各游戏的 `config.js`（`analytics.gaMeasurementId`）
- 挂在 `pages.dev` 上时也要填同一个 ID，这样主站和游戏的数据进同一个 GA4 资产、能按 `game_slug` 拆开看
- 上架 itch/CrazyGames 时，平台沙箱可能拦 gtag——这时只走本地 fallback，不强行绕过

## gtag 加载（宿主页面负责，analytics.js 不自动加载）

在游戏 `index.html` 的 `<head>` 里加（ID 换成真实的）：

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

`analytics.js` 只负责调 `gtag('event', ...)`，不加载 gtag.js——避免每个游戏重复加载、也避免在平台沙箱里被挡。

## 事件表（全部事件，game_slug 必带）

| 事件名 | 什么时候发 | 参数 | 用来看什么 |
|---|---|---|---|
| `game_start` | 点 Start / 每次重开 | `game_slug, game_version` | 有多少人真的开始玩（不是只打开页面） |
| `game_over` | 一局结束（胜利也算） | `game_slug, score, best_score, duration_sec, won` | 平均分、平均局时长、胜率 |
| `score_milestone` | 得分到 10/20/30……的倍数时（模板是每得 1 分都发，占位逻辑，上线前改成每 10 分发一次） | `game_slug, score` | 玩家能走多远、在哪流失 |
| `game_pause` | 点暂停 / 切后台自动暂停 | `game_slug, score` | 暂停率（太高 = 太难或被打断） |
| `game_resume` | 点继续 | `game_slug, score` | 暂停后回来的比例 |
| `share_click` | 点分享按钮 | `game_slug, score` | 分享意愿（最重要的传播指标） |

不要发的：`page_view`（GA4 自动有）、`click`（太泛）、含个人信息的任何参数（不发 IP、设备 ID、用户名）。

## 关键指标怎么算（GA4 里）

- 开始率 = `game_start` / 页面浏览（打开了但没点 Start 的人多 = 开始屏文案/按钮有问题）
- 局均时长 = `game_over` 的 `duration_sec` 平均值（目标：1–3 分钟；太短 = 太难/太无聊，太长 = 一局拖沓）
- 分享率 = `share_click` / `game_over`（>2% 值得继续推；<0.5% 先改分享文案/位置）
- 次日回访：看 `game_start` 的回访用户数，不单独埋事件

## 本地 fallback（GA4 没接好时不丢数）

- 实现：`analytics/analytics.js`，每次发事件都先写 `localStorage["mg_events"]`（最多 200 条，超了丢最旧的）
- 自查：浏览器控制台执行 `MGAnalytics.dump()`，看本地存了哪些事件；清空用 `MGAnalytics.clearLocal()`
- 用途：上线当天先在本地核对 fallback 有事件，再去 GA4 实时里核对；GA4 有 24–48 小时延迟是正常的，实时看不到先看本地
- 注意：fallback 是本机数据，只能证明“事件发出来了”，不能当流量数据；流量判断永远以 GA4 为准

## 新增事件流程（不要随手加）

1. 先问：现有 6 个事件能不能回答这个问题？能就别加
2. 不能，加之前写进上表：事件名（小写+下划线）、触发时机、参数、看什么指标
3. 同步改 `analytics.js` 和模板 `main.js`，并在 `CHANGELOG.md` 记一行
4. 上线当天本地 + GA4 实时双重核对
