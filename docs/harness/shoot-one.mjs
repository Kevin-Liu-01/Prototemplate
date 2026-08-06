import { chromium } from 'playwright-core';
const EXEC = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const [slug, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: EXEC, headless: true });
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
  const page = await ctx.newPage();
  await page.goto(`http://localhost:3006/d/${slug}?chrome=0`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(4200);
  await page.screenshot({ path: `${out}/${theme}/${slug}.jpg`, type: 'jpeg', quality: 84 });
  console.log(theme, 'shot');
  await ctx.close();
}
await browser.close();
