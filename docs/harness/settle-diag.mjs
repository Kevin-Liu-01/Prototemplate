/* Dump the settle's actual y-curve around the rest view.
   Usage: node docs/harness/settle-diag.mjs [w] [h] */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const W = Number(process.argv[2] ?? 1926);
const H = Number(process.argv[3] ?? 1002);

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const page = await ctx.newPage();
await page.goto('http://localhost:3006/d/singularity-orbit', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const base = await page.evaluate(() => {
  const sec = document.querySelector('#platform');
  const r = sec.getBoundingClientRect();
  const figcol = document.querySelector('.v0-stack-figcol').getBoundingClientRect();
  const fig = document.querySelector('.v0-stack-fig');
  return {
    secTop: r.top + window.scrollY,
    secBottom: r.bottom + window.scrollY,
    figcolBottom: figcol.bottom + window.scrollY,
    seat: parseFloat(getComputedStyle(fig).top),
    figH: fig.offsetHeight,
  };
});
const rest = base.secBottom - H;

const rows = [];
for (let off = -400; off <= 300; off += 50) {
  await page.evaluate((y) => window.scrollTo(0, y), rest + off);
  await page.waitForTimeout(250);
  const s = await page.evaluate(() => {
    const fig = document.querySelector('.v0-stack-fig');
    const t = getComputedStyle(fig).transform;
    const m = t.match(/matrix\(([^)]+)\)/);
    const y = m ? parseFloat(m[1].split(',')[5]) : 0;
    const fr = fig.getBoundingClientRect();
    const sec = document.querySelector('#platform').getBoundingClientRect();
    return { y: Math.round(y * 10) / 10, figTop: Math.round(fr.top), figBottom: Math.round(fr.bottom), rule: Math.round(sec.bottom) };
  });
  rows.push({ off, ...s, gapToRule: s.rule - s.figBottom });
}
console.log(JSON.stringify({ viewport: `${W}x${H}`, base, rest, rows }, null, 1));
await browser.close();
