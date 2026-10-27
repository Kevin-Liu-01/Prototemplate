// Captures the pictures /atlas/notes shows (src/app/atlas/notes/AtlasViewer.tsx)
// from the running site into public/shots/atlas/<file>.webp, one entry of
// SHOTS per picture: its route, theme, viewport and the reader's actions
// before the shot.
//
// The notes show a figure at most 960 CSS pixels wide, so a file is at most
// 1920 pixels wide, twice that. Each shot is taken at a device scale of 2 (a
// shot's `scale` overrides it) in the theme it names, seeded through the
// site's pre-boot door (seedTheme), and cwebp brings a wider capture down to
// 1920; a narrower one keeps its width (the phone at 780, shown at 390). Before and after the actions, the shot waits for the
// document's fonts, every picture in view to load and decode (a picture
// still loading has no size, so a picture counts as in view by its place,
// not its box), the front page's own readiness (.gtp-landing[data-ready]),
// every cover in view to finish drawing on WebGPU, every figure in view to
// load (img[data-loaded]) and an open magazine to lay out its pages; after a
// settle it waits once more, for a figure the actions brought in. A picture
// in view that failed to load fails the shot. The dev server's indicator is
// hidden. Headless Chrome draws no pointer, so a hover leaves no cursor in
// the picture.
//
// Actions, run in order:
//   ['hover', selector, x?, y?]  moves the pointer to the element (x and y as fractions of its box, 0.5 by default)
//   ['click', selector, x?, y?]  clicks the element there, as a reader's pointer does
//   ['last', selector]           clicks the element until it is disabled (a magazine's next page arrow)
//   ['scroll', selector, n, at]  scrolls the nth match to `at` of the viewport's height from the top
//   ['away']                     moves the pointer to the left edge, off every control
//   ['settle', ms]               waits
//   ['until', expression]        waits until the expression is true in the page (a drawing that runs on a clock)
//
// A shot with `clip` keeps part of the viewport: [x, y, width, height] in
// CSS pixels, or [selector, x, y, width, height] as fractions of the first
// visible match's box, grown by 24 CSS pixels on every side. A shot with
// `sheet` captures each of those routes at 1440x900 and sets them in two
// columns on the dark ground, as a contact sheet. Each PNG is encoded as
// WebP through cwebp (brew install webp). A shot that fails is reported and
// skipped; the run exits 1 at the end when any failed.
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
/** The notes column's widest figure, in CSS pixels; a file is twice as wide. */
const SHOWN = 960;
/** cwebp's quality: the notes serve each file through the image optimizer at 95 (next.config.ts), and 90 keeps the small type in the pictures legible through that second encode. */
const QUALITY = 90;
const PAD = 24;
const SETTLE_MS = 2500;
const TURN_MS = 1200;
const WAIT_MS = 30_000;
const SHOT_MS = 120_000;

/** In the page: no animation that ends is still running, so whatever types, fades or wipes itself in is whole. */
const SETTLED = "!document.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().endTime !== Infinity)";
/** The Light poster: the compass drawing, its long lines and the lettering are whole, and the two definitions have typed out. */
const LIGHT_DRAWN = `${SETTLED} && document.querySelectorAll('.lt-svg .long').length > 0 && [...document.querySelectorAll('.lt-svg .tri, .lt-svg .long')].every((el) => el.style.strokeDashoffset === '0') && [...document.querySelectorAll('.lt-svg .lab')].every((el) => el.style.opacity === '1') && [...document.querySelectorAll('.lt-type')].every((el) => el.getAnimations().length > 0 && el.getAnimations().every((a) => a.playState === 'finished'))`;
/** Measure: every dimension has faded in and counted up to its length. */
const MEASURE_DRAWN = `${SETTLED} && document.querySelectorAll('.dimg').length > 0 && [...document.querySelectorAll('.dimg')].every((g) => g.style.opacity === '1' && g.querySelector('text').textContent === g.querySelector('text').dataset.to)`;
/** The definitions figure steps through its five versions every six seconds until a reader picks one; a click on Cambridge's dot picks English and holds it there. */
const ENGLISH = [['click', '.gtp-versions >> visible=true >> .gtp-globe-mark[aria-label^="English"]'], ['until', "[...document.querySelectorAll('.gtp-versions')].some((el) => el.dataset.held === 'true' && el.dataset.chosen === '0')"], ['settle', 4000], ['until', SETTLED]];

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
  // the back cover's legend alone, at twice the scale it is shown at, so its type reads in the notes
  { file: 'back', route: '/atlas', theme: 'dark', actions: [...openMagazine('translating-euclid'), ['last', NEXT], ['away']], clip: ['.gtr-legend', 0, 0, 1, 1], scale: 4 },
  { file: 'feature', route: '/atlas/translating-euclid', theme: 'light', actions: [['scroll', '.gtm-lead', 0, 0.2], ['settle', 800], ...ENGLISH] },
  { file: 'headline', route: '/atlas/rewriting-our-docs', theme: 'dark' },
  { file: 'shelf', route: '/atlas/shelf', theme: 'dark', actions: [['hover', `[data-testid="atlas-story-${DOCS}"]`]] },
  { file: 'covers', route: '/atlas/shelf', theme: 'dark', clip: [0, 180, 1440, 480] },
  { file: 'docs', route: `/atlas/shelf/${DOCS}`, theme: 'dark', actions: [['scroll', '.gtp-stub', 4, 0.36]] },
  { file: 'fuma', route: '/atlas/shelf/fuma-nama', theme: 'dark', actions: [['scroll', '.gtp-stub', 2, 0.36]] },
  { file: 'book', route: '/atlas/shelf/translating-euclid', theme: 'light' },
  { file: 'figure', route: '/atlas/shelf/translating-euclid', theme: 'light', actions: [['scroll', '.gtp-print-at', 0, 0.45], ['settle', 1500], ...ENGLISH] },
  {
    file: 'directions',
    theme: 'dark',
    // each poster draws itself on a clock after it opens, so each cell waits until its drawing is whole
    sheet: ['riffle', 'atlas', 'signal', 'proof', 'light', 'route', 'measure'].map((slug) => ({
      route: `/atlas/directions/${slug}`,
      actions: [['until', { light: LIGHT_DRAWN, measure: MEASURE_DRAWN }[slug] ?? SETTLED]],
    })).concat([
      { route: '/atlas/directions/riffle', actions: [['click', 'button[aria-label="Open"] >> visible=true'], ['away']] },
    ]),
  },
  { file: 'locator', route: '/atlas/shelf', theme: 'light', actions: [['click', GLOBE]] },
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
  else if (name === 'until') await page.waitForFunction(selector, undefined, { timeout: WAIT_MS, polling: 100 });
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

