/*
 * Moving type (MOTION.md transition d) for this film: a sentence dissolves
 * into glyph cells and the same cells reassemble as the next sentence.
 *
 * sample() rasterises each line element of a group into one cell grid
 * (cell px squares on the film's grid, lit where the glyph coverage beats the
 * anchored 8x8 Bayer threshold), in reading order: line by line, left to
 * right. pair() conserves matter: N = max(nA, nB) particles, particle k runs
 * from A[floor(k nA / N)] to B[floor(k nB / N)], so neighbours in the first
 * sentence stay neighbours on the way to the second. Every path is a
 * quadratic curve whose bend comes from a smooth function of the source
 * position plus a seeded jitter, so neighbours travel together. The delays
 * run left to right over 55 percent of the dissolve and each cell flies for
 * 40 percent of it, so the change reads as a wave in reading order: the
 * left of the new sentence stands while the right of the old one waits.
 * draw() is a pure function of progress; nothing is kept between frames.
 *
 * The kit's Inter carries cv11 (the single-storey a) in the DOM. Canvas text
 * cannot switch features, so sampling draws U+0251, Inter's single-storey a,
 * where the text has an a; the cells then match the text node they replace.
 */
(function () {
  'use strict';
  const B8 = window.GTDither.B8;

  function offsetIn(el, root) {
    let x = 0;
    let y = 0;
    let n = el;
    while (n && n !== root) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return { x, y };
  }

  /**
   * group: [{ el, color: [r, g, b] }], each el one line of text.
   * Returns [{ x, y, c }] in px (cell origins), reading order.
   */
  function sample(group, root, opts) {
    const o = opts || {};
    const cell = o.cell || 3;
    const W = o.width || 1920;
    const H = o.height || 1080;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const out = [];
    group.forEach((item) => {
      const el = item.el;
      const cs = getComputedStyle(el);
      const pos = offsetIn(el, root);
      const size = parseFloat(cs.fontSize);
      const lh = parseFloat(cs.lineHeight);
      const text = el.textContent.replace(/a/g, 'ɑ');
      ctx.clearRect(0, 0, W, H);
      ctx.font = cs.fontWeight + ' ' + size + 'px Inter';
      ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'alphabetic';
      const m = ctx.measureText(text);
      const asc = m.fontBoundingBoxAscent;
      const desc = m.fontBoundingBoxDescent;
      const base = pos.y + (lh - (asc + desc)) / 2 + asc;
      const x0 = pos.x + parseFloat(cs.paddingLeft || 0);
      ctx.fillText(text, x0, base);
      const bx0 = Math.max(0, Math.floor((x0 - 20) / cell));
      const bx1 = Math.min(Math.floor(W / cell), Math.ceil((x0 + m.width + 40) / cell));
      const by0 = Math.max(0, Math.floor((base - asc - 10) / cell));
      const by1 = Math.min(Math.floor(H / cell), Math.ceil((base + desc + 10) / cell));
      const img = ctx.getImageData(bx0 * cell, by0 * cell, (bx1 - bx0) * cell, (by1 - by0) * cell);
      const iw = img.width;
      for (let cx = bx0; cx < bx1; cx++) {
        for (let cy = by0; cy < by1; cy++) {
          let a = 0;
          for (let j = 0; j < cell; j++)
            for (let i = 0; i < cell; i++) a += img.data[(((cy - by0) * cell + j) * iw + (cx - bx0) * cell + i) * 4 + 3];
          a /= cell * cell * 255;
          const th = (B8[(cy & 7) * 8 + (cx & 7)] + 0.5) / 64;
          if (a > th) out.push({ x: cx * cell, y: cy * cell, c: item.color });
        }
      }
    });
    return out;
  }

  /** Pairs two samples into particles with seeded paths and reading-order delays. */
  function pair(A, B, seed, opts) {
    const o = opts || {};
    const rnd = window.GTDither.rng(seed);
    const N = Math.max(A.length, B.length);
    let xmin = Infinity;
    let xmax = -Infinity;
    A.forEach((q) => {
      xmin = Math.min(xmin, q.x);
      xmax = Math.max(xmax, q.x);
    });
    const spread = o.spread == null ? 0.55 : o.spread;
    const bend = o.bend == null ? 34 : o.bend;
    const parts = new Array(N);
    for (let k = 0; k < N; k++) {
      const a = A[Math.floor((k * A.length) / N)];
      const b = B[Math.floor((k * B.length) / N)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const flow = Math.sin(a.x / 190 + a.y / 130) * bend + (rnd() - 0.5) * bend * 0.5;
      const lift = -(14 + rnd() * 22);
      const mx = (a.x + b.x) / 2 + (-dy / len) * flow;
      const my = (a.y + b.y) / 2 + (dx / len) * flow + lift;
      const d = spread * ((a.x - xmin) / (xmax - xmin || 1)) + rnd() * 0.05;
      parts[k] = { ax: a.x, ay: a.y, bx: b.x, by: b.y, mx, my, d, ca: a.c, cb: b.c };
    }
    return parts;
  }

  function ease(u) {
    // power2.inOut
    return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  }

  const styleCache = new Map();
  function fill(c) {
    const k = c[0] * 65536 + c[1] * 256 + c[2];
    if (!styleCache.has(k)) styleCache.set(k, 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')');
    return styleCache.get(k);
  }

  /**
   * Draws the swarm at progress p (0..1 over the whole dissolve). Each
   * particle runs its own 0..1 over (1 - spread - 0.05) of the dissolve after
   * its delay, so the last particle lands exactly at p = 1.
   */
  function draw(ctx, parts, p, opts) {
    const o = opts || {};
    const cell = o.cell || 3;
    const spread = o.spread == null ? 0.55 : o.spread;
    const span = 1 - spread - 0.05;
    let last = null;
    for (let k = 0; k < parts.length; k++) {
      const q = parts[k];
      const u = Math.min(1, Math.max(0, (p - q.d) / span));
      const e = ease(u);
      const i = 1 - e;
      const x = i * i * q.ax + 2 * i * e * q.mx + e * e * q.bx;
      const y = i * i * q.ay + 2 * i * e * q.my + e * e * q.by;
      let c = q.ca;
      if (q.ca !== q.cb) {
        const s = Math.round(e * 8) / 8;
        c = [Math.round(q.ca[0] + (q.cb[0] - q.ca[0]) * s), Math.round(q.ca[1] + (q.cb[1] - q.ca[1]) * s), Math.round(q.ca[2] + (q.cb[2] - q.ca[2]) * s)];
      }
      const f = fill(c);
      if (f !== last) {
        ctx.fillStyle = f;
        last = f;
      }
      ctx.fillRect(Math.round(x), Math.round(y), cell, cell);
    }
  }

  window.GTSwarm = { sample, pair, draw, offsetIn };
})();
