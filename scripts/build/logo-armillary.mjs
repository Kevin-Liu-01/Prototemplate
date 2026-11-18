#!/usr/bin/env node
/* oxlint-disable no-console -- a generator reporting what it wrote. */
/**
 * Writes src/components/brand/GtLogoArmillary.geometry.ts, the numbers the
 * armillary loader (GtLogoArmillary.tsx) draws its Open and Close beats
 * from: the lap's beats and the rings' turns from the `armillary` block of
 * scripts/build/logo-motion.json, and the courses of the four channels
 * GtLogoMotion's loader layers move by (the meridian's undrawn stretch, the
 * G's undrawn stretch, the stem's fill across it and the G's head), taken
 * from scripts/build/logo-motion.mjs's OPEN course and simplified to the
 * stops a straight line between neighbours misses by more than its TOL, as
 * the loader's own keyframes are. Each stop is [x, len, off]: x from 0 to 1
 * through Open, and the dash's length and start along its path in the
 * logo's units. Close runs the same stops backward.
 *
 * The drawing itself is GtLogoMotion.geometry.ts (pnpm build:logo-motion),
 * which the component imports, so this file holds no path of the logo.
 *
 * Usage:
 *   node scripts/build/logo-armillary.mjs           (pnpm build:logo-armillary)
 *   node scripts/build/logo-armillary.mjs --check   exit 1 when the file differs from what this writes
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';

import { OPEN, stops } from './logo-motion.mjs';

helpIfAsked(import.meta.url);

const CHECK = process.argv.includes('--check');
const OUT = 'src/components/brand/GtLogoArmillary.geometry.ts';
const { armillary: A } = JSON.parse(readFileSync(join(ROOT, 'scripts/build/logo-motion.json'), 'utf8'));
const r3 = (n) => Math.round(n * 1000) / 1000;

const channel = (fn) =>
  stops((s) => fn(s / A.beats.open), A.beats.open)
    .map((p) => `[${r3(p.t)}, ${r3(p.len)}, ${r3(p.off)}]`)
    .join(', ');

const text = `/* Written by pnpm build:logo-armillary (scripts/build/logo-armillary.mjs) from scripts/build/logo-motion.json and the OPEN course of scripts/build/logo-motion.mjs. Do not edit by hand. */

/**
 * The armillary loader's lap and its Open course. \`beats\` and \`grow\` are
 * seconds, \`turns\` degrees. Each channel of \`open\` is GtLogoMotion's
 * channel of that name, as stops [x, len, off]: x from 0 to 1 through Open,
 * and the dash's length and start along its path in the logo's units.
 * Close runs the stops backward.
 */
export const GT_LOGO_ARMILLARY = {
  beats: { rest: ${A.beats.rest}, open: ${A.beats.open}, swing: ${A.beats.swing}, close: ${A.beats.close} },
  grow: ${A.grow},
  turns: { meridian: ${A.turns.meridian}, latitude: ${A.turns.latitude} },
  open: {
    meridian: [${channel(OPEN.meridian)}],
    under: [${channel(OPEN.under)}],
    fill: [${channel(OPEN.fill)}],
    head: [${channel(OPEN.head)}],
  },
} as const;
`;

const file = join(ROOT, OUT);
let old = null;
try {
  old = readFileSync(file, 'utf8');
} catch {
  old = null;
}
if (old !== text) {
  if (CHECK) {
    console.error(`logo-armillary: ${OUT} is out of date; run pnpm build:logo-armillary`);
    process.exit(1);
  }
  writeFileSync(file, text);
  console.log(`logo-armillary: ${OUT} (${(text.length / 1024).toFixed(1)} KB)`);
} else if (CHECK) {
  console.log(`logo-armillary: ${OUT} current`);
}
