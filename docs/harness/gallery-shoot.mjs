// Gallery shooter: section-anchored tiles for the Prototemplate landing wall.
// Shoots the flagship home's sections plus every variant home's hero, in
// light and dark (localStorage gt-theme, pre-applied by the root inline
// script) and at desktop/mobile widths, then writes a manifest the gallery
// page imports. Element screenshots, not scroll depths — each tile is one
// section's own box, so side-by-side pairs align regardless of viewport.
// Usage: node gallery-shoot.mjs <out-dir> [--flagship-only|--variants-only]
//   REDESIGN_BASE overrides the dev server (default http://localhost:3006).
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const EXEC =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = process.env.REDESIGN_BASE || 'http://localhost:3006';

const [, , outDir, mode] = process.argv;
if (!outDir) {
  console.error('usage: node gallery-shoot.mjs <out-dir> [--flagship-only|--variants-only]');
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
const VARIANTS = [
  'singularity-dossier', 'singularity-signal', 'singularity-orbit', 'toolchain',
  'glyph-rain', 'dither-field', 'event-horizon', 'lens-gate', 'prism-light',
  'aurora-paper', 'paper-foundry', 'hourglass', 'terminus-board', 'wide-rule',
  'chroma-flow', 'singularity', 'concrete-mono', 'concrete-origin', 'concrete-source',
  'archive-press', 'bento-foundry', 'blueprint-atlas', 'field-magnet',
  'flipboard-terminus', 'kinetic-verba', 'typographic-broadcast', 'white-gallery',
];
const CUTS = [
  { key: 'desk', width: 1440, height: 900, mobile: false },
  { key: 'mob', width: 390, height: 844, mobile: true },
];
const THEMES = ['light', 'dark'];

const browser = await chromium.launch({ executablePath: EXEC });
const manifest = { flagship: FLAGSHIP, generatedFor: 'gallery', sections: [], variants: [] };
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

if (mode !== '--variants-only') {
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
}

if (mode !== '--flagship-only') {
  // variant wall: hero viewport shot per home, desktop, both themes
  for (const theme of THEMES) {
    const context = await newPage(CUTS[0], theme);
    const page = await context.newPage();
    for (const slug of VARIANTS) {
      try {
        await page.goto(`${BASE}/d/${slug}?chrome=0`, { waitUntil: 'load', timeout: 90000 });
        await page.addStyleTag({ content: '.hfs,.fxm-chip,.fxm-k{display:none!important}' });
        await page.waitForTimeout(2500);
        const file = `var-${slug}-${theme}.jpg`;
        await page.screenshot({ path: path.join(outDir, file), type: 'jpeg', quality: 82 });
        manifest.variants.push({ slug, theme, file });
      } catch (e) {
        misses.push(`${slug}@${theme}: ${String(e).slice(0, 90)}`);
      }
    }
    await context.close();
  }
}

writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ tiles: manifest.sections.length, variants: manifest.variants.length, misses }, null, 2));
await browser.close();
