// Writes the live logo motion from its numbers: the hover (the meridian
// draws back along its oval) and the loader (the same draw-back once, then a
// line runs once round the meridian and the G draws off and back on once
// round the equator), drawn with SVG and CSS alone.
//
//   src/components/brand/GtLogoMotion.geometry.ts  the drawing: the logo's
//       path (LOGO in src/lib/logo.ts) and the strokes and masks that move
//       over it
//   src/components/brand/GtLogoMotion.css          the keyframes and the
//       rules that pick them by mode
//
// It reads scripts/build/logo-motion.json: the logo's measures, and per beat
// a table of where each moving end stands at 240 samples a second.
//
// THE RULE: whatever is not being drawn or undrawn is the logo itself. The
// motion layer paints the logo's own path, and a mask takes it away only
// where a line has been undrawn; there the logo without that line shows
// through instead. Every frame is the sum of these layers, each masked so
// the masks add to one at every point (the layers add with plus-lighter in
// an isolated group), so where a mask is empty the frame is the logo's own
// path, pixel for pixel, and a hand-off between the rest layer and the
// motion layer changes nothing.
//
//   keep    the logo, where nothing is undrawn, and always on the ring
//   bare    the logo without its meridian (the bar from its free end, the
//           stem and the C closed across its breaks), where the meridian
//           has been undrawn: inside the meridian's zone, the band its ink
//           and the C's breaks round it occupy, and nowhere else
//   under   the bar alone, where the G has been undrawn on its lap; the
//           stem is cut there as the logo cuts it round the G
//   fill    the bar and the stem whole, where the G has been undrawn far
//           enough from its ends that the logo's gap round it closes
//   head    the bar and the latitude's stroke, where the G's head runs on
//           past its tip round the oval on its lap (from a unit inside the
//           tip, where the logo and the stroke agree, so no seam shows at
//           the tip's face)
//   lap     the line that runs round the meridian, drawn over the rest,
//           off the ring
//
// The ring is never redrawn (THE RING below): no mask reaches it, so it is
// the logo's own path in every frame, except the inner edge a line leaves
// where it merged into the ring, at the poles and the nodes. The dashes run
// on their paths' own lengths, with no pathLength: Chrome scales a
// pathLength dash by a coarser measure of the path than it dashes by, which
// put a dash's end up to half a unit short of where its numbers say.
//
// Each mask is a dash of a wide stroke along its line, so a moving end is
// square to the line and every other edge of a mask lies where the two
// layers on either side of it agree. The meridian's dash starts past the
// logo's cut face and ends past its join, so it eats the face and the join
// from the logo itself, and the G's lap starts on the logo's G and lands on
// it again. plus-lighter adds the layers' colors as well as their
// coverage, so no two layers may overlap: the masks partition the frame
// (fill, then head, then under, then bare and keep). Nothing eases the
// weight: everything is drawn at the logo's measures. The keyframes keep
// only the samples a straight line between their neighbours misses by more
// than TOL units, small enough that no frame's step along a dash differs
// from the course's by more than a quarter. The module also exports the
// course itself (COURSE) for scripts/lint/logo-motion.test.mjs.
//
// Never edit the two files by hand; edit this script or the numbers and
// rerun. --check writes nothing and fails when either file differs from
// what it would write. Usage: pnpm build:logo-motion [--check]
/* oxlint-disable no-console -- a generator reporting what it wrote. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

const { LOGO } = await import(new URL('../../src/lib/logo.ts', import.meta.url).href);
const SRC = JSON.parse(readFileSync(join(ROOT, 'scripts/build/logo-motion.json'), 'utf8'));
const OUT_TS = 'src/components/brand/GtLogoMotion.geometry.ts';
const OUT_CSS = 'src/components/brand/GtLogoMotion.css';
const check = process.argv.includes('--check');

const { R, A, w, h, gapLeft, axisAbove, axisBelow, meridianStart, meridianEnd, latitudeStart, gEnd, barLeft, cGapEnd } = SRC.logo;
const { gTail0, gHead0 } = SRC.source;
const { hover: HOVER_S, beats, rate } = SRC.timing;
const LOOP_S = beats.D1 + beats.R1 + beats.D2 + beats.R2;
const C = 128;
const DEG = Math.PI / 180;
/** units: a keyframe is kept where dropping it moves a dash end more than this */
const TOL = 0.03;
/** a snap's two stops stand this far apart, as a fraction of the animation (0.001%) */
const STEP = 1e-5;
/** units: how far a zone reaches past the ink it stands for, so its edge lies where the logo and the logo without the line agree */
const REACH = 1;
/** units: how far the meridian's zone and the G's undrawn band reach past the line's ink, so in a sector they reach past the ring's inner edge */
const BAND = 1.5;
/** degrees: the meridian's dash runs this far past each of the logo's cut faces, so it starts and ends on paper */
const PAST = 0.5;
/** units: the G's undrawn stretch runs this far past the tip once the tail has passed it, so no edge of it lies on the tip's face */
const PAST_TIP = 2;
/** units: the head's mask starts this far inside the tip while the head is out, where the logo's G and the stroke agree */
const HEAD_IN = 1;

