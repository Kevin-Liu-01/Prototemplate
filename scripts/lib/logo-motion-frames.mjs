// Measures frames of the live logo motion (src/components/brand/GtLogoMotion.tsx)
// for scripts/lint/logo-motion.test.mjs, and for any other run that draws the
// component to frames (a video's frames, say): which pixels a moving line
// may change in a frame, the ring that must never change, and the meridian's
// width, its pixels and where its two cut faces stand.
//
// A frame is one channel of a screenshot (Uint8Array, row by row) and a box:
// where the logo's drawn box (G.viewBox) sits in it and how many pixels wide
// it is. Lengths are in the logo's units unless they say px.
//
//   frameBox(px, ox, oy, width)    a box px wide at (ox, oy) in a frame width wide
//   inkOf(frame, box, theme)       each box pixel's ink, 0 for paper to 1 for ink
//   browserTable(...), arcTable()  a path's place along it by theta, as the
//                                  browser measures it or by arc length
//   lineMap(box, path)             each box pixel's nearest point on a path: its
//                                  length along the path and its distance
//   band(map, from, to, half)      the pixels within half of the path between two lengths
//   ringZones(box, sector)         the ring's core and its inner edge outside the
//                                  sectors where a line merges into it
//   frameRule(...)                 what a frame should be, given its dashes: the
//                                  logo, or the end pose where the meridian is
//                                  undrawn, but round what moves
//   meridianIn(...)                the meridian's pixels off its ellipse, its
//                                  width (meridianWidth) and its cut faces (faceAt)
//   stepRule(steps)                a move starts and lands without a pop or a hold
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT } from './root.mjs';

const { logo: M } = JSON.parse(readFileSync(join(ROOT, 'scripts/build/logo-motion.json'), 'utf8'));
const { R, A, w } = M;
const C = 128;
const DEG = Math.PI / 180;
export const THEMES = { light: { paper: '#ffffff', ink: '#070707' }, dark: { paper: '#070707', ink: '#f2f2f0' } };
const level = (hex) => parseInt(hex.slice(1, 3), 16);

/** the logo's drawn box in a frame: px wide, its top left at (ox, oy), in a frame width pixels wide */
export function frameBox(px, ox = 0, oy = 0, width = px, viewBox = '24.3 24.3 207.4 207.4') {
  const [vx, vy, vw] = viewBox.split(' ').map(Number);
  const scale = px / vw;
  return {
    px,
    ox,
    oy,
    width,
    scale,
    /** units per pixel */
    unit: 1 / scale,
    /** a box pixel's centre in units */
    u: (x, y) => [vx + (x + 0.5) / scale, vy + (y + 0.5) / scale],
    /** a point in units to frame pixels (fractional) */
    p: (ux, uy) => [ox + (ux - vx) * scale - 0.5, oy + (uy - vy) * scale - 0.5],
    at: (x, y) => (oy + y) * width + ox + x,
  };
}

/** each box pixel's ink, 0 (paper) to 1 (ink), from one channel of a frame */
export function inkOf(frame, box, theme) {
  const paper = level(THEMES[theme].paper);
  const ink = level(THEMES[theme].ink);
  const out = new Float32Array(box.px * box.px);
  for (let y = 0; y < box.px; y++) for (let x = 0; x < box.px; x++) out[y * box.px + x] = (frame[box.at(x, y)] - paper) / (ink - paper);
  return out;
}

/** the box's pixels of a frame, as one Uint8Array box.px square */
export function crop(frame, box) {
  const out = new Uint8Array(box.px * box.px);
  for (let y = 0; y < box.px; y++) for (let x = 0; x < box.px; x++) out[y * box.px + x] = frame[box.at(x, y)];
  return out;
}

