/*
 * GT motion kit: the 1-bit Bayer language for HyperFrames compositions.
 *
 * Every frame is a pure function of the timeline's time, because the
 * renderer seeks frame by frame and may sample out of order. Nothing here
 * keeps state between draws except caches keyed on inputs (tone grids,
 * offscreen canvases), so a draw at t is the same whichever frame came
 * before it.
 *
 * The rules are the craft page's dither transitions (Prototemplate
 * src/app/craft/libraries.ts TRANSITION_RULES):
 *   1. One cell grid: both states are read at the same cells and the cell
 *      size never changes inside a transition.
 *   2. One anchored tile: the 8x8 Bayer tile keeps its phase from one cell,
 *      so the first frame of a transition is the last frame of the state
 *      before it.
 *   3. One smoothstep: tone is mixed on it, and the ink is interpolated on
 *      the same curve.
 *   4. Alpha fades, wipes and moving masks are refused for dithered
 *      fields: a field changes state by mixing tone, so cells switch in
 *      Bayer order.
 *
 * Usage (plain script tag, exposes window.GTDither):
 *   const grid = GTDither.grid(canvas, 2);           // 2 css px per cell
 *   const tone = GTDither.toneFromImage(img, grid, { fit: 'cover' });
 *   tl.to(proxy, { p: 1, duration: 2, onUpdate: () =>
 *     GTDither.draw(grid, (i) => tone[i] * proxy.p, { ink: '#ffffff' }) }, 0);
 */
