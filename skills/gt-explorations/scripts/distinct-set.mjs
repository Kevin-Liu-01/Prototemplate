#!/usr/bin/env node
// distinct-set.mjs: checks that a set of options actually differ before Kevin
// sees them. On 2026-09-04 a set of ten shader frames went out with nine that
// looked the same ("they all looks the same bro 9 / 10 are the same"). Run
// this on every set of stills, frames or captures before sending it.
//
// Each image is reduced to a grayscale grid (64 by 40 by default) by repeated
// halving, which averages dither and grain away and keeps the composition.
// Every pair is then compared two ways:
//   - diff: the mean absolute difference of the grids, as a percent of full
//     scale. Under --same (default 2) the two images read as the same picture.
//   - corr: the absolute correlation of the grids. At or above --corr
//     (default 0.9) the two share one composition: the same layout in another
//     palette or brightness, or an inverted tone field.
// A pair that crosses either line is flagged. A flag on corr alone is the
// "ten skins of one page" case from the deco rounds (2026-09-14): a palette
// change on one layout is not a new direction. Tested on 2026-10-05: frames a
// sixth of a second apart in a film read 0.3 to 1.1% diff and 0.96 to 0.99
// corr; frames six seconds apart read 5 to 25% diff and corr under 0.5.
//
// The script finds near-duplicates. It cannot judge whether two different
// images are different directions; that review is by eye, against the
// silhouette, material and action table in SKILL.md section 2.
//
// Usage, with the working directory in a checkout that has playwright-core
// (Prototemplate does):
//   node skills/gt-explorations/scripts/distinct-set.mjs <file or folder> [...]
//     [--grid 64x40] [--same 2] [--corr 0.9] [--json] [--strict]
//
// A folder contributes its .png, .jpg, .jpeg and .webp files (not its
// subfolders). Frames of a film or a canvas come out of ffmpeg first:
//   ffmpeg -i take.mp4 -vf fps=2 /tmp/frames/%03d.png
// The default exit is 0 so a loop can read the report; --strict exits 1 when
// any pair is flagged. CHROME_PATH overrides the browser; otherwise the newest
// Chrome for Testing build in the ms-playwright cache decodes the images.
//
// Requires: Node 20 or later, playwright-core in the working checkout and a
// Chrome for Testing build (pnpm exec playwright-core install chromium).
// Last real run: none (kept for: every set of stills, frames or captures
// shown to Kevin as options; its seven runs on 2026-10-06 were authoring runs).

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, platform } from 'node:os';
import { basename, extname, join, relative, resolve } from 'node:path';

const argv = process.argv.slice(2);

function takeValue(name, fallback) {
  const at = argv.indexOf(`--${name}`);
  if (at === -1) return fallback;
  const value = argv[at + 1];
  argv.splice(at, 2);
  return value;
}

function takeFlag(name) {
  const at = argv.indexOf(`--${name}`);
  if (at === -1) return false;
  argv.splice(at, 1);
  return true;
}

const [gridW, gridH] = takeValue('grid', '64x40').split('x').map(Number);
const sameLine = Number(takeValue('same', '2'));
const corrLine = Number(takeValue('corr', '0.9'));
const asJson = takeFlag('json');
const strict = takeFlag('strict');
const inputs = argv.filter((a) => !a.startsWith('--'));

const IMAGE = /\.(png|jpe?g|webp)$/i;
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

if (inputs.length === 0 || !gridW || !gridH) {
  console.error('Usage: distinct-set.mjs <file or folder> [...] [--grid 64x40] [--same 2] [--corr 0.9] [--json] [--strict]');
  process.exit(2);
}

/** Every image the inputs name: files as given, folders by their own image files, sorted. */
function collect(paths) {
  const files = [];
  for (const raw of paths) {
    const path = resolve(raw);
    if (!existsSync(path)) {
      console.error(`distinct-set: no such file or folder: ${raw}`);
      process.exit(2);
    }
    if (statSync(path).isDirectory()) {
      for (const entry of readdirSync(path).sort()) if (IMAGE.test(entry)) files.push(join(path, entry));
    } else if (IMAGE.test(path)) {
      files.push(path);
    }
  }
  return files;
}

function loadPlaywright() {
  const bases = [join(process.cwd(), 'package.json'), join(process.cwd(), 'scripts', 'package.json')];
  for (const base of bases) {
    try {
      return createRequire(base)('playwright-core');
    } catch {
      // try the next base
    }
  }
  console.error('distinct-set: playwright-core is not installed in this checkout. Run the script from Prototemplate, or add playwright-core as a dev dependency.');
  process.exit(2);
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = platform() === 'darwin' ? join(homedir(), 'Library/Caches/ms-playwright') : join(homedir(), '.cache/ms-playwright');
  if (!existsSync(cache)) return undefined;
  const builds = readdirSync(cache)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  const app = 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  const tails = [`chrome-mac-arm64/${app}`, `chrome-mac-x64/${app}`, `chrome-mac/${app}`, 'chrome-linux64/chrome', 'chrome-linux/chrome'];
  for (const build of builds) {
    for (const tail of tails) {
      const path = join(cache, build, tail);
      if (existsSync(path)) return path;
    }
  }
  return undefined;
}

