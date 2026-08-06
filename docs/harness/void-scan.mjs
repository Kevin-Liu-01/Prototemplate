/* Full-page black-void scanner. Takes a fullPage screenshot, feeds it back
   into the page via canvas, and reports every vertical run of "empty" rows
   (no content cluster wider than ~8px between the rail's vertical rules —
   1-2px hairlines and the accent rail do not count as content) taller than
   a threshold, mapped to the section it lives in.
   Usage: node docs/harness/void-scan.mjs [url] [light|dark] [minRun] */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL = process.argv[2] ?? 'http://localhost:3006/d/singularity-orbit';
const THEME = process.argv[3] ?? 'dark';
const MIN_RUN = Number(process.argv[4] ?? 90);

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), THEME);
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// settle reveals/GSAP: walk the page once so scroll-triggered states mount
await page.evaluate(async () => {
  const step = window.innerHeight / 2;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(800);

const shot = await page.screenshot({ fullPage: true, type: 'png' });
const dataUrl = `data:image/png;base64,${shot.toString('base64')}`;

const report = await page.evaluate(
  async ({ src, minRun }) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = src;
    });
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    // sample inside the rail's vertical rules
    const rail = document.querySelector('.tc-rail');
    const rr = rail ? rail.getBoundingClientRect() : { left: 0, right: W };
    const railLeft = Math.max(0, Math.round(rr.left + window.scrollX) + 6);
    const railRight = Math.min(W, Math.round(rr.right + window.scrollX) - 6);

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);

    const STEP = 4;
    const emptyRows = new Uint8Array(H);
    const medians = new Float32Array(H);
    for (let y = 0; y < H; y++) {
      const row = g.getImageData(railLeft, y, railRight - railLeft, 1).data;
      const n = Math.floor((railRight - railLeft) / STEP);
      const lums = new Array(n);
      for (let i = 0; i < n; i++) {
        const o = i * STEP * 4;
        lums[i] = 0.299 * row[o] + 0.587 * row[o + 1] + 0.114 * row[o + 2];
      }
      const sorted = [...lums].sort((a, b) => a - b);
      const median = sorted[n >> 1];
      medians[y] = median;
      // content clusters: consecutive samples far from the row's own ground
      let cluster = 0;
      let hasContent = false;
      for (let i = 0; i < n; i++) {
        if (Math.abs(lums[i] - median) > 10) {
          cluster++;
          if (cluster >= 3) {
            hasContent = true;
            break;
          }
        } else cluster = 0;
      }
      emptyRows[y] = hasContent ? 0 : 1;
    }
    // a full-width hairline rule punctuates a void: rows whose own ground
    // jumps away from the local ground read as content, so runs break there
    for (let y = 2; y < H - 2; y++) {
      if (!emptyRows[y]) continue;
      const local = Math.min(medians[y - 2], medians[y + 2]);
      const localMax = Math.max(medians[y - 2], medians[y + 2]);
      if (medians[y] - localMax > 8 || local - medians[y] > 8) emptyRows[y] = 0;
    }

    // section map (document coords)
    const sections = [...document.querySelectorAll('section[id], footer, nav')].map((s) => {
      const r = s.getBoundingClientRect();
      return {
        id: s.id || s.tagName.toLowerCase(),
        top: Math.round(r.top + window.scrollY),
        bottom: Math.round(r.bottom + window.scrollY),
      };
    });

    // collect runs
    const runs = [];
    let start = -1;
    for (let y = 0; y <= H; y++) {
      const e = y < H ? emptyRows[y] : 0;
      if (e && start < 0) start = y;
      if (!e && start >= 0) {
        const len = y - start;
        if (len >= minRun) {
          const mid = start + len / 2;
          const sec = sections.find((s) => mid >= s.top && mid <= s.bottom);
          runs.push({
            from: start,
            to: y,
            px: len,
            section: sec ? sec.id : '(between sections)',
          });
        }
        start = -1;
      }
    }
    return { pageH: H, railLeft, railRight, sections, runs };
  },
  { src: dataUrl, minRun: MIN_RUN }
);

console.log(JSON.stringify(report, null, 1));
await browser.close();
