(function () {
  // "Quote a 10x10" buttons pre-select the booth size in the form.
  document.querySelectorAll('[data-size]').forEach(function (link) {
    link.addEventListener('click', function () {
      var select = document.getElementById('q-size');
      if (select) select.value = link.getAttribute('data-size');
    });
  });

  // Copy email button
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy');
      var done = function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1800); };
      var fallback = function () {
        var range = document.createRange();
        range.selectNodeContents(document.getElementById('email-text'));
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        copyBtn.textContent = 'Selected';
      };
      try {
        navigator.clipboard.writeText(text).then(done, fallback);
      } catch (e) { fallback(); }
    });
  }

  // Quote form. Set data-endpoint="https://..." on the form to send submissions
  // to a form service. Without it, the form only validates and shows a notice.
  var form = document.getElementById('quote-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
        status.hidden = false;
        status.textContent = 'Add your name and a valid email so we can reply.';
        (name ? form.elements.email : form.elements.name).focus();
        return;
      }
      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) {
        status.hidden = false;
        status.textContent = 'This form is not connected yet, so nothing was sent. Please email hello@everspaceexhibits.com instead.';
        return;
      }
      status.hidden = false;
      status.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          status.textContent = 'Thanks, ' + name + '. We got your request and will be in touch soon.';
        })
        .catch(function () {
          status.textContent = 'Something went wrong sending the form. Please email hello@everspaceexhibits.com instead.';
        });
    });
  }
})();

// ---------- Chat assistant ----------
(function () {
  var root = document.getElementById('chat');
  if (!root) return;
  var launch = document.getElementById('chat-launch'), panel = document.getElementById('chat-panel');
  var log = document.getElementById('chat-log'), form = document.getElementById('chat-form'), input = document.getElementById('chat-text');
  var chips = document.getElementById('chat-chips'), handoff = document.getElementById('chat-handoff');
  var EMAIL = 'hello@everspaceexhibits.com';
  var KEY = 'everspace-chat';
  var GREETING = "Hi! I can answer questions about booth design, rentals, graphics and setup. What's your next show?";
  var history = [], busy = false, demo = false;

  try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-30))); } catch (e) {} }

  function bubble(cls, text) {
    var d = document.createElement('div'); d.className = 'msg ' + cls; d.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function render() {
    log.innerHTML = '';
    bubble('bot', GREETING);
    history.forEach(function (m) { bubble(m.role === 'user' ? 'me' : 'bot', m.content); });
    chips.hidden = history.length > 0;
  }
  function open() { panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); render(); input.focus(); }
  function close() { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); launch.focus(); }
  launch.addEventListener('click', open);
  document.getElementById('chat-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });

  // Offline/demo answers, used until the AI is connected on the server.
  function demoReply(q) {
    q = q.toLowerCase();
    if (/size|10x|20x|big|large|island/.test(q)) return 'We build 10×10 and 10×20 inline booths, 20×20 islands, and larger fully custom booths of any size. Want a quote for a specific size?';
    if (/rent/.test(q)) return 'Yes. We rent complete booths with your own printed graphics, so you get a custom look without buying or storing a booth.';
    if (/florida|travel|outside|anywhere|state|ship/.test(q)) return "We're Florida owned and operated, and we build, ship and install booths wherever your show is.";
    if (/price|cost|how much|budget/.test(q)) return 'Pricing depends on size, materials and the show. A team member will put together a free quote for you.';
    if (/design|3d/.test(q)) return 'We design every booth in 3D first, so you see exactly how it will look before anything is built.';
    return 'Good question. A team member can give you the best answer. Tap "Talk to a person" or use the free quote form.';
  }

  function ask(text) {
    if (busy || !text.trim()) return;
    busy = true; chips.hidden = true;
    history.push({ role: 'user', content: text.trim() }); save();
    bubble('me', text.trim());
    var t = bubble('bot typing', ''); t.innerHTML = '<span></span><span></span><span></span>';
    var done = function (reply) { t.remove(); history.push({ role: 'assistant', content: reply }); save(); bubble('bot', reply); busy = false; };
    if (demo) { setTimeout(function () { done(demoReply(text)); }, 500); return; }
    fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.reply) return done(res.j.reply);
        if (res.status === 429) return done('I\'m a bit busy right now. Please try again in a moment, or email ' + EMAIL + '.');
        throw new Error('unavailable');
      })
      .catch(function () {
        demo = true;
        bubble('note', 'Demo mode: the AI assistant isn\'t connected yet, so these are sample answers.');
        done(demoReply(text));
      });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  chips.addEventListener('click', function (e) { if (e.target.tagName === 'BUTTON') ask(e.target.textContent); });

  // Hand-off to a person
  function transcriptText() { return history.map(function (m) { return (m.role === 'user' ? 'Me: ' : 'Assistant: ') + m.content; }).join('\n'); }
  function fallbackToForm() {
    var d = bubble('bot', 'Our team isn\'t connected to chat yet. Email ' + EMAIL + ' or send the quote form and we\'ll get back to you.');
    var b = document.createElement('button'); b.type = 'button'; b.className = 'act'; b.textContent = 'Open the quote form →';
    b.addEventListener('click', function () {
      var notes = document.getElementById('q-notes');
      if (notes) { notes.value = (notes.value ? notes.value + '\n\n' : '') + 'From my chat:\n' + transcriptText(); close(); location.hash = 'quote'; }
      else { location.href = 'index.html#quote'; }
    });
    d.appendChild(document.createElement('br')); d.appendChild(b);
  }
  document.getElementById('chat-human').addEventListener('click', function () { handoff.hidden = false; form.hidden = true; document.getElementById('h-name').focus(); });
  document.getElementById('h-cancel').addEventListener('click', function () { handoff.hidden = true; form.hidden = false; });
  handoff.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('h-name').value.trim(), email = document.getElementById('h-email').value.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) { bubble('note', 'Add your name and a valid email.'); return; }
    var payload = { name: name, email: email, phone: document.getElementById('h-phone').value.trim(), messages: history };
    handoff.hidden = true; form.hidden = false;
    fetch('api/handoff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) {
        if (!r.ok) throw new Error();
        bubble('bot', 'Thanks, ' + name + '. We sent your chat to the team, and someone will reach out at ' + email + '.');
      })
      .catch(fallbackToForm);
  });
})();
