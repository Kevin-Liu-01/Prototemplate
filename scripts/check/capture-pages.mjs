// Captures the first fold of every page the index panel and the sidebar
// preview (directive 8.6) against the running dev server, in both themes,
// into public/shots/pages/<id>-light.jpg and <id>-dark.jpg, where <id> is
// the surface id in src/lib/surfaces.ts. scripts/build/thumbs.mjs cuts the
// 640x360 thumbnails the preview layer reads from these.
//
// What is captured, from the shared route list (scripts/lib/site-pages.mjs,
// the rows tagged `capture`) and the two book registries:
//   - every static page of the shipped direction: src/app/d/production and
//     each page.tsx under it whose path has no dynamic segment (blog/[slug]
//     and the catch-all are not pages of their own), with ?chrome=0 so the
//     direction corner stays out of the picture; the id is `production`
//     for the home and `production-<segments joined by ->` for the rest,
//     the rule surfaces.ts uses
//   - the routes the Pages group lists: the gallery (`gallery`), /brand,
//     /docs, /compare, /present and /deck, under their own ids
//   - the Knowledge rows that have a page of their own: /skills (`skills`),
//     /handbook (`handbook`) and /marks (`marks`), so the sidebar's Skills,
//     Handbook and Marks rows can preview their first fold
//   - every document of the two books, the readme first: /docs and
//     /docs/<slug> (`docs-<slug>`) from src/app/docs/registry.ts, /handbook
//     and /handbook/<slug> (`handbook-<slug>`) from
//     src/app/handbook/registry.ts; the book lands on the document, so each
//     capture is that document's first fold, the tile the book's grid and
//     the Documents rows show
//   - one direction page (`directions`): /directions/<slug> for the first
//     exploration in src/lib/directions.ts, the route every site and
//     exploration row opens (the reference keeps /d/production, which the
//     shipped pages above already cover)
//   - with --live, the pages of generaltranslation.com the Shipped group's
//     `Live site` child lists (LIVE_PAGES below, ids live-<name>), instead
//     of the local pages: the cookie banner is declined through the
//     cookie_consent cookie, the dark theme is seeded through the site's
//     `theme` localStorage key and the `dark` class on html, and the 404
//     row is shot at an address that does not exist, so its 404 response
//     is the expected one
//
// Each capture is the 1440x900 viewport (never the full page) after the
// document's fonts are ready and a 2500ms settle (3000ms for a live page),
// with reduced motion requested so reveals land at their end state. The
// theme is seeded through the site's own pre-boot door: an init script
// writes gt-theme to localStorage before navigation and the root layout's
// script stamps html[data-theme] before first paint, and the context's
// color scheme matches. The dev server's own indicator (the nextjs-portal
// element) is hidden before the shot. A page that fails to load is
// reported and skipped, never fatal; the run exits 1 at the end when any
// page failed.
//
// Usage: pnpm capture:pages [--base <url>, default PT_BASE] [--only <id>[,<id>]] [--live]
// Needs the dev server running (pnpm dev) and the Chrome for Testing build
// playwright-core expects; CHROME_PATH overrides the executable. --live
// needs the network instead of the dev server.
//
// The routes, the theme door and the executable path come from
// scripts/lib/site-pages.mjs, which every browser tool shares, so a new page
// or a moved registry is picked up by all of them from one change.
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

import { BASE_URL, chromePath, HIDE_DEV_UI_CSS, ROOT, routesFor, seedTheme } from '../lib/site-pages.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const OUT = join(ROOT, 'public/shots/pages');

const EXEC = chromePath();

const WIDTH = 1440;
const HEIGHT = 900;
const SETTLE_MS = 2500;
const LIVE_SETTLE_MS = 3000;
const QUALITY = 82;
const THEMES = ['light', 'dark'];

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};
const BASE = (flag('--base') ?? BASE_URL).replace(/\/$/, '');
const ONLY = flag('--only')?.split(',').filter(Boolean);
const LIVE = argv.includes('--live');

