// Captures the first fold of every page the index panel and the sidebar
// preview (directive 8.6) against the running dev server, in both themes,
// into public/shots/pages/<id>-light.jpg and <id>-dark.jpg, where <id> is
// the surface id in src/lib/surfaces.ts. scripts/build-thumbs.mjs cuts the
// 640x360 thumbnails the preview layer reads from these.
//
// What is captured:
//   - every static page of the shipped direction: src/app/d/production and
//     each page.tsx under it whose path has no dynamic segment (blog/[slug],
//     legal/[route] and the catch-all are not pages of their own), with
//     ?chrome=0 so the direction corner stays out of the picture; the id is
//     `production` for the home and `production-<segments joined by ->`
//     for the rest, the rule surfaces.ts uses
//   - the routes the Pages group lists: the gallery (`gallery`), /brand,
//     /docs, /compare, /present and /deck, under their own ids
//
// Each capture is the 1440x900 viewport (never the full page) after the
// document's fonts are ready and a 2500ms settle, with reduced motion
// requested so reveals land at their end state. The theme is seeded
// through the site's own pre-boot door: an init script writes gt-theme to
// localStorage before navigation and the root layout's script stamps
// html[data-theme] before first paint, and the context's color scheme
// matches. The dev server's own indicator (the nextjs-portal element) is
// hidden before the shot. A page that fails to load is reported and
// skipped, never fatal; the run exits 1 at the end when any page failed.
//
// Usage: pnpm capture:pages [--base http://localhost:3005] [--only <id>[,<id>]]
// Needs the dev server running (pnpm dev) and the Chrome for Testing build
// playwright-core expects; CHROME_PATH overrides the executable.
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCTION = join(ROOT, 'src/app/d/production');
const OUT = join(ROOT, 'public/shots/pages');

const EXEC =
  process.env.CHROME_PATH ??
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const WIDTH = 1440;
const HEIGHT = 900;
const SETTLE_MS = 2500;
const QUALITY = 82;
const THEMES = ['light', 'dark'];

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};
const BASE = (flag('--base') ?? process.env.CAPTURE_BASE ?? 'http://localhost:3005').replace(/\/$/, '');
const ONLY = flag('--only')?.split(',').filter(Boolean);

/**
 * The static pages under src/app/d/production, as [segments]: every folder
 * holding a page.tsx whose path has no bracketed segment, the root first,
 * then the rest in path order.
 */
function productionPages() {
  const found = [];
  const walk = (dir, segments) => {
    if (segments.some((s) => s.startsWith('['))) return;
    if (existsSync(join(dir, 'page.tsx'))) found.push(segments);
    for (const entry of readdirSync(dir).sort()) {
      const abs = join(dir, entry);
      if (statSync(abs).isDirectory()) walk(abs, [...segments, entry]);
    }
  };
  walk(PRODUCTION, []);
  return found;
}

/** [id, url] for every capture. */
function targets() {
  const shipped = productionPages().map((segments) => {
    const id = segments.length === 0 ? 'production' : `production-${segments.join('-')}`;
    const path = ['/d/production', ...segments].join('/');
    return [id, `${BASE}${path}?chrome=0`];
  });
  const routes = [
    ['gallery', '/'],
    ['brand', '/brand'],
    ['docs', '/docs'],
    ['compare', '/compare'],
    ['present', '/present'],
    ['deck', '/deck'],
  ].map(([id, path]) => [id, `${BASE}${path}`]);
  const all = [...shipped, ...routes];
  return ONLY ? all.filter(([id]) => ONLY.includes(id)) : all;
}

const list = targets();
if (list.length === 0) {
  console.error('capture-pages: nothing to capture');
  process.exit(2);
}

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXEC, headless: true });

let written = 0;
let bytes = 0;
const failed = [];

for (const theme of THEMES) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    colorScheme: theme,
    reducedMotion: 'reduce',
  });
  await context.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
  for (const [id, url] of list) {
    const target = join(OUT, `${id}-${theme}.jpg`);
    const page = await context.newPage();
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
      if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`);
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
      await page.waitForTimeout(SETTLE_MS);
      await page.screenshot({ path: target, type: 'jpeg', quality: QUALITY });
      written += 1;
      bytes += statSync(target).size;
      console.log(`  ${theme.padEnd(5)} ${id.padEnd(34)} ${Math.round(statSync(target).size / 1024)}KB`);
    } catch (error) {
      const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
      failed.push(`${id} (${theme}): ${reason}`);
      console.error(`  ${theme.padEnd(5)} ${id.padEnd(34)} failed: ${reason}`);
    } finally {
      await page.close();
    }
  }
  await context.close();
}

await browser.close();

const kb = (n) => `${Math.round(n / 1024)}KB`;
console.log(
  `capture:pages  ${written} captures at ${WIDTH}x${HEIGHT} (${kb(bytes)}, ${kb(bytes / Math.max(1, written))} each) -> public/shots/pages`
);
if (failed.length > 0) {
  console.error(`capture:pages  ${failed.length} failed:\n  ${failed.join('\n  ')}`);
  process.exit(1);
}