/* ------------------------------------------------------------ the lines */
/** the logo's two ellipses by theta: the meridian (0 the north pole, 90 the right) and the latitude (0 the left node, 90 the top) */
export const LINES = {
  meridian: { at: (t) => [C + A * Math.sin(t * DEG), C - R * Math.cos(t * DEG)], d1: (t) => [A * Math.cos(t * DEG), R * Math.sin(t * DEG)], guess: (x, y) => Math.atan2((x - C) / A, (C - y) / R) / DEG },
  latitude: { at: (t) => [C - R * Math.cos(t * DEG), C - A * Math.sin(t * DEG)], d1: (t) => [R * Math.sin(t * DEG), -A * Math.cos(t * DEG)], guess: (x, y) => Math.atan2((C - y) / A, (C - x) / R) / DEG },
};

/** the arc length table of a line from t0 to t1, as the generator builds it (0.01 degree steps), and its inverse */
export function arcTable(lineId, t0, t1) {
  const L = LINES[lineId];
  const m = Math.ceil((t1 - t0) / 0.01);
  const S = new Float64Array(m + 1);
  let p = L.at(t0);
  for (let i = 1; i <= m; i++) {
    const q = L.at(t0 + ((t1 - t0) * i) / m);
    S[i] = S[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1]);
    p = q;
  }
  const s = (t) => {
    const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0))) * m;
    const i = Math.min(m - 1, Math.floor(u));
    return S[i] + (S[i + 1] - S[i]) * (u - i);
  };
  const theta = (len) => {
    let lo = 0;
    let hi = m;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (S[mid] <= len) lo = mid;
      else hi = mid;
    }
    const f = (len - S[lo]) / (S[hi] - S[lo] || 1);
    return t0 + ((t1 - t0) * (lo + f)) / m;
  };
  return { length: S[m], s, theta, t0, t1, lineId };
}

/**
 * a path's table from the browser's own measure of it: points the browser
 * puts at even steps along the path (getPointAtLength), with the length a
 * dash counts there (the path's pathLength over the steps), so a pixel's
 * place along the path is where the browser draws a dash's end, not where
 * an arc length table puts it
 */
export function browserTable(lineId, t0, t1, points, pathLength) {
  const L = LINES[lineId];
  const n = points.length - 1;
  const T = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    let t = L.guess(...points[i]);
    while (t < (i ? T[i - 1] - 180 : t0 - 1)) t += 360;
    while (t > (i ? T[i - 1] + 180 : t0 + 359)) t -= 360;
    T[i] = t;
  }
  const s = (t) => {
    if (t <= T[0]) return 0;
    if (t >= T[n]) return pathLength;
    let lo = 0;
    let hi = n;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (T[mid] <= t) lo = mid;
      else hi = mid;
    }
    return ((lo + (t - T[lo]) / (T[hi] - T[lo])) * pathLength) / n;
  };
  const theta = (len) => {
    const u = Math.min(n, Math.max(0, (len / pathLength) * n));
    const i = Math.min(n - 1, Math.floor(u));
    return T[i] + (T[i + 1] - T[i]) * (u - i);
  };
  return { length: pathLength, s, theta, t0, t1, lineId };
}

/**
 * each box pixel's nearest point on a path (an arcTable or a browserTable): its length along
 * the path (NaN off the path's ends) and its distance, for pixels within
 * reach units of the line
 */
export function lineMap(box, path, reach = 32) {
  const L = LINES[path.lineId];
  const n = box.px * box.px;
  const s = new Float32Array(n).fill(NaN);
  const d = new Float32Array(n).fill(Infinity);
  for (let y = 0; y < box.px; y++) {
    for (let x = 0; x < box.px; x++) {
      const [ux, uy] = box.u(x, y);
      let t = L.guess(ux, uy);
      for (let k = 0; k < 8; k++) {
        const [px, py] = L.at(t);
        const [dx, dy] = L.d1(t);
        const g = (px - ux) * dx + (py - uy) * dy;
        const [qx, qy] = L.at(t + 0.01);
        const [ex, ey] = L.d1(t + 0.01);
        const g2 = (qx - ux) * ex + (qy - uy) * ey;
        const slope = (g2 - g) / 0.01;
        if (!slope) break;
        t -= g / slope;
      }
      const [px, py] = L.at(t);
      const dist = Math.hypot(px - ux, py - uy);
      if (dist > reach) continue;
      let tt = t;
      while (tt < path.t0 - 1e-6) tt += 360;
      while (tt >= path.t0 + 360) tt -= 360;
      const i = y * box.px + x;
      d[i] = dist;
      s[i] = tt <= path.t1 + 1e-6 ? path.s(tt) : NaN;
    }
  }
  return { s, d, path };
}

