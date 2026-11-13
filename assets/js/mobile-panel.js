// ============================================
// INFO / CONTACT / FAQ di HP & tablet: pop-up di tengah layar + background gelap (dim).
// Berdiri sendiri (gaya di-inline), tidak bergantung pada script/CSS lain di halaman.
// Desktop (mouse) tetap memakai mode teks-ikut-kursor di index.html.
// ============================================
(() => {
  const desktop = () => matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches;
  let pop = null, openLink = null;

  function isLight() {
    return document.body.classList.contains('theme-light') ||
           document.documentElement.getAttribute('data-theme') === 'light';
  }

  function close() {
    if (pop) { pop.remove(); pop = null; }
    if (openLink) { openLink.classList.remove('on'); openLink = null; }
    document.body.classList.remove('panel-open');
  }
  window.closeMobilePanel = close;

  function open(link) {
    const src = document.querySelector(link.getAttribute('href'));
    if (!src) return;
    const light = isLight();
    pop = document.createElement('div');
    pop.setAttribute('role', 'dialog');
    pop.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;' +
      'padding:24px 20px;background:' + (light ? 'rgba(20,18,14,.55)' : 'rgba(0,0,0,.78)') + ';opacity:0;transition:opacity .25s ease;';
    const card = document.createElement('div');
    card.style.cssText = 'position:relative;box-sizing:border-box;width:min(360px,100%);max-height:72vh;max-height:min(72dvh,560px);' +
      'overflow-y:auto;scrollbar-width:none;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:26px 24px 30px;' +
      'background:' + (light ? '#f2f0eb' : '#0b0b0c') + ';border:1px solid ' + (light ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.22)') + ';' +
      'box-shadow:0 24px 80px rgba(0,0,0,.6);';
    const inner = src.querySelector('.overlay-inner');
    card.innerHTML = inner ? inner.innerHTML.replace(/<button class="close-btn"[\s\S]*?<\/button>/, '') : src.innerHTML;
    const x = document.createElement('button');
    x.type = 'button'; x.textContent = '✕ Close';
    x.style.cssText = 'position:absolute;top:calc(16px + env(safe-area-inset-top,0px));right:20px;z-index:1;background:none;border:0;' +
      'padding:8px 4px;cursor:pointer;font:400 12px/1 "Roboto Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:' + (light ? '#222' : '#ddd') + ';';
    x.addEventListener('click', e => { e.stopPropagation(); close(); });
    pop.addEventListener('click', e => { if (!card.contains(e.target)) close(); });
    card.className = 'mp-card';
    if (!document.getElementById('mp-style')) { const st = document.createElement('style'); st.id = 'mp-style'; st.textContent = '.mp-card::-webkit-scrollbar{display:none}'; document.head.appendChild(st); }
    pop.append(card, x);
    document.body.appendChild(pop);
    document.body.classList.add('panel-open');
    link.classList.add('on'); openLink = link;
    requestAnimationFrame(() => { if (pop) pop.style.opacity = '1'; });
  }

  // capture: jalan lebih dulu dari handler lain; di mobile kita ambil alih sepenuhnya
  document.addEventListener('click', e => {
    const link = e.target.closest && e.target.closest('.nav-scroll');
    if (!link || desktop()) return;
    const h = link.getAttribute('href') || '';
    if (!/^#(info|contact|faq)$/.test(h)) return;
    e.preventDefault(); e.stopPropagation();
    const same = openLink === link;
    close();
    if (!same) open(link);
  }, true);

  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  addEventListener('resize', () => { if (desktop()) close(); });
})();
