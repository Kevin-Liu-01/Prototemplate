// Gallery shooter: section-anchored tiles for the Prototemplate landing wall.
// Shoots the flagship home's sections in light and dark (localStorage
// gt-theme, pre-applied by the root inline script) and at desktop/mobile
// widths, then writes manifest.json beside the tiles. Element screenshots,
// not scroll depths: each tile is one section's own box, so side-by-side
// pairs align regardless of viewport. src/app/AnatomyWall.tsx reads the
// sec-* tiles by name.
// Usage: node scripts/check/gallery-shoot.mjs <out-dir>
//   PT_BASE overrides the dev server (default http://localhost:3005).
//   CHROME_PATH overrides the browser (scripts/lib/site-pages.mjs).
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

import { BASE_URL, chromePath } from '../lib/site-pages.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const EXEC = chromePath();
const BASE = BASE_URL;

const [, , outDir] = process.argv;
if (!outDir) {
  console.error('usage: node scripts/check/gallery-shoot.mjs <out-dir>');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

// The flagship home and the section roots worth a tile of their own. The
// selectors are the section landmarks in the singularity family's markup;
// a selector that misses is reported, never fatal — the wall just skips it.
const FLAGSHIP = 'singularity-dossier';
const SECTIONS = [
  { key: 'hero', sel: '.tch-hero-sec, .sgdh-hero, header + section', label: 'Hero' },
  { key: 'customers', sel: '.v0-cust-row, .tc-row.v0-cust-row', label: 'Customers' },
  { key: 'story', sel: '.v0-stack, .tc-band.tcb', label: 'Stack story' },
  { key: 'developer', sel: '.v0-dev', label: 'Developer' },
  { key: 'locadex', sel: '.v0-ldx', label: 'Locadex' },
  { key: 'context', sel: '.v0-ctx', label: 'Context' },
  { key: 'global', sel: '.v0-glob', label: 'Global' },
  { key: 'deploy', sel: '.v0-dep', label: 'Deploy' },
  { key: 'footer', sel: '.v0-foot-rail, footer', label: 'Footer' },
];
const CUTS = [
  { key: 'desk', width: 1440, height: 900, mobile: false },
  { key: 'mob', width: 390, height: 844, mobile: true },
];
const THEMES = ['light', 'dark'];

const browser = await chromium.launch({ executablePath: EXEC });
const manifest = { flagship: FLAGSHIP, generatedFor: 'gallery', sections: [] };
const misses = [];

async function settle(page) {
  // one full scroll pass boots every lazy/armed section, then back to top
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

async function newPage(cut, theme) {
  // reduced motion: every engine parks its designed standing pose — the
  // hero prints the settled headline instead of mid-dissolve dust, the
  // belt holds, the story shows its static cut. A tile is a pose, never
  // a frame of an animation.
  const context = await browser.newContext({
    viewport: { width: cut.width, height: cut.height },
    deviceScaleFactor: 2,
    isMobile: cut.mobile,
    hasTouch: cut.mobile,
    reducedMotion: 'reduce',
  });
  await context.addInitScript((t) => {
    try { localStorage.setItem('gt-theme', t); } catch {}
  }, theme);
  return context;
}

for (const cut of CUTS) {
  for (const theme of THEMES) {
    const context = await newPage(cut, theme);
    const page = await context.newPage();
    await page.goto(`${BASE}/d/${FLAGSHIP}?chrome=0`, { waitUntil: 'load', timeout: 120000 });
    // production-mount framing: the landing hides the field switcher dock
    // and its chips (home.css), so the tiles hide the same instruments
    await page.addStyleTag({ content: '.hfs,.fxm-chip,.fxm-k{display:none!important}' });
    await settle(page);
    for (const sec of SECTIONS) {
      const loc = page.locator(sec.sel).first();
      try {
        await loc.scrollIntoViewIfNeeded({ timeout: 4000 });
        await page.waitForTimeout(500);
        const file = `sec-${sec.key}-${cut.key}-${theme}.jpg`;
        await loc.screenshot({ path: path.join(outDir, file), timeout: 8000, type: 'jpeg', quality: 82 });
        manifest.sections.push({ key: sec.key, label: sec.label, cut: cut.key, theme, file });
      } catch (e) {
        misses.push(`${sec.key}@${cut.key}/${theme}: ${String(e).slice(0, 90)}`);
      }
    }
    await context.close();
  }
}

writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ tiles: manifest.sections.length, misses }, null, 2));
await browser.close();
