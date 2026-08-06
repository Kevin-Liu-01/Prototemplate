// EdgeGlobe serving-pair verification — singularity-orbit #infrastructure.
// Shoots the globe card at rest in both themes, then rides the loop and
// captures each arrival pulse mid-flare by polling the two .eg-pulse-ring
// opacities (fra's ring fires with fra's flare, the user's with the user's).
// Usage: node docs/harness/globe-pair-shots.mjs <outDir> [slug]
import { chromium } from 'playwright-core';

const EXEC =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const [out, slug = 'singularity-orbit'] = process.argv.slice(2);
if (!out) {
  console.error('usage: node docs/harness/globe-pair-shots.mjs <outDir> [slug]');
  process.exit(2);
}

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

  await page.goto(`http://localhost:3006/d/${slug}?chrome=0`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const sec = document.querySelector('#infrastructure');
    if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(2500);

  const card = page.locator('.v0-glob .tc-cell.is-night').first();
  await card.screenshot({ path: `${out}/${theme}-globe-rest.png` });
  await page.screenshot({ path: `${out}/${theme}-section.png` });

  /* Ride the loop: poll each flash overlay's computed opacity (the flash
     tween writes it inline) and shoot mid-flash. Overlay index 0 is fra's
     (rendered inside the first callout), 1 is the user's. */
  const catchPulse = async (flashIndex, name) => {
    const deadline = Date.now() + 16000;
    while (Date.now() < deadline) {
      const alpha = await page.evaluate((i) => {
        const flashes = document.querySelectorAll('.v0-glob .eg-flash');
        const el = flashes[i];
        return el ? parseFloat(getComputedStyle(el).opacity) : -1;
      }, flashIndex);
      if (alpha > 0.55) {
        await page.waitForTimeout(60); // ride up to the flash's peak
        await card.screenshot({ path: `${out}/${theme}-${name}.png` });
        return true;
      }
      await page.waitForTimeout(30);
    }
    return false;
  };

  const gotFra = await catchPulse(0, 'pulse-fra');
  const gotUser = await catchPulse(1, 'pulse-user');
  console.log(`${theme}: rest+section shot, fra pulse ${gotFra ? 'caught' : 'MISSED'}, user pulse ${gotUser ? 'caught' : 'MISSED'}`);
  if (errors.length) console.log(`${theme} errors:\n  ${errors.join('\n  ')}`);
  else console.log(`${theme}: zero console/page errors`);
  await ctx.close();
}

await browser.close();
