// Declared interactions, each { id, pages, devices, run }: run receives
// a loaded page and the cell ({ w, h, kind, theme }) and returns
// { pass, ...readings }; the runner takes a capture before and after.
// `devices` names the devices it runs on (scripts/site-pages.mjs DEVICES),
// or 'run' for every dark device of the run. Dark theme only. The runner
// (pagecheck.mjs) puts every run in its one queue with the cells and
// writes the results to interactions/results.json, which the report
// prints.
//
// The ten for this site, each on what the code says it does:
//   theme-flip        the toolbar's Theme button flips html[data-theme] and
//                     persists gt-theme (ThemeButton.tsx applyTheme)
//   index-preview     the Index button opens the 460px panel over the stage
//                     (100% wide at or below 900px, IndexPanel.css) with its
//                     filter focused above 900px (IndexPanel.tsx leaves the
//                     focus alone on a narrow shell), and hovering a row
//                     opens its capture in the preview layer, directive 8.6
//                     (PreviewLayer.tsx, PREVIEW_DELAY_MS 80), with a mouse;
//                     Escape closes the panel
//   search            Ctrl K opens the search card (useShellKeys.ts,
//                     Search.tsx) inside the viewport, typing filters the
//                     rows, Escape closes it
//   deck-advance      with nothing clicked or focused since load, the right
//                     arrow moves to the next slide (deck/parts/tail.html
//                     show): the counter changes and the hash follows; a
//                     cold load of /deck#12, the link a search row opens,
//                     shows slide 12 (tail.html fromHash)
//   deck-slides       every slide of the deck, opened by its hash
//                     (tail.html fromHash), keeps every element inside the
//                     1600x900 sheet (the read deck/shoot-slide.mjs makes);
//                     once, since the slides do not depend on the viewport
//   deck-modes        the deck's grid (G) and book (B) views lay out inside
//                     the viewport with no overflow, nothing past the edge
//                     and no clipped text (probes.mjs readPage)
//   docs-toc          a contents link in the docs book is answered in place
//                     (DocsShell.tsx, the sheet's click handler): the
//                     address becomes the document's and its heading lands
//                     under the read line
//   present-controls  the presenter dock's Next slide button advances the
//                     count (PresenterApp.tsx goTo)
//   present-walk      the presenter on every device: j through the slides,
//                     each slide's title on screen with nothing painted over
//                     it, the "So I built 12" close beat and the prototypes
//                     grid showing the presenter's count, the grid's cards
//                     clear of the dock from 1280 wide, no chrome box over
//                     another and no horizontal overflow (hooks.mjs
//                     PRESENTER names the stops)
//   sidebar-rails     the sidebar's rail layer is live (SidebarRails.ts sets
//                     data-rails on the aside); a hover on a run row shows
//                     the pointer's thumb and pill; a click moves the mark
//                     to the row (or a deep heading under it once the read
//                     line passes one) and the current thumb rests there;
//                     under reduced motion a click starts no animation
//                     (DESIGN.md section 16)
import { join } from 'node:path';

import { device } from '../site-pages.mjs';
import { cellContext, collectErrors } from './context.mjs';
import { DECK_SKIP, PRESENTER } from './hooks.mjs';
import { readPage } from './probes.mjs';

const BOTH = ['390x844', '1440x900'];

/** How long a scrubbed timeline (scrub 0.45 in the presenter's slides) takes to catch up once the scroll rests. */
const SCRUB_MS = 600;

const rect = (page, selector) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const r1 = (n) => Math.round(n * 10) / 10;
    return { x: r1(b.x), y: r1(b.y), w: r1(b.width), h: r1(b.height), right: r1(b.right), bottom: r1(b.bottom) };
  }, selector);

const inside = (b, cell) => Boolean(b) && b.x >= -1 && b.y >= -1 && b.right <= cell.w + 1 && b.bottom <= cell.h + 1;

