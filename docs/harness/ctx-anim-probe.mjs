/* Watch the review workspace's animation for a full loop: per-row height
   min/max + typed-length ranges (layout-pumping check), then a reduced-
   motion pass with geometry + screenshot. Run from the app dir:
   node docs/harness/ctx-anim-probe.mjs <outdir> */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL = 'http://localhost:3006/d/singularity-orbit';
const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ executablePath: EXE });

// ---- pass 1: motion, watch a full loop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector('.v0-ctx-review')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(600);

  const watch = await page.evaluate(async () => {
    const cell = document.querySelector('.v0-ctx-review');
    const mat = cell.querySelector('.tcr-mat');
    const tCells = [...cell.querySelectorAll('.tcr-cell.is-t')];
    const sCells = [...cell.querySelectorAll('.tcr-cell.is-s')];
    const stat = tCells.map(() => ({ hMin: 1e9, hMax: 0, lenMin: 1e9, lenMax: 0, stamps: new Set() }));
    let matMin = 1e9, matMax = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < 30000) {
      const mh = mat.getBoundingClientRect().height;
      matMin = Math.min(matMin, mh); matMax = Math.max(matMax, mh);
      tCells.forEach((c, i) => {
        const h = c.getBoundingClientRect().height;
        const tl = c.querySelector('[data-typed]')?.textContent.length ?? -1;
        const sl = sCells[i]?.querySelector('[data-typed]')?.textContent.length ?? -1;
        const st = stat[i];
        st.hMin = Math.min(st.hMin, h); st.hMax = Math.max(st.hMax, h);
        st.lenMin = Math.min(st.lenMin, Math.min(tl, sl));
        st.lenMax = Math.max(st.lenMax, Math.max(tl, sl));
        st.stamps.add(c.querySelector('[data-stamp]')?.textContent ?? '');
      });
      await new Promise((r) => setTimeout(r, 120));
    }
    return {
      mat: { min: matMin, max: matMax },
      rows: stat.map((s) => ({ h: [s.hMin, s.hMax], len: [s.lenMin, s.lenMax], stamps: [...s.stamps] })),
    };
  });
  console.log(JSON.stringify({ pass: 'motion-loop', watch }, null, 1));
  await ctx.close();
}

// ---- pass 2: reduced motion, geometry + still
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector('.v0-ctx-review')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  const geo = await page.evaluate(() => {
    const cell = document.querySelector('.v0-ctx-review');
    const r = (el) => (el ? el.getBoundingClientRect() : null);
    const mat = cell.querySelector('.tcr-mat');
    const copy = cell.querySelector('.tcr-copy');
    const h2 = copy.querySelector('h2');
    const subs = [...copy.querySelectorAll('p, ul')];
    const last = subs[subs.length - 1] ?? h2;
    const tCells = [...cell.querySelectorAll('.tcr-cell.is-t')];
    const texts = tCells.map((c) => c.querySelector('[data-typed]')?.textContent);
    const stamps = tCells.map((c) => c.querySelector('[data-stamp]')?.textContent);
    return {
      matH: r(mat).height,
      rowHeights: tCells.map((c) => r(c).height),
      copyAboveMat: r(h2).top - r(mat).top,
      copyBelowMat: r(mat).bottom - r(last).bottom,
      texts,
      stamps,
      strikeVisible: !!cell.querySelector('.tcr-strike'),
    };
  });
  await page.screenshot({ path: `${OUT}/ctx-rm-1440.png` });
  console.log(JSON.stringify({ pass: 'reduced-motion', geo }, null, 1));
  await ctx.close();
}

await browser.close();
