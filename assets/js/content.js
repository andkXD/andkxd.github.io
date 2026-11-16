// Mengisi teks halaman utama dari /content.json (judul, bio, Info, Contact, FAQ).
// Kalau content.json gagal dimuat, teks bawaan di index.html tetap dipakai.
(() => {
  const el = (tag, props, ...kids) => {
    const n = document.createElement(tag);
    Object.assign(n, props || {});
    kids.forEach(k => n.append(k));
    return n;
  };
  const fill = (sel, nodes) => {
    const box = document.querySelector(sel);
    if (box && nodes.length) box.replaceChildren(...nodes);
  };

  fetch('content.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(c => {
      if (c.site) {
        const h = document.querySelector('.site-title');
        if (h && c.site.title) {
          const parts = String(c.site.title).split('\n'), nodes = [];
          parts.forEach((t, i) => { if (i) nodes.push(document.createElement('br')); nodes.push(t); });
          h.replaceChildren(...nodes);
        }
        const r = document.querySelector('.role');
        if (r && c.site.role) r.textContent = c.site.role;
      }
      if (Array.isArray(c.bio)) fill('.bottom-right', c.bio.map(t => el('p', { textContent: t })));

      if (Array.isArray(c.info)) fill('#info .section-content', c.info.map(i =>
        el('p', {}, el('strong', { textContent: i.label }), document.createElement('br'), i.text)));

      if (Array.isArray(c.contact)) {
        const nodes = c.contact.map(i => {
          const link = el('a', { textContent: i.text, href: i.url || '#' });
          if (/^https?:/.test(i.url || '')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
          return el('p', {}, el('strong', { textContent: i.label }), document.createElement('br'), link);
        });
        if (c.contactNote) nodes.push(el('p', { className: 'note', textContent: c.contactNote }));
        fill('#contact .section-content', nodes);
      }

      if (Array.isArray(c.faq)) fill('#faq .section-content', c.faq.map(i =>
        el('div', { className: 'faq-item' },
          el('p', { className: 'faq-q', textContent: i.q }),
          el('p', { className: 'faq-a', textContent: i.a }))));
    })
    .catch(() => { /* pakai teks bawaan di HTML */ });
})();
