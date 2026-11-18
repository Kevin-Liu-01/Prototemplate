#!/usr/bin/env node
/* oxlint-disable no-console -- a build step reporting to stdout. */
/**
 * Writes src/components/brand/GtLogoAscii.frames.ts, the ASCII loader's
 * frames, from scripts/build/logo-ascii.json and the sphere model in
 * src/components/brand/GtLogoArmillary.frame.ts (the logo's lines read as
 * rings on a sphere).
 *
 * Each frame turns the meridian and the latitude on the sphere, turns the
 * whole sphere to the camera's pose, hides what lies on the far side and
 * sets the logo in a 45 by 21 character grid: a cell takes a glyph from the
 * ramp when enough of its 4 by 8 sample points lie within half a line of a
 * drawn line or the ring, its level the coverage times the Lambert shade
 * (the sphere's normal for the inner lines, the outline's for the ring),
 * and the glyph the ramp's entry past as many of the json's cuts as the
 * level reaches, cuts set so the still's glyphs fall in the reference's
 * shares. The numbers were fitted to the reference rendering's measured
 * glyph map.
 * Frame 0 is the still: the rings at rest. The lap holds the still, then
 * both rings turn once at 24 frames a second, easing in and out, and land on
 * the still again. Only the glyph rows are written; the component lays the
 * dot screen in the hole's empty cells at runtime.
 *
 * It prints the still's agreement with the reference glyph map (glyph or no
 * glyph, inside the ring's hole and on the ring).
 *
 * Usage:
 *   node scripts/build/logo-ascii.mjs           (pnpm build:logo-ascii)
 *   node scripts/build/logo-ascii.mjs --check   exit 1 when the frames file differs from what this writes
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

const CHECK = process.argv.includes('--check');
const OUT = 'src/components/brand/GtLogoAscii.frames.ts';
const C = JSON.parse(readFileSync(join(ROOT, 'scripts/build/logo-ascii.json'), 'utf8'));
const { SPHERE, meridianPoint, latitudePoint, easeInOut } = await import(new URL('../../src/components/brand/GtLogoArmillary.frame.ts', import.meta.url).href);

const DEG = Math.PI / 180;
const { cols: NC, rows: NR } = C.grid;
const [PX, PY] = C.grid.pxPerUnit;
const [CXP, CYP] = C.grid.centrePx;
const [CW, CH] = C.grid.cellPx;
const [X0, Y0] = C.grid.firstCellCentrePx;
/** cell centres in logo units from the sphere's centre, y down */
const cu = (c) => (X0 + CW * c - CXP) / PX;
const cv = (r) => (Y0 + CH * r - CYP) / PY;
const cellU = CW / PX;
const cellV = CH / PY;

/** the camera: yaw about the vertical, pitch about the horizontal, roll about the view axis (Rz Rx Ry) */
function camera({ yaw, pitch, roll }) {
  const [cy, sy, cp, sp, cr, sr] = [Math.cos(yaw * DEG), Math.sin(yaw * DEG), Math.cos(pitch * DEG), Math.sin(pitch * DEG), Math.cos(roll * DEG), Math.sin(roll * DEG)];
  const Ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]];
  const Rx = [[1, 0, 0], [0, cp, -sp], [0, sp, cp]];
  const Rz = [[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]];
  const mul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
  return mul(Rz, mul(Rx, Ry));
}
const apply = (M, p) => [M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2], M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2], M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]];

const [cx0, cy0] = SPHERE.centre;
const R = 96.26;
/** the drawn lines at ring angles a (meridian) and g (latitude), on the sphere, from its centre: every half degree */
function lines(a, g) {
  const pts = [];
  const m = SPHERE.meridian;
  const l = SPHERE.latitude;
  for (let t = m.from; t <= m.to; t += 0.5) {
    const p = meridianPoint(t, a);
    pts.push([p.x - cx0, p.y - cy0, p.z]);
  }
  for (let t = l.from; t <= l.to; t += 0.5) {
    const p = latitudePoint(t, g);
    pts.push([p.x - cx0, p.y - cy0, p.z]);
  }
  /* the bar and the stem: the front stretches of the two edge-on circles */
  const { y: by, from: bx0 } = C.bar;
  const { x: sx, from: sy0 } = C.stem;
  for (let x = bx0; x <= 90.3; x += 0.5) pts.push([x, by, Math.sqrt(Math.max(R * R - x * x - by * by, 0))]);
  for (let y = sy0; y <= 96; y += 0.5) pts.push([sx, y, Math.sqrt(Math.max(R * R - y * y - sx * sx, 0))]);
  return pts;
}