const f3 = (n) => {
  const v = Math.round(n * 1000) / 1000;
  return Object.is(v, -0) ? '0' : String(v);
};
const lerp = (a, b, k) => a + (b - a) * k;
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/* ------------------------------------------------------------ the two ellipses */
const LINES = {
  meridian: { at: (t) => [C + A * Math.sin(t * DEG), C - R * Math.cos(t * DEG)], rx: A, ry: R },
  latitude: { at: (t) => [C - R * Math.cos(t * DEG), C - A * Math.sin(t * DEG)], rx: R, ry: A },
};

/**
 * A stretch of a line from t0 to t1 (increasing theta, clockwise on screen)
 * as arcs of at most ARC degrees, with its arc length table. Chrome draws an
 * SVG arc as cubics of up to 90 degrees each, which at this size stand up to
 * 0.03 units off the ellipse, enough to show against the logo's own edges;
 * pieces of 30 degrees keep that under 0.0001.
 */
const ARC = 30;
function arc(lineId, t0, t1) {
  const L = LINES[lineId];
  const n = Math.ceil((t1 - t0) / ARC - 1e-9);
  let d = `M${L.at(t0).map(f3).join(' ')}`;
  for (let i = 1; i <= n; i++) d += `A${f3(L.rx)} ${f3(L.ry)} 0 0 1 ${L.at(t0 + ((t1 - t0) * i) / n).map(f3).join(' ')}`;
  const step = 0.01;
  const m = Math.ceil((t1 - t0) / step);
  const S = new Float64Array(m + 1);
  let p = L.at(t0);
  for (let i = 1; i <= m; i++) {
    const q = L.at(t0 + ((t1 - t0) * i) / m);
    S[i] = S[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1]);
    p = q;
  }
  const s = (t) => {
    const u = clamp01((t - t0) / (t1 - t0)) * m;
    const i = Math.min(m - 1, Math.floor(u));
    return S[i] + (S[i + 1] - S[i]) * (u - i);
  };
  return { d, length: S[m], s };
}

/* the paths the dashes run on: the meridian from just before the logo's
   join behind the lower arc (126) through the south pole, the left and the
   north pole to just past its cut face above the upper arc (414); the
   latitude once round from the right node (180), where the logo's G starts
   under the ring and the bar; the meridian whole from the north pole, for
   the lap */
const TH_MIN = meridianStart[1] - PAST;
const TH_MAX = meridianEnd[1] + PAST;
const MER = arc('meridian', TH_MIN, TH_MAX);
const LAT = arc('latitude', latitudeStart, latitudeStart + 360);
const LAP = arc('meridian', 0, 360);

/* ------------------------------------------------------------ the dashes over time */
const table = (rows, x) => {
  const u = clamp01(x) * (rows.length - 1);
  const i = Math.min(rows.length - 2, Math.floor(u));
  const a = rows[i];
  const b = rows[i + 1];
  return Array.isArray(a) ? a.map((v, j) => v + (b[j] - v) * (u - i)) : a + (b - a) * (u - i);
};
/** a dash from length a to length b along its path; an empty one keeps its place */
const span = (a, b) => ({ len: Math.max(0, b - a), off: a });
const NONE = { len: 0, off: 0 };
/** an empty dash at a place: an empty channel stays where its dash appears and leaves, so no interpolation between keyframes sweeps it along its path */
const none = (off) => ({ len: 0, off });

/* the meridian on hover: the undrawn stretch runs from the moving end to
   past the cut face. The end follows the source's course (hoverEnd, which
   ran from the face's inner corner to a unit short of the join's), scaled
   to run from past the face's outer corner to past the join's, so it eats
   the face and the join off the logo itself as it goes */
const HOVER = SRC.tables.hoverEnd;
function meridianBack(x) {
  const p = (HOVER[0] - table(HOVER, x)) / (HOVER[0] - HOVER.at(-1));
  return span(MER.s(lerp(TH_MAX, TH_MIN, p)), MER.length);
}

/* the G's lap: the source's two ends on its own course and clock. The
   source's G started at gTail0, under the ring and the bar above the right
   node, where the logo's G does not reach: the tail runs the source's
   course unchanged until it reaches the logo's G at the right node (180),
   so the lap starts with the source's own ease, then is stretched evenly so
   it lands one lap on at the right node; the head is moved to leave the
   logo's tip and land on it one lap on. */
const TAIL_STRETCH = 360 / (gTail0 + 360 - latitudeStart);
const tailAt = (t) => latitudeStart + Math.max(0, t - latitudeStart) * TAIL_STRETCH;
const HEAD_SHIFT = gEnd - gHead0;
const S_TIP = LAT.s(gEnd);
const AXIS = (axisAbove + axisBelow) / 2;
/* where the stem's band crosses the lower arc, as lengths along the latitude */
const STEM_HALF = Math.asin(h / R) / DEG;
const STEM_BAND = [LAT.s(270 - STEM_HALF), LAT.s(270 + STEM_HALF)];
const MINW = 0.3 * w;
const SNAP = 0.05;
/* the stem's fill across its cut: the undrawn stretch less the logo's gap
   at each end. Where an end of the fill stands in the stem's band, the
   source's rule against slivers holds: a strip of fill narrower than MINW
   is dropped and a strip of cut narrower than MINW is filled, so the stem
   never shows a hairline of ink or of paper as the G's ends pass it. */