(function () {
  'use strict';

  /** The 8x8 Bayer matrix: an exact permutation of 0..63. */
  const B8 = [
    0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
    52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39,
    13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
  ];

  /** The 4x4 screen, for coarse grids. */
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  function smoothstep(e0, e1, x) {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function parseColor(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /** Interpolates two hex colors on t (the transition's own smoothstep). */
  function mixColor(a, b, t) {
    const ca = parseColor(a);
    const cb = parseColor(b);
    return [Math.round(lerp(ca[0], cb[0], t)), Math.round(lerp(ca[1], cb[1], t)), Math.round(lerp(ca[2], cb[2], t))];
  }

  /**
   * A cell grid over a canvas: cols x rows cells of `cell` css px, with the
   * canvas backing store at one device pixel per css pixel times `dpr`.
   * The tile's phase is anchored at cell (0, 0) of this grid.
   */
  function grid(canvas, cell, opts) {
    const o = opts || {};
    const width = o.width || canvas.width;
    const height = o.height || canvas.height;
    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const octx = off.getContext('2d');
    const image = octx.createImageData(cols, rows);
    return { canvas, ctx, cell, cols, rows, width, height, off, octx, image, screen: o.screen === 4 ? 4 : 8 };
  }

  function thresholdAt(g, x, y) {
    if (g.screen === 4) return (B4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
    return (B8[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
  }

  /**
   * Samples an image into a tone grid (Float32Array, 0..1 per cell, row
   * major). fit 'cover' or 'contain'; focusX/focusY place a cover crop;
   * invert flips light and dark; gamma shapes the curve; blur (in cells)
 * softens a two-tone source back into tone and lift rescales it; region
   * { x, y, w, h } in grid cells places the picture inside the grid (cells
   * outside read 0). Cached per image, grid and options.
   */
  const toneCache = new Map();
  function toneFromImage(img, g, opts) {
    const o = opts || {};
    const key = [img.src, g.cols, g.rows, o.fit, o.focusX, o.focusY, o.invert, o.gamma, o.blur, o.lift, JSON.stringify(o.region || null)].join('|');
    if (toneCache.has(key)) return toneCache.get(key);
    const region = o.region || { x: 0, y: 0, w: g.cols, h: g.rows };
    const c = document.createElement('canvas');
    c.width = region.w;
    c.height = region.h;
    const cx = c.getContext('2d');
    cx.imageSmoothingQuality = 'high';
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return new Float32Array(g.cols * g.rows);
    const fit = o.fit || 'cover';
    const scale = fit === 'contain' ? Math.min(region.w / iw, region.h / ih) : Math.max(region.w / iw, region.h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const fx = o.focusX == null ? 0.5 : o.focusX;
    const fy = o.focusY == null ? 0.5 : o.focusY;
    cx.fillStyle = o.invert ? '#fff' : '#000';
    cx.fillRect(0, 0, region.w, region.h);
    // blur (in cells) recovers continuous tone from an already two-tone
    // source, such as the deck's mood files, before it is screened again.
    if (o.blur) cx.filter = 'blur(' + o.blur + 'px)';
    cx.drawImage(img, (region.w - dw) * fx, (region.h - dh) * fy, dw, dh);
    cx.filter = 'none';
    const data = cx.getImageData(0, 0, region.w, region.h).data;
    const out = new Float32Array(g.cols * g.rows);
    const gamma = o.gamma || 1;
    for (let y = 0; y < region.h; y++) {
      const gy = y + region.y;
      if (gy < 0 || gy >= g.rows) continue;
      for (let x = 0; x < region.w; x++) {
        const gx = x + region.x;
        if (gx < 0 || gx >= g.cols) continue;
        const k = (y * region.w + x) * 4;
        let v = (0.2126 * data[k] + 0.7152 * data[k + 1] + 0.0722 * data[k + 2]) / 255;
        if (o.invert) v = 1 - v;
        // lift rescales a blurred two-tone source back toward full range.
        if (o.lift) v = Math.min(1, v * o.lift);
        out[gy * g.cols + gx] = Math.pow(v, gamma);
      }
    }
    toneCache.set(key, out);
    return out;
  }

  /**
   * Draws one frame. `field` is either a Float32Array tone grid or a
   * function (index, x, y) -> tone in 0..1. A cell is lit when its tone is
   * over the anchored Bayer threshold. ink is a hex string or an [r, g, b]
   * triple; paper is a hex string, or null for a transparent ground.
   */
  function draw(g, field, opts) {
    const o = opts || {};
    const ink = Array.isArray(o.ink) ? o.ink : parseColor(o.ink || '#ffffff');
    const paper = o.paper ? (Array.isArray(o.paper) ? o.paper : parseColor(o.paper)) : null;
    const d = g.image.data;
    const fn = typeof field === 'function';
    let i = 0;
    for (let y = 0; y < g.rows; y++) {
      for (let x = 0; x < g.cols; x++, i++) {
        const tone = fn ? field(i, x, y) : field[i];
        const lit = tone > thresholdAt(g, x, y);
        const k = i * 4;
        if (lit) {
          d[k] = ink[0];
          d[k + 1] = ink[1];
          d[k + 2] = ink[2];
          d[k + 3] = 255;
        } else if (paper) {
          d[k] = paper[0];
          d[k + 1] = paper[1];
          d[k + 2] = paper[2];
          d[k + 3] = 255;
        } else {
          d[k + 3] = 0;
        }
      }
    }
    g.octx.putImageData(g.image, 0, 0);
    g.ctx.imageSmoothingEnabled = false;
    g.ctx.clearRect(0, 0, g.width, g.height);
    g.ctx.drawImage(g.off, 0, 0, g.cols * g.cell, g.rows * g.cell);
  }

  /**
   * The craft page's mix: tone a to tone b on one smoothstep. Returns a
   * field function for draw(). p is the transition's raw progress 0..1.
   */
  function mix(a, b, p) {
    const s = smoothstep(0, 1, p);
    return function (i) {
      const av = typeof a === 'function' ? a(i) : a[i];
      const bv = typeof b === 'function' ? b(i) : b[i];
      return av + (bv - av) * s;
    };
  }

  /** Analytic fields on cell coordinates (u, v in 0..1 across the grid). */
  const fields = {
    /** A horizontal ramp: 1 at u0, 0 at u1. */
    ramp(g, u0, u1) {
      return function (i, x) {
        return 1 - smoothstep(u0, u1, x / g.cols);
      };
    },
    /** A lit disc with a limb falloff, centre (cu, cv) and radius r in grid widths. */
    disc(g, cu, cv, r, soft) {
      const aspect = g.rows / g.cols;
      return function (i, x, y) {
        const du = x / g.cols - cu;
        const dv = (y / g.rows - cv) * aspect;
        const d = Math.sqrt(du * du + dv * dv) / r;
        return 1 - smoothstep(1 - (soft || 0.2), 1, d);
      };
    },
    /** An arc band like the brand opener's event horizon. */
    horizon(g, cu, cv, r, width) {
      const aspect = g.rows / g.cols;
      return function (i, x, y) {
        const du = x / g.cols - cu;
        const dv = (y / g.rows - cv) * aspect;
        const d = Math.abs(Math.sqrt(du * du + dv * dv) - r) / width;
        return Math.max(0, 1 - d * d);
      };
    },
  };

  /** A seeded PRNG (mulberry32) for any random-looking placement. */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  window.GTDither = { B8, B4, grid, toneFromImage, draw, mix, fields, smoothstep, lerp, mixColor, parseColor, rng };
})();
