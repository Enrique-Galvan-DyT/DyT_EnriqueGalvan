// controllers/chatController.js — Widget global del asistente IA (Groq vía API)
// Aparece en todas las páginas. Si la sesión está activa se envía el token JWT
// para que el asistente pueda responder con el contexto de recursos del usuario.

(function () {
  'use strict';

  var state = {
    enabled: false,
    open: false,
    busy: false,
    messages: []       // historial enviado al backend: [{ role, content }]
  };

  var MAX_HISTORY = 12;

  // ─────────────────────────────────────────
  //  DOM
  // ─────────────────────────────────────────

  var root, launcher, panel, messagesEl, chipsEl, inputEl, sendBtn, typingEl;

  function buildDOM() {
    root = document.createElement('div');
    root.id = 'chatWidget';
    root.innerHTML =
      '<button type="button" id="chatLauncher" class="chat-widget-launcher" aria-label="Abrir asistente">' +
        '<i class="ph-fill ph-chat-circle-dots"></i>' +
        '<i class="ph-fill ph-x chat-widget-launcher-close"></i>' +
      '</button>' +
      '<div id="chatPanel" class="chat-widget-panel" role="dialog" aria-label="Asistente DyT_EG">' +
        '<header class="chat-widget-header">' +
          '<div class="chat-widget-header-info">' +
            '<span class="chat-widget-avatar"><i class="ph-fill ph-sparkle"></i></span>' +
            '<div>' +
              '<div class="chat-widget-title">Asistente DyT_EG</div>' +
              '<div class="chat-widget-subtitle">En línea</div>' +
            '</div>' +
          '</div>' +
          '<button type="button" id="chatClose" class="chat-widget-close" aria-label="Cerrar asistente"><i class="ph ph-x"></i></button>' +
        '</header>' +
        '<div id="chatMessages" class="chat-widget-messages"></div>' +
        '<div id="chatChips" class="chat-widget-chips"></div>' +
        '<footer class="chat-widget-footer">' +
          '<textarea id="chatInput" class="chat-widget-input" rows="1" placeholder="Escribe tu mensaje…" maxlength="4000"></textarea>' +
          '<button type="button" id="chatSend" class="chat-widget-send" aria-label="Enviar mensaje"><i class="ph-fill ph-paper-plane-tilt"></i></button>' +
        '</footer>' +
      '</div>';
    document.body.appendChild(root);

    launcher = document.getElementById('chatLauncher');
    panel = document.getElementById('chatPanel');
    messagesEl = document.getElementById('chatMessages');
    chipsEl = document.getElementById('chatChips');
    inputEl = document.getElementById('chatInput');
    sendBtn = document.getElementById('chatSend');

    launcher.addEventListener('click', togglePanel);
    document.getElementById('chatClose').addEventListener('click', closePanel);
    sendBtn.addEventListener('click', onSend);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    });
    inputEl.addEventListener('input', autoGrowInput);

    document.addEventListener('auth:changed', updateChips);
  }

  function togglePanel() {
    if (state.open) closePanel();
    else openPanel();
  }

  function openPanel() {
    state.open = true;
    panel.classList.add('chat-widget-panel--open');
    launcher.classList.add('chat-widget-launcher--active');
    document.body.classList.add('chat-widget-body-open');
    setTimeout(function () {
      if (!state.messages.length) showWelcome();
      inputEl.focus();
    }, 60);
  }

  function closePanel() {
    state.open = false;
    panel.classList.remove('chat-widget-panel--open');
    launcher.classList.remove('chat-widget-launcher--active');
    document.body.classList.remove('chat-widget-body-open');
  }

  function autoGrowInput() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }

  // ─────────────────────────────────────────
  //  MENSAJES
  // ─────────────────────────────────────────

  function showWelcome() {
    var user = getLocalStorage('DyT_EG_user');
    var name = user && user.name ? user.name.split(' ')[0] : '';
    var greeting = '¡Hola' + (name ? ', ' + name : '') + '! Soy el asistente virtual de DyT_EG. ' +
      'Puedo ayudarte con información sobre nuestros servicios, planes y precios, la academia y el portafolio. ' +
      '¿En qué te ayudo?';
    addMessage('assistant', greeting);
    updateChips();
  }

  function addMessage(role, content) {
    state.messages.push({ role: role, content: content });
    if (state.messages.length > MAX_HISTORY) {
      state.messages.splice(0, state.messages.length - MAX_HISTORY);
    }
    renderMessage(role, content);
  }

  function renderMessage(role, content) {
    var bubble = document.createElement('div');
    bubble.className = 'chat-widget-msg chat-widget-msg--' + role;

    var avatar = document.createElement('span');
    avatar.className = 'chat-widget-msg-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="ph-fill ph-user"></i>' : '<i class="ph-fill ph-sparkle"></i>';

    var body = document.createElement('div');
    body.className = 'chat-widget-msg-body';
    if (role === 'user') {
      body.textContent = content;
    } else {
      body.innerHTML = renderMarkdown(content);
    }

    bubble.appendChild(avatar);
    bubble.appendChild(body);
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className = 'chat-widget-msg chat-widget-msg--assistant';
    typingEl.innerHTML =
      '<span class="chat-widget-msg-avatar"><i class="ph-fill ph-sparkle"></i></span>' +
      '<div class="chat-widget-msg-body chat-widget-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    typingEl = null;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ─────────────────────────────────────────
  //  ENVÍO
  // ─────────────────────────────────────────

  function onSend() {
    var text = inputEl.value.trim();
    if (!text || state.busy) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';

    addMessage('user', text);
    state.busy = true;
    sendBtn.disabled = true;
    showTyping();

    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;

    $.ajax({
      url: chatRoute,
      type: 'POST',
      contentType: 'application/json',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
      data: JSON.stringify({ messages: state.messages }),
      success: function (response) {
        hideTyping();
        var reply = (response && response.success && response.data && response.data.reply)
          ? response.data.reply
          : null;
        if (!reply) {
          reply = (response && response.message)
            ? response.message
            : 'No pude obtener una respuesta en este momento. Intenta más tarde.';
          addMessage('assistant', reply);
        } else {
          addMessage('assistant', reply);
        }
      },
      error: function () {
        hideTyping();
        addMessage('assistant', 'Hubo un problema de conexión con el asistente. Intenta de nuevo en unos momentos.');
      },
      complete: function () {
        state.busy = false;
        sendBtn.disabled = false;
        inputEl.focus();
      }
    });
  }

  // ─────────────────────────────────────────
  //  CHIPS DE PREGUNTAS RÁPIDAS
  // ─────────────────────────────────────────

  var baseChips = [
    { label: '¿Qué servicios ofrecen?', text: '¿Qué servicios ofrece DyT_EG?' },
    { label: 'Planes y precios', text: '¿Cuáles son los planes y precios?' },
    { label: 'Cursos de la academia', text: '¿Qué cursos y recursos tiene la academia?' },
    { label: 'Iniciar un proyecto', text: '¿Cómo inicio un proyecto con DyT_EG?' }
  ];

  function updateChips() {
    if (!chipsEl) return;
    chipsEl.innerHTML = '';

    var user = getLocalStorage('DyT_EG_user');
    var chips = baseChips.slice();
    if (user && user.token) {
      chips.push({ label: 'Mis recursos', text: '¿Qué recursos de la academia he comprado o tengo disponibles?' });
    }

    chips.forEach(function (chip) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-widget-chip';
      btn.textContent = chip.label;
      btn.addEventListener('click', function () {
        inputEl.value = chip.text;
        onSend();
      });
      chipsEl.appendChild(btn);
    });
  }

  // ─────────────────────────────────────────
  //  MARKDOWN LIGERO (solo para respuestas del asistente)
  // ─────────────────────────────────────────

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inlineFormat(t) {
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>');
    return t;
  }

  function renderMarkdown(md) {
    var lines = escapeHtml(md).split(/\r?\n/);
    var html = '';
    var inList = false;
    var listType = null;

    function closeList() {
      if (inList) {
        html += (listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
        listType = null;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/\s+$/, '');
      var m;
      if (!line.trim()) { closeList(); continue; }
      if ((m = line.match(/^###\s+(.*)$/))) { closeList(); html += '<h3>' + inlineFormat(m[1]) + '</h3>'; }
      else if ((m = line.match(/^#{1,2}\s+(.*)$/))) { closeList(); html += '<h4>' + inlineFormat(m[1]) + '</h4>'; }
      else if ((m = line.match(/^\-\s+(.*)$/))) {
        if (!inList) { inList = true; listType = 'ul'; html += '<ul>'; }
        html += '<li>' + inlineFormat(m[1]) + '</li>';
      }
      else if ((m = line.match(/^\d+\.\s+(.*)$/))) {
        if (!inList) { inList = true; listType = 'ol'; html += '<ol>'; }
        html += '<li>' + inlineFormat(m[1]) + '</li>';
      }
      else if ((m = line.match(/^>\s?(.*)$/))) { closeList(); html += '<blockquote>' + inlineFormat(m[1]) + '</blockquote>'; }
      else { closeList(); html += '<p>' + inlineFormat(line) + '</p>'; }
    }
    closeList();

    if (window.DOMPurify) {
      return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
    }

    // Fallback: si DOMPurify aún no cargó, se muestra el texto escapado sin formato.
    return '<p>' + escapeHtml(md).replace(/\n/g, '<br>') + '</p>';
  }

  // ─────────────────────────────────────────
  //  INIT
  // ─────────────────────────────────────────

  function init() {
    if (!window.jQuery || typeof chatConfigRoute === 'undefined') return;

    $.ajax({
      url: chatConfigRoute,
      type: 'GET',
      success: function (response) {
        if (response && response.success && response.data && response.data.enabled) {
          state.enabled = true;
          buildDOM();
        }
      },
      error: function () {
        // Si no se puede consultar la config, el widget permanece oculto.
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