function stemFill(a, b) {
  let c0 = a + AXIS;
  let c1 = b - AXIS;
  let snap = '';
  const [b0, b1] = STEM_BAND;
  if (c0 > b0 && c0 < b1) {
    if (c0 - b0 < MINW) [c0, snap] = [b0 - SNAP, `${snap}a`];
    else if (b1 - c0 < MINW && c1 >= b1) [c0, snap] = [b1 + SNAP, `${snap}b`];
  }
  if (c1 > b0 && c1 < b1) {
    if (b1 - c1 < MINW) [c1, snap] = [b1 + SNAP, `${snap}c`];
    else if (c1 - b0 < MINW && c0 <= b0) [c1, snap] = [b0 - SNAP, `${snap}d`];
  }
  return c1 > c0 ? { ...span(c0, c1), snap } : { ...none(a + AXIS), snap };
}
/* one moment of the G's lap, x from 0 to 1: the drawn stroke is [tail,
   head]. On its first lap the head runs past the tip round the mouth to
   the right node (the head's mask, from HEAD_IN inside the tip until the
   tail passes there); on its second it draws the logo's G back from the
   right node and lands on the tip as the lap ends. The undrawn stretch of
   the logo's G lies between that and the tail, and runs on PAST_TIP past
   the tip once the tail has passed it, so no edge of it lies on the tip's
   face while the head is away. */
function gLap(x) {
  const [t, hd] = table(SRC.tables.gLap, x);
  const tail = LAT.s(Math.min(latitudeStart + 360, tailAt(t)));
  const head = hd + HEAD_SHIFT;
  const drawnBack = head > latitudeStart + 360 ? LAT.s(head - 360) : 0;
  const from = drawnBack;
  const to = Math.min(tail, S_TIP + PAST_TIP);
  const headAt = head > latitudeStart + 360 ? LAT.length : LAT.s(head);
  return {
    under: to > from ? span(from, to) : none(from),
    fill: stemFill(from, Math.min(tail, S_TIP)),
    head: headAt > S_TIP ? span(Math.max(tail, S_TIP - HEAD_IN), headAt) : none(S_TIP - HEAD_IN),
  };
}
const G0 = beats.D1 + beats.R1;
/* outside its lap each channel is empty where its dash appears (before the
   lap) or leaves (after it), so no interpolation between keyframes sweeps a
   dash along the G */
const gAt = (t) => {
  if (t > G0 && t < G0 + beats.D2) return gLap((t - G0) / beats.D2);
  const after = t >= G0 + beats.D2;
  return { under: none(after ? S_TIP : 0), fill: { ...none(after ? S_TIP + AXIS : AXIS), snap: '' }, head: none(S_TIP - HEAD_IN) };
};
function lapAt(t) {
  if (t >= beats.D1) return { len: 0, off: LAP.length };
  const [tail, head] = table(SRC.tables.meridianLap, t / beats.D1);
  return span(LAP.s(tail), LAP.s(head));
}

/* ------------------------------------------------------------ keyframes */
/** samples of fn over seconds at the source's rate, simplified to the stops a straight line between neighbours cannot stand for */
function stops(fn, seconds) {
  const n = Math.round(seconds * rate);
  const raw = [];
  for (let i = 0; i <= n; i++) raw.push({ t: i / n, ...fn((seconds * i) / n) });
  /* a snap is a step: find its time between the two samples and keep a stop
     on each side of it, STEP apart, so the step is not drawn as a slide */
  const pts = [];
  const add = (p) => {
    if (!pts.length || p.t > pts.at(-1).t) pts.push(p);
  };
  for (let i = 0; i <= n; i++) {
    const a = raw[i - 1];
    const b = raw[i];
    if (a && (a.snap ?? '') !== (b.snap ?? '')) {
      let lo = a.t;
      let hi = b.t;
      for (let k = 0; k < 40; k++) {
        const m = (lo + hi) / 2;
        if ((fn(seconds * m).snap ?? '') === (a.snap ?? '')) lo = m;
        else hi = m;
      }
      const t1 = Math.min(b.t, Math.ceil(hi / STEP) * STEP);
      const t0 = Math.max(a.t, t1 - STEP);
      add({ t: t0, ...fn(seconds * t0) });
      add({ t: t1, ...fn(seconds * t1) });
    }
    add(b);
  }
  const last = pts.length - 1;
  const keep = new Set([0, last]);
  const walk = (i, j) => {
    let worst = -1;
    let at = -1;
    for (let k = i + 1; k < j; k++) {
      const u = (pts[k].t - pts[i].t) / (pts[j].t - pts[i].t);
      const e = Math.max(Math.abs(lerp(pts[i].len, pts[j].len, u) - pts[k].len), Math.abs(lerp(pts[i].off, pts[j].off, u) - pts[k].off));
      if (e > worst) {
        worst = e;
        at = k;
      }
    }
    if (worst > TOL) {
      keep.add(at);
      walk(i, at);
      walk(at, j);
    }
  };
  walk(0, last);
  return [...keep].sort((a, b) => a - b).map((i) => pts[i]);
}
const f2 = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? '0' : String(v);
};
const pct = (t) => `${f3(t * 100)}%`;
/** keyframes that set one channel's two custom properties, its dash's length and its start along the path, in px (the svg's units) */
function keyframes(name, channel, fn, seconds) {
  const rows = stops(fn, seconds).map((p) => `  ${pct(p.t)} { --gt-logo-${channel}: ${f2(p.len)}px; --gt-logo-${channel}-at: ${f2(p.off)}px; }`);
  return `@keyframes ${name} {\n${rows.join('\n')}\n}`;
}