export const INTERACTIONS = [
  {
    id: 'theme-flip',
    pages: ['gallery', 'docs'],
    devices: BOTH,
    run: async (page) => {
      const before = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, stored: localStorage.getItem('gt-theme') }));
      await page.click('.pt-toolbar .pt-theme');
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, stored: localStorage.getItem('gt-theme') }));
      return { pass: before.theme === 'dark' && after.theme === 'light' && after.stored === 'light', before, after };
    },
  },
  {
    id: 'index-preview',
    pages: ['gallery', 'brand'],
    devices: BOTH,
    run: async (page, cell) => {
      await page.click('.pt-toolbar .pt-index-btn');
      await page.waitForTimeout(400);
      const panel = await rect(page, '.pt-panel.is-on');
      const focus = await page.evaluate(() => Boolean(document.activeElement?.closest('.pt-panel')));
      const narrow = cell.w <= 900;
      const wantedW = narrow ? cell.w : 460;
      /* IndexPanel.tsx focuses the filter only when the shell is not narrow, so a phone keyboard never opens with the panel */
      const panelOk = inside(panel, cell) && Math.abs((panel?.w ?? 0) - wantedW) <= 1 && (narrow || focus);
      const mouse = cell.kind === 'desktop';
      let preview = null;
      if (mouse) {
        const row = page.locator('.pt-panel .pt-surf[data-preview]').first();
        await row.hover();
        await page.waitForTimeout(600);
        preview = await rect(page, '.pt-preview.is-on');
      }
      const previewOk = mouse ? inside(preview, cell) : true;
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const closed = !(await page.$('.pt-panel.is-on'));
      return { pass: panelOk && previewOk && closed, panel, wantedW, filterFocused: focus, preview, closedOnEscape: closed };
    },
  },
  {
    id: 'search',
    pages: ['gallery', 'skills'],
    devices: BOTH,
    run: async (page, cell) => {
      await page.keyboard.press('Control+k');
      await page.waitForTimeout(400);
      const card = await rect(page, '.pt-search-card[role="dialog"]');
      const emptyRows = await page.locator('.pt-search-row').count();
      await page.keyboard.type('brand', { delay: 20 });
      await page.waitForTimeout(400);
      const rows = await page.locator('.pt-search-row').count();
      const count = await page.evaluate(() => document.querySelector('.pt-search-count')?.textContent?.trim() ?? null);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const closed = !(await page.$('.pt-search-card'));
      return { pass: inside(card, cell) && rows > 0 && closed, card, emptyRows, rowsForBrand: rows, count, closedOnEscape: closed };
    },
  },
  {
    id: 'deck-advance',
    pages: ['deck'],
    devices: BOTH,
    run: async (page) => {
      const read = () => page.evaluate(() => ({ counter: document.getElementById('counter')?.textContent?.trim() ?? null, hash: location.hash }));
      const before = await read();
      /* no click and no focus call: the deck is the top document and has the keys from load */
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(600);
      const after = await read();
      const deepLink = new URL(page.url());
      deepLink.hash = '#12';
      await page.goto('about:blank');
      await page.goto(deepLink.href, { waitUntil: 'load' });
      await page.waitForSelector('#sheet');
      const deep = await read();
      const advanced = Boolean(before.counter) && before.counter !== after.counter && after.hash === '#2';
      return { pass: advanced && parseInt(deep.counter ?? '', 10) === 12 && deep.hash === '#12', before, after, deep };
    },
  },
  {
    id: 'deck-slides',
    pages: ['deck'],
    devices: ['1440x900'],
    run: async (page) => {
      const r = await page.evaluate(async () => {
        const slides = [...document.querySelectorAll('#stage .slide')];
        const sheet = document.getElementById('sheet');
        const desc = (el) => `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''}`;
        const over = [];
        for (let k = 1; k <= slides.length; k++) {
          location.hash = `#${k}`;
          for (let n = 0; n < 40 && !slides[k - 1].classList.contains('is-on'); n++) await new Promise((done) => setTimeout(done, 25));
          await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
          const sb = sheet.getBoundingClientRect();
          /* boxes in the sheet's own 1600x900 units */
          const k1600 = 1600 / sb.width;
          const outside = [];
          for (const el of slides[k - 1].querySelectorAll('*')) {
            const b = el.getBoundingClientRect();
            if (!b.width && !b.height) continue;
            if (b.left < sb.left - 1 || b.top < sb.top - 1 || b.right > sb.right + 1 || b.bottom > sb.bottom + 1) {
              const at = (n) => Math.round(n * k1600);
              outside.push(`${desc(el)} at ${at(b.left - sb.left)},${at(b.top - sb.top)} ${at(b.width)}x${at(b.height)}`);
            }
          }
          if (outside.length) over.push({ slide: k, outside: outside.slice(0, 4) });
        }
        location.hash = '#1';
        return { slides: slides.length, over };
      });
      return { pass: r.slides > 0 && r.over.length === 0, ...r };
    },
  },
  {
    id: 'deck-modes',
    pages: ['deck'],
    devices: BOTH,
    run: async (page) => {
      const modes = {};
      for (const [mode, key, cls] of [
        ['grid', 'g', 'is-overview'],
        ['book', 'b', 'is-book'],
      ]) {
        await page.keyboard.press(key);
        await page.waitForTimeout(800);
        const [w, h, on] = await page.evaluate((c) => [innerWidth, innerHeight, Boolean(document.querySelector('.viewer')?.classList.contains(c))], cls);
        const reads = await page.evaluate(readPage, { touch: false, w, h, skip: DECK_SKIP, landmarks: {}, tapScope: 'body' });
        const clipped = reads.clipped.filter((c) => !c.srOnly && !c.ellipsis);
        modes[mode] = { on, overflow: reads.scrollWidth > reads.innerWidth, pastEdge: reads.pastEdge.slice(0, 4), clipped: clipped.slice(0, 4) };
        await page.keyboard.press(key);
        await page.waitForTimeout(500);
      }
      const ok = (m) => m.on && !m.overflow && m.pastEdge.length === 0 && m.clipped.length === 0;
      return { pass: ok(modes.grid) && ok(modes.book), ...modes };
    },
  },
  {
    id: 'docs-toc',
    pages: ['docs'],
    devices: BOTH,
    run: async (page) => {
      const link = page.locator('.ptd-toc a').nth(1);
      const href = await link.getAttribute('href');
      const slug = href?.split('/').pop() ?? '';
      await link.click();
      await page.waitForTimeout(2000);
      const after = await page.evaluate((s) => {
        const flow = document.querySelector('.sheet-flow');
        const h2 = document.getElementById(`ptd-${s}`);
        const fb = flow?.getBoundingClientRect();
        const hb = h2?.getBoundingClientRect();
        return {
          pathname: location.pathname,
          headingOffset: fb && hb ? Math.round(hb.top - fb.top) : null,
          activeRow: document.querySelector('.ptd-toc a[aria-current]')?.textContent?.trim() ?? null,
          activeDoc: document.querySelector('.ptd-doc.is-active h2')?.textContent?.trim() ?? null,
        };
      }, slug);
      const landed = after.headingOffset != null && after.headingOffset >= -2 && after.headingOffset <= 160;
      return { pass: after.pathname === href && landed, href, ...after };
    },
  },
  {
    id: 'sidebar-rails',
    pages: ['brand', 'docs'],
    devices: ['1440x900'],
    run: async (page) => {
      const live = await page.evaluate(() => Boolean(document.querySelector('.pt-sb[data-rails]')));
      const row = '.pt-sb .pt-nest .pt-nrow:not(.is-deep):not([data-mark])';
      const id = await page.evaluate((s) => document.querySelector(s)?.id ?? null, row);
      await page.hover(`#${id}`);
      await page.waitForTimeout(250);
      const hover = await page.evaluate(() => ({
        thumb: Boolean(document.querySelector('.pt-sb-thumb.is-hover[data-on]')),
        pill: Boolean(document.querySelector('.pt-sb-pill.is-hover[data-on]')),
      }));
      await page.click(`#${id}`);
      await page.waitForTimeout(300);
      /* the read line may pass a heading during the book's scroll and move the mark once more: wait for the list to rest */
      const rested = await page
        .waitForFunction(() => document.getAnimations().filter((a) => a.effect?.target?.closest?.('.pt-sb')).length === 0, null, { timeout: 2000 })
        .then(
          () => true,
          () => false
        );
      const after = await page.evaluate((want) => {
        const marked = document.querySelector('.pt-sb [data-mark]');
        return {
          /* the clicked row, or a deep heading under it once the read line passes one */
          onTarget: Boolean(marked) && (marked.id === want || marked.getAttribute('data-parent') === want),
          thumb: Boolean(document.querySelector('.pt-sb-thumb.is-current[data-on]')),
        };
      }, id);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(150);
      const other = await page.evaluate((s) => document.querySelector(s)?.id ?? null, row);
      await page.click(`#${other}`);
      const reduced = await page.evaluate(() => document.getAnimations().filter((a) => a.effect?.target?.closest?.('.pt-sb')).length);
      const pass = live && hover.thumb && hover.pill && rested && after.onTarget && after.thumb && reduced === 0;
      return { pass, live, hover, rested, after, reduced };
    },
  },
  {
    id: 'present-controls',
    pages: ['present'],
    devices: BOTH,
    run: async (page) => {
      const count = () => page.evaluate(() => document.querySelector('.pr-hud-count')?.textContent?.replace(/\s+/g, ' ').trim() ?? null);
      const before = await count();
      await page.click('.pr-dock button[aria-label="Next slide"]');
      await page.waitForTimeout(1500);
      const after = await count();
      const dock = await rect(page, '.pr-dock');
      return { pass: Boolean(before) && before !== after, before, after, dock };
    },
  },
  {
    id: 'present-walk',
    pages: ['present'],
    devices: 'run',
    run: presentWalk,
  },
];

