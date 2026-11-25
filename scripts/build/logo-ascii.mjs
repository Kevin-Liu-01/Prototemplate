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
 * The renderer is scripts/lib/ascii-sphere.mjs, which pnpm
 * build:ascii-armillary shares.
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

import { apply, camera, gridOf, R, shadedRows } from '../lib/ascii-sphere.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

const CHECK = process.argv.includes('--check');
const OUT = 'src/components/brand/GtLogoAscii.frames.ts';
const C = JSON.parse(readFileSync(join(ROOT, 'scripts/build/logo-ascii.json'), 'utf8'));
const { SPHERE, meridianPoint, latitudePoint, easeInOut } = await import(new URL('../../src/components/brand/GtLogoArmillary.frame.ts', import.meta.url).href);

const { cols: NC, rows: NR, cu, cv } = gridOf(C);

const [cx0, cy0] = SPHERE.centre;
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

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** One frame's glyph rows at ring angles a and g: the lines turned to the camera, the far side hidden. */
function frame(a, g) {
  const M = camera(C.pose);
  return shadedRows(
    C,
    lines(a, g)
      .map((p) => apply(M, p))
      .filter((p) => p[2] >= C.depth)
  );
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
