/* Settle verification for the v0 stack tower (#platform).
   Run from the app dir: node docs/harness/settle-verify.mjs <outdir>
   Covers: rest-view void, beats 1–3 reads, beat-04 lock-in state,
   release smoothness (50px steps), fast-scrub jump, reduced motion,
   console errors. */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL = 'http://localhost:3006/d/singularity-orbit';
const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ executablePath: EXE });

const measure = () => {
  const sec = document.querySelector('#platform');
  const secR = sec.getBoundingClientRect();
  const fig = sec.querySelector('.v0-stack-fig');
  const figR = fig.getBoundingClientRect(); // transform-included
  const seat = parseFloat(getComputedStyle(fig).top) || 0;
  const tf = getComputedStyle(fig).transform;
  const y = tf && tf !== 'none' ? parseFloat(tf.split(',').pop()) : 0;
  const beats = [...sec.querySelectorAll('[data-stack-beat]')];
  const beatState = beats.map((b) => (b.classList.contains('is-hot') ? 'hot' : 'cold'));
  const last = beats[beats.length - 1];
  const h3 = last.querySelector('h3').getBoundingClientRect();
  const p = last.querySelector('p').getBoundingClientRect();
  const copy = { top: h3.top, bottom: p.bottom };
  const slabs = [...sec.querySelectorAll('[data-tower-slab]')].map((s) => ({
    hot: s.classList.contains('is-hot'),
    opacity: getComputedStyle(s).opacity,
    visibility: getComputedStyle(s).visibility,
  }));
  const rail = sec.querySelector('[data-rail-line]');
  const railTf = rail ? rail.getAttribute('transform') || getComputedStyle(rail).transform : null;
  const overlap = Math.min(figR.bottom, copy.bottom) - Math.max(figR.top, copy.top);
  return {
    vh: innerHeight,
    scrollY: scrollY,
    secTop: secR.top,
    secBottom: secR.bottom,
    seat,
    figY: y,
    figTop: figR.top,
    figBottom: figR.bottom,
    figGap: secR.bottom - figR.bottom,
    copyTop: copy.top,
    copyBottom: copy.bottom,
    copyGap: secR.bottom - copy.bottom,
    copyOverlapsFig: overlap,
    fullWidthRun: secR.bottom - Math.max(figR.bottom, copy.bottom),
    beatState,
    slabs,
    railTf,
  };
};

const restScroll = () => {
  const sec = document.querySelector('#platform');
  const r = sec.getBoundingClientRect();
  return Math.round(scrollY + r.bottom - innerHeight);
};

for (const vp of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  const errors = [];
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const rest = await page.evaluate(restScroll);

  // ---- 1. REST VIEW
  await page.evaluate((p) => window.scrollTo(0, p), rest);
  await page.waitForTimeout(900);
  const restGeo = await page.evaluate(measure);
  await page.screenshot({ path: `${OUT}/v-${vp.width}-1-rest.png` });

  // ---- 2. beats 1–3 reads: beat element center at viewport center
  const beatReads = [];
  for (let i = 0; i < 3; i++) {
    await page.evaluate((idx) => {
      const b = document.querySelectorAll('[data-stack-beat]')[idx];
      const r = b.getBoundingClientRect();
      window.scrollTo(0, scrollY + r.top + r.height / 2 - innerHeight / 2);
    }, i);
    await page.waitForTimeout(800);
    const g = await page.evaluate(measure);
    beatReads.push({
      beat: i,
      figTop: g.figTop,
      seat: g.seat,
      figY: g.figY,
      figCenter: (g.figTop + g.figBottom) / 2,
      vhCenter: g.vh / 2,
      beatState: g.beatState,
    });
    await page.screenshot({ path: `${OUT}/v-${vp.width}-2-beat${i + 1}.png` });
  }

  // ---- 3. beat-04 lock-in: finale window top at 58% line
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-stack-beat]')].pop();
    const r = b.getBoundingClientRect();
    window.scrollTo(0, Math.round(scrollY + r.top - innerHeight * 0.58) + 2);
  });
  await page.waitForTimeout(800);
  const lockGeo = await page.evaluate(measure);
  await page.screenshot({ path: `${OUT}/v-${vp.width}-3-lockin.png` });

  // ---- 4. release smoothness: 50px steps across settle + glue
  const series = [];
  for (let s = rest - 400; s <= rest + 320; s += 50) {
    await page.evaluate((p) => window.scrollTo(0, p), s);
    await page.waitForTimeout(120);
    const g = await page.evaluate(measure);
    series.push({ at: s - rest, figTop: +g.figTop.toFixed(1), figBottom: +g.figBottom.toFixed(1), figY: +g.figY.toFixed(1) });
  }

  // ---- 5. fast-scrub: hard jump from page top to the rest view
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.evaluate((p) => window.scrollTo(0, p), rest);
  await page.waitForTimeout(1000);
  const jumpGeo = await page.evaluate(measure);
  await page.screenshot({ path: `${OUT}/v-${vp.width}-5-jump.png` });

  console.log(
    JSON.stringify({ vp, rest: restGeo, beatReads, lockin: lockGeo, series, jump: jumpGeo, consoleErrors: errors }, null, 1)
  );
  await ctx.close();

  // ---- 6. reduced motion (1440 & 1920 both)
  const rctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await rctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
  const rpage = await rctx.newPage();
  const rerrors = [];
  rpage.on('pageerror', (e) => rerrors.push(String(e)));
  await rpage.goto(URL, { waitUntil: 'networkidle' });
  await rpage.waitForTimeout(1000);
  const rrest = await rpage.evaluate(restScroll);
  await rpage.evaluate((p) => window.scrollTo(0, p), rrest);
  await rpage.waitForTimeout(600);
  const rGeo = await rpage.evaluate(measure);
  await rpage.screenshot({ path: `${OUT}/v-${vp.width}-6-reduced.png` });
  console.log(JSON.stringify({ vp, reduced: rGeo, reducedErrors: rerrors }, null, 1));
  await rctx.close();
}
await browser.close();
