// heron-cursor.js — red ball with a fading tail, for every Artwork page (desktop only)
(function () {
  if (matchMedia('(hover: none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const b = document.body; b.classList.add('hc');
  document.querySelectorAll('.site-nav a').forEach(el => el.classList.add('px'));   // pixel hover on the menu, on every Artwork page
  const cv = document.createElement('canvas'); cv.className = 'hc-trail'; b.appendChild(cv);
  const ctx = cv.getContext('2d');
  const sq = document.createElement('div'); sq.className = 'hc-sq'; b.appendChild(sq);
  let W = 0, H = 0, dpr = 1;
  const fit = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  fit(); addEventListener('resize', fit);
  let mx = -100, my = -100, qx = -100, qy = -100, first = true; const trail = [];
  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    mx = e.clientX; my = e.clientY; b.classList.remove('hc-out');
    if (first) { qx = mx; qy = my; first = false; }
    const t = e.target.closest && e.target.closest('a, button, [data-hc], input, .px');
    b.classList.toggle('hc-link', !!t);
  }, { passive: true });
  document.addEventListener('pointerleave', () => b.classList.add('hc-out'));
  let last = performance.now();
  (function loop(now) {
    const dt = Math.min(50, now - last) / 16.67; last = now;
    const k = 1 - Math.pow(1 - .3, dt); qx += (mx - qx) * k; qy += (my - qy) * k;
    sq.style.transform = 'translate(' + qx + 'px,' + qy + 'px)';
    trail.push([qx, qy]); if (trail.length > 34) trail.shift();
    ctx.clearRect(0, 0, W, H);
    for (let i = 1; i < trail.length; i++) {            // older segments fade out
      ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]);
      ctx.strokeStyle = 'rgba(232,50,90,' + (i / trail.length * .9) + ')'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    requestAnimationFrame(loop);
  })(last);
})();
