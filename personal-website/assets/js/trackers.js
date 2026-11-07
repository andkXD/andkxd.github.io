// ============================================
// STAR TRACKERS — small corner brackets with an id + depth value, attached to the
// background stars (Gather-style). Loaded by sketch.js, so it appears on every page
// that has the star field and stays in sync with the stars as they drift.
// ============================================
(() => {
  // ── settings (edit these) ──
  const GROUPS   = innerWidth < 700 ? 1 : 3;   // groups of 3 brackets, joined by thin lines (0 = off) — fewer on phones
  const MIN_SIZE = 1.6;   // only stars bigger than this can get a bracket
  const MAX_LINE = 420;   // hide a connecting line when its stars drift further apart than this (px)
  if (!GROUPS) return;

  const css = document.createElement('style');
  css.textContent = '#star-trackers{position:fixed;inset:0;z-index:2;pointer-events:none}' +
    '#star-trackers .st{position:absolute;left:0;top:0;font:500 10px "Roboto Mono",monospace;letter-spacing:.08em;white-space:nowrap;color:var(--st-fg,#ddd);opacity:.6}' +
    '#star-trackers .st svg{position:absolute;left:-7px;top:-7px}#star-trackers .st span{position:absolute;left:12px;top:-6px}' +
    '#star-trackers svg.ln{position:absolute;inset:0;width:100%;height:100%;stroke:var(--st-fg,#ddd);stroke-width:1;opacity:.22}';
  document.head.appendChild(css);
  const box = document.createElement('div'); box.id = 'star-trackers';
  const lns = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); lns.setAttribute('class', 'ln');
  const hud = document.createElement('div'); hud.style.cssText = 'position:absolute;inset:0';
  box.append(lns, hud); document.body.appendChild(box);

  const BRACKET = '<svg width="14" height="14" fill="none" stroke="currentColor"><path d="M.5 4.5v-4h4M9.5 .5h4v4M13.5 9.5v4h-4M4.5 13.5h-4v-4M7 5v4M5 7h4"/></svg><span></span>';
  let marks = [], segs = [], ready = false, theme = null;

  // g = which slice of the screen width to pick from (so groups spread out); no g = anywhere
  function pickStar(g) {
    let t = 0, c; const lo = g === undefined ? 0 : g * innerWidth / GROUPS, hi = g === undefined ? innerWidth : (g + 1) * innerWidth / GROUPS;
    do { c = cells[(Math.random() * cells.length) | 0]; } while ((c.sz < MIN_SIZE || c.x < lo || c.x >= hi) && ++t < 200);
    return c;
  }
  function build() {
    hud.innerHTML = ''; lns.innerHTML = ''; marks = []; segs = [];
    const ids = Array.from({ length: 35 }, (_, i) => i + 1).sort(() => Math.random() - .5);   // unique ids, like the reference
    for (let g = 0; g < GROUPS; g++) {
      const s = pickStar(g), near = Array.from({ length: 60 }, () => pickStar()).filter(c => c !== s)
        .sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
      const trio = [s, near[0], near[1]], first = marks.length;
      trio.forEach(cell => {
        const el = document.createElement('div'); el.className = 'st'; el.innerHTML = BRACKET; hud.appendChild(el);
        const val = -(.44 + Math.random() * .13);
        el.querySelector('span').textContent = String(ids.pop()).padStart(2, '0') + ' −' + Math.abs(val).toFixed(2);
        marks.push({ el, cell });
      });
      [[0, 1], [1, 2]].forEach(([a, b]) => { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); lns.appendChild(l); segs.push({ l, a: first + a, b: first + b }); });
    }
    ready = true;
  }
  addEventListener('resize', () => { ready = false; });      // stars are re-created on resize → pick new ones

  (function loop() {
    requestAnimationFrame(loop); if (document.hidden) return;
    if (!ready && typeof cells !== 'undefined' && cells.length > 50) build();      // the star field starts after p5 loads
    if (!ready) return;
    const light = window.__THEME__ === 'light';
    if (light !== theme) { theme = light; box.style.setProperty('--st-fg', light ? '#111' : '#ddd'); }
    for (const m of marks) m.el.style.transform = `translate(${m.cell.x}px,${m.cell.y}px)`;
    for (const s of segs) {
      const A = marks[s.a].cell, B = marks[s.b].cell;
      s.l.setAttribute('x1', A.x); s.l.setAttribute('y1', A.y); s.l.setAttribute('x2', B.x); s.l.setAttribute('y2', B.y);
      s.l.style.display = Math.hypot(A.x - B.x, A.y - B.y) > MAX_LINE ? 'none' : '';
    }
  })();
})();
