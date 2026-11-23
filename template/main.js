/* ============================================================================
 * MAIN — 游戏循环骨架（不要在这里发明新玩法）
 * ----------------------------------------------------------------------------
 * 状态机只有 4 个：menu → playing ⇄ paused → over → playing（重开）
 * 换皮时只改两处（都标了 TODO-GAME）：
 *   TODO-GAME-1  update() 里的玩法规则（移动、碰撞、得分条件）
 *   TODO-GAME-2  draw()   里的画面（先用 emoji/色块占位，后换贴图）
 * 其余部分（循环、分数、最佳分、暂停、重开、触摸、音效开关、统计）
 * 是所有游戏共用的，不要每个游戏重写。
 * ========================================================================== */
(function () {
  "use strict";

  var CFG = window.GAME_CONFIG || {};
  var Analytics = window.MGAnalytics || null;

  // --- DOM -----------------------------------------------------------------
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var el = function (id) { return document.getElementById(id); };
  var scoreEl = el("score"), bestEl = el("best"),
      finalScoreEl = el("final-score"), finalBestEl = el("final-best"),
      newBestEl = el("new-best"), overTitleEl = el("over-title");

  // 标题/版本/描述从 config 注入，index.html 里不用每个游戏手改
  if (CFG.title) { document.title = CFG.title; el("game-title").textContent = CFG.title; }
  if (CFG.description) el("game-desc").textContent = CFG.description;
  if (CFG.version) el("version").textContent = "v" + CFG.version;

  // --- 状态 -----------------------------------------------------------------
  var STATE = { MENU: "menu", PLAYING: "playing", PAUSED: "paused", OVER: "over" };
  var state = STATE.MENU;
  var score = 0;
  var bestKey = "mg_best_" + (CFG.slug || "template");
  var best = parseInt(localStorage.getItem(bestKey) || "0", 10) || 0;
  var soundOn = localStorage.getItem("mg_sound") !== "off";
  var startTime = 0;           // 本局开始时间戳（ms），用于算局时长
  var rafId = 0, lastTs = 0;

  // --- 占位玩法对象：换皮时删掉/替换成真实对象 -------------------------------
  // TODO-GAME-1：把 player/target 换成真实玩法对象（位置、速度、大小）。
  // 模板的占位规则只是为了验证循环/分数/结束能跑通：点中 ⭐ 得 1 分，
  // 30 秒内到目标分则胜利，否则点中 🪨 直接结束。不要把占位规则当游戏上线。
  var player = { x: 180, y: 460, r: 22 };
  var target = { x: 180, y: 120, r: 20, vx: 60 };
  var obstacle = { x: 90, y: 250, r: 18 };

  function resetGame() {
    score = 0;
    player.x = 180; player.y = 460;
    target.x = 180; target.y = 120;
    obstacle.x = 90; obstacle.y = 250;
    startTime = Date.now();
    renderScore();
  }

  function renderScore() {
    scoreEl.textContent = String(score);
    bestEl.textContent = String(best);
  }
  renderScore();

  // --- 音效占位：WebAudio 短 beep，不依赖任何音频文件 ------------------------
  // 真实音效到位后，把 beep() 换成 Audio 播放 assets/*.mp3，接口名不要变。
  var audioCtx = null;
  function beep(freq) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = freq || 440; o.type = "sine";
      g.gain.value = 0.08;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.08);
    } catch (e) { /* 无音频环境时静默失败，不影响游戏 */ }
  }
  function updateSoundBtn() { el("btn-sound").textContent = soundOn ? "🔊" : "🔇"; }
  updateSoundBtn();

  // --- 流程：开始 / 暂停 / 恢复 / 结束 / 重开 --------------------------------
  function showOnly(id) {
    ["screen-menu", "screen-pause", "screen-over"].forEach(function (s) {
      el(s).classList.toggle("hidden", s !== id);
    });
    if (!id) ["screen-menu", "screen-pause", "screen-over"].forEach(function (s) {
      el(s).classList.add("hidden");
    });
  }

  function startGame() {
    resetGame();
    state = STATE.PLAYING;
    showOnly(null);
    lastTs = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
    if (Analytics) Analytics.gameStart(CFG.slug);
  }

  function pauseGame() {
    if (state !== STATE.PLAYING) return;
    state = STATE.PAUSED;
    cancelAnimationFrame(rafId);
    showOnly("screen-pause");
    if (Analytics) Analytics.event("game_pause", { score: score });
  }

  function resumeGame() {
    if (state !== STATE.PAUSED) return;
    state = STATE.PLAYING;
    showOnly(null);
    lastTs = performance.now();
    rafId = requestAnimationFrame(loop);
    if (Analytics) Analytics.event("game_resume", { score: score });
  }

  function endGame(won) {
    state = STATE.OVER;
    cancelAnimationFrame(rafId);
    var durationSec = Math.round((Date.now() - startTime) / 1000);
    var isNewBest = score > best;
    if (isNewBest) { best = score; localStorage.setItem(bestKey, String(best)); }
    finalScoreEl.textContent = String(score);
    finalBestEl.textContent = String(best);
    newBestEl.classList.toggle("hidden", !isNewBest);
    overTitleEl.textContent = won ? "🎉 You win!" : "Game Over";
    renderScore();
    showOnly("screen-over");
    beep(won ? 880 : 220);
    if (Analytics) Analytics.gameOver(CFG.slug, score, best, durationSec, won);
  }

  // --- 主循环：固定结构，dt 限幅防切后台后跳变 -------------------------------
  function loop(ts) {
    if (state !== STATE.PLAYING) return;
    var dt = Math.min((ts - lastTs) / 1000, 0.05); // 最多 50ms/帧
    lastTs = ts;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  // TODO-GAME-1：玩法规则只改这里。模板占位：⭐ 左右移动，碰到玩家得 1 分；
  // 达到目标分胜利；碰到 🪨 结束。真实游戏把这三行换成自己的移动/碰撞/得分。
  function update(dt) {
    var speed = (CFG.difficulty && CFG.difficulty.startSpeed) || 120;
    speed += Math.floor(score / 10) * ((CFG.difficulty && CFG.difficulty.speedIncreasePer10Points) || 8);
    target.x += target.vx * dt * (speed / 120);
    if (target.x < 30 || target.x > 330) target.vx *= -1;
    // 简单距离碰撞（占位）
    if (dist(player, target) < player.r + target.r) {
      score += 1; beep(660); renderScore();
      target.x = 40 + Math.random() * 280; target.y = 60 + Math.random() * 200;
      if (Analytics) Analytics.event("score_milestone", { score: score });
      var targetScore = (CFG.difficulty && CFG.difficulty.targetScore) || 0;
      if (targetScore > 0 && score >= targetScore) { endGame(true); return; }
    }
    if (dist(player, obstacle) < player.r + obstacle.r) { endGame(false); return; }
    var limit = (CFG.difficulty && CFG.difficulty.timeLimitSeconds) || 0;
    if (limit > 0 && (Date.now() - startTime) / 1000 >= limit) { endGame(false); }
  }
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

  // TODO-GAME-2：画面只改这里。先用 emoji/色块占位，美术到位后换 drawImage。
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "40px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var s = (CFG.theme && CFG.theme.sprites) || {};
    ctx.fillText(s.target || "⭐", target.x, target.y);
    ctx.fillText(s.obstacle || "🪨", obstacle.x, obstacle.y);
    ctx.fillText(s.player || "🐐", player.x, player.y);
  }

  // --- 输入：指针事件统一处理鼠标 + 触摸，禁止双击缩放/页面滚动 ---------------
  // 模板占位：点哪玩家移到哪。真实游戏按需改：滑动方向 / 点击跳跃 / 拖拽。
  function onPointer(x, y) {
    if (state !== STATE.PLAYING) return;
    var rect = canvas.getBoundingClientRect();
    player.x = (x - rect.left) * (canvas.width / rect.width);
    player.y = (y - rect.top) * (canvas.height / rect.height);
  }
  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    onPointer(e.clientX, e.clientY);
  });
  canvas.addEventListener("pointermove", function (e) {
    if (e.buttons) onPointer(e.clientX, e.clientY); // 按住拖动才跟随
  });

  // --- 按钮与键盘 -------------------------------------------------------------
  el("btn-start").addEventListener("click", startGame);
  el("btn-restart").addEventListener("click", startGame);
  el("btn-restart-from-pause").addEventListener("click", startGame);
  el("btn-pause").addEventListener("click", function () {
    if (state === STATE.PLAYING) pauseGame(); else if (state === STATE.PAUSED) resumeGame();
  });
  el("btn-resume").addEventListener("click", resumeGame);
  el("btn-sound").addEventListener("click", function () {
    soundOn = !soundOn;
    localStorage.setItem("mg_sound", soundOn ? "on" : "off");
    updateSoundBtn(); beep(440);
  });
  el("btn-share").addEventListener("click", function () {
    var text = ((CFG.share && CFG.share.text) || "Can you beat my score?") + " I scored " + score + "!";
    var url = (CFG.share && CFG.share.url) || location.href;
    if (Analytics) Analytics.shareClick(CFG.slug, score);
    if (navigator.share) {
      navigator.share({ title: CFG.title || "Mini Game", text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + " " + url).then(function () {
        el("btn-share").textContent = "✓ Copied!";
        setTimeout(function () { el("btn-share").textContent = "↗ Share score"; }, 1500);
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.code === "KeyP" || e.code === "Escape") {
      if (state === STATE.PLAYING) pauseGame(); else if (state === STATE.PAUSED) resumeGame();
    }
    if (e.code === "Space" && state === STATE.MENU) { e.preventDefault(); startGame(); }
    if (e.code === "Enter" && state === STATE.OVER) startGame();
  });

  // 切后台自动暂停：避免玩家切走回来直接死掉，也避免 dt 跳变
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && state === STATE.PLAYING) pauseGame();
  });

  // 首屏画一次占位画面，让开始屏底下不是黑的
  draw();
})();
