// One browser context per cell, built the same way by the runner, the
// layout-shift run and the interactions: the viewport, the theme seeded
// through the site's pre-boot door (scripts/site-pages.mjs seedTheme) and
// matched by the context's color scheme, and the phone flags under 768px
// (isMobile, hasTouch, deviceScaleFactor 2) so a phone cell lays out and
// paints as a phone would.
import { seedTheme } from '../site-pages.mjs';

/** Under this width a viewport is a phone: the phone flags apply and the tap targets are read. */
export const PHONE_MAX = 767;

/** `WxH` to { w, h }; throws on anything else, so a typo never becomes a 0x0 context. */
export function parseViewport(text) {
  const m = /^(\d+)x(\d+)$/.exec(text.trim());
  if (!m) throw new Error(`viewport must read WxH, got ${JSON.stringify(text)}`);
  return { w: Number(m[1]), h: Number(m[2]) };
}

export function isPhone(w) {
  return w <= PHONE_MAX;
}

/** A context for one (viewport, theme) cell; the caller closes it. */
export async function cellContext(browser, { w, h, theme }) {
  const phone = isPhone(w);
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    colorScheme: theme,
    ...(phone ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { deviceScaleFactor: 1 }),
  });
  await seedTheme(context, theme);
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
