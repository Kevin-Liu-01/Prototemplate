// Measures the height of every live plate on /components once it has
// drawn, at 1440x900 and at 390x844, into src/lib/plate-heights.json.
// src/lib/component-library.ts reads the file, and each row reserves its
// plate's measured height before the plate mounts, so a plate that mounts
// in view or above the reader moves nothing. Each slot ([data-plate]) is
// scrolled to the top of the sheet; its height is the height of what the
// plate rendered in it, read once the plate has drawn (.is-drawn), every
// frame in it has loaded, and the height has held still for 2.5 s (a framed
// page's anatomy legend lands 1.6 s after the page loads). A plate
// that never settles within 30 s is reported, and the run exits 1 without
// writing.
//
// Usage: pnpm capture:plate-heights [--base <url>, default PT_BASE]
// Needs a running server and the Chrome for Testing build playwright-core
// expects; CHROME_PATH overrides the executable.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

import { option } from '../lib/args.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { BASE_URL, chromePath, HIDE_DEV_UI_CSS, ROOT } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const BASE = (option(process.argv.slice(2), '--base') ?? BASE_URL).replace(/\/$/, '');
const OUT = join(ROOT, 'src/lib/plate-heights.json');
const SIZES = [
  { w: 1440, h: 900, touch: false },
  { w: 390, h: 844, touch: true },
];
const STILL_MS = 2500;
const TIMEOUT_MS = 30_000;

/** Runs in the page: the height of what the slot's plate rendered, once it has drawn, its frames have loaded and it has held still; -1 at the timeout. */
async function settledHeight([id, still, timeout]) {
  const slot = document.querySelector(`[data-plate="${CSS.escape(id)}"]`);
  const sheet = document.querySelector('.sheet-flow');
  if (!slot || !sheet) return -1;
  sheet.scrollTop += slot.getBoundingClientRect().top - sheet.getBoundingClientRect().top;
  const loaded = (frame) => {
    try {
      return frame.contentDocument?.readyState === 'complete';
    } catch {
      return true;
    }
  };
  const start = performance.now();
  let last = -1;
  let since = start;
  while (performance.now() - start < timeout) {
    await new Promise((done) => setTimeout(done, 100));
    const nodes = Array.from(slot.querySelectorAll(':scope > :not([aria-hidden="true"])'));
    const settled = slot.classList.contains('is-drawn') && Array.from(slot.querySelectorAll('iframe')).every(loaded);
    const height = settled ? Math.round(nodes.reduce((sum, node) => sum + node.getBoundingClientRect().height, 0)) : -1;
    if (height !== last) {
      last = height;
      since = performance.now();
    } else if (height > 0 && performance.now() - since >= still) {
      return height;
    }
  }
  return -1;
}

const browser = await chromium.launch({ executablePath: chromePath(), headless: true });
const heights = {};
const failed = [];
for (const [at, size] of SIZES.entries()) {
  const context = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 1, isMobile: size.touch, hasTouch: size.touch });
  const page = await context.newPage();
  await page.goto(`${BASE}/components`, { waitUntil: 'load', timeout: 120_000 });
  await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
  await page.evaluate(() => document.fonts.ready);
  const ids = await page.evaluate(() => Array.from(document.querySelectorAll('[data-plate]'), (el) => el.dataset.plate));
  for (const id of ids) {
    const height = await page.evaluate(settledHeight, [id, STILL_MS, TIMEOUT_MS]);
    if (height < 0) failed.push(`${size.w}: ${id}`);
    (heights[id] ??= [0, 0])[at] = height;
  }
  console.log(`  ${size.w}x${size.h}: ${ids.length} plates`);
  await context.close();
}
await browser.close();

if (failed.length > 0) {
  console.error(`capture-plate-heights: ${failed.length} plates never drew\n${failed.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
const lines = Object.entries(heights).map(([id, [wide, narrow]]) => `  ${JSON.stringify(id)}: [${wide}, ${narrow}]`);
writeFileSync(OUT, `{\n${lines.join(',\n')}\n}\n`);
console.log(`capture-plate-heights: ${Object.keys(heights).length} plates in ${OUT.slice(ROOT.length + 1)}`);
