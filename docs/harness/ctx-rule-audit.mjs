/* Numeric line-law audit for the review row: collect every horizontal and
   vertical border edge drawn inside #context near the review row (elements
   + the tcr-mat pseudo rules), then flag pairs closer than 0.75px. */
import { chromium } from 'playwright-core';
const EXE = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const page = await ctx.newPage();
await page.goto('http://localhost:3006/d/singularity-orbit', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.evaluate(() => document.querySelector('.v0-ctx-review')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(1200);
const audit = await page.evaluate(() => {
  const band = document.querySelector('#context');
  const cell = document.querySelector('.v0-ctx-review');
  const cellR = cell.getBoundingClientRect();
  const yLo = cellR.top - 8, yHi = band.getBoundingClientRect().bottom + 2;
  const H = [], V = [];
  const label = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 3).join('.') : '');
  const push = (el, s, r, tag) => {
    if (parseFloat(s.borderTopWidth) > 0 && r.top >= yLo && r.top <= yHi) H.push({ y: r.top, who: tag + ':top' });
    if (parseFloat(s.borderBottomWidth) > 0 && r.bottom >= yLo && r.bottom <= yHi) H.push({ y: r.bottom, who: tag + ':bottom' });
    if (parseFloat(s.borderLeftWidth) > 0 && r.bottom > yLo && r.top < yHi) V.push({ x: r.left, who: tag + ':left' });
    if (parseFloat(s.borderRightWidth) > 0 && r.bottom > yLo && r.top < yHi) V.push({ x: r.right, who: tag + ':right' });
  };
  for (const el of [band, ...band.querySelectorAll('*')]) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    push(el, getComputedStyle(el), r, label(el));
    for (const pseudo of ['::before', '::after']) {
      const ps = getComputedStyle(el, pseudo);
      if (ps.content === 'none') continue;
      // pseudo rect approximation: absolute-inset pseudos of tcr-mat span known offsets
      if (el.classList.contains('tcr-mat')) {
        if (pseudo === '::before') {
          if (parseFloat(ps.borderTopWidth) > 0) H.push({ y: r.top, who: 'tcr-mat::before:top' });
          if (parseFloat(ps.borderBottomWidth) > 0) H.push({ y: r.bottom, who: 'tcr-mat::before:bottom' });
        } else {
          if (parseFloat(ps.borderLeftWidth) > 0) V.push({ x: r.left, who: 'tcr-mat::after:left' });
          if (parseFloat(ps.borderRightWidth) > 0) V.push({ x: r.right, who: 'tcr-mat::after:right' });
        }
      }
    }
  }
  const pairs = (arr, key) => {
    const sorted = [...arr].sort((a, b) => a[key] - b[key]);
    const out = [];
    for (let i = 1; i < sorted.length; i++) {
      const d = sorted[i][key] - sorted[i - 1][key];
      if (d < 0.75 && sorted[i].who !== sorted[i - 1].who) out.push({ d, a: sorted[i - 1], b: sorted[i] });
    }
    return out;
  };
  return { hEdges: H.sort((a,b)=>a.y-b.y), vEdges: V.sort((a,b)=>a.x-b.x), hDoubles: pairs(H, 'y'), vDoubles: pairs(V, 'x') };
});
console.log(JSON.stringify(audit, null, 1));
await browser.close();
