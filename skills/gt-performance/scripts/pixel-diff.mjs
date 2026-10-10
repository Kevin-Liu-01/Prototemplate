#!/usr/bin/env node
// pixel-diff.mjs: proves that a performance change left the picture alone.
//
// `capture` renders a page under reduced motion (one deterministic frame for
// every GT engine that follows the lifecycle contract) at a fixed size, pixel
// ratio and theme, and writes a PNG. `compare` reads two PNGs and prints how
// many pixels and channels differ, the largest channel difference and the box
// that holds the differences, and can write a diff image (differences in red
// over a dimmed copy of the first image). It exits 1 when any channel
// differs by more than --tolerance, so it can gate a change.
//
// The proof has three steps: capture the baseline twice on the unchanged
// build and compare the two (they must match at zero, or the frame is not
// deterministic and the diff proves nothing); make the change; capture again
// with the same flags and compare against the baseline.
//
// Usage, with the working directory in a checkout that has playwright-core
// (Prototemplate does; from an installed copy, run this folder's file the
// same way):
//   node skills/gt-performance/scripts/pixel-diff.mjs capture <url> --out <file.png>
//     [--size 1440x900] [--dpr 2] [--theme dark] [--wait 3000] [--full]
//     [--selector "<css>"] [--timeout 120000]
//   node skills/gt-performance/scripts/pixel-diff.mjs compare <a.png> <b.png>
//     [--diff <out.png>] [--tolerance 0]
//
// Example:
//   node skills/gt-performance/scripts/pixel-diff.mjs capture http://localhost:3005/d/event-horizon --out /tmp/before.png
//   node skills/gt-performance/scripts/pixel-diff.mjs capture http://localhost:3005/d/event-horizon --out /tmp/before-2.png
//   node skills/gt-performance/scripts/pixel-diff.mjs compare /tmp/before.png /tmp/before-2.png
//   (change the shader, then)
//   node skills/gt-performance/scripts/pixel-diff.mjs capture http://localhost:3005/d/event-horizon --out /tmp/after.png
//   node skills/gt-performance/scripts/pixel-diff.mjs compare /tmp/before.png /tmp/after.png --diff /tmp/diff.png
//
// A GPU shader can differ by 1/255 in a few channels after any source edit,
// because drivers may fuse multiply-adds differently; report such residue
// with its count and location instead of calling it zero. The theme is
// seeded through localStorage gt-theme and theme plus the color-scheme
// emulation. CHROME_PATH overrides the browser; otherwise the newest Chrome
// for Testing build under the ms-playwright cache is used.
//
// Requires: playwright-core (in a Prototemplate checkout) and Chrome for Testing.
// Last real run: 2026-10-08, the Prototemplate session's checks of the copied
// plate and engine files (a transcript scan on 2026-10-10).

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

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

function usage() {
  console.error('Usage: pixel-diff.mjs capture <url> --out <file.png> [--size 1440x900] [--dpr 2] [--theme dark] [--wait 3000] [--full] [--selector "<css>"] [--timeout 120000]');
  console.error('       pixel-diff.mjs compare <a.png> <b.png> [--diff <out.png>] [--tolerance 0]');
  process.exit(2);
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
  console.error('pixel-diff: playwright-core is not installed in this checkout. Run the script from Prototemplate, or add playwright-core as a dev dependency.');
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

// Runs in the page: decodes both PNGs without color conversion and compares
// them channel by channel. Kept free of outer references because Playwright
// serialises it.
async function diffInPage({ a, b, tolerance, wantDiff }) {
  const decode = async (base64) => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);
    return { width: bitmap.width, height: bitmap.height, data: ctx.getImageData(0, 0, bitmap.width, bitmap.height).data };
  };
  const first = await decode(a);
  const second = await decode(b);
  if (first.width !== second.width || first.height !== second.height) {
    return { sizeMismatch: true, a: [first.width, first.height], b: [second.width, second.height] };
  }
  const { width, height } = first;
  let channels = 0;
  let pixels = 0;
  let maxDelta = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  const out = wantDiff ? new Uint8ClampedArray(first.data.length) : null;
  for (let i = 0; i < first.data.length; i += 4) {
    let hit = false;
    for (let c = 0; c < 4; c += 1) {
      const delta = Math.abs(first.data[i + c] - second.data[i + c]);
      if (delta > maxDelta) maxDelta = delta;
      if (delta > tolerance) {
        channels += 1;
        hit = true;
      }
    }
    if (hit) {
      pixels += 1;
      const p = i / 4;
      const x = p % width;
      const y = Math.floor(p / width);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    if (out) {
      const grey = (first.data[i] + first.data[i + 1] + first.data[i + 2]) / 12;
      out[i] = hit ? 255 : grey;
      out[i + 1] = hit ? 0 : grey;
      out[i + 2] = hit ? 0 : grey;
      out[i + 3] = 255;
    }
  }
  let diff = null;
  if (out) {
    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext('2d').putImageData(new ImageData(out, width, height), 0, 0);
    const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    diff = btoa(binary);
  }
  return {
    width,
    height,
    pixels,
    channels,
    totalChannels: width * height * 4,
    maxDelta,
    box: pixels ? [minX, minY, maxX, maxY] : null,
    diff,
  };
}

