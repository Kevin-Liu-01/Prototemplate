// Renders the partnership globes to motion/out/stills/ as 2048 x 2048 PNGs.
// Serves motion/ over a local static server so the page can import its modules
// and fetch the kit's mark, then saves each canvas through toDataURL. Every
// still comes with a transparent twin (-transparent, the same art on an alpha
// ground): a dark twin for a partner's dark ground, a light twin for a light one.
//   gt-globe-dithered            the dithered globe
//   gt-globe-dithered-mark       the dithered globe with the GT mark in the middle
//   gt-globe-glyphs              the glyph globe (the approved dark globe)
//   gt-globe-glyphs-dark         the same, by its mode name (mode=dark)
//   gt-globe-glyphs-light        the glyph globe on paper (mode=light)
//   gt-globe-glyphs-gt-dark      the glyph globe with GT carved out of its middle, dark
//   gt-globe-glyphs-gt-light     the same, light
// The approved stills (the two dithered globes and the dark glyph globe,
// under both its names) are pinned by sha256: a render whose bytes differ
// from the pin is not written, and the run exits 1 naming it. REPIN=1 writes
// it anyway and prints the new hash for the PINNED table.
// node render.mjs [query]     appends an optional query (without the leading &) to every page.
// node render.mjs --options   writes the comparison stills to out/stills/options/ instead
//   (reference only, no twins): the light globe with the dark's halftone kept
//   (the sign-in plate's rule, glyphs growing with the light) in the brand's
//   inks, plain and carved, and the sign-in plate's literal remap.
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const MOTION = new URL('../..', import.meta.url).pathname;
const args = process.argv.slice(2);
const OPTIONS = args.includes('--options');
const OUT = join(MOTION, OPTIONS ? 'out/stills/options' : 'out/stills');
mkdirSync(OUT, { recursive: true });
const PINNED = {
  'gt-globe-dithered': '76e3728ff4f1f4f01c60b3480fb91ab483057ecf25c4524c6b4f42d3be32629c',
  'gt-globe-dithered-transparent': '3010604efb32b8058088a4d109cec0846fdb3c5b1f00556c887fce1c024a210b',
  'gt-globe-dithered-mark': '711e683663985e5fcf4afb70d8a78317a26cac929d88376827c7b8ce0f8d5f9e',
  'gt-globe-dithered-mark-transparent': '6b7e77b2cab56ed3e1ef21b3c4bb0b6b8015a9bf3f353735f4bf1faab23b2e1a',
  'gt-globe-glyphs': 'c25f5d9ce84dd085a2b25ecf2bc8a00c101c9896b9260e5361958265bed99385',
  'gt-globe-glyphs-transparent': 'b5eeeb535734bda4b7550ef9283e471ec1d6b5ba43056415813dd2380acf8933',
  'gt-globe-glyphs-dark': 'c25f5d9ce84dd085a2b25ecf2bc8a00c101c9896b9260e5361958265bed99385',
  'gt-globe-glyphs-dark-transparent': 'b5eeeb535734bda4b7550ef9283e471ec1d6b5ba43056415813dd2380acf8933',
};
const REPIN = process.env.REPIN === '1';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer((req, res) => {
  const p = join(MOTION, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p)) { res.statusCode = 404; return res.end(); }
  res.setHeader('content-type', TYPES[extname(p)] || 'application/octet-stream');
  res.end(readFileSync(p));
}).listen(8795);

const pw = await import('playwright-core');
const chromium = (pw.default ?? pw).chromium;
const exe = (process.env.CHROME_PATH || (pw.default ?? pw).chromium.executablePath());
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 2048, height: 2048 } });
const query = args.find((a) => !a.startsWith('--'));
const extra = query ? '&' + query : '';
const RUNS = [];
// The dark globe's sizes on paper: its halftone kept and the rim left as light.
const FIELD = '&mode=light&l.law=light&l.rim=-1&l.land=0.36,0.92&l.ocean=0.2,0.46';
if (OPTIONS) RUNS.push(
  ['glyphs', 'gt-globe-glyphs-light-field', FIELD],
  ['glyphs', 'gt-globe-glyphs-gt-light-field', FIELD + '&carve=gt'],
  ['glyphs', 'gt-globe-glyphs-light-signin', FIELD + '&l.hi=%232f5ce0&l.lo=%232f5ce0&l.sea=%2386a8ff&l.sealo=%2386a8ff'],
);
else for (const [v, name, q] of [
  ['globe', 'gt-globe-dithered', ''],
  ['gt', 'gt-globe-dithered-mark', ''],
  ['glyphs', 'gt-globe-glyphs', ''],
  ['glyphs', 'gt-globe-glyphs-dark', '&mode=dark'],
  ['glyphs', 'gt-globe-glyphs-light', '&mode=light'],
  ['glyphs', 'gt-globe-glyphs-gt-dark', '&carve=gt&mode=dark'],
  ['glyphs', 'gt-globe-glyphs-gt-light', '&carve=gt&mode=light'],
]) {
  RUNS.push([v, name, q]);
  RUNS.push([v, name + '-transparent', q + '&bg=none']);
}
const refused = [];
for (const [v, name, q] of RUNS) {
  await page.goto(`http://127.0.0.1:8795/stills/partnership-globe/index.html?v=${v}${q}${extra}`);
  // The carved globes fit about 600k glyph rasters, so they take tens of seconds.
  await page.waitForFunction(() => window.__done === true || !!window.__err, null, { timeout: 900000 });
  const err = await page.evaluate(() => window.__err || null);
  if (err) throw new Error(`${name}: ${err}`);
  const b64 = await page.evaluate(() => document.getElementById('c').toDataURL('image/png').split(',')[1]);
  const png = Buffer.from(b64, 'base64');
  const sha = createHash('sha256').update(png).digest('hex');
  if (!OPTIONS && PINNED[name] && sha !== PINNED[name] && !REPIN) {
    refused.push(name);
    console.log('REFUSED', name + '.png', 'sha256', sha, 'is not the pinned', PINNED[name], '(left untouched)');
    continue;
  }
  writeFileSync(join(OUT, name + '.png'), png);
  const report = await page.evaluate(() => window.__report?.summary ?? null);
  console.log('wrote', name + '.png', REPIN && PINNED[name] ? sha : sha.slice(0, 8), report ? JSON.stringify(report) : '');
}
await browser.close();
server.close();
if (refused.length) {
  console.error(`${refused.length} pinned still(s) came out different and were not written: ${refused.join(', ')}. REPIN=1 overwrites them.`);
  process.exit(1);
}
