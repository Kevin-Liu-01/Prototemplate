// Writes the live logo motion from its numbers: the hover (the meridian
// draws back along its oval) and the loader (a line runs once round the
// meridian, then the G draws off and back on once round the equator), drawn
// with SVG and CSS alone.
//
//   src/components/brand/GtLogoMotion.geometry.ts  the drawing: the logo's
//       path (the rest frame, LOGO in src/lib/logo.ts) and the parts the
//       motion moves, each a filled outline or a stroked ellipse arc
//   src/components/brand/GtLogoMotion.css          the keyframes and the
//       rules that pick them by mode
//
// It reads scripts/build/logo-motion.json, the numbers copied once from the
// motion source the published videos on /marks/graticule were rendered
// from: the logo's measures, and per beat a table of where each moving end
// stands at 240 samples a second. The timing and the eases are the
// videos'; the weight is not. The videos ease the weight from the logo's
// 13.6 units to the state mark's 14.4 over the draw-back (the ring's
// centreline, the oval's half height and the fillet move with it) and loop
// at 14.4; this script draws every part at the logo's measures, so the
// hover's end and the loop are a little lighter than the state file. Every moving part is a stretch of an
// ellipse, the meridian's (x = A sin t, y = -R cos t) or the latitude's
// (x = -R cos t, y = -A sin t), drawn as a stroke with butt ends, so a
// stretch is a dash: its length and its offset along the arc are the two
// numbers each keyframe sets. Every gap the logo cuts round a line in front
// (the C round the meridian, the meridian behind the lower and the upper
// arc, the stem behind the lower arc) is a mask: the nearer line's own
// stroke, widened by the gap and drawn black, so a cut face follows the
// nearer line's edge exactly as the logo's does and opens or closes with
// the line that makes it. The keyframes keep only the samples a straight
// line between their neighbours misses by more than TOL units.
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

const { R, A, w, h, fillet, gapLeft, gapMer, backBelow, axisAbove, axisBelow, meridianStart, meridianEnd, latitudeStart, gEnd } = SRC.logo;
const { barLeft, tail0, head0 } = SRC.state;
const { hover: HOVER_S, beats, rate } = SRC.timing;
const LOOP_S = beats.D1 + beats.R1 + beats.D2 + beats.R2;
const C = 128;
const DEG = Math.PI / 180;
/** units: a keyframe is kept where dropping it moves a dash end more than this */
const TOL = 0.1;
/** a snap's two stops stand this far apart, as a fraction of the animation (0.001%) */
const STEP = 1e-5;

const f3 = (n) => {
  const v = Math.round(n * 1000) / 1000;
  return Object.is(v, -0) ? '0' : String(v);
};
const lerp = (a, b, k) => a + (b - a) * k;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
/** power2.inOut, the source's ease for the measures and the faces */
const p2 = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const ez = (a, b, x) => p2(clamp01((x - a) / (b - a)));

/* ------------------------------------------------------------ the two ellipses */
const LINES = {
  meridian: { at: (t) => [C + A * Math.sin(t * DEG), C - R * Math.cos(t * DEG)], rx: A, ry: R },
  latitude: { at: (t) => [C - R * Math.cos(t * DEG), C - A * Math.sin(t * DEG)], rx: R, ry: A },
};

