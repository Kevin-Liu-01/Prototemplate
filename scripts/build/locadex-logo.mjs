#!/usr/bin/env node
/* oxlint-disable no-console -- a build step reporting to stdout. */
/**
 * Writes the Locadex logo's brand files from its catalog file,
 * public/marks/locadex/doubled-lambda.svg (the doubled-line lambda that
 * leads the Locadex section of /marks): public/brand/locadex-logo.svg in
 * currentColor on its drawn box, for masks and inline use, and
 * locadex-logo-light.svg and locadex-logo-dark.svg in ink (#070707) and
 * paper (#ffffff) on the catalog's 256 unit square, for pages that need the
 * logo as a file. The path is copied byte for byte, so the three files and
 * the catalog draw one shape.
 *
 * public/brand/locadex-mark.svg stays the mark generaltranslation.com ships
 * (a copy of gt-cloud's file, which the production mirror draws), until
 * gt-cloud takes the new logo.
 *
 * Usage:
 *   node scripts/build/locadex-logo.mjs           (pnpm build:locadex-logo)
 *   node scripts/build/locadex-logo.mjs --check   exit 1 when a file differs from what this writes
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

const CHECK = process.argv.includes('--check');
const SOURCE = 'public/marks/locadex/doubled-lambda.svg';
/** the drawn box pnpm import:marks measured, the catalog row's `box` */
const BOX = [24.3, 43.6, 207.4, 168.8];

const source = readFileSync(join(ROOT, SOURCE), 'utf8');
const match = /<path fill="currentColor" fill-rule="(nonzero|evenodd)" d="([^"]+)"\/>/.exec(source);
if (!match) {
  console.error(`build-locadex-logo: ${SOURCE} is not one currentColor path`);
  process.exit(1);
}
const [, rule, d] = match;
const svg = (viewBox, fill, size = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size} role="img" aria-label="Locadex"><path fill="${fill}" fill-rule="${rule}" d="${d}"/></svg>\n`;
const files = {
  'public/brand/locadex-logo.svg': svg(BOX.join(' '), 'currentColor'),
  'public/brand/locadex-logo-light.svg': svg('0 0 256 256', '#070707', ' width="256" height="256"'),
  'public/brand/locadex-logo-dark.svg': svg('0 0 256 256', '#ffffff', ' width="256" height="256"'),
};

let stale = 0;
for (const [rel, text] of Object.entries(files)) {
  const abs = join(ROOT, rel);
  let old = null;
  try {
    old = readFileSync(abs, 'utf8');
  } catch {
    old = null;
  }
  if (old === text) continue;
  if (CHECK) {
    console.error(`build-locadex-logo: ${rel} is stale; run pnpm build:locadex-logo`);
    stale += 1;
  } else {
    writeFileSync(abs, text);
    console.log(`build-locadex-logo: wrote ${rel}`);
  }
}
if (CHECK && stale > 0) process.exit(1);
if (CHECK) console.log(`build-locadex-logo: ${Object.keys(files).length} files current`);
