/* Stack-band close-ups: each beat's copy block (the bullet layout and the
   GtLogoText brand token) in BOTH themes at 2x, the agents scan beam at
   two sweep phases, and the dwell view (tower + pinned finale + beam).
   Usage: node docs/harness/stack-closeups.mjs <shotDir> */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ executablePath: EXE });
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3006/d/singularity-orbit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const beats = await page.evaluate(() =>
    [...document.querySelectorAll('.v0-stack-beat')].map((b) => {
      const parts = b.querySelectorAll('h3, .v0-stack-points li');
      return {
        top: parts[0].getBoundingClientRect().top + window.scrollY,
        bot: parts[parts.length - 1].getBoundingClientRect().bottom + window.scrollY,
      };
    })
  );

  const readAt = (i) =>
    page.evaluate(
      ({ t, b }) => window.scrollTo(0, (t + b) / 2 - window.innerHeight * 0.55),
      { t: beats[i].top, b: beats[i].bot }
    );

  for (let i = 0; i < beats.length; i++) {
    await readAt(i);
    await page.waitForTimeout(900);
    await page
      .locator('.v0-stack-beat')
      .nth(i)
      .screenshot({ path: `${OUT}/close-b${i + 1}-${theme}.png` });
  }

  /* the beam: agents read, after the fade-in (0.45 + 0.35s), at two
     phases of the 2.5s pass so the sweep's travel is on record */
  await readAt(3);
  await page.waitForTimeout(2100);
  await page.locator('.v0-stack-fig').screenshot({ path: `${OUT}/beam-a-${theme}.png` });
  await page.waitForTimeout(1250);
  await page.locator('.v0-stack-fig').screenshot({ path: `${OUT}/beam-b-${theme}.png` });

  /* the dwell: read + 150px — tower seated, finale pinned, beam running */
  await page.evaluate(() => window.scrollTo(0, window.scrollY + 150));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/dwell-view-${theme}.png` });

  await ctx.close();
}
await browser.close();
