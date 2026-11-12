// Writes the logo's files from its one drawing, LOGO in src/lib/logo.ts:
//
//   public/brand/gt-globe-logo.svg              currentColor on the drawn box, for
//                                               masks (the docs lead demo) and inline use
//   public/brand/gt-globe-logo-light.svg        #070707 ink on the 256 square
//   public/brand/gt-globe-logo-dark.svg         #ffffff on the 256 square
//   public/brand/gt-globe-logo-icon.svg         the tab icon on the drawn box: ink,
//                                               and white under a dark color scheme
//   public/brand/gt-globe-logo.ico              the raster tab icon at 16, 32 and 48
//                                               px: the white logo on the ink ground,
//                                               so it reads on a light or a dark tab
//                                               strip, as the hub's favicon.ico does
//   public/brand/no-bg-gt-globe-logo-light.png  and -dark.png at 1198 px, -light-96,
//                                               -dark-96 and -dark-256 on a
//                                               transparent ground
//   public/brand/gt-globe-logo.json             the fingerprint every outside check
//                                               compares against: the id, the sha256 of
//                                               LOGO.d, the viewBox, the sha256 of the
//                                               lockup's numbers and the two lockup gaps
//   the retired addresses                       gt-logo-light.svg and -dark.svg (500
//                                               px), gt-logo-light.png (1563 px on
//                                               white), no-bg-gt-logo-*.png and
//                                               /static/avatars/logo.png (96 px on
//                                               white): the doubled-line monogram's
//                                               addresses, which other sites link to,
//                                               drawn as the globe at their old size
//                                               and ground (Kevin, 2026-11-10)
//   public/marks/graticule/variations/<id>.svg  the logo's catalog row on /marks, on
//                                               the catalog's canonical 256 header
//   public/marks/production/gt-mark.svg         /marks' production card of the GT mark,
//                                               the same file as gt-globe-logo.svg; the
//                                               monogram it held is history at
//                                               public/marks/previous/gt-monogram.svg
//   motion/kit/brand/gt-mark.svg                the films' copy of gt-globe-logo.svg
//   motion/kit/brand/gt-mark.js                 window.GT_LOGO for the films' scripts
//   deck/parts/head.html                        the #gt-mark symbol's viewBox and path
//
// The PNGs are drawn by the Chrome for Testing build playwright-core
// installs (CHROME_PATH overrides it), and each one's sha256 and the LOGO.d
// hash it was drawn from are recorded in scripts/lint/logo.json, which
// pnpm lint:logo holds them to. Run pnpm build:deck after it, so the built
// deck takes the symbol. Usage: pnpm build:logo
/* oxlint-disable no-console -- a generator reporting what it wrote. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

import { helpIfAsked } from '../lib/help.mjs';
import { fingerprint, fingerprintText, recordGenerated, sha256 } from '../lib/logo-lock.mjs';
import { ROOT } from '../lib/root.mjs';
import { chromePath } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const { LOGO, LOCKUP } = await import(new URL('../../src/lib/logo.ts', import.meta.url).href);
const path = (fill) => `<path fill="${fill}" fill-rule="${LOGO.fillRule}" d="${LOGO.d}"/>`;
const svg = (viewBox, body, size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size ? ` width="${size}" height="${size}"` : ''} role="img" aria-label="${LOGO.name}">${body}</svg>\n`;

const master = svg(LOGO.viewBox, path('currentColor'));
const FILES = {
  'public/brand/gt-globe-logo.svg': master,
  'public/brand/gt-globe-logo-light.svg': svg(LOGO.square, path('#070707'), 256),
  'public/brand/gt-globe-logo-dark.svg': svg(LOGO.square, path('#ffffff'), 256),
  'public/brand/gt-globe-logo-icon.svg': svg(
    LOGO.viewBox,
    `<style>path{fill:#070707}@media (prefers-color-scheme:dark){path{fill:#ffffff}}</style><path fill-rule="${LOGO.fillRule}" d="${LOGO.d}"/>`
  ),
  'public/brand/gt-globe-logo.json': fingerprintText(fingerprint(ROOT, LOGO, LOCKUP)),
  /* the retired addresses, at the monogram files' 500 px on a transparent ground */
  'public/brand/gt-logo-light.svg': svg(LOGO.square, path('#070707'), 500),
  'public/brand/gt-logo-dark.svg': svg(LOGO.square, path('#ffffff'), 500),
  'public/marks/production/gt-mark.svg': master,
  /* the logo's catalog file on /marks, on the catalog's canonical header */
  [`public/marks/graticule/variations/${LOGO.id}.svg`]: svg(LOGO.square, path('currentColor'), 256),
  'motion/kit/brand/gt-mark.svg': master,
  'motion/kit/brand/gt-mark.js': `// The General Translation logo for the films' scripts, written by pnpm build:logo from LOGO in\n// src/lib/logo.ts; load it before kit/sheet.js or a film's lib/film.js. Do not edit.\nwindow.GT_LOGO = ${JSON.stringify({ d: LOGO.d, viewBox: LOGO.viewBox, fillRule: LOGO.fillRule })};\n`,
};
for (const [rel, text] of Object.entries(FILES)) {
  writeFileSync(join(ROOT, rel), text);
  console.log(`logo: ${rel}`);
}

