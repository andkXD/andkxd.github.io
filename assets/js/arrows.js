/* One arrow style for the whole site: ← → ↗ in text links/buttons become a small circled icon
   (circle fills on hover). Works on text that JS adds later too. Edit the look in the CSS below. */
(function () {
  const P = {
    '←': 'M15 11H7M10.5 7.5 7 11l3.5 3.5',
    '→': 'M7 11h8M11.5 7.5 15 11l-3.5 3.5',
    '↗': 'M8 14 14 8M9 8h5v5'
  };
  const D = { '←': 'l', '→': 'r', '↗': 'u' };

  const css = `
.ar{display:inline-block;width:1.7em;height:1.7em;vertical-align:-.5em;flex:none;align-self:center;color:inherit;line-height:0}
.ar.ar-m-r{margin-left:.65em}.ar.ar-m-l{margin-right:.65em}
.ar svg{display:block;width:100%;height:100%;overflow:visible;fill:none;stroke:currentColor;stroke-width:1.2;stroke-linecap:square;stroke-linejoin:miter}
.ar circle{transition:fill .25s,stroke .25s;stroke-width:1}
.ar path{transition:transform .25s,stroke .25s}
:is(a,button):hover .ar circle{fill:var(--ar-fill,var(--white,#fff));stroke:var(--ar-fill,var(--white,#fff))}
:is(a,button):hover .ar path{stroke:var(--ar-ink,var(--black,var(--bg,#000)))}
:is(a,button):hover .ar-r path{transform:translateX(2px)}
:is(a,button):hover .ar-l path{transform:translateX(-2px)}
:is(a,button):hover .ar-u path{transform:translate(1.5px,-1.5px)}
@media (prefers-reduced-motion:reduce){.ar circle,.ar path{transition:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function icon(ch, flexParent, before) {
    const s = document.createElement('span');
    s.className = 'ar ar-' + D[ch] + (flexParent ? '' : before ? ' ar-m-l' : ' ar-m-r');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="10.2"/><path d="' + P[ch] + '"/></svg>';
    return s;
  }

  function fix(node) {
    const t = node.nodeValue, par = node.parentElement;
    if (!par || t.trim().length < 2) return;                    // lone arrow buttons (carousel) stay as they are
    if (!par.closest('a,button,.project-arrow') || par.closest('.card-btn,script,style,textarea')) return;
    const lead = t.match(/^(\s*)([←→↗])\s*(?=\S)/), tail = t.match(/(\S)\s*([←→↗])(\s*)$/);
    if (!lead && !tail) return;
    const cs = getComputedStyle(par), flex = /flex/.test(cs.display) && parseFloat(cs.columnGap) > 0;
    let text = t;
    const frag = document.createDocumentFragment();
    if (lead) { frag.appendChild(icon(lead[2], flex, true)); text = text.slice(lead[0].length); }
    const m = text.match(/\s*([←→↗])\s*$/);
    const ch = m && text.trim().length > 1 ? m[1] : null;
    if (ch) text = text.slice(0, m.index);
    frag.appendChild(document.createTextNode(text));
    if (ch) frag.appendChild(icon(ch, flex, false));
    par.replaceChild(frag, node);
  }

  function scan(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => /[←→↗]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(fix);
  }

  let q = 0;
  function later() { if (q) return; q = requestAnimationFrame(() => { q = 0; scan(document.body); }); }
  function start() { scan(document.body); new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
