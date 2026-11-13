// Captures the deck's pictures of this site's own pages that show the logo,
// against a running server, so they are shot again whenever the logo
// changes (2026-11-12: the refined globe) instead of being cut by hand:
//   shots/proto-brand-head-light.jpg, -dark.jpg   slide 71: the /brand head,
//       its title, badge, lede and facts, a 1146 by 342 clip at 2x
//   shots/proto-present.jpg                       slide 77: the presenter's
//       title screen, the 1440 by 900 viewport at 1x, the moment the
//       byline has faded in, while the intro's light burst is still on the
//       title (it settles to a dim field within a second; reduced motion
//       skips the intro)
//   shots/proto-brand-light.jpg, -dark.jpg        slide 88's Brand row: /brand,
//       the 1440 by 900 viewport at 1x
//   shots/thumb/proto-brand.jpg, proto-production.jpg, proto-deck.jpg
//       the surfaces panel's rows for /brand, /d/production and /deck: the
//       1440 by 900 viewport in the light theme at 384 by 240
// Each is shot at 1440 by 900 after the fonts are ready and a 2.5 s settle
// (unless the shot names its own), with reduced motion requested unless
// the shot needs the motion, the theme seeded through the site's own door
// and the dev indicator hidden, as pnpm capture:pages shoots; Chrome runs
// on the GPU so the presenter's shader field draws.
// Each one is listed under "generated" in scripts/lint/logo.json, and the
// run records it there at its new bytes and the current LOGO.d, so a logo
// change makes every one stale (lint:logo rule 5) until it is shot again.
// Then pnpm build:deck re-encodes them into public/deck-assets.
//
//   node deck/shoot-proto.mjs [--base <url>, default PT_BASE] [name...]
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

import { option } from '../scripts/lib/args.mjs';
import { loadLogo, recordGenerated, sha256, unlisted, unlistedMessage, readManifest } from '../scripts/lib/logo-lock.mjs';
import { ROOT } from '../scripts/lib/root.mjs';
import { BASE_URL, chromePath, HIDE_DEV_UI_CSS, seedTheme } from '../scripts/lib/site-pages.mjs';

const D = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const BASE = (option(argv, '--base') ?? BASE_URL).replace(/\/$/, '');
const names = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--base');

/* a surfaces panel thumbnail: the 1440 px viewport at 384 px */
const THUMB = 384 / 1440;

/** name, route, theme, device scale, clip (CSS px; the whole viewport when absent) and, for a moving page, the element whose fade-in ends marks the moment to shoot it */
const SHOTS = [
  { name: 'proto-brand-head-light', route: '/brand', theme: 'light', scale: 2, clip: { x: 250, y: 52, width: 1146, height: 342 } },
  { name: 'proto-brand-head-dark', route: '/brand', theme: 'dark', scale: 2, clip: { x: 250, y: 52, width: 1146, height: 342 } },
  { name: 'proto-present', route: '/present', theme: 'dark', scale: 1, at: '.pr-intro-byline' },
  { name: 'proto-brand-light', route: '/brand', theme: 'light', scale: 1 },
  { name: 'proto-brand-dark', route: '/brand', theme: 'dark', scale: 1 },
  { name: 'thumb/proto-brand', route: '/brand', theme: 'light', scale: THUMB },
  { name: 'thumb/proto-production', route: '/d/production', theme: 'light', scale: THUMB },
  { name: 'thumb/proto-deck', route: '/deck', theme: 'light', scale: THUMB },
];
const chosen = SHOTS.filter((s) => names.length === 0 || names.includes(s.name));
const rels = chosen.map((shot) => `deck/shots/${shot.name}.jpg`);
/* every output is listed before anything is shot, so a new one is looked at and listed once */
const missing = unlisted(readManifest(ROOT), rels);
if (missing.length) {
  console.error(missing.map(unlistedMessage).join('\n'));
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: chromePath(), args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const shot of chosen) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: shot.scale, colorScheme: shot.theme, reducedMotion: shot.at ? 'no-preference' : 'reduce' });
  await seedTheme(context, shot.theme);
  /* the dev indicator, hidden from the first paint */
  await context.addInitScript((css) => addEventListener('DOMContentLoaded', () => document.head.append(Object.assign(document.createElement('style'), { textContent: css }))), `${HIDE_DEV_UI_CSS} .pt-toast { display: none !important; }`);
  const page = await context.newPage();
  await page.goto(`${BASE}${shot.route}`, { waitUntil: shot.at ? 'domcontentloaded' : 'networkidle', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  if (shot.at) await page.waitForFunction((selector) => Number(getComputedStyle(document.querySelector(selector) ?? document.body).opacity) >= 0.99 && document.querySelector(selector), shot.at, { polling: 'raf', timeout: 30000 });
  else await page.waitForTimeout(2500);
  await page.screenshot({ path: join(D, 'shots', `${shot.name}.jpg`), type: 'jpeg', quality: 90, ...(shot.clip ? { clip: shot.clip } : {}) });
  console.log(`  shots/${shot.name}.jpg`);
  await context.close();
}
await browser.close();
const { LOGO } = await loadLogo(ROOT);
recordGenerated(ROOT, rels, sha256(LOGO.d));
console.log(`  recorded ${rels.length} in scripts/lint/logo.json at LOGO.d ${sha256(LOGO.d).slice(0, 12)}`);
