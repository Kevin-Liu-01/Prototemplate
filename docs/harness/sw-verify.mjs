/* SentenceWidth truth check: for every diagram instance on the page,
   re-measure each row's TEXT independently (Range + canvas measureText)
   and compare the computed deltas against the printed % labels.
   Usage: node docs/harness/sw-verify.mjs [url] */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL = process.argv[2] ?? 'http://localhost:3006/d/singularity-orbit';

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
// settle fonts + the component's own fonts.ready rebuild
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  const out = [];
  for (const sw of document.querySelectorAll('.lang-sw')) {
    const rows = [...sw.querySelectorAll('[data-sw-row]')];
    const lines = [...sw.querySelectorAll('[data-sw-line]')];
    const pcts = [...sw.querySelectorAll('[data-sw-pct]')];
    if (!lines.length) continue;

    const rangeW = (el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return r.getBoundingClientRect().width;
    };
    const canvas = document.createElement('canvas');
    const g = canvas.getContext('2d');
    const canvasW = (el) => {
      const cs = getComputedStyle(el);
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} / ${cs.lineHeight} ${cs.fontFamily}`;
      let spacing = parseFloat(cs.letterSpacing);
      if (Number.isNaN(spacing)) spacing = 0;
      const text = el.textContent ?? '';
      return g.measureText(text).width + spacing * Math.max(0, text.length - 1);
    };

    const range = lines.map(rangeW);
    const canv = lines.map(canvasW);
    const dRange = range.map((w) => Math.round((w / range[0] - 1) * 100));
    const dCanvas = canv.map((w) => Math.round((w / canv[0] - 1) * 100));
    const printed = pcts.map((el) => el.textContent);

    const rowsOut = lines.map((el, i) => ({
      text: (el.textContent ?? '').slice(0, 28),
      rangePx: Math.round(range[i] * 10) / 10,
      canvasPx: Math.round(canv[i] * 10) / 10,
      deltaRange: i === 0 ? 'base' : `${dRange[i] > 0 ? '+' : ''}${dRange[i]}%`,
      deltaCanvas: i === 0 ? 'base' : `${dCanvas[i] > 0 ? '+' : ''}${dCanvas[i]}%`,
      printed: i === 0 ? '(source)' : (printed[i - 1] ?? '(none)'),
      match:
        i === 0 ||
        (printed[i - 1] ?? '').replace('−', '-') === `${dRange[i] > 0 ? '+' : '-'}${Math.abs(dRange[i])}%`,
    }));
    // box width sanity: box should be text + 2*PAD + 3 walls, never padded twice
    const boxes = [...sw.querySelectorAll('[data-sw-box]')];
    const boxDelta = boxes.map((b, i) => Math.round((b.getBoundingClientRect().width - range[i]) * 10) / 10);
    out.push({ rows: rowsOut, boxMinusText: boxDelta, rowCount: rows.length });
  }
  return out;
});

console.log(JSON.stringify(report, null, 1));
await browser.close();
