// ============================================
// NOISE DRIFT — theme-aware particles
// ============================================

let cells = [];
// star count scales with screen area (≈950 on 1920×1080, was 300)
const starCount = () => constrain(floor(windowWidth * windowHeight / 1100), 500, 2500);

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  frameRate(30);
  initCells();
}

function initCells() {
  cells = [];
  const n = starCount();
  for (let i = 0; i < n; i++) {
    const big = random() < 0.18;                       // ~8% brighter, larger "hero" stars
    cells.push({
      x:  random(width),
      y:  random(height),
      vx: (random(1) - 0.5) * 0.6,
      vy: (random(1) - 0.5) * 0.6,
      a:  big ? random(200, 200) : random(25, 95),
      sz: big ? random(2.6, 4.2) : random(0.7, 2.6),
      tw: random(TWO_PI),                              // twinkle phase
    });
  }
}

function draw() {
  const isLight = window.__THEME__ === 'light';

  // Background trail — matches body bg
  if (isLight) {
    fill(242, 240, 235, 30); // cream
  } else {
    fill(0, 0, 0, 28);
  }
  noStroke();
  rect(0, 0, width, height);

  noStroke();
  for (let c of cells) {
    c.x += c.vx;
    c.y += c.vy;

    if (c.x < 0 || c.x > width)  c.vx *= -1;
    if (c.y < 0 || c.y > height) c.vy *= -1;

    let dx    = mouseX - c.x;
    let dy    = mouseY - c.y;
    let d     = sqrt(dx * dx + dy * dy);
    let boost = d < 200 ? map(d, 0, 200, 200, 0) : 0;

    if (d < 120) {
      c.vx -= (dx / d) * 0.15;
      c.vy -= (dy / d) * 0.15;
      let spd = sqrt(c.vx * c.vx + c.vy * c.vy);
      if (spd > 2.5) { c.vx *= 2.5 / spd; c.vy *= 2.5 / spd; }
    } else {
      c.vx *= 0.995;
      c.vy *= 0.995;
    }

    let finalA = min(255, c.a * (0.65 + 0.35 * sin(frameCount * 0.04 + c.tw)) + boost);

    // Light mode: dark particles; dark mode: white particles
    if (isLight) {
      fill(30, 30, 30, finalA);
    } else {
      fill(255, 255, 255, finalA);
    }
    ellipse(c.x, c.y, c.sz, c.sz);
  }

  drawVignette(isLight);
}

function drawVignette(isLight) {
  let ctx = drawingContext;
  let grad = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.08,
    width / 2, height / 2, height * 0.9
  );
  if (isLight) {
    grad.addColorStop(0, 'rgba(242,240,235,0)');
    grad.addColorStop(1, 'rgba(242,240,235,0.82)');
  } else {
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.88)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initCells();
}

   // load the star trackers (small brackets on stars) on every page that uses this background
   (() => { const s = document.createElement('script'); s.src = new URL('trackers.js', document.currentScript.src).href; document.head.appendChild(s); })();