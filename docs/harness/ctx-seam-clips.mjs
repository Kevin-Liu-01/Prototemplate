/* Pixel-level seam clips of the review row: mat top rule, band tail
   (foot -> band bottom rule), and the left/right rail junctions, at 2x.
   Run from the app dir: node docs/harness/ctx-seam-clips.mjs <outdir> */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const page = await ctx.newPage();
await page.goto('http://localhost:3006/d/singularity-orbit', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.evaluate(() => document.querySelector('.v0-ctx-review')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(1200);

const boxes = await page.evaluate(() => {
  const mat = document.querySelector('.v0-ctx-review .tcr-mat');
  const band = document.querySelector('#context');
  const m = mat.getBoundingClientRect();
  const b = band.getBoundingClientRect();
  return {
    top: { x: b.left, y: m.top - 12, width: b.width, height: 26 },
    tail: { x: b.left, y: m.bottom - 12, width: b.width, height: b.bottom - m.bottom + 24 },
    left: { x: b.left - 6, y: m.top - 10, width: 80, height: m.height + 20 },
    right: { x: b.right - 74, y: m.top - 10, width: 80, height: m.height + 20 },
  };
});
for (const [name, clip] of Object.entries(boxes)) {
  const c = { ...clip, y: Math.max(0, clip.y) };
  await page.screenshot({ path: `${OUT}/seam-${name}.png`, clip: c });
}
console.log(JSON.stringify(boxes, null, 1));
await browser.close();