/**
 * The hover as transitions: one property's course over the draw-back as a
 * linear() easing, its progress from the rest value to the hovered one at
 * the stops a straight line between neighbours cannot stand for. `back` is
 * the same course run backward in time, for the leave. A property that does
 * not move returns null.
 */
function easing(fn, seconds, back = false) {
  const n = Math.round(seconds * rate);
  const v = [];
  for (let i = 0; i <= n; i++) v.push(fn((seconds * i) / n));
  const range = v[n] - v[0];
  if (Math.abs(range) < 1e-6) return null;
  let pts = v.map((y, i) => ({ t: i / n, p: (y - v[0]) / range }));
  if (back) pts = pts.map(({ t, p }) => ({ t: 1 - t, p: 1 - p })).reverse();
  const tol = TOL / Math.abs(range);
  const keep = new Set([0, n]);
  const walk = (i, j) => {
    let worst = -1;
    let at = -1;
    for (let k = i + 1; k < j; k++) {
      const e = Math.abs(lerp(pts[i].p, pts[j].p, (pts[k].t - pts[i].t) / (pts[j].t - pts[i].t)) - pts[k].p);
      if (e > worst) {
        worst = e;
        at = k;
      }
    }
    if (worst > tol) {
      keep.add(at);
      walk(i, at);
      walk(at, j);
    }
  };
  walk(0, n);
  const stopsOf = [...keep].sort((a, b) => a - b).map((i) => `${+pts[i].p.toFixed(4)} ${f3(pts[i].t * 100)}%`);
  return `linear(${stopsOf.join(', ')})`;
}

/* ------------------------------------------------------------ the drawing */
/* the logo without its meridian, as plain parts: the bar from its free end
   to the ring, the stem from the bar to the ring, and the C (the latitude's
   left half) whole across the breaks the meridian cut (closedC). It shows
   only inside the meridian's zone, so no other part is needed. */
const rect = (x0, y0, x1, y1) => `M${f3(x0)} ${f3(y0)}H${f3(x1)}V${f3(y1)}H${f3(x0)}Z`;
const BAR = rect(C + barLeft, C - h, C + R, C + h);
const STEM = rect(C - h, C, C + h, C + R);
/* the meridian's zone: its band reaching BAND past its ink; the latitude's
   band from each crossing across the gap where the C breaks round the
   meridian, to REACH past the gap's far face; less
   the latitude's band near the meridian's two ends, which stand a gap off
   the lower and the upper arc. Each piece is a stroke, so its edge lies
   past the ink it stands for, where the logo and the logo without the
   meridian agree. */
/* where the meridian crosses the latitude on the left: cos t = sqrt((1 - k^2) / (1 / k^2 - k^2)), k = A / R */
const k = A / R;
const CROSS = Math.acos(Math.sqrt((1 - k * k) / (1 / (k * k) - k * k))) / DEG;
const CROSSINGS = [360 - CROSS, 360 + CROSS];
/* each break runs from the crossing to REACH past the far corner of the C's cut face across the gap */
const reachDeg = (t) => REACH / (Math.hypot(R * Math.sin(t * DEG), A * Math.cos(t * DEG)) * DEG);
const BREAKS = [
  [CROSSINGS[0], cGapEnd[0] + reachDeg(cGapEnd[0])],
  [cGapEnd[1] - reachDeg(cGapEnd[1]), CROSSINGS[1]],
];
/* the latitude's theta under each of the meridian's ends (the meridian's x there, on the arc it stands a gap from) */
const latUnder = (merTheta, upper) => {
  const x = LINES.meridian.at(merTheta)[0];
  const t = Math.acos((C - x) / R) / DEG;
  return upper ? t : 360 - t;
};
const END_HALF = 20;
const ENDS = [latUnder(meridianEnd[1], true), latUnder(meridianStart[1], false)];
/* units: the meridian's dash reaches this far either side of its line, past every point of its zone (the breaks' far
   corners lie furthest from it), so the dash's sides never cut the zone and only the zone's own edges bound it */
const DASH_HALF = (() => {
  let far = 0;
  for (const [t0, t1] of BREAKS) {
    for (let t = t0; t <= t1; t += 0.1) {
      const [px, py] = LINES.latitude.at(t);
      const [dx, dy] = [R * Math.sin(t * DEG), -A * Math.cos(t * DEG)];
      const l = Math.hypot(dx, dy);
      for (const o of [-(h + BAND), h + BAND]) {
        const q = [px - (dy / l) * o, py + (dx / l) * o];
        let near = Infinity;
        for (let m = 0; m < 360; m += 0.05) {
          const [mx, my] = LINES.meridian.at(m);
          near = Math.min(near, Math.hypot(mx - q[0], my - q[1]));
        }
        far = Math.max(far, near);
      }
    }
  }
  return Math.ceil(far + 1);
})();
const ZONE = {
  band: { d: arc('meridian', TH_MIN - 3, TH_MAX + 3).d, width: +f3(w + 2 * BAND) },
  breaks: { d: BREAKS.map(([t0, t1]) => arc('latitude', t0, t1).d).join(''), width: +f3(w + 2 * BAND) },
  ends: { d: ENDS.map((t) => arc('latitude', t - END_HALF, t + END_HALF).d).join(''), width: +f3(w + 2 * BAND) },
};

/* the C closed across its breaks, as a filled outline along the
   latitude's two edges from 20 degrees before each crossing to 3 past its
   break. Wherever the logo has a piece of the C's edge the outline takes
   that piece itself, so where the zone joins the closed C to the logo's
   (across the C, one unit past each gap and past the meridian's band) both
   draw the very same edge; across the gap and under the meridian it runs on
   the edge itself (the line offset by half the width), a point every half
   degree. */
