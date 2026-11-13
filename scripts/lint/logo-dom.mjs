#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * The label half of the logo lock in a browser (pnpm lint:logo --dom):
 * rule 11 for the pictures a page draws after it loads, which the
 * prerendered markup that lint:logo --built reads does not hold. The hub's
 * grid, its preview card and any client list draw their captures from
 * data, so only the page as a reader sees it can say whether a history
 * picture is labelled.
 *
 * It opens every page next build prerendered (the dated studies under /d
 * left out, /d/production read) on a running server, at 1440 by 900 in the
 * light theme (the current pages again in the dark), and reads every
 * picture the page shows: an img (its currentSrc), a video's poster and
 * source, an SVG image and every element's computed background-image, the /_next/image?url= form decoded.
 * A picture whose path the manifest (scripts/lint/logo.json) holds as
 * history must have a label in its scope, read as logo-labels.mjs reads
 * markup: the nearest element with data-previous-mark, else the nearest
 * figure, p, li, article, tr or section, whose visible text (text nodes in
 * displayed, visible, opaque elements, so a title or aria-label does not
 * count) says it (LABEL). On a page whose
 * toolbar has the Grid view it switches to the grid and reads it too, and
 * it hovers the caption of every grid tile and sidebar row whose capture is
 * history and reads the preview card the hub opens.
 *
 * Rule 13 in the browser: on a current page (CURRENT_PAGES in
 * scripts/lib/logo-lock.mjs: /brand and every route under it, /deck and the
 * production card on /marks) every shown picture whose manifest entry is
 * history (previousPictures), CSS masks included (a badge frame is a
 * mask), must sit inside an element marked data-previous-mark whose
 * visible text says what it shows.
 *
 * Rule 14 in the browser: on a current page every shown picture or film
 * under public/, and every SVG that carries a picture, is listed by its
 * own path (unlistedOnCurrent: checked at its bytes, generated or
 * history; never by notLogo or a folder), so a capture drawn from data
 * after the page loads is held as the prerendered ones are. The built deck's content-hashed copies
 * are left to lint:logo, which reads the deck's sources.
 *
 * Usage:
 *   node scripts/lint/logo.mjs --dom [--base <url>]   (pnpm lint:logo --dom)
 *   node scripts/lint/logo-dom.mjs [--base <url>] [--route <path>]...
 *        --base defaults to PT_BASE, else http://localhost:3005: start the
 *        built site first (pnpm build && pnpm start -p <port>); --route
 *        reads only those pages
 *
 * Exit 0 when every history picture shown is labelled, 1 on any that is
 * not, 2 when the build, the server or Chrome is missing.
 */
import { chromium } from 'playwright-core';

import { helpIfAsked } from '../lib/help.mjs';
import { CURRENT_PAGES, currentPage, matches, previousMarkLists, previousPictures, readManifest, unlistedOnCurrent } from '../lib/logo-lock.mjs';
import { ROOT } from '../lib/root.mjs';
import { BASE_URL, chromePath, seedTheme } from '../lib/site-pages.mjs';
import { LABEL, twin } from './logo-labels.mjs';
import { builtPages } from './seo.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};
const BASE = (flag('--base') ?? BASE_URL).replace(/\/$/, '');
const ONLY = argv.flatMap((a, i) => (argv[i - 1] === '--route' ? [a] : []));

/* the pictures that show the previous mark: the history entries rule 11 reads, under public/ (a page serves public/ only) */
const manifest = readManifest(ROOT);
const HISTORY = manifest.history.filter((entry) => !entry.rules && !entry.symbol && entry.path.startsWith('public/')).map((entry) => entry.path);
/* the site's own copy must name the same pictures, or a page labels from a stale list */
const { pictures, films, filmCaptures } = previousMarkLists(manifest);
const isHistory = (rel) => HISTORY.some((pattern) => matches(pattern, rel)) || [...pictures, ...films, ...filmCaptures].some((pattern) => matches(pattern, rel));
/* rule 13: every history picture, whatever rules it waives */
const PREVIOUS = previousPictures(manifest).filter((pattern) => pattern.startsWith('public/'));
const isPrevious = (rel) => PREVIOUS.some((pattern) => matches(pattern, rel));
/** Rule 14: why a current page may not show `rel`, or null (unlistedOnCurrent); the built deck's content-hashed copies are held by the deck's sources, which lint:logo reads. */
function unlistedWhy(rel) {
  if (rel.startsWith('public/deck-assets/')) return null;
  const why = unlistedOnCurrent(manifest, ROOT, rel);
  if (why === 'changed') return 'changed since it was checked';
  if (why === 'unlisted') return 'which the manifest does not list';
  return why ? `which the manifest lists only by the entry ${why.slice(5)}, a place and not a picture` : null;
}

