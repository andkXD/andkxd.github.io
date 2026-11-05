// ============================================
// CLOUD BACKGROUND — Gather-style 3D point cloud behind the portfolio
// A picture becomes thousands of points (depth = picture brightness) that drift,
// flee from the mouse, and tilt with it. Sits between the stars and the page content.
//
// YOUR OWN PICTURE: put it at  assets/img/cloud.jpg  (or .png / .webp). Bright areas become
// near/bright points, dark areas stay empty. No file there → a built-in sphere + ring is used.
// You can also drag & drop any image onto the page to try it (only for that visit).
// ============================================
(() => {
  // ── settings (edit these) ──
  const POINTS   = 100000;   // max number of points (lower = lighter on weak laptops)
  const DRIFT    = 0.30;    // 0–1  how much the points wander + stream to the right
  const SPLASH   = 0.50;    // 0–1  how strongly the mouse pushes points away
  const GATHER   = 1.00;    // 0–1  how tightly points hug the picture (1 = crisp)
  const DEPTH    = 150;     // depth of the relief
  const SIZE     = 2.0;     // point size
  const SHIFT_X  = 200;     // move the cloud right (+) / left (−)
  const SCALE    = 0.85;    // overall size of the cloud
  const MARKS_ON_PICTURE = 3;   // groups of 3 tracker brackets on the picture (0 = none)
  const MARKS_ON_STARS   = 5;   // groups of 3 tracker brackets on the background stars (0 = none)
  const START_MS = 1200;    // wait before the cloud gathers (lets the intro finish)

  if (!window.THREE) return;
  const BASE = new URL('../img/', document.currentScript.src).href;
  const VS = `
  attribute float aLum; attribute vec3 aRnd;
  uniform float uTime, uDrift, uSplash, uGather, uDepth, uAppear, uBurst, uSize, uPx; uniform vec3 uMouse;
  varying float vL;
  void main(){
    vec3 p = vec3(position.xy, (position.z - .5) * uDepth);
    vec3 n = vec3(sin(uTime*.6 + aRnd.x*40.), cos(uTime*.5 + aRnd.y*40.), sin(uTime*.7 + aRnd.z*40.));
    p += n * uDrift * 14.;
    p += (aRnd - .5) * (1. - uGather) * 90. * (.3 + aRnd.x);
    float edge = smoothstep(.1, 1., position.x / 300.);
    p.x += edge * aRnd.y * uDrift * 220. * (.5 + .5 * sin(uTime*.4 + aRnd.z*6.));
    p.y += edge * (aRnd.x - .5) * uDrift * 60.;
    p += (aRnd - .5) * vec3(900., 700., 600.) * uBurst * (.4 + aRnd.y);
    vec2 d = p.xy - uMouse.xy; float f = smoothstep(110., 0., length(d));
    p.xy += normalize(d + 1e-3) * f * uSplash * 70.; p.z += (aRnd.z - .5) * f * uSplash * 140.;
    p = mix((aRnd - .5) * 260. * (.3 + aRnd.x * .7), p, uAppear);
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_PointSize = uSize * uPx * (900. / -mv.z) * (.55 + aLum * .7);
    gl_Position = projectionMatrix * mv; vL = aLum;
  }`;
  const FS = `
  varying float vL; uniform float uInvert;
  void main(){
    float r = length(gl_PointCoord - .5); if (r > .5) discard;
    float a = smoothstep(.04, .5, vL) * smoothstep(.5, .15, r);
    gl_FragColor = vec4(mix(vec3(1., .96, .87), vec3(.05), uInvert) * (.35 + vL * .9), a * .9);
  }`;

  // ── layer + renderer (transparent, never blocks clicks) ──
  const box = document.createElement('div');
  box.id = 'cloud-bg'; box.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none';
  const css = document.createElement('style');
  css.textContent = '#cloud-bg .mk{position:absolute;left:0;top:0;font:500 10px "Roboto Mono",monospace;letter-spacing:.08em;white-space:nowrap;color:var(--cb-fg,#ddd);opacity:.6}' +
    '#cloud-bg .mk svg{position:absolute;left:-7px;top:-7px}#cloud-bg .mk span{position:absolute;left:12px;top:-6px}#cloud-bg svg.ln{position:absolute;inset:0;width:100%;height:100%;stroke:var(--cb-fg,#ddd);opacity:.22}';
  document.head.appendChild(css); document.body.insertBefore(box, document.body.firstChild.nextSibling || null);
  const R = new THREE.WebGLRenderer({ alpha: true, antialias: false }); R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.setClearColor(0x000000, 0);
  R.domElement.style.display = 'block';
  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); lines.setAttribute('class', 'ln'); lines.setAttribute('stroke-width', '1');
  const hud = document.createElement('div'); hud.style.cssText = 'position:absolute;inset:0';
  box.append(R.domElement, lines, hud);

  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, 1, 4000), group = new THREE.Group();
  cam.position.z = 900; group.position.x = SHIFT_X; group.scale.setScalar(SCALE); scene.add(group);
  const U = { uTime: { value: 0 }, uDrift: { value: DRIFT }, uSplash: { value: SPLASH }, uGather: { value: GATHER }, uDepth: { value: DEPTH }, uAppear: { value: 0 },
    uBurst: { value: 0 }, uSize: { value: SIZE }, uPx: { value: R.getPixelRatio() }, uMouse: { value: new THREE.Vector3(9999, 9999, 0) }, uInvert: { value: 0 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  function fit() { const w = innerWidth, h = innerHeight; R.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  addEventListener('resize', fit); fit();

  // ── picture → points ──
  let pts = null, cur = null, appearT = -START_MS / 1000, mks = [], mm = [];
  function build(src) {
    const s = Math.min(1, Math.sqrt(POINTS * (src.depthCanvas ? 2.4 : 1) / (src.width * src.height))), cw = Math.max(8, Math.round(src.width * s)), ch = Math.max(8, Math.round(src.height * s));
    const o = document.createElement('canvas'); o.width = cw; o.height = ch;
    const g = o.getContext('2d', { willReadFrequently: true }); g.drawImage(src, 0, 0, cw, ch);
    const d = g.getImageData(0, 0, cw, ch).data, L = new Float32Array(cw * ch);
    for (let i = 0; i < cw * ch; i++) L[i] = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) / 255;
    let D = L;
    if (src.depthCanvas) {
      const o2 = document.createElement('canvas'); o2.width = cw; o2.height = ch; const g2 = o2.getContext('2d', { willReadFrequently: true });
      g2.drawImage(src.depthCanvas, 0, 0, cw, ch); const dd = g2.getImageData(0, 0, cw, ch).data; D = new Float32Array(cw * ch);
      for (let i = 0; i < cw * ch; i++) D[i] = dd[i * 4] / 255;
    }
    for (let pass = 0; pass < (src.depthCanvas ? 0 : 2); pass++) {
      const B = new Float32Array(cw * ch);
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
        let sum = 0, c = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < cw && yy < ch) { sum += D[yy * cw + xx]; c++; } }
        B[y * cw + x] = sum / c;
      }
      D = B;
    }
    let mn = 1, mx = 0; for (const v of D) { if (v < mn) mn = v; if (v > mx) mx = v; }
    const rg = (mx - mn) || 1, u = 560 / Math.max(cw, ch), pos = [], lum = [], rnd = [];
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const i = y * cw + x, l = L[i]; if (l < .03) continue;
      if (src.depthCanvas && Math.random() > Math.pow(l, 1.15)) continue;   // moon: brightness = grain density
      pos.push((x - cw / 2) * u, -(y - ch / 2) * u, (D[i] - mn) / rg); lum.push(l); rnd.push(Math.random(), Math.random(), Math.random());
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('aLum', new THREE.Float32BufferAttribute(lum, 1)); geo.setAttribute('aRnd', new THREE.Float32BufferAttribute(rnd, 3));
    if (pts) { group.remove(pts); pts.geometry.dispose(); }
    pts = new THREE.Points(geo, mat); pts.frustumCulled = false; group.add(pts);
    U.uDepth.value = src.depthScale || DEPTH;
    cur = { pos, lum, n: lum.length }; appearT = 0; markers();
  }
  function fallback() {   // built-in picture: a cratered moon lit from the upper left (real sphere depth)
    const N = 640, c = document.createElement('canvas'), dc = document.createElement('canvas'); c.width = c.height = dc.width = dc.height = N;
    const g = c.getContext('2d'), gd = dc.getContext('2d'), im = g.createImageData(N, N), dm = gd.createImageData(N, N);
    const R = 235, cx = N / 2, cy = N / 2, Lt = [-.62, -.35, .70]; let s = 11; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const cr = [], mar = [];
    for (let i = 0; i < 70; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * R * .92; cr.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d, 6 + rnd() * rnd() * 46]); }
    for (let i = 0; i < 6; i++) { const a = rnd() * 6.283, d = (.25 + rnd() * .6) * R; mar.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d, 28 + rnd() * 40]); }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4, nx = (x - cx) / R, ny = (y - cy) / R, r2 = nx * nx + ny * ny;
      im.data[i + 3] = dm.data[i + 3] = 255; if (r2 > 1) continue;
      const nz = Math.sqrt(1 - r2); let alb = .9, relief = 0;
      for (const m of mar) { const d = Math.hypot(x - m[0], y - m[1]); alb -= .24 * Math.exp(-(d * d) / (m[2] * m[2])); }
      alb += Math.sin(x * .21 + Math.sin(y * .13) * 2) * Math.sin(y * .17 + Math.cos(x * .09) * 2) * .04;
      for (const q of cr) { const d = Math.hypot(x - q[0], y - q[1]) / q[2]; if (d < 1.25) { if (d < .9) { alb *= .82; relief -= .5 * (1 - d * d); } else { alb += .14 * (1.25 - d) / .35; relief += .3; } } }
      const lam = Math.pow(Math.max(0, nx * Lt[0] + ny * Lt[1] + nz * Lt[2]), .9), v = (.03 + .97 * lam) * Math.max(.42, Math.min(1, alb)) * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      dm.data[i] = dm.data[i + 1] = dm.data[i + 2] = Math.max(0, Math.min(1, nz * .9 + relief * .05 + alb * .05)) * 255;
    }
    g.putImageData(im, 0, 0); gd.putImageData(dm, 0, 0); c.depthCanvas = dc; c.depthScale = 210; return c;
  }
  function fromImage(img) { const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height; c.getContext('2d').drawImage(img, 0, 0); return c; }
  (function load(list) {
    if (!list.length) return build(fallback());
    const img = new Image(); img.onload = () => build(fromImage(img)); img.onerror = () => load(list.slice(1)); img.src = BASE + list[0];
  })(['cloud.jpg', 'cloud.png', 'cloud.webp', 'cloud.jpeg']);
  addEventListener('dragover', e => e.preventDefault());
  addEventListener('drop', e => { const f = [...e.dataTransfer.files].find(f => f.type.startsWith('image/')); if (!f) return; e.preventDefault(); createImageBitmap(f).then(b => build(fromImage(b))); });

  // ── tracker brackets: groups of 3 on the picture and on the background stars ──
  const MK = '<svg width="14" height="14" fill="none" stroke="currentColor"><path d="M.5 4.5v-4h4M9.5 .5h4v4M13.5 9.5v4h-4M4.5 13.5h-4v-4M7 5v4M5 7h4"/></svg><span></span>';
  let starsOK = false;
  const fmt = (n, v) => String(n).padStart(2, '0') + ' ' + (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);
  function groupsOf(count, sample, dist) {            // each group = a point + its 2 nearest neighbours (from a random sample)
    const out = [];
    for (let g = 0; g < count; g++) { const s = sample(), c = Array.from({ length: 60 }, sample).sort((a, b) => dist(s, a) - dist(s, b)); out.push([s, c[0], c[1]]); }
    return out;
  }
  function markers() {
    hud.innerHTML = ''; lines.innerHTML = ''; mks = []; mm = [];
    starsOK = typeof cells !== 'undefined' && cells.length > 50;                      // stars come from sketch.js
    const add = (list, mk) => { let first = mks.length; list.forEach(it => { const el = document.createElement('div'); el.className = 'mk'; el.innerHTML = MK; hud.appendChild(el);
      const m = mk(it); m.el = el; m.sp = el.querySelector('span'); m.sp.textContent = fmt(mks.length + 1, m.val); m.sx = m.sy = 0; mks.push(m); });
      for (let g = first; g + 2 < mks.length + 0; g += 3) [[g, g + 1], [g + 1, g + 2]].forEach(([a, b]) => { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); lines.appendChild(l); mm.push({ l, a, b }); }); };
    const pic = () => { let t = 0, i; do { i = (Math.random() * cur.n) | 0; } while (cur.lum[i] < .3 && ++t < 40); return { x: cur.pos[i * 3], y: cur.pos[i * 3 + 1], d: cur.pos[i * 3 + 2] }; };
    add(groupsOf(MARKS_ON_PICTURE, pic, (a, b) => Math.hypot(a.x - b.x, a.y - b.y)).flat(), p => ({ kind: 'pic', x: p.x, y: p.y, d: p.d, val: p.d * .75 - .57 }));
    if (starsOK && MARKS_ON_STARS) {
      const star = () => { let t = 0, c; do { c = cells[(Math.random() * cells.length) | 0]; } while (c.sz < 1.6 && ++t < 40); return c; };
      add(groupsOf(MARKS_ON_STARS, star, (a, b) => Math.hypot(a.x - b.x, a.y - b.y)).flat(), c => ({ kind: 'star', cell: c, val: -(.44 + Math.random() * .13) }));
    }
  }
  addEventListener('resize', () => { if (cur) markers(); });

  // ── mouse: push points away + tilt; click empty space = splash ──
  const ndc = new THREE.Vector2(9, 9), clock = new THREE.Clock(), ray = new THREE.Raycaster(), inv = new THREE.Matrix4(), V = new THREE.Vector3();
  let tiltX = 0, tiltY = 0, burst = 0, light = null;
  addEventListener('pointermove', e => { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
  document.addEventListener('pointerleave', () => ndc.set(9, 9));
  addEventListener('pointerdown', e => { if (!e.target.closest('a,button,input,select,textarea,label')) burst = .55; });

  (function loop() {
    requestAnimationFrame(loop); if (document.hidden || !pts) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime; U.uTime.value = t;
    const isLight = window.__THEME__ === 'light';
    if (isLight !== light) { light = isLight; U.uInvert.value = +light; mat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending; mat.needsUpdate = true;
      box.style.setProperty('--cb-fg', light ? '#111' : '#ddd'); }
    tiltY += ((ndc.x > 5 ? 0 : ndc.x) * .35 - tiltY) * .05; tiltX += ((ndc.y > 5 ? 0 : -ndc.y) * .2 - tiltX) * .05;
    group.rotation.set(tiltX, tiltY + Math.sin(t * .25) * .1, 0); group.updateMatrixWorld();
    appearT += dt; const a = Math.max(0, Math.min(1, appearT / 2.6)); U.uAppear.value = 1 - Math.pow(1 - a, 3);
    burst *= .94; U.uBurst.value = burst < .01 ? 0 : burst;
    ray.setFromCamera(ndc, cam); inv.copy(group.matrixWorld).invert();
    const o = ray.ray.origin.clone().applyMatrix4(inv), d = ray.ray.direction.clone().transformDirection(inv), k = -o.z / d.z;
    U.uMouse.value.set(o.x + d.x * k, o.y + d.y * k, 0);
    const w = innerWidth, h = innerHeight;
    if (!starsOK && cur && typeof cells !== 'undefined' && cells.length > 50) markers();   // stars appear after p5 starts
    for (const m of mks) {
      if (m.kind === 'star') { m.sx = m.cell.x; m.sy = m.cell.y; }
      else { V.set(m.x, m.y, (m.d - .5) * U.uDepth.value).applyMatrix4(group.matrixWorld).project(cam); m.sx = (V.x * .5 + .5) * w; m.sy = (-V.y * .5 + .5) * h; }
      m.el.style.transform = `translate(${m.sx}px,${m.sy}px)`;
    }
    for (const c of mm) { const A = mks[c.a], B = mks[c.b]; c.l.setAttribute('x1', A.sx); c.l.setAttribute('y1', A.sy); c.l.setAttribute('x2', B.sx); c.l.setAttribute('y2', B.sy); }
    R.render(scene, cam);
  })();
})();