/** the box pixels within half of a path between two lengths along it (a dash and its stroke's half width) */
export function band(map, from, to, half) {
  const out = new Uint8Array(map.s.length);
  if (!(to > from)) return out;
  for (let i = 0; i < out.length; i++) if (map.d[i] <= half && map.s[i] >= from && map.s[i] <= to) out[i] = 1;
  return out;
}

/** a region grown by r pixels (square) */
export function grow(region, px, r) {
  let cur = region;
  for (const [dx, dy] of [
    [1, 0],
    [0, 1],
  ]) {
    const next = new Uint8Array(cur.length);
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        let on = 0;
        for (let k = -r; k <= r && !on; k++) {
          const xx = x + dx * k;
          const yy = y + dy * k;
          if (xx >= 0 && yy >= 0 && xx < px && yy < px) on = cur[yy * px + xx];
        }
        next[y * px + x] = on;
      }
    }
    cur = next;
  }
  return cur;
}
export const or = (...regions) => regions.reduce((a, b) => a.map((v, i) => v | b[i]));
export const not = (region) => region.map((v) => (v ? 0 : 1));

/* ------------------------------------------------------------ the ring */
/**
 * the ring's pixels that no frame may change: its core (from gap units past
 * its inner edge outward, through its outer edge) everywhere, and its inner
 * edge (gap units either side) outside the sectors round the poles and the
 * nodes, sector degrees either side of each, where a line merges into it.
 * gap is where the masks stop (the geometry's free.edge, half its width);
 * the free zone is drawn with crisp edges, so it may stop half a pixel
 * short, and the zones leave that half pixel out.
 */
export function ringZones(box, sector, gap) {
  const rIn = R - w / 2;
  const m = gap - 0.5 * box.unit;
  const core = new Uint8Array(box.px * box.px);
  const edge = new Uint8Array(box.px * box.px);
  for (let y = 0; y < box.px; y++) {
    for (let x = 0; x < box.px; x++) {
      const [ux, uy] = box.u(x, y);
      const r = Math.hypot(ux - C, uy - C);
      const a = ((Math.atan2(uy - C, ux - C) / DEG) % 90 + 90) % 90;
      const i = y * box.px + x;
      if (r >= rIn + gap + 0.5 * box.unit) core[i] = 1;
      else if (r > rIn - m && a > sector + 1 && a < 90 - sector - 1) edge[i] = 1;
    }
  }
  return { core, edge };
}

/* ------------------------------------------------------------ the meridian */
/** ink sampled at a point in units, bilinear */
export function sample(ink, box, ux, uy) {
  const [fx, fy] = box.p(ux, uy);
  const x0 = Math.floor(fx - box.ox);
  const y0 = Math.floor(fy - box.oy);
  const tx = fx - box.ox - x0;
  const ty = fy - box.oy - y0;
  const v = (x, y) => (x >= 0 && y >= 0 && x < box.px && y < box.px ? ink[y * box.px + x] : 0);
  return (1 - ty) * ((1 - tx) * v(x0, y0) + tx * v(x0 + 1, y0)) + ty * ((1 - tx) * v(x0, y0 + 1) + tx * v(x0 + 1, y0 + 1));
}
const unitNormal = (lineId, t) => {
  const [dx, dy] = LINES[lineId].d1(t);
  const l = Math.hypot(dx, dy);
  return [-dy / l, dx / l];
};
/** the ink width across the meridian at theta t (degrees), in units: the ink of `ink` less the ink of `under` (what else is there), summed across the line within reach */
export function meridianWidth(ink, under, box, t, reach = 10) {
  const [cx, cy] = LINES.meridian.at(t);
  const [nx, ny] = unitNormal('meridian', t);
  const step = box.unit / 4;
  let sum = 0;
  for (let o = -reach; o <= reach; o += step) {
    const ux = cx + nx * o;
    const uy = cy + ny * o;
    sum += Math.max(0, Math.min(1, sample(ink, box, ux, uy)) - Math.max(0, Math.min(1, sample(under, box, ux, uy)))) * step;
  }
  return sum;
}
/**
 * where a cut face of the meridian stands, measured along a line offset
 * from the meridian by `offset` units (positive outward): the ink of `ink`
 * less the ink of `under`, summed from the theta `inside` (in the line's
 * ink) to `outside` (past the face, in the gap), as a length along that
 * offset line from `inside`. The face's position is that length.
 */
