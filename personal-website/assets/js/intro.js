// ============================================
// INTRO — shows on first visit per session
// ============================================
(function () {
  // Skip if already visited this session
  if (sessionStorage.getItem('intro_done')) return;

  // Match intro bg to saved theme so there's no colour clash
  var theme = 'dark';
  try { theme = localStorage.getItem('pw-theme') || 'dark'; } catch(_) {}
  var bg   = theme === 'light' ? '#f2f0eb' : '#000000';
  var fg   = theme === 'light' ? '#111111' : '#ffffff';
  var fgM  = theme === 'light' ? '#888888' : '#888888';

  var overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  // Override the CSS background/color so it always matches current theme
  overlay.style.background = bg;
  overlay.style.color      = fg;

  overlay.innerHTML = `
    <div class="intro-inner">
      <p class="intro-name" style="color:${fg}">VIRTUAL SPACE</p>
      <div class="intro-line"></div>
      <p class="intro-sub" style="color:${fgM}">Opening Archive</p>
      <div class="intro-loader">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Dismiss after 2.6 s
  setTimeout(function () {
    overlay.classList.add('hide');
    setTimeout(function () { overlay.remove(); }, 850);
  }, 2600);

  sessionStorage.setItem('intro_done', '1');
})();
