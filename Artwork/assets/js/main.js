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

  // On load: play exit animation
  pt.style.transformOrigin = 'top';
  pt.style.transform = 'scaleY(1)';
  requestAnimationFrame(() => {
    pt.classList.add('out');
    pt.addEventListener('animationend', () => {
      pt.classList.remove('out');
      pt.style.transform = 'scaleY(0)';
    }, { once: true });
  });

  // Failsafe: if the animationend event never fires (reduced-motion, throttled tab, slow device) the black
  // cover would stay over the page → force it open after a moment.
  setTimeout(() => { pt.classList.remove('out'); if (!pt.classList.contains('in')) pt.style.transform = 'scaleY(0)'; }, 1500);

  // Intercept clicks (skip modifier-clicks, new-tab links, downloads)
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    link.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      pt.style.transform = '';
      pt.style.transformOrigin = 'bottom';
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