/** A stretch of a line from t0 to t1 (increasing theta, clockwise on screen) as quarter arcs, with its arc length table. */
function arc(lineId, t0, t1) {
  const L = LINES[lineId];
  const n = Math.ceil((t1 - t0) / 90 - 1e-9);
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

/* the paths: the meridian as the logo draws it, from its start behind the
   lower arc (126) through the south pole, the left and the north pole to its
   end behind the upper arc (414); the meridian whole from the north pole; the
   latitude once round from the right node (180), where the logo's latitude
   starts under the ring and the bar. The G's lap runs past the end of that
   lap, so the component draws the latitude twice on the same path: the
   second copy shows the part of the dash that lies on the next lap. Every
   rest then lies at the same offset on the same path, and the seam between
   the two copies stays under the ring and the bar. */
const MER = arc('meridian', meridianStart[1], meridianEnd[1]);
const LAP = arc('meridian', 0, 360);
const LAT0 = latitudeStart;
const LAT_ONE = arc('latitude', LAT0, LAT0 + 360);
const LAT = {
  ...LAT_ONE,
  /** arc length from the lap's start, counting on past it for the next lap */
  s: (t) => {
    const k = Math.max(0, Math.floor((t - LAT0) / 360));
    return k * LAT_ONE.length + LAT_ONE.s(t - 360 * k);
  },
};

/* ------------------------------------------------------------ the dashes over time */
const table = (rows, x) => {
  const u = clamp01(x) * (rows.length - 1);
  const i = Math.min(rows.length - 2, Math.floor(u));
  const a = rows[i];
  const b = rows[i + 1];
  return Array.isArray(a) ? a.map((v, j) => v + (b[j] - v) * (u - i)) : a + (b - a) * (u - i);
};
/** a dash from the stretch [t0, t1] of a path; an empty stretch keeps its place */
const dash = (path, t0, t1) => ({ len: Math.max(0, path.s(t1) - path.s(t0)), off: path.s(t0) });

/* the meridian on hover: its start turns square over the first 0.3 of the
   move (the mask keeps the logo's face until then), and its end leaves the
   logo's face over the first 0.05 and then runs as the table says, back over
   the north pole, down the left, under the south pole to its start */
const FACE = meridianEnd[1] - meridianEnd[0];
function meridianBack(x) {
  const a = lerp(meridianStart[1], meridianStart[0], ez(0, 0.3, x));
  const e = table(SRC.tables.hoverEnd, x) + FACE * (1 - ez(0, 0.05, x));
  return dash(MER, a, Math.max(a, e));
}
/* the latitude on hover: whole from the right node; the G's end moves from
   the logo's to the hover state's with the measures */
const latitudeBack = (x) => dash(LAT, latitudeStart, lerp(gEnd, head0, p2(x)));

/* the G's lap: its tail leaves the right node from where the logo's
   latitude starts (180, under the ring and the bar), so over its first and
   last TAPER degrees the source's tail, which starts 10 degrees lower, is
   stretched onto that start */
const TAPER = 40;
function tailOf(t) {
  const lo = tail0 + TAPER;
  const hi = tail0 + 360 - TAPER;
  if (t <= lo) return latitudeStart + (t - tail0) * ((lo - latitudeStart) / TAPER);
  if (t >= hi) return hi + (t - hi) * ((latitudeStart + 360 - hi) / TAPER);
  return t;
}
function latitudeLoop(t) {
  const g0 = beats.D1 + beats.R1;
  if (t < g0) return dash(LAT, latitudeStart, head0);
  const [tail, head] = table(SRC.tables.gLap, (t - g0) / beats.D2);
  return dash(LAT, tailOf(tail), head);
}
function meridianLap(t) {
  if (t >= beats.D1) return { len: 0, off: LAP.length };
  const [tail, head] = table(SRC.tables.meridianLap, t / beats.D1);
  return dash(LAP, tail, head);
}
/* the stem's cut follows the latitude: its stroke, widened by the axis gap
   and run on past each end by it. Where an end of the cut stands in the
   stem's band, the source's rule against slivers holds: a strip of stem
   narrower than MINW beside the cut is cut with it, and a strip of cut
   narrower than MINW at the band's edge is filled, so the stem never shows
   a hairline of ink or of paper as the G's ends pass it. */
const AXIS = (axisAbove + axisBelow) / 2;
const MINW = 0.3 * w;
const SNAP = 0.05;
const STEM_HALF = Math.asin(h / R) / DEG;
const STEM_BANDS = [270, 630].map((t) => [LAT.s(t - STEM_HALF), LAT.s(t + STEM_HALF)]);
function stemCut({ len, off }) {
  if (len <= 0) return { len: 0, off, snap: '' };
  let c0 = off - AXIS;
  let c1 = off + len + AXIS;
  let snap = '';
  for (const [b0, b1] of STEM_BANDS) {
    if (c0 > b0 && c0 < b1) {
      if (c0 - b0 < MINW) [c0, snap] = [b0 - SNAP, `${snap}a`];
      else if (b1 - c0 < MINW && c1 >= b1) [c0, snap] = [b1 + SNAP, `${snap}b`];
    }
    if (c1 > b0 && c1 < b1) {
      if (b1 - c1 < MINW) [c1, snap] = [b1 + SNAP, `${snap}c`];
      else if (c1 - b0 < MINW && c0 <= b0) [c1, snap] = [b0 - SNAP, `${snap}d`];
    }
  }
  return { len: Math.max(0, c1 - c0), off: c0, snap };
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
  const span = v[n] - v[0];
  if (Math.abs(span) < 1e-6) return null;
  let pts = v.map((y, i) => ({ t: i / n, p: (y - v[0]) / span }));
  if (back) pts = pts.map(({ t, p }) => ({ t: 1 - t, p: 1 - p })).reverse();
  const tol = TOL / Math.abs(span);
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

/* ------------------------------------------------------------ the still parts */
/* the bar from the hover state's free end (under the meridian's band while
   the meridian is there) to the ring; the stem from the bar to the ring; the
   two fillets under the bar, each a quarter circle, sunk half a unit into the
   bar and the stem so no seam shows where they meet */
const rect = (x0, y0, x1, y1) => `M${f3(x0)} ${f3(y0)}H${f3(x1)}V${f3(y1)}H${f3(x0)}Z`;
const BAR = rect(C + barLeft, C - h, C + R, C + h);
const STEM = rect(C - h, C, C + h, C + R);
const SINK = 0.5;
const filletOf = (dir) => {
  const x = C + dir * h;
  const y = C + h;
  const r = fillet;
  return `M${f3(x + dir * r)} ${f3(y - SINK)}H${f3(x - dir * SINK)}V${f3(y + r)}H${f3(x)}A${f3(r)} ${f3(r)} 0 0 ${dir < 0 ? 0 : 1} ${f3(x + dir * r)} ${f3(y)}Z`;
};
const FILLETS = filletOf(-1) + filletOf(1);
/* the C's breaks: the meridian widened by the gap, only outside its own
   oval and left of the axis, where the C crosses it */
const BREAK_CLIP = `M0 0H${C}V256H0Z` + `M${C} ${f3(C - R)}A${f3(A)} ${f3(R)} 0 0 0 ${C} ${f3(C + R)}Z`;
/* the meridian behind the latitude at the right: the lower arc's stroke
   widened by the gap below it, the upper arc's by the gap above it */
const BACK_CUTS = [
  { d: arc('latitude', 185, 265).d, width: +f3(2 * (h + backBelow)) },
  { d: arc('latitude', 95, 175).d, width: +f3(2 * (h + gapMer)) },
];

/* ------------------------------------------------------------ the files */
const HEAD = `/* Written by pnpm build:logo-motion (scripts/build/logo-motion.mjs) from scripts/build/logo-motion.json. Do not edit by hand. */`;

const geometry = {
  viewBox: LOGO.viewBox,
  rest: { d: LOGO.d, fillRule: LOGO.fillRule },
  ring: { cx: C, cy: C, r: R, width: w },
  bar: BAR,
  stem: STEM,
  fillets: FILLETS,
  latitude: { d: LAT.d, length: +f3(LAT.length), width: w },
  meridian: { d: MER.d, length: +f3(MER.length), width: w },
  meridianLap: { d: LAP.d, length: +f3(LAP.length), width: w },
  stemCut: { width: +f3(w + 2 * AXIS) },
  breaks: { width: +f3(2 * (h + gapLeft)), clip: BREAK_CLIP },
  backCuts: BACK_CUTS,
};

const ts = `${HEAD}

/**
 * The live logo motion's drawing, in the logo's 256 unit square. \`rest\` is
 * the logo itself, the still every mode starts and ends on. The other parts
 * are the motion layer: the ring, the bar, the stem and the fillets stand
 * still; \`latitude\`, \`meridian\` and \`meridianLap\` are stroked arcs whose
 * dash GtLogoMotion.css moves (each \`length\` is its path's, set as
 * pathLength; the latitude is one lap, drawn twice so its dash can run on
 * into the next lap); \`stemCut\`, \`breaks\` and \`backCuts\` are the masks
 * that cut the logo's gaps round the nearer line.
 */
export const GT_LOGO_MOTION = ${JSON.stringify(geometry, null, 2).replace(/"([a-zA-Z]+)":/g, '$1:').replace(/"/g, "'")} as const;
`;

const ms = (s) => `${f3(s * 1000)}ms`;
/** a dash's gap: longer than its path, or for the latitude than two laps, so the dash never repeats on it */
const gap = (length) => `${f3(length + 1)}px`;
const LAT_GAP = gap(2 * LAT.length);
const stemBack = (x) => stemCut(latitudeBack(x));
const stemLoop = (t) => stemCut(latitudeLoop(t));
const props = ['meridian', 'latitude', 'stem', 'lap']
  .flatMap((c) => [c, `${c}-at`])
  .map((name) => `@property --gt-logo-${name} {\n  syntax: '<length>';\n  inherits: true;\n  initial-value: 0px;\n}`)
  .join('\n\n');
const start = (channel, { len, off }) => `  --gt-logo-${channel}: ${f2(len)}px;\n  --gt-logo-${channel}-at: ${f2(off)}px;`;
/* a hover mark moves while its link, its button or an element marked
   data-gt-logo-host is hovered or keyboard focused, while the mark itself is
   hovered, or while it is active */
const HOST = ':is(a, button, [data-gt-logo-host]):is(:hover, :focus-visible)';
const HOVERED = `:is(${HOST} .gt-logo-motion[data-mode='hover'], .gt-logo-motion[data-mode='hover']:is(:hover, [data-active]))`;
/* The hover moves each dash's own stroke-dasharray and stroke-dashoffset by
   transitions on the paths that draw it, not the custom properties on the
   svg: WebKit (Safari 26) runs a transition of a registered custom property
   but paints the var() that reads it at its end value, so there the hover
   jumped. The svg's custom properties change at once on enter and on
   leave, and each path's dash follows on its channel's easing. */
const HOVER_DASHES = [
  ['.gt-logo-motion-meridian, .gt-logo-motion-breaks', meridianBack],
  ['.gt-logo-motion-latitude', latitudeBack],
  ['.gt-logo-motion-stem-cut', stemBack],
];
/** one dash's transitions: forward on enter, backward in time on leave */
const hoverTransition = (fn, back) =>
  [
    ['stroke-dasharray', (s) => fn(s / HOVER_S).len],
    ['stroke-dashoffset', (s) => fn(s / HOVER_S).off],
  ]
    .map(([name, course]) => [name, easing(course, HOVER_S, back)])
    .filter(([, ease]) => ease)
    .map(([name, ease]) => `\n    ${name} ${ms(HOVER_S)} ${ease}`)
    .join(',');
const hoverDashes = HOVER_DASHES.map(([paths, fn]) => {
  const sel = paths.includes(',') ? `:is(${paths})` : paths;
  return `.gt-logo-motion[data-mode='hover'] ${sel} {\n  transition:${hoverTransition(fn, true)};\n}\n\n${HOVERED} ${sel} {\n  transition:${hoverTransition(fn, false)};\n}`;
}).join('\n\n');
const indent = (text) => text.replace(/^(?=.)/gm, '  ');

const css = `${HEAD}

/* GtLogoMotion. The rest layer is the logo; the motion layer draws the same
   logo from parts and moves them. Four channels move the parts, each two
   custom properties on the svg: a dash's length and its start along its
   path. The meridian channel draws the logo's meridian and the C's breaks
   round it, the latitude channel the G's stroke, the stem channel the
   stem's cut round the G's stroke, the lap channel the line that runs round
   the meridian.

   A loader shows the motion layer, plays the hover's draw-back once
   (${ms(HOVER_S)}), then the two-beat lap for as long as it is mounted
   (${ms(LOOP_S)} a lap: the meridian ${ms(beats.D1)}, a rest of ${ms(beats.R1)}, the G ${ms(beats.D2)},
   a rest of ${ms(beats.R2)}). A hover mark moves the same draw-back by
   transitions while its host is hovered or keyboard focused: the svg's
   properties change at once, and each path's stroke-dasharray and
   stroke-dashoffset follow on the source's course as a linear() easing
   (Safari paints a transitioned custom property's var() at its end value,
   so the transitions sit on the dashes themselves); a leave runs the
   course backward in time. The rest layer, the logo's own path, hides at once on
   enter and shows again only when the leave has run, so the still is the
   logo. Every rule that moves or swaps a layer sits inside
   prefers-reduced-motion: no-preference, so under reduced motion every mode
   is the still logo. */

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
${start('latitude', latitudeBack(0))}
${start('stem', stemBack(0))}
${start('lap', { len: 0, off: 0 })}
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

.gt-logo-motion-meridian,
.gt-logo-motion-breaks {
  stroke-dasharray: var(--gt-logo-meridian) ${gap(MER.length)};
  stroke-dashoffset: calc(-1 * var(--gt-logo-meridian-at));
}

/* the latitude and the stem's cut are one lap each, drawn twice: the first
   copy holds the dash on this lap, the next copy the part of it that runs on
   into the next lap */
.gt-logo-motion-latitude {
  stroke-dasharray: var(--gt-logo-latitude) ${LAT_GAP};
  stroke-dashoffset: calc(-1 * var(--gt-logo-latitude-at));
}

.gt-logo-motion-latitude[data-lap='next'] {
  stroke-dashoffset: calc(${f3(LAT.length)}px - var(--gt-logo-latitude-at));
}

.gt-logo-motion-stem-cut {
  stroke-dasharray: var(--gt-logo-stem) ${LAT_GAP};
  stroke-dashoffset: calc(-1 * var(--gt-logo-stem-at));
}

.gt-logo-motion-stem-cut[data-lap='next'] {
  stroke-dashoffset: calc(${f3(LAT.length)}px - var(--gt-logo-stem-at));
}

.gt-logo-motion-lap {
  stroke-dasharray: var(--gt-logo-lap) ${gap(LAP.length)};
  stroke-dashoffset: calc(-1 * var(--gt-logo-lap-at));
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
    gt-logo-latitude-back ${ms(HOVER_S)} linear both,
    gt-logo-stem-back ${ms(HOVER_S)} linear both,
    gt-logo-latitude-lap ${ms(LOOP_S)} linear ${ms(HOVER_S)} infinite,
    gt-logo-stem-lap ${ms(LOOP_S)} linear ${ms(HOVER_S)} infinite,
    gt-logo-meridian-lap ${ms(LOOP_S)} linear ${ms(HOVER_S)} infinite;
}

/* the hover: the dashes run to the hovered values on enter and back on
   leave; the layers swap at once on enter and only after the leave */
${HOVERED} > svg {
${start('meridian', meridianBack(1))}
${start('latitude', latitudeBack(1))}
${start('stem', stemBack(1))}
}

${hoverDashes}

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

/* the draw-back: the meridian's end runs back round its oval and the C's
   breaks close behind it; the G's end moves to the hover state's */
${keyframes('gt-logo-meridian-back', 'meridian', (s) => meridianBack(s / HOVER_S), HOVER_S)}

${keyframes('gt-logo-latitude-back', 'latitude', (s) => latitudeBack(s / HOVER_S), HOVER_S)}

${keyframes('gt-logo-stem-back', 'stem', (s) => stemBack(s / HOVER_S), HOVER_S)}

/* the lap: a line once round the meridian, a rest, the G drawn off and back
   on once round the equator, a rest */
${keyframes('gt-logo-meridian-lap', 'lap', meridianLap, LOOP_S)}

${keyframes('gt-logo-latitude-lap', 'latitude', latitudeLoop, LOOP_S)}

${keyframes('gt-logo-stem-lap', 'stem', stemLoop, LOOP_S)}
`;

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
