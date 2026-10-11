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
    add('mark', 'side', 24, 16, 44, 28, { logo: true });
    add('text', 'side', 80, 26, 110, 8, { strong: true, logo: true, name: true });
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
  const GLYPH_STACK = '"InterCanvas", "Hiragino Sans", "PingFang SC", "Apple SD Gothic Neo", "Geeza Pro", "Kohinoor Devanagari", "Tamil Sangam MN", "Kannada Sangam MN", "Bangla Sangam MN", "Thonburi", "Kefa", "Noto Sans Mongolian", "Kailasa", "Noto Sans Javanese", "Noto Sans Armenian", system-ui, sans-serif';

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

  /* The doubled-line GT monogram's path (kit/brand/gt-mark.svg), viewBox -8 214 1213 771. */
  const GT_MARK_D =
    'M363 222.5L1197 222.5L1196.5 283L834 283.5L832.5 976L773 975.5L772.5 398L359.5 398L341.5 401L301.5 414L271.5 430L249.5 446L231 463.5L214 484.5L190 529.5L180 567.5L178 613.5L185 653.5L196 682.5L217 717.5L242.5 746L270.5 768L314.5 790L342.5 798L372.5 802L399.5 802L430.5 798L475.5 783L502.5 768L524 751.5L523.5 747L415.5 748L414.5 684L583 684.5L583 923.5L580.5 926L516.5 955L476.5 967L439.5 974L403.5 977L355.5 976L326.5 973L287.5 965L252.5 954L221.5 941L187.5 923L155.5 902L121.5 874L97 849.5L77 825.5L55 793.5L33 752.5L15 705.5L4 656.5L0 613.5L2 556.5L10 511.5L23 469.5L44 423.5L66 387.5L99 346.5L129.5 317L170.5 286L225.5 256L275.5 237L325.5 226L363 222.5Z M386.5 282L322.5 288L275.5 301L220.5 327L167.5 365L123 413.5L103 443.5L87 474.5L71 518.5L61 578.5L63 641.5L68 669.5L78 703.5L107 762.5L143 810.5L171.5 838L194.5 856L248.5 887L305.5 907L366.5 916L403.5 916L442.5 912L490.5 900L523.5 887L524 826.5L479.5 847L440.5 858L399.5 863L344.5 860L291.5 846L254.5 829L214.5 802L186 775.5L165 749.5L141 708.5L125 664.5L118 624.5L118 573.5L126 530.5L139 494.5L165 449.5L201.5 408L238.5 379L292.5 352L341.5 339L373.5 336L773 336.5L772.5 283L386.5 282Z M888 337.5L1197 337.5L1196.5 398L949 398.5L948.5 976L888 975.5L888 337.5Z M415 571.5L692 572.5L692 830.5L668 858.5L633.5 890L631 890.5L631 635.5L414.5 635L415 571.5Z';
  function markAt(s, x, y, w, color) {
    const k = w / 1213;
    return el(s, 'path', { d: GT_MARK_D, fill: color || C.blue, 'fill-rule': 'evenodd', transform: `translate(${x} ${y}) scale(${k}) translate(8 -214)` });
  }

  window.F = { W, H, CELL, COLS, ROWS, C, K, RGB, TH, B8, clamp, clamp01, smooth, lin, ease, prog, Cells, el, hair, box, cross, cross2, mini, doubled, poly, page, extras, place, clutter, globe, SCRIPTS, INK, GLYPH_STACK, GT_MARK_D, markAt, NS, ICON_CPU, ICON_USER, toneUniform, strokeRuns, runPts, iconAt };
})();
