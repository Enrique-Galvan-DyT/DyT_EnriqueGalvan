// public/js/games.js
// Minijuego "13 Monedas" en el hero: cada moneda aparece una tras otra (1-3s
// de espera) y hay 1 segundo para clickearla. Clic en vacio = fallo inmediato.
// Al recolectar las 13 se cambia la foto de perfil + confeti. Sin persistencia.
(function() {
  var ALT_PROFILE = 'public/media/images/Me-alternative.jpg';
  var COIN_COUNT = 13;
  var COIN_WINDOW_MS = 1500;
  var GAP_MIN_MS = 1000;
  var GAP_MAX_MS = 3000;
  var COIN_RADIUS = 18;
  var HIT_RADIUS = COIN_RADIUS + 4;

  var altReady = false;
  (function preloadAlt() {
    var img = new Image();
    img.onload = function() { altReady = true; };
    img.src = ALT_PROFILE;
  })();

  function init() {
    var visual = document.querySelector('.hero-visual');
    var canvas = document.getElementById('heroCoinGame');
    var trigger = document.querySelector('.hero-card-dot:first-child');
    if (!visual || !canvas || !trigger) return;
    if (visual.__coinGameInit) return;
    visual.__coinGameInit = true;

    var resetDot = document.querySelector('.hero-card-dot:nth-child(3)');
    if (resetDot) {
      resetDot.addEventListener('click', function(e) {
        e.stopPropagation();
        var img = document.querySelector('.about-avatar img');
        if (img) img.src = 'public/media/images/Me-avatar.jpg';
      });
    }

    var ctx = canvas.getContext('2d');
    var game = null;
    var dpr = window.devicePixelRatio || 1;
    var W = 0;
    var H = 0;

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function placeCoin() {
      var margin = HIT_RADIUS;
      return {
        x: rand(margin, Math.max(margin + 1, W - margin)),
        y: rand(margin, Math.max(margin + 1, H - margin)),
        born: performance.now()
      };
    }

    function fit() {
      var rect = visual.getBoundingClientRect();
      W = rect.width || visual.clientWidth || 400;
      H = rect.height || visual.clientHeight || 400;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (game && game.phase === 'coin') game.coin = placeCoin();
    }

    function scheduleNext() {
      game.phase = 'gap';
      game.coin = null;
      game.nextAt = performance.now() + rand(GAP_MIN_MS, GAP_MAX_MS);
    }

    function resolveCoin(clicked) {
      if (clicked) game.collected++;
      game.index++;
      if (game.index >= COIN_COUNT) {
        finishRound(game.collected === COIN_COUNT);
      } else {
        scheduleNext();
      }
    }

    function finishRound(won) {
      game.done = true;
      endGame();
      if (won) unlock();
    }

    function endGame() {
      if (!game) return;
      game = null;
      visual.classList.remove('game-active');
      canvas.style.cursor = 'default';
    }

    function unlock() {
      confetti();
      if (altReady) {
        var img = document.querySelector('.about-avatar img');
        if (img) img.src = ALT_PROFILE;
      }
    }

    function startGame() {
      visual.classList.add('game-active');
      fit();
      game = {
        index: 0,
        collected: 0,
        coin: null,
        phase: 'gap',
        nextAt: 0,
        done: false
      };
      scheduleNext();
      requestAnimationFrame(loop);
    }

    function loop(now) {
      if (!game || game.done) return;
      draw(now);
      requestAnimationFrame(loop);
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);

      if (game.phase === 'coin' && game.coin) {
        var c = game.coin;
        var t = Math.min(1, (now - c.born) / COIN_WINDOW_MS);
        drawCoin(c.x, c.y, 1 - t * 0.45);
        ctx.beginPath();
        ctx.arc(c.x, c.y, HIT_RADIUS + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - t));
        ctx.strokeStyle = 'rgba(201,168,76,0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (now - c.born >= COIN_WINDOW_MS) resolveCoin(false);
      } else if (game.phase === 'gap' && now >= game.nextAt) {
        game.coin = placeCoin();
        game.phase = 'coin';
      }
    }

    function drawCoin(x, y, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      var g = ctx.createRadialGradient(x - 5, y - 6, 2, x, y, COIN_RADIUS);
      g.addColorStop(0, '#ffe08a');
      g.addColorStop(0.6, '#C9A84C');
      g.addColorStop(1, '#8a6f2b');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, COIN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5C574D';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, COIN_RADIUS * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    function localPos(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function hitsCoin(mx, my) {
      if (!game || game.phase !== 'coin' || !game.coin) return false;
      var c = game.coin;
      var dx = mx - c.x;
      var dy = my - c.y;
      return (dx * dx + dy * dy) <= (HIT_RADIUS * HIT_RADIUS);
    }

    function onMove(e) {
      var p = localPos(e);
      canvas.style.cursor = hitsCoin(p.x, p.y) ? 'pointer' : 'default';
    }

    function onClick(e) {
      if (!game || game.done) return;
      var p = localPos(e);
      if (hitsCoin(p.x, p.y)) {
        resolveCoin(true);
      } else {
        endGame();
      }
    }

    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      if (game && !game.done) return;
      startGame();
    });

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    window.addEventListener('resize', function() {
      if (game && !game.done) fit();
    });
  }

  document.addEventListener('auralis:section-loaded', function() { init(); });
  document.addEventListener('auralis:ready', function() { init(); });

  // Confetti
  function confetti() {
    var colors = ['#C9A84C', '#ffffff', '#f7df1e', '#ffd166', '#e8e8e8'];
    var c = document.createElement('canvas');
    c.className = 'confetti-canvas';
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = window.innerWidth;
    var h = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var parts = [];
    for (var i = 0; i < 140; i++) {
      parts.push({
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.3,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[(Math.random() * colors.length) | 0]
      });
    }

    var start = performance.now();
    var duration = 3000;
    var alive = true;

    function tick(now) {
      ctx.clearRect(0, 0, w, h);
      var t = (now - start) / duration;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - t * 1.2);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t < 1.1 && alive) {
        requestAnimationFrame(tick);
      } else if (c.parentNode) {
        c.parentNode.removeChild(c);
      }
    }
    requestAnimationFrame(tick);
  }
})();
