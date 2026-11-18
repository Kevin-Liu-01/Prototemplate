// Tests for the two turning loaders: the armillary's frames
// (src/components/brand/GtLogoArmillary.frame.ts) rest on the logo, turn
// whole turns from rest to rest with no speed at either end and project the
// logo's own ovals at rest; the ASCII loader's frames
// (src/components/brand/GtLogoAscii.frames.ts) are what pnpm
// build:logo-ascii writes, use only the ramp, start and end on the still and
// keep the dot screen in the ring's hole. Loaded through Node's type
// stripping.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { test } from 'node:test';

import { ROOT } from '../lib/root.mjs';

const F = await import(new URL('../../src/components/brand/GtLogoArmillary.frame.ts', import.meta.url).href);
const { GT_LOGO_ASCII: A } = await import(new URL('../../src/components/brand/GtLogoAscii.frames.ts', import.meta.url).href);

test('the armillary rests on the logo for its whole rest beat and at both ends of the swing', () => {
  for (const t of [0, 0.25, F.ARMILLARY_BEATS.rest, F.ARMILLARY_LAP, F.ARMILLARY_LAP + 0.5]) {
    assert.equal(F.armillaryFrame(t).moving, false, `moving at ${t} s`);
  }
  assert.equal(F.armillaryAt(0).moving, false);
  assert.equal(F.armillaryAt(1).moving, false);
  assert.equal(F.armillaryFrame(F.ARMILLARY_BEATS.rest + 0.01).moving, true);
});

test('the swing turns each ring a whole number of turns, from rest to rest, with no speed at either end', () => {
  const start = F.armillaryAngles(0);
  const end = F.armillaryAngles(1);
  assert.equal(start.meridian, F.SPHERE.meridian.rest);
  assert.equal(start.latitude, F.SPHERE.latitude.rest);
  assert.equal(((end.meridian - start.meridian) % 360 + 360) % 360, 0);
  assert.equal(((end.latitude - start.latitude) % 360 + 360) % 360, 0);
  const h = 1e-4;
  for (const u of [0, 1 - h]) {
    const speed = (F.easeInOut(u + h) - F.easeInOut(u)) / h;
    assert.ok(Math.abs(speed) < 1e-3, `ease speed ${speed} at ${u}`);
  }
});

test('at rest the rings project the logo\'s meridian and latitude ovals', () => {
  const m = F.SPHERE.meridian;
  const l = F.SPHERE.latitude;
  /* the meridian's widest point and the latitude's highest */
  const east = F.meridianPoint(90, m.rest);
  const top = F.latitudePoint(90, l.rest);
  assert.ok(Math.abs(east.x - m.cx - 51.2808) < 1e-6, `meridian rx ${east.x - m.cx}`);
  assert.ok(Math.abs(l.cy - top.y - 51.1104) < 1e-6, `latitude ry ${l.cy - top.y}`);
  /* the meridian's left half and the latitude's top half face the viewer */
  assert.ok(F.meridianPoint(270, m.rest).z > 0);
  assert.ok(F.latitudePoint(90, l.rest).z > 0);
});

test('a frame of the armillary takes under 0.25 ms', () => {
  const times = [];
  for (let i = 0; i < 400; i++) {
    const t0 = performance.now();
    F.armillaryFrame(F.ARMILLARY_BEATS.rest + (i / 400) * F.ARMILLARY_BEATS.swing);
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  assert.ok(times[200] < 0.25, `median ${times[200].toFixed(3)} ms`);
});

test('the ASCII frames are what pnpm build:logo-ascii writes', () => {
  const run = spawnSync(process.execPath, [join(ROOT, 'scripts/build/logo-ascii.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || 'pnpm build:logo-ascii --check failed');
});

test('every ASCII frame is 45 by 21 in the ramp, and the lap starts and ends on the still', () => {
  const allowed = new Set([' ', ...A.ramp]);
  for (const row of A.table) {
    assert.equal(row.length, A.cols);
    for (const ch of row) assert.ok(allowed.has(ch), `glyph ${ch}`);
  }
  for (const frame of [A.still, ...A.turn]) assert.equal(frame.length, A.rows);
  /* the turn's last frame eases into the still, so the next frame shown is the still itself */
  const last = A.turn[A.turn.length - 1].map((id) => A.table[id]);
  const still = A.still.map((id) => A.table[id]);
  const differ = last.reduce((n, row, r) => n + [...row].filter((ch, c) => ch !== still[r][c]).length, 0);
  assert.ok(differ <= 12, `the turn's last frame differs from the still in ${differ} cells`);
  assert.ok(A.agreement.hole >= 0.85, `the still agrees with the reference in ${A.agreement.hole} of the hole`);
});

test('the dot screen lies in the ring\'s hole and holds only dots', () => {
  assert.equal(A.dots.length, A.rows);
  for (const row of A.dots) {
    assert.equal(row.length, A.cols);
    assert.match(row, /^[. ]+$/);
  }
  /* the hole's edge columns stay clear */
  assert.equal(A.dots[0].trim(), '');
  assert.equal(A.dots[A.rows - 1].trim(), '');
});