function closedC() {
  const DEG_STEP = 0.5;
  const edge = (t, o) => {
    const [px, py] = LINES.latitude.at(t);
    const [dx, dy] = [R * Math.sin(t * DEG), -A * Math.cos(t * DEG)];
    const l = Math.hypot(dx, dy);
    return [px - (dy / l) * o, py + (dx / l) * o];
  };
  /* a point's nearest theta on the latitude and its signed offset there */
  const place = ([x, y]) => {
    let best = [Infinity, 0];
    for (let t = 0; t < 360; t += 0.05) {
      const [px, py] = LINES.latitude.at(t);
      const d = Math.hypot(px - x, py - y);
      if (d < best[0]) best = [d, t];
    }
    let t = best[1];
    for (let k = 0; k < 6; k++) {
      const f = (u) => {
        const [px, py] = LINES.latitude.at(u);
        const [dx, dy] = [R * Math.sin(u * DEG), -A * Math.cos(u * DEG)];
        return (px - x) * dx + (py - y) * dy;
      };
      const g = (f(t + 1e-4) - f(t - 1e-4)) / 2e-4;
      if (g) t -= f(t) / g;
    }
    const [px, py] = LINES.latitude.at(t);
    const [dx, dy] = [R * Math.sin(t * DEG), -A * Math.cos(t * DEG)];
    const o = ((x - px) * -dy + (y - py) * dx) / Math.hypot(dx, dy);
    return { t: ((t % 360) + 360) % 360, o };
  };
  const pieces = logoSegments()
    .filter((g) => g.cmd === 'C')
    .map((g) => ({ g, a: place(g.a), b: place(g.b) }))
    .filter(({ a, b }) => Math.abs(Math.abs(a.o) - h) < 0.02 && Math.abs(Math.abs(b.o) - h) < 0.02 && Math.sign(a.o) === Math.sign(b.o));
  const fmt = (pt) => pt.map(f3).join(' ');
  /* a logo piece run from its end at theta from to its other end */
  const run = ({ g, a, b }, forward) => (forward ? `C${[g.p.slice(0, 2), g.p.slice(2, 4), g.p.slice(4, 6)].map(fmt).join(' ')}` : `C${[g.p.slice(2, 4), g.p.slice(0, 2), g.a].map(fmt).join(' ')}`);
  const line = (t0, t1, o, from, to) => {
    const n = Math.max(1, Math.ceil(Math.abs(t1 - t0) / DEG_STEP));
    const pts = Array.from({ length: n - 1 }, (_, i) => edge(t0 + ((t1 - t0) * (i + 1)) / n, o));
    return [...pts, to].map((pt) => `L${fmt(pt)}`).join('');
  };
  const piece = (w0, w1) => {
    const unwrap = (t) => {
      let u = t;
      while (u < w0 - 180) u += 360;
      while (u > w0 + 180) u -= 360;
      return u;
    };
    /* one edge from w0 to w1 (forward) or back: the logo's pieces on that side inside the window, and the edge between them */
    const side = (sign) =>
      pieces
        .filter((q) => Math.sign(q.a.o) === sign)
        .map((q) => {
          const [ta, tb] = [unwrap(q.a.t), unwrap(q.b.t)];
          return ta < tb ? { q, t0: ta, t1: tb, start: q.g.a, end: q.g.b, fwd: true } : { q, t0: tb, t1: ta, start: q.g.b, end: q.g.a, fwd: false };
        })
        .filter((r) => r.t0 >= w0 && r.t1 <= w1)
        .sort((x, y) => x.t0 - y.t0);
    const outer = side(1);
    const inner = side(-1);
    let d = `M${fmt(edge(w0, h))}`;
    let at = w0;
    let pt = edge(w0, h);
    for (const r of outer) {
      d += line(at, r.t0, h, pt, r.start);
      d += run(r.q, r.fwd);
      [at, pt] = [r.t1, r.end];
    }
    d += line(at, w1, h, pt, edge(w1, h));
    d += `L${fmt(edge(w1, -h))}`;
    [at, pt] = [w1, edge(w1, -h)];
    for (const r of [...inner].reverse()) {
      d += line(at, r.t1, -h, pt, r.end);
      d += run(r.q, !r.fwd);
      [at, pt] = [r.t0, r.start];
    }
    d += line(at, w0, -h, pt, edge(w0, -h));
    return `${d}Z`;
  };
  return piece(CROSSINGS[0] - 20, BREAKS[0][1] + 3) + piece(BREAKS[1][0] - 3, CROSSINGS[1] + 20);
}

/* THE RING. The ring is never redrawn: every mask stops short of it, so the
   ring is the logo's own path in every frame. Only where a line merges into
   the ring (the meridian at the two poles, the latitude at the two nodes)
   does a mask reach past the ring's inner edge, into the ring's ink, so the
   inner edge the undrawn line leaves behind is drawn; everywhere else a mask
   stops RING_GAP inside that edge. A sector is where the line's ink comes
   within SECTOR_AT of the inner edge; a band of BAND past the line's ink
   then reaches past the edge by at least BAND - SECTOR_AT, and outside the
   sectors the line's ink stands at least SECTOR_AT - RING_GAP clear of
   where the masks stop, so no mask's soft edge lies on a soft edge of the
   ring or of an undrawn line. Inside the sectors the inner edge comes from
   \`ring.d\`: the logo's own outer contour and its own inner-edge pieces,
   with arcs of the same circle where the logo has none. */
