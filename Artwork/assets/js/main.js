// ============================================
// main.js — cursor, transitions, nav active
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  // footer year follows the calendar (was hard-coded 2025)
  document.querySelectorAll('footer p').forEach(p => { p.textContent = p.textContent.replace(/©\s*20\d\d/, '© ' + new Date().getFullYear()); });

  // Cursor
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .work-row').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
  });

  // Page transition overlay
  const pt = document.createElement('div');
  pt.className = 'pt';
  document.body.appendChild(pt);

  // (the page-enter cover is now pure CSS: html::before in style.css)

  // Warm up the next page: on hover / first touch (and again at click) the browser fetches it in the background
  const warmed = new Set();
  function prefetch(url) {
    if (warmed.has(url)) return; warmed.add(url);
    const l = document.createElement('link'); l.rel = 'prefetch'; l.href = url; l.as = 'document'; document.head.appendChild(l);
  }
  document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('http') || h.startsWith('mailto') || a.target === '_blank') return;
    ['pointerenter', 'touchstart'].forEach(ev => a.addEventListener(ev, () => prefetch(a.href), { passive: true, once: true }));
  });

  // Intercept clicks (skip modifier-clicks, new-tab links, downloads)
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    link.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      prefetch(link.href);          // the browser starts fetching the next page while the cover slides in
      pt.style.transform = '';
      pt.classList.add('in');
      let done = false;
      const go = () => { if (done) return; done = true; window.location.href = link.href; };
      pt.addEventListener('animationend', go, { once: true });
      setTimeout(go, 700); // fallback if animation events never fire
    });
  });

  // Browser Back/Forward restores the page from bfcache with the overlay still covering it → reset it
  window.addEventListener('pageshow', e => {
    if (e.persisted) {
      pt.classList.remove('in', 'out');
      pt.style.transform = 'scaleY(0)';
    }
  });

  // Active nav — compare resolved URLs instead of string-matching hrefs
  const norm = p => p.replace(/\/$/, '/index.html');
  const here = norm(window.location.pathname);
  const inWorks = /\/works\//.test(here);
  document.querySelectorAll('.site-nav a:not(.site-nav-back)').forEach(a => {
    const target = norm(new URL(a.getAttribute('href'), window.location.href).pathname);
    const isWorksLink = /\/works\/index\.html$/.test(target);
    a.classList.toggle('active', target === here || (isWorksLink && inWorks));
  });
});
