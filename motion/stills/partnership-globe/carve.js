/*
 * The carved glyph globe (index.html?v=glyphs&carve=gt, in either mode): the
 * doubled-line GT mark's two lines cut out of the middle of the glyph globe
 * as negative space, at 0.50 of the globe's diameter, upright and centred,
 * the glyphs around them set so every one keeps the same clearance (8 px)
 * from the mark's outline. Size and ink everywhere come from the page's own
 * law for the mode (env.styleAt), so the light carve follows the light
 * globe's inverted sizes and inks as the dark carve follows the dark's.
 *
 * Geometry. The mark's path is all straight segments, so the carve is a set
 * of polygons and distances are exact: every pixel centre near the mark gets
 * its Euclidean distance to the outline (negative inside). cut=lines (the
 * default) carves the mark's two lines alone; cut=silhouette carves the whole
 * letterform. The ring sees the silhouette (plus the gap between the
 * crossbar's second line and the T's stem), so the ring, the grid and the
 * seam treat the mark as one shape; the true carve decides the channels'
 * rows and every measurement.
 *
 * Ink. Every glyph that is placed is rasterized offscreen at its exact
 * subpixel position, and its ink is every pixel with alpha > 0; clearances
 * and gaps are measured on that ink, never on the em box. Placed glyphs are
 * composited from those same pixels, so what was measured is what is drawn.
 *
 * Ring. Glyphs nearest the mark leave the grid and are set along the level
 * set of the distance at their centre line, upright like the grid. Each moves
 * along the outline's normal until its nearest ink pixel sits at the
 * clearance. Glyphs are spaced by the ink's extent along the ring plus the
 * tracking (`track`, 7 px: looser than a typeset line, so the ring keeps
 * close to the field's own density and reads as glyphs parting, not as an
 * inline); the slack left at the join is spread as i * delta over every
 * glyph, so the ring closes on the same gap it keeps everywhere else. Ring
 * glyphs take size and ink from the field at their position (`rcap` scales
 * that size, 1 by default) and are set smaller (to half at most) only where
 * they would otherwise not fit.
 *
 * Channels (cut=lines). Each channel between the two lines gets one row along
 * its medial line, centred between the walls, sized so its ink clears both
 * walls by the clearance where it can, but never larger than `chcap` (1.3)
 * times the field's own glyph size there, `chcapv` (1.0) in a vertical
 * stretch (upright glyphs fitted to a channel's width would otherwise come
 * out larger than its horizontal runs), and never under `chmin` (16 px). The
 * row is spaced by the measured pixel gap between neighbouring glyphs' ink
 * (`chtrack`) and justified by spreading the leftover in whole pixels. The
 * gap between G and T gets one centred row sized as if it stood in the T's
 * channel beside it, so it keeps the channels' rhythm (neck=2 gives the two
 * wall-hugging rows of the first study, neck=0 none).
 *
 * Grid. The approved grid (same seed, same draws) keeps every cell whose ink
 * lies beyond the ring glyphs near it and `seam` px from all ring ink. Where
 * the lattice meets the ring and a cell drops out, the largest hole bounded
 * by ring ink takes one seeded glyph at its centre, until no such hole is
 * wider than a cell.
 *
 * Pockets. Where the outline still runs more than `pocket` px past the
 * clearance from any ink (the narrow wedge between the G's spur and its
 * counter, a channel's corner), the free disc nearest it takes one small
 * seeded glyph, as large as the field allows there and no smaller than half
 * the field's size or `pkfloor` (14 px, under which a glyph reads as a
 * fleck), so a wedge tapers in smaller glyphs instead of merging into the
 * carve. A pocket that cannot hold one stays empty.
 *
 * Report. After drawing, the page reads its own canvas back and measures the
 * carve on the true outline: ink pixels inside it, the minimum distance from
 * any ink pixel to the outline, per-glyph clearance of the ring and the rows,
 * the distance from points along the outline to the nearest ink, the closest
 * approach between glyphs, the largest empty disc in the seam against the
 * uncarved grid's own, and tiny or isolated glyphs. window.__report carries
 * it all.
 *
 * Deterministic: no Math.random, no Date, no clock; every draw comes from
 * mulberry32 seeds (the grid's 1988; the ring's, rows', seam's and pockets'
 * from `seed`, 2026).
 */

