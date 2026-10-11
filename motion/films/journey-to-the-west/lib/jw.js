/*
 * journey-to-the-west: the shared machinery of the film.
 *
 * After the names lane's lib/names.js (motion/concepts/journey-to-the-west/
 * names/lib/names.js). The film is set in one ink on one paper, the paper and
 * ink of the National Central Library scan of the 1592 edition. A Chinese
 * character that moves is drawn from its own outline contours
 * (data/glyphs.js), where one contour is very nearly one stroke, so a
 * component is a set of contours that can be lifted, re-proportioned or
 * swapped. Running Chinese is live text, one text node per line. English is
 * set in Old Standard TT and typed letter by letter.
 *
 * Every function here is pure: no clocks, no randomness, no network. Text
 * widths are measured once, after the faces have loaded, before the timeline
 * is built (lib/film.js).
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const G = window.JW_GLYPHS;
  const PL = window.JW_PLATES;

  // paper and ink are sampled from the NCL scan of the 1592 edition; tint is
  // the grey of the library seal printed across every spread; label is the ink
  // at 66 percent; hair the ink at 16 percent.
  const C = { paper: '#ffffff', ink: '#202020', tint: '#bbbbbb', label: '#6b6b6b', hair: '#dbdbdb' };
  // A plate lowered to a third of its tone: its ink then reads as tint.
  const THIRD = 0.31;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function html(tag, attrs, parent, text) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'style') Object.assign(e.style, attrs.style);
      else e.setAttribute(k, attrs[k]);
    }
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  const svg = (parent) => el('svg', { class: 'art', width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, parent);

  function glyph(ch, w) {
    const set = G['w' + (w || 600)];
    const g = set && set[ch];
    if (!g) throw new Error('no glyph data for ' + ch + ' at ' + (w || 600));
    return g;
  }

  // Font units (y down, em box from -880 to 120) to stage pixels for an em
  // box whose top left is (x, y) and whose side is size.
  function xfD(d, s, x, y) {
    return d.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (m, a, b) => (x + +a * s).toFixed(2) + ',' + (y + (+b + 880) * s).toFixed(2));
  }
  function xfB(b, s, x, y) {
    return [x + b[0] * s, y + (b[1] + 880) * s, x + b[2] * s, y + (b[3] + 880) * s];
  }
  // The contours of ch in the em box r = { x, y, size }, in stage pixels.
  function contours(ch, r, w) {
    const s = r.size / 1000;
    return glyph(ch, w).c.map((c, i) => ({ i, d: xfD(c.d, s, r.x, r.y), b: xfB(c.b, s, r.x, r.y) }));
  }

  // Components. Each rule names the contours of the first component by the
  // centre of their box in font units; the rest are the second component.
  const cxF = (c) => (c.b[0] + c.b[2]) / 2;
  const SPLITS = {
    '猻': (c) => cxF(c) < 300, // 犭 | 孫
    '猢': (c) => cxF(c) < 300, // 犭 | 胡
    '孫': (c) => cxF(c) < 400, // 子 | 系
    '溫': (c) => cxF(c) < 250, // 氵 | 昷
    '瘟': (c, i) => i >= 8, // 疒 | 昷 (the enclosing radical is drawn last)
  };
  function split(ch, r, w) {
    const all = contours(ch, r, w);
    const a = [], b = [];
    glyph(ch, w).c.forEach((c, i) => (SPLITS[ch](c, i) ? a : b).push(all[i]));
    return [a, b];
  }

  function bbox(list) {
    return list.reduce((m, c) => [Math.min(m[0], c.b[0]), Math.min(m[1], c.b[1]), Math.max(m[2], c.b[2]), Math.max(m[3], c.b[3])], [1e9, 1e9, -1e9, -1e9]);
  }

  // Pairs the contours of src with those of dst by their place and size
  // inside each set's own box, greedily from the closest pair. Every dst
  // contour gets a source and every src contour a target, so each pair can
  // be one morphing path. (The names lane's pair.)
  function pair(src, dst) {
    const nb = (list) => {
      const B = bbox(list), w = B[2] - B[0] || 1, h = B[3] - B[1] || 1;
      return list.map((c) => ({ c, x: ((c.b[0] + c.b[2]) / 2 - B[0]) / w, y: ((c.b[1] + c.b[3]) / 2 - B[1]) / h, w: (c.b[2] - c.b[0]) / w, h: (c.b[3] - c.b[1]) / h }));
    };
    const S = nb(src), D = nb(dst);
    const cost = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) + 0.6 * (Math.abs(a.w - b.w) + Math.abs(a.h - b.h));
    const cand = [];
    S.forEach((a, i) => D.forEach((b, j) => cand.push([cost(a, b), i, j])));
    cand.sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2]);
    const usedS = new Set(), usedD = new Set(), out = [];
    for (const [, i, j] of cand) {
      if (usedS.has(i) || usedD.has(j)) continue;
      usedS.add(i);
      usedD.add(j);
      out.push([src[i], dst[j]]);
    }
    D.forEach((b, j) => {
      if (usedD.has(j)) return;
      let best = 0;
      S.forEach((a, i) => (cost(a, b) < cost(S[best], b) ? (best = i) : 0));
      out.push([src[best], dst[j]]);
    });
    S.forEach((a, i) => {
      if (usedS.has(i)) return;
      let best = 0;
      D.forEach((b, j) => (cost(a, b) < cost(a, D[best]) ? (best = j) : 0));
      out.push([src[i], dst[best]]);
    });
    return out;
  }

  function affineD(d, kx, ky, ox, oy, nx, ny) {
    return d.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (m, a, b) => (nx + (+a - ox) * kx).toFixed(2) + ',' + (ny + (+b - oy) * ky).toFixed(2));
  }

  // A component travels in two moves (the names lane's tracks and morph).
  // First it moves and scales as a whole, its strokes unchanged, onto the
  // centre of its target; the scale fits it inside the target's box in both
  // directions, so no stroke ever leaves the box it is going to (the names
  // treatment scaled by height alone, and 子's cross stroke ran out past 孫).
  // Then each stroke changes in place into its matching target stroke. With
  // mode 'fill' the first move scales the component to the target's box in
  // each direction separately (used where a standalone glyph closes into a
  // much narrower component, so it never shrinks below its target first).
  function tracks(layer, src, dst, fill, opacity, mode) {
    const sb = bbox(src), db = bbox(dst);
    const ky0 = (db[3] - db[1]) / (sb[3] - sb[1]), kx0 = (db[2] - db[0]) / (sb[2] - sb[0]);
    const k = Math.min(kx0, ky0);
    const kx = mode === 'fill' ? kx0 : k, ky = mode === 'fill' ? ky0 : k;
    const ox = (sb[0] + sb[2]) / 2, oy = (sb[1] + sb[3]) / 2, nx = (db[0] + db[2]) / 2, ny = (db[1] + db[3]) / 2;
    const moved = src.map((c) => ({ i: c.i, d: affineD(c.d, kx, ky, ox, oy, nx, ny), b: [nx + (c.b[0] - ox) * kx, ny + (c.b[1] - oy) * ky, nx + (c.b[2] - ox) * kx, ny + (c.b[3] - oy) * ky], src: c }));
    return pair(moved, dst).map(([m, d]) => ({ el: el('path', { d: m.src.d, fill: fill || C.ink, opacity: opacity == null ? 0 : opacity }, layer), from: m.src.d, mid: m.d, to: d.d }));
  }
  // The whole move takes dur: 55 percent travelling, 45 percent settling.
  function morph(tl, list, at, dur, ease) {
    const d1 = dur * 0.55, d2 = dur * 0.45;
    list.forEach((t) => {
      tl.fromTo(t.el, { morphSVG: { shape: t.from } }, { morphSVG: { shape: t.mid, shapeIndex: 0 }, duration: d1, ease: ease || 'power3.inOut', immediateRender: false }, at);
      tl.fromTo(t.el, { morphSVG: { shape: t.mid } }, { morphSVG: { shape: t.to, shapeIndex: 'auto' }, duration: d2, ease: 'power2.inOut', immediateRender: false }, at + d1);
    });
  }
  // The same two moves played backwards, for parts closing into a character:
  // list is built as tracks(layer, target strokes, parts), so each element
  // starts as a part (t.to), first changes in place into the target stroke
  // re-proportioned at the part's place (t.mid), then travels and scales as
  // a whole onto the target (t.from). It is the time reverse of the opening
  // move, whose in-between frames are clean, and no stroke ever thins to a
  // sliver (the draft's close drew 子's cross stroke out as a hairline).
  function morphBack(tl, list, at, dur, ease) {
    const d1 = dur * 0.55, d2 = dur * 0.45;
    list.forEach((t) => {
      t.el.setAttribute('d', t.to);
      tl.fromTo(t.el, { morphSVG: { shape: t.to } }, { morphSVG: { shape: t.mid, shapeIndex: 'auto' }, duration: d2, ease: 'power2.inOut', immediateRender: false }, at);
      tl.fromTo(t.el, { morphSVG: { shape: t.mid } }, { morphSVG: { shape: t.from, shapeIndex: 0 }, duration: d1, ease: ease || 'power3.inOut', immediateRender: false }, at + d2);
    });
  }
  // Each stroke changes in place into its partner (no travel): the swaps.
  // The path takes the tween's start shape at build time (immediateRender),
  // so a path on screen before the change is drawn from the same converted
  // outline whichever way the playhead reaches it.
  function settle(tl, list, at, dur, ease) {
    list.forEach((t) => {
      tl.fromTo(t.el, { morphSVG: { shape: t.from } }, { morphSVG: { shape: t.to, shapeIndex: 'auto' }, duration: dur, ease: ease || 'power2.inOut', immediateRender: true }, at);
    });
  }
  function pairs(layer, src, dst, fill, opacity) {
    return pair(src, dst).map(([s, d]) => ({ el: el('path', { d: s.d, fill: fill || C.ink, opacity: opacity == null ? 0 : opacity }, layer), from: s.d, to: d.d }));
  }
  // Instant switches, written as explicit from and to so a seek in any order
  // lands on the same value. The switch completes just before at, so the frame
  // at exactly at (a cut on the grid) already shows the new state. Never used
  // at a beat's first frame: what a beat opens on is its static state.
  function show(tl, list, at, on) {
    list.forEach((t) => tl.fromTo(t.el || t, { opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0, duration: 0.001, ease: 'none', immediateRender: false }, at - 0.002));
  }

  // A character as one group of paths drawn in a 1000 unit em box at the
  // origin, placed by its transform attribute, so a move is one attribute
  // tween and the strokes never change.
  // The fill is set on the group, so a fill tween on the group reaches every stroke.
  function char(parent, ch, w, fill) {
    const g = el('g', { fill: fill || C.ink }, parent);
    glyph(ch, w).c.forEach((c) => el('path', { d: xfD(c.d, 1, 0, 0) }, g));
    return g;
  }
  const tf = (r) => `translate(${r.x.toFixed(3)},${r.y.toFixed(3)}) scale(${(r.size / 1000).toFixed(5)})`;
  function place(g, r) {
    g.setAttribute('transform', tf(r));
  }
  // A placement tween. GSAP's string interpolation of a transform attribute
  // came back as scale(0) when a seek ran backwards through the start of such
  // a tween, so the attribute is written from a numeric proxy instead: every
  // render, forward or backward, writes the value for the proxy's progress.
  function placeTween(tl, g, r0, r1, at, dur, ease) {
    const p = { t: 0 };
    tl.fromTo(p, { t: 0 }, {
      t: 1,
      duration: dur,
      ease: ease || 'power3.inOut',
      immediateRender: false,
      onUpdate: () => {
        const k = p.t;
        g.setAttribute('transform', tf({ x: r0.x + (r1.x - r0.x) * k, y: r0.y + (r1.y - r0.y) * k, size: r0.size + (r1.size - r0.size) * k }));
      },
    }, at);
  }
  // A placement whose two axes take their own eases, so a character can go
  // down before it goes across and pass under a row instead of through it.
  function moveXY(tl, g, r0, r1, at, dur, easeX, easeY) {
    const p = { t: 0 };
    const ex = gsap.parseEase(easeX), ey = gsap.parseEase(easeY);
    tl.fromTo(p, { t: 0 }, {
      t: 1,
      duration: dur,
      ease: 'none',
      immediateRender: false,
      onUpdate: () => {
        const kx = ex(p.t), ky = ey(p.t);
        g.setAttribute('transform', tf({ x: r0.x + (r1.x - r0.x) * kx, y: r0.y + (r1.y - r0.y) * ky, size: r0.size + (r1.size - r0.size) * kx }));
      },
    }, at);
  }
  // A two-character word re-set from a vertical line (a above b) to a
  // horizontal one (a left of b) while it travels, as one word. One numeric
  // proxy drives both characters: the word's centre runs on one path (its two
  // axes may take their own eases, so it can go down before it goes across),
  // and b swings round a from below to beside it, keeping to the square round
  // a, so the two em boxes stay side by side or corner to corner and never
  // cover each other or come apart (critic pass 3: the characters of 木母 and
  // 金公 travelled on paths of their own and drifted 120 px apart in flight).
  // ra, rb: em boxes at the start; ta, tb: em boxes at the end.
  function swing(tl, ga, gb, ra, rb, ta, tb, at, dur, o) {
    o = o || {};
    const ex = gsap.parseEase(o.easeX || 'power3.inOut'), ey = gsap.parseEase(o.easeY || 'power3.inOut');
    const es = gsap.parseEase(o.easeS || o.easeX || 'power3.inOut'), et = gsap.parseEase(o.easeT || 'power2.inOut');
    const c = (r) => [r.x + r.size / 2, r.y + r.size / 2];
    const [a0, b0, a1, b1] = [c(ra), c(rb), c(ta), c(tb)];
    const C0 = [(a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2], C1 = [(a1[0] + b1[0]) / 2, (a1[1] + b1[1]) / 2];
    const s0 = (ra.size + rb.size) / 2, s1 = (ta.size + tb.size) / 2;
    const k0 = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]) / s0, k1 = Math.hypot(b1[0] - a1[0], b1[1] - a1[1]) / s1;
    const th0 = Math.atan2(b0[1] - a0[1], b0[0] - a0[0]), th1 = Math.atan2(b1[1] - a1[1], b1[0] - a1[0]);
    const w0 = o.from == null ? 0 : o.from, w1 = o.to == null ? 1 : o.to;
    // The square orbit puts b a hair off its printed place at the start (the
    // print line is not exactly vertical); this correction, which fades out
    // as the word turns, makes the first frame of the move the registered
    // placement exactly, so a seek in any order lands on the same values.
    const m0 = Math.max(Math.abs(Math.cos(th0)), Math.abs(Math.sin(th0))), h0 = (s0 * k0) / 2;
    const cx0 = (b0[0] - a0[0]) / 2 - (h0 * Math.cos(th0)) / m0, cy0 = (b0[1] - a0[1]) / 2 - (h0 * Math.sin(th0)) / m0;
    const p = { t: 0 };
    tl.fromTo(p, { t: 0 }, {
      t: 1,
      duration: dur,
      ease: 'none',
      immediateRender: false,
      onUpdate: () => {
        const t = p.t, kx = ex(t), ky = ey(t), ks = es(t);
        const q = et(Math.min(1, Math.max(0, (t - w0) / (w1 - w0))));
        const th = th0 + (th1 - th0) * q;
        const m = Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
        const ux = Math.cos(th) / m, uy = Math.sin(th) / m;
        const sz = s0 + (s1 - s0) * ks, half = (sz * (k0 + (k1 - k0) * ks)) / 2;
        const C = [C0[0] + (C1[0] - C0[0]) * kx, C0[1] + (C1[1] - C0[1]) * ky];
        const sa = ra.size + (ta.size - ra.size) * ks, sb = rb.size + (tb.size - rb.size) * ks;
        const ox = half * ux + (1 - q) * cx0, oy = half * uy + (1 - q) * cy0;
        ga.setAttribute('transform', tf({ x: C[0] - ox - sa / 2, y: C[1] - oy - sa / 2, size: sa }));
        gb.setAttribute('transform', tf({ x: C[0] + ox - sb / 2, y: C[1] + oy - sb / 2, size: sb }));
      },
    }, at);
  }
  function move(tl, g, r0, r1, at, dur, ease) {
    placeTween(tl, g, r0, r1, at, dur || 0.8, ease || 'power3.inOut');
  }

  // A plate: the static <img> of data/plates.js `id` inside div#pl-<id>. The
  // image file is already the size it is shown (tools/plates.py), so it is
  // drawn one image pixel to one stage pixel at a whole-pixel position, and
  // scan pixel (crop x0, crop y0) lands at stage (x, y). s must be the scale
  // the plate was cut at. Returns the map from scan to stage pixels.
  // key names the plate element (div#pl-<key>) when one plate is shown in two
  // scenes, so every id in the assembled page stays unique (v2: the title
  // column in scenes 1 and 3).
  function plate(id, x, y, s, key) {
    const p = PL[id];
    if (!p) throw new Error('no plate ' + id);
    if (Math.abs(p.s - s) > 1e-6) throw new Error('plate ' + id + ' was cut at ' + p.s + ', not ' + s);
    const box = document.getElementById('pl-' + (key || id));
    if (!box) throw new Error('no plate element pl-' + id);
    const img = box.querySelector('img');
    const [x0, y0, x1, y1] = p.crop;
    const sx = p.w / (x1 - x0), sy = p.h / (y1 - y0);
    x = Math.round(x);
    y = Math.round(y);
    Object.assign(box.style, { left: x + 'px', top: y + 'px', width: p.w + 'px', height: p.h + 'px' });
    Object.assign(img.style, { width: p.w + 'px', height: p.h + 'px' });
    return { box, img, s, x, y, w: p.w, h: p.h, map: (px, py) => [x + (px - x0) * sx, y + (py - y0) * sy] };
  }

  // The camera's one move: a slow push on a plate (never on type), 1.00 to k
  // about the point (ox, oy) of the plate. It is written as the image's size
  // and offset inside the plate's clip, not as a CSS scale, so the picture is
  // painted at each frame's size and two renders paint the same pixels.
  function push(tl, P, at, dur, k, ox, oy) {
    const w = P.w, h = P.h;
    tl.fromTo(P.img, { width: w, height: h, left: 0, top: 0 }, { width: w * k, height: h * k, left: -(w * k - w) * ox, top: -(h * k - h) * oy, duration: dur, ease: 'none', immediateRender: true }, at);
  }

  // A hairline rectangle as one closed path from its top left corner, so
  // DrawSVG draws it from that corner.
  function hairBox(parent, b, o) {
    const [x0, y0, x1, y1] = b;
    return el('path', { d: `M${x0.toFixed(2)},${y0.toFixed(2)}H${x1.toFixed(2)}V${y1.toFixed(2)}H${x0.toFixed(2)}Z`, fill: 'none', stroke: (o && o.color) || C.ink, 'stroke-width': (o && o.w) || 1.5 }, parent);
  }
  function line(parent, x1, y1, x2, y2, o) {
    return el('path', { d: `M${x1.toFixed(2)},${y1.toFixed(2)}L${x2.toFixed(2)},${y2.toFixed(2)}`, fill: 'none', stroke: (o && o.color) || C.ink, 'stroke-width': (o && o.w) || 1.5 }, parent);
  }
  function drawOn(tl, paths, at, dur, stagger) {
    tl.fromTo(paths, { drawSVG: '0%' }, { drawSVG: '100%', duration: dur || 0.45, ease: 'expo.out', stagger: stagger || 0, immediateRender: true }, at);
  }

  // The em box that puts glyph ch's ink centre on a printed character's ink
  // centre at the print's ink size. box is scan pixels; map takes scan
  // pixels to stage pixels (from plate()).
  function register(ch, box, map, w) {
    const gb = bbox(glyph(ch, w).c);
    const [x0, y0] = map(box[0], box[1]);
    const [x1, y1] = map(box[2], box[3]);
    const size = (((y1 - y0) / (gb[3] - gb[1]) + (x1 - x0) / (gb[2] - gb[0])) / 2) * 1000;
    const gcx = (gb[0] + gb[2]) / 2, gcy = (gb[1] + gb[3]) / 2 + 880;
    return { x: (x0 + x1) / 2 - (gcx / 1000) * size, y: (y0 + y1) / 2 - (gcy / 1000) * size, size };
  }
  // A paper knockout inside a registration box: a rectangle of paper over the
  // print and under the type, so the type stands alone in its box while the
  // rest of the print keeps its tone (type over the full-tone print read as
  // doubled print). It is inserted as the first child of the art layer, under
  // the boxes and the type, and starts hidden.
  function knock(art, b) {
    const r = el('rect', { x: b[0].toFixed(2), y: b[1].toFixed(2), width: (b[2] - b[0]).toFixed(2), height: (b[3] - b[1]).toFixed(2), fill: C.paper, opacity: 0 });
    art.insertBefore(r, art.firstChild);
    return r;
  }

  // The stage box round registered characters, padded.
  function inkBox(rs, chs, w, pad) {
    const b = bbox(rs.map((r, i) => ({ b: xfB(bbox(glyph(chs[i], w).c), r.size / 1000, r.x, r.y) })));
    return [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad];
  }

  // Live Chinese, one text node per line, lang zh-Hant.
  function han(parent, text, o) {
    return html('div', { class: 'han' + (o.v ? ' v' : ''), lang: 'zh-Hant', style: Object.assign({ left: o.x + 'px', top: o.y + 'px', fontSize: o.size + 'px', color: o.color || C.ink }, o.style || {}) }, parent, text);
  }

  // Old Standard metrics, measured once the faces are loaded.
  const M = { ctx: null, base: {} };
  function font(size, italic) {
    return (italic ? 'italic ' : '') + '400 ' + size + 'px "JW Latin"';
  }
  function width(text, size, italic, spacing) {
    if (!M.ctx) M.ctx = document.createElement('canvas').getContext('2d');
    M.ctx.font = font(size, italic);
    return M.ctx.measureText(text).width + (spacing || 0) * size * Array.from(text).length;
  }
  // Distance from the top of a line-height 1 text block to its baseline, as a fraction of the size.
  function baseRatio(italic) {
    const k = italic ? 'i' : 'r';
    if (M.base[k] == null) {
      const probe = html('div', { class: 'lat', style: { left: '0px', top: '0px', fontSize: '100px', fontStyle: italic ? 'italic' : 'normal', visibility: 'hidden' } }, document.body, 'Hx');
      const mark = html('span', { style: { display: 'inline-block', width: '0px', height: '0px', verticalAlign: 'baseline' } }, probe);
      M.base[k] = (mark.getBoundingClientRect().top - probe.getBoundingClientRect().top) / 100;
      probe.remove();
    }
    return M.base[k];
  }

  // English in Old Standard, placed by its baseline: o.x, o.base (baseline
  // y), o.size; o.align 'left' | 'right' | 'center' about o.x. With typed,
  // each letter is a span the timeline reveals; words stay unbroken.
  function latin(parent, text, o) {
    const italic = !!o.italic;
    const top = o.base - baseRatio(italic) * o.size;
    const cls = 'lat' + (o.cls ? ' ' + o.cls : '');
    const e = html('div', { class: cls, style: Object.assign({ top: top.toFixed(2) + 'px', fontSize: o.size + 'px', color: o.color || C.ink }, o.style || {}) }, parent);
    if (italic) e.style.fontStyle = 'italic';
    const w = width(text, o.size, italic, o.spacing);
    let left = o.x;
    if (o.align === 'right') left = o.x - w;
    if (o.align === 'center') left = o.x - w / 2;
    e.style.left = left.toFixed(2) + 'px';
    e.style.width = Math.ceil(w + 4) + 'px';
    const letters = [];
    // One span per grapheme: a base letter and its combining mark (the caron of ǎ) stay in one run.
    if (o.typed) for (const ch of text.match(/\P{M}\p{M}*/gu) || []) letters.push(html('span', { class: 'l' }, e, ch));
    else e.textContent = text;
    return { e, letters, left, w, top };
  }
  // A translator's tag in letter-spaced capitals.
  function tag(parent, text, o) {
    return latin(parent, text.toUpperCase(), Object.assign({ size: 22, cls: 'tag', spacing: 0.18 }, o));
  }

  // Letter by letter at rate letters a second (26 for running text, 14 for a hero word).
  function typeOn(tl, letters, at, rate) {
    letters.forEach((l, i) => tl.fromTo(l, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: 'none', immediateRender: false }, at + i / (rate || 26)));
    return at + letters.length / (rate || 26);
  }
  // An arrival: rises 12 px into place (power3.out).
  function rise(tl, els, at, dur, stagger) {
    tl.fromTo(els, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: dur || 0.5, ease: 'power3.out', stagger: stagger || 0, immediateRender: true }, at);
  }
  function fade(tl, els, at, from, to, dur, ease) {
    tl.fromTo(els, { opacity: from }, { opacity: to, duration: dur, ease: ease || 'none', immediateRender: false }, at);
  }

  // The credit line: lines of HTML (Chinese wrapped in <span class="zh">), lower left.
  function credit(parent, lines, o) {
    const e = html('div', { class: 'credit', style: Object.assign({ width: ((o && o.w) || 1180) + 'px' }, (o && o.style) || {}) }, parent);
    e.innerHTML = lines.map((l) => '<span class="ln">' + l + '</span>').join('');
    return e;
  }
  const zh = (t) => '<span class="zh" lang="zh-Hant">' + t + '</span>';
  const ED = zh('新刻出像官板大字西遊記') + ', Shidetang ' + zh('世德堂') + ', Jinling (Nanjing), preface dated ' + zh('壬辰') + ', read as 1592';
  const NCL = 'National Central Library (Taiwan) scan';
  // v2: every 1592 credit is one line with no date (SCRIPT-v2, visual change 15).
  const OLD = 'the oldest surviving edition';
  const scan = (part) => part + ' · ' + OLD + ' · ' + NCL;
  // The v2 film's event times (sound/tools/timeline.py, from the takes' own word timings).
  const E = new Proxy(window.JW_EVENTS || {}, {
    get: (o, k) => {
      if (!(k in o)) throw new Error('no event ' + String(k));
      return o[k];
    },
  });

  window.JW = { C, THIRD, NS, el, html, svg, glyph, contours, split, bbox, pair, tracks, morph, morphBack, settle, pairs, show, char, place, move, moveXY, swing, placeTween, tf, plate, push, hairBox, line, drawOn, register, inkBox, knock, han, latin, tag, width, baseRatio, typeOn, rise, fade, credit, zh, ED, NCL, OLD, scan, E, scenes: {} };
})();
