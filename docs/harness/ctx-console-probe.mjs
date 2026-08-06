/* Console/page-error watch while loading /d/singularity-orbit and dwelling
   on the review row. Run from the app dir. */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({ executablePath: EXE });
const errors = [];
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push({ theme, type: m.type(), text: m.text() });
  });
  page.on('pageerror', (e) => errors.push({ theme, type: 'pageerror', text: String(e) }));
  await page.goto('http://localhost:3006/d/singularity-orbit', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('.v0-ctx-review')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(8000);
  await ctx.close();
}
console.log(JSON.stringify({ count: errors.length, errors }, null, 1));
await browser.close();
