// Non-regression: the shared EdgeGlobe on its /d/toolchain bento mount.
// Usage: node docs/harness/globe-toolchain-check.mjs <outDir>
import { chromium } from 'playwright-core';

const EXEC =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const [out] = process.argv.slice(2);

const browser = await chromium.launch({ executablePath: EXEC, headless: true });
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  await page.goto('http://localhost:3006/d/toolchain?chrome=0', { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  const found = await page.evaluate(() => {
    const eg = document.querySelector('.eg');
    if (!eg) return false;
    eg.scrollIntoView({ behavior: 'instant', block: 'center' });
    return true;
  });
  await page.waitForTimeout(2500);
  if (found) {
    const card = page.locator('.eg').first().locator('xpath=ancestor::*[contains(@class,"tc-card")][1]');
    if (await card.count()) await card.screenshot({ path: `${out}/${theme}-toolchain-globe.png` });
    else await page.screenshot({ path: `${out}/${theme}-toolchain-globe.png` });
  }
  console.log(`${theme}: globe ${found ? 'found' : 'MISSING'}; ${errors.length ? errors.join(' | ') : 'zero console/page errors'}`);
  await ctx.close();
}
await browser.close();
