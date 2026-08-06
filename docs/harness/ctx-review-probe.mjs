/* Probe the v0 context band's review row (.v0-ctx-review) on
   /d/singularity-orbit: workspace part heights, copy centering offsets,
   and the band tail. Usage: node docs/harness/ctx-review-probe.mjs <outdir>
   (run from the app dir). */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL = 'http://localhost:3006/d/singularity-orbit';
const OUT = process.argv[2] ?? '.';
const THEME = process.argv[3] ?? 'dark';

const browser = await chromium.launch({ executablePath: EXE });

for (const vp of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const theme = THEME;
  await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    const el = document.querySelector('.v0-ctx-review');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(1400);

  const geo = await page.evaluate(() => {
    const cell = document.querySelector('.v0-ctx-review');
    if (!cell) return { missing: true };
    const sec = cell.querySelector('.tcr');
    const grid = cell.querySelector('.tcr-grid');
    const copy = cell.querySelector('.tcr-copy');
    const mat = cell.querySelector('.tcr-mat');
    const ws = cell.querySelector('.tcr-ws');
    const bar = cell.querySelector('.tcr-bar');
    const foot = cell.querySelector('.tcr-foot');
    const labs = [...cell.querySelectorAll('.tcr-lab')];
    const tCells = [...cell.querySelectorAll('.tcr-cell.is-t')];
    const r = (el) => (el ? el.getBoundingClientRect() : null);
    const cellR = r(cell);
    const copyR = r(copy);
    const matR = r(mat);
    // copy content extent (h2 top → last p bottom)
    const h2R = r(copy?.querySelector('h2'));
    const subs = copy ? [...copy.querySelectorAll('p, ul')] : [];
    const lastR = subs.length ? r(subs[subs.length - 1]) : h2R;
    const band = document.querySelector('#context');
    const bandR = r(band);
    return {
      cellH: cellR.height,
      secH: r(sec)?.height,
      gridH: r(grid)?.height,
      matH: matR?.height,
      wsH: r(ws)?.height,
      barH: r(bar)?.height,
      labH: labs[0] ? r(labs[0]).height : null,
      rowHeights: tCells.map((c) => r(c).height),
      footH: r(foot)?.height,
      copyBoxH: copyR?.height,
      copyContentH: h2R && lastR ? lastR.bottom - h2R.top : null,
      // centering: space above copy content vs below, measured against the mat
      copyAboveMat: h2R && matR ? h2R.top - matR.top : null,
      copyBelowMat: lastR && matR ? matR.bottom - lastR.bottom : null,
      // band tail: foot bottom → band bottom rule
      footToBandBottom: foot && bandR ? bandR.bottom - r(foot).bottom : null,
      matToBandBottom: matR && bandR ? bandR.bottom - matR.bottom : null,
      // last row typed text sample (animation liveness check hook)
      lastRowText: tCells.length
        ? tCells[tCells.length - 1].querySelector('[data-typed]')?.textContent
        : null,
    };
  });

  // watch the last row's typed text + row height over time (layout pumping check)
  const pump = await page.evaluate(async () => {
    const tCells = [...document.querySelectorAll('.v0-ctx-review .tcr-cell.is-t')];
    const last = tCells[tCells.length - 1];
    if (!last) return { missing: true };
    const typed = last.querySelector('[data-typed]');
    const samples = [];
    for (let i = 0; i < 14; i++) {
      samples.push({
        len: typed?.textContent.length ?? -1,
        h: last.getBoundingClientRect().height,
      });
      await new Promise((res) => setTimeout(res, 500));
    }
    return { samples };
  });

  await page.screenshot({ path: `${OUT}/ctx-${theme}-${vp.width}.png` });
  console.log(JSON.stringify({ vp: vp.width, theme, geo, pump }, null, 1));
  await ctx.close();
}
await browser.close();
