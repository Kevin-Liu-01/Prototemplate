// Measures frame pacing and WebGL context count on the heaviest directions.
// Counts contexts by wrapping getContext before any page script runs, so the
// number reflects what the app actually creates rather than what a probe adds.
import { chromium } from 'playwright-core';

const EXEC = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:3005';
const SLUGS = process.argv.slice(2);
if (!SLUGS.length) SLUGS.push('field-magnet', 'concrete-source', 'blueprint-atlas');

const browser = await chromium.launch({ executablePath: EXEC, headless: true });

for (const slug of SLUGS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  await page.addInitScript(() => {
    const w = window;
    w.__glCount = 0;
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (typeof type === 'string' && type.indexOf('webgl') === 0) w.__glCount++;
      return orig.call(this, type, ...rest);
    };
  });

  await page.goto(`${BASE}/d/${slug}?chrome=0`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);

  // Sample rAF intervals while scrolling, which is when the story timelines,
  // canvases and the shader all compete.
  const result = await page.evaluate(async () => {
    const samples = [];
    let last = performance.now();
    let frames = 0;
    const maxY = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    await new Promise((resolve) => {
      function frame(now) {
        samples.push(now - last);
        last = now;
        frames++;
        // Drive the page through its scroll while sampling.
        const y = Math.round((frames / 180) * maxY * 0.5);
        if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
        if (frames < 180) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });

    samples.sort((a, b) => a - b);
    const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
    const p95 = samples[Math.floor(samples.length * 0.95)];
    const longFrames = samples.filter((v) => v > 20).length;
    return {
      glContexts: window.__glCount,
      canvases: document.querySelectorAll('canvas').length,
      meanFrameMs: +mean.toFixed(2),
      medianMs: +samples[Math.floor(samples.length / 2)].toFixed(2),
      p95Ms: +p95.toFixed(2),
      longFrames,
      approxFps: +(1000 / mean).toFixed(1),
    };
  });

  console.log(`${slug.padEnd(20)} contexts=${result.glContexts} canvases=${result.canvases} median=${result.medianMs}ms p95=${result.p95Ms}ms fps~${result.approxFps} longFrames=${result.longFrames}/180`);
  await ctx.close();
}

await browser.close();
