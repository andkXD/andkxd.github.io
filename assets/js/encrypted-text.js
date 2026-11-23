// encrypted-text.js — text scrambles, then reveals left to right (vanilla take on Aceternity's EncryptedText).
// EncryptedText.run(el, { delay: 50, start: 0, tick: 45 })   delay = ms per revealed character, start = ms before it begins
(function () {
  const SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*():{};|,.<>/?';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = '.et-w{display:inline-block;white-space:nowrap}.et-c{display:inline-block;text-align:center;white-space:pre}.et-e{color:var(--et-enc,#6b6b6b)}body.theme-light .et-e{--et-enc:#9a9a9a}';
  document.head.appendChild(css);

  function prep(el) {
    if (el._et) return el._et;
    const text = el.dataset.etText || el.textContent.trim();
    el.dataset.etText = text; el.setAttribute('aria-label', text); el.textContent = '';
    const chars = [];
    text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
      const w = document.createElement('span'); w.className = 'et-w'; w.setAttribute('aria-hidden', 'true');
      [...part].forEach(c => { const s = document.createElement('span'); s.className = 'et-c'; s.appendChild(document.createTextNode(c)); w.appendChild(s); chars.push({ s, c, t: s.firstChild, w: 0 }); });
      el.appendChild(w);
    });
    return (el._et = { text, chars, raf: 0 });
  }

  function run(el, o) {
    if (!el) return;
    o = o || {}; const delay = o.delay == null ? 50 : o.delay, start = o.start || 0, tick = o.tick || 45;
    const st = prep(el); cancelAnimationFrame(st.raf);
    // measure the real width of every character first, so the line doesn't jitter while letters change
    st.chars.forEach(x => { x.t.nodeValue = x.c; x.s.style.width = ''; x.s.classList.remove('et-e'); });
    st.chars.forEach(x => { x.w = x.s.getBoundingClientRect().width; });
    st.chars.forEach(x => { x.s.style.width = x.w + 'px'; });
    if (reduce) { st.chars.forEach(x => { x.s.style.width = ''; }); return; }
    const t0 = performance.now() + start; let lastScr = -1e9;
    (function frame(now) {
      const n = now < t0 ? 0 : Math.floor((now - t0) / delay) + 1, scramble = now - lastScr >= tick;
      if (scramble) lastScr = now;
      st.chars.forEach((x, i) => {
        if (i < n) { if (x.t.nodeValue !== x.c) x.t.nodeValue = x.c; x.s.classList.remove('et-e'); }
        else { x.s.classList.add('et-e'); if (scramble) x.t.nodeValue = SET[(Math.random() * SET.length) | 0]; }
      });
      if (n < st.chars.length) st.raf = requestAnimationFrame(frame);
      else st.chars.forEach(x => { x.s.style.width = ''; });   // done: back to normal text flow
    })(performance.now());
  }
  window.EncryptedText = { run };
})();
