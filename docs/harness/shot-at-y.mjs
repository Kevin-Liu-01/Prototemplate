/* Screenshot the viewport centered on a document y. Usage:
   node docs/harness/shot-at-y.mjs <url> <theme> <outPath> <y...> */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const [url, theme, out, ...ys] = process.argv.slice(2);

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
for (const y of ys) {
  await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy - window.innerHeight / 2)), Number(y));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/y${y}.png` });
  console.log(`shot y${y}`);
}
await browser.close();
