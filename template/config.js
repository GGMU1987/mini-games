/* ============================================================================
 * GAME CONFIG — 换皮只改这个文件 + style.css 的 :root 变量
 * ----------------------------------------------------------------------------
 * 复制模板到 games/<game-slug>/ 后，按顺序改：
 *   1. slug / title / description / theme（颜色、emoji/贴图）
 *   2. difficulty（速度、目标分、时长）
 *   3. mechanics 里的数值（不要改 main.js 的结构，只改数值）
 *   4. analytics.gameSlug 必须 = 文件夹名，否则 GA4 事件混在一起
 * 规则：不在这里放任何密钥、GA4 Measurement ID 以外的值；
 *       Measurement ID 从 zodiac 主站现有配置里抄，见 docs/analytics-ga4.md
 * ========================================================================== */
window.GAME_CONFIG = {
  // -- 身份：每次新游戏必改 -------------------------------------------------
  slug: "template",              // = games/<slug>/ 的文件夹名，必填，kebab-case
  title: "Template Game",        // 页面标题 + 分享文案标题
  description: "A tiny casual game. Replace this with your game in one line.",
  version: "0.1.0",              // 每次上线改：见 docs/release-checklist.md
  lang: "en",                    // en | zh-CN（首批海外站用 en）

  // -- 主题：换皮核心 -------------------------------------------------------
  theme: {
    // 颜色与 style.css :root 里的变量保持一致，二选一改一处即可，
    // 推荐只改 style.css，这里只留给 JS 画布用的颜色。
    bg: "#0f172a",
    accent: "#facc15",
    text: "#f8fafc",
    // 贴图/emoji：先用 emoji 占位，美术到位后换成 assets/ 下的文件路径。
    // 例如：sprites: { player: "assets/player.png", target: "assets/target.png" }
    sprites: {
      player: "🐐",
      target: "⭐",
      obstacle: "🪨",
    },
  },

  // -- 玩法数值：只改数值，不改 main.js 结构 -------------------------------
  difficulty: {
    startSpeed: 120,             // 像素/秒（模板占位逻辑用）
    speedIncreasePer10Points: 8, // 每得 10 分加多少速度
    targetScore: 30,             // 达到即“通关/胜利”？0 = 无尽模式
    timeLimitSeconds: 0,         // 0 = 不限时；>0 = 倒计时模式
  },

  // -- 统计：gameSlug 必须与 slug 一致 --------------------------------------
  analytics: {
    enabled: true,
    gaMeasurementId: "",         // 填主站同款 G-XXXXXXX，空 = 只走本地 fallback
    gameSlug: "template",
  },

  // -- 分享 -----------------------------------------------------------------
  share: {
    text: "Can you beat my score in Template Game?",
    // url 留空 = 自动取当前页 URL；上架 itch/CrazyGames 后填对应页面
    url: "",
  },
};
