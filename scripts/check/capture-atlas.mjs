// Captures the pictures /atlas/notes shows (src/app/atlas/notes/AtlasViewer.tsx)
// from the running site into public/shots/atlas/<file>.webp, one entry of
// SHOTS per picture: its route, theme, viewport and the reader's actions
// before the shot.
//
// Each shot is taken at a device scale of 2 in the theme it names, seeded
// through the site's pre-boot door (seedTheme). Before and after the
// actions, the shot waits for the document's fonts, every picture in view
// to load and decode, the front page's own readiness
// (.gtp-landing[data-ready]), every cover in view to finish drawing on
// WebGPU, every figure in view to load (img[data-loaded]) and an open
// magazine to lay out its pages; after a settle it waits once more, for a
// figure the actions brought in. The dev server's indicator is hidden.
// Headless Chrome draws no pointer, so a hover leaves no cursor in the
// picture.
//
// Actions, run in order:
//   ['hover', selector, x?, y?]  moves the pointer to the element (x and y as fractions of its box, 0.5 by default)
//   ['click', selector, x?, y?]  clicks the element there, as a reader's pointer does
//   ['last', selector]           clicks the element until it is disabled (a magazine's next page arrow)
//   ['scroll', selector, n, at]  scrolls the nth match to `at` of the viewport's height from the top
//   ['away']                     moves the pointer to the left edge, off every control
//   ['settle', ms]               waits
//
// A shot with `clip` keeps that box of the viewport ([x, y, width, height]
// in CSS pixels). A shot with `sheet` captures each of those routes at
// 1440x900 and sets them in two columns on the dark ground, as a contact
// sheet. Each PNG is encoded as WebP through cwebp (brew install webp).
// A shot that fails is reported and skipped; the run exits 1 at the end
// when any failed.
//
// Usage: pnpm capture:atlas [--base <url>, default PT_BASE] [--only <file>[,<file>]]
// Needs the site running (pnpm dev, or pnpm build and pnpm start) and the
// Chrome for Testing build playwright-core expects; CHROME_PATH overrides it.
import { execFileSync } from 'node:child_process';
import { rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

import { BASE_URL, chromePath, HIDE_DEV_UI_CSS, ROOT, seedTheme } from '../lib/site-pages.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { option } from '../lib/args.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const BASE = (option(argv, '--base') ?? BASE_URL).replace(/\/$/, '');
const ONLY = option(argv, '--only')?.split(',').filter(Boolean);
const OUT = join(ROOT, 'public/shots/atlas');
const SCALE = 2;
const QUALITY = 74;
const SETTLE_MS = 2500;
const TURN_MS = 1200;
const WAIT_MS = 30_000;

const corner = (slug) => `[data-testid="atlas-magazine-${slug}"]`;
const NEXT = '[data-testid="atlas-magazine-next"]';
const DOCS = 'designing-docs-for-humans';
const GLOBE = '[data-testid="atlas-globe"]';
/** Opens a magazine the way a reader does: the pointer lifts its corner, a click opens it on its map sheet. */
const openMagazine = (slug) => [['hover', corner(slug), 0.6, 0.6], ['settle', 1500], ['click', corner(slug), 0.6, 0.6], ['settle', TURN_MS], ['away']];

const SHOTS = [
  { file: 'rack', route: '/atlas', theme: 'dark' },
  { file: 'rack-light', route: '/atlas', theme: 'light' },
  { file: 'phone', route: '/atlas', theme: 'dark', viewport: [390, 844] },
  { file: 'corner', route: '/atlas', theme: 'dark', actions: [['hover', corner(DOCS), 0.6, 0.6]] },
  { file: 'magazine', route: '/atlas', theme: 'dark', actions: openMagazine(DOCS) },
  { file: 'spread', route: '/atlas', theme: 'dark', actions: [...openMagazine(DOCS), ['click', NEXT], ['settle', TURN_MS], ['away']] },
  { file: 'pages', route: '/atlas', theme: 'dark', actions: [...openMagazine(DOCS), ['click', NEXT], ['settle', TURN_MS], ['click', NEXT], ['settle', TURN_MS], ['away']] },
  { file: 'back', route: '/atlas', theme: 'dark', actions: [...openMagazine('translating-euclid'), ['last', NEXT], ['away']] },
  { file: 'feature', route: '/atlas/translating-euclid', theme: 'light', actions: [['scroll', '.gtm-lead', 0, 0.2]] },
  { file: 'headline', route: '/atlas/rewriting-our-docs', theme: 'dark' },
  { file: 'shelf', route: '/atlas/shelf', theme: 'dark', actions: [['hover', `[data-testid="atlas-story-${DOCS}"]`]] },
  { file: 'covers', route: '/atlas/shelf', theme: 'dark', clip: [0, 180, 1440, 480] },
  { file: 'docs', route: `/atlas/shelf/${DOCS}`, theme: 'dark', actions: [['scroll', '.gtp-stub', 4, 0.36]] },
  { file: 'fuma', route: '/atlas/shelf/fuma-nama', theme: 'dark', actions: [['scroll', '.gtp-stub', 2, 0.36]] },
  { file: 'book', route: '/atlas/shelf/translating-euclid', theme: 'light' },
  { file: 'figure', route: '/atlas/shelf/translating-euclid', theme: 'light', actions: [['scroll', '.gtp-print-at', 0, 0.45]] },
  {
    file: 'directions',
    theme: 'dark',
    sheet: ['riffle', 'atlas', 'signal', 'proof', 'light', 'route', 'measure'].map((slug) => ({ route: `/atlas/directions/${slug}` })).concat([
      { route: '/atlas/directions/riffle', actions: [['click', 'button[aria-label="Open"] >> visible=true'], ['away']] },
    ]),
  },
  { file: 'locator', route: '/atlas', theme: 'light', actions: [['click', GLOBE]] },
  {
    file: 'ring',
    route: '/atlas',
    theme: 'dark',
    // the ring opens under the pointer and folds after a pick until the pointer leaves, so the pointer leaves and comes back
    actions: [['hover', GLOBE], ['settle', 1200], ['click', '[data-testid="atlas-ring-ja"]'], ['settle', 1500], ['away'], ['settle', 800], ['hover', GLOBE]],
  },
];

/** The point at fractions (x, y) of the first match's box. */
async function pointOn(page, selector, x = 0.5, y = 0.5) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: 'visible', timeout: WAIT_MS });
  const box = await el.boundingBox();
  if (!box) throw new Error(`${selector} has no box`);
  return [box.x + box.width * x, box.y + box.height * y];
}

