// The layout-shift trace (pnpm check:pages --cls-trace): for a cell whose
// shift score reached a note, the page is loaded again with a
// PerformanceObserver on layout-shift installed before navigation (an
// init script, so the entries from the first paint are buffered), then 6s
// of box samples every 50ms (the document height, the h1, every
// landmark), then the entries over 0.001 with their sources, and an end
// capture. Writes <out>/<id>-<device>-<theme>.json and -end.png. Every
// cell already reads and judges its score (probes.mjs); the trace is for
// explaining a shift.
//
// Why the sampling as well as the observer: the observer reports what the
// browser counts as a shift, which excludes moves within 500ms of an
// input and moves of elements that change size in place; the samples show
// what moved and when, so a reader can tell a shift from a fade.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { HIDE_DEV_UI_CSS } from '../site-pages.mjs';
import { cellContext, collectErrors } from './context.mjs';

/** How long the samples run after navigation commits. */
const SAMPLE_MS = 6000;
const SAMPLE_EVERY_MS = 50;

/** Entries at or under this value are noise the report does not list. */
const SHIFT_FLOOR = 0.001;

export async function runCls(browser, { base, item, device, theme, outDir, landmarks }) {
  const tag = `${item.id}-${device.name}-${theme}`;
  const context = await cellContext(browser, { device, theme });
  await context.addInitScript(() => {
    window.__pcShifts = [];
    const desc = (n) =>
      n
        ? `${n.nodeName.toLowerCase()}${n.id ? '#' + n.id : ''}${typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 3).join('.') : ''}`
        : '?';
    const r = (x) => (x ? [Math.round(x.x), Math.round(x.y), Math.round(x.width), Math.round(x.height)] : null);
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__pcShifts.push({
            t: Math.round(e.startTime),
            value: +e.value.toFixed(4),
            recent: Boolean(e.hadRecentInput),
            sources: (e.sources || []).map((s) => ({ node: desc(s.node), from: r(s.previousRect), to: r(s.currentRect) })),
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (err) {
      window.__pcShiftErr = String(err);
    }
  });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const sample = () =>
    page.evaluate((marks) => {
      const box = (el) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)];
      };
      const out = { t: Math.round(performance.now()), doc: document.documentElement.scrollHeight, h1: box(document.querySelector('h1')) };
      for (const [name, selector] of Object.entries(marks)) {
        try {
          out[name] = box(document.querySelector(selector));
        } catch {
          out[name] = null;
        }
      }
      return out;
    }, landmarks);
  let result;
  try {
    const t0 = Date.now();
    await page.goto(`${base}${item.path}`, { waitUntil: 'commit', timeout: 120000 });
    const rows = [];
    while (Date.now() - t0 < SAMPLE_MS) {
      try {
        rows.push(await sample());
      } catch {
        // the document is still being replaced; the next tick reads it
      }
      await page.waitForTimeout(SAMPLE_EVERY_MS);
    }
    const key = (r) => JSON.stringify({ ...r, t: 0 });
    const changed = rows.filter((r, i) => i === 0 || key(r) !== key(rows[i - 1]));
    const tail = await page.evaluate(() => ({
      shifts: window.__pcShifts ?? [],
      err: window.__pcShiftErr ?? null,
      paint: performance.getEntriesByType('paint').map((e) => [e.name, Math.round(e.startTime)]),
      theme: document.documentElement.dataset.theme ?? null,
    }));
    await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
    await page.screenshot({ path: join(outDir, `${tag}-end.png`) });
    const values = tail.shifts.map((s) => s.value);
    const over = tail.shifts.filter((s) => s.value > SHIFT_FLOOR);
    result = {
      id: item.id,
      viewport: device.name,
      theme,
      count: values.length,
      sum: +values.reduce((a, b) => a + b, 0).toFixed(4),
      max: values.length ? Math.max(...values) : 0,
      over001: over,
      observerError: tail.err,
      paint: tail.paint,
      samples: rows.length,
      docHeights: rows.length ? [rows[0].doc, rows[rows.length - 1].doc] : null,
      consoleErrors: errors,
      changed,
    };
  } catch (err) {
    result = { id: item.id, viewport: device.name, theme, error: String(err).slice(0, 400), consoleErrors: errors };
  }
  writeFileSync(join(outDir, `${tag}.json`), JSON.stringify(result, null, 1));
  await context.close();
  return result;
}
