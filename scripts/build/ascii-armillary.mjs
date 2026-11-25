#!/usr/bin/env node
/* oxlint-disable no-console -- a generator reporting what it wrote. */
/**
 * Writes the ASCII armillary to public/marks/ascii: the logo's sphere as
 * three rings set in monospace characters, shaded by how much ink each
 * character holds, turning once a lap. It is the frame Kevin sent on
 * 2026-11-25 rebuilt from the geometry: the outer ring face on, the meridian
 * and the latitude as whole rings (GtLogoArmillary.frame.ts), drawn by the
 * ASCII loader's own renderer (scripts/lib/ascii-sphere.mjs) with the
 * reference's ramp : ; = ! * # $ @ and its grid. Every number is in
 * scripts/build/ascii-armillary.json.
 *
 * The meridian turns a full turn and the latitude a half turn at an even
 * speed, which brings both rings back onto themselves, so the last frame
 * runs into the first. Chrome sets each frame in Katagami Mono on the
 * palette's ground and ffmpeg encodes the lap with a palette taken from the
 * frames and no dithering.
 *
 * It writes:
 *   gt-ascii-armillary-dark.gif    the reference's teal on its near-black ground
 *   gt-ascii-armillary-light.gif   ink on paper
 *   gt-ascii-armillary.txt         the lap's first frame as plain text
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

import * as fontkit from 'fontkit';
import { chromium } from 'playwright-core';

import { apply, camera, cellLevels, glyphs, gridOf } from '../lib/ascii-sphere.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { chromePath, ROOT } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const OUT = 'public/marks/ascii';
const C = JSON.parse(readFileSync(join(ROOT, 'scripts/build/ascii-armillary.json'), 'utf8'));
const { SPHERE, meridianPoint, latitudePoint } = await import(new URL('../../src/components/brand/GtLogoArmillary.frame.ts', import.meta.url).href);

const [cx0, cy0] = SPHERE.centre;
const M = camera(C.pose);

/** One frame at ring angles a (meridian) and g (latitude): both whole rings, every half degree, split into near and far halves. */
function frame(a, g) {
  const near = [];
  const far = [];
  for (let t = 0; t < 360; t += 0.5) {
    for (const p of [meridianPoint(t, a), latitudePoint(t, g)]) {
      const q = apply(M, [p.x - cx0, p.y - cy0, p.z]);
      (q[2] >= 0 ? near : far).push(q);
    }
  }
  return cellLevels(C, near, far);
}

const N = Math.round(C.lap.seconds * C.lap.fps);
const levels = Array.from({ length: N }, (_, i) =>
  frame(SPHERE.meridian.rest + (C.lap.turns.meridian * i) / N, SPHERE.latitude.rest + (C.lap.turns.latitude * i) / N)
);

/* the cuts: the levels of the whole lap at the quantiles the reference's glyph shares set */
const all = levels.flat(2).filter((v) => v !== null).sort((x, y) => x - y);
const total = C.shares.reduce((s, v) => s + v, 0);
let acc = 0;
const cuts = C.shares.slice(0, -1).map((share) => {
  acc += share / total;
  return all[Math.min(all.length - 1, Math.floor(acc * all.length))];
});
const frames = levels.map((f) => glyphs(f, C.ramp, cuts));

if (process.argv.includes('--print')) {
  console.log(frames[0].join('\n'));
  const counts = Object.fromEntries([...C.ramp].map((ch) => [ch, 0]));
  for (const row of frames[0]) for (const ch of row) if (ch in counts) counts[ch]++;
  console.log(counts, cuts.map((c) => c.toFixed(3)).join(' '));
  process.exit(0);
}

/* ---------- the GIFs ---------- */

const G = gridOf(C);
const [CW, CH] = C.grid.cellPx;
const W = G.cols * CW;
const H = G.rows * CH;
const font = fontkit.openSync(join(ROOT, C.font));
/* the size at which one advance is one cell */
const size = (CW * font.unitsPerEm) / font.glyphForCodePoint(0x40).advanceWidth;
const woff2 = readFileSync(join(ROOT, C.font)).toString('base64');

mkdirSync(join(ROOT, OUT), { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath(), headless: true });
try {
  for (const [theme, { ground, ink }] of Object.entries(C.palette)) {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await page.setContent(
      `<!doctype html><style>@font-face{font-family:m;src:url(data:font/woff2;base64,${woff2}) format('woff2')}` +
        `html,body{margin:0;background:${ground}}pre{margin:0;width:${W}px;height:${H}px;font:${size}px/${CH}px m;color:${ink};font-kerning:none;font-variant-ligatures:none;white-space:pre}</style><pre></pre>`
    );
    await page.evaluate(() => document.fonts.ready);
    const dir = mkdtempSync(join(tmpdir(), 'ascii-armillary-'));
    for (let i = 0; i < N; i++) {
      await page.evaluate((text) => {
        document.querySelector('pre').textContent = text;
      }, frames[i].join('\n'));
      writeFileSync(join(dir, `f${String(i).padStart(3, '0')}.png`), await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } }));
    }
    await page.close();
    const file = join(ROOT, OUT, `gt-ascii-armillary-${theme}.gif`);
    const filter = 'split[a][b];[a]palettegen=max_colors=16:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=none:diff_mode=rectangle';
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(C.lap.fps), '-i', join(dir, 'f%03d.png'), '-lavfi', filter, '-loop', '0', file]);
    rmSync(dir, { recursive: true, force: true });
    console.log(`ascii-armillary: wrote ${OUT}/gt-ascii-armillary-${theme}.gif, ${N} frames at ${C.lap.fps} fps, ${W} by ${H}, ${Math.round(statSync(file).size / 1024)} KB`);
  }
} finally {
  await browser.close();
}

const txt = frames[0].map((row) => row.trimEnd());
while (txt.length && !txt[0]) txt.shift();
while (txt.length && !txt[txt.length - 1]) txt.pop();
const indent = Math.min(...txt.filter(Boolean).map((l) => l.match(/^ */)[0].length));
writeFileSync(join(ROOT, OUT, 'gt-ascii-armillary.txt'), `${txt.map((l) => l.slice(indent)).join('\n')}\n`);
console.log(`ascii-armillary: wrote ${OUT}/gt-ascii-armillary.txt`);