async function act(page, [name, selector, a, b]) {
  if (name === 'hover') await page.mouse.move(...(await pointOn(page, selector, a, b)), { steps: 4 });
  else if (name === 'click') await page.mouse.click(...(await pointOn(page, selector, a, b)));
  else if (name === 'away') await page.mouse.move(2, 450);
  else if (name === 'settle') await page.waitForTimeout(selector);
  else if (name === 'scroll') {
    const found = await page.evaluate(
      ([sel, n, at]) => {
        const el = document.querySelectorAll(sel)[n];
        if (!el) return false;
        window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - innerHeight * at, behavior: 'instant' });
        return true;
      },
      [selector, a, b]
    );
    if (!found) throw new Error(`no ${selector} number ${a}`);
  } else if (name === 'last') {
    for (let i = 0; i < 60 && (await page.locator(selector).isEnabled()); i++) {
      await page.mouse.click(...(await pointOn(page, selector)));
      await page.waitForTimeout(TURN_MS);
    }
  } else throw new Error(`unknown action ${name}`);
}

/** Runs in the page: resolves once the fonts, every picture in view, the front page, its covers and an open magazine are ready. */
function ready() {
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && getComputedStyle(el).visibility !== 'hidden';
  };
  const until = (test) =>
    new Promise((done) => {
      const tick = () => (test() ? done() : setTimeout(tick, 100));
      tick();
    });
  const pictures = () =>
    Promise.all(
      [...document.images].filter(inView).map((img) =>
        img.complete
          ? img.decode().catch(() => undefined)
          : new Promise((done) => {
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
            })
      )
    );
  return Promise.all([
    document.fonts.ready,
    until(() => [...document.querySelectorAll('.gtp-landing')].every((el) => el.dataset.ready === 'true')),
    until(() => [...document.querySelectorAll('.gtp-cover')].filter(inView).every((el) => el.dataset.mode === 'cpu' || el.dataset.drawn === 'true')),
    until(() => [...document.querySelectorAll('.gtp-riffle[data-shown="true"] .gtp-riffle-mag')].every((el) => el.childElementCount > 0)),
    until(() => [...document.querySelectorAll('img[data-loaded]')].filter(inView).every((img) => img.dataset.loaded === 'true')),
  ]).then(pictures);
}

