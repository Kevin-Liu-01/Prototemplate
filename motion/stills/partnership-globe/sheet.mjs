// Builds two sheets from the glyph globes that render.mjs wrote. Labels are
// set in the kit's Inter.
//   out/stills/glyph-globes-sheet.png          the four on-ground stills in a
//     2 x 2 grid (columns plain and carved, rows dark and light), and beside
//     each carved still its transparent twin on a checkerboard of the ground
//     it is for: the dark twins for dark grounds, the light twins for light.
//   out/stills/options/light-choice-sheet.png  the chosen light globe beside
//     the two light options (render.mjs --options), plain and carved, at
//     420 px and as 128 px thumbnails, with the dark globe for reference.
// Run render.mjs (and render.mjs --options for the second sheet) first.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';

const MOTION = new URL('../..', import.meta.url).pathname;
const OUT = join(MOTION, 'out/stills');
const TYPES = { '.html': 'text/html', '.png': 'image/png', '.woff2': 'font/woff2' };
const checker = (a, b) => `background-color:${a};background-image:conic-gradient(${b} 25%, ${a} 0 50%, ${b} 0 75%, ${a} 0);background-size:24px 24px`;
const ground = (g) => (g === 'checker-dark' ? checker('#070707', '#181818') : g === 'checker-light' ? checker('#ffffff', '#ececec') : `background:${g}`);
const page = (title, sub, cols, size, cells, thumbs = []) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url('/kit/fonts/InterVariable.woff2') format('woff2'); font-weight: 100 900; }
html, body { margin: 0; background: #8a8f98; }
body { font-family: Inter, sans-serif; color: #070707; padding: 40px; width: fit-content; }
h1 { font-weight: 500; font-size: 30px; letter-spacing: -0.01em; margin: 0 0 6px; }
p.sub { font-weight: 400; font-size: 18px; margin: 0 0 28px; max-width: ${cols * size + (cols - 1) * 28}px; }
.grid { display: grid; grid-template-columns: repeat(${cols}, ${size}px); gap: 36px 28px; }
.cell .lab { font-weight: 500; font-size: 20px; margin: 0 0 4px; }
.cell .file { font-weight: 400; font-size: 15px; margin: 0 0 10px; opacity: 0.8; }
.cell .img, .cell img { display: block; width: ${size}px; height: ${size}px; }
.thumbs { display: grid; grid-template-columns: repeat(${cols}, ${size}px); gap: 0 28px; margin-top: 36px; }
.thumbs .row { display: flex; gap: 16px; }
.thumbs img { display: block; width: 128px; height: 128px; }
.thumbs .lab { font-weight: 400; font-size: 15px; margin: 0 0 8px; }
</style></head><body>
<h1>${title}</h1>
<p class="sub">${sub}</p>
<div class="grid">${cells.map((c) => (c ? `<div class="cell"><div class="lab">${c[0]}</div><div class="file">${c[1]}</div><div class="img" style="${ground(c[2])}"><img src="/out/stills/${c[1]}"></div></div>` : '<div></div>')).join('')}</div>
${thumbs.length ? `<div class="thumbs">${thumbs.map(([lab, files, g]) => `<div><div class="lab">${lab}</div><div class="row">${files.map((f) => `<img style="${ground(g)}" src="/out/stills/${f}">`).join('')}</div></div>`).join('')}</div>` : ''}
</body></html>`;

const S = 600;
const main = page(
  'Glyph globes',
  '2048 x 2048 each. Twins carry the same art on an alpha ground: the dark twins are for dark grounds and the light twins for light grounds. Each twin is shown on a checkerboard of its ground.',
  3,
  S,
  [
    ['Dark', 'gt-globe-glyphs-dark.png', '#070707'],
    ['Carved, dark', 'gt-globe-glyphs-gt-dark.png', '#070707'],
    ['Carved, dark, twin for dark grounds', 'gt-globe-glyphs-gt-dark-transparent.png', 'checker-dark'],
    ['Light', 'gt-globe-glyphs-light.png', '#ffffff'],
    ['Carved, light', 'gt-globe-glyphs-gt-light.png', '#ffffff'],
    ['Carved, light, twin for light grounds', 'gt-globe-glyphs-gt-light-transparent.png', 'checker-light'],
  ],
);
const L = 420;
const choice = page(
  'Light globe: the chosen treatment and two options',
  'The chosen light globe runs the halftone backwards, so ink carries the shadow. The field option keeps the dark globe\'s own halftone, glyphs growing with the light as the sign-in plate\'s dots do in both themes, in the same inks as the chosen one. The sign-in option is the plate\'s literal remap, with #86a8ff on paper. Options are reference stills in out/stills/options/, without twins.',
  4,
  L,
  [
    ['Dark, approved', 'gt-globe-glyphs-dark.png', '#070707'],
    ['Light, chosen', 'gt-globe-glyphs-light.png', '#ffffff'],
    ['Light, field option', 'options/gt-globe-glyphs-light-field.png', '#ffffff'],
    ['Light, sign-in option', 'options/gt-globe-glyphs-light-signin.png', '#ffffff'],
    ['Carved, dark', 'gt-globe-glyphs-gt-dark.png', '#070707'],
    ['Carved, light, chosen', 'gt-globe-glyphs-gt-light.png', '#ffffff'],
    ['Carved, light, field option', 'options/gt-globe-glyphs-gt-light-field.png', '#ffffff'],
    null,
  ],
  [
    ['At 128 px, plain and carved', ['gt-globe-glyphs-dark.png', 'gt-globe-glyphs-gt-dark.png'], '#070707'],
    ['At 128 px, plain and carved', ['gt-globe-glyphs-light.png', 'gt-globe-glyphs-gt-light.png'], '#ffffff'],
    ['At 128 px, plain and carved', ['options/gt-globe-glyphs-light-field.png', 'options/gt-globe-glyphs-gt-light-field.png'], '#ffffff'],
    ['At 128 px, plain', ['options/gt-globe-glyphs-light-signin.png'], '#ffffff'],
  ],
);

const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/sheet') { res.setHeader('content-type', 'text/html'); return res.end(main); }
  if (url === '/choice') { res.setHeader('content-type', 'text/html'); return res.end(choice); }
  const p = join(MOTION, url);
  if (!existsSync(p)) { res.statusCode = 404; return res.end(); }
  res.setHeader('content-type', TYPES[extname(p)] || 'application/octet-stream');
  res.end(readFileSync(p));
}).listen(8796);

const pw = await import('playwright-core');
const chromium = (pw.default ?? pw).chromium;
const exe = (process.env.CHROME_PATH || (pw.default ?? pw).chromium.executablePath());
const browser = await chromium.launch({ executablePath: exe });
for (const [path, cols, size, file] of [
  ['/sheet', 3, S, 'glyph-globes-sheet.png'],
  ['/choice', 4, L, 'options/light-choice-sheet.png'],
]) {
  if (path === '/choice' && !existsSync(join(OUT, 'options/gt-globe-glyphs-light-field.png'))) { console.log('skipped', file, '(run render.mjs --options first)'); continue; }
  const p = await browser.newPage({ viewport: { width: cols * size + (cols - 1) * 28 + 80, height: 800 } });
  await p.goto('http://127.0.0.1:8796' + path);
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode())); });
  await p.screenshot({ path: join(OUT, file), fullPage: true });
  console.log('wrote', file);
  await p.close();
}
await browser.close();
server.close();
