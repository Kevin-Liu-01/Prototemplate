// Draws the logo into the five Atlas share cards in public/atlas/og: the
// front page's rack (atlas.png) and each story's cover with its title. The
// cards are captures of the Atlas pages from 2026-10-23, whose covers are
// WebGPU drawings, so everything on them stays as captured except the cover
// of the Atlas imprint, the book at the top left. The generator repaints
// only that cover's own pixels: the ground the logo shows through, then the
// cover in the imprint's ink with LOGO (src/lib/logo.ts) cut through its top
// left corner, at the size and place PressMark.tsx gives it
// (src/app/atlas/(magazine)/_atlas/ui/PressMark.tsx: the logo's drawn box 28
// units square at 31, 20 on the 112 by 140 imprint; the cover 73 by 99 at
// 25, 14). Each card is read and written in place, and the repainted pixels
// depend on nothing under them, so a run on its own output writes the same
// bytes.
//
// CARDS holds each card's imprint (its left and top edge and its height in
// px) and its two colours, read off the cards: the cover's ink and the
// ground inside the board. The PNGs are drawn by the Chrome for Testing
// build playwright-core installs (CHROME_PATH overrides it), and each one's
// sha256 and the LOGO.d hash it was drawn from are recorded in
// scripts/lint/logo.json, which pnpm lint:logo holds them to.
//
// Usage:
//   node scripts/build/atlas-og.mjs                          redraw public/atlas/og and record it
//   node scripts/build/atlas-og.mjs --from <dir> --out <dir> redraw the same five cards from
//        another copy (gt-cloud's apps/atlas/public/atlas/og) into <dir>; nothing is recorded
/* oxlint-disable no-console -- a generator reporting what it wrote. */
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

import { helpIfAsked } from '../lib/help.mjs';
import { recordGenerated, sha256 } from '../lib/logo-lock.mjs';
import { ROOT } from '../lib/root.mjs';
import { chromePath } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const { LOGO } = await import(new URL('../../src/lib/logo.ts', import.meta.url).href);

const OG = 'public/atlas/og';
/** Each card: the imprint's left and top edge and its height in px, the cover's ink and the ground inside the board. */
const CARDS = {
  'atlas.png': { x: 49, y: 44, h: 56, ink: '#fafafa', ground: '#000000' },
  'designing-docs-for-humans.png': { x: 56, y: 63, h: 44, ink: '#f4f6fb', ground: '#252f4b' },
  'fuma-nama.png': { x: 56, y: 63, h: 44, ink: '#170a02', ground: '#fa7c2c' },
  'rewriting-our-docs.png': { x: 56, y: 63, h: 44, ink: '#f4f4f5', ground: '#2b2b2b' },
  'translating-euclid.png': { x: 56, y: 63, h: 44, ink: '#1d1a14', ground: '#eee6d2' },
};
/* PressMark.tsx, in imprint units: the 112 by 140 box, the cover and the logo's drawn box in it */
const IMPRINT = { w: 112, h: 140 };
const COVER = { x: 25, y: 14, w: 73, h: 99 };
const MARK = { x: 31, y: 20, size: 28 };

const argv = process.argv.slice(2);
const arg = (name) => (argv.includes(name) ? resolve(argv[argv.indexOf(name) + 1]) : null);
const from = arg('--from') ?? join(ROOT, OG);
const out = arg('--out') ?? join(ROOT, OG);
const record = !arg('--out');
mkdirSync(out, { recursive: true });

/** The cover over the card, in card px: a ground rect on the cover's whole pixels, then the cover with the logo cut out. */
function cover({ x, y, h, ink, ground }) {
  const s = h / IMPRINT.h;
  const [bx, by, bw] = LOGO.viewBox.split(' ').map(Number);
  const left = Math.floor(x + COVER.x * s);
  const top = Math.floor(y + COVER.y * s);
  const right = Math.ceil(x + (COVER.x + COVER.w) * s);
  const bottom = Math.ceil(y + (COVER.y + COVER.h) * s);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" fill="${ground}" shape-rendering="crispEdges"/>
  <g transform="translate(${x} ${y}) scale(${s})">
    <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="${IMPRINT.w}" height="${IMPRINT.h}">
      <rect width="${IMPRINT.w}" height="${IMPRINT.h}" fill="#fff"/>
      <g transform="translate(${MARK.x} ${MARK.y}) scale(${MARK.size / bw})">
        <path transform="translate(${-bx} ${-by})" fill="#000" fill-rule="${LOGO.fillRule}" d="${LOGO.d}"/>
      </g>
    </mask>
    <rect x="${COVER.x}" y="${COVER.y}" width="${COVER.w}" height="${COVER.h}" fill="${ink}" mask="url(#cut)"/>
  </g>
</svg>`;
}

const browser = await chromium.launch({ executablePath: chromePath() });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const [name, card] of Object.entries(CARDS)) {
    const png = `data:image/png;base64,${readFileSync(join(from, name)).toString('base64')}`;
    await page.setContent(
      `<style>html,body{margin:0}img,svg{position:absolute;left:0;top:0;display:block}</style><img src="${png}" width="1200" height="630">${cover(card)}`
    );
    await page.evaluate(() => document.querySelector('img').decode());
    await page.screenshot({ path: join(out, name), clip: { x: 0, y: 0, width: 1200, height: 630 } });
    console.log(`atlas-og: ${join(out, name)}`);
  }
} finally {
  await browser.close();
}

if (record) {
  recordGenerated(ROOT, Object.keys(CARDS).map((name) => `${OG}/${name}`), sha256(LOGO.d));
  console.log("atlas-og: scripts/lint/logo.json (the cards' sha256)");
}
