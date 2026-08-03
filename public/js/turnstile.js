// public/js/turnstile.js — Cloudflare Turnstile wrapper
// Implicit mode: script auto-renders <div class="cf-turnstile"> widgets

var DyTTurnstile = (function () {
  var SITE_KEY = '0x4AAAAAAD-ll4MBRA3lg5Bf';
  var _token = null;
  var _widgetIds = [];

  function onReady(token) {
    _token = token;
  }

  function getToken() {
    return _token;
  }

  function reset() {
    _token = null;
    if (window.turnstile) {
      _widgetIds.forEach(function (id) {
        try { turnstile.reset(id); } catch (e) {}
      });
    }
  }

  function renderAll() {
    if (!window.turnstile) return;
    var all = document.querySelectorAll('.cf-turnstile');
    if (all.length === 0) {
      _widgetIds = [];
      _token = null;
      return;
    }
    all.forEach(function (el) {
      if (el.getAttribute('data-rendered') === 'true') return;
      try {
        var id = turnstile.render(el, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: onReady
        });
        el.setAttribute('data-rendered', 'true');
        _widgetIds.push(id);
      } catch (e) {}
    });
  }

  return {
    getToken: getToken,
    reset: reset,
    renderAll: renderAll
  };
})();

window.DyTTurnstile = DyTTurnstile;
