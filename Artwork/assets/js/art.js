// art.js — generative placeholder visuals (used until a work has an `img`)
// drawArt(canvas, work, index) paints a seeded, unique piece per work.
function drawArt(cv, work, i) {
  const W = cv.width = 800, H = cv.height = 500, c = cv.getContext('2d');
  let s = (i + 1) * 9301 + 49297; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const hues = [18, 200, 330, 150, 45, 270], h = hues[i % hues.length];
  c.fillStyle = `hsl(${h},18%,9%)`; c.fillRect(0, 0, W, H);
  const k = i % 6;
  if (k === 0 || k === 5) {            // flow-field strokes
    for (let n = 0; n < 420; n++) {
      let x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y);
      for (let t = 0; t < 40; t++) { const a = Math.sin(x * .006 + i) * 3 + Math.cos(y * .008) * 3; x += Math.cos(a) * 4; y += Math.sin(a) * 4; c.lineTo(x, y); }
      c.strokeStyle = `hsla(${h + r() * 40},80%,${55 + r() * 30}%,.35)`; c.lineWidth = .8; c.stroke();
    }
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
  // grain
  for (let n = 0; n < 5000; n++) { c.fillStyle = `rgba(255,255,255,${r() * .06})`; c.fillRect(r() * W, r() * H, 1.5, 1.5); }
}
// Fill a container with the work's image or generated art
function workVisual(el, work, i) {
  if (work.img) { el.innerHTML = `<img src="${work.img}" alt="${work.title}">`; return; }
  const cv = document.createElement('canvas'); el.appendChild(cv); drawArt(cv, work, i);
}