// Runs in the page, so it holds no outer references. Halves the image until
// one more halving would pass the grid, then draws the grid, so every cell is
// an average of the pixels under it and ordered dither reads as its tone.
async function toGrid(src, w, h) {
  const img = new Image();
  img.src = src;
  await img.decode();
  let cw = img.naturalWidth;
  let ch = img.naturalHeight;
  let canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  canvas.getContext('2d').drawImage(img, 0, 0);
  while (cw / 2 >= w && ch / 2 >= h) {
    cw = Math.floor(cw / 2);
    ch = Math.floor(ch / 2);
    const next = document.createElement('canvas');
    next.width = cw;
    next.height = ch;
    const ctx = next.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, cw, ch);
    canvas = next;
  }
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const gray = [];
  for (let i = 0; i < w * h; i += 1) gray.push(0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]);
  return { gray, size: [img.naturalWidth, img.naturalHeight] };
}

function stats(grid) {
  const mean = grid.reduce((a, v) => a + v, 0) / grid.length;
  const sd = Math.sqrt(grid.reduce((a, v) => a + (v - mean) ** 2, 0) / grid.length);
  return { mean, sd };
}

/** diff in percent of full scale; corr as an absolute value, or null when either grid is nearly flat. */
function compare(a, b) {
  let sum = 0;
  for (let i = 0; i < a.gray.length; i += 1) sum += Math.abs(a.gray[i] - b.gray[i]);
  const diff = (sum / a.gray.length / 255) * 100;
  if (a.sd < 2 || b.sd < 2) return { diff, corr: null };
  let cov = 0;
  for (let i = 0; i < a.gray.length; i += 1) cov += (a.gray[i] - a.mean) * (b.gray[i] - b.mean);
  const corr = Math.abs(cov / a.gray.length / (a.sd * b.sd));
  return { diff, corr };
}

const files = collect(inputs);
if (files.length < 2) {
  console.error(`distinct-set: ${files.length} image found; a set needs two or more.`);
  process.exit(2);
}

/* Labels are file names, or paths from the working directory when two files share a name (a light and a dark capture). */
const shared = new Set(files.map((f) => basename(f)).filter((n, i, all) => all.indexOf(n) !== i));
const label = (file) => (shared.has(basename(file)) ? relative(process.cwd(), file) : basename(file));

const { chromium } = loadPlaywright();
const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
const grids = [];
try {
  const page = await browser.newPage();
  for (const file of files) {
    const src = `data:${MIME[extname(file).toLowerCase()]};base64,${readFileSync(file).toString('base64')}`;
    const grid = await page.evaluate(`(${toGrid.toString()})(${JSON.stringify(src)}, ${gridW}, ${gridH})`);
    grids.push({ file, name: label(file), ...grid, ...stats(grid.gray) });
  }
} finally {
  await browser.close();
}

const pairs = [];
for (let i = 0; i < grids.length; i += 1) {
  for (let j = i + 1; j < grids.length; j += 1) {
    const { diff, corr } = compare(grids[i], grids[j]);
    const reasons = [];
    if (diff < sameLine) reasons.push('same picture');
    if (corr !== null && corr >= corrLine) reasons.push('same composition');
    pairs.push({ a: grids[i].name, b: grids[j].name, diff, corr, flagged: reasons.length > 0, reasons });
  }
}

const nearest = grids.map((g) => {
  const mine = pairs.filter((p) => p.a === g.name || p.b === g.name);
  const best = mine.reduce((m, p) => (m === null || p.diff < m.diff ? p : m), null);
  return { name: g.name, size: g.size, nearest: best ? (best.a === g.name ? best.b : best.a) : null, diff: best?.diff ?? null, corr: best?.corr ?? null };
});
const flagged = pairs.filter((p) => p.flagged);

if (asJson) {
  console.log(JSON.stringify({ grid: [gridW, gridH], same: sameLine, corr: corrLine, images: nearest, flagged }, null, 2));
} else {
  const fmtCorr = (c) => (c === null ? ' n/a' : c.toFixed(2));
  const width = Math.max(...grids.map((g) => g.name.length), 5);
  console.log(`${files.length} images, ${pairs.length} pairs, grid ${gridW}x${gridH}; same picture under ${sameLine}% diff, same composition at corr ${corrLine} or more\n`);
  console.log(`${'image'.padEnd(width)}  ${'nearest'.padEnd(width)}  diff%   corr`);
  for (const row of nearest) {
    console.log(`${row.name.padEnd(width)}  ${(row.nearest ?? '').padEnd(width)}  ${row.diff.toFixed(2).padStart(5)}  ${fmtCorr(row.corr)}`);
  }
  console.log('');
  if (flagged.length === 0) {
    console.log('No pair is flagged. Review the set by eye for silhouette, material and action before sending it.');
  } else {
    console.log(`${flagged.length} pair${flagged.length === 1 ? '' : 's'} flagged:`);
    for (const p of flagged) console.log(`  ${p.a}  ~  ${p.b}   diff ${p.diff.toFixed(2)}%  corr ${fmtCorr(p.corr)}  (${p.reasons.join(', ')})`);
  }
}

process.exit(strict && flagged.length > 0 ? 1 : 0);