/* the rasters: [file, px, fill, ground]; the retired addresses keep their old size and ground */
const PNGS = [
  ['public/brand/no-bg-gt-globe-logo-light.png', 1198, '#070707'],
  ['public/brand/no-bg-gt-globe-logo-dark.png', 1198, '#ffffff'],
  ['public/brand/no-bg-gt-globe-logo-light-96.png', 96, '#070707'],
  ['public/brand/no-bg-gt-globe-logo-dark-96.png', 96, '#ffffff'],
  ['public/brand/no-bg-gt-globe-logo-dark-256.png', 256, '#ffffff'],
  ['public/brand/no-bg-gt-logo-light.png', 1198, '#070707'],
  ['public/brand/no-bg-gt-logo-dark.png', 1198, '#ffffff'],
  ['public/brand/no-bg-gt-logo-light-96.png', 96, '#070707'],
  ['public/brand/no-bg-gt-logo-dark-96.png', 96, '#ffffff'],
  ['public/brand/no-bg-gt-logo-dark-256.png', 256, '#ffffff'],
  ['public/brand/gt-logo-light.png', 1563, '#070707', '#ffffff'],
  ['public/static/avatars/logo.png', 96, '#070707', '#ffffff'],
];
const browser = await chromium.launch({ executablePath: chromePath() });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [rel, px, fill, ground] of PNGS) {
    await page.setViewportSize({ width: px, height: px });
    await page.setContent(
      `<style>html,body{margin:0;background:${ground ?? 'transparent'}}svg{display:block}</style>${svg(LOGO.square, path(fill), px)}`
    );
    await page.screenshot({ path: join(ROOT, rel), omitBackground: !ground, clip: { x: 0, y: 0, width: px, height: px } });
    console.log(`logo: ${rel}`);
  }
  /* the .ico: one PNG entry per size, each the white logo on the 256 square over the ink ground */
  const ICO_SIZES = [16, 32, 48];
  const entries = [];
  for (const px of ICO_SIZES) {
    await page.setViewportSize({ width: px, height: px });
    await page.setContent(`<style>html,body{margin:0;background:#070707}svg{display:block}</style>${svg(LOGO.square, path('#ffffff'), px)}`);
    entries.push(await page.screenshot({ clip: { x: 0, y: 0, width: px, height: px } }));
  }
  const header = Buffer.alloc(6 + 16 * entries.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = header.length;
  entries.forEach((png, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(ICO_SIZES[i], at);
    header.writeUInt8(ICO_SIZES[i], at + 1);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(png.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });
  writeFileSync(join(ROOT, 'public/brand/gt-globe-logo.ico'), Buffer.concat([header, ...entries]));
  console.log('logo: public/brand/gt-globe-logo.ico');
} finally {
  await browser.close();
}

/* the deck's symbol: the same drawing on the drawn box */
const HEAD = join(ROOT, 'deck/parts/head.html');
const head = readFileSync(HEAD, 'utf8');
const SYMBOL = /<symbol id="gt-mark" viewBox="[^"]*"><path[^>]*\/><\/symbol>/;
if (!SYMBOL.test(head)) {
  console.error('logo: deck/parts/head.html has no #gt-mark symbol to write');
  process.exit(1);
}
writeFileSync(HEAD, head.replace(SYMBOL, `<symbol id="gt-mark" viewBox="${LOGO.viewBox}"><path fill-rule="${LOGO.fillRule}" d="${LOGO.d}"/></symbol>`));
console.log('logo: deck/parts/head.html #gt-mark');

/* the pictures' record, which pnpm lint:logo holds them to */
recordGenerated(ROOT, ['public/brand/gt-globe-logo.ico', ...PNGS.map(([rel]) => rel)], sha256(LOGO.d));
console.log('logo: scripts/lint/logo.json (the pictures\' sha256)');
