# 游戏模板（template）

可复用的单游戏骨架。**不是一款游戏**——占位玩法（点 ⭐ 得分、碰 🪨 结束）只用来验证循环能跑通，上线前必须换成真实玩法。

## 文件

| 文件 | 改不改 | 说明 |
|---|---|---|
| `config.js` | 每次必改 | 标题、主题、难度、分享文案、GA4 ID |
| `style.css` | 换皮改 `:root` | 颜色变量；结构/类名不要动 |
| `index.html` | 很少改 | 只改 `<title>`/描述（已由 config 注入标题，可不动） |
| `main.js` | 只改 2 处 TODO | `TODO-GAME-1` 玩法规则、`TODO-GAME-2` 画面 |
| `assets/` | 按需加 | 贴图/音效，先用 emoji/蜂鸣占位也行 |

引用链：`index.html` → `config.js` → `../analytics/analytics.js` → `main.js`，无构建、无 npm、无框架，双击就能跑。

## 换皮 5 步（复制 → 改配置 → 改玩法 → 测 → 上线）

```bash
# 1. 复制模板（slug 用 kebab-case，如 zodiac-merge）
cp -r template games/zodiac-merge
cd games/zodiac-merge

# 2. 改 config.js：slug、title、description、version、theme.sprites、difficulty
#    注意：analytics.gameSlug 必须 = 文件夹名，否则 GA4 事件混在一起

# 3. 改 style.css :root：--bg / --accent / --text / --panel

# 4. 改 main.js：只改 TODO-GAME-1（规则）和 TODO-GAME-2（画面）
#    不要动状态机、循环、分数、暂停、重开、统计的调用

# 5. 本地测：python3 -m http.server 8000，打开 http://localhost:8000
#    按 docs/release-checklist.md 逐项过，再提交上线
```

## 模板已包含（不用重写）

- 状态机：menu → playing ⇄ paused → over → playing（重开）
- 主循环：`requestAnimationFrame`，dt 限幅 50ms，切后台自动暂停
- 分数 + 最佳分（`localStorage mg_best_<slug>`，按游戏隔离）
- 暂停：按钮 / `P` / `Esc`；重开：按钮 / `Enter`
- 移动端：`pointerdown/move` 统一鼠标+触摸，`touch-action: none` 防页面滚动，按钮 ≥44px
- 音效开关：WebAudio 蜂鸣占位，开关持久化（`mg_sound`）；真实音效到位后只换 `beep()` 内部实现
- 统计：`game_start / game_over / share_click` 已接好，见 `docs/analytics-ga4.md`
- 分享：优先 `navigator.share`，不支持则复制文案+链接到剪贴板

## 换皮时不要做的事

- 不要改事件名（GA4 命名见 `docs/analytics-ga4.md`，改了历史数据就断了）
- 不要在 `config.js` / 代码里放密钥、密码、真实 GA4 以外的 ID
- 不要加框架/构建步骤——保持“静态文件直接托管”，否则 Cloudflare Pages 免费部署和 itch 单文件包都会变复杂
- 不要把占位玩法当游戏上线：`TODO-GAME-1/2` 没改完 = 没做完
