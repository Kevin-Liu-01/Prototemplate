/*
 * GT motion kit: the series frame, the brand deck's sheet at video scale.
 *
 * Two vertical rails and two horizontal rules at `inset` px from the frame's
 * edges (the deck's 56 px on its 1600 sheet becomes 67 px at 1920), with a
 * registration cross where each pair meets, the doubled-line GT mark in the
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
  const MARK =
    '<svg viewBox="-8 214 1213 771" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M363 222.5L1197 222.5L1196.5 283L834 283.5L832.5 976L773 975.5L772.5 398L359.5 398L341.5 401L301.5 414L271.5 430L249.5 446L231 463.5L214 484.5L190 529.5L180 567.5L178 613.5L185 653.5L196 682.5L217 717.5L242.5 746L270.5 768L314.5 790L342.5 798L372.5 802L399.5 802L430.5 798L475.5 783L502.5 768L524 751.5L523.5 747L415.5 748L414.5 684L583 684.5L583 923.5L580.5 926L516.5 955L476.5 967L439.5 974L403.5 977L355.5 976L326.5 973L287.5 965L252.5 954L221.5 941L187.5 923L155.5 902L121.5 874L97 849.5L77 825.5L55 793.5L33 752.5L15 705.5L4 656.5L0 613.5L2 556.5L10 511.5L23 469.5L44 423.5L66 387.5L99 346.5L129.5 317L170.5 286L225.5 256L275.5 237L325.5 226L363 222.5Z M386.5 282L322.5 288L275.5 301L220.5 327L167.5 365L123 413.5L103 443.5L87 474.5L71 518.5L61 578.5L63 641.5L68 669.5L78 703.5L107 762.5L143 810.5L171.5 838L194.5 856L248.5 887L305.5 907L366.5 916L403.5 916L442.5 912L490.5 900L523.5 887L524 826.5L479.5 847L440.5 858L399.5 863L344.5 860L291.5 846L254.5 829L214.5 802L186 775.5L165 749.5L141 708.5L125 664.5L118 624.5L118 573.5L126 530.5L139 494.5L165 449.5L201.5 408L238.5 379L292.5 352L341.5 339L373.5 336L773 336.5L772.5 283L386.5 282Z M888 337.5L1197 337.5L1196.5 398L949 398.5L948.5 976L888 975.5L888 337.5Z M415 571.5L692 572.5L692 830.5L668 858.5L633.5 890L631 890.5L631 635.5L414.5 635L415 571.5Z"/></svg>';

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
    const mark = el('div', { position: 'absolute', left: inset + 12 + 'px', top: H - inset + 18 + 'px', width: '30px', height: '19px', color: ink }, 'sheet-mark');
    mark.innerHTML = MARK;
    mark.firstChild.style.width = '30px';
    mark.firstChild.style.height = '19px';
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

  window.GTSheet = { mount, MARK };
})();
