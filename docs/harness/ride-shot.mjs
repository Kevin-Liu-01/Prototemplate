import { chromium } from 'playwright-core';
const EXE = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = process.argv[2] ?? '.';
const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const page = await ctx.newPage();
await page.goto('http://localhost:3006/d/singularity-orbit', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const rest = await page.evaluate(() => {
  const r = document.querySelector('#platform').getBoundingClientRect();
  return Math.round(scrollY + r.bottom - innerHeight);
});
for (const off of [150, 300]) {
  await page.evaluate((p) => window.scrollTo(0, p), rest + off);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/v-1920-7-ride${off}.png` });
}
await browser.close();
