// art.js — generative placeholder visuals (used until a work has an `img`)
// drawArt(canvas, work, index) paints a seeded, unique piece per work.
const __masters = {};                  // one painted 800×500 master per work → every other canvas is a cheap copy (gallery drew each piece twice)
function __master(i) {
  if (__masters[i]) return __masters[i];
  const cv = document.createElement('canvas');
  const W = cv.width = 800, H = cv.height = 500, c = cv.getContext('2d');
  let s = (i + 1) * 9301 + 49297; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const hues = [18, 200, 330, 150, 45, 270], h = hues[i % hues.length];
  c.fillStyle = `hsl(${h},18%,9%)`; c.fillRect(0, 0, W, H);
  const k = i % 6;
  if (k === 0 || k === 5) {            // flow-field strokes (batched into 8 colour groups instead of 420 separate stroke() calls)
    const bins = Array.from({ length: 8 }, () => new Path2D());
    for (let n = 0; n < 420; n++) {
      let x = r() * W, y = r() * H; const P = bins[n & 7]; P.moveTo(x, y);
      for (let t = 0; t < 40; t++) { const a = Math.sin(x * .006 + i) * 3 + Math.cos(y * .008) * 3; x += Math.cos(a) * 4; y += Math.sin(a) * 4; P.lineTo(x, y); }
    }
    c.lineWidth = .8;
    bins.forEach((P, n) => { c.strokeStyle = `hsla(${h + (n % 4) * 13},80%,${58 + (n >> 2) * 18 + (n % 3) * 3}%,.35)`; c.stroke(P); });
  } else if (k === 1) {                // type
    c.fillStyle = `hsl(${h},85%,62%)`; c.font = '900 440px Archivo, Arial Black, sans-serif'; c.textBaseline = 'middle';
    c.fillText('Aa', 70, H / 2 + 20); c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeText('Aa', 110, H / 2 + 40);
  } else if (k === 2) {                // motion rings
    for (let n = 0; n < 22; n++) { c.beginPath(); c.ellipse(W / 2 + n * 6, H / 2, 40 + n * 17, 30 + n * 9, n * .09, 0, 7); c.strokeStyle = `hsla(${h + n * 4},85%,65%,${.9 - n * .035})`; c.lineWidth = 1.5; c.stroke(); }
  } else if (k === 3) {                // UI blocks
    for (let n = 0; n < 14; n++) { const w = 80 + r() * 220, hh = 30 + r() * 110, x = r() * (W - w), y = r() * (H - hh); c.fillStyle = n % 4 ? `hsla(${h},60%,${30 + r() * 40}%,.85)` : '#f0ede8'; c.fillRect(x, y, w, hh); }
  } else {                             // web: dot grid
    for (let x = 20; x < W; x += 26) for (let y = 20; y < H; y += 26) { const d = Math.hypot(x - W * .6, y - H * .45); c.fillStyle = `hsla(${h},85%,70%,${Math.max(.08, 1 - d / 420)})`; c.beginPath(); c.arc(x, y, 1 + Math.max(0, 7 - d / 55), 0, 7); c.fill(); }
  }
  // grain: one small tile repeated, instead of 5000 separate fillRect()/colour parses per piece
  const tile = document.createElement('canvas'); tile.width = tile.height = 256; const tc = tile.getContext('2d');
  for (let n = 0; n < 900; n++) { tc.fillStyle = `rgba(255,255,255,${r() * .06})`; tc.fillRect(r() * 256, r() * 256, 1.5, 1.5); }
  c.fillStyle = c.createPattern(tile, 'repeat'); c.fillRect(0, 0, W, H);
  // the "Aa" piece needs the web font; don't freeze a fallback-font version into the cache
  if (!(k === 1 && document.fonts && !document.fonts.check('900 40px Archivo'))) __masters[i] = cv;
  return cv;
}
// drawArt(canvas, work, index, q) — q = size factor (1 = 800×500; thumbnails can use less)
function drawArt(cv, work, i, q) {
  q = q || 1; const m = __master(i);
  cv.width = Math.round(800 * q); cv.height = Math.round(500 * q);
  cv.getContext('2d').drawImage(m, 0, 0, cv.width, cv.height);
}

// ── idle queue: paint one piece per idle slice so the page transition / first frames never wait on canvas work ──
const __artQ = []; let __artRun = false;
const __idle = f => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 250 }) : setTimeout(f, 16));
function __pump() {
  if (__artRun) return; __artRun = true;
  const step = () => { const job = __artQ.shift(); if (!job) { __artRun = false; return; } job(); __idle(step); };
  __idle(step);
}
let __fontP; const __fontReady = () => __fontP || (__fontP = (document.fonts && document.fonts.load)
  ? Promise.race([document.fonts.load('900 40px Archivo'), new Promise(r => setTimeout(r, 1200))]).catch(() => {}) : Promise.resolve());

// Fill a container with the work's image or generated art.
// opts.lazy → paint later in idle time (fades in); opts.q → thumbnail size factor.
function workVisual(el, work, i, opts) {
  opts = opts || {};
  if (work.img) { el.innerHTML = `<img src="${work.img}" alt="${work.title}"${opts.lazy ? ' loading="lazy" decoding="async"' : ''}>`; return; }
  const cv = document.createElement('canvas'); el.appendChild(cv);
  if (!opts.lazy) { drawArt(cv, work, i, opts.q); return; }
  cv.style.opacity = '0'; cv.style.transition = 'opacity .35s ease';
  const job = () => { drawArt(cv, work, i, opts.q); requestAnimationFrame(() => { cv.style.opacity = '1'; }); };
  const enqueue = () => { __artQ.push(job); __pump(); };
  (i % 6 === 1) ? __fontReady().then(enqueue) : enqueue();
}
