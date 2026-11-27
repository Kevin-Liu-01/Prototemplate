#!/usr/bin/env node
/* oxlint-disable no-console -- a generator reporting what it wrote. */
/**
 * Writes the armillary GIFs to public/marks/ascii, a pair for each version:
 * the logo as an armillary sphere, its pieces each turning on its own
 * (scripts/lib/armillary-pieces.mjs, numbers in scripts/build/armillary.json).
 *
 *   gt-armillary-{dark,light}.gif          axis: the meridian turns about the
 *                                          poles, the G about its bar's line
 *                                          and the T about its stem
 *   gt-armillary-rings-{dark,light}.gif    rings: the meridian's gap and the
 *                                          G's mouth travel round their rings
 *   gt-armillary-gimbal-{dark,light}.gif   gimbal: the rings part, and the G
 *                                          and the meridian turn inside the
 *                                          still ring round the still T
 *   gt-armillary-gimbal-sphere-{dark,light}.gif
 *                                          sphere: the gimbal with its rings
 *                                          kept on the logo's one sphere
 *
 * Each piece turns once in its own window, and every lap starts and ends on
 * the still logo, so each GIF loops with no seam.
 *
 * Chrome draws each frame's SVG, except the gimbals', which Node draws
 * pixel by pixel (gimbalCoverage), and ffmpeg encodes the lap with a 16
 * color palette taken from the frames and no dithering, so the ground stays
 * one flat color.
 *
 * Requires: the Chrome for Testing build playwright-core expects
 * (CHROME_PATH overrides it) and ffmpeg on PATH. No dev server.
 *
 * Usage:
 *   node scripts/build/armillary-gif.mjs                 every version (pnpm build:armillary-gif)
 *   node scripts/build/armillary-gif.mjs --only gimbal   one version, by its name in armillary.json
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

import { angles, frameSvg, gimbalCoverage, lapTimes } from '../lib/armillary-pieces.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { chromePath, ROOT } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const OUT = 'public/marks/ascii';
const A = JSON.parse(readFileSync(join(ROOT, 'scripts/build/armillary.json'), 'utf8'));
/** the GIF's side in px, and the ground round the logo as a share of the logo's side each way */
const SIZE = 496;
const PAD = 0.12;
const PALETTE = { dark: { ground: '#070707', ink: '#f2f2f0' }, light: { ground: '#ffffff', ink: '#070707' } };

const side = 207.4 * (1 + 2 * PAD);
const view = [128 - side / 2, 128 - side / 2, side, side];

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
if (only && !A.versions[only]) throw new Error(`armillary-gif: no version called ${only} (${Object.keys(A.versions).join(', ')})`);
const versions = Object.entries(A.versions).filter(([name]) => !only || name === only);

/** A frame's ink coverage as raw RGB, the ground mixed with the ink by each pixel's coverage. */
function shade(cov, ground, ink) {
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [g, k] = [rgb(ground), rgb(ink)];
  const out = Buffer.alloc(cov.length * 3);
  for (let i = 0; i < cov.length; i++) for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(g[c] + (k[c] - g[c]) * cov[i]);
  return out;
}

mkdirSync(join(ROOT, OUT), { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath(), headless: true });
try {
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
  for (const [name, V] of versions) {
    const times = lapTimes(V);
    /* the gimbal is drawn pixel by pixel in Node (gimbalCoverage), once for both themes */
    const coverage = V.motion === 'gimbal' ? times.map((s) => gimbalCoverage(A, angles(V, s), V.nest, view, SIZE)) : null;
    for (const [theme, { ground, ink }] of Object.entries(PALETTE)) {
      const dir = mkdtempSync(join(tmpdir(), 'armillary-gif-'));
      for (const [i, s] of times.entries()) {
        if (coverage) {
          writeFileSync(join(dir, `f${String(i).padStart(3, '0')}.rgb`), shade(coverage[i], ground, ink));
          continue;
        }
        await page.setContent(`<style>html,body{margin:0;background:${ground}}svg{display:block}</style>${frameSvg(A, V.motion, angles(V, s), { view, px: [SIZE, SIZE], ground, ink, nest: V.nest })}`);
        writeFileSync(join(dir, `f${String(i).padStart(3, '0')}.png`), await page.screenshot({ clip: { x: 0, y: 0, width: SIZE, height: SIZE } }));
      }
      const file = join(ROOT, OUT, `${V.file}-${theme}.gif`);
      const filter = 'split[a][b];[a]palettegen=max_colors=16:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=none:diff_mode=rectangle';
      const input = coverage
        ? ['-f', 'image2', '-c:v', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${SIZE}x${SIZE}`, '-framerate', String(V.lap.fps), '-i', join(dir, 'f%03d.rgb')]
        : ['-framerate', String(V.lap.fps), '-i', join(dir, 'f%03d.png')];
      execFileSync('ffmpeg', ['-v', 'error', '-y', ...input, '-lavfi', filter, '-loop', '0', file]);
      rmSync(dir, { recursive: true, force: true });
      console.log(`armillary-gif: wrote ${OUT}/${V.file}-${theme}.gif (${name}), ${times.length} frames at ${V.lap.fps} fps, ${SIZE} px, ${Math.round(statSync(file).size / 1024)} KB`);
    }
  }
} finally {
  await browser.close();
}
