/*
 * GT motion kit: the series frame, the brand deck's sheet at video scale.
 *
 * Two vertical rails and two horizontal rules at `inset` px from the frame's
 * edges (the deck's 56 px on its 1600 sheet becomes 67 px at 1920), with a
 * registration cross where each pair meets, the General Translation logo (the globe) in the
 * lower left margin and a counter in the lower right margin. Every line is
 * drawn once. The frame is markup only; the composition's own timeline
 * animates it through the elements this returns, for example drawing the
 * rails out from the crosses with scaleX and scaleY.
 *
 *   const sheet = GTSheet.mount(document.getElementById('sheet'), { inset: 67 });
 *   tl.fromTo(sheet.rails, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'expo.out' }, 0);
 *   sheet.setCounter('01 / 05');
 */
(function () {
  'use strict';
  /* the General Translation logo: window.GT_LOGO from kit/brand/gt-mark.js, which pnpm build:logo writes from LOGO
     in src/lib/logo.ts; load that file before this one. Read when the sheet is mounted, so the order of the two tags
     is all that matters. */
  function markSvg() {
    const LOGO = window.GT_LOGO;
    if (!LOGO) throw new Error('kit/sheet.js: load kit/brand/gt-mark.js first');
    return `<svg viewBox="${LOGO.viewBox}" fill="currentColor" aria-hidden="true"><path d="${LOGO.d}"/></svg>`;
  }

  function el(tag, style, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    Object.assign(e.style, style);
    return e;
  }

  function mount(host, opts) {
    const o = opts || {};
    const W = o.width || 1920;
    const H = o.height || 1080;
    const inset = o.inset == null ? 67 : o.inset;
    const hair = o.hair || 'rgba(242, 242, 240, 0.11)';
    const cross = o.cross || 'rgba(242, 242, 240, 0.32)';
    const ink = o.ink || 'rgba(242, 242, 240, 0.45)';
    Object.assign(host.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
    const hRails = [inset, H - inset].map((y) =>
      el('div', { position: 'absolute', left: '0', top: y + 'px', width: W + 'px', height: '1px', background: hair, transformOrigin: '50% 50%' }, 'sheet-rail sheet-rail-h')
    );
    const vRails = [inset, W - inset].map((x) =>
      el('div', { position: 'absolute', top: '0', left: x + 'px', width: '1px', height: H + 'px', background: hair, transformOrigin: '50% 50%' }, 'sheet-rail sheet-rail-v')
    );
    const crosses = [];
    [inset, W - inset].forEach((x) =>
      [inset, H - inset].forEach((y) => {
        const c = el('div', { position: 'absolute', left: x - 6 + 'px', top: y - 6 + 'px', width: '13px', height: '13px' }, 'sheet-cross');
        c.appendChild(el('div', { position: 'absolute', left: '6px', top: '0', width: '1px', height: '13px', background: cross }));
        c.appendChild(el('div', { position: 'absolute', top: '6px', left: '0', height: '1px', width: '13px', background: cross }));
        crosses.push(c);
      })
    );
    const mark = el('div', { position: 'absolute', left: inset + 12 + 'px', top: H - inset + 17 + 'px', width: '21px', height: '21px', color: ink }, 'sheet-mark');
    mark.innerHTML = markSvg();
    mark.firstChild.style.width = '21px';
    mark.firstChild.style.height = '21px';
    mark.firstChild.style.display = 'block';
    const counter = el(
      'div',
      { position: 'absolute', right: inset + 12 + 'px', top: H - inset + 17 + 'px', font: '400 15px/19px Inter, system-ui, sans-serif', letterSpacing: '0.01em', color: ink, fontVariantNumeric: 'tabular-nums' },
      'sheet-counter'
    );
    [...hRails, ...vRails, ...crosses, mark, counter].forEach((n) => host.appendChild(n));
    return {
      rails: [...hRails, ...vRails],
      hRails,
      vRails,
      crosses,
      mark,
      counter,
      setCounter(text) {
        counter.textContent = text;
      },
    };
  }

  /* MARK is the logo's markup, read when it is asked for */
  window.GTSheet = {
    mount,
    get MARK() {
      return markSvg();
    },
  };
})();