const R_IN = R - w / 2;
/** units: where the masks stop, inside the ring's inner edge, and past it in a sector */
const RING_GAP = 0.4;
/** units: a sector holds every point where a line's ink comes within this of the ring's inner edge */
const SECTOR_AT = 0.8;
/* the sector's half angle on screen: the latitude's (and, turned a quarter, the meridian's) ink within SECTOR_AT of the inner edge */
const SECTOR = (() => {
  const r = R_IN - SECTOR_AT - w / 2;
  const t = Math.acos(Math.sqrt((r * r - A * A) / (R * R - A * A)));
  return Math.atan2(A * Math.sin(t), R * Math.cos(t)) / DEG;
})();
/* the logo's ring as one path: its outer contour verbatim, and an inner
   circle made of the logo's own inner-edge pieces with arcs between them */
/** the logo's path as segments: each subpath's index, its ends a and b, its points and its text */
function logoSegments() {
  const toks = LOGO.d.match(/[MCLQZ]|-?\d*\.?\d+/g);
  const segs = [];
  let i = 0;
  let cmd = '';
  let cur = [0, 0];
  let first = [0, 0];
  let sub = -1;
  const num = () => +toks[i++];
  while (i < toks.length) {
    if (/[A-Z]/.test(toks[i])) cmd = toks[i++];
    if (cmd === 'M') {
      cur = [num(), num()];
      first = cur;
      sub++;
      segs.push({ sub, text: `M${cur.map(f3).join(' ')}` });
      cmd = 'L';
    } else if (cmd === 'Z') {
      segs.push({ sub, text: 'Z' });
      cur = first;
    } else {
      const n = { C: 6, Q: 4, L: 2 }[cmd];
      const p = Array.from({ length: n }, num);
      segs.push({ sub, a: cur, b: p.slice(-2), p, cmd, text: `${cmd}${p.map(f3).join(' ')}` });
      cur = p.slice(-2);
    }
  }
  return segs;
}
function ringPath() {
  const segs = logoSegments();
  const outer = segs.filter((s) => s.sub === 0).map((s) => s.text).join('');
  const rOf = (p) => Math.hypot(p[0] - C, p[1] - C);
  const angOf = (p) => ((Math.atan2(p[1] - C, p[0] - C) / DEG) % 360 + 360) % 360;
  /* the logo's inner-edge pieces, each running clockwise to anticlockwise (falling angle) */
  const pieces = segs
    .filter((s) => s.a && s.text[0] === 'C' && Math.abs(rOf(s.a) - R_IN) < 0.02 && Math.abs(rOf(s.b) - R_IN) < 0.02)
    .map((s) => ({ s, a0: angOf(s.a), a1: angOf(s.a) - ((angOf(s.a) - angOf(s.b) + 360) % 360) }))
    .sort((x, y) => y.a0 - x.a0);
  const arcTo = (a0, a1) => {
    const t0 = a0 * DEG;
    const t1 = a1 * DEG;
    const q = (4 / 3) * Math.tan((t1 - t0) / 4);
    const P = (t) => [C + R_IN * Math.cos(t), C + R_IN * Math.sin(t)];
    const p0 = P(t0);
    const p3 = P(t1);
    const c1 = [p0[0] - q * R_IN * Math.sin(t0), p0[1] + q * R_IN * Math.cos(t0)];
    const c2 = [p3[0] + q * R_IN * Math.sin(t1), p3[1] - q * R_IN * Math.cos(t1)];
    return `C${[...c1, ...c2, ...p3].map(f3).join(' ')}`;
  };
  let d = `M${pieces[0].s.a.map(f3).join(' ')}`;
  let at = pieces[0].a0;
  const order = [...pieces, { a0: pieces[0].a0 - 360, s: null }];
  for (const p of order) {
    let target = p.a0;
    while (target > at + 1e-6) target -= 360;
    while (at - target > 1e-3) {
      const next = Math.max(target, Math.ceil(at / 30 - 1 - 1e-9) * 30);
      d += arcTo(at, next);
      at = next;
    }
    if (!p.s) break;
    d += p.s.text;
    at = p.a1;
  }
  return `${outer}${d}Z`;
}
/* where no mask reaches (in the masks, drawn in the colour that keeps the logo): the ring from RING_GAP past its inner edge, and outside the sectors from RING_GAP inside it */
const OUTER = 140;
const NODES = [0, 90, 180, 270];
const FREE = {
  sector: +f3(SECTOR),
  ring: { r: +f3((R_IN + RING_GAP + OUTER) / 2), width: +f3(OUTER - R_IN - RING_GAP) },
  edge: {
    d: NODES.map((n) => {
      const a0 = (n + SECTOR) * DEG;
      const a1 = (n + 90 - SECTOR) * DEG;
      const P = (a) => [C + R_IN * Math.cos(a), C + R_IN * Math.sin(a)].map(f3).join(' ');
      return `M${P(a0)}A${f3(R_IN)} ${f3(R_IN)} 0 0 1 ${P(a1)}`;
    }).join(''),
    width: +f3(2 * RING_GAP),
  },
};

/* ------------------------------------------------------------ the files */
const HEAD = `/* Written by pnpm build:logo-motion (scripts/build/logo-motion.mjs) from scripts/build/logo-motion.json. Do not edit by hand. */`;

