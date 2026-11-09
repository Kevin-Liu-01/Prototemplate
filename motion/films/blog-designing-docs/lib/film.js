/*
 * blog-designing-docs, the v4 cut (DESIGN-v4.md; the v3 build's drawing kept): the film's shared drawing.
 *
 * The palette is the film's material and nothing else: the blue gem smoke
 * (white and #86a8ff smoke on #2f5ce0, kit/gemsmoke.js) and the Bayer dither
 * in that material's own tones on the post cover's navy page #071124.
 *
 * Every dithered piece is drawn into one cell buffer per scene (Cells): one
 * 3 px cell grid anchored at the frame's top left, one 8 by 8 Bayer tile
 * (GTDither.B8) anchored at cell (0, 0). A piece is lit where its tone is
 * over the cell's threshold, so a piece enters, changes and leaves only by
 * tone and its cells switch in Bayer order. A cell holds one ink; a later
 * piece wins where it is lit. Hairlines, crosses and doubled lines are SVG.
 *
 * Everything here is a pure function of its inputs; the composition calls it
 * from the timeline's onUpdate with film time.
 */
(function () {
  'use strict';
  const W = 1920;
  const H = 1080;
  const CELL = 3;
  const COLS = W / CELL;
  const ROWS = H / CELL;
  const C = { navy: '#071124', blue: '#2f5ce0', lift: '#86a8ff', white: '#ffffff' };
  /* Ink indices in a cell buffer: 0 shows the page under it. */
  const K = { none: 0, blue: 1, lift: 2, white: 3, navy: 4 };
  const RGB = [null, [47, 92, 224], [134, 168, 255], [255, 255, 255], [7, 17, 36]];
  const B8 = window.GTDither.B8;
  const TH = new Float32Array(COLS * ROWS);
  for (let y = 0, i = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++, i++) TH[i] = (B8[(y & 7) * 8 + (x & 7)] + 0.5) / 64;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const lin = (a, b, x) => clamp01((x - a) / (b - a));
  const ease = {
    expoOut: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    p3out: (p) => 1 - Math.pow(1 - clamp01(p), 3),
    p2io: (p) => {
      p = clamp01(p);
      return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    },
    p2out: (p) => 1 - Math.pow(1 - clamp01(p), 2),
    // A long camera move (v4 fix round): its speed rises over the first 30 percent on a cosine ramp, holds, and falls
    // over the last 30 percent, so it starts and lands at zero speed and its top speed is 1.43 times its mean (power2
    // inOut's is 2 times).
    trap: (p) => {
      p = clamp01(p);
      const a = 0.3, v = 1 / (1 - a);
      const ramp = (x) => v * (x / 2 - (a / (2 * Math.PI)) * Math.sin((Math.PI * x) / a));
      if (p < a) return ramp(p);
      if (p > 1 - a) return 1 - ramp(1 - p);
      return v * (a / 2 + p - a);
    },
  };
  /* Progress of a move that runs from t0 for d seconds. */
  const prog = (t, t0, d) => clamp01((t - t0) / d);

  /* One scene's cell buffer over a full-frame canvas. */
  class Cells {
    constructor(canvas) {
      this.g = window.GTDither.grid(canvas, CELL, { width: W, height: H });
      this.lv = new Uint8Array(COLS * ROWS);
      this.rowP = new Float32Array(ROWS).fill(1);
    }
    clear() {
      this.lv.fill(0);
      this.rowP.fill(1);
    }
    /* A presence per cell row (a tone envelope down the frame), multiplied into every piece. */
    rows(fn) {
      for (let r = 0; r < ROWS; r++) this.rowP[r] = fn(r * CELL + 1.5);
    }
    span(x, y, w, h) {
      const x0 = clamp(Math.round(x / CELL), 0, COLS);
      const y0 = clamp(Math.round(y / CELL), 0, ROWS);
      let x1 = clamp(Math.round((x + w) / CELL), 0, COLS);
      let y1 = clamp(Math.round((y + h) / CELL), 0, ROWS);
      if (x1 <= x0 && x0 < COLS && w > 0) x1 = x0 + 1;
      if (y1 <= y0 && y0 < ROWS && h > 0) y1 = y0 + 1;
      return [x0, y0, x1, y1];
    }
    /* Fills a rect (frame px, snapped to cells) with ink where tone v is over the threshold. */
    rect(x, y, w, h, ink, v) {
      if (!(v > 0)) return;
      const [x0, y0, x1, y1] = this.span(x, y, w, h);
      const lv = this.lv;
      for (let yy = y0; yy < y1; yy++) {
        const vv = v * this.rowP[yy];
        for (let xx = x0, i = yy * COLS + x0; xx < x1; xx++, i++) if (vv > TH[i]) lv[i] = ink;
      }
    }
    /* A rect whose lit cells take ink b where s is over the threshold, else ink a (a tone mix on the one tile). */
    mix(x, y, w, h, a, b, v, s) {
      if (!(v > 0)) return;
      const [x0, y0, x1, y1] = this.span(x, y, w, h);
      const lv = this.lv;
      for (let yy = y0; yy < y1; yy++) {
        const vv = v * this.rowP[yy];
        for (let xx = x0, i = yy * COLS + x0; xx < x1; xx++, i++) if (vv > TH[i]) lv[i] = s > TH[i] ? b : a;
      }
    }
    /* A one-cell border. */
    stroke(x, y, w, h, ink, v) {
      if (!(v > 0)) return;
      this.rect(x, y, w, CELL, ink, v);
      this.rect(x, y + h - CELL, w, CELL, ink, v);
      this.rect(x, y, CELL, h, ink, v);
      this.rect(x + w - CELL, y, CELL, h, ink, v);
    }
    /* Generic per-cell write: fn(i, cx, cy) returns an ink index or -1 to leave the cell. */
    each(x0, y0, x1, y1, fn) {
      const lv = this.lv;
      for (let yy = y0; yy < y1; yy++)
        for (let xx = x0, i = yy * COLS + x0; xx < x1; xx++, i++) {
          const k = fn(i, xx, yy);
          if (k >= 0) lv[i] = k;
        }
    }
    paint() {
      const d = this.g.image.data;
      const lv = this.lv;
      for (let i = 0, k = 0; i < lv.length; i++, k += 4) {
        const c = RGB[lv[i]];
        if (c) {
          d[k] = c[0];
          d[k + 1] = c[1];
          d[k + 2] = c[2];
          d[k + 3] = 255;
        } else d[k + 3] = 0;
      }
      const g = this.g;
      g.octx.putImageData(g.image, 0, 0);
      g.ctx.imageSmoothingEnabled = false;
      g.ctx.clearRect(0, 0, W, H);
      g.ctx.drawImage(g.off, 0, 0, W, H);
    }
  }

  /* ---------- SVG ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function el(parent, tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  /* A 1 px hairline on the pixel grid. */
  function hair(s, x1, y1, x2, y2, color) {
    return el(s, 'line', { x1: x1 + 0.5, y1: y1 + 0.5, x2: x2 + 0.5, y2: y2 + 0.5, stroke: color || C.blue, 'stroke-width': 1, 'shape-rendering': 'crispEdges' });
  }
  function box(s, x, y, w, h, color) {
    return el(s, 'rect', { x: x + 0.5, y: y + 0.5, width: w - 1, height: h - 1, fill: 'none', stroke: color || C.blue, 'stroke-width': 1, 'shape-rendering': 'crispEdges' });
  }
  /* A 2 px cross with arms of a px each way from (x, y), on whole pixels (the connectors' crosses, v4). */
  function cross2(s, x, y, color, a) {
    const q = a || 8;
    return el(s, 'path', { d: `M${x - q} ${y}H${x + q}M${x} ${y - q}V${y + q}`, stroke: color || C.white, 'stroke-width': 2, fill: 'none', 'shape-rendering': 'crispEdges' });
  }
  /* A registration cross, 13 px, centred on (x, y), as one path. */
  function cross(s, x, y, color, r) {
    const q = r || 6;
    return el(s, 'path', { d: `M${x - q} ${y + 0.5}H${x + q + 1}M${x + 0.5} ${y - q}V${y + q + 1}`, stroke: color || C.lift, 'stroke-width': 1, fill: 'none', 'shape-rendering': 'crispEdges' });
  }
  /*
   * The doubled line: one path stroked twice, the full gauge in the ink under
   * a core in the ground, carving two whole-pixel threads (gauge 7, core 3:
   * two 2 px threads around a 3 px core when the path sits on pixel centres).
   */
  function doubled(s, ink, ground, gauge, core) {
    const g = el(s, 'g', {});
    const a = el(g, 'path', { d: 'M0 0', fill: 'none', stroke: ink || C.lift, 'stroke-width': gauge || 7, 'stroke-linejoin': 'miter', 'stroke-miterlimit': 10, 'stroke-linecap': 'butt' });
    const b = el(g, 'path', { d: 'M0 0', fill: 'none', stroke: ground || C.navy, 'stroke-width': core || 3, 'stroke-linejoin': 'miter', 'stroke-miterlimit': 10, 'stroke-linecap': 'butt' });
    return {
      g,
      set(d) {
        a.setAttribute('d', d || 'M0 0');
        b.setAttribute('d', d || 'M0 0');
      },
    };
  }

  /* A polyline in frame px with its arc length; sub(L) is the path up to length L as real geometry. */
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
      const a = L1 == null ? 0 : L0;
      const b = L1 == null ? L0 : L1;
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

  /* ---------- the docs page ---------- */
  /*
   * The page in page units (1440 x 900), read from the post's cover and its
   * zone figures (A1, A4, B5): a sidebar (logo, section switcher, three groups
   * of one accordion, footer links, language), a content column (title,
   * summary, meta, rule, paragraph, a section heading, eight cards), a header
   * row of five controls (search icon, theme toggle, star pill, Sign In, Get
   * a Demo) and the contents rail. This is the clean page. The old page is the
   * same page without the controls tagged ctl 'search' and 'star', plus the
   * four extras of extras() (the post's B1).
   * kind: 'title' | 'text' | 'box' | 'fill' | 'rule' | 'icon' | 'mark'
   * acc: the accordion's parts in the sidebar (sw, g1, g2, g3); foot: the
   * sidebar's footer links; writing: the reading order of the content's text.
   */
  function page() {
    const E = [];
    const add = (kind, zone, x, y, w, h, extra) => E.push(Object.assign({ kind, zone, x, y, w, h }, extra || {}));
    // v4: the mark is 44 units wide (was 30), so it reads on the iso header plate where it turns white on "General".
    // 2026-11-09: the globe, square at the doubled-line mark's height (28), the name 12 units after it as before
    add('mark', 'side', 24, 16, 28, 28, { logo: true });
    add('text', 'side', 64, 26, 110, 8, { strong: true, logo: true, name: true });
    add('box', 'side', 16, 86, 240, 48, { acc: 'sw' });
    add('icon', 'side', 28, 98, 24, 24, { acc: 'sw' });
    add('text', 'side', 64, 100, 78, 8, { strong: true, acc: 'sw' });
    add('text', 'side', 64, 116, 58, 6, { acc: 'sw' });
    add('text', 'side', 24, 162, 74, 8, { strong: true, acc: 'g1', head: true });
    [190, 214, 238].forEach((y, i) => add('text', 'side', 34, y, [72, 96, 118][i], 7, { row: true, acc: 'g1', ri: i }));
    add('text', 'side', 24, 278, 78, 8, { strong: true, acc: 'g2', head: true });
    // The active page is the third row of g2, inside the nested part, so the thumb reaches it through the bend.
    add('fill', 'side', 18, 342, 236, 22, { active: true, acc: 'g2' });
    [[34, 302, 44], [52, 326, 70], [52, 350, 126], [52, 374, 136], [34, 398, 98], [34, 422, 92], [34, 446, 52]].forEach(([x, y, w], i) => add('text', 'side', x, y, w, 7, { row: true, acc: 'g2', ri: i, nested: x > 40, active: i === 2 }));
    add('text', 'side', 24, 486, 64, 8, { strong: true, acc: 'g3', head: true });
    [[34, 510, 60], [34, 534, 84], [34, 558, 48]].forEach(([x, y, w], i) => add('text', 'side', x, y, w, 7, { row: true, acc: 'g3', ri: i }));
    [700, 726, 752, 778].forEach((y, i) => {
      add('icon', 'side', 24, y - 3, 14, 14, { foot: true, fi: i });
      add('text', 'side', 50, y, [76, 72, 54, 78][i], 7, { foot: true, fi: i });
    });
    add('box', 'side', 16, 822, 240, 40, { lang: true });
    add('icon', 'side', 28, 834, 16, 16, { lang: true });
    add('text', 'side', 54, 838, 92, 8, { lang: true });
    add('icon', 'side', 226, 834, 16, 16, { lang: true });
    // The content column.
    add('title', 'content', 332, 80, 268, 30, { writing: 0 });
    add('text', 'content', 332, 128, 640, 9, { writing: 1 });
    add('text', 'content', 332, 160, 170, 7, { italic: true });
    add('box', 'content', 980, 152, 128, 28);
    add('rule', 'content', 332, 200, 776, 1);
    add('text', 'content', 332, 224, 776, 9, { writing: 2 });
    add('text', 'content', 332, 244, 432, 9, { writing: 2 });
    add('title', 'content', 332, 292, 156, 16, { h2: true, writing: 3 });
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++) {
        const x = 332 + c * 198;
        const y = 330 + r * 168;
        const ci = r * 4 + c;
        add('box', 'content', x, y, 182, 152, { card: true, ci });
        add('icon', 'content', x + 16, y + 16, 22, 22, { card: true, ci });
        add('text', 'content', x + 16, y + 54, [46, 30, 66, 50, 34, 26, 84, 62][ci], 9, { strong: true, card: true, ci, writing: 4 });
        [74, 88, 102].forEach((yy, k) => add('text', 'content', x + 16, y + yy, [140, 128, 84][(k + c + r) % 3], 6, { card: true, ci }));
      }
    // The header row of five controls (B5's new top band). The search icon and the star pill are where the old
    // page's search field and GitHub banner went (extras().to), so the old page has neither.
    add('box', 'head', 1108, 18, 28, 28, { ctl: 'search' });
    add('icon', 'head', 1114, 24, 16, 16, { ctl: 'search' });
    add('icon', 'head', 1150, 23, 18, 18, { ctl: 'theme' });
    add('box', 'head', 1180, 18, 72, 28, { ctl: 'star' });
    add('icon', 'head', 1190, 25, 14, 14, { ctl: 'star' });
    add('text', 'head', 1212, 29, 30, 6, { ctl: 'star' });
    add('text', 'head', 1268, 29, 38, 7, { signin: true });
    add('fill', 'head', 1326, 18, 98, 28, { action: true });
    // The contents rail.
    add('icon', 'rail', 1168, 82, 12, 12);
    add('text', 'rail', 1188, 84, 88, 7, { strong: true });
    // v4: six rows at a 24-unit pitch on a 146-unit rule (was three on 78), so the iso thumb has room to travel.
    add('rule', 'rail', 1168, 104, 1, 146, { vertical: true, railRule: true });
    [110, 134, 158, 182, 206, 230].forEach((y, i) => add('text', 'rail', 1182, y, [72, 138, 40, 96, 60, 112][i], 7, { active: i === 0, railRow: i }));
    return E;
  }
  /*
   * The old page's four extras (the post's B1 redline pass: the search field,
   * the GitHub banner, the sidebar toggle and the header rule), each with the
   * kind of thing it is (the post's own list: lines, links, buttons) and its
   * parts in page units. to: where B5 says a part went (the banner to the star
   * pill, the search field to the search icon); gone: a part with no place on
   * the new page. The toggle and the rule go to nothing.
   */
  function extras() {
    return [
      {
        id: 'banner', kind: 'link', zone: 'side', r: [16, 52, 240, 26],
        parts: [
          { kind: 'box', x: 16, y: 52, w: 240, h: 26, to: [1180, 18, 72, 28] },
          { kind: 'icon', x: 92, y: 58, w: 14, h: 14, to: [1190, 25, 14, 14] },
          { kind: 'text', x: 112, y: 62, w: 84, h: 6, to: [1212, 29, 30, 6] },
        ],
      },
      {
        id: 'toggle', kind: 'button', zone: 'side', r: [258, 19, 22, 22],
        parts: [
          { kind: 'box', x: 258, y: 19, w: 22, h: 22 },
          { kind: 'text', x: 264, y: 24, w: 3, h: 12 },
        ],
      },
      {
        id: 'search', kind: 'button', zone: 'head', r: [318, 15, 230, 30],
        parts: [
          { kind: 'box', x: 318, y: 15, w: 230, h: 30, to: [1108, 18, 28, 28] },
          { kind: 'icon', x: 330, y: 23, w: 14, h: 14, to: [1114, 24, 16, 16] },
          { kind: 'text', x: 352, y: 27, w: 66, h: 6, gone: true },
          { kind: 'box', x: 518, y: 21, w: 20, h: 18, gone: true },
        ],
      },
      { id: 'rule', kind: 'line', zone: 'head', r: [294, 60, 1146, 1], parts: [{ kind: 'rule', x: 294, y: 60, w: 1146, h: 1 }] },
    ];
  }

  /* Maps page units into the frame at scale s from (ox, oy), snapped to cells. */
  function place(s, ox, oy) {
    const q = (v) => Math.round(v / CELL) * CELL;
    return (e) => Object.assign({}, e, { X: q(ox + e.x * s), Y: q(oy + e.y * s), Wd: Math.max(CELL, q(e.w * s)), Ht: Math.max(CELL, q(e.h * s)) });
  }

  /*
   * The clutter the post names, laid over the page in lines 4 and 5: a GitHub
   * banner and a search field in the header, a tab bar, breadcrumbs, eyebrow
   * pills, extra rules, boxes inside boxes, toasts, a callout, a row of extra
   * buttons, badges and outline icons on every card, a second navigation, an
   * icon rail, a floating widget and a footer banner, then a spill past the
   * page into the frame. Page units. Each piece is a fill at a tone and/or a
   * one-cell border, so it enters and leaves by tone. Only the lines, links
   * and buttons land on General Translation's page (the post: "in our case, a
   * lot of extra lines, links, and buttons"); the general signs of AI design
   * (kind 'other') land off the page in the spill, except the toast, which
   * hangs over the page's top edge onto the action.
   */
  function clutter() {
    // Every piece carries the kind the deletion takes it by (line 5): 'line' (extra rules and hairlines, boxes drawn
    // inside boxes), 'link' (the banner, the tab bar, breadcrumbs, link rows, a second section nav, link chips),
    // 'button' (the search field, the toggle, rows of extra square buttons, the icon rail, a floating button) or
    // 'other' (eyebrow pills, badges and outline icons, toasts, the callout, the floating widget, the footer banner,
    // the ghost copies of the title). The 'other' pieces are drawn here at their page places in groups (g), then moved
    // whole into the spill zones off the page (SPOT below), so they leave with the spill.
    const Q = [];
    const add = (kind, x, y, w, h, p) => Q.push(Object.assign({ kind, x, y, w, h }, p));
    add('link', 318, 8, 470, 42, { fill: 'blue', v: 0.42, border: 'lift' });
    add('link', 338, 22, 220, 9, { fill: 'white', v: 1 });
    add('button', 818, 12, 300, 34, { border: 'lift' });
    add('button', 832, 22, 14, 14, { border: 'white' });
    add('button', 858, 25, 140, 7, { fill: 'lift', v: 0.7 });
    add('button', 262, 20, 24, 24, { border: 'white' });
    [0, 1, 2, 3, 4, 5].forEach((i) => add('link', 318 + i * 132, 66, 122, 26, { fill: i === 0 ? 'lift' : 'blue', v: i === 0 ? 0.55 : 0.2, border: i === 0 ? 'white' : 'lift' }));
    [0, 1, 2, 3].forEach((i) => add('link', 332 + i * 74, 104, 56, 6, { fill: 'lift', v: 1 }));
    add('other', 620, 84, 120, 22, { fill: 'white', v: 0.5, border: 'white', g: 'pillA' });
    add('other', 500, 292, 108, 18, { fill: 'white', v: 0.5, border: 'white', g: 'pillB' });
    [120, 186, 214, 282, 318].forEach((y, i) => add('line', 318, y, 800, 3, { fill: i % 2 ? 'blue' : 'lift', v: 1 }));
    add('other', 712, 222, 380, 64, { fill: 'blue', v: 0.32, border: 'lift', g: 'callout' });
    [236, 252, 268].forEach((y, i) => add('other', 730, y, [300, 336, 210][i], 6, { fill: 'white', v: 1, g: 'callout' }));
    [0, 1, 2, 3].forEach((i) => add('button', 332 + i * 100, 258, 90, 24, { border: 'lift', fill: 'blue', v: 0.16 }));
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++) {
        const x = 332 + c * 198;
        const y = 330 + r * 168;
        add('other', x + 124, y + 12, 46, 14, { fill: 'white', v: 0.75, g: 'badge' + (r * 4 + c) });
        add('other', x + 12, y + 12, 30, 30, { border: 'lift', g: 'icon' + (r * 4 + c) });
        add('line', x + 6, y + 120, 170, 22, { border: 'blue', fill: 'blue', v: 0.3 });
      }
    add('link', 1160, 196, 262, 300, { fill: 'blue', v: 0.18, border: 'lift' });
    [214, 238, 262, 286, 310, 334, 358, 382, 406, 430, 454].forEach((y, i) => add('link', 1178, y, [120, 168, 90, 150, 200, 110, 180, 76, 140, 160, 98][i], 7, { fill: i % 3 ? 'lift' : 'white', v: 1 }));
    [70, 130, 190, 250, 310, 370, 430].forEach((y) => add('button', 300, y + 40, 22, 22, { fill: 'lift', v: 0.5, border: 'lift' }));
    add('other', 1288, 556, 136, 64, { fill: 'lift', v: 0.4, border: 'white', g: 'widget' });
    add('other', 1304, 576, 80, 8, { fill: 'white', v: 1, g: 'widget' });
    add('other', 318, 664, 800, 26, { fill: 'blue', v: 0.35, border: 'lift', g: 'footer' });
    [490, 514, 538, 562, 586, 610, 634].forEach((y, i) => add('link', 34, y, [110, 82, 140, 96, 120, 60, 130][i], 7, { fill: i % 2 ? 'lift' : 'white', v: 1 }));
    add('link', 16, 476, 240, 176, { border: 'lift' });
    [0, 1, 2].forEach((i) => add('line', 930 + i * 14, 132 + i * 10, 176 - i * 28, 56 - i * 20, { border: i === 1 ? 'white' : 'lift', fill: i === 2 ? 'white' : undefined, v: 0.5 }));
    add('other', 1176, 70, 236, 38, { fill: 'lift', v: 0.3, border: 'lift', g: 'toasts' });
    add('other', 1190, 116, 236, 38, { fill: 'white', v: 0.22, border: 'white', g: 'toasts' });
    add('other', 1206, 130, 120, 7, { fill: 'white', v: 1, g: 'toasts' });
    add('other', 352, 64, 268, 30, { fill: 'lift', v: 0.22, g: 'ghost' });
    add('other', 372, 48, 268, 30, { fill: 'lift', v: 0.1, g: 'ghost' });
    add('line', 552, 312, 182, 152, { border: 'lift', fill: 'lift', v: 0.08 });
    add('line', 566, 296, 182, 152, { border: 'blue' });
    [[452, 164, 64], [1012, 296, 58], [700, 470, 52], [1080, 470, 70], [380, 640, 56], [860, 642, 62], [214, 118, 40]].forEach(([x, y, w], i) => add('link', x, y, w, 14, { fill: i % 2 ? 'white' : 'lift', v: 0.8, border: i % 2 ? undefined : 'white' }));
    // From the v2 pile: extra hairlines down and across the column, a row of square buttons, a floating button.
    [[322, 70, 1, 600], [1124, 70, 1, 600], [318, 492, 800, 1], [318, 820, 800, 1]].forEach(([x, y, w, h]) => add('line', x, y, w, h, { fill: 'lift', v: 1 }));
    [0, 1, 2, 3, 4].forEach((i) => add('button', 620 + i * 32, 158, 24, 24, { border: 'white', fill: 'lift', v: 0.35 }));
    add('button', 1352, 586, 52, 52, { fill: 'lift', v: 0.45, border: 'white' });
    add('button', 1364, 604, 28, 8, { fill: 'white', v: 1 });
    // A toast over the one filled action (an opaque navy plate, a white edge, two lines of text), so the clutter buries
    // it. It hangs over the page's top edge onto the smoke, so it reads as laid over the page from outside.
    add('other', 1300, -34, 140, 92, { fill: 'navy', v: 1, border: 'white', cover: true });
    add('other', 1316, -14, 92, 7, { fill: 'lift', v: 1, cover: true });
    add('other', 1316, 0, 56, 6, { fill: 'lift', v: 0.6, cover: true });
    // Each 'other' group's new top-left in the spill zones, every piece wholly off the page: the left margin
    // (x + w at most -8, y 12 to 690) or above the page (y + h at most -8, x 650 to 1510, clear of the headings).
    const SPOT = {
      pillA: [-200, 200], pillB: [1030, -128], callout: [700, -305], widget: [-280, 600], footer: [690, -52], toasts: [1250, -320], ghost: [-430, 20],
      badge0: [-420, 110], badge1: [-140, 250], badge2: [-390, 360], badge3: [-96, 430], badge4: [-330, 520], badge5: [-180, 640], badge6: [1420, -300], badge7: [880, -40],
      icon0: [-300, 160], icon1: [-70, 330], icon2: [-250, 420], icon3: [-430, 560], icon4: [-110, 540], icon5: [-370, 250], icon6: [1300, -200], icon7: [960, -230],
    };
    const box0 = {};
    for (const q of Q) if (q.g) {
      const b = box0[q.g] || (box0[q.g] = [q.x, q.y]);
      b[0] = Math.min(b[0], q.x), b[1] = Math.min(b[1], q.y);
    }
    for (const q of Q) if (q.g) {
      const [nx, ny] = SPOT[q.g];
      q.x = nx + q.x - box0[q.g][0];
      q.y = ny + q.y - box0[q.g][1];
      q.spill = true;
    }
    const inPage = Q.filter((q) => !q.spill).length;
    // The spill past the page: the left margin of the frame, then up beside the heading.
    const rng = window.GTDither.rng(417);
    const inks = ['white', 'lift', 'lift', 'blue'];
    for (let i = 0; i < 40; i++) {
      const kind = rng();
      const up = i >= 26;
      const x = up ? 650 + rng() * 730 : -440 + rng() * 400;
      const y = up ? -350 + rng() * 310 : 12 + rng() * 660;
      const w = kind < 0.45 ? 40 + rng() * 90 : kind < 0.8 ? 90 + rng() * 210 : 120 + rng() * 300;
      const h = kind < 0.45 ? 12 + rng() * 8 : kind < 0.8 ? 30 + rng() * 120 : 3;
      const ink = inks[Math.floor(rng() * inks.length)];
      if (kind < 0.45) add('other', x, y, w, h, { fill: ink, v: 0.85, border: rng() < 0.5 ? 'white' : undefined, spill: true });
      else if (kind < 0.8) add('other', x, y, w, h, { border: ink, fill: rng() < 0.6 ? 'blue' : undefined, v: 0.2 + rng() * 0.3, spill: true });
      else add('other', x, y, w, h, { fill: ink, v: 1, spill: true });
    }
    // Late pieces: the clutter keeps arriving after "clutter" until the redline, in the spill zones only.
    const r2 = window.GTDither.rng(909);
    for (let i = 0; i < 12; i++) {
      const up = i % 2 === 1;
      const x = up ? 680 + r2() * 690 : -430 + r2() * 380;
      const y = up ? -330 + r2() * 280 : 30 + r2() * 640;
      const pill = r2() < 0.6;
      const ink = inks[Math.floor(r2() * inks.length)];
      if (pill) add('other', x, y, 40 + r2() * 80, 12 + r2() * 6, { fill: ink, v: 0.85, border: r2() < 0.5 ? 'white' : undefined, spill: true, late: i });
      else add('other', x, y, 90 + r2() * 180, 30 + r2() * 70, { border: ink, fill: 'blue', v: 0.25, spill: true, late: i });
    }
    Q.inPage = inPage;
    return Q;
  }

  /*
   * A docs page in miniature for the wall in line 6 (v4): drawn at a base size of 240 x 150 frame px (the page box
   * page at 0.186), scaled by s from its top left (x, y), on a 2D canvas, with 3 px bars and 2 px outlines at the base
   * size. kind 'old': another docs site, carrying the three old navigation surfaces in miniature (a tab bar, a sub-tab
   * row and a second section nav), its layout varied by seed; kind 'gt': General Translation's page with its one
   * accordion. ink: bars and outlines; hi: headings and titles.
   */
  function mini(ctx, x, y, s, kind, ink, hi, seed, mode) {
    // mode (fix round): 'lines' draws the ground, the frame, the rules and the outlined boxes; 'bars' only the filled
    // bars; 'all' (the default) both. The wall draws its pages' bars at a lower tone while the camera moves.
    const md = mode || 'all';
    let lineCall = false;
    const R = (a, b, w, h, col) => {
      if (md !== 'all' && (md === 'lines') !== lineCall) return;
      const X0 = Math.round(x + a * s), Y0 = Math.round(y + b * s), X1 = Math.round(x + (a + w) * s), Y1 = Math.round(y + (b + h) * s);
      if (X1 <= X0 || Y1 <= Y0 || X1 < 0 || Y1 < 0 || X0 > W || Y0 > H) return;
      ctx.fillStyle = col;
      ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    };
    const L = (fn) => {
      lineCall = true;
      fn();
      lineCall = false;
    };
    const O = (a, b, w, h, col) =>
      L(() => {
        R(a, b, w, 2, col);
        R(a, b + h - 2, w, 2, col);
        R(a, b, 2, h, col);
        R(a + w - 2, b, 2, h, col);
      });
    const rng = window.GTDither.rng(seed || 1);
    const vw = (w) => Math.max(4, Math.round(w * (0.7 + 0.6 * rng())));
    const pick = (arr) => arr[Math.floor(rng() * arr.length) % arr.length];
    L(() => R(0, 0, 240, 150, C.navy));
    O(0, 0, 240, 150, ink);
    if (kind === 'gt') {
      L(() => {
        R(48, 0, 2, 150, ink);
        R(50, 12, 190, 2, ink);
        R(188, 14, 2, 136, ink);
      });
      R(5, 3, 8, 5, hi);
      R(15, 4, 18, 3, hi);
      O(4, 15, 40, 9, ink);
      R(8, 18, 18, 3, hi);
      R(4, 29, 14, 3, hi);
      [[7, 34, 12], [7, 39, 16], [7, 44, 20]].forEach(([a, b, w]) => R(a, b, w, 3, ink));
      R(4, 51, 14, 3, hi);
      [[7, 56, 8], [10, 61, 12]].forEach(([a, b, w]) => R(a, b, w, 3, ink));
      R(3, 65, 43, 7, ink);
      R(10, 67, 22, 3, hi);
      [[10, 74, 24], [7, 79, 16], [7, 84, 15]].forEach(([a, b, w]) => R(a, b, w, 3, ink));
      R(4, 91, 12, 3, hi);
      [[7, 96, 10], [7, 101, 14]].forEach(([a, b, w]) => R(a, b, w, 3, ink));
      R(2, 33, 2, 71, ink);
      [118, 123, 128].forEach((b, i) => R(4, b, [13, 12, 9][i], 3, ink));
      O(3, 137, 40, 8, ink);
      // The header row of five controls: search, theme, star pill, Sign In, Get a Demo.
      O(176, 3, 7, 7, ink);
      R(187, 5, 4, 4, ink);
      O(195, 3, 13, 7, ink);
      R(211, 5, 8, 3, ink);
      R(222, 3, 15, 7, ink);
      R(55, 19, 46, 6, hi);
      R(55, 29, 108, 3, ink);
      R(55, 35, 30, 2, ink);
      R(55, 40, 128, 2, ink);
      R(55, 45, 128, 3, ink);
      R(55, 50, 72, 3, ink);
      R(55, 58, 26, 4, hi);
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 4; c++) {
          O(55 + c * 33, 66 + r * 30, 30, 26, ink);
          R(59 + c * 33, 70 + r * 30, 5, 4, ink);
          R(59 + c * 33, 79 + r * 30, 14, 3, hi);
          R(59 + c * 33, 85 + r * 30, 20, 3, ink);
        }
      R(193, 18, 16, 3, hi);
      R(193, 23, 2, 26, ink);
      [[197, 24, 14], [197, 29, 24], [197, 34, 9], [197, 39, 18], [197, 44, 12]].forEach(([a, b, w]) => R(a, b, w, 3, ink));
      return;
    }
    /*
     * Another site (fix round: each slot's seed sets its own layout, so the wall reads as many sites): its own logo and
     * header links, a search field, a GitHub button, a long flat sidebar of its own width, and always the three old
     * surfaces, each varied: a tab bar of 4 to 7 tabs, a sub-tab row of 3 to 6, and a second section nav on the left
     * or the right of the content; then a card grid or a list, and a contents rail on most of them.
     */
    const sw = pick([34, 40, 48, 56]);
    const rail = rng() < 0.7;
    const hh = pick([11, 12, 14]);
    const cx0 = sw + 6, cx1 = rail ? 184 : 234;
    L(() => {
      R(sw, 0, 2, 150, ink);
      R(sw + 2, hh, 238 - sw, 2, ink);
      if (rail) R(188, hh + 2, 2, 148 - hh, ink);
    });
    // The header: logo and name, links, a search field and a GitHub button.
    R(5, 3, 8, 5, ink);
    R(15, 4, Math.min(sw - 18, vw(18)), 3, ink);
    const sfw = vw(44);
    O(cx0, 2, sfw, hh - 3, ink);
    const nl = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < nl; i++) R(cx0 + sfw + 10 + i * 18, 5, vw(12), 3, ink);
    O(204, 2, 32, hh - 3, ink);
    // The sidebar: one long flat list.
    const rowP = pick([7, 8, 9]);
    for (let i = 0, b = hh + 5; b < 144; i++, b += rowP) R(i % 4 === 0 ? 4 : 7, b, Math.min(sw - 9, i % 4 === 0 ? vw(16) : vw(24)), 3, i % 4 === 0 ? hi : ink);
    // The tab bar.
    const nt = 4 + Math.floor(rng() * 4);
    const tp = Math.min(30, Math.floor((cx1 - cx0) / nt));
    const ty = hh + 5;
    for (let i = 0; i < nt; i++) {
      O(cx0 + i * tp, ty, tp - 2, 11, ink);
      R(cx0 + 4 + i * tp, ty + 4, Math.min(tp - 10, vw(12)), 3, ink);
    }
    // The sub-tab row.
    const ns = 3 + Math.floor(rng() * 4);
    const sp = Math.min(28, Math.floor((cx1 - cx0) / ns));
    const sy = ty + 16;
    for (let i = 0; i < ns; i++) R(cx0 + 1 + i * sp, sy, Math.min(sp - 6, vw(16)), 3, i === 0 ? hi : ink);
    // The second section nav, beside the content on the left or the right.
    const nw = pick([30, 36, 42]);
    const navRight = rng() < 0.35;
    const ny = sy + 8, nh = 144 - ny;
    const nx = navRight ? cx1 - nw : cx0;
    O(nx, ny, nw, nh, ink);
    for (let i = 0, b = ny + 6; b < ny + nh - 6; i++, b += 8) R(nx + 5, b, Math.min(nw - 10, vw(22)), 3, i === 2 ? hi : ink);
    // The content: a title, a few lines, then a card grid or a list.
    const ca = navRight ? cx0 : cx0 + nw + 6, cb = navRight ? cx1 - nw - 6 : cx1;
    const cw = cb - ca;
    R(ca, ny + 2, Math.min(cw, vw(54)), 6, hi);
    const nLines = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < nLines; i++) R(ca, ny + 12 + i * 5, Math.min(cw, vw(cw * 0.85)), 3, ink);
    const gy = ny + 14 + nLines * 5;
    if (rng() < 0.75) {
      const gc = cw > 90 ? pick([2, 3, 3, 4]) : pick([2, 2, 3]);
      const gr = gy + 60 < 144 ? pick([1, 2, 2]) : 1;
      const gw = Math.floor((cw + 3) / gc) - 3, gh = Math.min(28, Math.floor((144 - gy) / gr) - 3);
      for (let r = 0; r < gr; r++)
        for (let c = 0; c < gc; c++) {
          O(ca + c * (gw + 3), gy + r * (gh + 3), gw, gh, ink);
          R(ca + 4 + c * (gw + 3), gy + 5 + r * (gh + 3), Math.min(gw - 8, vw(12)), 3, hi);
          R(ca + 4 + c * (gw + 3), gy + 11 + r * (gh + 3), Math.min(gw - 8, vw(16)), 3, ink);
        }
    } else {
      for (let i = 0, b = gy; b < 140; i++, b += 7) R(ca, b, Math.min(cw, vw(cw * 0.7)), 3, i % 3 === 0 ? hi : ink);
    }
    if (rail) {
      R(193, hh + 6, vw(20), 3, hi);
      for (let i = 0; i < 9; i++) R(195, hh + 13 + i * 6, vw(26), 3, ink);
    }
  }

  /* ---------- the glyph planet (line 1) ---------- */
  /*
   * The sign-in globe's field (stills/partnership-globe/dither-lib.js
   * globe()), copied so the film carries no dependency outside its folder:
   * an orthographic sphere lit from the upper left, with a value-noise
   * landmass sampled in latitude and longitude so it turns with the surface.
   */
  function hash2(x, y) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const sx = xf * xf * (3 - 2 * xf);
    const sy = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi) + (hash2(xi + 1, yi) - hash2(xi, yi)) * sx;
    const b = hash2(xi, yi + 1) + (hash2(xi + 1, yi + 1) - hash2(xi, yi + 1)) * sx;
    return a + (b - a) * sy;
  }
  function fbm(x, y, oct) {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    for (let o = 0; o < oct; o++) {
      sum += vnoise(x, y) * amp;
      norm += amp;
      amp *= 0.5;
      x *= 2.03;
      y *= 2.01;
    }
    return sum / norm;
  }
  function globe(o) {
    const lx0 = -0.45, ly0 = -0.62, lz0 = 0.65;
    const ll = Math.hypot(lx0, ly0, lz0);
    const lx = lx0 / ll, ly = ly0 / ll, lz = lz0 / ll;
    const ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
    const f = (u, v, t, landmass) => {
      const px = ((u - o.cx) * o.aspect) / o.radius;
      const py = (v - o.cy) / o.radius;
      const d2 = px * px + py * py;
      if (d2 >= 1) return 0;
      const nz = Math.sqrt(1 - d2);
      let light = px * lx + py * ly + nz * lz;
      light = light < 0 ? 0 : light;
      let value = o.ambient + (1 - o.ambient) * light;
      value += o.rim * Math.pow(d2, 3.5);
      if (landmass) {
        const ay = py * ct - nz * st;
        const az = py * st + nz * ct;
        const lat = Math.asin(clamp(ay, -1, 1));
        const lon = Math.atan2(px, az) + t * o.spin;
        const land = fbm(Math.cos(lon) * 2.2 + 4.1, Math.sin(lon) * 2.2 + lat * 2.6, 4);
        value *= 1 - landmass + landmass * 2 * smooth(0.42, 0.62, land);
      }
      return clamp01(value) * smooth(1, 0.985, d2);
    };
    /* The surface point under (u, v) at time t as a unit vector in the sphere's own frame (it turns with the surface), or null off the disc. */
    f.dir = (u, v, t) => {
      const px = ((u - o.cx) * o.aspect) / o.radius;
      const py = (v - o.cy) / o.radius;
      const d2 = px * px + py * py;
      if (d2 >= 1) return null;
      const nz = Math.sqrt(1 - d2);
      const ay = py * ct - nz * st;
      const az = py * st + nz * ct;
      const lat = Math.asin(clamp(ay, -1, 1));
      const lon = Math.atan2(px, az) + t * o.spin;
      return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
    };
    return f;
  }
  /*
   * Glyphs from twenty writing systems. SCRIPTS[0] is Latin, the planet's one
   * script before "localization"; the other nineteen take a region each after
   * it. INK is each script's size factor, so a region keeps the planet's light
   * when its glyphs carry more or less ink than Latin's (Han is dense, Arabic
   * and Latin lowercase are light).
   */
  const SCRIPTS = [
    ['a', 'b', 'c', 'd', 'e', 'g', 'h', 'k', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'w', 'y', 'G', 'T', 'D', 'H', 'R', 'S'],
    ['α', 'β', 'γ', 'δ', 'λ', 'μ', 'π', 'σ', 'φ', 'ω', 'Ω', 'Σ', 'Δ', 'ξ'],
    ['Ж', 'я', 'ф', 'д', 'б', 'л', 'ш', 'ц', 'Щ', 'Ю', 'и', 'к'],
    ['א', 'ב', 'ג', 'ד', 'ש', 'ל', 'ת', 'מ', 'ר', 'ק'],
    ['ب', 'ع', 'ق', 'ك', 'م', 'ج', 'ح', 'س', 'ص', 'ط', 'ف', 'ه'],
    ['क', 'ह', 'श', 'ज', 'त', 'ग', 'न', 'म', 'र', 'भ', 'ष'],
    ['த', 'ழ', 'க', 'ம', 'ட', 'ந', 'ப', 'ய', 'வ'],
    ['ಕ', 'ಗ', 'ಮ', 'ನ', 'ತ', 'ಡ', 'ರ', 'ಸ'],
    ['ক', 'ভ', 'ম', 'ত', 'র', 'স', 'গ', 'ল'],
    ['ก', 'ญ', 'ม', 'ษ', 'ด', 'น', 'ร', 'ส', 'ห', 'อ'],
    ['ა', 'ღ', 'ქ', 'ბ', 'გ', 'დ', 'მ', 'ს', 'შ'],
    ['Ա', 'Ֆ', 'Ջ', 'Բ', 'Գ', 'Դ', 'Հ', 'Ս', 'ա', 'ր'],
    ['ሀ', 'ጸ', 'ሰ', 'ለ', 'መ', 'ረ', 'በ', 'ተ', 'ነ', 'ከ'],
    ['あ', 'ゆ', 'の', 'か', 'さ', 'た', 'な', 'は', 'ま', 'ら', 'わ', 'を'],
    ['カ', 'ネ', 'ト', 'ア', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ラ', 'ワ', 'ヲ'],
    ['文', '字', '語', '言', '世', '界', '翻', '譯', '國', '書', '人', '中'],
    ['한', '글', '말', '국', '어', '번', '역', '세', '계', '사', '람'],
    ['ᠮ', 'ᠣ', 'ᠩ', 'ᠭ', 'ᠤ', 'ᠯ', 'ᠰ'],
    ['ཀ', 'ཤ', 'ག', 'ད', 'ན', 'བ', 'མ', 'ར', 'ས'],
    ['ꦲ', 'ꦤ', 'ꦕ', 'ꦫ', 'ꦏ', 'ꦢ', 'ꦠ', 'ꦱ'],
  ];
  const INK = [1.08, 1.0, 1.0, 1.0, 1.1, 0.94, 0.92, 0.94, 0.94, 1.0, 1.0, 1.0, 0.96, 0.92, 0.94, 0.84, 0.88, 1.0, 0.96, 0.92];
  /* The canvas face is the film's own copy of Inter with the kit's cv11 baked in (lib/fonts). */
  const GLYPH_STACK = '"KatagamiCanvas", "Hiragino Sans", "PingFang SC", "Apple SD Gothic Neo", "Geeza Pro", "Kohinoor Devanagari", "Tamil Sangam MN", "Kannada Sangam MN", "Bangla Sangam MN", "Thonburi", "Kefa", "Noto Sans Mongolian", "Kailasa", "Noto Sans Javanese", "Noto Sans Armenian", system-ui, sans-serif';

  /*
   * Heroicons 2.2.0, solid, 24 x 24 (MIT, Tailwind Labs): cpu-chip for an
   * agent and user for a human, copied from node_modules/heroicons/24/solid.
   */
  const ICON_CPU = [
    'M16.5 7.5h-9v9h9v-9Z',
    'M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 17.25V6.75Z',
  ];
  const ICON_USER = ['M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z'];

  /* ---------- tone masks for canvas drawing (the reader grid) ---------- */
  /*
   * A Bayer tile per tone level (0 to 64 of 64): 24 px, the 8 by 8 screen of
   * 3 px cells at the frame's origin, opaque where a cell is lit at that tone.
   * Used as a destination-in pattern with the identity transform, it keeps
   * exactly the cells Cells.rect lights at that tone, so a vector piece drawn
   * on a canvas enters and leaves by tone on the film's one grid.
   */
  const LEVEL_TILES = [];
  function levelTile(level) {
    if (!LEVEL_TILES[level]) {
      const c = document.createElement('canvas');
      c.width = c.height = 24;
      const x = c.getContext('2d');
      x.fillStyle = '#000';
      const tone = level / 64;
      for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 8; xx++) if (tone > (B8[yy * 8 + xx] + 0.5) / 64) x.fillRect(xx * 3, yy * 3, 3, 3);
      LEVEL_TILES[level] = c;
    }
    return LEVEL_TILES[level];
  }
  let scratchC = null;
  /* Draws draw(ctx) onto ctx cut to the cells lit at one tone; rect [x0, y0, x1, y1] bounds the work. */
  function toneUniform(ctx, tone, draw, rect) {
    if (!(tone > 0)) return;
    if (tone >= 1) {
      draw(ctx);
      return;
    }
    if (!scratchC) {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      scratchC = { c, x: c.getContext('2d') };
    }
    const s = scratchC;
    const r = rect ? [Math.max(0, Math.floor(rect[0] / 24) * 24), Math.max(0, Math.floor(rect[1] / 24) * 24), Math.min(W, Math.ceil(rect[2])), Math.min(H, Math.ceil(rect[3]))] : [0, 0, W, H];
    const w = r[2] - r[0], h = r[3] - r[1];
    if (w <= 0 || h <= 0) return;
    s.x.setTransform(1, 0, 0, 1, 0, 0);
    s.x.globalCompositeOperation = 'source-over';
    s.x.clearRect(r[0], r[1], w, h);
    s.x.save();
    s.x.beginPath();
    s.x.rect(r[0], r[1], w, h);
    s.x.clip();
    draw(s.x);
    s.x.restore();
    s.x.setTransform(1, 0, 0, 1, 0, 0);
    s.x.globalCompositeOperation = 'destination-in';
    s.x.fillStyle = s.x.createPattern(levelTile(clamp(Math.round(tone * 64), 0, 64)), 'repeat');
    s.x.fillRect(r[0], r[1], w, h);
    s.x.globalCompositeOperation = 'source-over';
    ctx.drawImage(s.c, r[0], r[1], w, h, r[0], r[1], w, h);
  }
  /* Strokes point runs ([[x, y], ...]) with a width and a colour (miter joins, butt caps). */
  function strokeRuns(ctx, runs, color, width) {
    ctx.beginPath();
    for (const p of runs) {
      if (!p || p.length < 2) continue;
      ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    }
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 10;
    ctx.lineCap = 'butt';
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  /* The points of a polyline's run from length a to b (for canvas drawing). */
  function runPts(p, a, b) {
    if (b - a <= 0.01) return null;
    const p0 = p.at(a), p1 = p.at(b);
    const out = [[p0[0], p0[1]]];
    for (let i = p0[2]; i < p1[2]; i++) out.push([p.pts[i][0], p.pts[i][1]]);
    out.push([p1[0], p1[1]]);
    return out;
  }
  const iconPaths = {};
  /* Draws a 24 unit Heroicon at size px centred on (cx, cy) on a canvas. */
  function iconAt(ctx, d, cx, cy, size, color) {
    const k = size / 24;
    ctx.save();
    ctx.setTransform(k, 0, 0, k, cx - size / 2, cy - size / 2);
    ctx.fillStyle = color;
    for (const s of d) ctx.fill(iconPaths[s] || (iconPaths[s] = new Path2D(s)), 'evenodd');
    ctx.restore();
  }

  /* The General Translation logo's path, the globe (kit/brand/gt-mark.svg), viewBox 24.3 24.3 207.4 207.4 (the doubled-line monogram until 2026-11-09). */
  const GT_MARK_D =
    'M225.36 163.71C223.32 169.27 220.79 174.68 217.81 179.85C208.71 195.61 195.61 208.71 179.85 217.81C178.13 218.8 176.38 219.75 174.6 220.64C170.68 222.61 166.64 224.33 162.51 225.79C153.6 228.93 144.27 230.85 134.8 231.48C134.52 231.5 134.24 231.51 133.96 231.53C133.18 231.57 132.4 231.61 131.62 231.64C130.42 231.68 129.21 231.7 128 231.7C126.72 231.7 125.44 231.68 124.17 231.63C123.4 231.6 122.63 231.56 121.86 231.52C121.64 231.5 121.42 231.49 121.2 231.48C111.3 230.83 101.57 228.76 92.29 225.36C86.79 223.34 81.44 220.85 76.32 217.91C76.26 217.87 76.21 217.84 76.15 217.81C60.39 208.71 47.29 195.61 38.19 179.85C37.06 177.88 35.99 175.88 34.98 173.84C33.15 170.13 31.55 166.31 30.18 162.42C26.68 152.47 24.7 142.01 24.36 131.41C24.32 130.27 24.3 129.14 24.3 128C24.3 114.26 27.03 100.8 32.18 88.34C33.43 85.33 34.81 82.39 36.34 79.51C36.93 78.38 37.55 77.26 38.19 76.15C47.29 60.39 60.39 47.29 76.15 38.19C91.05 29.59 107.85 24.84 125.02 24.34C126.01 24.31 127 24.3 128 24.3C129.68 24.3 131.36 24.34 133.03 24.42C145.02 25 156.73 27.66 167.66 32.18C171.79 33.89 175.82 35.87 179.71 38.11C179.76 38.14 179.8 38.17 179.85 38.19C195.61 47.29 208.71 60.39 217.81 76.15C218.8 77.87 219.75 79.62 220.64 81.4C222.61 85.31 224.33 89.35 225.79 93.49C228.93 102.4 230.85 111.73 231.48 121.2C231.49 121.42 231.5 121.64 231.52 121.86C231.56 122.63 231.6 123.4 231.63 124.17C231.68 125.44 231.7 126.72 231.7 128C231.7 129.01 231.69 130.03 231.66 131.04C231.65 131.23 231.64 131.43 231.64 131.62C231.61 132.4 231.57 133.18 231.53 133.96C231.51 134.24 231.5 134.52 231.48 134.8C230.83 144.7 228.76 154.43 225.36 163.71ZM83.61 118.25C83.56 119.23 83.51 120.22 83.47 121.2L217.84 121.2C216.83 107.75 212.8 94.68 206.03 82.95C198.12 69.25 186.75 57.88 173.05 49.97C169.93 48.17 166.71 46.56 163.41 45.15C163.78 45.64 164.14 46.14 164.5 46.65C165.24 47.71 165.97 48.79 166.68 49.9C167.39 51.02 168.08 52.16 168.75 53.33C169.43 54.5 170.09 55.7 170.73 56.92C171.37 58.15 171.99 59.4 172.59 60.67C173.19 61.95 173.78 63.25 174.34 64.58C174.91 65.9 175.46 67.25 175.99 68.62C174.66 68.26 173.33 67.92 171.98 67.59C170.63 67.25 169.27 66.94 167.91 66.64C166.54 66.34 165.16 66.06 163.78 65.79C162.39 65.52 161 65.27 159.59 65.04C159.03 63.9 158.46 62.8 157.88 61.73C157.29 60.66 156.69 59.63 156.09 58.62C155.48 57.62 154.86 56.65 154.23 55.71C153.6 54.78 152.96 53.88 152.31 53.01C151.66 52.15 151 51.32 150.34 50.53C149.68 49.74 149.01 48.98 148.34 48.27C147.66 47.55 146.98 46.87 146.3 46.23C145.62 45.59 144.93 44.99 144.24 44.42C143.56 43.86 142.87 43.33 142.18 42.85C141.49 42.36 140.8 41.91 140.11 41.5C139.43 41.09 138.74 40.71 138.06 40.37C137.37 40.04 136.69 39.73 136.01 39.47C135.34 39.2 134.66 38.97 133.99 38.78C133.32 38.58 132.65 38.42 131.98 38.29C131.32 38.16 130.65 38.06 129.99 38C129.32 37.93 128.66 37.9 128 37.9C127.32 37.9 126.65 37.93 125.97 38C125.3 38.07 124.62 38.17 123.94 38.3C123.26 38.44 122.58 38.6 121.89 38.81C121.21 39.01 120.52 39.25 119.83 39.53C119.14 39.81 118.44 40.12 117.74 40.47C117.05 40.83 116.35 41.21 115.65 41.64C114.95 42.07 114.24 42.54 113.54 43.05C112.84 43.56 112.14 44.1 111.44 44.69C110.74 45.28 110.04 45.9 109.35 46.57C108.65 47.24 107.96 47.94 107.28 48.69C106.59 49.43 105.91 50.22 105.24 51.04C104.56 51.86 103.9 52.72 103.24 53.62C102.59 54.52 101.94 55.45 101.3 56.42C100.66 57.4 100.04 58.4 99.42 59.44C98.81 60.49 98.21 61.56 97.62 62.67C97.03 63.78 96.45 64.92 95.89 66.1C95.33 67.27 94.79 68.47 94.25 69.71C93.78 70.82 93.31 71.95 92.86 73.1C93.44 72.99 94.03 72.88 94.61 72.77C96.25 72.46 97.9 72.18 99.57 71.92C101.23 71.66 102.91 71.42 104.59 71.21C106.28 70.99 107.97 70.8 109.67 70.64C111.37 70.47 113.08 70.32 114.8 70.2C116.51 70.08 118.23 69.99 119.96 69.91C121.68 69.84 123.4 69.79 125.13 69.76C126.86 69.74 128.59 69.73 130.32 69.75C132.05 69.78 133.77 69.82 135.5 69.89C137.22 69.96 138.94 70.05 140.66 70.17C142.37 70.28 144.08 70.42 145.79 70.58C147.49 70.75 149.19 70.93 150.87 71.14C152.56 71.35 154.24 71.58 155.9 71.84C157.57 72.09 159.22 72.37 160.87 72.67C162.51 72.97 164.13 73.3 165.75 73.64C167.36 73.99 168.96 74.36 170.54 74.75C172.12 75.14 173.68 75.55 175.22 75.99C176.76 76.42 178.29 76.88 179.79 77.35C181.29 77.83 182.78 78.33 184.24 78.85C185.7 79.37 187.13 79.91 188.54 80.47C189.96 81.03 191.34 81.61 192.71 82.21C194.07 82.82 195.4 83.44 196.71 84.08C198.02 84.72 199.3 85.38 200.55 86.06L194.05 98.01C192.98 97.43 191.88 96.86 190.75 96.3C189.62 95.75 188.45 95.2 187.26 94.68C186.07 94.15 184.85 93.64 183.6 93.14C182.35 92.64 181.08 92.16 179.78 91.7C178.48 91.24 177.16 90.79 175.81 90.36C174.47 89.93 173.1 89.52 171.71 89.13C170.32 88.73 168.9 88.36 167.48 88C166.04 87.64 164.6 87.31 163.13 86.99C161.66 86.67 160.18 86.38 158.69 86.1C157.19 85.82 155.68 85.57 154.15 85.33C152.63 85.09 151.09 84.88 149.55 84.68C148 84.49 146.44 84.31 144.88 84.16C143.31 84 141.74 83.87 140.16 83.76C138.58 83.65 137 83.56 135.41 83.5C133.82 83.43 132.23 83.38 130.64 83.36C129.05 83.34 127.45 83.33 125.86 83.35C124.27 83.37 122.68 83.41 121.09 83.48C119.5 83.54 117.91 83.62 116.33 83.73C114.75 83.83 113.18 83.96 111.61 84.11C110.05 84.26 108.49 84.43 106.94 84.62C105.39 84.81 103.85 85.02 102.32 85.25C100.8 85.49 99.28 85.74 97.78 86.01C96.28 86.29 94.8 86.58 93.33 86.89C91.86 87.21 90.41 87.54 88.97 87.89C88.68 87.96 88.39 88.03 88.11 88.11C87.93 88.78 87.77 89.47 87.61 90.15C87.26 91.63 86.93 93.12 86.62 94.63C86.31 96.14 86.03 97.67 85.76 99.21C85.49 100.75 85.25 102.31 85.03 103.88C84.8 105.45 84.6 107.03 84.42 108.62C84.24 110.21 84.08 111.81 83.95 113.41C83.81 115.02 83.7 116.63 83.61 118.25ZM82.95 206.03C86.07 207.83 89.29 209.44 92.59 210.85C92.48 210.7 92.37 210.55 92.26 210.41C91.47 209.32 90.69 208.19 89.93 207.04C89.17 205.88 88.43 204.69 87.71 203.46C86.99 202.24 86.29 200.99 85.61 199.71C84.93 198.43 84.26 197.11 83.62 195.77C82.98 194.43 82.36 193.06 81.76 191.67C81.16 190.27 80.58 188.85 80.02 187.4C79.47 185.96 78.93 184.49 78.41 182.99C77.9 181.5 77.4 179.98 76.93 178.44C76.46 176.9 76.01 175.35 75.58 173.77C75.16 172.19 74.75 170.59 74.37 168.98C73.99 167.36 73.63 165.73 73.29 164.08C72.96 162.44 72.65 160.77 72.36 159.1C72.07 157.43 71.8 155.74 71.56 154.04C71.32 152.34 71.1 150.63 70.91 148.91C70.71 147.19 70.54 145.46 70.4 143.73C70.25 141.99 70.13 140.25 70.03 138.51C69.93 136.76 69.86 135.01 69.81 133.26C69.76 131.51 69.74 129.75 69.74 128C69.74 126.25 69.76 124.49 69.81 122.74Q69.89 120.11 70.03 117.49C70.13 115.75 70.25 114.01 70.4 112.27C70.54 110.54 70.71 108.81 70.91 107.09C71.1 105.37 71.32 103.66 71.56 101.96C71.8 100.26 72.07 98.57 72.36 96.9C72.65 95.22 72.96 93.56 73.29 91.92C73.63 90.27 73.99 88.64 74.37 87.02C74.75 85.41 75.16 83.81 75.58 82.23C76.01 80.65 76.46 79.1 76.93 77.56C77.4 76.02 77.9 74.5 78.41 73.01C78.93 71.51 79.47 70.04 80.02 68.6C80.58 67.15 81.16 65.73 81.76 64.33C82.36 62.94 82.98 61.57 83.62 60.23C84.26 58.89 84.93 57.58 85.61 56.29C86.29 55.01 86.99 53.76 87.71 52.53C88.43 51.31 89.17 50.12 89.93 48.97C90.69 47.81 91.47 46.68 92.26 45.59C92.37 45.45 92.48 45.3 92.59 45.15C89.29 46.56 86.07 48.17 82.95 49.97C69.25 57.88 57.88 69.25 49.97 82.95C48.17 86.07 46.56 89.29 45.15 92.59C46.17 91.83 47.23 91.09 48.31 90.36C49.44 89.61 50.6 88.87 51.79 88.15C52.98 87.43 54.21 86.74 55.46 86.06C56.71 85.38 57.99 84.71 59.3 84.07C60.6 83.43 61.94 82.81 63.3 82.21C64.66 81.61 66.05 81.03 67.46 80.47C67.11 81.8 66.77 83.15 66.44 84.5C66.11 85.86 65.8 87.22 65.51 88.6C65.21 89.98 64.93 91.36 64.67 92.76C64.41 94.15 64.16 95.55 63.93 96.96C62.81 97.54 61.71 98.12 60.65 98.72C59.6 99.32 58.57 99.94 57.58 100.56C56.59 101.18 55.63 101.82 54.71 102.46C53.79 103.11 52.91 103.76 52.06 104.42C51.21 105.08 50.4 105.75 49.63 106.42C48.86 107.1 48.13 107.78 47.44 108.47C46.74 109.15 46.09 109.84 45.47 110.53C44.85 111.23 44.28 111.92 43.74 112.62C43.2 113.31 42.7 114.01 42.24 114.71C41.78 115.4 41.36 116.1 40.98 116.79C40.59 117.48 40.25 118.18 39.94 118.86C39.63 119.55 39.36 120.24 39.12 120.92C38.89 121.6 38.69 122.28 38.52 122.96C38.35 123.64 38.22 124.31 38.12 124.98C38.02 125.66 37.96 126.33 37.92 127C37.89 127.67 37.89 128.33 37.92 129C37.96 129.67 38.02 130.34 38.12 131.02C38.22 131.69 38.35 132.36 38.52 133.04C38.69 133.72 38.89 134.4 39.12 135.08C39.36 135.76 39.63 136.45 39.94 137.14C40.25 137.82 40.59 138.52 40.98 139.21C41.36 139.9 41.78 140.6 42.24 141.29C42.7 141.99 43.2 142.69 43.74 143.38C44.28 144.08 44.85 144.77 45.47 145.47C46.09 146.16 46.74 146.85 47.44 147.53C48.13 148.22 48.86 148.9 49.63 149.58C50.4 150.25 51.21 150.92 52.06 151.58C52.91 152.24 53.79 152.9 54.71 153.54C55.63 154.18 56.59 154.82 57.58 155.44C58.57 156.06 59.6 156.68 60.65 157.28C61.71 157.88 62.81 158.46 63.93 159.04C64.16 160.45 64.41 161.85 64.67 163.24C64.93 164.64 65.21 166.02 65.51 167.4C65.8 168.78 66.11 170.14 66.44 171.5C66.77 172.85 67.11 174.2 67.46 175.53C66.05 174.97 64.66 174.39 63.3 173.79C61.94 173.19 60.6 172.57 59.3 171.93C57.99 171.29 56.71 170.62 55.46 169.95C54.21 169.26 52.98 168.57 51.79 167.85C50.6 167.13 49.44 166.39 48.31 165.64C47.23 164.91 46.17 164.17 45.15 163.41C46.56 166.71 48.17 169.93 49.97 173.05C57.88 186.75 69.25 198.12 82.95 206.03ZM87.61 165.85C87.77 166.53 87.93 167.22 88.11 167.89C88.4 167.97 88.7 168.04 89 168.12C90.43 168.47 91.89 168.8 93.36 169.12C94.84 169.43 96.32 169.72 97.83 169.99C99.33 170.27 100.85 170.52 102.38 170.75C103.91 170.99 105.46 171.2 107.01 171.39C108.56 171.58 110.13 171.75 111.7 171.9C113.27 172.04 114.85 172.17 116.43 172.28C118.01 172.38 119.6 172.47 121.2 172.53C122.79 172.59 124.39 172.63 125.98 172.65C127.58 172.67 129.18 172.66 130.77 172.64C132.12 172.62 133.46 172.58 134.8 172.53C135.05 172.52 135.3 172.51 135.56 172.5C137.15 172.43 138.74 172.34 140.32 172.23C141.9 172.11 143.48 171.98 145.04 171.83C146.61 171.67 148.17 171.49 149.72 171.3C151.27 171.1 152.81 170.88 154.34 170.64C155.87 170.4 157.38 170.15 158.88 169.87C160.38 169.59 161.86 169.29 163.33 168.96C164.8 168.65 166.25 168.31 167.68 167.95C169.11 167.59 170.52 167.21 171.92 166.82C173.31 166.42 174.68 166 176.03 165.57C177.37 165.14 178.7 164.69 180 164.22C181.3 163.76 182.57 163.27 183.82 162.77C185.06 162.27 186.28 161.76 187.48 161.23C188.67 160.7 189.83 160.15 190.96 159.59C192.09 159.04 193.2 158.46 194.27 157.88C195.34 157.29 196.37 156.69 197.38 156.09C198.38 155.48 199.35 154.86 200.29 154.23C201.22 153.6 202.12 152.96 202.99 152.31C203.85 151.66 204.68 151.01 205.47 150.34C206.26 149.68 207.02 149.01 207.73 148.34C208.45 147.66 209.13 146.98 209.77 146.3C210.41 145.62 211.01 144.93 211.57 144.24C212.14 143.56 212.66 142.87 213.15 142.18C213.64 141.49 214.09 140.8 214.5 140.11C214.91 139.43 215.29 138.74 215.63 138.06C215.96 137.37 216.26 136.69 216.53 136.01C216.69 135.61 216.84 135.2 216.97 134.8L148.57 134.8C146.15 134.8 143.78 135.44 141.69 136.65C139.59 137.85 137.85 139.59 136.65 141.69C135.44 143.78 134.8 146.15 134.8 148.57L134.8 165.72Q132.74 165.81 130.67 165.84Q128.36 165.88 126.06 165.85Q123.76 165.82 121.46 165.73Q121.33 165.73 121.2 165.72L121.2 148.57C121.2 146.15 120.56 143.78 119.36 141.69C118.15 139.59 116.41 137.85 114.31 136.65C112.22 135.44 109.85 134.8 107.43 134.8L83.47 134.8C83.51 135.78 83.56 136.77 83.61 137.75C83.7 139.37 83.81 140.98 83.95 142.59C84.08 144.2 84.24 145.79 84.42 147.38C84.6 148.97 84.8 150.55 85.03 152.12C85.25 153.69 85.49 155.25 85.76 156.79C86.03 158.33 86.31 159.86 86.62 161.37C86.93 162.88 87.26 164.37 87.61 165.85ZM165.49 207.9C164.81 208.91 164.12 209.89 163.41 210.85C166.71 209.44 169.93 207.83 173.05 206.03C186.75 198.12 198.12 186.75 206.03 173.05C207.83 169.93 209.44 166.71 210.85 163.41C209.83 164.17 208.78 164.91 207.69 165.63C206.57 166.39 205.41 167.13 204.21 167.84C203.02 168.56 201.8 169.26 200.55 169.94C199.3 170.62 198.02 171.28 196.71 171.92C195.4 172.56 194.07 173.18 192.71 173.79C191.35 174.39 189.96 174.97 188.55 175.53C187.13 176.09 185.7 176.63 184.24 177.15C182.78 177.67 181.3 178.17 179.79 178.65C179.5 178.74 179.21 178.83 178.92 178.92C177.7 179.3 176.47 179.66 175.22 180.01C173.68 180.45 172.12 180.86 170.54 181.25C168.96 181.64 167.36 182.01 165.75 182.36C164.88 182.54 164.01 182.72 163.14 182.9C162.38 183.04 161.63 183.19 160.87 183.33C159.23 183.63 157.57 183.91 155.9 184.16C154.24 184.42 152.56 184.65 150.88 184.86C149.19 185.07 147.49 185.26 145.79 185.42C144.09 185.58 142.38 185.72 140.66 185.84C138.94 185.95 137.22 186.04 135.5 186.11C135.27 186.12 135.03 186.13 134.8 186.14C133.31 186.19 131.81 186.23 130.32 186.25C128.59 186.27 126.86 186.26 125.13 186.24C123.82 186.22 122.51 186.19 121.2 186.14C120.79 186.12 120.37 186.11 119.96 186.09C118.23 186.01 116.51 185.92 114.8 185.8C113.08 185.68 111.38 185.53 109.67 185.37C107.97 185.2 106.28 185.01 104.59 184.79C102.91 184.58 101.23 184.34 99.57 184.08C97.9 183.82 96.25 183.54 94.61 183.23C94.03 183.12 93.44 183.01 92.86 182.9C93.31 184.05 93.78 185.18 94.25 186.29C94.79 187.53 95.33 188.73 95.89 189.9C96.45 191.08 97.03 192.22 97.62 193.33C98.21 194.44 98.81 195.51 99.42 196.56C100.04 197.6 100.66 198.6 101.3 199.58C101.94 200.55 102.59 201.48 103.24 202.38C103.9 203.28 104.56 204.14 105.24 204.96C105.91 205.79 106.59 206.57 107.28 207.31C107.96 208.06 108.65 208.76 109.35 209.43C110.04 210.1 110.74 210.73 111.44 211.31C112.14 211.9 112.84 212.45 113.54 212.95C114.24 213.46 114.95 213.93 115.65 214.36C116.35 214.79 117.05 215.18 117.74 215.53C118.44 215.88 119.14 216.19 119.83 216.47C120.29 216.65 120.74 216.82 121.2 216.97L121.2 192.94Q123.11 193.01 125.03 193.04Q127.72 193.08 130.4 193.05Q132.6 193.02 134.8 192.94L134.8 216.97C135.23 216.83 135.65 216.68 136.08 216.51C136.76 216.24 137.45 215.93 138.14 215.59C138.83 215.24 139.52 214.86 140.21 214.44C140.9 214.02 141.6 213.57 142.29 213.07C142.99 212.58 143.68 212.04 144.37 211.47C145.07 210.9 145.76 210.28 146.44 209.63C147.13 208.98 147.82 208.29 148.49 207.56C149.17 206.84 149.85 206.07 150.51 205.26C151.18 204.46 151.84 203.62 152.49 202.74C153.14 201.86 153.79 200.95 154.42 200C155.05 199.05 155.68 198.06 156.29 197.04C156.9 196.02 157.5 194.97 158.08 193.89C158.67 192.8 159.24 191.68 159.8 190.53C160.1779 189.754 160.5512 188.9689 160.9169 188.1686C160.5512 188.9689 160.1779 189.754 159.8 190.53C159.7025 190.7303 159.6046 190.9297 159.5064 191.1282Q160.87 190.9 162.21 190.66Q164.79 190.18 167.31 189.64Q169.85 189.1 172.33 188.48Q174.14 188.04 175.921 187.5504C176.2953 186.589 176.6573 185.6168 177.01 184.64C177.53 183.19 178.03 181.72 178.51 180.23C178.5867 179.9887 178.6578 179.7593 178.7291 179.5297C178.6569 179.7623 178.5849 179.9947 178.51 180.23C178.03 181.72 177.53 183.19 177.01 184.64C176.49 186.08 175.95 187.51 175.38 188.91C174.82 190.31 174.24 191.69 173.64 193.04C173.04 194.39 172.41 195.72 171.77 197.01C171.13 198.31 170.47 199.58 169.79 200.82C169.11 202.06 168.42 203.27 167.7 204.45C166.98 205.63 166.25 206.79 165.49 207.9Z';
  function markAt(s, x, y, w, color) {
    const k = w / 207.4;
    return el(s, 'path', { d: GT_MARK_D, fill: color || C.blue, transform: `translate(${x} ${y}) scale(${k}) translate(-24.3 -24.3)` });
  }

  window.F = { W, H, CELL, COLS, ROWS, C, K, RGB, TH, B8, clamp, clamp01, smooth, lin, ease, prog, Cells, el, hair, box, cross, cross2, mini, doubled, poly, page, extras, place, clutter, globe, SCRIPTS, INK, GLYPH_STACK, GT_MARK_D, markAt, NS, ICON_CPU, ICON_USER, toneUniform, strokeRuns, runPts, iconAt };
})();