/** Runs in the page: resolves once the fonts, every picture in view, the front page, its covers and an open magazine are ready, with the pictures in view that failed. */
function ready() {
  // by place, not box: a picture still loading with no width or height attribute has no size yet
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return el.checkVisibility({ visibilityProperty: true }) && r.bottom >= 0 && r.right >= 0 && r.top <= innerHeight && r.left <= innerWidth;
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
  ])
    .then(pictures)
    .then(() => [...document.images].filter((img) => inView(img) && img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src));
}

/** A clip as a box in CSS pixels: as given, or that part of the selector's first visible match, padded. */
async function region(page, clip) {
  if (typeof clip[0] !== 'string') {
    const [x, y, width, height] = clip;
    return { x, y, width, height };
  }
  const [selector, fx, fy, fw, fh] = clip;
  const box = await page.locator(`${selector} >> visible=true`).first().boundingBox();
  if (!box) throw new Error(`${selector} has no box`);
  const x = Math.max(0, Math.round(box.x + box.width * fx - PAD));
  const y = Math.max(0, Math.round(box.y + box.height * fy - PAD));
  return { x, y, width: Math.round(box.width * fw + PAD * 2), height: Math.round(box.height * fh + PAD * 2) };
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
        const broken = await Promise.race([page.evaluate(ready), late]);
        if (broken.length > 0) throw new Error(`${route}: ${broken[0]} did not load`);
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
    // a page drawing covers on WebGPU can take half a minute to hand over a frame while other browsers share the GPU
    return await page.screenshot({ type: 'png', timeout: SHOT_MS, ...(clip ? { clip: await region(page, clip) } : {}) });
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
  return sheet;
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
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: shot.scale ?? SCALE, colorScheme: shot.theme });
  await seedTheme(context, shot.theme);
  const target = join(OUT, `${shot.file}.webp`);
  try {
    let png;
    if (shot.sheet) {
      const tiles = [];
      for (const cell of shot.sheet) tiles.push(await capture(context, cell));
      png = await contactSheet(browser, tiles);
    } else png = await capture(context, shot);
    const tmp = `${target}.png`;
    writeFileSync(tmp, png);
    // the PNG's width and height sit at bytes 16 and 20 of its header
    const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
    const fileWidth = Math.min(w, SHOWN * 2);
    const resize = w === fileWidth ? [] : ['-resize', String(fileWidth), '0'];
    execFileSync('cwebp', ['-quiet', '-q', String(QUALITY), '-m', '6', '-sharp_yuv', ...resize, tmp, '-o', target]);
    rmSync(tmp);
    bytes += statSync(target).size;
    const size = `${fileWidth}x${Math.round((h * fileWidth) / w)}`;
    console.log(`  ${shot.file.padEnd(12)} ${shot.theme.padEnd(5)} ${size}  ${statSync(target).size} bytes`);
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    failed.push(`${shot.file}: ${reason}`);
    console.error(`  ${shot.file.padEnd(12)} failed: ${reason}`);
  } finally {
    await context.close();
  }
}

await browser.close();
console.log(`capture-atlas: ${list.length - failed.length} pictures, ${bytes} bytes, in ${OUT.slice(ROOT.length + 1)}`);
if (failed.length > 0) {
  console.error(`capture-atlas: ${failed.length} failed\n${failed.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