const geometry = {
  viewBox: LOGO.viewBox,
  rest: { d: LOGO.d, fillRule: LOGO.fillRule },
  width: w,
  ring: { cx: C, cy: C, r: R, d: ringPath() },
  free: FREE,
  bar: BAR,
  stem: STEM,
  c: closedC(),
  meridian: { d: MER.d, length: +f3(MER.length), width: 2 * DASH_HALF, from: +f3(TH_MIN), to: +f3(TH_MAX) },
  zone: ZONE,
  latitude: { d: LAT.d, length: +f3(LAT.length), from: latitudeStart, to: latitudeStart + 360 },
  under: { width: +f3(w + 2 * BAND) },
  fill: { width: +f3(w + 2 * AXIS + 2 * REACH) },
  meridianLap: { d: LAP.d, length: +f3(LAP.length), from: 0, to: 360 },
};

const ts = `${HEAD}

/**
 * The live logo motion's drawing, in the logo's 256 unit square. \`rest\` is
 * the logo itself: the still, and the layer every moving frame keeps
 * wherever nothing is undrawn, and always on the ring. \`bar\`, \`stem\` and
 * \`c\` draw the logo without its meridian where the meridian has been
 * undrawn, inside \`zone\` (a mask of strokes: \`band\` and \`breaks\` in,
 * \`ends\` out); \`ring.d\` is the ring drawn from the logo's own outline,
 * which shows only at its inner edge where a line merged into it. \`free\`
 * is where no mask reaches: the ring, from \`free.edge\` inside its inner
 * edge outside the \`free.sector\` degrees round each pole and node.
 * \`meridian\`, \`latitude\` and \`meridianLap\` are the paths the dashes
 * run on, by theta \`from\` and \`to\` (each \`length\` is its path's own):
 * the undrawn meridian, the undrawn G (\`under\`), the stem whole across its
 * cut (\`fill\`), the G's head past its tip, and the lap line. Every
 * stroke is \`width\` wide unless it says.
 */
export const GT_LOGO_MOTION = ${JSON.stringify(geometry, null, 2).replace(/"([a-zA-Z]+)":/g, '$1:').replace(/"/g, "'")} as const;
`;

const ms = (s) => `${f3(s * 1000)}ms`;
/** a dash's gap: longer than its path, so the dash never repeats on it */
const gap = (length) => `${f3(length + 1)}px`;
const CHANNELS = [
  ['meridian', MER],
  ['under', LAT],
  ['fill', LAT],
  ['head', LAT],
  ['lap', LAP],
];
const props = CHANNELS.flatMap(([c]) => [c, `${c}-at`])
  .map((name) => `@property --gt-logo-${name} {\n  syntax: '<length>';\n  inherits: true;\n  initial-value: 0px;\n}`)
  .join('\n\n');
const start = (channel, { len, off }) => `  --gt-logo-${channel}: ${f2(len)}px;\n  --gt-logo-${channel}-at: ${f2(off)}px;`;
const dashRules = CHANNELS.map(
  ([c, path]) => `.gt-logo-motion-${c} {\n  stroke-dasharray: var(--gt-logo-${c}) ${gap(path.length)};\n  stroke-dashoffset: calc(-1 * var(--gt-logo-${c}-at));\n}`,
).join('\n\n');
/* a hover mark moves while its link, its button or an element marked
   data-gt-logo-host is hovered or keyboard focused, while the mark itself is
   hovered, or while it is active */
const HOST = ':is(a, button, [data-gt-logo-host]):is(:hover, :focus-visible)';
const HOVERED = `:is(${HOST} .gt-logo-motion[data-mode='hover'], .gt-logo-motion[data-mode='hover']:is(:hover, [data-active]))`;
/* The hover moves the meridian's dashes' own stroke-dasharray and
   stroke-dashoffset by transitions, not the custom properties on the svg:
   WebKit (Safari 26) runs a transition of a registered custom property but
   paints the var() that reads it at its end value, so there the hover
   jumped. The svg's custom properties change at once on enter and on
   leave, and each dash follows on the course's easing. */
/** the meridian's dash transitions: forward on enter, backward in time on leave */
const hoverTransition = (back) =>
  [
    ['stroke-dasharray', (s) => meridianBack(s / HOVER_S).len],
    ['stroke-dashoffset', (s) => -meridianBack(s / HOVER_S).off],
  ]
    .map(([name, course]) => [name, easing(course, HOVER_S, back)])
    .filter(([, ease]) => ease)
    .map(([name, ease]) => `\n    ${name} ${ms(HOVER_S)} ${ease}`)
    .join(',');
const indent = (text) => text.replace(/^(?=.)/gm, '  ');

