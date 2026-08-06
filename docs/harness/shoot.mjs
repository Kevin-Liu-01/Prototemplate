// Screenshot harness for redesign samples.
// Usage: node shoot.mjs <absolute-html-path> <out-dir>
// Captures desktop viewport shots at several scroll depths (letting GSAP
// ScrollTrigger animations fire), plus mobile hero/mid/end shots.
// Prints a JSON summary (shot paths + page errors) to stdout.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const EXEC = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const [, , htmlPath, outDir] = process.argv;
if (!htmlPath || !outDir) {
  console.error('usage: node shoot.mjs <html> <outdir>');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const url = pathToFileURL(path.resolve(htmlPath)).href;
const errors = [];
const shots = [];

const browser = await chromium.launch({ executablePath: EXEC, headless: true });

async function shootAt(page, tag, fraction) {
  await page.evaluate((f) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.round(max * f);
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
      window.lenis.scrollTo(y, { immediate: true, force: true });
    }
    window.scrollTo(0, y);
    window.dispatchEvent(new Event('scroll'));
  }, fraction);
  await page.waitForTimeout(1100);
  const file = path.join(outDir, `${tag}.png`);
  await page.screenshot({ path: file });
  shots.push(file);
}

async function run(viewport, dsf, prefix, fractions) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`[${prefix}] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${prefix}] console: ${m.text()}`);
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
  } catch {
    errors.push(`[${prefix}] networkidle timeout (page may still render)`);
  }
  await page.waitForTimeout(2000); // let intro animation play
  for (let i = 0; i < fractions.length; i++) {
    await shootAt(page, `${prefix}${String(i).padStart(2, '0')}`, fractions[i]);
  }
  await ctx.close();
}

try {
  await run({ width: 1440, height: 900 }, 2, 'd', [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.9, 1]);
  await run({ width: 390, height: 844 }, 2, 'm', [0, 0.33, 0.66, 1]);
} finally {
  await browser.close();
}

const summary = { html: htmlPath, shots, errorCount: errors.length, errors: errors.slice(0, 20) };
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
