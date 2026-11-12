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

  /* The General Translation logo's path, the globe: window.GT_LOGO from kit/brand/gt-mark.js, which pnpm build:logo
     writes from LOGO in src/lib/logo.ts; index.html loads it before this file. Its viewBox is 24.3 24.3 207.4 207.4. */
  if (!window.GT_LOGO) throw new Error('lib/film.js: load kit/brand/gt-mark.js first');
  const GT_MARK_D = window.GT_LOGO.d;
  /* The logo, size px square, with its top-left at (x, y). */
  function markAt(s, x, y, size, color) {
    const k = size / 207.4;
    return el(s, 'path', { d: GT_MARK_D, fill: color, transform: `translate(${x} ${y}) scale(${k}) translate(-24.3 -24.3)` });
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
