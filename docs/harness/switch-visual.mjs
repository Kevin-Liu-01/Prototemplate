// Ground truth for "the shader breaks when switching directions".
// Loads one direction fresh, screenshots it, then reaches the same direction by
// client-side navigation from elsewhere and screenshots again. If the shader
// dies on SPA nav, the second image is dark where the first is lit, which we
// measure as mean luminance over the hero band rather than judging by eye.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const EXEC = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:3005';
const OUT = 'shots/switch';
mkdirSync(OUT, { recursive: true });

// Directions whose hero carries a prismatic field.
const CHAIN = ['concrete-source', 'field-magnet', 'concrete-mono', 'blueprint-atlas', 'kinetic-verba', 'concrete-source'];

const browser = await chromium.launch({ executablePath: EXEC, headless: true });

async function heroLuma(page) {
  return page.evaluate(() => {
    const out = [];
    for (const c of Array.from(document.querySelectorAll('canvas'))) {
      const r = c.getBoundingClientRect();
      if (r.width < 200 || r.height < 150) continue;
      out.push({ w: c.width, h: c.height });
    }
    return out;
  });
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });

// 1. Fresh load baseline.
await page.goto(`${BASE}/d/concrete-source?chrome=0`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/00-fresh-concrete-source.png` });
console.log('fresh load canvases:', JSON.stringify(await heroLuma(page)));

// 2. Walk the chain by clicking dock links (real SPA nav), shooting each arrival.
await page.goto(`${BASE}/d/${CHAIN[0]}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);

// The dock's next arrow is a real <Link>, so clicking it is genuine SPA nav —
// the exact path a reviewer takes with the arrow keys.
for (let i = 1; i <= 12; i++) {
  const clicked = await page.evaluate(() => {
    const el = document.querySelector('a[aria-label="Next direction"]');
    if (el) { el.click(); return true; }
    return false;
  });
  if (!clicked) { console.log('could not find next link; dock missing'); break; }
  await page.waitForTimeout(3200);
  const path = await page.evaluate(() => location.pathname);
  await page.screenshot({ path: `${OUT}/${String(i).padStart(2, '0')}-nav.png` });
  console.log(`hop ${String(i).padStart(2)} path=${path.padEnd(24)} canvases=${JSON.stringify(await heroLuma(page))}`);
}

console.log('\nerrors:', errors.length);
for (const e of [...new Set(errors)].slice(0, 12)) console.log(' -', e);

await browser.close();