const L = (() => {
  const v = C.light;
  const n = Math.hypot(...v);
  return v.map((x) => x / n);
})();
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** One frame's glyph rows at ring angles a and g. */
function frame(a, g) {
  const M = camera(C.pose);
  const pts = lines(a, g)
    .map((p) => apply(M, p))
    .filter((p) => p[2] >= C.depth);
  /* bucket the points by 8 units for the distance search */
  const B = 8;
  const grid = new Map();
  for (const p of pts) {
    const key = `${Math.floor(p[0] / B)},${Math.floor(p[1] / B)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(p);
  }
  const near = (u, v) => {
    const i = Math.floor(u / B);
    const j = Math.floor(v / B);
    let best = Infinity;
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        for (const p of grid.get(`${i + di},${j + dj}`) ?? []) best = Math.min(best, Math.hypot(u - p[0], v - p[1]));
      }
    }
    return best;
  };
  const rows = [];
  for (let r = 0; r < NR; r++) {
    let row = '';
    for (let c = 0; c < NC; c++) {
      const x = cu(c);
      const y = cv(r);
      let inLine = 0;
      let inRing = 0;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          const u = x + ((i + 0.5) / 4 - 0.5) * cellU * C.sample[0];
          const v = y + ((j + 0.5) / 8 - 0.5) * cellV * C.sample[1];
          if (near(u, v) < C.line) inLine++;
          else if (Math.abs(Math.hypot(u, v) - C.ringR) < C.ringLine) inRing++;
        }
      }
      const cov = (inLine + inRing) / 32;
      if (cov < C.floor) {
        row += ' ';
        continue;
      }
      const rr = Math.hypot(x, y);
      const n =
        inLine >= inRing && rr < 96
          ? [x / R, y / R, Math.sqrt(Math.max(R * R - rr * rr, 0)) / R]
          : [x / Math.max(rr, 1e-6), y / Math.max(rr, 1e-6), 0];
      const shade = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
      const gain = inLine >= inRing ? C.gain.line : C.gain.ring;
      const level = Math.min(1, cov * gain) * (C.ambient + (1 - C.ambient) * shade);
      row += C.ramp[C.cuts.filter((cut) => level >= cut).length];
    }
    rows.push(row);
  }
  return rows;
}

/* the lap: the still, then the turn at fps */
const m0 = SPHERE.meridian.rest + C.turn0.meridian;
const g0 = SPHERE.latitude.rest + C.turn0.latitude;
const still = frame(m0, g0);
const turnFrames = Math.round(C.turn * C.fps);
const turn = [];
for (let i = 1; i < turnFrames; i++) {
  const e = easeInOut(i / turnFrames);
  turn.push(frame(m0 + C.turns.meridian * e, g0 + C.turns.latitude * e));
}

/* agreement with the reference map: glyph or no glyph, in the hole and on the ring */
const ref = C.reference.map((row) => row.padEnd(NC));
let holeHit = 0;
let holeAll = 0;
let ringHit = 0;
let ringAll = 0;
for (let r = 0; r < NR; r++) {
  for (let c = 0; c < NC; c++) {
    const rr = Math.hypot(cu(c), cv(r));
    const want = ref[r][c] === '#' || ref[r][c] === '+';
    const got = still[r][c] !== ' ';
    if (rr < C.hole) {
      holeAll++;
      if (want === got) holeHit++;
    } else if (rr < SPHERE.ring + 9) {
      ringAll++;
      if (want === got) ringHit++;
    }
  }
}
const agreement = { hole: holeHit / holeAll, ring: ringHit / ringAll };

/* the dot screen: the hole's cells under the Bayer threshold; the component drops the ones that hold a glyph */
const dots = [];
for (let r = 0; r < NR; r++) {
  let row = '';
  for (let c = 0; c < NC; c++) row += Math.hypot(cu(c), cv(r)) < C.hole && BAYER[r % 4][c % 4] < C.dots ? '.' : ' ';
  dots.push(row);
}

/* rows are stored once each and frames as indices into them */
const table = [];
const index = new Map();
const ids = (rows) =>
  rows.map((row) => {
    if (!index.has(row)) {
      index.set(row, table.length);
      table.push(row);
    }
    return index.get(row);
  });
const stillIds = ids(still);
const turnIds = turn.map(ids);

const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const text = [
  '/* Written by pnpm build:logo-ascii (scripts/build/logo-ascii.mjs) from scripts/build/logo-ascii.json. Do not edit by hand. */',
  '',
  '/**',
  ' * The ASCII loader\'s frames: the logo turned on its sphere and set in a',
  ` * ${NC} by ${NR} character grid. \`rows\` holds every distinct row once; \`still\` is`,
  ' * the rest frame and each of `turn` one frame of the rings\' turn, as',
  ' * indices into `rows`. `dots` is the dot screen of the ring\'s hole, which',
  ' * the loader shows in the cells no glyph takes.',
  ' */',
  'export const GT_LOGO_ASCII = {',
  `  cols: ${NC},`,
  `  rows: ${NR},`,
  `  fps: ${C.fps},`,
  `  hold: ${C.hold},`,
  `  ramp: ${q(C.ramp)},`,
  `  agreement: { hole: ${agreement.hole.toFixed(3)}, ring: ${agreement.ring.toFixed(3)} },`,
  `  table: [\n${table.map((row) => `    ${q(row)},`).join('\n')}\n  ] as readonly string[],`,
  `  still: [${stillIds.join(', ')}] as readonly number[],`,
  `  turn: [\n${turnIds.map((f) => `    [${f.join(', ')}],`).join('\n')}\n  ] as readonly (readonly number[])[],`,
  `  dots: [\n${dots.map((row) => `    ${q(row)},`).join('\n')}\n  ] as readonly string[],`,
  '} as const;',
  '',
].join('\n');

const path = join(ROOT, OUT);
let old = null;
try {
  old = readFileSync(path, 'utf8');
} catch {
  old = null;
}
console.log(`build-logo-ascii: still agrees with the reference in ${(agreement.hole * 100).toFixed(1)}% of the hole's cells and ${(agreement.ring * 100).toFixed(1)}% of the ring's; ${turn.length + 1} frames, ${table.length} distinct rows`);
if (CHECK) {
  if (old !== text) {
    console.error(`build-logo-ascii: ${OUT} is stale; run pnpm build:logo-ascii`);
    process.exit(1);
  }
} else if (old !== text) {
  writeFileSync(path, text);
  console.log(`build-logo-ascii: wrote ${OUT}`);
}
if (process.argv.includes('--print')) console.log(still.map((row, r) => row.split('').map((ch, c) => (ch === ' ' && dots[r][c] === '.' ? '.' : ch)).join('')).join('\n'));
