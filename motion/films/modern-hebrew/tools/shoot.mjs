// Shoots pages of this film to PNG in Chrome for Testing (playwright-core).
// Serves the film folder (kit is a symlink in it) on a free local port, opens
// each page, waits for window.__done (or __err), screenshots 1920 x 1080.
//   node tools/shoot.mjs <page.html?query> <out.png> [<page> <out>] ...
// Paths of pages are relative to the film root; out paths are as given.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, realpathSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.wav': 'audio/wav' };
const server = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  // the stills page lives in tools/ but is served from the film root, so its paths match index.html
  const p = u === '/__still.html' ? join(ROOT, 'tools/still.html') : join(ROOT, u);
  if (!existsSync(p) || statSync(realpathSync(p)).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader('content-type', TYPES[extname(p)] || 'application/octet-stream');
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const pw = await import('playwright-core');
const chromium = (pw.default ?? pw).chromium;
const exe = (process.env.CHROME_PATH || (pw.default ?? pw).chromium.executablePath());
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
let args = process.argv.slice(2);
// --times <outdir> 1.0,2.5,...  ->  __still.html?t=1.0 to <outdir>/t1.0.png ...
if (args[0] === '--times') {
  const dir = args[1];
  args = args[2].split(',').flatMap((t) => [`__still.html?t=${t}`, `${dir}/t${t}.png`]);
}
for (let i = 0; i < args.length; i += 2) {
  const errors = [];
  const onErr = (e) => errors.push(String(e));
  const onCon = (m) => { if (m.type() === 'error') errors.push(m.text()); };
  page.on('pageerror', onErr); page.on('console', onCon);
  await page.goto(`http://127.0.0.1:${port}/${args[i]}`);
  await page.waitForFunction(() => window.__done === true || window.__err, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__err || null);
  if (err) errors.push(err);
  await page.screenshot({ path: resolve(args[i + 1]) });
  page.off('pageerror', onErr); page.off('console', onCon);
  console.log((errors.length ? 'ERR ' : 'ok  ') + args[i + 1] + (errors.length ? '  ' + errors.join(' | ') : ''));
}
await browser.close();
server.close();
