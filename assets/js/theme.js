// ============================================
// THEME SWITCHER — theme.js
// ============================================
(function () {
  'use strict';

  const STORAGE_KEY = 'pw-theme';
  const DEFAULT     = 'dark';

  // Read saved preference (no-flash snippet already set data-theme on <html>)
  function getSaved() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT; }
    catch (_) { return DEFAULT; }
  }

  function save(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  // Apply theme — sets class on <body> AND data-theme on <html>
  function applyTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add('theme-' + theme);
    document.documentElement.setAttribute('data-theme', theme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    window.__THEME__ = theme;
  }

  // Build the vertical widget
  function buildWidget() {
    const wrap  = document.createElement('div');
    wrap.className = 'theme-switcher';

    const inner = document.createElement('div');
    inner.className = 'theme-switcher-inner';

    [{ key: 'light', label: 'LIGHT' }, { key: 'dark', label: 'DARK' }]
      .forEach(({ key, label }) => {
        const btn = document.createElement('button');
        btn.className     = 'theme-btn';
        btn.dataset.theme = key;
        btn.innerHTML     = `<span class="theme-btn-indicator"></span>${label}`;
        btn.addEventListener('click', () => { save(key); applyTheme(key); });
        inner.appendChild(btn);
      });

    wrap.appendChild(inner);
    return wrap;
  }

  function init() {
    document.body.appendChild(buildWidget());
    // Apply the saved theme — this syncs body class with whatever
    // the no-flash snippet already put on <html>
    applyTheme(getSaved());
  }

  // theme.js is loaded at end of <body>, so DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
