// Pre-processes marks into gem smoke shape textures (kit/gem-shapes/<name>.png).
// Serves the kit over a local static server so the page can import the ES
// module build of Paper Shaders, then calls Paper's toProcessedGemSmoke.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
const KIT = new URL('..', import.meta.url).pathname;
const pw = await import('playwright-core');
const chromium = (pw.default ?? pw).chromium;
const exe = (process.env.CHROME_PATH || (pw.default ?? pw).chromium.executablePath());
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  const p = join(KIT, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p)) { res.statusCode = 404; return res.end(); }
  res.setHeader('content-type', TYPES[extname(p)] || 'application/octet-stream');
  res.end(readFileSync(p));
}).listen(8794);
const SHAPES = [
  ['gt-bar-monogram', 'marks/bar-monogram.svg', 0.12],
  ['gt-mark', 'brand/gt-mark.svg', 0.16],
  ['fumadocs-moon', 'logos/fumadocs.png', 0.14],
];
const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8794/gem-shapes/make.html');
await page.waitForFunction(() => window.__ready === true);
for (const [name, src, pad] of SHAPES) {
  const b64 = await page.evaluate(([s, p]) => window.processShape('../' + s, p), [src, pad]);
  writeFileSync(join(KIT, 'gem-shapes', name + '.png'), Buffer.from(b64, 'base64'));
  console.log('wrote', name + '.png');
}
await browser.close();
server.close();
