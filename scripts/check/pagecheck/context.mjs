// One browser context per cell, built the same way by the runner, the
// layout-shift trace and the interactions: the device's viewport, scale
// and touch flags (scripts/lib/site-pages.mjs, a phone or a tablet is a touch
// device in either orientation), the theme seeded through the site's
// pre-boot door and matched by the context's color scheme, and the
// observers the cell reads its layout shifts, its largest paint and its
// long tasks from, installed before the page's first byte.
import { deviceOptions, seedTheme } from '../../lib/site-pages.mjs';

/**
 * Runs in every page before its scripts: buffered observers for
 * layout-shift, largest-contentful-paint and longtask, collected on
 * window.__pcVitals for probes.mjs vitals() to read.
 */
function observeVitals() {
  const v = { shifts: [], lcp: null, longTasks: [] };
  window.__pcVitals = v;
  const desc = (n) =>
    n ? `${n.nodeName.toLowerCase()}${n.id ? '#' + n.id : ''}${typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}` : '?';
  const observe = (type, take) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(take)).observe({ type, buffered: true });
    } catch {
      // an entry type this build does not report; the reading stays empty
    }
  };
  observe('layout-shift', (e) =>
    v.shifts.push({ t: Math.round(e.startTime), value: e.value, recent: e.hadRecentInput, sources: (e.sources ?? []).slice(0, 3).map((s) => desc(s.node)) })
  );
  observe('largest-contentful-paint', (e) => {
    v.lcp = Math.round(e.startTime);
  });
  observe('longtask', (e) => v.longTasks.push(Math.round(e.duration)));
}

/** A context for one (device, theme) cell; the caller closes it. */
export async function cellContext(browser, { device, theme }) {
  const context = await browser.newContext({ ...deviceOptions(device), colorScheme: theme });
  await seedTheme(context, theme);
  await context.addInitScript(observeVitals);
  return context;
}

/**
 * Collects console errors, page errors and failed resources on a page;
 * returns the list, which fills as the page runs. The console's own
 * "Failed to load resource" line names no URL, so it is dropped and the
 * response with its status and address is recorded instead.
 */
export function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (/^Failed to load resource/.test(text)) return;
    errors.push(text.slice(0, 300));
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 300)}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url().slice(0, 240)}`);
  });
  page.on('requestfailed', (r) => {
    const reason = r.failure()?.errorText ?? 'failed';
    if (reason === 'net::ERR_ABORTED') return;
    errors.push(`request ${reason}: ${r.url().slice(0, 240)}`);
  });
  return errors;
}

/**
 * Reads the collected error strings back: the http entries as
 * { status, path, display, via } (an /_next/image request is read as the
 * image it asked for, `via` naming the optimizer; `display` drops a -dark
 * or -light suffix before the extension so one missing picture folds to
 * one report row across the themes), everything else under `other`.
 */
export function parseErrors(errors) {
  const http = [];
  const other = [];
  for (const e of errors ?? []) {
    const m = /^http (\d+): (\S+)/.exec(e);
    if (!m) {
      other.push(e);
      continue;
    }
    let path = m[2];
    let via = null;
    try {
      const u = new URL(m[2]);
      path = u.pathname;
      const inner = u.searchParams.get('url');
      if (u.pathname === '/_next/image' && inner) {
        via = '/_next/image';
        path = inner.replace(/\?.*$/, '');
      }
    } catch {
      /* not an absolute URL; the string stays as the path */
    }
    const display = path.replace(/-(dark|light)(\.[a-z0-9]+)$/i, '$2');
    http.push({ status: Number(m[1]), path, display, via });
  }
  return { http, other };
}
