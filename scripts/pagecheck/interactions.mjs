// Declared interactions, each { id, pages, viewports, run }: run receives
// a loaded page and the cell and returns { pass, ...readings }; the runner
// takes a capture before and after and writes every result to
// interactions/results.json, which the report prints. Dark theme only; the
// pages are read at 390x844 and 1440x900 unless the interaction narrows
// that.
//
// The seven for this site, each on what the shell code says it does:
//   theme-flip        the toolbar's Theme button flips html[data-theme] and
//                     persists gt-theme (ThemeButton.tsx applyTheme)
//   index-preview     the Index button opens the 460px panel over the stage
//                     (100% wide at or below 900px, IndexPanel.css) with its
//                     filter focused above 900px (IndexPanel.tsx leaves the
//                     focus alone on a narrow shell), and hovering a row
//                     opens its capture in the preview layer, directive 8.6
//                     (PreviewLayer.tsx, PREVIEW_DELAY_MS 80), on desktop;
//                     Escape closes the panel
//   search            Ctrl K opens the search card (useShellKeys.ts,
//                     Search.tsx) inside the viewport, typing filters the
//                     rows, Escape closes it
//   deck-advance      with the deck's frame focused, the right arrow moves
//                     to the next slide (deck/parts/tail.html show), the
//                     frame's counter changes and the page's hash follows
//                     (DeckFrame.tsx)
//   docs-toc          a contents link in the docs book is answered in place
//                     (DocsShell.tsx, the sheet's click handler): the
//                     address becomes the document's and its heading lands
//                     under the read line
//   present-controls  the presenter dock's Next slide button advances the
//                     count (PresenterApp.tsx goTo)
//   sidebar-rails     the sidebar's rail layer is live (SidebarRails.ts sets
//                     data-rails on the aside); a hover on a run row shows
//                     the pointer's thumb and pill; a click moves the mark
//                     to the row (or a deep heading under it once the read
//                     line passes one) and the current thumb rests there;
//                     under reduced motion a click starts no animation
//                     (DESIGN.md section 16)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { HIDE_DEV_UI_CSS } from '../site-pages.mjs';
import { cellContext, collectErrors, parseViewport } from './context.mjs';

const BOTH = ['390x844', '1440x900'];

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
    viewports: BOTH,
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
    viewports: BOTH,
    run: async (page, cell) => {
      await page.click('.pt-toolbar .pt-index-btn');
      await page.waitForTimeout(400);
      const panel = await rect(page, '.pt-panel.is-on');
      const focus = await page.evaluate(() => Boolean(document.activeElement?.closest('.pt-panel')));
      const narrow = cell.w <= 900;
      const wantedW = narrow ? cell.w : 460;
      /* IndexPanel.tsx focuses the filter only when the shell is not narrow, so a phone keyboard never opens with the panel */
      const panelOk = inside(panel, cell) && Math.abs((panel?.w ?? 0) - wantedW) <= 1 && (narrow || focus);
      let preview = null;
      if (!cell.phone) {
        const row = page.locator('.pt-panel .pt-surf[data-preview]').first();
        await row.hover();
        await page.waitForTimeout(600);
        preview = await rect(page, '.pt-preview.is-on');
      }
      const previewOk = cell.phone ? true : inside(preview, cell);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const closed = !(await page.$('.pt-panel.is-on'));
      return { pass: panelOk && previewOk && closed, panel, wantedW, filterFocused: focus, preview, closedOnEscape: closed };
    },
  },
  {
    id: 'search',
    pages: ['gallery', 'skills'],
    viewports: BOTH,
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
    viewports: BOTH,
    run: async (page) => {
      const frame = () => page.frames().find((f) => /brand-deck\.html/.test(f.url()));
      const read = async () => {
        const f = frame();
        const counter = f ? await f.evaluate(() => document.getElementById('counter')?.textContent?.trim() ?? null) : null;
        const hash = await page.evaluate(() => location.hash);
        return { counter, hash };
      };
      const before = await read();
      await page.focus('.pt-deck-frame');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(600);
      const after = await read();
      return { pass: Boolean(before.counter) && before.counter !== after.counter && after.hash === '#2', before, after };
    },
  },
  {
    id: 'docs-toc',
    pages: ['docs'],
    viewports: BOTH,
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
    viewports: ['1440x900'],
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
    viewports: BOTH,
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
];

/**
 * Runs every declared interaction (or the ids in `only`) on its pages and
 * viewports in dark, with before and after captures under outDir, and
 * writes results.json there. A thrown step is recorded as a failure, never
 * fatal.
 */
export async function runInteractions(browser, { base, pages, outDir, only, interactions = INTERACTIONS, log = () => {} }) {
  mkdirSync(outDir, { recursive: true });
  const results = [];
  const byId = new Map(pages.map((p) => [p.id, p]));
  for (const it of interactions) {
    if (only && !only.includes(it.id)) continue;
    for (const pageId of it.pages) {
      const item = byId.get(pageId);
      if (!item) {
        /* the page is outside this run's --pages list: not a failure, the interaction is not run */
        log(`interaction ${it.id} skipped: ${pageId} is not in this run`);
        continue;
      }
      for (const vp of it.viewports) {
        const { w, h } = parseViewport(vp);
        const cell = { w, h, phone: w <= 767, theme: 'dark' };
        const t0 = Date.now();
        const context = await cellContext(browser, cell);
        const page = await context.newPage();
        const errors = collectErrors(page);
        const name = `${it.id}-${pageId}-${vp}`;
        let row = { id: it.id, page: pageId, viewport: vp };
        try {
          await page.goto(`${base}${item.path}`, { waitUntil: 'load', timeout: 120000 });
          await page.evaluate(() => document.fonts.ready);
          await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
          await page.waitForTimeout(item.settleMs ?? 3000);
          await page.screenshot({ path: join(outDir, `${name}-before.png`) });
          const readings = await it.run(page, cell);
          await page.screenshot({ path: join(outDir, `${name}-after.png`) });
          row = { ...row, ...readings, before: `${name}-before.png`, after: `${name}-after.png` };
        } catch (err) {
          row = { ...row, pass: false, error: String(err).slice(0, 400) };
        }
        row.consoleErrors = errors;
        row.ms = Date.now() - t0;
        results.push(row);
        log(`interaction ${name} ${row.pass ? 'pass' : 'FAIL'}${row.error ? ' ' + row.error : ''} ${row.ms}ms`);
        writeFileSync(join(outDir, 'results.json'), JSON.stringify(results, null, 1));
        await context.close();
      }
    }
  }
  writeFileSync(join(outDir, 'results.json'), JSON.stringify(results, null, 1));
  return results;
}
