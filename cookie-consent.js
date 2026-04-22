/* ========================================
   DSGVO Cookie Consent – Minimal Banner
   Stripe/Linear-inspired, non-intrusive
   ======================================== */
(function() {
  'use strict';

  var CATEGORIES = {
    necessary: {
      label: 'Notwendig',
      desc: 'Technisch erforderlich für Grundfunktionen der Website.',
      locked: true
    },
    statistics: {
      label: 'Statistik',
      desc: 'Helfen uns zu verstehen, wie Besucher die Website nutzen (z.\u00A0B. Google Analytics).',
      locked: false
    },
    marketing: {
      label: 'Marketing',
      desc: 'Für eingebettete Inhalte und relevante Werbung (z.\u00A0B. YouTube-Videos).',
      locked: false
    }
  };

  var COOKIE_NAME = 'cookie_consent';
  var COOKIE_DAYS = 365;

  /* ─── Cookie helpers ─── */
  function getConsent() {
    var m = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(m[2])); } catch(e) { return null; }
  }

  function setConsent(c) {
    var exp = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString();
    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(JSON.stringify(c))
      + ';expires=' + exp + ';path=/;SameSite=Lax';
  }

  /* ─── Activate blocked content ─── */
  function activateCategory(cat) {
    document.querySelectorAll('script[data-consent="' + cat + '"]').forEach(function(el) {
      var s = document.createElement('script');
      if (el.src) s.src = el.src; else s.textContent = el.textContent;
      el.parentNode.replaceChild(s, el);
    });
    document.querySelectorAll('[data-consent-src][data-consent="' + cat + '"]').forEach(function(el) {
      el.src = el.getAttribute('data-consent-src');
      el.removeAttribute('data-consent-src');
    });
  }

  function activateAll(consent) {
    Object.keys(consent).forEach(function(k) { if (consent[k]) activateCategory(k); });
  }

  /* ─── Close / remove ─── */
  function closeBanner() {
    var b = document.getElementById('cookieBanner');
    if (b) { b.classList.add('cb-hide'); setTimeout(function() { b.remove(); }, 300); }
  }

  function closeSettings() {
    var m = document.getElementById('cbSettingsModal');
    var o = document.getElementById('cbSettingsOverlay');
    if (m) { m.classList.add('cb-modal-hide'); setTimeout(function() { m.remove(); }, 250); }
    if (o) { o.classList.add('cb-overlay-hide'); setTimeout(function() { o.remove(); }, 250); }
  }

  /* ─── Save consent helper ─── */
  function saveAndClose(consent) {
    setConsent(consent);
    activateAll(consent);
    closeBanner();
    closeSettings();
  }

  /* ─── Build the small bottom banner ─── */
  function createBanner() {
    if (document.getElementById('cookieBanner')) return;

    var el = document.createElement('div');
    el.id = 'cookieBanner';
    el.innerHTML = ''
      + '<div class="cb-inner">'
      + '  <p class="cb-msg">Wir nutzen Cookies, um dir die bestmögliche Erfahrung zu bieten. '
      + '    <a href="rechtliches.html#datenschutz">Mehr erfahren</a>'
      + '  </p>'
      + '  <div class="cb-actions">'
      + '    <button class="cb-btn cb-ghost" id="cbReject">Ablehnen</button>'
      + '    <button class="cb-btn cb-outline" id="cbSettings">Einstellungen</button>'
      + '    <button class="cb-btn cb-primary" id="cbAccept">Alle akzeptieren</button>'
      + '  </div>'
      + '</div>';

    document.body.appendChild(el);

    // Force reflow for animation
    el.offsetHeight;
    el.classList.add('cb-show');

    document.getElementById('cbAccept').addEventListener('click', function() {
      var c = {}; Object.keys(CATEGORIES).forEach(function(k) { c[k] = true; });
      saveAndClose(c);
    });

    document.getElementById('cbReject').addEventListener('click', function() {
      var c = {}; Object.keys(CATEGORIES).forEach(function(k) { c[k] = !!CATEGORIES[k].locked; });
      saveAndClose(c);
    });

    document.getElementById('cbSettings').addEventListener('click', function() {
      openSettingsModal();
    });
  }

  /* ─── Settings modal (opens on "Einstellungen") ─── */
  function openSettingsModal() {
    if (document.getElementById('cbSettingsModal')) return;

    // Light overlay (not blocking, just dimming slightly)
    var overlay = document.createElement('div');
    overlay.id = 'cbSettingsOverlay';
    document.body.appendChild(overlay);
    overlay.offsetHeight;
    overlay.classList.add('cb-overlay-show');

    var modal = document.createElement('div');
    modal.id = 'cbSettingsModal';
    modal.innerHTML = ''
      + '<div class="cb-modal-header">'
      + '  <h3>Cookie-Einstellungen</h3>'
      + '  <button class="cb-modal-close" id="cbModalClose" aria-label="Schließen">'
      + '    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      + '  </button>'
      + '</div>'
      + '<div class="cb-modal-body" id="cbModalBody"></div>'
      + '<div class="cb-modal-footer">'
      + '  <button class="cb-btn cb-ghost" id="cbModalReject">Alle ablehnen</button>'
      + '  <button class="cb-btn cb-outline" id="cbModalSave">Auswahl speichern</button>'
      + '  <button class="cb-btn cb-primary" id="cbModalAccept">Alle akzeptieren</button>'
      + '</div>';

    document.body.appendChild(modal);
    modal.offsetHeight;
    modal.classList.add('cb-modal-show');

    // Build category rows
    var body = document.getElementById('cbModalBody');
    var existing = getConsent();

    Object.keys(CATEGORIES).forEach(function(key) {
      var cat = CATEGORIES[key];
      var checked = cat.locked || (existing && existing[key]);
      var row = document.createElement('label');
      row.className = 'cb-cat';
      row.innerHTML = ''
        + '<div class="cb-cat-text">'
        + '  <span class="cb-cat-name">' + cat.label + (cat.locked ? ' <span class="cb-cat-badge">Immer aktiv</span>' : '') + '</span>'
        + '  <span class="cb-cat-desc">' + cat.desc + '</span>'
        + '</div>'
        + '<div class="cb-toggle">'
        + '  <input type="checkbox" id="cb_' + key + '" ' + (checked ? 'checked' : '') + (cat.locked ? ' disabled' : '') + '>'
        + '  <span class="cb-sw"></span>'
        + '</div>';
      body.appendChild(row);
    });

    // Handlers
    document.getElementById('cbModalClose').addEventListener('click', closeSettings);
    overlay.addEventListener('click', closeSettings);

    document.getElementById('cbModalAccept').addEventListener('click', function() {
      var c = {}; Object.keys(CATEGORIES).forEach(function(k) { c[k] = true; });
      saveAndClose(c);
    });

    document.getElementById('cbModalReject').addEventListener('click', function() {
      var c = {}; Object.keys(CATEGORIES).forEach(function(k) { c[k] = !!CATEGORIES[k].locked; });
      saveAndClose(c);
    });

    document.getElementById('cbModalSave').addEventListener('click', function() {
      var c = {};
      Object.keys(CATEGORIES).forEach(function(k) {
        var cb = document.getElementById('cb_' + k);
        c[k] = cb ? cb.checked : false;
      });
      saveAndClose(c);
    });
  }

  /* ─── Styles ─── */
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = ''

    /* ── Banner (small, bottom, centered) ── */
    + '#cookieBanner {'
    + '  position:fixed; bottom:20px; left:50%; transform:translateX(-50%) translateY(20px);'
    + '  z-index:99999; width:calc(100% - 32px); max-width:740px;'
    + '  background:rgba(17,24,39,0.95); backdrop-filter:blur(12px);'
    + '  border:1px solid rgba(255,255,255,0.08); border-radius:16px;'
    + '  box-shadow:0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1);'
    + '  padding:18px 22px; font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif;'
    + '  opacity:0; transition:opacity 0.35s ease, transform 0.35s ease;'
    + '}'
    + '#cookieBanner.cb-show { opacity:1; transform:translateX(-50%) translateY(0); }'
    + '#cookieBanner.cb-hide { opacity:0; transform:translateX(-50%) translateY(20px); }'

    + '.cb-inner { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }'
    + '.cb-msg { flex:1; min-width:200px; font-size:0.85rem; color:rgba(255,255,255,0.8); line-height:1.5; margin:0; }'
    + '.cb-msg a { color:#34A853; text-decoration:underline; text-underline-offset:2px; }'
    + '.cb-actions { display:flex; gap:8px; flex-shrink:0; }'

    /* ── Buttons ── */
    + '.cb-btn {'
    + '  padding:9px 18px; border-radius:10px; font-size:0.82rem; font-weight:600;'
    + '  font-family:inherit; cursor:pointer; transition:all 0.15s; border:none; white-space:nowrap;'
    + '}'
    + '.cb-ghost { background:transparent; color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.15); }'
    + '.cb-ghost:hover { background:rgba(255,255,255,0.08); color:#fff; }'
    + '.cb-outline { background:transparent; color:#34A853; border:1px solid rgba(52,168,83,0.4); }'
    + '.cb-outline:hover { background:rgba(52,168,83,0.1); border-color:#34A853; }'
    + '.cb-primary { background:#2D8C3C; color:#fff; }'
    + '.cb-primary:hover { background:#246F30; }'

    /* ── Settings overlay ── */
    + '#cbSettingsOverlay {'
    + '  position:fixed; inset:0; z-index:100000; background:rgba(0,0,0,0);'
    + '  transition:background 0.25s ease;'
    + '}'
    + '#cbSettingsOverlay.cb-overlay-show { background:rgba(0,0,0,0.35); }'
    + '#cbSettingsOverlay.cb-overlay-hide { background:rgba(0,0,0,0); }'

    /* ── Settings modal ── */
    + '#cbSettingsModal {'
    + '  position:fixed; bottom:50%; left:50%; transform:translate(-50%, 50%) scale(0.96);'
    + '  z-index:100001; width:calc(100% - 32px); max-width:480px;'
    + '  background:#fff; border-radius:16px;'
    + '  box-shadow:0 16px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.08);'
    + '  font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif;'
    + '  opacity:0; transition:opacity 0.25s ease, transform 0.25s ease; overflow:hidden;'
    + '}'
    + '#cbSettingsModal.cb-modal-show { opacity:1; transform:translate(-50%, 50%) scale(1); }'
    + '#cbSettingsModal.cb-modal-hide { opacity:0; transform:translate(-50%, 50%) scale(0.96); }'

    + '.cb-modal-header {'
    + '  display:flex; align-items:center; justify-content:space-between;'
    + '  padding:20px 22px 0; '
    + '}'
    + '.cb-modal-header h3 { font-size:1.05rem; font-weight:700; color:#111827; margin:0; }'
    + '.cb-modal-close {'
    + '  width:32px; height:32px; border-radius:8px; border:none; background:transparent;'
    + '  cursor:pointer; display:flex; align-items:center; justify-content:center;'
    + '  color:#6b7280; transition:all 0.15s;'
    + '}'
    + '.cb-modal-close:hover { background:#f3f4f6; color:#111827; }'

    + '.cb-modal-body { padding:16px 22px; display:flex; flex-direction:column; gap:10px; }'

    /* ── Category row ── */
    + '.cb-cat {'
    + '  display:flex; align-items:center; justify-content:space-between; gap:14px;'
    + '  padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb;'
    + '  border-radius:10px; cursor:pointer; transition:border-color 0.15s;'
    + '}'
    + '.cb-cat:hover { border-color:#d1d5db; }'
    + '.cb-cat-text { flex:1; }'
    + '.cb-cat-name { display:block; font-size:0.88rem; font-weight:600; color:#111827; margin-bottom:2px; }'
    + '.cb-cat-badge {'
    + '  display:inline-block; font-size:0.68rem; font-weight:500; color:#2D8C3C;'
    + '  background:#f0fdf4; padding:1px 7px; border-radius:6px; margin-left:6px; vertical-align:middle;'
    + '}'
    + '.cb-cat-desc { display:block; font-size:0.76rem; color:#6b7280; line-height:1.4; }'

    /* ── Toggle switch ── */
    + '.cb-toggle { position:relative; flex-shrink:0; }'
    + '.cb-toggle input { opacity:0; width:0; height:0; position:absolute; }'
    + '.cb-sw {'
    + '  display:block; width:40px; height:22px; background:#d1d5db; border-radius:11px;'
    + '  position:relative; transition:background 0.2s; cursor:pointer;'
    + '}'
    + '.cb-sw::after {'
    + '  content:""; position:absolute; top:2px; left:2px; width:18px; height:18px;'
    + '  background:#fff; border-radius:50%; transition:transform 0.2s;'
    + '  box-shadow:0 1px 3px rgba(0,0,0,0.12);'
    + '}'
    + '.cb-toggle input:checked + .cb-sw { background:#2D8C3C; }'
    + '.cb-toggle input:checked + .cb-sw::after { transform:translateX(18px); }'
    + '.cb-toggle input:disabled + .cb-sw { background:#2D8C3C; opacity:0.5; cursor:not-allowed; }'

    + '.cb-modal-footer {'
    + '  display:flex; gap:8px; justify-content:flex-end; padding:16px 22px 20px;'
    + '  border-top:1px solid #f3f4f6;'
    + '}'

    /* ── Mobile ── */
    + '@media (max-width:600px) {'
    + '  #cookieBanner { bottom:12px; padding:16px; }'
    + '  .cb-inner { flex-direction:column; align-items:stretch; gap:12px; }'
    + '  .cb-actions { justify-content:stretch; }'
    + '  .cb-btn { flex:1; text-align:center; padding:10px 12px; }'
    + '  .cb-modal-footer { flex-wrap:wrap; }'
    + '  .cb-modal-footer .cb-btn { flex:1; min-width:calc(50% - 4px); text-align:center; }'
    + '}';

    document.head.appendChild(s);
  }

  /* ─── Init ─── */
  function init() {
    injectStyles();
    var consent = getConsent();
    if (consent) {
      activateAll(consent);
    } else {
      createBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose for footer "Cookie-Einstellungen" link */
  window.openCookieSettings = function() {
    closeBanner();
    openSettingsModal();
  };
})();