export function faceAt(ink, under, box, inside, outside, offset) {
  const at = (t) => {
    const [cx, cy] = LINES.meridian.at(t);
    const [nx, ny] = unitNormal('meridian', t);
    return [cx + nx * offset, cy + ny * offset];
  };
  const n = Math.ceil(Math.abs(outside - inside) / 0.01);
  let len = 0;
  let prev = at(inside);
  for (let i = 1; i <= n; i++) {
    const t = inside + ((outside - inside) * i) / n;
    const p = at(t);
    const ds = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    const mid = [(p[0] + prev[0]) / 2, (p[1] + prev[1]) / 2];
    len += Math.max(0, Math.min(1, sample(ink, box, ...mid)) - Math.max(0, Math.min(1, sample(under, box, ...mid)))) * ds;
    prev = p;
  }
  return len;
}

/* ------------------------------------------------------------ a frame against the rule */
/**
 * The checks a frame of the motion must pass, for one framing: `maps` are
 * lineMap()s of the meridian's, the latitude's and the lap's paths, `zone`
 * the pixels the meridian's undrawn dash may take (its dash inside its
 * zone), `rest` and `pose` the still logo and the draw-back's end pose,
 * `half` each channel's dash half width, `near` how many units round a
 * moving end may change. A frame's dashes are { meridian, under, fill,
 * head, lap }, each { len, off } along its path.
 */
export function frameRule({ maps, zone, rest, pose, half, near, slack }) {
  /** the meridian's undrawn stretch in a frame: its dash inside its zone */
  const undrawn = (dash) => {
    const m = dash?.meridian;
    if (!m || m.len <= 0) return null;
    const b = band(maps.meridian, m.off, m.off + m.len, half.meridian);
    return b.map((v, i) => v & zone[i]);
  };
  /** the pixels a frame may change: round the meridian's moving end, and under the loader's lap dashes that are not empty */
  const moving = (dash) => {
    const parts = [];
    const m = dash?.meridian;
    if (m && m.len > 0 && m.off > 0) parts.push(band(maps.meridian, m.off - near, m.off + near, half.meridian + near));
    for (const c of ['under', 'fill', 'head']) {
      const d = dash?.[c];
      if (d && d.len > 0) parts.push(band(maps.latitude, d.off - near, d.off + d.len + near, half[c] + near));
    }
    const l = dash?.lap;
    if (l && l.len > 0) parts.push(band(maps.lap, l.off - near, l.off + l.len + near, half.lap + near));
    return parts.length ? or(...parts) : null;
  };
  /**
   * a frame's pixels against what it should be: the logo where the meridian
   * is drawn, the end pose where it is undrawn or once the draw-back has
   * run, any value where a line moves. A pixel within one of the undrawn
   * stretch's edge is split by the mask there, so it may be any blend of
   * the two.
   */
  const against = (frame, dash, afterDrawBack) => {
    const u = afterDrawBack ? null : undrawn(dash);
    const px = Math.round(Math.sqrt(frame.length));
    const seam = u ? grow(u, px, 1).map((v, i) => v & (u[i] ? grow1Out(u, px, i) : 1)) : null;
    const free = moving(dash);
    let n = 0;
    let worst = 0;
    let at = -1;
    for (let i = 0; i < frame.length; i++) {
      if (free && free[i]) continue;
      if (seam && seam[i]) {
        const lo = Math.min(rest[i], pose[i]) - slack;
        const hi = Math.max(rest[i], pose[i]) + slack;
        if (frame[i] >= lo && frame[i] <= hi) continue;
      }
      const want = afterDrawBack || (u && u[i]) ? pose[i] : rest[i];
      const d = Math.abs(frame[i] - want);
      if (d > slack) {
        n++;
        if (d > worst) {
          worst = d;
          at = i;
        }
      }
    }
    return { n, worst, at };
  };
  return { undrawn, moving, against };
}

