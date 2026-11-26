#!/usr/bin/env node
/* oxlint-disable no-console -- a generator reporting what it wrote. */
/**
 * Writes the ASCII armillary to public/marks/ascii: the armillary GIF's own
 * frames (scripts/lib/armillary-pieces.mjs, the logo's pieces each turning on
 * its own axis) on the dot-matrix header's grid. Frames at rest take the
 * header's globe dots from its SVG, so the still is the header's globe. The
 * script stops unless the pieces drawn at rest give those same dots, so the
 * lap leaves and lands on the still with no jump; the ring never moves, so a
 * still dot on the ring that sits on the threshold is kept in every frame. The grid, the threshold, the dot and the
 * grounds are the header's (scripts/build/ascii-header.json): the globe
 * mark.size dots across inside a margin, and a cell takes a dot when the
 * frame's lines cover mark.threshold of it. The lap is
 * scripts/build/armillary.json's.
 *
 * Chrome draws each moving frame at `SCALE` pixels a dot with no
 * antialiasing, one sample a pixel as the header samples, and reads each
 * cell's share of ink; the dots are drawn as the header's PNG draws them
 * (scripts/lib/dot-grid.mjs), and ffmpeg encodes the lap with a palette
 * taken from the frames and no dithering. The lap starts and ends on the
 * still logo, so the last frame runs into the first.
 *
 * It writes:
 *   gt-ascii-armillary-dark.gif    white dots on ink
 *   gt-ascii-armillary-light.gif   ink dots on paper
 *   gt-ascii-armillary.txt         the lap's first frame as plain text, as
 *                                  the header's (: both, ' top, . bottom)
 *
 * Requires: the Chrome for Testing build playwright-core expects
 * (CHROME_PATH overrides it) and ffmpeg on PATH. No dev server.
 *
 * Usage:
 *   node scripts/build/ascii-armillary.mjs           (pnpm build:ascii-armillary)
 *   node scripts/build/ascii-armillary.mjs --print   print the first frame and write nothing
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

import { angles, atRest, frameSvg, lapTimes, SPHERE } from '../lib/armillary-pieces.mjs';
import { dotsPng, dotsText, hexGray } from '../lib/dot-grid.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { chromePath, ROOT } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const OUT = 'public/marks/ascii';
const H = JSON.parse(readFileSync(join(ROOT, 'scripts/build/ascii-header.json'), 'utf8'));
const A = JSON.parse(readFileSync(join(ROOT, 'scripts/build/armillary.json'), 'utf8'));
/** pixels a dot Chrome draws each moving frame at: the header's samples a dot each way */
const SCALE = H.samples;

/* the header's globe: the logo's viewBox (24.3 24.3 207.4) across mark.size dots, inside the margin */
const M = H.margin;
const N = H.mark.size + 2 * M;
const unit = 207.4 / H.mark.size;
const view = [24.3 - M * unit, 24.3 - M * unit, N * unit, N * unit];

/* the header's globe, its dots in the globe's columns: every frame at rest takes these */
const header = readFileSync(join(ROOT, OUT, 'gt-ascii-header.svg'), 'utf8');
const headerDots = new Set([...header.matchAll(/M(\d+)\.5 (\d+)\.5h0/g)].map((m) => `${m[1]},${m[2]}`));
const stillGrid = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => headerDots.has(`${c},${r}`)));

const times = lapTimes(A);
const browser = await chromium.launch({ executablePath: chromePath(), headless: true });
let grids;
try {
  const page = await browser.newPage({ viewport: { width: 100, height: 100 } });
  /* the share of ink in each cell of one frame's SVG */
  const sample = (svg) =>
    page.evaluate(
      async ({ svg, N, SCALE, threshold }) => {
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = N * SCALE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, N * SCALE, N * SCALE);
        const W = N * SCALE;
        return Array.from({ length: N }, (_, r) =>
          Array.from({ length: N }, (_, c) => {
            let sum = 0;
            for (let y = r * SCALE; y < (r + 1) * SCALE; y++) for (let x = c * SCALE; x < (c + 1) * SCALE; x++) sum += data[(y * W + x) * 4] >= 128 ? 1 : 0;
            return sum / (SCALE * SCALE) >= threshold;
          })
        );
      },
      { svg, N, SCALE, threshold: H.mark.threshold }
    );
  const draw = (a) => frameSvg(A, a, { view, px: [N * SCALE, N * SCALE], ground: '#000', ink: '#fff' }).replace('<svg ', '<svg shape-rendering="crispEdges" ');
  /* the seam: the pieces drawn at rest against the header's globe. The ring never moves, so a still dot on the
     ring that the pieces' sampling misses (a cell on the threshold) is kept in every frame */
  const piecesAtRest = await sample(draw(angles(A, 0)));
  const ringBand = (c, r) => Math.abs(Math.hypot(view[0] + (c + 0.5) * unit - 128, view[1] + (r + 0.5) * unit - 128) - SPHERE.ring) <= SPHERE.weight / 2 + unit / 2;
  const pinned = [];
  stillGrid.forEach((row, r) => row.forEach((on, c) => on && !piecesAtRest[r][c] && ringBand(c, r) && pinned.push([c, r])));
  const pin = (grid) => {
    for (const [c, r] of pinned) grid[r][c] = true;
    return grid;
  };
  const seam = pin(piecesAtRest).flat().filter((on, i) => on !== stillGrid.flat()[i]).length;
  if (seam) throw new Error(`ascii-armillary: the pieces at rest differ from the header's globe in ${seam} cells, so the lap would jump where it leaves the still`);
  console.log(`ascii-armillary: the pieces at rest match the header's globe (${pinned.length} ring dots pinned)`);
  grids = [];
  for (const s of times) {
    const a = angles(A, s);
    grids.push(atRest(a) ? stillGrid : pin(await sample(draw(a))));
  }
} finally {
  await browser.close();
}

if (process.argv.includes('--print')) {
  console.log(dotsText(grids[0]));
  process.exit(0);
}

/* ---------- the GIFs ---------- */
mkdirSync(join(ROOT, OUT), { recursive: true });
const PALETTE = { dark: [H.ground.dark, H.ground.light], light: [H.ground.light, H.ground.dark] };
for (const [theme, [ground, ink]] of Object.entries(PALETTE)) {
  const dir = mkdtempSync(join(tmpdir(), 'ascii-armillary-'));
  grids.forEach((grid, i) => {
    const dots = grid.flatMap((row, r) => row.flatMap((on, c) => (on ? [[c, r]] : [])));
    writeFileSync(join(dir, `f${String(i).padStart(3, '0')}.png`), dotsPng(dots, N, N, { pitch: H.png.pitch, dot: H.dot, ground: hexGray(ground), ink: hexGray(ink) }));
  });
  const file = join(ROOT, OUT, `gt-ascii-armillary-${theme}.gif`);
  const filter = 'split[a][b];[a]palettegen=max_colors=16:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=none:diff_mode=rectangle';
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(A.lap.fps), '-i', join(dir, 'f%03d.png'), '-lavfi', filter, '-loop', '0', file]);
  rmSync(dir, { recursive: true, force: true });
  console.log(`ascii-armillary: wrote ${OUT}/gt-ascii-armillary-${theme}.gif, ${grids.length} frames at ${A.lap.fps} fps, ${N} dots a side, ${N * H.png.pitch} px, ${Math.round(statSync(file).size / 1024)} KB`);
}
writeFileSync(join(ROOT, OUT, 'gt-ascii-armillary.txt'), dotsText(grids[0]));
console.log(`ascii-armillary: wrote ${OUT}/gt-ascii-armillary.txt`);