const LIVE_ORIGIN = 'https://generaltranslation.com';

/**
 * The live pages the Shipped group's `Live site` child lists
 * (src/lib/surfaces.ts, SHIPPED_LIVE), as [id, url], in that order. The
 * 404 row is captured at an address that does not exist; the dashboard
 * sign-in is the one page on another host.
 */
const LIVE_PAGES = [
  ['live-home', `${LIVE_ORIGIN}/`],
  ['live-pricing', `${LIVE_ORIGIN}/pricing`],
  ['live-usage', `${LIVE_ORIGIN}/pricing/usage`],
  ['live-enterprise', `${LIVE_ORIGIN}/enterprise`],
  ['live-careers', `${LIVE_ORIGIN}/careers`],
  ['live-contact', `${LIVE_ORIGIN}/contact`],
  ['live-docs', `${LIVE_ORIGIN}/docs`],
  ['live-blog', `${LIVE_ORIGIN}/blog`],
  ['live-report-card', `${LIVE_ORIGIN}/report-card`],
  ['live-404', `${LIVE_ORIGIN}/this-page-does-not-exist`],
  ['live-dash', 'https://dash.generaltranslation.com'],
];

/** The one live page whose response is a 404 on purpose. */
const EXPECTED_404 = 'live-404';

/** The `slug` lines of a book registry, in order. */
function registrySlugs(rel) {
  return [...readFileSync(join(ROOT, rel), 'utf8').matchAll(/slug: '([^']+)',\s*\n\s*file: '/g)].map((m) => m[1]);
}

/** [id, path] for every document of both books, each readme first: the docs registry leaves its readme out, the handbook registry lists its own first. */
function bookDocuments() {
  const docs = ['readme', ...registrySlugs('src/app/docs/registry.ts')];
  const handbook = registrySlugs('src/app/handbook/registry.ts');
  return [
    ...docs.map((slug) => [`docs-${slug}`, slug === 'readme' ? '/docs' : `/docs/${slug}`]),
    ...handbook.map((slug) => [`handbook-${slug}`, slug === 'readme' ? '/handbook' : `/handbook/${slug}`]),
  ];
}

/** [id, url] for every capture: the live pages under --live, the local pages otherwise. */
function targets() {
  if (LIVE) return ONLY ? LIVE_PAGES.filter(([id]) => ONLY.includes(id)) : LIVE_PAGES;
  let routes;
  try {
    routes = routesFor('capture').map((r) => [r.id, r.path]);
  } catch (error) {
    console.error(`capture-pages: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  }
  /* the shipped pages first, as the captures have always been ordered */
  const shipped = routes.filter(([id]) => id.startsWith('production'));
  const rest = routes.filter(([id]) => !id.startsWith('production'));
  const all = [...shipped, ...rest, ...bookDocuments()].map(([id, path]) => [id, `${BASE}${path}`]);
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
  await seedTheme(context, theme);
  if (LIVE) {
    /* the live site reads `theme`; the cookie declines its consent banner */
    await context.addInitScript((t) => localStorage.setItem('theme', t), theme);
    await context.addCookies([{ name: 'cookie_consent', value: 'no', domain: '.generaltranslation.com', path: '/' }]);
  }
  for (const [id, url] of list) {
    const target = join(OUT, `${id}-${theme}.jpg`);
    const page = await context.newPage();
    try {
      /* the live site keeps analytics connections open, so it is waited on through load, not network idle */
      const response = await page.goto(url, { waitUntil: LIVE ? 'load' : 'networkidle', timeout: 90000 });
      const status = response?.status() ?? 0;
      if (status >= 400 && !(id === EXPECTED_404 && status === 404)) throw new Error(`HTTP ${status}`);
      if (LIVE && theme === 'dark') {
        await page.evaluate(() => {
          const root = document.documentElement;
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
          root.style.colorScheme = 'dark';
        });
      }
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
      await page.waitForTimeout(LIVE ? LIVE_SETTLE_MS : SETTLE_MS);
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