/**
 * Waits for the window's scroll to rest after a key: until it moves (at
 * most 800ms, the last slide does not), then until three reads 100ms apart
 * agree (at most 5s), then for the scrubbed timelines to catch up.
 */
async function scrollRest(page, from) {
  const y = () => page.evaluate(() => Math.round(window.scrollY));
  const start = Date.now();
  while (Date.now() - start < 800 && (await y()) === from) await page.waitForTimeout(50);
  let last = null;
  let same = 0;
  while (Date.now() - start < 5000 && same < 3) {
    const now = await y();
    same = now === last ? same + 1 : 0;
    last = now;
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(SCRUB_MS);
}

/**
 * Reads one stop of the presenter, inside the page: whether the title's
 * text is on screen, shown (its opacity with its ancestors' above 0.1) and
 * clear of anything painted above it at five points of its text box, and
 * whether any two chrome boxes overlap. An element counts as painted when
 * it is shown and draws something: a ground with alpha above 0.05, a
 * background image, its own text, or an image, canvas, video, frame or
 * svg. Hit testing is opened to every element for the read (the
 * presenter's pinned layers turn pointer events off), so the list under a
 * point is the paint order.
 */
function readStop({ title, chrome }) {
  const desc = (n) => `${n.tagName.toLowerCase()}${typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
  const shown = (el) => {
    let opacity = 1;
    for (let n = el; n instanceof Element; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      opacity *= parseFloat(cs.opacity);
    }
    return opacity > 0.1;
  };
  const painted = (el) => {
    if (!shown(el)) return false;
    const cs = getComputedStyle(el);
    const ground = cs.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
    const alpha = ground.length === 4 ? ground[3] : ground.length === 3 ? 1 : 0;
    if (alpha > 0.05 || cs.backgroundImage !== 'none') return true;
    if (/^(img|canvas|video|iframe|svg)$/i.test(el.tagName)) return true;
    return [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const overflow = document.documentElement.scrollWidth > vw;
  const boxes = chrome
    .map((s) => [s, document.querySelector(s)])
    .filter(([, el]) => el && shown(el) && el.getBoundingClientRect().width > 0)
    .map(([s, el]) => [s, el.getBoundingClientRect()]);
  const overlaps = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const [a, p] = boxes[i];
      const [b, q] = boxes[j];
      if (Math.min(p.right, q.right) - Math.max(p.left, q.left) > 2 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 2) overlaps.push(`${a} and ${b}`);
    }
  }
  const el = document.querySelector(title);
  if (!el) return { missing: true, overflow, overlaps };
  const range = document.createRange();
  range.selectNodeContents(el);
  let b = range.getBoundingClientRect();
  if (!b.width || !b.height) b = el.getBoundingClientRect();
  const box = [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)];
  const onScreen = b.width > 0 && b.left >= -1 && b.top >= -1 && b.right <= vw + 1 && b.bottom <= vh + 1;
  const covered = [];
  const open = document.createElement('style');
  open.textContent = '* { pointer-events: auto !important; }';
  document.head.append(open);
  for (const [fx, fy] of [
    [0.5, 0.5],
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.75],
    [0.75, 0.75],
  ]) {
    const x = b.left + b.width * fx;
    const y = b.top + b.height * fy;
    if (x < 0 || y < 0 || x >= vw || y >= vh) continue;
    for (const e of document.elementsFromPoint(x, y)) {
      if (e === el || el.contains(e)) break;
      if (e.contains(el)) continue;
      if (painted(e)) {
        covered.push(desc(e));
        break;
      }
    }
  }
  open.remove();
  return { box, onScreen, shown: shown(el), covered: [...new Set(covered)], overflow, overlaps };
}

/** A stop's verdict: 'ok', or what is wrong with it. */
function stopVerdict(r) {
  const bad = [];
  if (r.missing) bad.push('no title');
  else {
    if (!r.shown) bad.push('title hidden');
    if (!r.onScreen) bad.push(`title off screen at ${r.box.join(',')}`);
    if (r.covered.length) bad.push(`title under ${r.covered.join(', ')}`);
  }
  if (r.overlaps.length) bad.push(`chrome overlaps: ${r.overlaps.join('; ')}`);
  if (r.overflow) bad.push('horizontal overflow');
  return bad.length ? bad.join('; ') : 'ok';
}

/** The present-walk interaction (hooks.mjs PRESENTER). */
async function presentWalk(page, cell) {
  const P = PRESENTER;
  const y = () => page.evaluate(() => Math.round(window.scrollY));
  const stops = {};
  let close = null;
  let grid = null;
  await page.keyboard.press('Home');
  await scrollRest(page, -1);
  for (const [i, stop] of P.stops.entries()) {
    if (i > 0) {
      const from = await y();
      await page.keyboard.press('j');
      await scrollRest(page, from);
    }
    stops[stop.slide] = stopVerdict(await page.evaluate(readStop, { title: stop.title, chrome: P.chrome }));
    if (stop.slide === P.close.slide) {
      /* the close beat: step through the slide's pin to `at`, so the scrubbed timeline plays through the beats before it */
      const geo = await page.evaluate((s) => {
        const el = document.querySelector(`[data-slide="${s}"]`);
        return { top: el.getBoundingClientRect().top + window.scrollY, len: el.offsetHeight - window.innerHeight };
      }, P.close.slide);
      const from = await y();
      const to = Math.round(geo.top + P.close.at * geo.len);
      for (let k = 1; k <= 10; k++) {
        await page.evaluate((top) => window.scrollTo(0, top), Math.round(from + ((to - from) * k) / 10));
        await page.waitForTimeout(120);
      }
      await scrollRest(page, to);
      const read = await page.evaluate(readStop, { title: P.close.title, chrome: P.chrome });
      const tiles = await page.locator(P.close.tiles).count();
      const verdict = stopVerdict(read);
      close = { verdict, tiles, pass: verdict === 'ok' && tiles === P.count };
    }
    if (stop.slide === P.grid.slide) {
      await page.keyboard.press(P.grid.key);
      await page.waitForTimeout(700);
      const read = await page.evaluate(readStop, { title: P.grid.title, chrome: [] });
      const fit = await page.evaluate(
        ({ cards, dock }) => {
          const d = document.querySelector(dock)?.getBoundingClientRect();
          const all = [...document.querySelectorAll(cards)].map((c) => c.getBoundingClientRect());
          const clear = all.filter((b) => b.top >= 0 && b.bottom <= (d ? d.top : window.innerHeight));
          return { cards: all.length, clear: clear.length };
        },
        { cards: P.grid.cards, dock: P.grid.dock }
      );
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const verdict = stopVerdict(read);
      const fits = cell.w < P.grid.fitFrom || fit.clear === fit.cards;
      grid = { verdict, ...fit, pass: verdict === 'ok' && fit.cards === P.count && fits };
    }
  }
  const pass = Object.values(stops).every((v) => v === 'ok') && Boolean(close?.pass) && Boolean(grid?.pass);
  return { pass, count: P.count, stops, close, grid };
}

/**
 * The interaction runs for a check: every declared interaction (or the ids
 * in `only`) on each of its pages that the run includes, at its devices.
 */
export function interactionTasks({ pages, devices, only, log = () => {} }) {
  const byId = new Map(pages.map((p) => [p.id, p]));
  const tasks = [];
  for (const it of INTERACTIONS) {
    if (only && !only.includes(it.id)) continue;
    for (const pageId of it.pages) {
      const item = byId.get(pageId);
      if (!item) {
        /* the page is outside this run's --pages list: not a failure, the interaction is not run */
        if (only) log(`interaction ${it.id} skipped: ${pageId} is not in this run`);
        continue;
      }
      const names = it.devices === 'run' ? devices.map((d) => d.name) : it.devices;
      for (const name of names) tasks.push({ interaction: it, item, device: device(name) });
    }
  }
  return tasks;
}

/**
 * One interaction run in dark: a fresh context, the page opened the way a
 * cell opens it (`open`, pagecheck.mjs), a capture before and after, the
 * readings. A thrown step is recorded as a failure, never fatal; a capture
 * that fails costs only the capture.
 */
export async function runInteraction(browser, { outDir, open, interaction: it, item, device: d }) {
  const cell = { w: d.w, h: d.h, kind: d.kind, theme: 'dark' };
  const started = Date.now();
  const context = await cellContext(browser, { device: d, theme: 'dark' });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const name = `${it.id}-${item.id}-${d.name}`;
  const shot = (when) =>
    page.screenshot({ path: join(outDir, `${name}-${when}.png`), timeout: 60000 }).then(
      () => `${name}-${when}.png`,
      () => null
    );
  let row = { id: it.id, page: item.id, viewport: d.name };
  try {
    await open(page, item);
    const before = await shot('before');
    const readings = await it.run(page, cell);
    const after = await shot('after');
    row = { ...row, ...readings, before, after };
  } catch (err) {
    row = { ...row, pass: false, error: String(err).slice(0, 400) };
  }
  row.consoleErrors = errors;
  row.ms = Date.now() - started;
  await context.close().catch(() => {});
  return row;
}
