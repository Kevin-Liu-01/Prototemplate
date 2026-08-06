import { chromium } from 'playwright-core';
const EXE = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const S = '/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/4a0c8a33-b34b-43b6-b98d-dcbcef60f24f/scratchpad';
const SLUGS = ['singularity-dossier','singularity-orbit','singularity-signal','singularity-observatory','singularity-procession'];
const b = await chromium.launch({ executablePath: EXE });
for (const theme of ['dark','light']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 });
  await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
  for (const slug of SLUGS) {
    const p = await ctx.newPage();
    await p.goto('http://localhost:3006/d/' + slug, { waitUntil: 'networkidle' });
    await p.waitForSelector('.v0-cust', { timeout: 30000 });
    await p.waitForTimeout(1200);
    const g = await p.evaluate(() => {
      const cust = document.querySelector('.v0-cust').getBoundingClientRect();
      const rail = document.querySelector('.tc-rail').getBoundingClientRect();
      return { top: cust.top + scrollY, bot: cust.bottom + scrollY, L: rail.left, R: rail.right };
    });
    for (const [tag, x, y] of [['TL', g.L, g.top], ['BR', g.R, g.bot]]) {
      await p.evaluate((yy) => window.scrollTo(0, yy - 400), y);
      await p.waitForTimeout(400);
      const vy = y - (await p.evaluate(() => window.scrollY));
      await p.screenshot({ path: `${S}/x-${slug.replace('singularity-','')}-${theme}-${tag}.png`, clip: { x: x - 12, y: vy - 12, width: 24, height: 24 } });
    }
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log('done');