let routes = ONLY;
if (routes.length === 0) {
  const pages = builtPages(ROOT);
  if (pages.size === 0) {
    console.log('lint:logo --dom: no prerendered pages; run next build first');
    process.exit(2);
  }
  routes = [...pages.keys()].filter((route) => !(route.startsWith('/d/') && !route.startsWith('/d/production')));
  /* the current pages next build does not prerender (/deck is public/brand-deck.html behind a rewrite) */
  for (const page of CURRENT_PAGES) if (!routes.includes(page.route)) routes.push(page.route);
  routes.sort();
}

try {
  const res = await fetch(`${BASE}/`, { redirect: 'manual' });
  if (res.status >= 500) throw new Error(`status ${res.status}`);
} catch (error) {
  console.log(`lint:logo --dom: no server at ${BASE} (${error instanceof Error ? error.message : String(error)}); start the built site (pnpm start -p <port>) and pass --base`);
  process.exit(2);
}

/**
 * Runs in the page: every shown picture's site path with the element that
 * shows it and its scope's label state. `labelSource` is LABEL's source;
 * `rootSelector` limits the read to one element (the preview card);
 * `scopeSelector` marks the pictures inside the current part of a page
 * (rule 13), all of them when it is absent.
 */
function readPictures([labelSource, rootSelector, scopeSelector]) {
  const label = new RegExp(labelSource, 'i');
  const root = rootSelector ? document.querySelector(rootSelector) : document.body;
  if (!root) return [];
  const scopes = 'figure, p, li, article, tr, section';
  const sitePath = (raw) => {
    if (!raw) return null;
    try {
      const url = new URL(raw, location.href);
      if (url.origin !== location.origin) return null;
      if (url.pathname === '/_next/image') return url.searchParams.get('url')?.split(/[?#]/)[0] ?? null;
      return decodeURIComponent(url.pathname);
    } catch {
      return null;
    }
  };
  /* on the page: a box, and neither it nor an ancestor hidden or transparent (an inactive Atlas plate is both) */
  const shown = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;
    return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  };
  const found = [];
  const add = (el, raw) => {
    const path = sitePath(raw);
    if (path && shown(el)) found.push({ el, path });
  };
  for (const img of root.querySelectorAll('img')) add(img, img.currentSrc || img.getAttribute('src'));
  for (const video of root.querySelectorAll('video')) {
    add(video, video.getAttribute('poster'));
    add(video, video.currentSrc || video.getAttribute('src'));
  }
  for (const image of root.querySelectorAll('image')) add(image, image.getAttribute('href') ?? image.getAttribute('xlink:href'));
  /* backgrounds, and masks: a mark drawn as a mask (a badge frame, a mark tile) is a shown picture too */
  for (const el of root.querySelectorAll('*')) {
    const style = getComputedStyle(el);
    for (const value of [style.backgroundImage, style.maskImage, style.webkitMaskImage]) {
      if (!value || value === 'none') continue;
      for (const m of value.matchAll(/url\("?([^")]+)"?\)/g)) add(el, m[1]);
    }
  }
  /* the text a reader sees in the scope: text nodes whose element is displayed, visible and not transparent
     (innerText would read nothing in a tile that content-visibility skips while it is off screen) */
  const visibleText = (scope) => {
    const out = [];
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (parent && parent.checkVisibility({ opacityProperty: true, visibilityProperty: true })) out.push(node.data);
    }
    return out.join(' ');
  };
  return found.map(({ el, path }) => {
    const marked = el.closest('[data-previous-mark]');
    const scope = marked ?? el.closest(scopes);
    const text = scope ? visibleText(scope) : '';
    const where = (scope ?? el).outerHTML.slice(0, 120).replace(/\s+/g, ' ');
    const current = scopeSelector ? Boolean(el.closest(scopeSelector)) : true;
    return { path, scope: scope ? scope.tagName.toLowerCase() : null, marked: Boolean(marked), said: label.test(text), sentences: text.split(/[.!?]+/).filter((s) => label.test(s)).length, key: scope ? `${scope.tagName}:${[...document.querySelectorAll(scope.tagName)].indexOf(scope)}` : null, where, current };
  });
}

/** The misses among a page's pictures: no label in scope, or a section scope with fewer labelling sentences than history pictures. */
function misses(list) {
  const history = list.filter((p) => isHistory(`public${p.path}`));
  const out = [];
  for (const p of history) {
    let said = p.said;
    if (said && p.scope === 'section' && !p.marked) {
      const distinct = new Set(history.filter((q) => q.key === p.key && !q.marked).map((q) => twin(q.path)));
      said = p.sentences >= distinct.size;
    }
    if (!said) out.push(p);
  }
  return out;
}

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await seedTheme(context, 'light');
const page = await context.newPage();

