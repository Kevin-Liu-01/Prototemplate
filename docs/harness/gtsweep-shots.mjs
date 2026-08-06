// GT-logo-text sweep verification: scroll each replacement site into view on
// the page that hosts it, shoot 1440x900 viewport + a zoomed element clip,
// light and dark, and report console/page errors for all five homes.
// Usage: node docs/harness/gtsweep-shots.mjs <out-dir>
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
import path from 'path';

const EXEC = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = process.env.REDESIGN_BASE || 'http://localhost:3006';

const outDir = process.argv[2];
if (!outDir) { console.error('usage: node gtsweep-shots.mjs <out-dir>'); process.exit(2); }
mkdirSync(outDir, { recursive: true });

// Every replacement site, on a host page. ContextSec + Developer are shared
// _v0 sections (same code on all five homes) — shot on two different homes.
const SITES = [
  { slug: 'singularity-dossier', tag: 'ctx-connects', sel: '.v0-ctx .tcb-head' },
  { slug: 'singularity-dossier', tag: 'dev-bentos', sel: '.v0-dev-grid' },
  // Testimony/Witness mount on the enterprise pages, not the homes.
  { slug: 'singularity-dossier/enterprise', tag: 'testimony-ramp', sel: '.sgd-testimony figure.sgd-plate:nth-of-type(2)' },
  { slug: 'singularity-orbit/enterprise', tag: 'witness-quote', sel: '.sgo-witness-plate' },
  { slug: 'singularity-signal', tag: 'ctx-connects-2', sel: '.v0-ctx .tcb-head' },
  { slug: 'singularity-signal', tag: 'dev-bentos-2', sel: '.v0-dev-grid' },
];
const HOMES = ['singularity-dossier', 'singularity-orbit', 'singularity-signal', 'singularity-observatory', 'singularity-procession'];

const browser = await chromium.launch({ executablePath: EXEC, headless: true });
const report = { shots: [], errors: {} };

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);

  // console/page error census on all five homes
  for (const slug of HOMES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(`console: ${m.text()}`); });
    page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
    await page.goto(`${BASE}/d/${slug}?chrome=0`, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => errs.push(`nav: ${e.message}`));
    await page.waitForTimeout(1500);
    report.errors[`${slug}@${theme}`] = errs;
    await page.close();
  }

  for (const site of SITES) {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/d/${site.slug}?chrome=0`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);
    const found = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const y = el.getBoundingClientRect().top + window.scrollY - 200;
      if (window.lenis?.scrollTo) window.lenis.scrollTo(y, { immediate: true, force: true });
      window.scrollTo(0, y);
      window.dispatchEvent(new Event('scroll'));
      return true;
    }, site.sel);
    if (!found) { report.shots.push({ tag: `${site.tag}@${theme}`, error: `selector not found: ${site.sel}` }); await page.close(); continue; }
    await page.waitForTimeout(1400);
    const full = path.join(outDir, `${site.tag}-${theme}.png`);
    await page.screenshot({ path: full });
    const el = page.locator(site.sel).first();
    const clip = path.join(outDir, `${site.tag}-${theme}-clip.png`);
    await el.screenshot({ path: clip }).catch(() => {});
    report.shots.push({ tag: `${site.tag}@${theme}`, full, clip });
    await page.close();
  }
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