export async function drawCarved(env) {
  const { ctx, W, R, styleAt, SCRIPTS, mulberry, CLEAR, groundRGB, params, ground, fontFor, markSvg } = env;
  await document.fonts.load('500 24px Inter');

  const P = (k, def) => (params.has(k) ? params.get(k) : def);
  const CUT = P('cut', 'lines');
  const MARKF = Number(P('mark', 0.5));
  const D1 = Number(P('clear', 8)); // the clearance: outline to nearest ink, px
  const NRINGS = Number(P('rings', 1));
  const ORIENT = P('orient', 'upright'); // or 'tangent'
  const TRACK = Number(P('track', 7)); // px between neighbouring ring glyphs' ink, before the closing solve
  const RCAP = Number(P('rcap', 1)); // ring glyphs at this share of the field's glyph size where they stand (1: the field's own size)
  const CHTRACK = Number(P('chtrack', TRACK)); // px between neighbouring glyphs' ink along a channel row
  const LEAD = Number(P('lead', 5)); // px between ring k's outermost ink and ring k+1's clearance line
  const GAP = Number(P('gap', 3)); // no two glyphs' ink pixel centres within this many px
  const SEAM = Number(P('seam', 6)); // grid ink keeps this far from ring ink
  const GRIDIN = Number(P('gridin', 1)); // grid ink starts beyond this share of the outermost ink of the ring glyphs near it
  const SEED = Number(P('seed', 2026));
  const DEBUG = P('debug', '0') === '1';
  const CENTRE = P('centre', '0') === '1'; // centre ring glyphs in a neck (off: every ring glyph keeps the clearance from its near wall)
  const FILL = P('fill', '1') === '1'; // ring 1's fill pass just outside the clearance line
  const MEASURE = P('measure', '1') === '1';
  const cell = 32;
  const GGAIN = 1.15;
  const cols = Math.floor(W / cell);
  const pad = (W - cols * cell) / 2;

  /* ---------- the mark as polygons in canvas px ---------- */
  const svg = markSvg;
  const dAttr = svg.match(/ d="([^"]+)"/)[1];
  const vb = svg.match(/viewBox="([^"]+)"/)[1].trim().split(/\s+/).map(Number);
  const mw = Math.round(W * R * 2 * MARKF);
  const mh = (mw * vb[3]) / vb[2];
  const sc = mw / vb[2];
  const mox = (W - mw) / 2;
  const moy = (W - mh) / 2;
  const toPx = ([x, y]) => [mox + (x - vb[0]) * sc, moy + (y - vb[1]) * sc];
  const subs = dAttr.split('Z').map((s) => s.trim()).filter(Boolean).map((s) => {
    const n = s.match(/-?\d+(?:\.\d+)?/g).map(Number);
    const pts = [];
    for (let i = 0; i < n.length; i += 2) pts.push([n[i], n[i + 1]]);
    const a = pts[0], b = pts[pts.length - 1];
    if (a[0] === b[0] && a[1] === b[1]) pts.pop();
    return pts;
  });
  const [RED, GREEN, BLUEP, ORANGE] = subs; // outer band, G channel, T's second line, crossbar's second line
  // The two open channels, closed with the path's own vertices: the T's
  // channel (bar and stem) and the crossbar's channel.
  const TCH = [[834, 283.5], [1196.5, 283], [1197, 337.5], [888, 337.5], [888, 975.5], [832.5, 976]];
  const XCH = [[414.5, 635], [631, 635.5], [631, 890.5], [583, 923.5], [583, 684.5], [414.5, 684]];
  // Two fields. The ring field is always the silhouette's (both lines and
  // their channels as one letterform): the rings, the grid and the seam see
  // the mark as one shape. The true field is the carve itself: for
  // cut=lines the two lines alone, whose channels hold rows of their own.
  // The neck between the crossbar's second line and the T's stem is one
  // row wide, like a channel: the rings treat it as closed and it gets a
  // centred row of its own (neck=0 leaves it to the rings).
  const NECKQ = [[692, 572.5], [772.5, 572.5], [772.5, 830.5], [692, 830.5]];
  // neck=1 (the default) sets one centred row in the gap between G and T,
  // like a channel's; neck=2 sets two rows, one on each wall; neck=0 leaves
  // the gap to the rings.
  const NECKMODE = P('neck', '1');
  const NECK = NECKMODE !== '0';
  const silVB = NECK ? [RED, BLUEP, ORANGE, TCH, XCH, NECKQ] : [RED, BLUEP, ORANGE, TCH, XCH];
  const linesVB = [RED, GREEN, BLUEP, ORANGE];
  const polysS = silVB.map((p) => p.map(toPx));
  const polysT = (CUT === 'lines' ? linesVB : [RED, BLUEP, ORANGE, TCH, XCH]).map((p) => p.map(toPx));
  const polys = polysT;
  function makeExact(ps, insideMask) {
    const EA = [];
    ps.forEach((p, k) => { for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; EA.push([a[0], a[1], b[0] - a[0], b[1] - a[1], k]); } });
    const NE = EA.length;
    const eax = new Float64Array(NE), eay = new Float64Array(NE), edx = new Float64Array(NE), edy = new Float64Array(NE), einv = new Float64Array(NE), ebit = new Int32Array(NE);
    EA.forEach((e, i) => { eax[i] = e[0]; eay[i] = e[1]; edx[i] = e[2]; edy[i] = e[3]; einv[i] = 1 / (e[2] * e[2] + e[3] * e[3]); ebit[i] = 1 << e[4]; });
    return function exactAt(px, py) {
      let best = 1e18, par = 0;
      for (let e = 0; e < NE; e++) {
        const ax = eax[e], ay = eay[e], dx = edx[e], dy = edy[e];
        let t = ((px - ax) * dx + (py - ay) * dy) * einv[e];
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qx = px - ax - t * dx, qy = py - ay - t * dy;
        const d2 = qx * qx + qy * qy;
        if (d2 < best) best = d2;
        const by = ay + dy;
        if ((ay > py) !== (by > py)) { const xi = ax + ((py - ay) / dy) * dx; if (px < xi) par ^= ebit[e]; }
      }
      const d = Math.sqrt(best);
      return insideMask(par) ? -d : d;
    };
  }
  const exactS = makeExact(polysS, (m) => m !== 0);
  const exactAt = CUT === 'lines' ? makeExact(polysT, (m) => ((m & 1) && !(m & 2)) || (m & 4) || (m & 8)) : NECK ? makeExact(polysT, (m) => m !== 0) : exactS;

  /* ---------- the distance field over a band around the mark ---------- */
  let mx0 = 1e9, my0 = 1e9, mx1 = -1e9, my1 = -1e9;
  polys.forEach((p) => p.forEach(([x, y]) => { mx0 = Math.min(mx0, x); my0 = Math.min(my0, y); mx1 = Math.max(mx1, x); my1 = Math.max(my1, y); }));
  const MARGIN = 260;
  const bx0 = Math.max(0, Math.floor(mx0) - MARGIN), by0 = Math.max(0, Math.floor(my0) - MARGIN);
  const bx1 = Math.min(W, Math.ceil(mx1) + MARGIN), by1 = Math.min(W, Math.ceil(my1) + MARGIN);
  const BW = bx1 - bx0, BH = by1 - by0;
  const dist = new Float32Array(BW * BH); // the ring field (silhouette)
  for (let j = 0; j < BH; j++) for (let i = 0; i < BW; i++) dist[j * BW + i] = exactS(bx0 + i + 0.5, by0 + j + 0.5);
  let distT = dist; // the true carve
  if (CUT === 'lines' || NECK) { distT = new Float32Array(BW * BH); for (let j = 0; j < BH; j++) for (let i = 0; i < BW; i++) distT[j * BW + i] = exactAt(bx0 + i + 0.5, by0 + j + 0.5); }
  const FAR = 1e6;
  const dPixT = (x, y) => { const i = x - bx0, j = y - by0; return i < 0 || j < 0 || i >= BW || j >= BH ? FAR : distT[j * BW + i]; };
  const dPix = (x, y) => { const i = x - bx0, j = y - by0; return i < 0 || j < 0 || i >= BW || j >= BH ? FAR : dist[j * BW + i]; };
  function dAt(x, y) { // bilinear between pixel centres
    const fx = x - bx0 - 0.5, fy = y - by0 - 0.5;
    const i = Math.floor(fx), j = Math.floor(fy);
    if (i < 0 || j < 0 || i >= BW - 1 || j >= BH - 1) return FAR;
    const u = fx - i, v = fy - j, k = j * BW + i;
    return (dist[k] * (1 - u) + dist[k + 1] * u) * (1 - v) + (dist[k + BW] * (1 - u) + dist[k + BW + 1] * u) * v;
  }

  /* ---------- level sets (marching squares) ---------- */
  function levelLoops(level) {
    const adj = new Map(), pts = new Map();
    const pt = (key) => {
      if (pts.has(key)) return;
      const idx = key >> 1, i = idx % BW, j = (idx / BW) | 0;
      let x, y;
      if ((key & 1) === 0) { const a = dist[j * BW + i], b = dist[j * BW + i + 1]; x = i + (level - a) / (b - a); y = j; }
      else { const a = dist[j * BW + i], b = dist[(j + 1) * BW + i]; x = i; y = j + (level - a) / (b - a); }
      pts.set(key, [bx0 + x + 0.5, by0 + y + 0.5]);
    };
    const link = (a, b) => { pt(a); pt(b); if (!adj.has(a)) adj.set(a, []); if (!adj.has(b)) adj.set(b, []); adj.get(a).push(b); adj.get(b).push(a); };
    for (let j = 0; j < BH - 1; j++) for (let i = 0; i < BW - 1; i++) {
      const k = j * BW + i;
      const a = dist[k], b = dist[k + 1], c = dist[k + BW + 1], d = dist[k + BW];
      const code = (a < level ? 8 : 0) | (b < level ? 4 : 0) | (c < level ? 2 : 0) | (d < level ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const Tk = (j * BW + i) * 2, Bk = ((j + 1) * BW + i) * 2, Lk = (j * BW + i) * 2 + 1, Rk = (j * BW + i + 1) * 2 + 1;
      const centreIn = (a + b + c + d) / 4 < level;
      switch (code) {
        case 1: link(Lk, Bk); break;
        case 2: link(Bk, Rk); break;
        case 3: link(Lk, Rk); break;
        case 4: link(Tk, Rk); break;
        case 5: if (centreIn) { link(Tk, Lk); link(Bk, Rk); } else { link(Tk, Rk); link(Lk, Bk); } break;
        case 6: link(Tk, Bk); break;
        case 7: link(Tk, Lk); break;
        case 8: link(Tk, Lk); break;
        case 9: link(Tk, Bk); break;
        case 10: if (centreIn) { link(Tk, Rk); link(Lk, Bk); } else { link(Tk, Lk); link(Bk, Rk); } break;
        case 11: link(Tk, Rk); break;
        case 12: link(Lk, Rk); break;
        case 13: link(Bk, Rk); break;
        case 14: link(Lk, Bk); break;
      }
    }
    const seen = new Set(), loops = [];
    for (const start of adj.keys()) {
      if (seen.has(start)) continue;
      const loop = [];
      let prev = -1, cur = start;
      while (true) {
        seen.add(cur);
        loop.push(pts.get(cur));
        const nb = adj.get(cur);
        let next = nb[0] === prev ? nb[1] : nb[0];
        if (nb.length > 2) next = nb.find((q) => q !== prev && !seen.has(q)) ?? start;
        if (next === undefined || next === start || seen.has(next)) break;
        prev = cur; cur = next;
      }
      if (loop.length > 8) loops.push(loop);
    }
    return loops.map(prepLoop).filter((l) => l.L > 24);
  }

  // Uniform resampling, orientation (mark on the right, so the left normal
  // points away from it), smoothed tangents.
  function prepLoop(raw) {
    const n = raw.length;
    const cum = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) { const a = raw[i], b = raw[(i + 1) % n]; cum[i + 1] = cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1]); }
    const L = cum[n];
    const h = 0.5, m = Math.max(8, Math.floor(L / h));
    let X = new Float64Array(m), Y = new Float64Array(m);
    let seg = 0;
    for (let q = 0; q < m; q++) {
      const s = (q * L) / m;
      while (cum[seg + 1] < s) seg++;
      const a = raw[seg], b = raw[(seg + 1) % n];
      const u = (s - cum[seg]) / Math.max(1e-9, cum[seg + 1] - cum[seg]);
      X[q] = a[0] + (b[0] - a[0]) * u; Y[q] = a[1] + (b[1] - a[1]) * u;
    }
    // orientation from the field's gradient
    let score = 0;
    for (let q = 0; q < m; q += 7) {
      const qa = (q + 2) % m, qb = (q - 2 + m) % m;
      const tx = X[qa] - X[qb], ty = Y[qa] - Y[qb];
      const gx = dAt(X[q] + 1, Y[q]) - dAt(X[q] - 1, Y[q]), gy = dAt(X[q], Y[q] + 1) - dAt(X[q], Y[q] - 1);
      score += ty * gx - tx * gy; // dot(left normal (ty, -tx), grad)
    }
    if (score < 0) { X = X.reverse(); Y = Y.reverse(); }
    // start at the topmost point (then leftmost), on a run of the outline
    let q0 = 0;
    for (let q = 1; q < m; q++) if (Y[q] < Y[q0] - 1e-6 || (Math.abs(Y[q] - Y[q0]) < 1e-6 && X[q] < X[q0])) q0 = q;
    const X2 = new Float64Array(m), Y2 = new Float64Array(m);
    for (let q = 0; q < m; q++) { X2[q] = X[(q + q0) % m]; Y2[q] = Y[(q + q0) % m]; }
    let area = 0;
    for (let q = 0; q < m; q++) { const r = (q + 1) % m; area += X2[q] * Y2[r] - X2[r] * Y2[q]; }
    return { X: X2, Y: Y2, m, L, step: L / m, area: area / 2 };
  }
  const TANW = Number(P('tanw', 6)); // px half-window for the tangent
  function at(loop, s) {
    const { X, Y, m, L, step } = loop;
    const ss = ((s % L) + L) % L;
    const f = ss / step, q = Math.floor(f) % m, u = f - Math.floor(f), r = (q + 1) % m;
    const x = X[q] + (X[r] - X[q]) * u, y = Y[q] + (Y[r] - Y[q]) * u;
    const w = Math.max(1, Math.round(TANW / step));
    const qa = (q + w) % m, qb = (q - w + m) % m;
    let tx = X[qa] - X[qb], ty = Y[qa] - Y[qb];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    return { x, y, tx, ty, nx: ty, ny: -tx };
  }

  /* ---------- glyph raster and measures ---------- */
  const GC = document.createElement('canvas');
  GC.width = GC.height = 200;
  const gx = GC.getContext('2d', { willReadFrequently: true });
  let rasters = 0;
  function raster(g, px, cx, cy, theta, color) {
    rasters++;
    const S = Math.min(200, Math.ceil(px * 2.6) + 12);
    const H = S >> 1;
    const ix = Math.floor(cx), iy = Math.floor(cy);
    gx.setTransform(1, 0, 0, 1, 0, 0);
    gx.clearRect(0, 0, S, S);
    gx.font = fontFor(px);
    gx.textAlign = 'center';
    gx.textBaseline = 'middle';
    gx.fillStyle = color || '#ffffff';
    gx.setTransform(1, 0, 0, 1, H + (cx - ix), H + (cy - iy));
    if (theta) gx.rotate(theta);
    gx.fillText(g, 0, px * 0.04);
    const a = gx.getImageData(0, 0, S, S).data;
    let n = 0;
    for (let k = 3; k < a.length; k += 4) if (a[k] > 0) n++;
    const xs = new Int32Array(n), ys = new Int32Array(n);
    let touch = false;
    n = 0;
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) if (a[(j * S + i) * 4 + 3] > 0) {
      xs[n] = ix - H + i; ys[n] = iy - H + j; n++;
      if (i === 0 || j === 0 || i === S - 1 || j === S - 1) touch = true;
    }
    return { xs, ys, n, S, H, ix, iy, touch, cx, cy };
  }
  function minDistOf(r) {
    let m = FAR;
    for (let k = 0; k < r.n; k++) { const d = dPix(r.xs[k], r.ys[k]); if (d < m) m = d; }
    return m;
  }
  function minBy(r, fn) {
    let m = FAR;
    for (let k = 0; k < r.n; k++) { const d = fn(r.xs[k], r.ys[k]); if (d < m) m = d; }
    return m;
  }
  function minDistT(r) {
    let m = FAR;
    for (let k = 0; k < r.n; k++) { const d = dPixT(r.xs[k], r.ys[k]); if (d < m) m = d; }
    return m;
  }
  function extentAlong(r, ux, uy) {
    let lo = 1e9, hi = -1e9;
    for (let k = 0; k < r.n; k++) { const p = (r.xs[k] + 0.5) * ux + (r.ys[k] + 0.5) * uy; if (p < lo) lo = p; if (p > hi) hi = p; }
    return r.n ? hi - lo + 1 : 0;
  }
  // The globe's own law at any point (size, ink, land), in the page's mode.
  const toneAt = (x, y) => styleAt(x, y);
  const advCache = new Map();
  function advance(g, px) {
    const key = g + '|' + px.toFixed(1);
    if (advCache.has(key)) return advCache.get(key);
    gx.setTransform(1, 0, 0, 1, 0, 0);
    gx.font = fontFor(px);
    const w = gx.measureText(g).width;
    advCache.set(key, w);
    return w;
  }

  /* ---------- occupancy ---------- */
  const occS = new Int32Array(BW * BH); // committed glyphs (earlier rings), id + 1
  const occR = new Int32Array(BW * BH); // the ring being solved
  let occRWritten = [];
  const discCache = new Map();
  function disc(r) {
    if (discCache.has(r)) return discCache.get(r);
    const out = [];
    const R2 = r * r, ri = Math.ceil(r);
    for (let y = -ri; y <= ri; y++) for (let x = -ri; x <= ri; x++) if (x * x + y * y <= R2) out.push(y * BW + x);
    const arr = Int32Array.from(out);
    discCache.set(r, arr);
    return arr;
  }
  function collides(r, gapPx, useR) {
    const off = disc(gapPx);
    for (let k = 0; k < r.n; k++) {
      const i = r.xs[k] - bx0, j = r.ys[k] - by0;
      if (i < 8 || j < 8 || i >= BW - 8 || j >= BH - 8) continue;
      const base = j * BW + i;
      for (let o = 0; o < off.length; o++) { const q = base + off[o]; if (occS[q] || (useR && occR[q])) return true; }
    }
    return false;
  }
  function writeOcc(arr, r, id, list) {
    for (let k = 0; k < r.n; k++) {
      const i = r.xs[k] - bx0, j = r.ys[k] - by0;
      if (i < 0 || j < 0 || i >= BW || j >= BH) continue;
      const q = j * BW + i;
      arr[q] = id;
      if (list) list.push(q);
    }
  }
  function resetR() { for (const q of occRWritten) occR[q] = 0; occRWritten = []; }

  /* ---------- fitting one glyph to its clearance ---------- */
  // Moves the glyph along the normal until its nearest ink pixel sits at
  // `target` px from the outline: secant steps until the boundary is
  // bracketed, then bisection, so the result is never nearer than the target
  // and within a third of a pixel of it. A glyph that cannot reach the
  // clearance (a channel narrower than its ink) is set smaller, a tenth at a
  // time.
  function fitGlyph(g, px0, p, theta, target, delta0, distFn) {
    let px = px0;
    const clamp = (v) => Math.max(-70, Math.min(70, v));
    for (let shrink = 0; shrink < 8; shrink++) {
      const evalAt = (dl) => { const r = raster(g, px, p.x + p.nx * dl, p.y + p.ny * dl, theta); return { r, m: distFn ? minBy(r, distFn) : minDistOf(r), delta: dl }; };
      const cur = evalAt(clamp(delta0 || 0));
      if (!cur.r.n) return null;
      let lo = cur.m < target ? cur : null; // too near
      let hi = cur.m >= target ? cur : null; // clear
      let noFit = false;
      for (let it = 0; it < 10 && !(lo && hi); it++) {
        const ref = lo || hi;
        const step = target - ref.m + (ref.m < target ? 0.06 : -0.06);
        const dl = clamp(ref.delta + step);
        if (Math.abs(dl - ref.delta) < 1e-3) break;
        const nx = evalAt(dl);
        if (nx.m >= target) { if (!hi || nx.delta < hi.delta) hi = nx; }
        else {
          if (lo && step > 0 && nx.m < lo.m - 0.25) { noFit = true; break; } // moving out brings the far wall nearer
          if (!lo || nx.delta > lo.delta) lo = nx;
        }
      }
      if (lo && hi) {
        for (let it = 0; it < 9 && hi.m - target > 0.3; it++) {
          const mid = evalAt((lo.delta + hi.delta) / 2);
          if (mid.m >= target) hi = mid; else lo = mid;
        }
      }
      if (hi && !noFit) {
        if (CENTRE) {
          // Between two walls (a channel, a neck) the glyph goes to the middle:
          // probe outward; where moving out no longer clears the ink further,
          // a far wall is near, and the best place is where both sides are equal.
          const probe = evalAt(clamp(hi.delta + 2));
          if (probe.m < hi.m + 1.2) {
            let a = hi.delta, b = hi.delta + 2;
            let fb = probe.m;
            // walk out while it still helps
            for (let it = 0; it < 30; it++) { const c = evalAt(clamp(b + 1)); if (c.m <= fb + 0.02) break; b = b + 1; fb = c.m; }
            // golden section on [a, b + 1]
            let lo2 = a, hi2 = b + 1;
            const gr = 0.618;
            let x1 = hi2 - gr * (hi2 - lo2), x2 = lo2 + gr * (hi2 - lo2);
            let f1 = evalAt(x1), f2 = evalAt(x2);
            for (let it = 0; it < 12; it++) {
              if (f1.m < f2.m) { lo2 = x1; x1 = x2; f1 = f2; x2 = lo2 + gr * (hi2 - lo2); f2 = evalAt(x2); }
              else { hi2 = x2; x2 = x1; f2 = f1; x1 = hi2 - gr * (hi2 - lo2); f1 = evalAt(x1); }
            }
            const c = f1.m >= f2.m ? f1 : f2;
            // only a true neck: the far side has no room for another row
            const e = extentAlong(hi.r, p.nx, p.ny);
            if (c.m >= hi.m && c.m - hi.m <= 0.5 * e + target * 0.5) return { ...c, px, centred: true };
          }
        }
        return { ...hi, px };
      }
      px *= 0.9;
      if (px < Math.max(cell * 0.2, px0 * 0.5)) return null; // never under half its field size
    }
    return null;
  }

  /* ---------- placing one ring along one loop ---------- */
  let uid = 0;
  const glyphRec = []; // every placed ring glyph
  function glyphSeq(seed, n) {
    const rnd = mulberry(seed);
    const out = [];
    for (let i = 0; i < n; i++) { const pS = rnd(), pG = rnd(); const sc_ = SCRIPTS[Math.floor(pS * SCRIPTS.length)]; out.push(sc_[Math.floor(pG * sc_.length)]); }
    return out;
  }
  function widthAt(g, s, loop) {
    const p = at(loop, s);
    const tone = toneAt(p.x, p.y);
    if (!tone) return null;
    const theta = ORIENT === 'tangent' ? Math.atan2(p.ty, p.tx) : 0;
    const px = RCAP === 1 ? tone.px : tone.px * RCAP;
    let a;
    if (ORIENT === 'tangent') a = advance(g, px);
    else { const r = raster(g, px, p.x, p.y, 0); a = extentAlong(r, p.tx, p.ty); }
    return { a, tone, p, theta, px };
  }
  // Sets glyph i at arc position s (or further on, if its ink would meet a
  // neighbour's): its width there, its clearance fit, the collision test.
  function setAt(loop, g, s, targetAt, delta0, sMax) {
    let pushed = 0;
    while (s <= sMax) {
      const w = widthAt(g, s, loop);
      if (!w) { s += 2; pushed += 2; continue; }
      const f = fitGlyph(g, w.px, w.p, w.theta, targetAt(w.p), delta0);
      if (f && !f.r.touch && !collides(f.r, GAP, true)) return { g, s, a: w.a, theta: w.theta, tone: w.tone, px: f.px, r: f.r, m: f.m, delta: f.delta, p: w.p, pushed, centred: !!f.centred };
      s += 2; pushed += 2;
    }
    return null;
  }
  // The greedy pass at the nominal tracking: each glyph goes at its pitch
  // from the last (half of each width plus the tracking), or further on.
  function greedy(loop, glyphs, track, targetAt) {
    resetR();
    const out = [];
    const L = loop.L;
    let s = 0, blocked = 0, lastDelta = 0;
    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs[i];
      if (i > 0) {
        const prev = out[out.length - 1];
        let w = widthAt(g, prev.s + prev.a / 2 + track + prev.a / 2, loop);
        const a1 = w ? w.a : prev.a;
        s = prev.s + prev.a / 2 + track + a1 / 2;
        w = widthAt(g, s, loop);
        if (w) s = prev.s + prev.a / 2 + track + w.a / 2;
      }
      const sMax = i > 0 ? L - out[0].a / 2 - track - 2 : L;
      const gl = setAt(loop, g, s, targetAt, lastDelta, sMax);
      if (!gl) break;
      if (i > 0 && gl.s + gl.a / 2 + track + out[0].a / 2 > L + 1e-6) break;
      blocked += gl.pushed;
      gl.skip = gl.pushed;
      out.push(gl);
      writeOcc(occR, gl.r, 1, occRWritten);
      lastDelta = gl.delta;
    }
    return { out, blocked };
  }
  // Justification: the greedy pass leaves its slack at the join. Shifting
  // glyph i on by i * delta opens every gap by delta and closes the join by
  // (N - 1) * delta, so delta = (join - track) / N makes the join equal to
  // every other gap. Each shifted glyph is refitted and retested; a glyph
  // that would now meet a neighbour moves on a little, and the next round
  // spreads what is left. Only layouts whose every glyph passed the
  // clearance and collision tests are ever returned.
  function justify(loop, glyphs, first, track, targetAt) {
    const L = loop.L;
    const closeOf = (o) => { const last = o[o.length - 1]; return L - last.s - last.a / 2 - o[0].a / 2; };
    let cur = first;
    let tr = track;
    for (let round = 0; round < 6; round++) {
      const N = cur.length;
      const close = closeOf(cur);
      if (Math.abs(close - tr) < 0.35) return { out: cur, track: tr, close, solved: true };
      const delta = (close - tr) / N;
      resetR();
      const next = [];
      let ok = true, pushes = 0;
      for (let i = 0; i < N; i++) {
        const base = cur[i];
        let s = base.s + i * delta;
        if (next.length) s = Math.max(s, next[next.length - 1].s + 0.5); // keep order
        const sMax = next.length ? L - next[0].a / 2 - 0.5 : L;
        let gl = null;
        for (let tries = 0; tries < 40 && s <= sMax; tries++) {
          const w = widthAt(base.g, s, loop);
          if (w) {
            const f = fitGlyph(base.g, w.px, w.p, w.theta, targetAt(w.p), base.delta);
            if (f && !f.r.touch && !collides(f.r, GAP, true)) { gl = { ...base, s, theta: w.theta, tone: w.tone, px: f.px, r: f.r, m: f.m, delta: f.delta, p: w.p, centred: !!f.centred }; break; }
          }
          s += 0.5; pushes += 0.5;
        }
        if (!gl) {
          // a glyph squeezed out where two strands meet (a neck's mouth) leaves the ring
          (window.__jlog ||= []).push({ dropped: i, g: base.g, x: +base.p.x.toFixed(0), y: +base.p.y.toFixed(0) });
          if (i === 0) { ok = false; break; }
          continue;
        }
        next.push(gl);
        writeOcc(occR, gl.r, 1, occRWritten);
      }
      (window.__jlog ||= []).push({ L: +L.toFixed(1), round, N, track: +tr.toFixed(3), close: +close.toFixed(3), delta: +delta.toFixed(4), ok, pushes });
      if (!ok) break;
      // the tracking every gap now keeps: the nominal plus the spread residual
      tr = tr + delta;
      cur = next;
    }
    const close = closeOf(cur);
    return { out: cur, track: tr, close, solved: Math.abs(close - tr) < 0.35 };
  }
  function placeRing(loop, ringIdx, loopIdx, targetAt, fill) {
    const glyphs = glyphSeq(SEED + ringIdx * 1000 + loopIdx * 17 + (fill ? 500 : 0), 2000);
    const g0 = greedy(loop, glyphs, TRACK, targetAt);
    let res;
    if (!fill && g0.out.length >= 4 && g0.blocked < 0.15 * loop.L) res = justify(loop, glyphs, g0.out, TRACK, targetAt);
    else { const last = g0.out[g0.out.length - 1]; res = { out: g0.out, track: TRACK, close: last ? loop.L - last.s - last.a / 2 - g0.out[0].a / 2 : 0, solved: false }; }
    resetR();
    for (const gl of res.out) {
      gl.id = ++uid; gl.ring = ringIdx; gl.loop = loopIdx; gl.fill = !!fill;
      writeOcc(occS, gl.r, gl.id);
      glyphRec.push(gl);
    }
    return { n: res.out.length, track: res.track, close: res.close, solved: res.solved, L: loop.L, blocked: g0.blocked, fill: !!fill };
  }

  /* ---------- the rings ---------- */
  // Ring 1 keeps the clearance. Ring k+1 sits `lead` px beyond the outermost
  // ink of the ring-k glyphs near it, so its line follows ring k's local size
  // (large on land, small on ocean), as the grid's halftone does.
  const ringInfo = [];
  const near = (list, x, y, r) => list.filter((g) => (g.r.cx - x) ** 2 + (g.r.cy - y) ** 2 < r * r);
  const RHO = Number(P('rho', 1.4)) * cell;
  let prevRing = null;
  for (let k = 0; k < NRINGS; k++) {
    let targetAt, centre, clearance;
    if (k === 0) { clearance = D1; targetAt = () => D1; centre = D1 + cell * 0.25 + 2; }
    else {
      const outs = prevRing.map((g) => g.outer).sort((a, b) => a - b);
      const med = outs[Math.floor(outs.length / 2)];
      clearance = med + LEAD;
      const prev = prevRing;
      targetAt = (p) => { const nb = near(prev, p.x, p.y, RHO); return (nb.length ? Math.max(...nb.map((g) => g.outer)) : med) + LEAD; };
      centre = med + LEAD + cell * 0.25 + 2;
    }
    let loops = levelLoops(centre);
    loops.sort((a, b) => b.L - a.L);
    // Rings past the first go round the outside only (loops that enclose the
    // mark); inside the counter and channels the grid takes over from ring 1.
    if (k > 0 && P('inner2', '0') !== '1') loops = loops.filter((l) => l.area > 0);
    const info = { ring: k + 1, clearance, centre, loops: [] };
    loops.forEach((l, li) => info.loops.push(placeRing(l, k, li, targetAt)));
    // Ring 1's fill pass: a loop just outside the clearance line reaches the
    // narrow places the centre line never does (channels, pockets, a neck's
    // mouth); its glyphs go wherever they clear the outline and every glyph
    // already set, so the main ring keeps its rhythm.
    if (k === 0 && FILL) levelLoops(D1 + 1.5).sort((a, b) => b.L - a.L).forEach((l, li) => info.loops.push(placeRing(l, k, 100 + li, targetAt, true)));
    const mine = glyphRec.filter((g) => g.ring === k);
    let band = 0;
    for (const g of mine) { let hi = -1e9; for (let q = 0; q < g.r.n; q++) { const d = dPix(g.r.xs[q], g.r.ys[q]); if (d > hi) hi = d; } g.outer = hi; band = Math.max(band, hi - g.m); }
    info.band = band;
    info.glyphs = mine.length;
    ringInfo.push(info);
    prevRing = mine;
    if (!mine.length) break;
  }
  const ringOuterMed = (() => { const o = glyphRec.map((g) => g.outer).sort((a, b) => a - b); return o[Math.floor(o.length / 2)] || D1; })();

  /* ---------- channel rows (cut=lines) ---------- */
  // Each channel between the mark's two lines gets one row of glyphs along
  // its medial line (the midpoints between its two walls). A channel glyph is
  // centred between the walls and set at the size whose ink clears both walls
  // by exactly the clearance (chfit=exact; chfit=cap keeps the field's size
  // where that is smaller), so the carved lines keep one width all the way
  // along. Its ink takes the field's colour there. The row is spaced by the
  // ink's extent along the channel plus the tracking, then justified so the
  // row reaches both ends of its channel on the same gap.
  const channelInfo = [];
  let neckBox = null; // the gap between G and T, which its own row holds (pockets stay out of it)
  const CHFIT = P('chfit', 'exact');
  const CHMAX = Number(P('chmax', 1.15)) * cell;
  const CHMIN = Number(P('chmin', 0.5)) * cell; // a channel glyph never smaller than this: where it would have to be, the row moves on
  // A channel glyph follows the field's halftone: it is never set larger than
  // `chcap` times the field's own glyph size where it stands (the grid's rule
  // that a moved glyph does not grow), `chcapv` times in a vertical stretch,
  // where upright glyphs are fitted to their width and would otherwise come
  // out larger than the same channel's horizontal runs. CHMIN is the floor.
  const CHCAP = Number(P('chcap', 1.3));
  const CHCAPV = Number(P('chcapv', 1.0));
  if (CUT === 'lines' || NECK) {
    const walls = [];
    if (CUT === 'lines') walls.push(
      ['G', [GREEN[47], ...GREEN.slice(0, 24)], [GREEN[46], ...GREEN.slice(24, 46).reverse()]],
      ['T', [[1196.5, 283], [834, 283.5], [832.5, 976]], [[1197, 337.5], [888, 337.5], [888, 975.5]]],
      ['X', [[414.5, 684], [583, 684.5], [583, 923.5]], [[414.5, 635], [631, 635.5], [631, 890.5]]],
    );
    const resample = (pl, step) => {
      const out = [];
      for (let i = 0; i < pl.length - 1; i++) { const a = pl[i], b = pl[i + 1]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const n = Math.max(1, Math.ceil(L / step)); for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]); }
      out.push(pl[pl.length - 1]);
      return out;
    };
    const nearestOn = (pl, x, y) => {
      let best = 1e18, bp = pl[0];
      for (let i = 0; i < pl.length - 1; i++) {
        const a = pl[i], b = pl[i + 1], dx = b[0] - a[0], dy = b[1] - a[1];
        let t = ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t));
        const qx = a[0] + t * dx, qy = a[1] + t * dy, d2 = (x - qx) ** 2 + (y - qy) ** 2;
        if (d2 < best) { best = d2; bp = [qx, qy]; }
      }
      return bp;
    };
    const openPath = (pts) => {
      // smooth the midpoints, then resample by arc length
      const sm = pts.map((p, i) => { let sx = 0, sy = 0, n = 0; for (let k = -6; k <= 6; k++) { const q = pts[Math.max(0, Math.min(pts.length - 1, i + k))]; sx += q[0]; sy += q[1]; n++; } return [sx / n, sy / n]; });
      sm[0] = pts[0]; sm[sm.length - 1] = pts[pts.length - 1];
      const cum = [0];
      for (let i = 1; i < sm.length; i++) cum.push(cum[i - 1] + Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]));
      const L = cum[cum.length - 1], m = Math.ceil(L / 0.5) + 1;
      const X = new Float64Array(m), Y = new Float64Array(m);
      let seg = 0;
      for (let q = 0; q < m; q++) { const s = Math.min(L, q * 0.5); while (seg < sm.length - 2 && cum[seg + 1] < s) seg++; const u = (s - cum[seg]) / Math.max(1e-9, cum[seg + 1] - cum[seg]); X[q] = sm[seg][0] + (sm[seg + 1][0] - sm[seg][0]) * u; Y[q] = sm[seg][1] + (sm[seg + 1][1] - sm[seg][1]) * u; }
      return { X, Y, m, L };
    };
    const openAt = (path, s) => {
      const f = Math.max(0, Math.min(path.m - 1, s / 0.5)), q = Math.min(path.m - 2, Math.floor(f)), u = f - q;
      const x = path.X[q] + (path.X[q + 1] - path.X[q]) * u, y = path.Y[q] + (path.Y[q + 1] - path.Y[q]) * u;
      const qa = Math.min(path.m - 1, q + 12), qb = Math.max(0, q - 12);
      let tx = path.X[qa] - path.X[qb], ty = path.Y[qa] - path.Y[qb];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      return { x, y, tx, ty, nx: ty, ny: -tx };
    };
    // centred between the walls: the offset across the channel that clears both best
    const centreAt = (g, px, p) => {
      const ev = (dl) => { const r = raster(g, px, p.x + p.nx * dl, p.y + p.ny * dl, 0); return { r, m: minDistT(r), delta: dl }; };
      let lo = -10, hi = 10;
      const gr = 0.618;
      let x1 = hi - gr * (hi - lo), x2 = lo + gr * (hi - lo), f1 = ev(x1), f2 = ev(x2);
      for (let it = 0; it < 13; it++) {
        if (f1.m < f2.m) { lo = x1; x1 = x2; f1 = f2; x2 = lo + gr * (hi - lo); f2 = ev(x2); }
        else { hi = x2; x2 = x1; f2 = f1; x1 = hi - gr * (hi - lo); f1 = ev(x1); }
      }
      return f1.m >= f2.m ? f1 : f2;
    };
    const fitChannel = (g, p, target, pxMax) => {
      const top = centreAt(g, pxMax, p);
      if (!top.r.n) return null;
      if (top.m >= target) return { ...top, px: pxMax, capped: true };
      let lo = CHMIN, hi = pxMax;
      let best = centreAt(g, lo, p);
      if (best.m < target) return null;
      best = { ...best, px: lo };
      for (let it = 0; it < 12; it++) {
        const mid = (lo + hi) / 2;
        const c = centreAt(g, mid, p);
        if (c.m >= target) { lo = mid; best = { ...c, px: mid }; if (c.m - target < 0.3) break; } else hi = mid;
      }
      return best;
    };
    // The neck's two rows: each keeps the clearance from its own wall and
    // stays on its own side of the neck's middle line (half the gap apart).
    let hugFn = null;
    const setRow = (path, g, s, target) => {
      const p = openAt(path, s);
      const tone = toneAt(p.x, p.y);
      if (!tone) return null;
      if (path.hug) {
        const f = fitGlyph(g, tone.px, { ...p, nx: path.hug.nx, ny: 0 }, 0, target, 0, path.hug.fn);
        if (!f || f.r.touch || collides(f.r, GAP, true)) return null;
        return { g, s, a: extentAlong(f.r, p.tx, p.ty), theta: 0, tone, px: f.px, r: f.r, m: f.m, delta: f.delta, p, hug: true };
      }
      const vertical = Math.abs(p.ty) > Math.abs(p.tx);
      const cap = CHFIT === 'cap' ? Math.min(tone.px, CHMAX) : CHFIT === 'free' ? CHMAX : Math.max(CHMIN, Math.min(CHMAX, (vertical ? CHCAPV : CHCAP) * tone.px));
      const f = fitChannel(g, p, target, cap);
      if (!f || f.r.touch || collides(f.r, GAP, true)) return null;
      return { g, s, a: extentAlong(f.r, p.tx, p.ty), theta: 0, tone, px: f.px, r: f.r, m: f.m, delta: f.delta, p, capped: !!f.capped, centred: true };
    };
    if (NECKMODE === '1') {
      // one row on the gap's middle line, centred between its walls like a channel's
      const xo = toPx([692, 0])[0], xt = toPx([772.5, 0])[0], xm = (xo + xt) / 2;
      const ya = toPx([0, 572.5])[1], yb = toPx([0, 830.5])[1];
      // sized as if it stood in the T's channel beside it: its ink keeps the
      // clearance plus half the difference in width, so the row has the
      // channels' rhythm and the gap still reads as the space between letters
      const neckTarget = D1 + ((772.5 - 692) - (888 - 834)) * sc / 2;
      walls.push(['N', null, null, null, [[xm, ya], [xm, yb]], neckTarget]);
      neckBox = [xo - 2, ya - 2, xt + 2, yb + 2];
    } else if (NECK) {
      const xo = toPx([692, 0])[0], xt = toPx([772.5, 0])[0], xm = (xo + xt) / 2;
      const ya = toPx([0, 572.5])[1], yb = toPx([0, 830.5])[1];
      walls.push(['NA', null, null, { x: xo + D1 + 9, ya, yb, nx: 1, fn: (x, y) => Math.min(dPixT(x, y), xm - GAP / 2 - (x + 0.5) + D1) }]);
      walls.push(['NB', null, null, { x: xt - D1 - 9, ya, yb, nx: -1, fn: (x, y) => Math.min(dPixT(x, y), (x + 0.5) - (xm + GAP / 2) + D1) }]);
    }
    walls.forEach(([name, A, B, hug, line, rowTarget], ci) => {
      let path;
      if (line) path = openPath(resample(line, 1));
      else if (hug) { path = openPath(resample([[hug.x, hug.ya], [hug.x, hug.yb]], 1)); path.hug = hug; }
      else {
        const a = resample(A.map(toPx), 1), b = B.map(toPx);
        path = openPath(a.map(([x, y]) => { const q = nearestOn(b, x, y); return [(x + q[0]) / 2, (y + q[1]) / 2]; }));
      }
      const glyphs = glyphSeq(SEED + 9000 + ci * 31, 600);
      // Spacing by the ink itself: each glyph goes to the nearest place along
      // the channel where its ink keeps exactly `track` px from the previous
      // glyph's ink (measured pixel to pixel), so curves and corners keep the
      // same gap as the straight runs.
      const cache = new Map();
      const setC = (i, s) => { const k = i + '|' + s.toFixed(2); if (!cache.has(k)) cache.set(k, setRow(path, glyphs[i], s, rowTarget || D1)); return cache.get(k); };
      const localEDT = (r) => {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (let k = 0; k < r.n; k++) { x0 = Math.min(x0, r.xs[k]); y0 = Math.min(y0, r.ys[k]); x1 = Math.max(x1, r.xs[k]); y1 = Math.max(y1, r.ys[k]); }
        x0 -= 48; y0 -= 48; x1 += 48; y1 += 48;
        const w = x1 - x0 + 1, h = y1 - y0 + 1, m = new Uint8Array(w * h);
        for (let k = 0; k < r.n; k++) m[(r.ys[k] - y0) * w + (r.xs[k] - x0)] = 1;
        return { x0, y0, w, h, e: edt2(m, w, h) };
      };
      const gapTo = (le, r) => {
        let g = 1e9;
        for (let k = 0; k < r.n; k++) { const i = r.xs[k] - le.x0, j = r.ys[k] - le.y0; if (i < 0 || j < 0 || i >= le.w || j >= le.h) continue; const d = le.e[j * le.w + i]; if (d < g) g = d; }
        return Math.sqrt(g);
      };
      const run = (track, N, extra) => {
        const out = [];
        let le = null;
        for (let i = 0; i < Math.min(N || 1e9, glyphs.length); i++) {
          let gl = null;
          if (i === 0) { for (let s = 0; s <= path.L && !gl; s += 0.5) { const c = setC(0, s); if (c && !collides(c.r, GAP, false)) gl = c; } }
          else {
            const prev = out[out.length - 1];
            const want = track + (extra ? extra(i) : 0);
            // walk out in 2 px steps to the first place that clears, then bisect back to the exact gap
            let lo = prev.s, hi = null, hiGl = null;
            for (let s = prev.s + 2; s <= Math.min(path.L, prev.s + 3 * cell); s += 2) {
              const c = setC(i, s);
              if (c && gapTo(le, c.r) >= want && !collides(c.r, GAP, false)) { hi = s; hiGl = c; break; }
              if (!c || gapTo(le, c.r) < want) lo = s;
            }
            if (hi === null) break;
            for (let it = 0; it < 6; it++) {
              const mid = (lo + hi) / 2;
              const c = setC(i, mid);
              if (c && gapTo(le, c.r) >= want && !collides(c.r, GAP, false)) { hi = mid; hiGl = c; } else lo = mid;
            }
            gl = hiGl;
          }
          if (!gl) break;
          out.push(gl);
          le = localEDT(gl.r);
        }
        return out;
      };
      let out = run(CHTRACK);
      // justify: the tracking that brings the last glyph to the last place it
      // fits before the channel's end
      let finalTrack = CHTRACK, slack = 0;
      if (out.length > 1) {
        const N = out.length, gN = N - 1;
        let sEnd = out[gN].s;
        for (let ds = 0.5; ds <= 80; ds += 0.5) { const s2 = out[gN].s + ds; if (s2 > path.L) break; const c = setC(gN, s2); if (c && !collides(c.r, GAP, false)) sEnd = s2; else if (s2 > sEnd + 6) break; }
        slack = sEnd - out[gN].s;
        // Pixel gaps come in whole steps, so the slack goes out as whole
        // pixels: k of the N - 1 gaps, spread evenly, open by one more; k is
        // the largest count whose row still ends where the channel does.
        const spread = (k) => (i) => Math.floor((i * k) / (N - 1)) - Math.floor(((i - 1) * k) / (N - 1));
        let lo = 0, hi = Math.min(N - 1, Math.floor(slack));
        while (lo < hi) {
          const k = Math.ceil((lo + hi) / 2);
          const r = run(CHTRACK, N, spread(k));
          (window.__clog ||= []).push({ name, k, N, got: r.length, lastS: r.length ? +r[r.length - 1].s.toFixed(1) : null, sEnd: +sEnd.toFixed(1) });
          if (r.length === N && r[N - 1].s <= sEnd + 0.01) { lo = k; out = r; finalTrack = CHTRACK + k / (N - 1); } else hi = k - 1;
        }
        slack = sEnd - out[N - 1].s;
      }
      resetR();
      for (const gl of out) { gl.id = ++uid; gl.ring = 0; gl.loop = 200 + ci; gl.channel = name; writeOcc(occS, gl.r, gl.id); gl.outer = -1; glyphRec.push(gl); }
      const gaps = [];
      for (let i = 1; i < out.length; i++) gaps.push(gapTo(localEDT(out[i - 1].r), out[i].r));
      channelInfo.push({ channel: name, length: +path.L.toFixed(1), glyphs: out.length, capped: out.filter((g) => g.capped).length, track: +finalTrack.toFixed(2), inkGapMin: gaps.length ? +Math.min(...gaps).toFixed(2) : null, inkGapMax: gaps.length ? +Math.max(...gaps).toFixed(2) : null, slackLeft: +slack.toFixed(1) });
    });
  }

  /* ---------- the grid ---------- */
  // A grid glyph stays when its ink lies beyond the outermost ink of every
  // ring glyph near it (so no grid glyph sits inside the ring band), keeps
  // `seam` px from all ring ink, and keeps the clearance from the outline.
  const rnd = mulberry(1988);
  const gridKeep = [];
  const gridSecond = [];
  const HOLE = Number(P('hole', 0.75));
  let gridDropped = 0;
  const RHOG = Number(P('rhog', 1.5)) * cell;
  for (let y = 0; y < cols; y++)
    for (let x = 0; x < cols; x++) {
      const pickS = rnd();
      const pickG = rnd();
      const cx = pad + (x + 0.5) * cell;
      const cy = pad + (y + 0.5) * cell;
      const st = styleAt(cx, cy, x, y);
      if (!st) continue;
      const { px, fill: c } = st;
      const script = SCRIPTS[Math.floor(pickS * SCRIPTS.length)];
      const g = script[Math.floor(pickG * script.length)];
      const rec = { g, px, c, cx, cy, gx: x, gy: y };
      if (cx > bx0 + 40 && cx < bx1 - 40 && cy > by0 + 40 && cy < by1 - 40) {
        const r = raster(g, px, cx, cy, 0);
        const m = minDistOf(r);
        let need = D1;
        const nb = near(glyphRec, cx, cy, RHOG);
        if (nb.length) need = Math.max(need, GRIDIN * Math.max(...nb.map((q) => q.outer)));
        if (m < D1 || collides(r, SEAM, false)) { gridDropped++; continue; }
        rec.r = r;
        if (m < need) { rec.m = m; gridSecond.push(rec); continue; }
      }
      gridKeep.push(rec);
    }
  // Second chance: a cell held back only because it sits inside a ring's
  // band comes back where the rings left a hole wider than a cell around it
  // (a glyph squeezed out at a neck's mouth), when its ink clears everything.
  {
    const inkB = new Uint8Array(BW * BH);
    const mark = (r) => { for (let k = 0; k < r.n; k++) { const i = r.xs[k] - bx0, j = r.ys[k] - by0; if (i >= 0 && j >= 0 && i < BW && j < BH) inkB[j * BW + i] = 1; } };
    glyphRec.forEach((g) => mark(g.r));
    gridKeep.forEach((q) => q.r && mark(q.r));
    const e = edt2(inkB, BW, BH);
    const occG = new Int32Array(BW * BH);
    gridKeep.forEach((q) => q.r && writeOcc(occG, q.r, 1));
    for (const q of gridSecond) {
      const i = Math.floor(q.cx) - bx0, j = Math.floor(q.cy) - by0;
      if (Math.sqrt(e[j * BW + i]) < HOLE * cell) { gridDropped++; continue; }
      let hit = false;
      const off = disc(SEAM);
      for (let k = 0; k < q.r.n && !hit; k++) { const b = (q.r.ys[k] - by0) * BW + (q.r.xs[k] - bx0); for (let o = 0; o < off.length; o++) if (occG[b + off[o]]) { hit = true; break; } }
      if (hit) { gridDropped++; continue; }
      writeOcc(occG, q.r, 1);
      q.second = true;
      gridKeep.push(q);
    }
    gridKeep.sort((a, b) => a.gy - b.gy || a.gx - b.gx); // the approved draw order
  }
  // Seam fill: where the lattice meets the rings, a cell that would touch a
  // ring glyph drops out and can leave a hole wider than a cell. The largest
  // hole takes one glyph at its centre (seeded draw, size and ink from the
  // field there, upright like the grid; set smaller only if it would touch a
  // neighbour), and so on until no hole in the seam is wider than a cell.
  const seamFill = [];
  if (P('holefill', '1') === '1') {
    const inkB = new Uint8Array(BW * BH);
    const occA = new Int32Array(BW * BH);
    const markInk = (r) => { for (let k = 0; k < r.n; k++) { const i = r.xs[k] - bx0, j = r.ys[k] - by0; if (i >= 0 && j >= 0 && i < BW && j < BH) { inkB[j * BW + i] = 1; occA[j * BW + i] = 1; } } };
    glyphRec.forEach((g) => markInk(g.r));
    gridKeep.forEach((q) => q.r && markInk(q.r));
    const zoneOut = Math.max(...glyphRec.map((g) => g.outer)) + 2 * cell;
    const seq = glyphSeq(SEED + 7777, 400);
    const banned = [];
    const hit = (r) => { const off = disc(GAP); for (let k = 0; k < r.n; k++) { const i = r.xs[k] - bx0, j = r.ys[k] - by0; if (i < 8 || j < 8 || i >= BW - 8 || j >= BH - 8) continue; const b = j * BW + i; for (let o = 0; o < off.length; o++) if (occA[b + off[o]]) return true; } return false; };
    // only holes the rings bound (a seam hole), never the grid's own spacing
    const ringInk = new Uint8Array(BW * BH);
    glyphRec.forEach((g) => { for (let k = 0; k < g.r.n; k++) { const i = g.r.xs[k] - bx0, j = g.r.ys[k] - by0; if (i >= 0 && j >= 0 && i < BW && j < BH) ringInk[j * BW + i] = 1; } });
    const er = edt2(ringInk, BW, BH);
    for (let it = 0; it < 120; it++) {
      const e = edt2(inkB, BW, BH);
      let best = 0, bi = -1, bj = -1;
      for (let j = 0; j < BH; j += 1) for (let i = 0; i < BW; i += 1) {
        const q = j * BW + i, d = dist[q];
        if (d < D1 || d > zoneOut) continue;
        const x = bx0 + i + 0.5, y = by0 + j + 0.5;
        if (banned.some((b) => (b[0] - x) ** 2 + (b[1] - y) ** 2 < b[2] * b[2])) continue;
        const r = Math.min(Math.sqrt(e[q]), d - D1);
        if (r > best && Math.sqrt(er[q]) <= r + 3) { best = r; bi = i; bj = j; }
      }
      if (2 * best <= cell - 1) break;
      const x = bx0 + bi + 0.5, y = by0 + bj + 0.5;
      const tone = toneAt(x, y);
      let placed = null;
      if (tone) {
        const g = seq[seamFill.length % seq.length];
        let px = tone.px;
        for (let sh = 0; sh < 6 && !placed; sh++, px *= 0.9) {
          // centre the ink (not the em box) on the hole
          let r = raster(g, px, x, y, 0);
          if (!r.n) break;
          let sx = 0, sy = 0; for (let k = 0; k < r.n; k++) { sx += r.xs[k] + 0.5; sy += r.ys[k] + 0.5; }
          const cx = x + (x - sx / r.n), cy = y + (y - sy / r.n);
          r = raster(g, px, cx, cy, 0);
          if (minDistOf(r) >= D1 && !r.touch && !hit(r)) placed = { g, px, r, tone, cx, cy };
        }
      }
      if (!placed) { banned.push([x, y, best]); continue; }
      markInk(placed.r);
      const gl = { g: placed.g, px: placed.px, r: { ...placed.r, cx: placed.cx, cy: placed.cy }, tone: placed.tone, theta: 0, m: minDistOf(placed.r), id: ++uid, ring: NRINGS, loop: -1, fill: true, seam: true, outer: 0 };
      glyphRec.push(gl);
      seamFill.push(gl);
    }
  }
  /* ---------- pockets ---------- */
  // Where the outline still runs far from any ink once the ring, the rows
  // and the seam are set (the narrow wedge between the G's spur and its
  // counter, a channel's corner, a concave corner the ring passes), the free
  // disc nearest that stretch takes one small glyph: seeded, upright, its ink
  // centred on the disc, sized by the field there (never above `chcap` times
  // it) and set smaller, down to `pkmin`, until its ink keeps the clearance
  // from the outline and `pkgap` from every other glyph's ink. A pocket that
  // cannot hold even the smallest such glyph stays empty.
  const pockets = [];
  const POCKET = Number(P('pocket', 12)); // px past the clearance an outline point may sit from ink before a pocket glyph is tried
  const PKMIN = Number(P('pkmin', 0.5)); // a pocket glyph is set no smaller than this share of the field's size there (the ring's own floor)
  const PKFLOOR = Number(P('pkfloor', 14)); // nor under this many px: a smaller glyph reads as a fleck, not a character
  const PKGAP = Number(P('pkgap', TRACK));
  const PKWIN = Number(P('pkwin', 40)); // px around the starved outline point searched for the free disc
  function outlinePoints() {
    const out = [];
    for (const p of polys) for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const nx = (b[1] - a[1]) / len, ny = -(b[0] - a[0]) / len;
      for (let u = 0.5; u < len; u += 1) {
        const x = a[0] + ((b[0] - a[0]) * u) / len, y = a[1] + ((b[1] - a[1]) * u) / len;
        const o1 = exactAt(x + nx * 0.75, y + ny * 0.75), o2 = exactAt(x - nx * 0.75, y - ny * 0.75);
        if ((o1 > 0) === (o2 > 0)) continue; // an internal edge (shared by two filled pieces)
        out.push([x, y]);
      }
    }
    return out;
  }
  if (POCKET > 0) {
    const inkB = new Uint8Array(BW * BH);
    const markInk = (r) => { for (let k = 0; k < r.n; k++) { const i = r.xs[k] - bx0, j = r.ys[k] - by0; if (i >= 0 && j >= 0 && i < BW && j < BH) inkB[j * BW + i] = 1; } };
    glyphRec.forEach((g) => markInk(g.r));
    gridKeep.forEach((q) => q.r && markInk(q.r));
    const pts = outlinePoints();
    const banned = new Uint8Array(pts.length);
    const seq = glyphSeq(SEED + 5555, 400);
    let gi = 0;
    for (let it = 0; it < 60; it++) {
      const e = edt2(inkB, BW, BH);
      let worst = -1, wd = D1 + POCKET;
      for (let q = 0; q < pts.length; q++) {
        if (banned[q] || (neckBox && pts[q][0] > neckBox[0] && pts[q][0] < neckBox[2] && pts[q][1] > neckBox[1] && pts[q][1] < neckBox[3])) continue;
        const d = Math.sqrt(e[(Math.floor(pts[q][1]) - by0) * BW + (Math.floor(pts[q][0]) - bx0)]);
        if (d > wd) { wd = d; worst = q; }
      }
      if (worst < 0) break;
      const [sx, sy] = pts[worst];
      let best = -1e9, bc = null;
      const i0 = Math.floor(sx) - bx0, j0 = Math.floor(sy) - by0;
      for (let j = Math.max(0, j0 - PKWIN); j <= Math.min(BH - 1, j0 + PKWIN); j++) for (let i = Math.max(0, i0 - PKWIN); i <= Math.min(BW - 1, i0 + PKWIN); i++) {
        const q = j * BW + i, dT = distT[q];
        if (dT < D1 + 2) continue;
        const room = Math.min(Math.sqrt(e[q]) - PKGAP, dT - D1);
        if (room < 3) continue;
        const away = Math.hypot(bx0 + i + 0.5 - sx, by0 + j + 0.5 - sy);
        if (away > PKWIN) continue;
        const score = room - 0.2 * away;
        if (score > best) { best = score; bc = [bx0 + i + 0.5, by0 + j + 0.5]; }
      }
      let placed = null;
      const tone = bc && toneAt(bc[0], bc[1]);
      if (tone) {
        const pxMin = Math.max(PKFLOOR, PKMIN * tone.px);
        const pxMax = Math.max(pxMin, Math.min(CHMAX, CHCAP * tone.px));
        for (let tries = 0; tries < 8 && !placed; tries++) {
          const g = seq[(gi + tries) % seq.length];
          for (let px = pxMax; px >= pxMin - 1e-6 && !placed; px *= 0.92) {
            let r = raster(g, px, bc[0], bc[1], 0);
            if (!r.n) break;
            let mx = 0, my = 0;
            for (let k = 0; k < r.n; k++) { mx += r.xs[k] + 0.5; my += r.ys[k] + 0.5; }
            const cx = bc[0] + (bc[0] - mx / r.n), cy = bc[1] + (bc[1] - my / r.n);
            r = raster(g, px, cx, cy, 0);
            if (r.touch || minDistT(r) < D1) continue;
            let clash = false;
            for (let k = 0; k < r.n && !clash; k++) { const i = r.xs[k] - bx0, j = r.ys[k] - by0; if (i < 0 || j < 0 || i >= BW || j >= BH || e[j * BW + i] < PKGAP * PKGAP) clash = true; }
            if (!clash) placed = { g, px, r, tone, cx, cy };
          }
        }
        gi++;
      }
      if (!placed) { for (let q = 0; q < pts.length; q++) if (Math.hypot(pts[q][0] - sx, pts[q][1] - sy) < 16) banned[q] = 1; continue; }
      markInk(placed.r);
      const gl = { g: placed.g, px: placed.px, r: placed.r, tone: placed.tone, theta: 0, m: minDistOf(placed.r), id: ++uid, ring: NRINGS, loop: -2, fill: true, pocket: true, outer: 0 };
      glyphRec.push(gl);
      pockets.push(gl);
    }
  }
  const lastTarget = D1, lastBand = ringOuterMed - D1;

  /* ---------- draw ---------- */
  ground();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const q of gridKeep) {
    ctx.font = fontFor(q.px);
    ctx.fillStyle = q.c;
    ctx.fillText(q.g, q.cx, q.cy + q.px * 0.04);
  }
  const TINT = P('tint', '0') === '1';
  for (const gl of glyphRec) {
    const col = TINT ? (gl.pocket ? 'rgb(255,0,255)' : gl.channel ? 'rgb(0,200,255)' : gl.seam ? 'rgb(255,200,0)' : gl.ring === 0 ? 'rgb(255,70,70)' : 'rgb(70,230,110)') : gl.tone.fill; // debug: ring red, rows cyan, seam fill yellow, pockets magenta
    const r = raster(gl.g, gl.px, gl.r.cx, gl.r.cy, gl.theta, col);
    ctx.drawImage(GC, 0, 0, r.S, r.S, r.ix - r.H, r.iy - r.H, r.S, r.S);
  }

  /* ---------- measure ---------- */
  const report = {
    params: { cut: CUT, mark: MARKF, markWidthPx: mw, markHeightPx: +mh.toFixed(1), clear: D1, rings: NRINGS, orient: ORIENT, track: TRACK, rcap: RCAP, chtrack: CHTRACK, chcap: CHCAP, chcapv: CHCAPV, neck: NECKMODE, pocket: POCKET, pkfloor: PKFLOOR, lead: LEAD, gap: GAP, seam: SEAM, gridin: GRIDIN, seed: SEED, cell, bg: CLEAR ? 'none' : 'rgb(' + groundRGB.join(',') + ')' },
    rings: ringInfo.map((r) => ({ ring: r.ring, clearance: +r.clearance.toFixed(2), centreLine: +r.centre.toFixed(2), band: +r.band.toFixed(2), glyphs: r.glyphs, loops: r.loops.map((l) => ({ length: +l.L.toFixed(1), glyphs: l.n, track: +l.track.toFixed(2), closingGap: +l.close.toFixed(2), solved: l.solved, blocked: +l.blocked.toFixed(1), fill: l.fill })) })),
    channels: channelInfo,
    grid: { kept: gridKeep.length, secondChance: gridKeep.filter((q) => q.second).length, dropped: gridDropped, seamFill: seamFill.length, pockets: pockets.map((g) => ({ g: g.g, px: +g.px.toFixed(1), x: Math.round(g.r.cx), y: Math.round(g.r.cy) })) },
    rasters,
  };
  if (MEASURE) Object.assign(report, measure());

  if (DEBUG) {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,60,60,0.9)';
    for (const p of polys) { ctx.beginPath(); p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(60,255,120,0.8)';
    for (const l of levelLoops(D1)) { ctx.beginPath(); for (let q = 0; q < l.m; q++) (q ? ctx.lineTo(l.X[q], l.Y[q]) : ctx.moveTo(l.X[q], l.Y[q])); ctx.closePath(); ctx.stroke(); }
    ctx.restore();
  }
  report.justifyLog = window.__jlog || [];
  report.channelLog = window.__clog || [];
  window.__report = report;

  function measure() {
    const img = ctx.getImageData(bx0, by0, BW, BH).data;
    const ink = new Uint8Array(BW * BH);
    for (let q = 0; q < BW * BH; q++) {
      const k = q * 4;
      ink[q] = CLEAR ? (img[k + 3] > 0 ? 1 : 0) : (img[k] !== groundRGB[0] || img[k + 1] !== groundRGB[1] || img[k + 2] !== groundRGB[2] ? 1 : 0);
    }
    let inside = 0, inClear = 0, minD = FAR, minAt = null;
    for (let j = 0; j < BH; j++) for (let i = 0; i < BW; i++) {
      const q = j * BW + i;
      if (!ink[q]) continue;
      const d = distT[q];
      if (d < 0) inside++;
      if (d < D1) inClear++;
      if (d < minD) { minD = d; minAt = [bx0 + i, by0 + j]; }
    }
    // ring 1 per-glyph clearance, read from the canvas through each glyph's own pixels
    const canvasMin = (g) => { let m = FAR; for (let k = 0; k < g.r.n; k++) { const i = g.r.xs[k] - bx0, j = g.r.ys[k] - by0; const q = j * BW + i; if (ink[q] && distT[q] < m) m = distT[q]; } return m; };
    const r1 = glyphRec.filter((g) => g.ring === 0 && !g.centred && !g.channel).map(canvasMin);
    const rowsC = glyphRec.filter((g) => g.channel && !g.hug).map(canvasMin);
    const rowsN = glyphRec.filter((g) => g.hug).map(canvasMin);
    // ring glyphs whose true clearance exceeds the target by more than a pixel:
    // the ones that pass a channel's mouth or the neck's ends, where the ring
    // keeps the clearance from the closed shape it sees
    const ringWide = glyphRec.filter((g) => g.ring === 0 && !g.channel).map((g) => ({ g: g.g, x: Math.round(g.r.cx), y: Math.round(g.r.cy), trueClear: +canvasMin(g).toFixed(2), ringFieldClear: +g.m.toFixed(2) })).filter((q) => q.trueClear > D1 + 1);
    const r1c = glyphRec.filter((g) => g.ring === 0 && g.centred && !g.channel).map(canvasMin);
    const rch = glyphRec.filter((g) => g.channel).map(canvasMin);
    const stats = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; const mean = s.reduce((x, y) => x + y, 0) / n; const sd = Math.sqrt(s.reduce((x, y) => x + (y - mean) ** 2, 0) / n); const pct = (p) => s[Math.min(n - 1, Math.floor(p * n))]; return { n, min: +s[0].toFixed(3), p05: +pct(0.05).toFixed(3), p50: +pct(0.5).toFixed(3), p95: +pct(0.95).toFixed(3), max: +s[n - 1].toFixed(3), mean: +mean.toFixed(3), sd: +sd.toFixed(3) }; };
    // EDT of the ink (distance from each pixel centre to the nearest ink pixel centre)
    const edt = edt2(ink, BW, BH);
    // outline samples on the carve's true boundary
    const samples = [];
    const farSamples = [];
    for (const p of polys) for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const nx = (b[1] - a[1]) / len, ny = -(b[0] - a[0]) / len;
      for (let u = 0.5; u < len; u += 1) {
        const x = a[0] + ((b[0] - a[0]) * u) / len, y = a[1] + ((b[1] - a[1]) * u) / len;
        const o1 = exactAt(x + nx * 0.75, y + ny * 0.75), o2 = exactAt(x - nx * 0.75, y - ny * 0.75);
        if ((o1 > 0) === (o2 > 0)) continue; // an internal edge (shared by two filled pieces)
        const fx = x - bx0 - 0.5, fy = y - by0 - 0.5, i0 = Math.round(fx), j0 = Math.round(fy);
        // exact: search the ink pixels in a window the EDT bounds
        const rad = Math.ceil(Math.sqrt(edt[j0 * BW + i0]) + 2);
        let best = 1e18;
        for (let jj = Math.max(0, j0 - rad); jj <= Math.min(BH - 1, j0 + rad); jj++) for (let ii = Math.max(0, i0 - rad); ii <= Math.min(BW - 1, i0 + rad); ii++) {
          if (!ink[jj * BW + ii]) continue;
          const ddx = ii + 0.5 + bx0 - x, ddy = jj + 0.5 + by0 - y, d2 = ddx * ddx + ddy * ddy;
          if (d2 < best) best = d2;
        }
        samples.push(Math.sqrt(best));
        if (Math.sqrt(best) > 16) farSamples.push([Math.round(x), Math.round(y), +Math.sqrt(best).toFixed(1)]);
      }
    }
    // glyph id map for closest approaches
    const idm = new Int32Array(BW * BH);
    const ringIds = new Set();
    for (const g of glyphRec) { ringIds.add(g.id); writeOcc(idm, g.r, g.id); }
    let gid = 100000;
    for (const q of gridKeep) if (q.r) { q.id = ++gid; for (let k = 0; k < q.r.n; k++) { const i = q.r.xs[k] - bx0, j = q.r.ys[k] - by0; if (i >= 0 && j >= 0 && i < BW && j < BH && !idm[j * BW + i]) idm[j * BW + i] = q.id; } }
    let rr = FAR, rg = FAR, overlapPx = 0;
    const RAD = 10;
    for (const g of glyphRec) for (let k = 0; k < g.r.n; k++) {
      const i0 = g.r.xs[k] - bx0, j0 = g.r.ys[k] - by0;
      for (let dy = -RAD; dy <= RAD; dy++) for (let dx = -RAD; dx <= RAD; dx++) {
        const i = i0 + dx, j = j0 + dy;
        if (i < 0 || j < 0 || i >= BW || j >= BH) continue;
        const o = idm[j * BW + i];
        if (!o || o === g.id) continue;
        const d = Math.hypot(dx, dy);
        if (ringIds.has(o)) rr = Math.min(rr, d); else rg = Math.min(rg, d);
      }
    }
    // largest empty disc in the seam: centred on any point outside the clearance band,
    // bounded by the nearest ink and by the clearance line
    let gapMax = 0, gapAt = null;
    const zoneOut = lastTarget + lastBand + 2 * cell;
    for (let j = 0; j < BH; j++) for (let i = 0; i < BW; i++) {
      const q = j * BW + i, d = distT[q];
      if (d < D1 || d > zoneOut) continue;
      const r = Math.min(Math.sqrt(edt[q]), d - D1);
      if (r > gapMax) { gapMax = r; gapAt = [bx0 + i, by0 + j]; }
    }
    // every hole wider than one cell, largest first (non-overlapping)
    const holes = [];
    {
      const cand = [];
      for (let j = 0; j < BH; j += 2) for (let i = 0; i < BW; i += 2) {
        const q = j * BW + i, d = distT[q];
        if (d < D1 || d > zoneOut) continue;
        const r = Math.min(Math.sqrt(edt[q]), d - D1);
        if (2 * r > cell) cand.push([r, bx0 + i, by0 + j]);
      }
      cand.sort((a, b) => b[0] - a[0]);
      for (const c of cand) { if (holes.every((h) => Math.hypot(h[1] - c[1], h[2] - c[2]) > h[0] + c[0])) holes.push(c); if (holes.length >= 40) break; }
    }
    // the same measure on the uncarved grid (every cell, the approved draw), for scale
    const baseInk = new Uint8Array(BW * BH);
    {
      const rb = mulberry(1988);
      for (let y = 0; y < cols; y++) for (let x = 0; x < cols; x++) {
        const pS = rb(), pG = rb();
        const cx = pad + (x + 0.5) * cell, cy = pad + (y + 0.5) * cell;
        if (cx < bx0 - 40 || cx > bx1 + 40 || cy < by0 - 40 || cy > by1 + 40) continue;
        const tone = toneAt(cx, cy);
        if (!tone) continue;
        const sc_ = SCRIPTS[Math.floor(pS * SCRIPTS.length)];
        const r = raster(sc_[Math.floor(pG * sc_.length)], tone.px, cx, cy, 0);
        for (let k = 0; k < r.n; k++) { const i = r.xs[k] - bx0, j = r.ys[k] - by0; if (i >= 0 && j >= 0 && i < BW && j < BH) baseInk[j * BW + i] = 1; }
      }
    }
    const be = edt2(baseInk, BW, BH);
    let baseGap = 0, baseAt = null;
    for (let j = 0; j < BH; j++) for (let i = 0; i < BW; i++) {
      const q = j * BW + i, d = distT[q];
      if (d < D1 || d > zoneOut) continue;
      const r = Math.sqrt(be[q]);
      if (r > baseGap) { baseGap = r; baseAt = [bx0 + i, by0 + j]; }
    }
    // slivers and orphans: placed glyphs (rings, channels, seam fill) that are
    // tiny, and any glyph near the mark with no neighbour within 1.5 cells
    const placedAll = [...glyphRec.map((g) => ({ x: g.r.cx, y: g.r.cy, px: g.px, kind: g.channel ? 'channel' : g.seam ? 'seam' : 'ring' })), ...gridKeep.filter((q) => q.r).map((q) => ({ x: q.cx, y: q.cy, px: q.px, kind: 'grid' }))];
    const tiny = glyphRec.filter((g) => g.px < 0.3 * cell).map((g) => ({ g: g.g, px: +g.px.toFixed(1), x: Math.round(g.r.cx), y: Math.round(g.r.cy) }));
    const isolated = placedAll.filter((a) => !placedAll.some((b) => b !== a && (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < (1.5 * cell) ** 2)).map((a) => ({ kind: a.kind, x: Math.round(a.x), y: Math.round(a.y) }));
    const sizes = (k) => { const a = glyphRec.filter((g) => (k === 'channel' ? g.channel : k === 'seam' ? g.seam : !g.channel && !g.seam)).map((g) => g.px); return a.length ? { n: a.length, min: +Math.min(...a).toFixed(1), max: +Math.max(...a).toFixed(1) } : null; };
    return {
      orphans: { tinyPlacedGlyphs: tiny, isolatedGlyphs: isolated, fontPx: { ring: sizes('ring'), channel: sizes('channel'), seam: sizes('seam') } },
      summary: {
        inkPixelsInsideCarve: inside,
        inkPixelsInsideClearance: inClear,
        minInkToOutlinePx: +minD.toFixed(3),
        ring1ClearanceMinPx: r1.length ? +Math.min(...r1).toFixed(3) : null,
        ring1ClearanceMaxPx: r1.length ? +Math.max(...r1).toFixed(3) : null,
        largestEmptyDiscInSeamPx: +(2 * gapMax).toFixed(1),
        uncarvedGridLargestEmptyDiscPx: +(2 * baseGap).toFixed(1),
        closestRingToRingPx: +rr.toFixed(2),
        closestRingToGridPx: +rg.toFixed(2),
      },
      minInkAt: minAt,
      ring1Clearance: r1.length ? stats(r1) : null,
      ring1CentredInNecks: r1c.length ? stats(r1c) : null,
      channelClearance: rch.length ? stats(rch) : null,
      channelRowClearance: rowsC.length ? stats(rowsC) : null,
      neckRowClearance: rowsN.length ? stats(rowsN) : null,
      ringWideAtMouths: ringWide,
      outlineToNearestInk: stats(samples),
      outlineSamples: samples.length,
      outlineFarFromInk: (() => { const cl = []; for (const f of farSamples) { const c = cl.find((q) => Math.hypot(q[0] - f[0], q[1] - f[1]) < 40); if (c) { c[2] = Math.max(c[2], f[2]); c[3]++; } else cl.push([f[0], f[1], f[2], 1]); } return cl; })(),
      seamGap: { largestEmptyDiscDiameterPx: +(2 * gapMax).toFixed(2), at: gapAt, zone: [D1, +zoneOut.toFixed(1)], uncarvedGridSameZonePx: +(2 * baseGap).toFixed(2), uncarvedAt: baseAt, holesOverOneCell: holes.map((h) => [+(2 * h[0]).toFixed(1), h[1], h[2]]) },
    };
  }
}

// Exact squared Euclidean distance transform (Felzenszwalb and Huttenlocher)
// to the nearest set pixel.
function edt2(mask, w, h) {
  const INF = 1e20;
  const f = new Float64Array(Math.max(w, h));
  const d = new Float64Array(Math.max(w, h));
  const v = new Int32Array(Math.max(w, h));
  const z = new Float64Array(Math.max(w, h) + 1);
  const out = new Float64Array(w * h);
  for (let q = 0; q < w * h; q++) out[q] = mask[q] ? 0 : INF;
  const pass1 = (n) => {
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  };
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = out[y * w + x]; pass1(h); for (let y = 0; y < h; y++) out[y * w + x] = d[y]; }
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = out[y * w + x]; pass1(w); for (let x = 0; x < w; x++) out[y * w + x] = d[x]; }
  return out;
}
