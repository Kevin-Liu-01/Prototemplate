// Screenshot harness for the Next redesign app.
// Usage: node shoot-route.mjs <slug> <out-dir>
//   e.g. node shoot-route.mjs concrete-mono shots/next/concrete-mono
// Assumes the shared dev server is up on :3005 (pnpm --dir apps/redesign dev).
// Captures desktop viewport shots at 13 scroll depths + 4 mobile, and reports
// page errors plus any Next error overlay that appeared.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const EXEC = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = process.env.REDESIGN_BASE || 'http://localhost:3005';

const [, , slug, outDir] = process.argv;
if (!slug || !outDir) {
  console.error('usage: node shoot-route.mjs <slug> <out-dir>');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

// chrome=0 hides the gallery's own switcher dock, which otherwise sits over the
// footer and the story timeline and would be judged as part of the design.
const url = `${BASE}/review`;
const errors = [];
const shots = [];

// Wait for the dev server before launching a browser at it.
let up = false;
for (let i = 0; i < 40; i++) {
  try {
    const res = await fetch(BASE, { method: 'HEAD' });
    if (res.ok || res.status < 500) { up = true; break; }
  } catch {}
  await new Promise((r) => setTimeout(r, 1000));
}
if (!up) {
  console.log(JSON.stringify({ fatal: `dev server not reachable at ${BASE} — start it with: pnpm --dir apps/redesign dev` }, null, 2));
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: EXEC, headless: true });

async function shootAt(page, tag, fraction) {
  await page.evaluate((f) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.round(max * f);
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
      window.lenis.scrollTo(y, { immediate: true, force: true });
    }
    window.scrollTo(0, y);
    window.dispatchEvent(new Event('scroll'));
  }, fraction);
  await page.waitForTimeout(1100);
  const file = path.join(outDir, `${tag}.png`);
  await page.screenshot({ path: file });
  shots.push(file);
}

async function run(viewport, dsf, prefix, fractions) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`[${prefix}] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${prefix}] console: ${m.text()}`);
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch {
    errors.push(`[${prefix}] networkidle timeout (first compile can be slow; page may still render)`);
  }
  await page.waitForTimeout(2500);

  // Next surfaces build/runtime failures in a portal overlay; a screenshot of
  // the overlay would otherwise read as a "styled page" to a visual critic.
  // The portal itself is always mounted in dev (it hosts the dev indicator),
  // so key off the error dialog inside it rather than the element's presence.
  const overlay = await page.evaluate(() => {
    for (const el of document.querySelectorAll('nextjs-portal')) {
      const root = el.shadowRoot;
      if (!root) continue;
      const dialog = root.querySelector('[data-nextjs-dialog], [data-nextjs-error-overlay]');
      if (dialog) return (dialog.textContent || 'error dialog').slice(0, 300);
    }
    return null;
  });
  if (overlay) errors.push(`[${prefix}] NEXT ERROR OVERLAY: ${overlay}`);

  for (let i = 0; i < fractions.length; i++) {
    await shootAt(page, `${prefix}${String(i).padStart(2, '0')}`, fractions[i]);
  }
  await ctx.close();
}

try {
  await run({ width: 1440, height: 900 }, 2, 'd', [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.9, 1]);
  await run({ width: 390, height: 844 }, 2, 'm', [0, 0.33, 0.66, 1]);
} finally {
  await browser.close();
}

const summary = { url, shots, errorCount: errors.length, errors: errors.slice(0, 20) };
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
