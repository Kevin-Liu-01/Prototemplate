/*
 * jihe-yuanben, the page: window.JY, the stage the key frames and the
 * motion test share.
 *
 * A scan is a plane in its own native pixel space. The camera puts a native
 * point (cx, cy) at the window centre at scale s, with an optional tilt
 * (rx, ry, rz in degrees), so a mark measured on the scan in native pixels
 * sits on the print at any framing. Marks are the reader's vermilion (朱)
 * brush strokes: tapered filled outlines, rebuilt from a progress value, so
 * a stroke is drawn by its own geometry (no dash offsets) and every frame is
 * a pure function of the progress the timeline hands it.
 *
 * Nothing here reads a clock or Math.random. JY.rng(seed) is the only
 * source of variation.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const WIN_W = 1920;
  const WIN_H = 816;

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

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------------------------------------------------------------- frame */

  function frame(root) {
    root.classList.add('jy-frame');
    root.innerHTML =
      '<div class="jy-window"><div class="jy-world"></div><div class="jy-lamp"></div>' +
      '<div class="jy-dof top"></div><div class="jy-dof bottom"></div><div class="jy-black"></div></div>' +
      '<div class="jy-cite"></div><div class="jy-sub"></div>';
    const f = {
      root,
      win: root.querySelector('.jy-window'),
      world: root.querySelector('.jy-world'),
      lampEl: root.querySelector('.jy-lamp'),
      black: root.querySelector('.jy-black'),
      dofTop: root.querySelector('.jy-dof.top'),
      dofBottom: root.querySelector('.jy-dof.bottom'),
      citeEl: root.querySelector('.jy-cite'),
      subEl: root.querySelector('.jy-sub'),
    };
    Object.assign(f.black.style, {
      position: 'absolute', inset: '0', background: 'var(--table)', opacity: '0', pointerEvents: 'none',
    });
    f.cite = (html) => (f.citeEl.innerHTML = html ? '<span>' + html + '</span>' : '');
    f.sub = (html) => (f.subEl.innerHTML = html ? '<span>' + html + '</span>' : '');
    f.dof = (px) => {
      const on = px > 0.05;
      f.dofTop.style.display = f.dofBottom.style.display = on ? 'block' : 'none';
      if (on) root.style.setProperty('--dof', px.toFixed(2) + 'px');
    };
    f.exposure = (e) => (f.black.style.opacity = String(1 - Math.max(0, Math.min(1, e))));
    f.camera = (c) => camera(f.world, c);
    f.lamp = (l) => lamp(f.lampEl, l);
    f.dof(0);
    return f;
  }

  /* camera: native point (cx, cy) of the world to the window centre. */
  function camera(world, c) {
    const s = c.s == null ? 1 : c.s;
    world.style.transform =
      `translate(${(WIN_W / 2 + (c.ox || 0)).toFixed(2)}px, ${(WIN_H / 2 + (c.oy || 0)).toFixed(2)}px) ` +
      `rotateX(${(c.rx || 0).toFixed(3)}deg) rotateY(${(c.ry || 0).toFixed(3)}deg) rotateZ(${(c.rz || 0).toFixed(3)}deg) ` +
      `scale(${s.toFixed(5)}) translate(${(-c.cx).toFixed(2)}px, ${(-c.cy).toFixed(2)}px)`;
  }

  /* lamp: a pool of light in window pixels. amount 0 is even light. */
  function lamp(lampEl, l) {
    if (!l || !l.amount) {
      lampEl.style.background = 'none';
      return;
    }
    const a = l.amount;
    const edge = (v) => Math.round(255 - (255 - v) * a);
    const c1 = `rgb(${edge(186)},${edge(170)},${edge(150)})`;
    const c2 = `rgb(${edge(92)},${edge(78)},${edge(62)})`;
    lampEl.style.background =
      `radial-gradient(ellipse ${l.rx || 900}px ${l.ry || 520}px at ${l.x == null ? 960 : l.x}px ${l.y == null ? 408 : l.y}px, ` +
      `#fff 0%, #fff ${l.core || 30}%, ${c1} 72%, ${c2} 100%)`;
  }

  /* ---------------------------------------------------------------- plane */

  // Every scan and every mark is painted into a 2D canvas at the scan's native
  // pixel size, and the compositor only samples those textures through the
  // camera transform. Every canvas is created with willReadFrequently, which
  // keeps it in software (Skia on the CPU): whether Chrome accelerates a large
  // canvas on the GPU depends on its memory budget at that moment, and a GPU
  // canvas paints a scan a few code values differently, so a renderer worker
  // under load could print a whole shot differently from the next run. An <img> or SVG inside a moving 3D layer is re-rastered
  // by Chrome at a scale chosen from the layer's history, so two renderer
  // workers that start at different times would print different pixels;
  // a canvas texture has no raster scale, so every frame is a pure function
  // of time. The source <img> stays in the DOM, hidden, so the renderer waits
  // for it.
  //
  // p.crop {x0, y0, x1, y1}: the plane is only that piece of the scan (a slip
  // of paper), placed where it sits on the page; p.cropSrc is that piece as
  // its own file. Marks always take page coordinates.
  // p.clip 'inset(t r b l)': trims a scan to its paper (baked into the canvas).
  // p.filter: a canvas filter for the scan (baked). p.tint: a paper colour
  // multiplied over a bitonal scan (baked).
  const PLANES = [];
  const CPU = { willReadFrequently: true };
  function plane(world, p) {
    const c = p.crop || { x0: 0, y0: 0, x1: p.w, y1: p.h };
    const w = c.x1 - c.x0;
    const h = c.y1 - c.y0;
    const d = document.createElement('div');
    d.className = 'jy-plane';
    d.style.left = c.x0 + 'px';
    d.style.top = c.y0 + 'px';
    d.style.width = w + 'px';
    d.style.height = h + 'px';
    if (p.id) d.id = p.id;
    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'sync';
    img.src = p.cropSrc || p.src;
    Object.assign(img.style, { position: 'absolute', left: '0', top: '0', width: '2px', height: '2px', opacity: '0', pointerEvents: 'none' });
    d.appendChild(img);
    const scan = document.createElement('canvas');
    scan.className = 'scan';
    scan.width = w;
    scan.height = h;
    Object.assign(scan.style, { position: 'absolute', left: '0', top: '0', width: w + 'px', height: h + 'px', display: 'block' });
    d.appendChild(scan);
    // The marks canvas covers p.mbox (page pixels) when given, so a plane whose
    // marks sit in one corner of a large scan does not carry a full-size canvas.
    const mb = p.mbox || { x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1 };
    const mw = mb.x1 - mb.x0;
    const mh = mb.y1 - mb.y0;
    const mk = document.createElement('canvas');
    mk.className = 'marks';
    mk.width = mw;
    mk.height = mh;
    Object.assign(mk.style, {
      position: 'absolute', left: mb.x0 - c.x0 + 'px', top: mb.y0 - c.y0 + 'px', width: mw + 'px', height: mh + 'px',
      display: 'block', mixBlendMode: 'multiply',
    });
    d.appendChild(mk);
    (p.parent || world).appendChild(d);
    const pl = {
      el: d, img, scanEl: scan, svg: mk, marksEl: mk, ctx: mk.getContext('2d', CPU), w, h, crop: c, p, mbox: mb,
      marks: {}, order: [], fills: [], painted: false, dirty: true, onPaint: null,
    };
    PLANES.push(pl);
    return pl;
  }

  function parseInset(v) {
    const m = /inset\(([^)]*)\)/.exec(v || '');
    if (!m) return null;
    const n = m[1].trim().split(/\s+/).map((x) => parseFloat(x) || 0);
    const [t, r = t, b = t, l = r] = n;
    return { t, r, b, l };
  }

  // Paint the scan once (when its image is decoded) and the marks when dirty.
  function paintPlane(pl) {
    if (!pl.painted && pl.img.complete && pl.img.naturalWidth > 0) {
      const g = pl.scanEl.getContext('2d', CPU);
      const c = pl.crop;
      const p = pl.p;
      g.clearRect(0, 0, pl.w, pl.h);
      g.save();
      const ins = p.clip ? parseInset(p.clip) : null;
      if (ins) {
        // inset() is in page pixels; the canvas starts at the crop origin.
        g.beginPath();
        g.rect(ins.l - c.x0, ins.t - c.y0, p.w - ins.l - ins.r, p.h - ins.t - ins.b);
        g.clip();
      }
      if (p.filter) g.filter = p.filter;
      if (p.cropSrc) g.drawImage(pl.img, 0, 0, pl.w, pl.h);
      else g.drawImage(pl.img, c.x0, c.y0, pl.w, pl.h, 0, 0, pl.w, pl.h);
      g.filter = 'none';
      if (p.tint) {
        g.globalCompositeOperation = 'multiply';
        g.fillStyle = p.tint;
        g.fillRect(0, 0, pl.w, pl.h);
        g.globalCompositeOperation = 'source-over';
      }
      g.restore();
      pl.painted = true;
    }
    if (pl.dirty) {
      const g = pl.ctx;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, pl.marksEl.width, pl.marksEl.height);
      g.setTransform(1, 0, 0, 1, -pl.mbox.x0, -pl.mbox.y0);
      for (const f of pl.fills) {
        if (f.opacity <= 0) continue;
        g.globalAlpha = f.opacity;
        g.fillStyle = f.color;
        g.fill(f.path);
      }
      for (const h of pl.order) {
        if (!h.d) continue;
        g.globalAlpha = h.m.opacity == null ? 1 : h.m.opacity;
        g.fillStyle = h.m.color || CINNABAR;
        g.fill(new Path2D(h.d));
      }
      g.globalAlpha = 1;
      pl.dirty = false;
    }
    if (pl.onPaint) pl.onPaint(pl);
  }
  function flush() {
    paintLayers();
    for (const pl of PLANES) paintPlane(pl);
  }
  const CINNABAR = '#c9351b';

  /* A canvas layer on a plane, in page pixels (box), drawn by the caller.
     opts.blend: a mix-blend-mode; opts.before: 'marks' (default, under the marks)
     or 'end' (over everything on the plane); opts.src: an image painted into it
     once it is decoded (its <img> stays in the DOM so the renderer waits). */
  function layer(pl, box, opts) {
    opts = opts || {};
    const cv = document.createElement('canvas');
    const w = Math.round(box.x1 - box.x0);
    const h = Math.round(box.y1 - box.y0);
    cv.width = w;
    cv.height = h;
    Object.assign(cv.style, {
      position: 'absolute', left: box.x0 - pl.crop.x0 + 'px', top: box.y0 - pl.crop.y0 + 'px', width: w + 'px', height: h + 'px',
      display: 'block', pointerEvents: 'none', transformOrigin: '0 0',
    });
    if (opts.blend) cv.style.mixBlendMode = opts.blend;
    if (opts.opacity != null) cv.style.opacity = String(opts.opacity);
    if (opts.before === 'end') pl.el.appendChild(cv);
    else pl.el.insertBefore(cv, pl.marksEl);
    const L = { cv, g: cv.getContext('2d', CPU), box, w, h, img: null, painted: false };
    if (opts.src) {
      const img = document.createElement('img');
      img.alt = '';
      img.decoding = 'sync';
      img.src = opts.src;
      Object.assign(img.style, { position: 'absolute', left: '0', top: '0', width: '2px', height: '2px', opacity: '0', pointerEvents: 'none' });
      pl.el.appendChild(img);
      L.img = img;
      LAYERS.push(L);
    }
    return L;
  }
  const LAYERS = [];
  function paintLayers() {
    for (const L of LAYERS) {
      if (!L.painted && L.img.complete && L.img.naturalWidth > 0) {
        L.g.clearRect(0, 0, L.w, L.h);
        L.g.drawImage(L.img, 0, 0, L.w, L.h);
        L.painted = true;
      }
    }
  }

  /* ---------------------------------------------------------------- strokes */

  // Arc-length table of a polyline.
  function lengths(pts) {
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return L;
  }

  // The outline of a tapered brush stroke along pts, drawn to progress p.
  // width(t) is the half width at fraction t of the full stroke.
  function outline(pts, width, p, rough) {
    if (p <= 0.0005) return '';
    const L = lengths(pts);
    const total = L[L.length - 1];
    const upto = total * Math.min(1, p);
    const left = [];
    const right = [];
    for (let i = 0; i < pts.length; i++) {
      let x = pts[i][0];
      let y = pts[i][1];
      let l = L[i];
      let last = false;
      if (l > upto) {
        const k = (upto - L[i - 1]) / (L[i] - L[i - 1] || 1);
        x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k;
        y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k;
        l = upto;
        last = true;
      }
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      let tx = b[0] - a[0];
      let ty = b[1] - a[1];
      const n = Math.hypot(tx, ty) || 1;
      tx /= n;
      ty /= n;
      const w = width(l / total);
      // A brush edge: each side's width wavers by a fixed, seeded amount.
      const jl = rough ? 1 + rough[(i * 2) % rough.length] : 1;
      const jr = rough ? 1 + rough[(i * 2 + 1) % rough.length] : 1;
      left.push([x - ty * w * jl, y + tx * w * jl]);
      right.push([x + ty * w * jr, y - tx * w * jr]);
      if (last) break;
    }
    const f = (q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    // Round the open end with a half disc so a stroke in progress has a brush tip.
    const tip = left[left.length - 1];
    const tipR = right[right.length - 1];
    const r = Math.hypot(tip[0] - tipR[0], tip[1] - tipR[1]) / 2;
    let d = 'M' + f(left[0]);
    for (let i = 1; i < left.length; i++) d += 'L' + f(left[i]);
    d += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${f(tipR)}`;
    for (let i = right.length - 2; i >= 0; i--) d += 'L' + f(right[i]);
    const r0 = Math.hypot(left[0][0] - right[0][0], left[0][1] - right[0][1]) / 2;
    d += `A${r0.toFixed(1)} ${r0.toFixed(1)} 0 0 1 ${f(left[0])}Z`;
    return d;
  }

  // Pressure profiles: a brush lands, carries, lifts.
  const press = {
    ring: (w) => (t) => w * (0.35 + 0.65 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.02)), 0.55)),
    line: (w) => (t) => w * (t < 0.08 ? 0.45 + 0.55 * (t / 0.08) : t > 0.82 ? 0.25 + 0.75 * ((1 - t) / 0.18) : 1),
    even: (w) => () => w,
  };

  // Centrelines.
  function ringPts(m) {
    const R = rng(m.seed || 1);
    const ph1 = R() * 6.28;
    const ph2 = R() * 6.28;
    const a0 = ((m.start == null ? -112 : m.start) * Math.PI) / 180;
    const sweep = ((m.sweep || 388) * Math.PI) / 180;
    const n = 96;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const th = a0 + sweep * t;
      const k = 1 + 0.035 * Math.sin(2 * th + ph1) + 0.02 * Math.sin(3 * th + ph2) + (m.spiral == null ? 0.07 : m.spiral) * t;
      pts.push([m.x + Math.cos(th) * m.rx * k, m.y + Math.sin(th) * m.ry * k]);
    }
    return pts;
  }
  function linePts(m) {
    const R = rng(m.seed || 3);
    const n = 40;
    const pts = [];
    const dx = m.x1 - m.x0;
    const dy = m.y1 - m.y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const ph = R() * 6.28;
    const wob = m.wobble == null ? 1.6 : m.wobble;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const o = wob * Math.sin(t * 3.1 + ph) + (m.bow || 0) * Math.sin(Math.PI * t);
      pts.push([m.x0 + dx * t + nx * o, m.y0 + dy * t + ny * o]);
    }
    return pts;
  }
  function wavePts(m) {
    const n = 160;
    const pts = [];
    const dx = m.x1 - m.x0;
    const dy = m.y1 - m.y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const waves = len / (m.period || 60);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const o = (m.amp || 9) * Math.sin(t * waves * Math.PI * 2);
      pts.push([m.x0 + dx * t + nx * o, m.y0 + dy * t + ny * o]);
    }
    return pts;
  }
  function curvePts(m) {
    // Cubic from a to b through control points c1 c2.
    const n = 80;
    const pts = [];
    const [a, c1, c2, b] = [m.a, m.c1, m.c2, m.b];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      pts.push([
        u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0],
        u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1],
      ]);
    }
    return pts;
  }
  function ellipsePts(m) {
    // A construction circle (ellipse): the trace of a compass, from angle a0.
    const n = 140;
    const pts = [];
    const a0 = ((m.start || 0) * Math.PI) / 180;
    const sweep = ((m.sweep || 360) * Math.PI) / 180;
    for (let i = 0; i <= n; i++) {
      const th = a0 + (sweep * i) / n;
      pts.push([m.x + Math.cos(th) * m.rx, m.y + Math.sin(th) * m.ry]);
    }
    return pts;
  }

  const KINDS = {
    ring: { pts: ringPts, w: (m) => press.ring(m.w || 6.5) },
    dot: { pts: (m) => ringPts({ ...m, sweep: 370, spiral: 0.04, start: -100 }), w: (m) => press.ring(m.w || 3.4) },
    line: { pts: linePts, w: (m) => press.line(m.w || 5) },
    wave: { pts: wavePts, w: (m) => press.line(m.w || 4.2) },
    curve: { pts: curvePts, w: (m) => press.line(m.w || 3.2) },
    trace: { pts: ellipsePts, w: (m) => press.even(m.w || 3) },
    seg: { pts: (m) => linePts({ ...m, wobble: 0 }), w: (m) => press.even(m.w || 3) },
  };

  /* Add a mark to a plane. Returns a handle whose .set(p) draws it to p.
     On a canvas plane the outline is kept and painted by flush(); on a plain
     SVG layer ({ svg, g }) it is written as a path. */
  function mark(pl, name, m) {
    const kind = KINDS[m.kind];
    const R = rng((m.seed || 1) * 7919 + 13);
    const rough = [];
    for (let i = 0; i < 64; i++) rough.push((R() - 0.5) * (m.rough == null ? 0.26 : m.rough));
    // Smooth the jitter so the edge wavers instead of fizzing.
    const sm = rough.map((v, i) => (rough[(i + 62) % 64] + 2 * v + rough[(i + 2) % 64]) / 4);
    const h = { m, pts: kind.pts(m), width: kind.w(m), p: 0, d: '' };
    if (pl.ctx) {
      pl.order.push(h);
      h.set = (p) => {
        h.p = p;
        h.d = outline(h.pts, h.width, p, sm);
        pl.dirty = true;
      };
    } else {
      const path = el('path', { class: 'mk mk-' + m.kind }, m.under ? pl.svg : pl.g);
      path.style.fill = m.color || 'var(--cinnabar)';
      path.style.stroke = 'none';
      if (m.opacity != null) path.style.opacity = m.opacity;
      h.path = path;
      h.set = (p) => {
        h.p = p;
        h.d = outline(h.pts, h.width, p, sm);
        path.setAttribute('d', h.d);
      };
    }
    h.reshape = (m2) => {
      Object.assign(h.m, m2);
      h.pts = kind.pts(h.m);
      h.set(h.p);
    };
    pl.marks[name] = h;
    h.set(m.p == null ? 0 : m.p);
    return h;
  }

  /* A flat area of colour on the print (multiplied, so the ink shows through). */
  function fill(pl, name, pts, color, opacity) {
    const path = new Path2D('M' + pts.map((q) => q[0] + ' ' + q[1]).join('L') + 'Z');
    const f = { path, color, opacity: opacity == null ? 1 : opacity };
    pl.fills.push(f);
    pl.dirty = true;
    pl.marks[name] = { set: (o) => { f.opacity = o; pl.dirty = true; } };
    return pl.marks[name];
  }

  /* Reading dots: one small ○ beside each character of a column. */
  function readingDots(pl, prefix, col, opts) {
    const out = [];
    col.chars.forEach((c, i) => {
      const y = (c[0] + c[1]) / 2;
      out.push(
        mark(pl, prefix + i, {
          kind: 'dot',
          x: col.x + (opts.side || 1) * (col.half + (opts.gap || 26)),
          y: y + (opts.dy || 0),
          rx: opts.r || 11,
          ry: opts.r || 11,
          w: opts.w || 3.2,
          seed: 100 + i * 7 + (opts.seed || 0),
        }),
      );
    });
    return out;
  }

  /* Wait until every image and face is decoded. */
  async function ready() {
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map((i) => (i.complete ? (i.decode ? i.decode().catch(() => {}) : 0) : new Promise((r) => { i.onload = i.onerror = r; }))));
    await document.fonts.ready;
    flush();
  }

  window.JY = { CPU: { willReadFrequently: true }, rng, frame, camera, lamp, plane, layer, mark, fill, flush, readingDots, outline, ready, KINDS, WIN_W, WIN_H, PLANES };
})();