const css = `${HEAD}

/* GtLogoMotion. The rest layer is the logo. The motion layer paints the
   same path wherever nothing is undrawn, and where a line has been undrawn
   it paints what the logo has without that line, so whatever is not moving
   is the logo pixel for pixel and the swap between the layers changes
   nothing. Its layers add (plus-lighter, in an isolated group) under masks
   that partition the frame, so no two layers overlap. Five channels move it, each two custom properties on
   the svg, a dash's length and its start along its path: the meridian
   channel the undrawn meridian, the under channel the undrawn G, the fill
   channel the stem whole across its cut, the head channel the G past its tip,
   the lap channel the line that runs round the meridian.

   A loader shows the motion layer, plays the hover's draw-back once
   (${ms(HOVER_S)}), then the two-beat lap for as long as it is mounted
   (${ms(LOOP_S)} a lap: the meridian ${ms(beats.D1)}, a rest of ${ms(beats.R1)}, the G ${ms(beats.D2)},
   a rest of ${ms(beats.R2)}). A hover mark moves the same draw-back by
   transitions while its host is hovered or keyboard focused: the svg's
   properties change at once, and the meridian's dashes' stroke-dasharray
   and stroke-dashoffset follow on the source's course as a linear() easing
   (Safari paints a transitioned custom property's var() at its end value,
   so the transitions sit on the dashes themselves); a leave runs the
   course backward in time. The rest layer hides at once on enter and shows
   again only when the leave has run. Every rule that moves or swaps a
   layer sits inside prefers-reduced-motion: no-preference, so under
   reduced motion every mode is the still logo. */

${props}

.gt-logo-motion {
  position: relative;
  display: inline-block;
  flex: none;
  line-height: 0;
  vertical-align: middle;
}

.gt-logo-motion > svg {
  display: block;
  overflow: visible;
${start('meridian', meridianBack(0))}
${start('under', NONE)}
${start('fill', NONE)}
${start('head', none(S_TIP - HEAD_IN))}
${start('lap', NONE)}
}

.gt-logo-motion-label {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

${dashRules}

.gt-logo-motion-stack {
  isolation: isolate;
}

.gt-logo-motion-add {
  mix-blend-mode: plus-lighter;
}

.gt-logo-motion-move {
  visibility: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .gt-logo-motion-move {
    display: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
${indent(`/* the loader */
.gt-logo-motion[data-mode='loader'] .gt-logo-motion-rest {
  visibility: hidden;
}

.gt-logo-motion[data-mode='loader'] .gt-logo-motion-move {
  visibility: visible;
}

.gt-logo-motion[data-mode='loader'] > svg {
  animation:
    gt-logo-meridian-back ${ms(HOVER_S)} linear both,
    gt-logo-lap ${ms(LOOP_S)} linear ${ms(HOVER_S)} infinite,
    gt-logo-under-lap ${ms(LOOP_S)} linear ${ms(HOVER_S)} infinite,
    gt-logo-fill-lap ${ms(LOOP_S)} linear ${ms(HOVER_S)} infinite,
    gt-logo-head-lap ${ms(LOOP_S)} linear ${ms(HOVER_S)} infinite;
}

/* the hover: the meridian's dashes run to the hovered values on enter and
   back on leave; the layers swap at once on enter and only after the leave */
${HOVERED} > svg {
${start('meridian', meridianBack(1))}
}

.gt-logo-motion[data-mode='hover'] .gt-logo-motion-meridian {
  transition:${hoverTransition(true)};
}

${HOVERED} .gt-logo-motion-meridian {
  transition:${hoverTransition(false)};
}

.gt-logo-motion[data-mode='hover'] .gt-logo-motion-rest {
  transition: visibility 0s linear ${ms(HOVER_S)};
}

.gt-logo-motion[data-mode='hover'] .gt-logo-motion-move {
  transition: visibility 0s linear ${ms(HOVER_S)};
}

${HOVERED} .gt-logo-motion-rest {
  visibility: hidden;
  transition: none;
}

${HOVERED} .gt-logo-motion-move {
  visibility: visible;
  transition: none;
}`)}
}

/* the draw-back: the meridian's undrawn stretch runs from past its cut
   face back round its oval to past its join */
${keyframes('gt-logo-meridian-back', 'meridian', (s) => meridianBack(s / HOVER_S), HOVER_S)}

/* the lap: a line once round the meridian, a rest, the G drawn off and back
   on once round the equator, a rest */
${keyframes('gt-logo-lap', 'lap', lapAt, LOOP_S)}

${keyframes('gt-logo-under-lap', 'under', (t) => gAt(t).under, LOOP_S)}

${keyframes('gt-logo-fill-lap', 'fill', (t) => gAt(t).fill, LOOP_S)}

${keyframes('gt-logo-head-lap', 'head', (t) => gAt(t).head, LOOP_S)}
`;

/** the moving ends' course, for the tests: each channel's dash ({ len, off }, in its path's units) at a time in seconds, the loader's lap from its own start and the draw-back from the hover's start */
export const COURSE = {
  hover: HOVER_S,
  beats,
  loop: LOOP_S,
  meridian: (s) => meridianBack(s / HOVER_S),
  lap: lapAt,
  under: (t) => gAt(t).under,
  fill: (t) => gAt(t).fill,
  head: (t) => gAt(t).head,
  lengths: { meridian: MER.length, under: LAT.length, fill: LAT.length, head: LAT.length, lap: LAP.length },
};

if (import.meta.main) {
  let stale = 0;
  for (const [rel, text] of [
    [OUT_TS, ts],
    [OUT_CSS, css],
  ]) {
    const file = join(ROOT, rel);
    let old = null;
    try {
      old = readFileSync(file, 'utf8');
    } catch {
      // a first run
    }
    if (old === text) continue;
    if (check) {
      console.error(`logo-motion: ${rel} is out of date; run pnpm build:logo-motion`);
      stale++;
      continue;
    }
    writeFileSync(file, text);
    console.log(`logo-motion: ${rel} (${(text.length / 1024).toFixed(1)} KB)`);
  }
  if (stale) process.exit(1);
}