/** whether pixel i of a region has a neighbour (of eight) outside it */
function grow1Out(region, px, i) {
  const x = i % px;
  const y = (i - x) / px;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < px && yy < px && !region[yy * px + xx]) return 1;
    }
  }
  return 0;
}

/** the meridian's thetas where its ink can be measured alone: nothing of the end pose lies within 12 units across it */
export function cleanThetas(poseInk, box) {
  const out = [];
  for (let t = 2; t < 360; t += 2) {
    const [cx, cy] = LINES.meridian.at(t);
    const [nx, ny] = unitNormal('meridian', t);
    let clear = true;
    for (let o = -12; o <= 12 && clear; o += 0.25) {
      const [px, py] = box.p(cx + nx * o, cy + ny * o);
      const x = Math.round(px - box.ox);
      const y = Math.round(py - box.oy);
      if (x < 0 || y < 0 || x >= box.px || y >= box.px || poseInk[y * box.px + x] > 0.02) clear = false;
    }
    if (clear) out.push(t);
  }
  return out;
}

/** the bottom (lower right, behind the lower arc) and the top (upper right) cut faces of the meridian: thetas to sum its ink from and to, and three lines along it */
export const FACES = { bottom: { inside: 147, outside: 120 }, top: { inside: 393, outside: 420 } };
export const FACE_LINES = [-4, 0, 4];

/** the meridian in a frame: the pixels it adds (ink over `inkAt`) on the end pose's paper (ink under `paperAt`) off its ellipse, its width at the clean thetas `shown` picks, and its two faces */
export function meridianIn({ ink, poseInk, box, lapMap, lapHalf, clean, shown, paperAt = 0.02, inkAt = 0.1 }) {
  let off = 0;
  for (let i = 0; i < ink.length; i++) if (poseInk[i] < paperAt && ink[i] > inkAt && !(lapMap.d[i] <= lapHalf)) off++;
  const widths = clean.filter(shown).map((t) => ({ t, w: meridianWidth(ink, poseInk, box, t) }));
  const faces = Object.fromEntries(Object.entries(FACES).map(([k, f]) => [k, FACE_LINES.map((o) => faceAt(ink, poseInk, box, f.inside, f.outside, o))]));
  return { off, widths, faces };
}

/** a move's steps (changed-pixel counts): its first and last steps are no larger than their neighbours, and nothing inside holds still */
export function stepRule(n) {
  const idx = n.map((v, i) => [v, i]).filter(([v]) => v > 0);
  if (idx.length < 2) return { ok: true, line: `steps ${n.join(', ')}` };
  const [i0, i1] = [idx[0][1], idx.at(-1)[1]];
  const inside = n.slice(i0, i1 + 1);
  const holds = inside.map((v, k) => [v, i0 + k]).filter(([v]) => v === 0).map(([, k]) => k);
  const ok = inside[0] <= inside[1] && inside.at(-1) <= inside.at(-2) && holds.length === 0;
  return { ok, line: `first steps ${inside.slice(0, 3).join(', ')}; last steps ${inside.slice(-3).join(', ')}; still steps inside the move at ${holds.join(', ') || 'none'} (of ${n.length})` };
}