const command = argv.shift();
if (command !== 'capture' && command !== 'compare') usage();

const { chromium } = loadPlaywright();

if (command === 'capture') {
  const out = takeValue('out', '');
  const [width, height] = takeValue('size', '1440x900').split('x').map(Number);
  const dpr = Number(takeValue('dpr', '2')) || 2;
  const theme = takeValue('theme', 'dark') === 'light' ? 'light' : 'dark';
  const wait = Number(takeValue('wait', '3000')) || 0;
  const full = takeFlag('full');
  const selector = takeValue('selector', '');
  const timeout = Number(takeValue('timeout', '120000')) || 120000;
  const url = argv.find((a) => !a.startsWith('--'));
  if (!url || !out || !width || !height) usage();
  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      colorScheme: theme,
      reducedMotion: 'reduce',
    });
    await context.addInitScript(
      ({ t }) => {
        try {
          localStorage.setItem('gt-theme', t);
          localStorage.setItem('theme', t);
        } catch {
          // storage can be blocked; the color-scheme emulation still applies
        }
      },
      { t: theme },
    );
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load', timeout });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(wait);
    if (selector) await page.locator(selector).first().screenshot({ path: out, animations: 'disabled' });
    else await page.screenshot({ path: out, fullPage: full, animations: 'disabled' });
    console.log(`captured ${url} at ${width}x${height} @${dpr}x ${theme}, reduced motion, to ${out}`);
  } finally {
    await browser.close();
  }
} else {
  const diffPath = takeValue('diff', '');
  const tolerance = Number(takeValue('tolerance', '0')) || 0;
  const [aPath, bPath] = argv.filter((a) => !a.startsWith('--'));
  if (!aPath || !bPath) usage();
  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  let result;
  try {
    const page = await browser.newPage();
    result = await page.evaluate(diffInPage, {
      a: readFileSync(aPath).toString('base64'),
      b: readFileSync(bPath).toString('base64'),
      tolerance,
      wantDiff: Boolean(diffPath),
    });
  } finally {
    await browser.close();
  }
  if (result.sizeMismatch) {
    console.log(`size mismatch: ${result.a.join('x')} against ${result.b.join('x')}; capture both with the same --size, --dpr and --full`);
    process.exit(1);
  }
  if (diffPath && result.diff) writeFileSync(diffPath, Buffer.from(result.diff, 'base64'));
  const share = ((result.channels / result.totalChannels) * 100).toFixed(4);
  console.log(`${result.width}x${result.height}: ${result.pixels} pixels and ${result.channels} of ${result.totalChannels} channels differ (${share}%) beyond tolerance ${tolerance}; largest channel difference ${result.maxDelta}/255`);
  if (result.box) console.log(`differences inside x ${result.box[0]} to ${result.box[2]}, y ${result.box[1]} to ${result.box[3]} (image pixels)`);
  if (diffPath) console.log(`diff image: ${diffPath}`);
  process.exit(result.channels > 0 ? 1 : 0);
}
