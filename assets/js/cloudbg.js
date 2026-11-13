// ============================================
// CLOUD BACKGROUND — Gather-style 3D point cloud behind the portfolio
// Default: a full 3D MOON made of grains (brightness = grain density, light fixed at the
// upper-left so the shadow moves as it turns). Drag the moon to spin it; hover pushes grains away.
//
// YOUR OWN PICTURE: put it at  assets/img/cloud.jpg  (or .png / .webp) → it becomes a relief
// point cloud instead (bright = near). You can also drag & drop an image onto the page to try it.
// ============================================
(() => {
  // ── settings (edit these) ──
  const POINTS   = 50000;   // number of visible grains (lower = lighter on weak laptops)
  const DRIFT    = 1.00;    // 0–1  how much the grains wander + stream to the right
  const SPLASH   = 0.60;    // 0–1  how strongly the mouse (hover) pushes grains away
  const GATHER   = 0.85;    // 0–1  how tightly grains hug the shape (1 = crisp)
  const SIZE     = 1.5;     // grain size
  const SHIFT_X  = 220;     // move the cloud right (+) / left (−)
  const SCALE    = 0.85;    // overall size
  const IDLE_SPIN = 0.0020; // slow automatic turning of the moon, radians per frame (0 = off)
  const MARKS_ON_PICTURE = 0; // groups of 3 tracker brackets on the moon (0 = none)
  const START_MS = 1200;    // wait before the cloud gathers (lets the intro finish)
  const MOON_R   = 215;     // moon radius (world units)
  const DEPTH    = 150;     // relief depth for your own pictures

  if (!window.THREE) return;
  const MOBILE = () => innerWidth < 700;                               // phones: smaller, centred, lighter
  const PTS = () => MOBILE() ? Math.min(POINTS, 30000) : POINTS;
  if (matchMedia('(hover: none)').matches) document.documentElement.style.touchAction = 'none';   // so dragging the moon never scrolls/zooms the page
  const BASE = new URL('../img/', document.currentScript.src).href;
  const COMMON = `
  uniform float uTime, uDrift, uSplash, uGather, uAppear, uBurst, uSize, uPx;`;
  const VS_RELIEF = COMMON + `
  attribute float aLum; attribute vec3 aRnd; uniform float uDepth; uniform vec3 uMouse; varying float vL;
  void main(){
    vec3 p = vec3(position.xy, (position.z - .5) * uDepth);
    vec3 n = vec3(sin(uTime*.6 + aRnd.x*40.), cos(uTime*.5 + aRnd.y*40.), sin(uTime*.7 + aRnd.z*40.));
    p += n * uDrift * 14.;
    p += (aRnd - .5) * (1. - uGather) * 90. * (.3 + aRnd.x);
    float edge = smoothstep(.1, 1., position.x / 300.);
    p.x += edge * aRnd.y * uDrift * 220. * (.5 + .5 * sin(uTime*.4 + aRnd.z*6.));
    p.y += edge * (aRnd.x - .5) * uDrift * 60.;
    vec2 d = p.xy - uMouse.xy; float f = smoothstep(110., 0., length(d));
    p.xy += normalize(d + 1e-3) * f * uSplash * 70.; p.z += (aRnd.z - .5) * f * uSplash * 140.;
    p = mix((aRnd - .5) * 260. * (.3 + aRnd.x * .7), p, uAppear);
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_PointSize = uSize * uPx * (900. / -mv.z) * (.55 + aLum * .7);
    gl_Position = projectionMatrix * mv; vL = aLum;
  }`;
  const VS_SPHERE = COMMON + `
  attribute float aLum; attribute float aT; attribute vec3 aRnd; uniform vec3 uMouseW, uLight; varying float vL;
  void main(){
    vec3 nv = normalize(normalMatrix * normalize(position));          // surface normal as seen by the camera
    float lum = (.03 + .97 * pow(max(0., dot(nv, uLight)), .9)) * aLum; // fixed light → shadow moves while spinning
    bool hide = aT > pow(lum, 1.15) || nv.z < -.1;                    // grain density = brightness; hide the far side
    vec3 p = position;
    vec3 n = vec3(sin(uTime*.6 + aRnd.x*40.), cos(uTime*.5 + aRnd.y*40.), sin(uTime*.7 + aRnd.z*40.));
    p += n * uDrift * 14. + (aRnd - .5) * (1. - uGather) * 90. * (.3 + aRnd.x);
    p = mix((aRnd - .5) * 260. * (.3 + aRnd.x * .7), p, uAppear);
    vec4 wp = modelMatrix * vec4(p, 1.);
    float edge = smoothstep(.1, 1., (wp.x - modelMatrix[3].x) / 175.);   // grains on the right side stream away
    wp.x += edge * aRnd.y * uDrift * 220. * (.5 + .5 * sin(uTime*.4 + aRnd.z*6.));
    wp.y += edge * (aRnd.x - .5) * uDrift * 60.;
    vec2 d = wp.xy - uMouseW.xy; float f = smoothstep(110., 0., length(d));  // hover pushes grains away
    wp.xy += normalize(d + 1e-3) * f * uSplash * 70.; wp.z += (aRnd.z - .5) * f * uSplash * 140.;
    vec4 mv = viewMatrix * wp;
    gl_PointSize = hide ? 0. : uSize * uPx * (900. / -mv.z) * (.7 + lum * .5);
    gl_Position = hide ? vec4(2., 2., 2., 1.) : projectionMatrix * mv;
    vL = .4 + .6 * lum;
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
  const R = new THREE.WebGLRenderer({ alpha: true, antialias: false }); R.setPixelRatio(Math.min(devicePixelRatio, MOBILE() ? 1 : 1.5)); R.setClearColor(0x000000, 0);
  R.domElement.style.display = 'block';
  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); lines.setAttribute('class', 'ln'); lines.setAttribute('stroke-width', '1');
  const hud = document.createElement('div'); hud.style.cssText = 'position:absolute;inset:0';
  box.append(R.domElement, lines, hud);

  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, 1, 4000), group = new THREE.Group();
  cam.position.z = 900; scene.add(group);
  const U = { uTime: { value: 0 }, uDrift: { value: DRIFT }, uSplash: { value: SPLASH }, uGather: { value: GATHER }, uDepth: { value: DEPTH }, uAppear: { value: 0 },
    uBurst: { value: 0 }, uSize: { value: SIZE }, uPx: { value: R.getPixelRatio() }, uMouse: { value: new THREE.Vector3(9999, 9999, 0) }, uMouseW: { value: new THREE.Vector3(9999, 9999, 0) },
    uLight: { value: new THREE.Vector3(-.62, .35, .70).normalize() }, uInvert: { value: 0 } };
  const mk = vs => new THREE.ShaderMaterial({ uniforms: U, vertexShader: vs, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const matR = mk(VS_RELIEF), matS = mk(VS_SPHERE);
  // phones: park the moon just above the bottom-right text block so it never sits on top of it
  function mobileY() {
    const u  = 2 * 900 * Math.tan(Math.PI / 9) / innerHeight;              // world units per CSS px (camera fov 40°, z = 900)
    const rPx = MOON_R * SCALE * .5 / u;                                    // moon radius in CSS px
    const br = document.querySelector('.bottom-right');
    const textTop = br ? innerHeight - br.offsetHeight - (parseFloat(getComputedStyle(br).bottom) || 0) : innerHeight * .7;
    const centrePx = Math.max(innerHeight * .34, textTop - 16 - rPx);        // not higher than ~1/3 of the screen
    return (innerHeight / 2 - centrePx) * u;
  }
  function layout() { const m = MOBILE(); group.position.set(m ? 28 : SHIFT_X, m ? mobileY() : 0, 0); group.scale.setScalar(m ? SCALE * .5 : SCALE); box.style.opacity = m ? .6 : 1; U.uDrift.value = m ? DRIFT * .4 : DRIFT; }
  function fit() { const w = innerWidth, h = innerHeight; R.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); layout(); }
  addEventListener('resize', fit); fit();

  let pts = null, cur = null, appearT = -START_MS / 1000, mks = [], mm = [];
  function show(geo, material, info) {
    if (pts) { group.remove(pts); pts.geometry.dispose(); }
    pts = new THREE.Points(geo, material); pts.frustumCulled = false; group.add(pts);
    cur = info; appearT = 0; markers();
  }

  // ── default picture: a full 3D moon (grains on the whole sphere) ──
  function buildMoon() {
    const N = Math.round(PTS() * 2.8), pos = new Float32Array(N * 3), alb = new Float32Array(N), rnd = new Float32Array(N * 3), thr = new Float32Array(N);
    let s = 11; const rr = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const unit = () => { const z = rr() * 2 - 1, a = rr() * 6.283, r = Math.sqrt(1 - z * z); return [r * Math.cos(a), r * Math.sin(a), z]; };
    const cr = Array.from({ length: 70 }, () => { const u = unit(), r = .03 + rr() * rr() * .2; return { u, r, cmax: Math.cos(Math.min(3.1, r * 1.25)) }; });
    const mar = Array.from({ length: 6 }, () => ({ u: unit(), r: .3 + rr() * .35 }));
    const GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), th = i * GA, nx = Math.cos(th) * r, nz = Math.sin(th) * r;
      let a = .9;
      for (const m of mar) { const d = Math.acos(Math.min(1, nx * m.u[0] + y * m.u[1] + nz * m.u[2])); a -= .24 * Math.exp(-(d * d) / (m.r * m.r)); }
      for (const c of cr) { const dt = nx * c.u[0] + y * c.u[1] + nz * c.u[2]; if (dt > c.cmax) { const d = Math.acos(Math.min(1, dt)) / c.r; if (d < .9) a *= .82; else a += .14 * (1.25 - d) / .35; } }
      a += Math.sin(nx * 40 + Math.sin(y * 23) * 2) * Math.sin(nz * 33 + Math.cos(nx * 17) * 2) * .04;
      alb[i] = Math.max(.42, Math.min(1, a));
      const k = MOON_R * (1 + (rr() - .5) * .012); pos[i * 3] = nx * k; pos[i * 3 + 1] = y * k; pos[i * 3 + 2] = nz * k;
      rnd[i * 3] = Math.random(); rnd[i * 3 + 1] = Math.random(); rnd[i * 3 + 2] = Math.random(); thr[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aLum', new THREE.BufferAttribute(alb, 1));
    geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 3)); geo.setAttribute('aT', new THREE.BufferAttribute(thr, 1));
    show(geo, matS, { sphere: true, pos, lum: alb, n: N, hitR: MOON_R + 15 });
  }

  // ── your own picture → relief point cloud (bright = near) ──
  function buildRelief(src) {
    const s = Math.min(1, Math.sqrt(PTS() / (src.width * src.height))), cw = Math.max(8, Math.round(src.width * s)), ch = Math.max(8, Math.round(src.height * s));
    const o = document.createElement('canvas'); o.width = cw; o.height = ch;
    const g = o.getContext('2d', { willReadFrequently: true }); g.drawImage(src, 0, 0, cw, ch);
    const d = g.getImageData(0, 0, cw, ch).data, L = new Float32Array(cw * ch);
    for (let i = 0; i < cw * ch; i++) L[i] = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) / 255;
    let D = L;
    for (let pass = 0; pass < 2; pass++) {
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
      pos.push((x - cw / 2) * u, -(y - ch / 2) * u, (D[i] - mn) / rg); lum.push(l); rnd.push(Math.random(), Math.random(), Math.random());
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('aLum', new THREE.Float32BufferAttribute(lum, 1)); geo.setAttribute('aRnd', new THREE.Float32BufferAttribute(rnd, 3));
    show(geo, matR, { sphere: false, pos, lum, n: lum.length, hitR: 290 });
  }
  const fromImage = img => { const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height; c.getContext('2d').drawImage(img, 0, 0); return c; };
  (function load(list) {
    if (!list.length) return buildMoon();
    const img = new Image(); img.onload = () => buildRelief(fromImage(img)); img.onerror = () => load(list.slice(1)); img.src = BASE + list[0];
  })(['cloud.jpg', 'cloud.png', 'cloud.webp', 'cloud.jpeg']);
  addEventListener('dragover', e => e.preventDefault());
  addEventListener('drop', e => { const f = [...e.dataTransfer.files].find(f => f.type.startsWith('image/')); if (!f) return; e.preventDefault(); createImageBitmap(f).then(b => buildRelief(fromImage(b))); });

  // ── tracker brackets on the picture (stay glued to the surface, hide on the far side) ──
  const MK = '<svg width="14" height="14" fill="none" stroke="currentColor"><path d="M.5 4.5v-4h4M9.5 .5h4v4M13.5 9.5v4h-4M4.5 13.5h-4v-4M7 5v4M5 7h4"/></svg><span></span>';
  const fmt = (n, v) => String(n).padStart(2, '0') + ' ' + (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);
  function markers() {
    hud.innerHTML = ''; lines.innerHTML = ''; mks = []; mm = []; if (!MARKS_ON_PICTURE || !cur) return;
    const sph = cur.sphere, L = U.uLight.value;
    const pic = () => {
      let t = 0, i, x, y, z;
      do { i = (Math.random() * cur.n) | 0; x = cur.pos[i * 3]; y = cur.pos[i * 3 + 1]; z = cur.pos[i * 3 + 2]; t++; }
      while (t < 80 && (sph ? (z / MOON_R < .2 || (x * L.x + y * L.y + z * L.z) / MOON_R < .3) : cur.lum[i] < .3));
      return sph ? { sph: true, x, y, z, nx: x / MOON_R, ny: y / MOON_R, nz: z / MOON_R, val: (z / MOON_R) * .6 - .2 } : { x, y, d: z, val: z * .75 - .57 };
    };
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
    for (let g = 0; g < MARKS_ON_PICTURE; g++) {
      const s = pic(), c = Array.from({ length: 60 }, pic).sort((a, b) => dist(s, a) - dist(s, b)), first = mks.length;
      [s, c[0], c[1]].forEach(m => {
        const el = document.createElement('div'); el.className = 'mk'; el.innerHTML = MK; hud.appendChild(el);
        m.el = el; el.querySelector('span').textContent = fmt(mks.length + 1, m.val); m.sx = m.sy = 0; m.vis = true; mks.push(m);
      });
      [[0, 1], [1, 2]].forEach(([a, b]) => { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); lines.appendChild(l); mm.push({ l, a: first + a, b: first + b }); });
    }
  }

  // ── mouse: hover pushes grains away · drag the moon to spin it (no click splash) ──
  const ndc = new THREE.Vector2(9, 9), clock = new THREE.Clock(), ray = new THREE.Raycaster(), inv = new THREE.Matrix4(), V = new THREE.Vector3(), V2 = new THREE.Vector3(), NV = new THREE.Vector3();
  let tiltX = 0, tiltY = 0, rotX = 0, rotY = 0, velX = 0, velY = 0, drag = null, light = null;
  const UI = 'a,button,input,select,textarea,label';
  function overMoon(cx, cy) {
    if (!cur) return false;
    V.set(group.position.x, group.position.y, 0).project(cam); V2.set(group.position.x + cur.hitR * group.scale.x, group.position.y, 0).project(cam);
    return Math.hypot(cx - (V.x * .5 + .5) * innerWidth, cy - (-V.y * .5 + .5) * innerHeight) < Math.abs(V2.x - V.x) * .5 * innerWidth;
  }
  addEventListener('pointermove', e => {
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
      rotY += dx * .006; rotX = Math.max(-1.3, Math.min(1.3, rotX + dy * .006)); velY = dx * .006; velX = dy * .006;
    } else if (!e.target.closest(UI) && e.pointerType === 'mouse') document.body.style.cursor = overMoon(e.clientX, e.clientY) ? 'grab' : '';
  });
  addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest(UI) || !overMoon(e.clientX, e.clientY)) return;
    drag = { x: e.clientX, y: e.clientY }; velX = velY = 0; document.body.style.userSelect = 'none'; document.body.style.cursor = 'grabbing'; e.preventDefault();
  });
  const release = () => { if (!drag) return; drag = null; document.body.style.userSelect = ''; document.body.style.cursor = ''; };
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
  document.addEventListener('pointerleave', () => ndc.set(9, 9));

  (function loop() {
    requestAnimationFrame(loop); if (document.hidden || !pts) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime; U.uTime.value = t;
    const isLight = window.__THEME__ === 'light';
    if (isLight !== light) { light = isLight; U.uInvert.value = +light; for (const m of [matR, matS]) { m.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending; m.needsUpdate = true; }
      box.style.setProperty('--cb-fg', light ? '#111' : '#ddd'); }
    U.uSplash.value = drag ? 0 : SPLASH;                                   // no pushing while you are turning the moon
    if (!drag) { rotY += velY; rotX = Math.max(-1.3, Math.min(1.3, rotX + velX)); velX *= .95; velY *= .95; if (cur.sphere) rotY += IDLE_SPIN; else rotY = Math.max(-1.1, Math.min(1.1, rotY)); }
    tiltY += ((ndc.x > 5 ? 0 : ndc.x) * .12 - tiltY) * .05; tiltX += ((ndc.y > 5 ? 0 : -ndc.y) * .08 - tiltX) * .05;
    group.rotation.set(rotX + tiltX, rotY + tiltY + (cur.sphere ? 0 : Math.sin(t * .25) * .1), 0); group.updateMatrixWorld();
    appearT += dt; const a = Math.max(0, Math.min(1, appearT / 2.6)); U.uAppear.value = 1 - Math.pow(1 - a, 3);
    ray.setFromCamera(ndc, cam);
    const wo = ray.ray.origin, wd = ray.ray.direction, kw = -wo.z / wd.z; U.uMouseW.value.set(wo.x + wd.x * kw, wo.y + wd.y * kw, 0);   // mouse on the screen plane (world)
    inv.copy(group.matrixWorld).invert();
    const o = wo.clone().applyMatrix4(inv), d = wd.clone().transformDirection(inv), k = -o.z / d.z; U.uMouse.value.set(o.x + d.x * k, o.y + d.y * k, 0);   // same, in the picture's own space (relief)
    const w = innerWidth, h = innerHeight;
    for (const m of mks) {
      if (m.sph) { V.set(m.x, m.y, m.z).applyMatrix4(group.matrixWorld).project(cam); m.vis = NV.set(m.nx, m.ny, m.nz).transformDirection(group.matrixWorld).z > .1; }
      else { V.set(m.x, m.y, (m.d - .5) * U.uDepth.value).applyMatrix4(group.matrixWorld).project(cam); m.vis = true; }
      m.sx = (V.x * .5 + .5) * w; m.sy = (-V.y * .5 + .5) * h; m.el.style.transform = `translate(${m.sx}px,${m.sy}px)`; m.el.style.display = m.vis ? '' : 'none';
    }
    for (const c of mm) { const A = mks[c.a], B = mks[c.b]; c.l.style.display = A.vis && B.vis ? '' : 'none'; c.l.setAttribute('x1', A.sx); c.l.setAttribute('y1', A.sy); c.l.setAttribute('x2', B.sx); c.l.setAttribute('y2', B.sy); }
    R.render(scene, cam);
  })();
})();
