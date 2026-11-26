/* ============================================================================
 * MGAnalytics — GA4 + 本地 fallback，二选一都不丢数
 * ----------------------------------------------------------------------------
 * 用法（main.js 已接好，新游戏不用再写）：
 *   MGAnalytics.gameStart(slug)
 *   MGAnalytics.gameOver(slug, score, best, durationSec, won)
 *   MGAnalytics.shareClick(slug, score)
 *   MGAnalytics.event("game_pause", { score })   // 其他事件见 docs/analytics-ga4.md
 *
 * 行为：
 *   1. 有 gtag + Measurement ID → 发 GA4（事件名/参数按 docs/analytics-ga4.md）
 *   2. 无论如何都写本地 fallback：localStorage["mg_events"]，最多存 200 条，
 *      供 GA4 没接好 / 被广告拦截时，本地打开控制台核对：
 *        JSON.parse(localStorage.getItem("mg_events"))
 *   3. 不收集任何个人信息：只有 slug / score / 时长 / 时间戳，不含 IP、ID、UA。
 * 注意：template/index.html 用 <script src="../analytics/analytics.js"> 引用；
 *       上架 itch/CrazyGames 的单文件包时，把本文件内联进 index.html 再提交。
 * ========================================================================== */
(function () {
  "use strict";

  var LS_KEY = "mg_events";
  var MAX_LOCAL = 200;

  function getConfig() { return window.GAME_CONFIG || {}; }
  function getMeasurementId() {
    var a = getConfig().analytics || {};
    return a.gaMeasurementId || "";
  }

  function localSave(evt) {
    try {
      var list = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      if (!Array.isArray(list)) list = [];
      list.push(evt);
      if (list.length > MAX_LOCAL) list = list.slice(-MAX_LOCAL);
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch (e) { /* 隐私模式 localStorage 不可用时静默丢弃 */ }
  }

  function send(name, params) {
    var cfg = getConfig();
    var evt = {
      name: name,
      game_slug: (cfg.analytics && cfg.analytics.gameSlug) || cfg.slug || "unknown",
      game_version: cfg.version || "",
      ts: new Date().toISOString(),
    };
    if (params) for (var k in params) evt[k] = params[k];
    localSave(evt); // 永远先落本地
    try {
      if (typeof window.gtag === "function" && getMeasurementId()) {
        window.gtag("event", name, evt);
      }
    } catch (e) { /* gtag 失败不影响游戏 */ }
  }

  window.MGAnalytics = {
    event: send,
    gameStart: function (slug) { send("game_start", { game_slug: slug }); },
    gameOver: function (slug, score, best, durationSec, won) {
      send("game_over", {
        game_slug: slug, score: score, best_score: best,
        duration_sec: durationSec, won: !!won,
      });
    },
    shareClick: function (slug, score) { send("share_click", { game_slug: slug, score: score }); },
    // 自查用：在浏览器控制台执行 MGAnalytics.dump() 看本地存了哪些事件
    dump: function () {
      try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
      catch (e) { return []; }
    },
    clearLocal: function () { try { localStorage.removeItem(LS_KEY); } catch (e) {} },
  };

  // GA4 的 gtag.js 由宿主页面加载（见 docs/analytics-ga4.md），这里不自动加载，
  // 避免每个游戏重复加载、也避免在 itch 沙箱里因跨域被挡。
})();
