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

  // --- TODO-GAME-1：生肖合成玩法对象 ----------------------------------------
  // 12 生肖 + 火羊终局：鼠→牛→虎→兔→龙→蛇→马→羊→猴→鸡→狗→猪→火羊。
  // 掉落球在容器里受重力下落，相同两只碰到合成升级；合出火羊即胜利，
  // 球堆过危险线 1.2 秒即溢出结束。物理为轻量手写圆形碰撞，无外部引擎。
  var TIERS = [
    { emoji: "🐀", r: 14, color: "#94a3b8" },
    { emoji: "🐂", r: 18, color: "#d6d3d1" },
    { emoji: "🐅", r: 22, color: "#fb923c" },
    { emoji: "🐇", r: 26, color: "#fda4af" },
    { emoji: "🐉", r: 30, color: "#4ade80" },
    { emoji: "🐍", r: 34, color: "#a3e635" },
    { emoji: "🐴", r: 38, color: "#d97706" },
    { emoji: "🐐", r: 42, color: "#fef3c7" },
    { emoji: "🐒", r: 46, color: "#c084fc" },
    { emoji: "🐓", r: 50, color: "#f87171" },
    { emoji: "🐕", r: 54, color: "#fbbf24" },
    { emoji: "🐖", r: 58, color: "#f9a8d4" },
    { emoji: "🐏", r: 64, color: "#f59e0b" }, // 火羊：终局
  ];
  var FINAL_TIER = TIERS.length - 1;
  var DANGER_Y = 90;            // 危险线：球顶越过此线并停留即溢出
  var OVERFLOW_SECONDS = 1.2;
  var DROP_COOLDOWN = 0.6;      // 两次掉落间隔（秒）
  var GRAVITY = 900;            // 像素/秒²
  var balls = [];               // {x,y,vx,vy,r,tier,cool}
  var dropX = 180;              // 掉落器横坐标（跟随指针）
  var nextTier = 0;             // 下一个掉落球的 tier（0–4 随机）
  var dropTimer = 0;            // 掉落冷却倒计时
  var overflowTimer = 0;        // 越线累计时间

  function randNextTier() {
    var roll = Math.random();
    if (roll < 0.35) return 0;
    if (roll < 0.60) return 1;
    if (roll < 0.78) return 2;
    if (roll < 0.92) return 3;
    return 4;
  }

  function resetGame() {
    score = 0;
    balls = [];
    dropX = 180;
    nextTier = randNextTier();
    dropTimer = 0;
    overflowTimer = 0;
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

  // TODO-GAME-1：玩法规则只改这里。重力 + 圆形碰撞 + 同 tier 合成升级。
  function update(dt) {
    if (dropTimer > 0) dropTimer -= dt;
    var i, j, a, b;
    // 1) 重力 + 移动 + 墙/底碰撞
    for (i = 0; i < balls.length; i++) {
      a = balls[i];
      if (a.cool > 0) a.cool -= dt;
      a.vy += GRAVITY * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      if (a.x - a.r < 0) { a.x = a.r; a.vx = Math.abs(a.vx) * 0.4; }
      if (a.x + a.r > 360) { a.x = 360 - a.r; a.vx = -Math.abs(a.vx) * 0.4; }
      if (a.y + a.r > 540) {
        a.y = 540 - a.r;
        a.vy = -Math.abs(a.vy) * 0.25;
        if (Math.abs(a.vy) < 30) a.vy = 0;
        a.vx *= 0.98;
      }
    }
    // 2) 两两碰撞：重叠推开 + 同 tier 合成（每帧每对最多合一次）
    for (i = 0; i < balls.length; i++) {
      for (j = i + 1; j < balls.length; j++) {
        a = balls[i]; b = balls[j];
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = dist(a, b) || 0.01;
        var minD = a.r + b.r;
        if (d < minD) {
          if (a.tier === b.tier && a.tier < FINAL_TIER && a.cool <= 0 && b.cool <= 0) {
            mergeBalls(i, j);
            return; // 合成后数组已变，本帧到此为止，下帧继续
          }
          var overlap = (minD - d) / 2;
          var nx = dx / d, ny = dy / d;
          a.x -= nx * overlap; a.y -= ny * overlap;
          b.x += nx * overlap; b.y += ny * overlap;
          var push = 30;
          a.vx -= nx * push * dt; a.vy -= ny * push * dt;
          b.vx += nx * push * dt; b.vy += ny * push * dt;
        }
      }
    }
    // 3) 溢出判定：有球顶越过危险线且基本停稳，累计 1.2 秒即结束
    var overLine = false;
    for (i = 0; i < balls.length; i++) {
      a = balls[i];
      if (a.y - a.r < DANGER_Y && Math.abs(a.vy) < 60 && Math.abs(a.vx) < 60) { overLine = true; break; }
    }
    if (overLine) {
      overflowTimer += dt;
      if (overflowTimer >= OVERFLOW_SECONDS) { endGame(false); return; }
    } else {
      overflowTimer = 0;
    }
  }

  function mergeBalls(i, j) {
    var a = balls[i], b = balls[j];
    var newTier = a.tier + 1;
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    balls.splice(Math.max(i, j), 1);
    balls.splice(Math.min(i, j), 1);
    balls.push({ x: mx, y: my, vx: 0, vy: -40, r: TIERS[newTier].r, tier: newTier, cool: 0.25 });
    score += (newTier + 1) * 10;
    beep(520 + newTier * 40);
    renderScore();
    if (Analytics) Analytics.event("score_milestone", { score: score });
    if (newTier >= FINAL_TIER) { endGame(true); }
  }

  function dropBall() {
    if (state !== STATE.PLAYING || dropTimer > 0) return;
    var t = TIERS[nextTier];
    balls.push({ x: dropX, y: 50, vx: 0, vy: 60, r: t.r, tier: nextTier, cool: 0.1 });
    beep(440);
    nextTier = randNextTier();
    dropTimer = DROP_COOLDOWN;
  }

  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

  // TODO-GAME-2：画面只改这里。球 = 彩色圆 + 生肖 emoji，美术到位后换 drawImage。
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var i, t;
    // 危险线
    ctx.strokeStyle = overflowTimer > 0 ? "#ef4444" : "rgba(251,191,36,0.5)";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, DANGER_Y); ctx.lineTo(360, DANGER_Y); ctx.stroke();
    ctx.setLineDash([]);
    // 掉落器：虚线引导 + 下一个球预览
    if (state === STATE.PLAYING || state === STATE.MENU) {
      t = TIERS[nextTier];
      ctx.strokeStyle = "rgba(254,243,199,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(dropX, 70); ctx.lineTo(dropX, 520); ctx.stroke();
      ctx.fillStyle = t.color;
      ctx.beginPath(); ctx.arc(dropX, 50, t.r, 0, Math.PI * 2); ctx.fill();
      ctx.font = Math.round(t.r * 1.2) + "px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(t.emoji, dropX, 52);
    }
    // 球
    for (i = 0; i < balls.length; i++) {
      var b = balls[i];
      t = TIERS[b.tier];
      ctx.fillStyle = t.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = b.tier >= FINAL_TIER ? "#fbbf24" : "rgba(0,0,0,0.25)";
      ctx.stroke();
      ctx.font = Math.round(b.r * 1.15) + "px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(t.emoji, b.x, b.y + 1);
    }
  }

  // --- 输入：指针事件统一处理鼠标 + 触摸，禁止双击缩放/页面滚动 ---------------
  // 移动指针 = 移动掉落器；按下 = 在该位置掉落一个生肖球。
  function onPointer(x, y) {
    if (state !== STATE.PLAYING) return;
    var rect = canvas.getBoundingClientRect();
    var cx = (x - rect.left) * (canvas.width / rect.width);
    dropX = Math.max(20, Math.min(340, cx));
  }
  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    onPointer(e.clientX, e.clientY);
    dropBall();
  });
  canvas.addEventListener("pointermove", function (e) {
    onPointer(e.clientX, e.clientY); // 悬停即跟随，不用按住
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
