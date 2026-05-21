/**
 * ============================================================
 *  AKSESIBILITAS WIDGET — Imigrasi Sulawesi Selatan
 *  v1.0 · Self-hosted, no external dependencies
 *  Pasang di semua halaman: <script src="aksesibilitas.js"></script>
 * ============================================================
 */
(function () {
  'use strict';

  /* ─── STATE ─────────────────────────────────────────────── */
  const STATE_KEY = 'imigr_a11y';
  const defaults = {
    fontSize:       0,      // -2 to +4 steps
    contrast:       'none', // none | high | invert | lowlight
    dyslexia:       false,
    highlight:      false,
    pauseAnim:      false,
    bigCursor:      false,
    readingGuide:   false,
    readingMask:    false,
    hideImages:     false,
    lineHeight:     false,
    letterSpacing:  false,
    underlineLinks: false,
    screenReader:   false,
  };

  let state = Object.assign({}, defaults);

  function loadState() {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) state = Object.assign({}, defaults, JSON.parse(s));
    } catch (_) {}
  }

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  /* ─── FONT LOADER ────────────────────────────────────────── */
  function ensureDyslexiaFont() {
    if (!document.getElementById('a11y-opendyslexic-link')) {
      const lnk = document.createElement('link');
      lnk.id   = 'a11y-opendyslexic-link';
      lnk.rel  = 'stylesheet';
      lnk.href = 'https://fonts.cdnfonts.com/css/opendyslexic';
      document.head.appendChild(lnk);
    }
  }

  /* ─── CSS INJECTION ──────────────────────────────────────── */
  const STYLE_ID = 'a11y-dynamic-styles';

  function rebuildStyles() {
    let el = document.getElementById(STYLE_ID);
    if (!el) { el = document.createElement('style'); el.id = STYLE_ID; document.head.appendChild(el); }

    const rules = [];

    /* font size */
    const fsDelta = state.fontSize * 10; // each step = 10%
    if (state.fontSize !== 0) {
      rules.push(`body,p,span,li,td,th,label,input,textarea,select,button,a{font-size:calc(1em + ${fsDelta}%) !important}`);
    }

    /* contrast */
    if (state.contrast === 'high') {
      rules.push(`html{filter:contrast(1.5) !important}`);
    } else if (state.contrast === 'invert') {
      rules.push(`html{filter:invert(1) hue-rotate(180deg) !important}`);
      rules.push(`img,video,canvas,svg,iframe{filter:invert(1) hue-rotate(180deg) !important}`);
    } else if (state.contrast === 'lowlight') {
      rules.push(`html{filter:brightness(0.7) !important}`);
    }

    /* dyslexia font */
    if (state.dyslexia) {
      ensureDyslexiaFont();
      rules.push(`*:not(.a11y-widget-wrap):not(.a11y-widget-wrap *){font-family:"OpenDyslexic","Comic Sans MS",cursive !important}`);
    }

    /* highlight links */
    if (state.highlight) {
      rules.push(`a{outline:2px solid #f0c040 !important;outline-offset:2px !important;border-radius:2px !important;}`);
    }

    /* underline links */
    if (state.underlineLinks) {
      rules.push(`a{text-decoration:underline !important;text-underline-offset:3px !important;}`);
    }

    /* pause animations */
    if (state.pauseAnim) {
      rules.push(`*{animation:none !important;transition:none !important;}`);
    }

    /* big cursor */
    if (state.bigCursor) {
      rules.push(`*{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='44'%3E%3Cpath d='M4 2 L4 38 L13 29 L20 44 L25 42 L18 27 L30 27 Z' fill='white' stroke='black' stroke-width='2'/%3E%3C/svg%3E") 4 2,auto !important}`);
    }

    /* line height */
    if (state.lineHeight) {
      rules.push(`p,li,td,th,span,div{line-height:1.9 !important}`);
    }

    /* letter spacing */
    if (state.letterSpacing) {
      rules.push(`p,li,td,th,span,div,a,button{letter-spacing:0.14em !important}`);
    }

    /* hide images */
    if (state.hideImages) {
      rules.push(`img,picture,figure,video{visibility:hidden !important}`);
    }

    el.textContent = rules.join('\n');
  }

  /* ─── READING GUIDE ──────────────────────────────────────── */
  let guideEl = null;
  function toggleReadingGuide(on) {
    if (on) {
      if (!guideEl) {
        guideEl = document.createElement('div');
        guideEl.id = 'a11y-reading-guide';
        Object.assign(guideEl.style, {
          position:'fixed', left:'0', width:'100%', height:'3px',
          background:'rgba(14,165,160,0.65)', pointerEvents:'none',
          zIndex:'2147483646', borderRadius:'2px',
          boxShadow:'0 0 8px rgba(14,165,160,0.5)',
          transition:'top 0.05s linear'
        });
        document.body.appendChild(guideEl);
      }
      document.addEventListener('mousemove', moveGuide);
    } else {
      document.removeEventListener('mousemove', moveGuide);
      if (guideEl) { guideEl.remove(); guideEl = null; }
    }
  }
  function moveGuide(e) {
    if (guideEl) guideEl.style.top = (e.clientY - 1) + 'px';
  }

  /* ─── READING MASK ───────────────────────────────────────── */
  let maskTop = null, maskBot = null;
  function toggleReadingMask(on) {
    if (on) {
      maskTop = document.createElement('div');
      maskBot = document.createElement('div');
      const shared = {
        position:'fixed', left:'0', width:'100%',
        background:'rgba(6,15,46,0.75)', pointerEvents:'none', zIndex:'2147483645'
      };
      Object.assign(maskTop.style, shared, { top:'0', height:'0' });
      Object.assign(maskBot.style, shared, { top:'0', height:'100%' });
      document.body.appendChild(maskTop);
      document.body.appendChild(maskBot);
      document.addEventListener('mousemove', moveMask);
    } else {
      document.removeEventListener('mousemove', moveMask);
      if (maskTop) { maskTop.remove(); maskTop = null; }
      if (maskBot) { maskBot.remove(); maskBot = null; }
    }
  }
  function moveMask(e) {
    const GAP = 60;
    if (maskTop) maskTop.style.height = Math.max(0, e.clientY - GAP) + 'px';
    if (maskBot) {
      const top = e.clientY + GAP;
      maskBot.style.top    = top + 'px';
      maskBot.style.height = (window.innerHeight - top) + 'px';
    }
  }

  /* ─── SCREEN READER ──────────────────────────────────────── */
  let srActive   = false;
  let srUtterance = null;
  function stopReading() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.removeEventListener('click', srClickHandler, true);
    document.removeEventListener('mouseover', srHoverHandler);
    srActive = false;
  }
  function startReading() {
    if (!('speechSynthesis' in window)) { alert('Browser Anda tidak mendukung Text-to-Speech.'); return; }
    srActive = true;
    document.addEventListener('click', srClickHandler, true);
    document.addEventListener('mouseover', srHoverHandler);
  }
  function srSpeak(text) {
    if (!text || !text.trim()) return;
    window.speechSynthesis.cancel();
    srUtterance = new SpeechSynthesisUtterance(text.trim());
    srUtterance.lang = document.documentElement.lang || 'id-ID';
    srUtterance.rate = 0.95;
    window.speechSynthesis.speak(srUtterance);
  }
  function srClickHandler(e) {
    const el = e.target;
    if (el.closest('.a11y-widget-wrap')) return;
    const text = el.getAttribute('aria-label') || el.getAttribute('alt') || el.textContent;
    if (text) srSpeak(text);
  }
  function srHoverHandler(e) {
    const el = e.target;
    if (el.closest('.a11y-widget-wrap')) return;
    const text = el.getAttribute('aria-label') || el.getAttribute('alt');
    if (text) srSpeak(text);
  }

  /* ─── APPLY ALL ──────────────────────────────────────────── */
  function applyAll() {
    rebuildStyles();
    toggleReadingGuide(state.readingGuide);
    toggleReadingMask(state.readingMask);
    if (state.screenReader && !srActive) startReading();
    else if (!state.screenReader && srActive) stopReading();
    saveState();
    syncPanel();
  }

  /* ─── BUILD UI ───────────────────────────────────────────── */
  function buildWidget() {
    /* inject widget CSS */
    const css = document.createElement('style');
    css.textContent = `
      .a11y-widget-wrap * { box-sizing:border-box; }
      .a11y-fab {
        position:fixed; bottom:80px; left:20px; z-index:2147483647;
        width:52px; height:52px; border-radius:50%;
        background:linear-gradient(135deg,#1248b3,#0b3d91);
        border:2px solid rgba(201,168,76,0.55);
        color:#fff; font-size:26px; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 4px 20px rgba(0,0,0,0.45), 0 0 0 0 rgba(201,168,76,0.4);
        transition:transform .2s, box-shadow .2s;
      }
      .a11y-fab:hover { transform:scale(1.1); box-shadow:0 6px 28px rgba(0,0,0,0.55), 0 0 0 6px rgba(201,168,76,0.15); }
      .a11y-fab svg { width:24px; height:24px; }

      .a11y-panel {
        position:fixed; bottom:140px; left:20px; z-index:2147483646;
        width:300px; background:rgba(6,15,46,0.97);
        border:1px solid rgba(201,168,76,0.3);
        border-radius:18px; overflow:hidden;
        box-shadow:0 20px 60px rgba(0,0,0,0.7);
        backdrop-filter:blur(20px);
        transform-origin:bottom left;
        transform:scale(0.85) translateY(10px);
        opacity:0; pointer-events:none;
        transition:transform .25s cubic-bezier(.22,1,.36,1), opacity .25s;
        font-family:'Outfit',sans-serif;
      }
      .a11y-panel.open {
        transform:scale(1) translateY(0);
        opacity:1; pointer-events:all;
      }
      .a11y-header {
        padding:14px 18px 12px;
        background:linear-gradient(90deg,rgba(18,72,179,0.5),rgba(6,15,46,0));
        border-bottom:1px solid rgba(201,168,76,0.18);
        display:flex; align-items:center; justify-content:space-between;
      }
      .a11y-title {
        font-size:13px; font-weight:600; letter-spacing:.06em;
        color:#e8c97a; text-transform:uppercase;
      }
      .a11y-reset {
        font-size:10px; color:rgba(255,255,255,.4); cursor:pointer;
        background:none; border:none; padding:4px 8px;
        border-radius:6px; transition:background .15s, color .15s;
      }
      .a11y-reset:hover { background:rgba(255,255,255,.08); color:#fff; }

      .a11y-body { padding:14px 16px 16px; overflow-y:auto; max-height:420px; }
      .a11y-section-label {
        font-size:9px; font-weight:600; letter-spacing:.18em;
        text-transform:uppercase; color:rgba(201,168,76,.6);
        margin:10px 0 8px;
      }
      .a11y-section-label:first-child { margin-top:0; }

      /* FONT SIZE ROW */
      .a11y-fs-row {
        display:flex; align-items:center; gap:10px;
        background:rgba(255,255,255,.05); border-radius:10px;
        padding:8px 12px; margin-bottom:4px;
        border:1px solid rgba(255,255,255,.07);
      }
      .a11y-fs-label { font-size:12px; color:rgba(255,255,255,.7); flex:1; }
      .a11y-fs-btn {
        width:28px; height:28px; border-radius:8px; border:none;
        background:rgba(18,72,179,.5); color:#fff; font-size:16px;
        cursor:pointer; display:flex; align-items:center; justify-content:center;
        transition:background .15s;
      }
      .a11y-fs-btn:hover { background:rgba(18,72,179,.9); }
      .a11y-fs-val {
        font-size:12px; font-weight:600; color:#e8c97a;
        min-width:24px; text-align:center;
      }

      /* CONTRAST GRID */
      .a11y-contrast-grid {
        display:grid; grid-template-columns:repeat(2,1fr); gap:6px;
        margin-bottom:4px;
      }
      .a11y-copt {
        padding:7px 10px; border-radius:9px; font-size:11px; font-weight:500;
        cursor:pointer; border:1px solid rgba(255,255,255,.1);
        background:rgba(255,255,255,.05); color:rgba(255,255,255,.7);
        transition:all .15s; text-align:center;
      }
      .a11y-copt:hover { background:rgba(255,255,255,.1); }
      .a11y-copt.active { background:rgba(201,168,76,.2); border-color:rgba(201,168,76,.55); color:#e8c97a; }

      /* TOGGLES */
      .a11y-toggles { display:flex; flex-direction:column; gap:5px; }
      .a11y-toggle-row {
        display:flex; align-items:center; justify-content:space-between;
        padding:8px 12px; border-radius:10px;
        background:rgba(255,255,255,.04);
        border:1px solid rgba(255,255,255,.06);
        cursor:pointer; transition:background .15s;
      }
      .a11y-toggle-row:hover { background:rgba(255,255,255,.08); }
      .a11y-toggle-info { display:flex; align-items:center; gap:9px; }
      .a11y-toggle-icon { font-size:15px; width:20px; text-align:center; }
      .a11y-toggle-label { font-size:12px; color:rgba(255,255,255,.75); }
      .a11y-switch {
        width:34px; height:18px; border-radius:9px;
        background:rgba(255,255,255,.15); position:relative;
        flex-shrink:0; transition:background .2s;
      }
      .a11y-switch.on { background:rgba(14,165,160,.8); }
      .a11y-switch::after {
        content:''; position:absolute; top:2px; left:2px;
        width:14px; height:14px; border-radius:7px;
        background:#fff; transition:left .2s;
        box-shadow:0 1px 4px rgba(0,0,0,.3);
      }
      .a11y-switch.on::after { left:18px; }

      /* SR badge */
      .a11y-sr-badge {
        display:none; position:fixed; bottom:140px; left:82px;
        background:rgba(14,165,160,.9); color:#fff;
        font-size:11px; font-weight:600; padding:5px 10px;
        border-radius:20px; z-index:2147483646;
        animation:srPulse 2s ease-in-out infinite;
      }
      .a11y-sr-badge.visible { display:block; }
      @keyframes srPulse { 0%,100%{opacity:1} 50%{opacity:.6} }

      @media (max-width:400px) {
        .a11y-panel { width:calc(100vw - 32px); left:16px; }
        .a11y-fab   { left:16px; bottom:72px; }
      }
    `;
    document.head.appendChild(css);

    /* wrapper */
    const wrap = document.createElement('div');
    wrap.className = 'a11y-widget-wrap';
    wrap.setAttribute('aria-label','Panel Aksesibilitas');

    /* FAB button */
    const fab = document.createElement('button');
    fab.className = 'a11y-fab';
    fab.setAttribute('aria-label','Buka panel aksesibilitas');
    fab.setAttribute('title','Aksesibilitas');
    fab.innerHTML = `♿`;
    wrap.appendChild(fab);

    /* SR badge */
    const srBadge = document.createElement('div');
    srBadge.className = 'a11y-sr-badge';
    srBadge.textContent = '🔊 Pembaca Aktif';
    wrap.appendChild(srBadge);

    /* panel */
    const panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','Opsi Aksesibilitas');
    panel.innerHTML = `
      <div class="a11y-header">
        <span class="a11y-title">♿ Aksesibilitas</span>
        <button class="a11y-reset" id="a11y-reset-btn">Reset Semua</button>
      </div>
      <div class="a11y-body">

        <div class="a11y-section-label">Ukuran Teks</div>
        <div class="a11y-fs-row">
          <span class="a11y-fs-label">Ukuran Font</span>
          <button class="a11y-fs-btn" id="a11y-fs-dec" aria-label="Kecilkan font">−</button>
          <span class="a11y-fs-val" id="a11y-fs-val">Normal</span>
          <button class="a11y-fs-btn" id="a11y-fs-inc" aria-label="Besarkan font">+</button>
        </div>

        <div class="a11y-section-label">Kontras & Warna</div>
        <div class="a11y-contrast-grid">
          <div class="a11y-copt" data-contrast="none">Normal</div>
          <div class="a11y-copt" data-contrast="high">Kontras Tinggi</div>
          <div class="a11y-copt" data-contrast="invert">Warna Terbalik</div>
          <div class="a11y-copt" data-contrast="lowlight">Redup</div>
        </div>

        <div class="a11y-section-label">Teks & Keterbacaan</div>
        <div class="a11y-toggles">
          <div class="a11y-toggle-row" data-key="dyslexia">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">📖</span><span class="a11y-toggle-label">Font Disleksia</span></div>
            <div class="a11y-switch" id="sw-dyslexia"></div>
          </div>
          <div class="a11y-toggle-row" data-key="lineHeight">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">↕️</span><span class="a11y-toggle-label">Jarak Baris Lebar</span></div>
            <div class="a11y-switch" id="sw-lineHeight"></div>
          </div>
          <div class="a11y-toggle-row" data-key="letterSpacing">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">↔️</span><span class="a11y-toggle-label">Jarak Huruf Lebar</span></div>
            <div class="a11y-switch" id="sw-letterSpacing"></div>
          </div>
        </div>

        <div class="a11y-section-label">Navigasi & Tampilan</div>
        <div class="a11y-toggles">
          <div class="a11y-toggle-row" data-key="highlight">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">🔗</span><span class="a11y-toggle-label">Sorot Tautan</span></div>
            <div class="a11y-switch" id="sw-highlight"></div>
          </div>
          <div class="a11y-toggle-row" data-key="underlineLinks">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">_A</span><span class="a11y-toggle-label">Garis Bawah Tautan</span></div>
            <div class="a11y-switch" id="sw-underlineLinks"></div>
          </div>
          <div class="a11y-toggle-row" data-key="bigCursor">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">🖱️</span><span class="a11y-toggle-label">Kursor Besar</span></div>
            <div class="a11y-switch" id="sw-bigCursor"></div>
          </div>
          <div class="a11y-toggle-row" data-key="hideImages">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">🚫</span><span class="a11y-toggle-label">Sembunyikan Gambar</span></div>
            <div class="a11y-switch" id="sw-hideImages"></div>
          </div>
          <div class="a11y-toggle-row" data-key="pauseAnim">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">⏸️</span><span class="a11y-toggle-label">Hentikan Animasi</span></div>
            <div class="a11y-switch" id="sw-pauseAnim"></div>
          </div>
        </div>

        <div class="a11y-section-label">Alat Baca</div>
        <div class="a11y-toggles">
          <div class="a11y-toggle-row" data-key="readingGuide">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">📏</span><span class="a11y-toggle-label">Panduan Baca</span></div>
            <div class="a11y-switch" id="sw-readingGuide"></div>
          </div>
          <div class="a11y-toggle-row" data-key="readingMask">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">🎭</span><span class="a11y-toggle-label">Masker Baca</span></div>
            <div class="a11y-switch" id="sw-readingMask"></div>
          </div>
          <div class="a11y-toggle-row" data-key="screenReader">
            <div class="a11y-toggle-info"><span class="a11y-toggle-icon">🔊</span><span class="a11y-toggle-label">Pembaca Layar</span></div>
            <div class="a11y-switch" id="sw-screenReader"></div>
          </div>
        </div>

      </div>
    `;
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    /* ── EVENT: FAB toggle ── */
    let panelOpen = false;
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      panelOpen = !panelOpen;
      panel.classList.toggle('open', panelOpen);
    });
    document.addEventListener('click', (e) => {
      if (panelOpen && !wrap.contains(e.target)) {
        panelOpen = false;
        panel.classList.remove('open');
      }
    });

    /* ── EVENT: Reset ── */
    document.getElementById('a11y-reset-btn').addEventListener('click', () => {
      stopReading();
      state = Object.assign({}, defaults);
      applyAll();
    });

    /* ── EVENT: Font size ── */
    document.getElementById('a11y-fs-inc').addEventListener('click', () => {
      if (state.fontSize < 4) { state.fontSize++; applyAll(); }
    });
    document.getElementById('a11y-fs-dec').addEventListener('click', () => {
      if (state.fontSize > -2) { state.fontSize--; applyAll(); }
    });

    /* ── EVENT: Contrast ── */
    panel.querySelectorAll('.a11y-copt').forEach(btn => {
      btn.addEventListener('click', () => {
        state.contrast = btn.dataset.contrast;
        applyAll();
      });
    });

    /* ── EVENT: Toggles ── */
    panel.querySelectorAll('.a11y-toggle-row[data-key]').forEach(row => {
      row.addEventListener('click', () => {
        const key = row.dataset.key;
        state[key] = !state[key];
        applyAll();
      });
    });

    /* ── SYNC PANEL (update UI to match state) ── */
    window._a11ySyncPanel = function () {
      /* font size label */
      const fsLabels = ['−20%','−10%','Normal','+10%','+20%','+30%','+40%'];
      const fsIdx = state.fontSize + 2;
      document.getElementById('a11y-fs-val').textContent = fsLabels[fsIdx] || 'Normal';

      /* contrast buttons */
      panel.querySelectorAll('.a11y-copt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.contrast === state.contrast);
      });

      /* toggle switches */
      const boolKeys = ['dyslexia','lineHeight','letterSpacing','highlight','underlineLinks',
                        'bigCursor','hideImages','pauseAnim','readingGuide','readingMask','screenReader'];
      boolKeys.forEach(key => {
        const sw = document.getElementById('sw-' + key);
        if (sw) sw.classList.toggle('on', !!state[key]);
      });

      /* SR badge */
      srBadge.classList.toggle('visible', state.screenReader);
    };

    syncPanel = window._a11ySyncPanel;
  }

  /* ─── INIT ───────────────────────────────────────────────── */
  let syncPanel = function () {};

  function init() {
    loadState();
    buildWidget();
    applyAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();