import { chromium } from 'playwright-core';
const EXE = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const S = '/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/4a0c8a33-b34b-43b6-b98d-dcbcef60f24f/scratchpad';
const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const p = await ctx.newPage();
await p.goto('http://localhost:3006/d/singularity-dossier', { waitUntil: 'networkidle' });
await p.waitForSelector('.v0-cust', { timeout: 30000 }); await p.waitForTimeout(1200);
const g = await p.evaluate(() => {
  const cust = document.querySelector('.v0-cust').getBoundingClientRect();
  const rail = document.querySelector('.tc-rail').getBoundingClientRect();
  return { custTop: cust.top + scrollY, custBot: cust.bottom + scrollY, railL: rail.left, railR: rail.right };
});
console.log(JSON.stringify(g));
// top-left of customers (hero seam x left rail) and bottom-right (tower seam x right rail)
for (const [name, x, y] of [
  ['cust-topleft', g.railL, g.custTop],
  ['cust-botright', g.railR, g.custBot],
]) {
  await p.evaluate((yy) => window.scrollTo(0, yy - 400), y);
  await p.waitForTimeout(600);
  const vy = y - (await p.evaluate(() => window.scrollY));
  await p.screenshot({ path: `${S}/${name}.png`, clip: { x: x - 15, y: vy - 15, width: 30, height: 30 } });
}
await b.close();
