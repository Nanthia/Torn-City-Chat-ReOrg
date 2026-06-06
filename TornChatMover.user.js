// ==UserScript==
// @name         Torn Chat ReOrg
// @namespace    https://github.com/Nanthia/Torn-City-Chat-ReOrg
// @version      6.0.0
// @description  Reorganize and persist Torn chat windows.
// @author       Antheia
// @match        https://www.torn.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @homepageURL  https://github.com/Nanthia/Torn-City-Chat-ReOrg
// @supportURL   https://github.com/Nanthia/Torn-City-Chat-ReOrg/issues
// @updateURL    https://raw.githubusercontent.com/Nanthia/Torn-City-Chat-ReOrg/main/TornChatMover.user.js
// @downloadURL  https://raw.githubusercontent.com/Nanthia/Torn-City-Chat-ReOrg/main/TornChatMover.user.js
// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle

// ==/UserScript==

(function () {
  'use strict';

  // ─── CONSTANTS ────────────────────────────────────────────────────────────
  const HANDLE_H  = 18;
  const STORE_KEY = 'tcm_v6';
  const TCM_ATTR  = 'data-tcm-id';

  // ─── STATE ────────────────────────────────────────────────────────────────
  // id -> { el, handle, x, y, chatName, mode, guardObs, rafId }
  // mode: 'natural' = Torn controls position, we just track
  //       'fixed'   = we control position via position:fixed
  const panels = new Map();
  let nextId   = 0;

  // ─── PERSISTENCE ──────────────────────────────────────────────────────────
  function loadAll() {
    try   { return JSON.parse(GM_getValue(STORE_KEY, '{}')); }
    catch { return {}; }
  }

  function saveAll() {
    const out = {};
    panels.forEach(({ chatName, x, y, mode }) => {
      if (chatName && mode === 'fixed') out[chatName] = { x, y };
    });
    GM_setValue(STORE_KEY, JSON.stringify(out));
  }

  // ─── CHAT NAME EXTRACTION ─────────────────────────────────────────────────
  // Returns null if content not rendered yet — caller retries
  function getChatName(el) {
    const selectors = [
      '[class*="title"]',
      '[class*="name"]',
      '[class*="header"] span',
      '[class*="userName"]',
      '[class*="header"]',
    ];
    for (const sel of selectors) {
      const node = el.querySelector(sel);
      const text = node && node.textContent.trim();
      if (text && text.length > 0 && text.length < 60) return text;
    }
    // Fallback: first meaningful text node
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (text.length > 1 && text.length < 60) return text;
    }
    return null;
  }

  // ─── HANDLE SYNC ──────────────────────────────────────────────────────────
  // Always positions handle using live getBoundingClientRect — no guessing widths
  function syncHandle(id) {
    const p = panels.get(id);
    if (!p || !p.handle) return;

    const rect = p.el.getBoundingClientRect();

    // Panel not visible / not rendered
    if (rect.width === 0 || rect.height === 0) {
      p.handle.style.display = 'none';
      return;
    }

    p.handle.style.display = 'flex';
    p.handle.style.left    = `${rect.left}px`;
    p.handle.style.top     = `${rect.top - HANDLE_H}px`;
    p.handle.style.width   = `${rect.width}px`;
  }

  // ─── rAF LOOP (natural mode) ──────────────────────────────────────────────
  // Keeps handle glued to panel while Torn controls its position
  function startRaf(id) {
    const p = panels.get(id);
    if (!p) return;

    function tick() {
      if (!panels.has(id) || !document.contains(p.el)) return;
      if (panels.get(id).mode === 'natural') syncHandle(id);
      panels.get(id).rafId = requestAnimationFrame(tick);
    }
    p.rafId = requestAnimationFrame(tick);
  }

  function stopRaf(id) {
    const p = panels.get(id);
    if (p && p.rafId) cancelAnimationFrame(p.rafId);
  }

  // ─── SWITCH TO FIXED ──────────────────────────────────────────────────────
  // Reads the panel's current viewport position and locks it there via fixed
  function makeFixed(id) {
    const p = panels.get(id);
    if (!p || p.mode === 'fixed') return;

    const rect = p.el.getBoundingClientRect();
    p.x    = rect.left;
    p.y    = rect.top;
    p.mode = 'fixed';

    stopRaf(id);
    applyFixed(id);
    startGuard(id);
  }

  function applyFixed(id) {
    const p = panels.get(id);
    if (!p) return;

    p.el.style.setProperty('position',  'fixed',     'important');
    p.el.style.setProperty('left',      `${p.x}px`,  'important');
    p.el.style.setProperty('top',       `${p.y}px`,  'important');
    p.el.style.setProperty('right',     'unset',      'important');
    p.el.style.setProperty('bottom',    'unset',      'important');
    p.el.style.setProperty('transform', 'none',       'important');
    p.el.style.setProperty('z-index',   '99999',      'important');
    p.el.style.setProperty('margin',    '0',          'important');

    syncHandle(id);
  }

  // ─── SET POSITION (fixed mode only) ───────────────────────────────────────
  function setPos(id, x, y, persist = true) {
    const p = panels.get(id);
    if (!p || p.mode !== 'fixed') return;

    const rect = p.el.getBoundingClientRect();
    const pw   = rect.width  || 240;
    const ph   = rect.height || 520;
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;

    p.x = Math.max(0, Math.min(x, vw - pw));
    p.y = Math.max(HANDLE_H, Math.min(y, vh - ph));

    applyFixed(id);
    if (persist) saveAll();
  }

  // ─── GUARD (fixed mode only) ──────────────────────────────────────────────
  // Re-applies fixed position if React resets the panel's style
  function startGuard(id) {
    const p = panels.get(id);
    if (!p || p.guardObs) return;

    p.guardObs = new MutationObserver(() => {
      if (!panels.has(id)) return;
      const cur = panels.get(id);
      if (cur.mode === 'fixed' && getComputedStyle(cur.el).position !== 'fixed') {
        applyFixed(id);
      }
    });
    p.guardObs.observe(p.el, {
      attributes:      true,
      attributeFilter: ['style', 'class'],
    });
  }

  // ─── BUILD HANDLE ─────────────────────────────────────────────────────────
  function buildHandle(id) {
    const p = panels.get(id);
    if (!p) return;

    const existing = document.getElementById(`tcm-h-${id}`);
    if (existing) existing.remove();

    const h = document.createElement('div');
    h.id = `tcm-h-${id}`;
    h.style.cssText = `
      position:        fixed !important;
      height:          ${HANDLE_H}px;
      background:      linear-gradient(90deg, #111122, #222244, #111122);
      border-radius:   4px 4px 0 0;
      border-bottom:   1px solid #333;
      display:         none;
      align-items:     center;
      justify-content: center;
      cursor:          grab;
      user-select:     none;
      z-index:         1000000 !important;
      pointer-events:  all !important;
      gap:             4px;
      box-sizing:      border-box;
      font-size:       10px;
      overflow:        hidden;
    `;

    const label = (p.chatName || '···').slice(0, 22);
    h.innerHTML = `
      <span data-btn="left"  style="cursor:pointer;padding:1px 5px;color:#555;border-radius:3px;flex-shrink:0;" title="Snap left">◀</span>
      <span style="pointer-events:none;color:#333;letter-spacing:2px;flex-shrink:0;">⠿⠿</span>
      <span data-lbl style="pointer-events:none;color:#556;flex:1;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${label}</span>
      <span style="pointer-events:none;color:#333;letter-spacing:2px;flex-shrink:0;">⠿⠿</span>
      <span data-btn="right" style="cursor:pointer;padding:1px 5px;color:#555;border-radius:3px;flex-shrink:0;" title="Snap right">▶</span>
    `;

    document.body.appendChild(h);
    p.handle = h;

    // Button hover
    h.querySelectorAll('[data-btn]').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.color      = '#ccc';
        btn.style.background = 'rgba(255,255,255,0.08)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.color      = '#555';
        btn.style.background = '';
      });
    });

    // ── Drag ────────────────────────────────────────────────────────────────
    let dragging = false, ox = 0, oy = 0;

    h.addEventListener('mousedown', (e) => {
      if (e.target.dataset.btn) return;

      // First drag: smoothly transition from natural -> fixed at current position
      if (panels.get(id).mode === 'natural') makeFixed(id);

      dragging = true;
      const p  = panels.get(id);
      ox = e.clientX - p.x;
      oy = e.clientY - p.y;
      h.style.cursor = 'grabbing';
      bringToFront(id);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      setPos(id, e.clientX - ox, e.clientY - oy, false);
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      h.style.cursor = 'grab';
      saveAll();
    });

    // ── Snaps ───────────────────────────────────────────────────────────────
    h.querySelector('[data-btn="left"]').addEventListener('click', () => {
      if (panels.get(id).mode === 'natural') makeFixed(id);
      setPos(id, 10, panels.get(id).y);
    });

    h.querySelector('[data-btn="right"]').addEventListener('click', () => {
      if (panels.get(id).mode === 'natural') makeFixed(id);
      const pw = panels.get(id).el.getBoundingClientRect().width || 240;
      setPos(id, window.innerWidth - pw - 10, panels.get(id).y);
    });
  }

  // ─── UPDATE LABEL when name resolves ──────────────────────────────────────
  function updateLabel(id) {
    const p = panels.get(id);
    if (!p || !p.handle) return;
    const lbl = p.handle.querySelector('[data-lbl]');
    if (lbl && p.chatName) lbl.textContent = p.chatName.slice(0, 22);
  }

  // ─── Z-INDEX ──────────────────────────────────────────────────────────────
  function bringToFront(activeId) {
    panels.forEach(({ el, handle }, id) => {
      const top = id === activeId;
      el.style.setProperty('z-index', top ? '99999' : '99997', 'important');
      if (handle) handle.style.setProperty('z-index', top ? '1000001' : '999999', 'important');
    });
  }

  // ─── REGISTER ONE PANEL ───────────────────────────────────────────────────
  function registerPanel(el) {
    if (el.hasAttribute(TCM_ATTR)) return;

    const id = nextId++;
    el.setAttribute(TCM_ATTR, String(id));

    panels.set(id, {
      el,
      handle:   null,
      chatName: null,
      mode:     'natural',
      x:        0,
      y:        0,
      guardObs: null,
      rafId:    null,
    });

    // Build handle immediately — it'll show as 'none' until first rAF sync
    buildHandle(id);
    startRaf(id);

    // Resolve name with retries, then check for saved position
    function resolveName() {
      if (!panels.has(id)) return;
      const name = getChatName(el);
      if (!name) { setTimeout(resolveName, 250); return; }

      const p  = panels.get(id);
      p.chatName = name;
      updateLabel(id);

      const saved = loadAll()[name];
      if (saved) {
        // Restore last known position
        p.x    = saved.x;
        p.y    = saved.y;
        p.mode = 'fixed';
        stopRaf(id);
        applyFixed(id);
        startGuard(id);
        console.log(`[TCM] "${name}" restored to ${saved.x},${saved.y}`);
      } else {
        console.log(`[TCM] "${name}" in natural mode`);
      }
    }

    setTimeout(resolveName, 200);
    console.log(`[TCM] Panel #${id} registered`);
  }

  // ─── DEREGISTER (chat closed) ─────────────────────────────────────────────
  function deregisterPanel(id) {
    const p = panels.get(id);
    if (!p) return;

    stopRaf(id);
    if (p.guardObs) p.guardObs.disconnect();
    if (p.handle)   p.handle.remove();

    // Restore el's own positioning so Torn can reclaim it cleanly
    ['position','left','top','right','bottom','transform','z-index','margin']
      .forEach(prop => p.el.style.removeProperty(prop));

    panels.delete(id);
    saveAll(); // persist on close
    console.log(`[TCM] Panel #${id} removed`);
  }

  // ─── SCAN ─────────────────────────────────────────────────────────────────
  function scanPanels() {
    const chatRoot = document.querySelector('#chatRoot');
    if (!chatRoot) return;

    for (const el of chatRoot.querySelectorAll('*')) {
      if (el.hasAttribute(TCM_ATTR)) continue;
      if (getComputedStyle(el).position !== 'absolute') continue;
      const r = el.getBoundingClientRect();
      if (r.width > 100 && r.height > 100) registerPanel(el);
    }

    panels.forEach((p, id) => {
      if (!document.contains(p.el)) deregisterPanel(id);
    });
  }

  // ─── BOOT ─────────────────────────────────────────────────────────────────
  let booted = false;

  function boot() {
    if (booted) return;
    if (!document.querySelector('#chatRoot')) return;
    booted = true;
    domObs.disconnect();

    scanPanels();

    new MutationObserver(scanPanels)
      .observe(document.querySelector('#chatRoot'), {
        childList: true,
        subtree:   true,
      });

    window.addEventListener('resize', () => {
      panels.forEach((p, id) => {
        if (p.mode === 'fixed') setPos(id, p.x, p.y, false);
      });
    });

    console.log('[TCM v6] Booted');
  }

  const domObs = new MutationObserver(boot);
  domObs.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => domObs.disconnect(), 30_000);
  boot();

})();