/** One route with its actions, as a PNG of the viewport (or its clip). */
async function capture(context, { route, actions = [], clip }) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    const res = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 120_000 });
    if (!res || !res.ok()) throw new Error(`${route}: HTTP ${res?.status() ?? 'no response'}`);
    await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
    const settled = async () => {
      let timer;
      const late = new Promise((_, fail) => {
        timer = setTimeout(() => fail(new Error(`${route}: not ready in ${WAIT_MS}ms`)), WAIT_MS);
      });
      try {
        await Promise.race([page.evaluate(ready), late]);
      } finally {
        clearTimeout(timer);
      }
    };
    await settled();
    for (const step of actions) await act(page, step);
    // a figure the actions bring in mounts after they end, so the wait runs again after the settle
    await page.waitForTimeout(800);
    await settled();
    await page.waitForTimeout(SETTLE_MS);
    await settled();
    if (errors.length > 0) throw new Error(`${route}: ${errors[0]}`);
    const [x, y, width, height] = clip ?? [];
    return await page.screenshot({ type: 'png', ...(clip ? { clip: { x, y, width, height } } : {}) });
  } finally {
    await page.close();
  }
}

/** Sets the sheet's captures in two columns, 700 CSS pixels each with 12 between and around, at the same device scale. */
async function contactSheet(browser, pngs) {
  const [tile, gap] = [700, 12];
  const rows = Math.ceil(pngs.length / 2);
  const width = gap * 3 + tile * 2;
  const height = Math.ceil(gap * (rows + 1) + (tile * 900 * rows) / 1440);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: SCALE });
  const cells = pngs.map((png) => `<img src="data:image/png;base64,${png.toString('base64')}">`).join('');
  await page.setContent(
    `<style>html,body{margin:0;background:#090909}body{display:grid;grid-template-columns:${tile}px ${tile}px;gap:${gap}px;padding:${gap}px}img{display:block;width:${tile}px;aspect-ratio:1440/900}</style>${cells}`
  );
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
  const sheet = await page.screenshot({ type: 'png' });
  await page.close();
  return { sheet, size: `${width}x${height}` };
}

const list = ONLY ? SHOTS.filter((s) => ONLY.includes(s.file)) : SHOTS;
if (list.length === 0) {
  console.error(`capture-atlas: nothing to capture; the files are ${SHOTS.map((s) => s.file).join(', ')}`);
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: chromePath(), headless: true });
let bytes = 0;
const failed = [];

for (const shot of list) {
  const [width, height] = shot.viewport ?? [1440, 900];
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: SCALE, colorScheme: shot.theme });
  await seedTheme(context, shot.theme);
  const target = join(OUT, `${shot.file}.webp`);
  try {
    let png;
    let size = shot.clip ? `${shot.clip[2]}x${shot.clip[3]}` : `${width}x${height}`;
    if (shot.sheet) {
      const tiles = [];
      for (const cell of shot.sheet) tiles.push(await capture(context, cell));
      ({ sheet: png, size } = await contactSheet(browser, tiles));
    } else png = await capture(context, shot);
    const tmp = `${target}.png`;
    writeFileSync(tmp, png);
    execFileSync('cwebp', ['-quiet', '-q', String(QUALITY), '-m', '6', '-sharp_yuv', tmp, '-o', target]);
    rmSync(tmp);
    bytes += statSync(target).size;
    console.log(`  ${shot.file.padEnd(12)} ${shot.theme.padEnd(5)} ${size} at ${SCALE}x  ${Math.round(statSync(target).size / 1024)}KB`);
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    failed.push(`${shot.file}: ${reason}`);
    console.error(`  ${shot.file.padEnd(12)} failed: ${reason}`);
  } finally {
    await context.close();
  }
}

await browser.close();
console.log(`capture-atlas: ${list.length - failed.length} pictures, ${Math.round(bytes / 1024)}KB, in ${OUT.slice(ROOT.length + 1)}`);
if (failed.length > 0) {
  console.error(`capture-atlas: ${failed.length} failed\n${failed.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
