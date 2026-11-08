// Writes the logo's files from its one drawing, LOGO in src/lib/logo.ts:
//
//   public/brand/gt-globe-logo.svg              currentColor on the drawn box, for
//                                               masks (the GT word) and inline use
//   public/brand/gt-globe-logo-light.svg        #070707 ink on the 256 square
//   public/brand/gt-globe-logo-dark.svg         #ffffff on the 256 square
//   public/brand/gt-globe-logo-icon.svg         the tab icon on the drawn box: ink,
//                                               and white under a dark color scheme
//   public/brand/no-bg-gt-globe-logo-light.png  and -dark.png at 1198 px, -light-96,
//                                               -dark-96 and -dark-256: the sizes of
//                                               the monogram masters they sit beside
//   deck/parts/head.html                        the #gt-mark symbol's viewBox and path
//
// The PNGs are drawn on a transparent ground by the Chrome for Testing build
// playwright-core installs (CHROME_PATH overrides it). The monogram masters
// (gt-logo-*.svg, no-bg-gt-logo-*.png) are left at their URLs, since other
// sites link to them. Run pnpm build:deck after it, so the built deck takes
// the symbol. Usage: pnpm build:logo
/* oxlint-disable no-console -- a generator reporting what it wrote. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';
import { chromePath } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const { LOGO } = await import(new URL('../../src/lib/logo.ts', import.meta.url).href);

const BRAND = join(ROOT, 'public/brand');
const path = (fill) => `<path fill="${fill}" fill-rule="${LOGO.fillRule}" d="${LOGO.d}"/>`;
const svg = (viewBox, body, size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size ? ` width="${size}" height="${size}"` : ''} role="img" aria-label="${LOGO.name}">${body}</svg>\n`;

const FILES = {
  'gt-globe-logo.svg': svg(LOGO.viewBox, path('currentColor')),
  'gt-globe-logo-light.svg': svg(LOGO.square, path('#070707'), 256),
  'gt-globe-logo-dark.svg': svg(LOGO.square, path('#ffffff'), 256),
  'gt-globe-logo-icon.svg': svg(
    LOGO.viewBox,
    `<style>path{fill:#070707}@media (prefers-color-scheme:dark){path{fill:#ffffff}}</style><path fill-rule="${LOGO.fillRule}" d="${LOGO.d}"/>`
  ),
};
for (const [name, text] of Object.entries(FILES)) {
  writeFileSync(join(BRAND, name), text);
  console.log(`logo: public/brand/${name}`);
}

/* the rasters: [file, px, fill] */
const PNGS = [
  ['no-bg-gt-globe-logo-light.png', 1198, '#070707'],
  ['no-bg-gt-globe-logo-dark.png', 1198, '#ffffff'],
  ['no-bg-gt-globe-logo-light-96.png', 96, '#070707'],
  ['no-bg-gt-globe-logo-dark-96.png', 96, '#ffffff'],
  ['no-bg-gt-globe-logo-dark-256.png', 256, '#ffffff'],
];
const browser = await chromium.launch({ executablePath: chromePath() });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [name, px, fill] of PNGS) {
    await page.setViewportSize({ width: px, height: px });
    await page.setContent(
      `<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg(LOGO.square, path(fill), px)}`
    );
    await page.screenshot({ path: join(BRAND, name), omitBackground: true, clip: { x: 0, y: 0, width: px, height: px } });
    console.log(`logo: public/brand/${name}`);
  }
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
