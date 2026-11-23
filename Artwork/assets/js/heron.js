// heron.js — Artwork "Top": one continuous scene driven by the (smoothed) scroll position.
// S = scroll position measured in screens (1 = one viewport). Scenes are ranges of S.
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ramp = (s, a, b) => clamp((s - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, out = t => 1 - Math.pow(1 - t, 3);
  const END = 17.4;
  const world = $('#world'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  world.style.height = ((END + 1) * 100) + 'vh';
  $$('.site-nav a').forEach(a => a.classList.add('px'));
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ── loader ── */
  const load = $('#load'), pct = $('#pct'), ln = $('.ln', load), ldN = $('#ldN'), ldS = $('#ldS');
  const N = (typeof WORKS !== 'undefined') ? WORKS.length : 0;
  (function () {
    // play the loader once per visit; coming back to Top (from Gallery, Works…) skips it
    let seen = false; try { seen = !!sessionStorage.getItem('artTopSeen'); sessionStorage.setItem('artTopSeen', '1'); } catch (e) {}
    if (reduce || seen) { load.classList.add('done'); load.style.display = 'none'; return; }
    const t0 = performance.now(), D = 1700;
    (function tick(now) {
      const p = clamp((now - t0) / D), e = ease(p);
      pct.textContent = String(Math.round(e * 100)).padStart(3, '0') + '%';
      ln.style.transform = 'translateY(' + (e * innerHeight) + 'px)';
      ldN.textContent = String(Math.round(e * N)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(tick); else { ldS.textContent = 'ENTERING'; setTimeout(() => load.classList.add('done'), 150); }
    })(t0);
  })();

  /* ── scenes ── */
  const scenes = $$('.hv-s').map(el => { const [a, b] = el.dataset.r.split(',').map(Number); return { el, a, b }; });
  const hero = $('#s-hero'), bigc = $('.sc-bigc'), small = $('.sc-smallc'), tl = $('.sc-tl'), mq = $('#s-hero > .sc-mq'), cue = $('.hx-cue');

  // statements → words
  const stEls = ['#stA', '#stB'].map(sel => {
    const el = $(sel), [a, b] = el.dataset.w.split(',').map(Number), words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => '<span class="w">' + w + '</span>').join(' ');
    return { el, a, b, ws: $$('.w', el) };
  });
  const stNote = $('#stNote');

  // plan pieces
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const walls = $$('#walls .wl').map((el, i) => ({ el, x: (rnd() - .5) * 1000, y: (rnd() - .5) * 760, r: (rnd() - .5) * 80, d: i * .035 }));
  const dims = $('#dims'), dots = $('#dots'), planCard = $('#planCard');

  // cells
  const cells = $$('.hv-cell'), cellsEl = $('#cells'), cellHead = $('.hv-cellhead');
  cells.forEach(c => {
    c.addEventListener('pointerenter', () => { c.classList.add('act'); c.style.setProperty('--act', 1); });
    c.addEventListener('pointerleave', () => { c.classList.remove('act'); c.style.setProperty('--act', 0); c.style.setProperty('--mx', 0); });
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 2); });
  });

  // process
  const pfVis = $('#pfVis'), pfFig = $('#pfFig'), pfTxt = $('#pfTxt'), pfCall = $('#pfCall'), bar = $('#bar'), barK = $('#barK'), barV = $('#barV'), hair = $('#hair');
  const P = [
    ['SKETCH', 'Lorem ipsum dolor sit amet, consectetur elit.', 'Lorem ipsum'],
    ['COMPOSE', 'Sed do eiusmod tempor incididunt ut labore.', 'Dolor sit amet'],
    ['RENDER', 'Ut enim ad minim veniam, quis nostrud.', 'Consectetur elit'],
    ['FINISH', 'Duis aute irure dolor in reprehenderit.', 'Tempor ut labore']
  ];
  const barPos = [[.50, .44], [.40, .57], [.50, .70], [.40, .83]], callLeft = ['48%', '8%', '58%', '24%'];
  let pStep = -1;
  function setProc(i) {
    if (i === pStep || typeof WORKS === 'undefined') return; pStep = i;
    pfVis.innerHTML = ''; workVisual(pfVis, WORKS[i % WORKS.length], i);
    pfVis.classList.remove('glt'); void pfVis.offsetWidth; pfVis.classList.add('glt');
    barK.textContent = P[i][0]; barV.textContent = P[i][1]; pfFig.textContent = 'FIG. 0' + (i + 1) + ' — ' + P[i][0]; pfTxt.textContent = P[i][2];
    bar.classList.remove('sw'); void bar.offsetWidth; bar.classList.add('sw');
    pfCall.style.left = callLeft[i];
    placeBar();
  }
  function placeBar() {
    if (pStep < 0) return; const vw = innerWidth, vh = innerHeight, [bx, by] = barPos[pStep], y = by * vh;
    const x = Math.max(8, Math.min(bx * vw, vw - bar.offsetWidth - 20));
    bar.style.transform = 'translate(' + x + 'px,' + (y - 22) + 'px)'; hair.style.transform = 'translateY(' + y + 'px)';
  }

  // works list
  const rowsEl = $('#wRows'), wVis = $('#wVis'); let wBuilt = false, wCur = -1;
  function showWork(i) {
    if (i === wCur) return; wCur = i;
    $$('.hv-row', rowsEl).forEach((r, k) => r.classList.toggle('on', k === i));
    wVis.innerHTML = ''; workVisual(wVis, WORKS[i], i); wVis.classList.remove('wipe'); void wVis.offsetWidth; wVis.classList.add('wipe');
  }
  function buildWorks() {
    if (wBuilt || typeof WORKS === 'undefined') return; wBuilt = true;
    WORKS.forEach((w, i) => {
      const r = document.createElement('a'); r.className = 'hv-row'; r.href = 'works/index.html'; r.dataset.hc = '';
      r.innerHTML = '<small>' + w.num + '</small><strong>' + w.title + '</strong><em>+</em><p>' + w.category + ' · ' + w.year + ' — Lorem ipsum dolor sit amet.</p>';
      r.addEventListener('pointerenter', () => showWork(i)); rowsEl.appendChild(r);
    });
    showWork(0);
  }

  // end
  const cta = $('.hv-cta'), foot = $('#foot');
  const hud = $('#hudS'), hudP = $('#hudP'), names = [[0, '01 — TOP'], [2.4, '02 — STATEMENT'], [4.9, '03 — COMPOSITION'], [7.6, '04 — DISCIPLINES'], [10.8, '05 — PROCESS'], [14, '06 — WORKS'], [16, '07 — CONTACT']];

  /* ── frame loop ── */
  let S = scrollY / innerHeight, last = performance.now(), lastS = -1, lastW = innerWidth;
  function render() {
    const vw = innerWidth, vh = innerHeight;
    scenes.forEach(sc => {
      const fin = sc.a <= 0 ? 1 : ramp(S, sc.a, sc.a + .3), fout = sc.b > 50 ? 1 : 1 - ramp(S, sc.b - .3, sc.b);
      const o = fin * fout, on = o > .002; sc.el.classList.toggle('on', on); sc.el.style.opacity = o; sc.el.style.pointerEvents = o > .6 ? 'auto' : 'none';
    });
    // hero: pieces leave at different speeds, marquee drifts sideways
    const hp = ramp(S, 0, 1.3);
    bigc.style.transform = 'translateY(' + (-hp * 42 * vh / 100) + 'px)'; small.style.transform = 'translateY(' + (-hp * 78 * vh / 100) + 'px)';
    tl.style.transform = 'translateY(' + (-hp * 20 * vh / 100) + 'px)'; mq.style.transform = 'translateX(' + (-hp * 22 * vw / 100) + 'px)'; cue.style.opacity = 1 - ramp(S, 0, .25);
    // statements: word by word
    stEls.forEach((st, k) => {
      const n = st.ws.length, span = st.b - st.a;
      st.ws.forEach((w, i) => { const s0 = st.a + span * (i / n) * .8; w.style.opacity = .14 + .86 * ramp(S, s0, s0 + span * .3); });
      const vis = k === 0 ? 1 - ramp(S, 2.68, 2.92) : ramp(S, 2.9, 3.1) * (1 - ramp(S, 3.95, 4.2));
      st.el.style.opacity = vis; st.el.style.transform = 'translateY(' + ((1 - (k === 0 ? 1 : ramp(S, 2.9, 3.3))) * 5 * vh / 100) + 'px)';
    });
    stNote.style.opacity = ramp(S, 1.5, 2.0) * (1 - ramp(S, 3.9, 4.1));
    // plan: loose pieces assemble
    walls.forEach(w => { const t = 1 - out(ramp(S, 4.1 + w.d, 5.4 + w.d)); w.el.style.transform = 'translate(' + (w.x * t) + 'px,' + (w.y * t) + 'px) rotate(' + (w.r * t) + 'deg)'; w.el.style.opacity = .2 + .8 * (1 - t); });
    dims.style.opacity = ramp(S, 5.5, 5.95); dots.style.opacity = ramp(S, 5.85, 6.1);
    const pc = ramp(S, 4.5, 5.0); planCard.style.opacity = pc; planCard.style.transform = 'translateY(' + ((1 - pc) * 30) + 'px)';
    // cells rise in
    const ce = ease(ramp(S, 6.55, 7.5));
    cellHead.style.opacity = ramp(S, 6.55, 7.1); cellHead.style.transform = 'translateY(' + ((1 - ramp(S, 6.55, 7.1)) * 40) + 'px)';
    cells.forEach((c, i) => { const t = ease(ramp(S, 6.6 + i * .1, 7.4 + i * .1)); c.style.opacity = t; c.style.transform = 'translateY(' + ((1 - t) * 45 * vh / 100) + 'px)'; });
    // process
    if (S > 8.4 && S < 13.5) setProc(Math.floor(clamp((S - 9.0) / 1.0, 0, 3.999)));
    // works
    if (S > 12.4) buildWorks();
    $('#wPanel').style.transform = 'translateX(' + (-(1 - ease(ramp(S, 13.0, 13.9))) * 100) + '%)';
    $('.hv-wlist').style.transform = 'translateY(' + ((1 - ease(ramp(S, 13.0, 14.0))) * 12 * vh / 100) + 'px)';
    // end
    const ee = ease(ramp(S, 15.1, 16.4)); foot.style.transform = 'translateY(' + ((1 - ee) * 62 * vh / 100) + 'px)';
    cta.style.opacity = ramp(S, 15.1, 15.7); cta.style.transform = 'translateY(' + ((1 - ramp(S, 15.1, 15.9)) * 8 * vh / 100) + 'px)';
    // hud
    let nm = names[0][1]; names.forEach(n => { if (S >= n[0]) nm = n[1]; }); hud.textContent = nm;
    hudP.textContent = String(Math.round(clamp(S / END) * 100)).padStart(3, '0') + '%';
  }
  (function loop(now) {
    const dt = Math.min(50, now - last) / 16.67; last = now;
    const T = scrollY / innerHeight; S += (T - S) * (reduce ? 1 : 1 - Math.pow(1 - .085, dt));
    if (Math.abs(S - lastS) > .0002 || innerWidth !== lastW) { render(); lastS = S; lastW = innerWidth; placeBar(); }
    requestAnimationFrame(loop);
  })(last);
  addEventListener('resize', () => { world.style.height = ((END + 1) * 100) + 'vh'; });
})();