let failures = 0;
let read = 0;
let cards = 0;
const previewed = new Set();
const seen = new Set();
let currents = 0;
const report = (route, view, list) => {
  for (const miss of misses(list)) {
    const key = `${route} ${view} ${miss.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    failures += 1;
    console.log(`  FAIL rule 11 unlabelled previous mark ${route} (${view}): shows public${miss.path}, which history lists, with no label in its ${miss.scope ? `<${miss.scope}>` : 'element'}: ${miss.where}`);
  }
  /* rule 13: on a current page, a previous picture only in a labelled previous-logo figure */
  if (!currentPage(route) || view.startsWith('preview card')) return;
  for (const p of list) {
    if (!p.current || !isPrevious(`public${p.path}`) || (p.marked && p.said)) continue;
    const key = `13 ${route} ${view} ${p.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    failures += 1;
    console.log(`  FAIL rule 13 previous logo on a current page ${route} (${view}): shows public${p.path}, which history lists as a previous logo or mark, ${p.marked ? 'in a figure marked data-previous-mark that does not say so' : 'outside a previous-logo figure'}: ${p.where}`);
  }
  /* rule 14: every picture a current page shows is listed */
  for (const p of list) {
    const why = p.current ? unlistedWhy(`public${p.path}`) : null;
    if (!why) continue;
    const key = `14 ${route} ${p.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    failures += 1;
    console.log(`  FAIL rule 14 picture on a current page ${route} (${view}): shows public${p.path}, ${why}; look at it and list it in scripts/lint/logo.json: ${p.where}`);
  }
};
const settle = async (tab = page) => {
  await tab.waitForLoadState('load').catch(() => {});
  /* lazy pictures load once they are near the viewport: walk the page down and back */
  await tab.evaluate(async () => {
    const step = innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    scrollTo(0, 0);
  });
  /* let the transitions the walk started end (a plate fading out reads as shown), up to 2 s for a page that loops */
  await tab.evaluate(() =>
    Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 2000))])
  );
  await tab.waitForTimeout(150);
};

for (const route of routes) {
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  } catch (error) {
    console.log(`  note ${route}: did not load (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`);
    continue;
  }
  await settle();
  read += 1;
  const current = currentPage(route);
  if (current) currents += 1;
  const scopeSelector = current?.scope?.selector ?? null;
  report(route, 'page', await page.evaluate(readPictures, [LABEL.source, null, scopeSelector]));

  /* the hub's grid: every surface as a captured tile */
  const grid = page.locator('button[title^="Everything as a grid"], [role="radio"][title^="Everything as a grid"]').first();
  if ((await grid.count()) === 0) continue;
  await grid.click().catch(() => {});
  await settle();
  report(route, 'grid', await page.evaluate(readPictures, [LABEL.source, null, scopeSelector]));

  /* the preview card: once per surface across the run, over the first visible tile or row that previews it */
  const ids = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-preview]')].map((el) => el.getAttribute('data-preview')))]);
  for (const id of ids) {
    if (previewed.has(id)) continue;
    let shown = null;
    for (const candidate of await page.locator(`[data-preview="${id}"]`).all()) {
      if (await candidate.isVisible()) {
        shown = candidate;
        break;
      }
    }
    if (!shown) continue;
    previewed.add(id);
    /* a fresh open starts on the plate, so the card never shows the last row's capture */
    await page.mouse.move(0, 0);
    await page.waitForFunction(() => !document.querySelector('.pt-preview.is-on'), null, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(250);
    await shown.hover().catch(() => {});
    try {
      await page.locator('.pt-preview.is-on .pt-preview-img img').first().waitFor({ state: 'attached', timeout: 3000 });
    } catch {
      continue;
    }
    await page.waitForTimeout(200);
    cards += 1;
    report(route, `preview card ${id}`, await page.evaluate(readPictures, [LABEL.source, '.pt-preview']));
  }
}

/* the current pages again in the dark theme, where they swap in -dark captures and data-dark pictures: rules 13 and 14 in the page and grid views */
const dark = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await seedTheme(dark, 'dark');
const darkTab = await dark.newPage();
for (const route of routes.filter((r) => currentPage(r))) {
  try {
    await darkTab.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  } catch (error) {
    console.log(`  note ${route} (dark): did not load (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`);
    continue;
  }
  await settle(darkTab);
  const scopeSelector = currentPage(route)?.scope?.selector ?? null;
  report(route, 'page, dark', await darkTab.evaluate(readPictures, [LABEL.source, null, scopeSelector]));
  const grid = darkTab.locator('button[title^="Everything as a grid"], [role="radio"][title^="Everything as a grid"]').first();
  if ((await grid.count()) === 0) continue;
  await grid.click().catch(() => {});
  await settle(darkTab);
  report(route, 'grid, dark', await darkTab.evaluate(readPictures, [LABEL.source, null, scopeSelector]));
}

await browser.close();
console.log(`Logo labels in the browser: ${read} pages (${currents} current) and ${cards} preview cards read at ${BASE}`);
console.log(`lint:logo --dom: ${failures === 0 ? 'pass' : `${failures} failure${failures === 1 ? '' : 's'}`}`);
process.exit(failures === 0 ? 0 : 1);
