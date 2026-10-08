// Render one or more slides of the deck to 1600x900 JPEGs, light and dark.
//   node shoot-slide.mjs 8            -> preview/s08-light.jpg, preview/s08-dark.jpg
//   node shoot-slide.mjs 8 15 22      -> those three
//   node shoot-slide.mjs all          -> every slide
// Writes the source assemble.mjs builds to a private temp file (safe to run
// concurrently), with images as relative shots/ paths. Chromium comes from
// CHROME_PATH as scripts/site-pages.mjs resolves it.
import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { CHROME_PATH } from '../scripts/site-pages.mjs';
import { assemble, slideFiles } from './assemble.mjs';
/* this script's folder: deck/, or a copy's folder beside it */
const D = dirname(fileURLToPath(import.meta.url));
mkdirSync(`${D}/preview`, { recursive: true });
mkdirSync(`${D}/tmp`, { recursive: true });

const src = assemble(D);
const files = slideFiles(D);
const args = process.argv.slice(2);
const want = args.length === 0 || args[0] === 'all' ? files.map((_, k) => k + 1) : args.map(Number).filter((n) => n >= 1 && n <= files.length);
const tag = want.join('-').slice(0, 40) + '-' + process.pid;
const tmp = `${D}/tmp/preview-${tag}.html`;
writeFileSync(tmp, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{color-scheme:light dark}body{margin:0}</style></head><body>${src}</body></html>`);

// file:// pages taint a canvas that reads another file, so the mood grids need file access to screen
const browser = await chromium.launch({ executablePath: CHROME_PATH, args: ['--allow-file-access-from-files'] });
const errors = [];
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  // parts/tail.html opens dark unless a theme is stored and never consults prefers-color-scheme, so seed the stored theme per pass
  await ctx.addInitScript((t) => { try { localStorage.setItem('gt-theme', t); localStorage.setItem('gt-deck-theme', t); } catch (e) {} }, scheme);
  page.on('pageerror', (e) => errors.push(`${scheme}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${scheme} console: ${m.text()}`); });
  await page.goto(`file://${tmp}#${want[0]}`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  // present mode: chrome hidden, the sheet fills the 1600x900 viewport exactly
  await page.evaluate((t) => { document.documentElement.setAttribute('data-theme', t); }, scheme);
  await page.keyboard.press('p');
  await page.waitForTimeout(250);
  for (const n of want) {
    await page.evaluate((k) => { location.hash = '#' + k; }, n);
    await page.waitForTimeout(220);
    // report overflow: any element inside the current slide that leaves the 1600x900 sheet
    const over = await page.evaluate(() => {
      const slide = document.querySelector('#stage .slide.is-on'); if (!slide) return [];
      const out = [];
      slide.querySelectorAll('*').forEach((el) => {
        const r = el.getBoundingClientRect(); if (!r.width && !r.height) return;
        if (r.right > 1601 || r.bottom > 901 || r.left < -1 || r.top < -1) out.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      });
      return out.slice(0, 6);
    });
    if (over.length) console.log(`overflow s${String(n).padStart(2, '0')} ${scheme}:`, over.join(' | '));
    await page.screenshot({ path: `${D}/preview/s${String(n).padStart(2, '0')}-${scheme}.jpg`, type: 'jpeg', quality: 82 });
  }
  await ctx.close();
}
await browser.close();
try { unlinkSync(tmp); } catch (e) {}
console.log('shot', want.length, 'slide(s) light+dark ->', `${D}/preview/sNN-{light,dark}.jpg`, errors.length ? 'ERRORS ' + JSON.stringify(errors) : 'no page errors');
