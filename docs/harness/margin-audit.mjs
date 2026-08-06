/* Page-wide vertical-margin audit + junction ledgers. Lists every element
   whose computed margin-top/bottom exceeds a threshold, and composes a
   pixel ledger of who owns each strip at the two flagged band junctions.
   Usage: node docs/harness/margin-audit.mjs [url] [theme] [minPx] */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL = process.argv[2] ?? 'http://localhost:3006/d/singularity-orbit';
const THEME = process.argv[3] ?? 'dark';
const MIN = Number(process.argv[4] ?? 16);

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), THEME);
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const report = await page.evaluate((minPx) => {
  const sig = (el) => {
    const cls = typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 3).join('.') : '';
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''}`;
  };

  // 1) every element with a real vertical margin
  const margins = [];
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const mt = parseFloat(cs.marginTop) || 0;
    const mb = parseFloat(cs.marginBottom) || 0;
    if (mt >= minPx || mb >= minPx) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      margins.push({
        el: sig(el),
        marginTop: mt,
        marginBottom: mb,
        docTop: Math.round(r.top + window.scrollY),
        docBottom: Math.round(r.bottom + window.scrollY),
        h: Math.round(r.height),
      });
    }
  }
  margins.sort((a, b) => Math.max(b.marginTop, b.marginBottom) - Math.max(a.marginTop, a.marginBottom));

  // 2) junction ledgers for the two flagged bands
  const ledger = (id) => {
    const sec = document.querySelector(`#${id}`);
    if (!sec) return null;
    const cs = getComputedStyle(sec);
    const inEl = sec.querySelector('.tcb-in');
    const inCs = inEl ? getComputedStyle(inEl) : null;
    const next = sec.nextElementSibling;
    const nextCs = next ? getComputedStyle(next) : null;
    const r = (e) => {
      const b = e.getBoundingClientRect();
      return { top: Math.round(b.top + window.scrollY), bottom: Math.round(b.bottom + window.scrollY) };
    };
    // last visible content inside the band: deepest descendant with text/art
    let lastContent = null;
    for (const el of sec.querySelectorAll('*')) {
      const b = el.getBoundingClientRect();
      if (b.height === 0 || b.height > 600) continue;
      const hasText = el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      const isArt = el.tagName === 'svg' || el.tagName === 'CANVAS' || el.tagName === 'IMG';
      if (!hasText && !isArt) continue;
      const bot = b.bottom + window.scrollY;
      if (!lastContent || bot > lastContent.bottom) lastContent = { el: sig(el), bottom: Math.round(bot) };
    }
    return {
      section: { sig: sig(sec), ...r(sec), marginBottom: cs.marginBottom, paddingBottom: cs.paddingBottom, borderBottom: cs.borderBottomWidth },
      tcbIn: inEl
        ? { ...r(inEl), marginBottom: inCs.marginBottom, paddingBottom: inCs.paddingBottom, borderBottom: inCs.borderBottomWidth }
        : null,
      lastContent,
      next: next
        ? { sig: sig(next), ...r(next), marginTop: nextCs.marginTop, paddingTop: nextCs.paddingTop }
        : null,
    };
  };

  return {
    margins: margins.slice(0, 40),
    platform: ledger('platform'),
    context: ledger('context'),
  };
}, MIN);

console.log(JSON.stringify(report, null, 1));
await browser.close();
