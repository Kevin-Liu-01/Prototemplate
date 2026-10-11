/*
 * gif-how-gt-works: the drawing helpers.
 *
 * Copied from films/blog-designing-docs/lib/film.js (2026-10-06) and trimmed to
 * what this loop draws: the SVG element helper, the registration cross, the
 * polyline with arc length and real sub-paths (poly().sub), the doubled-line
 * GT mark, and the easing curves. The Bayer cell buffer, the clutter, the
 * glyph planet and the tone masks are left out, because this film has no
 * dither. The original file is not edited.
 */
(function () {
  'use strict';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  /* Linear progress of x through [a, b]. */
  const lin = (a, b, x) => clamp01((x - a) / (b - a));
  /* Cubic smoothstep of x through [a, b]: zero speed at both ends. */
  const smooth = (a, b, x) => {
    const t = lin(a, b, x);
    return t * t * (3 - 2 * t);
  };
  const ease = {
    expoOut: (p) => (p >= 1 ? 1 : p <= 0 ? 0 : 1 - Math.pow(2, -10 * p)),
    p3out: (p) => 1 - Math.pow(1 - clamp01(p), 3),
    p2out: (p) => 1 - Math.pow(1 - clamp01(p), 2),
    p2in: (p) => Math.pow(clamp01(p), 2),
    p2io: (p) => {
      p = clamp01(p);
      return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    },
  };

  const NS = 'http://www.w3.org/2000/svg';
  function el(parent, tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  /* A registration cross, 2r + 1 px, centred on the pixel (x, y), as one path. */
  function cross(s, x, y, color, r) {
    const q = r || 4;
    return el(s, 'path', { d: `M${x - q} ${y + 0.5}H${x + q + 1}M${x + 0.5} ${y - q}V${y + q + 1}`, stroke: color, 'stroke-width': 1, fill: 'none' });
  }

  /* A polyline with its arc length; sub(L0, L1) is the run from length L0 to L1 as real geometry. */
  function poly(pts) {
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = acc[acc.length - 1];
    function at(L) {
      const l = clamp(L, 0, total);
      for (let i = 1; i < pts.length; i++)
        if (l <= acc[i] || i === pts.length - 1) {
          const f = acc[i] === acc[i - 1] ? 0 : (l - acc[i - 1]) / (acc[i] - acc[i - 1]);
          return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f, i];
        }
      return [pts[0][0], pts[0][1], 1];
    }
    function sub(L0, L1) {
      const a = clamp(L1 == null ? 0 : L0, 0, total);
      const b = clamp(L1 == null ? L0 : L1, 0, total);
      if (b - a <= 0.01) return '';
      const p0 = at(a);
      const p1 = at(b);
      const out = [`M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}`];
      for (let i = p0[2]; i < p1[2]; i++) out.push(`L${pts[i][0]} ${pts[i][1]}`);
      out.push(`L${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`);
      return out.join('');
    }
    return { pts, acc, total, at, sub };
  }

  /* The doubled-line GT monogram's path (kit/brand/gt-mark.svg), viewBox -8 214 1213 771. */
  const GT_MARK_D =
    'M363 222.5L1197 222.5L1196.5 283L834 283.5L832.5 976L773 975.5L772.5 398L359.5 398L341.5 401L301.5 414L271.5 430L249.5 446L231 463.5L214 484.5L190 529.5L180 567.5L178 613.5L185 653.5L196 682.5L217 717.5L242.5 746L270.5 768L314.5 790L342.5 798L372.5 802L399.5 802L430.5 798L475.5 783L502.5 768L524 751.5L523.5 747L415.5 748L414.5 684L583 684.5L583 923.5L580.5 926L516.5 955L476.5 967L439.5 974L403.5 977L355.5 976L326.5 973L287.5 965L252.5 954L221.5 941L187.5 923L155.5 902L121.5 874L97 849.5L77 825.5L55 793.5L33 752.5L15 705.5L4 656.5L0 613.5L2 556.5L10 511.5L23 469.5L44 423.5L66 387.5L99 346.5L129.5 317L170.5 286L225.5 256L275.5 237L325.5 226L363 222.5Z M386.5 282L322.5 288L275.5 301L220.5 327L167.5 365L123 413.5L103 443.5L87 474.5L71 518.5L61 578.5L63 641.5L68 669.5L78 703.5L107 762.5L143 810.5L171.5 838L194.5 856L248.5 887L305.5 907L366.5 916L403.5 916L442.5 912L490.5 900L523.5 887L524 826.5L479.5 847L440.5 858L399.5 863L344.5 860L291.5 846L254.5 829L214.5 802L186 775.5L165 749.5L141 708.5L125 664.5L118 624.5L118 573.5L126 530.5L139 494.5L165 449.5L201.5 408L238.5 379L292.5 352L341.5 339L373.5 336L773 336.5L772.5 283L386.5 282Z M888 337.5L1197 337.5L1196.5 398L949 398.5L948.5 976L888 975.5L888 337.5Z M415 571.5L692 572.5L692 830.5L668 858.5L633.5 890L631 890.5L631 635.5L414.5 635L415 571.5Z';
  /* The mark w px wide with its top-left at (x, y). */
  function markAt(s, x, y, w, color) {
    const k = w / 1213;
    return el(s, 'path', { d: GT_MARK_D, fill: color, 'fill-rule': 'evenodd', transform: `translate(${x} ${y}) scale(${k}) translate(8 -214)` });
  }

  /* Mixes two #rrggbb colors; k 0 is a, 1 is b. */
  function mix(a, b, k) {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    const kk = clamp01(k);
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * kk).toString(16).padStart(2, '0')).join('');
  }

  window.F = { clamp, clamp01, lerp, lin, smooth, ease, NS, el, cross, poly, GT_MARK_D, markAt, mix };
})();
