// Shoots the composition at given film times for study (not the renderer):
// serves this folder, opens index.html in Chrome for Testing, waits for every
// scan and face, seeks the registered timeline (callbacks on, as the renderer
// does) and saves a 1920 x 1080 PNG per time.
//   node tools/shoot.mjs <outdir> 4.5 12 30.2 ...
//   node tools/shoot.mjs <outdir> --every 1         (one frame a second, over the film's length)
//   node tools/shoot.mjs <outdir> --fresh 33.4 ...   (a fresh page per time)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, realpathSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.otf': 'font/otf', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg',
};
const server = createServer((req, res) => {
  const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p) || statSync(p).isDirectory()) {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader('content-type', TYPES[extname(p)] || 'application/octet-stream');
  res.end(readFileSync(realpathSync(p)));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const pw = await import('playwright-core');
const chromium = (pw.default ?? pw).chromium;
const browser = await chromium.launch({
  executablePath: (process.env.CHROME_PATH || (pw.default ?? pw).chromium.executablePath()),
  args: (process.env.JY_GPU ? ['--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist'] : []),
});
const args = process.argv.slice(2);
const out = args.shift();
mkdirSync(out, { recursive: true });
let fresh = false;
let times = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fresh') fresh = true;
  else if (args[i] === '--every') {
    const step = parseFloat(args[++i]);
    const DUR = JSON.parse(readFileSync(join(ROOT, 'audio/cues.json'), 'utf8')).duration; // v2: the film's length
    for (let t = 0; t < DUR - 1e-9; t += step) times.push(Math.round(t * 1000) / 1000);
  } else times.push(parseFloat(args[i]));
}
async function open() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('   pageerror', e.message));
  page.on('console', (m) => {
    if (!m.text().includes('404')) console.log('   console', m.type(), m.text());
  });
  page.on('requestfailed', (r) => console.log('   requestfailed', r.url()));
  page.on('response', (r) => { if (r.status() >= 400) console.log('   http', r.status(), r.url()); });
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  await page.waitForFunction(() => !!(window.__timelines && window.__timelines.main), null, { timeout: 120000, polling: 500 });
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; }))));
    await document.fonts.ready;
  });
  return page;
}
async function at(page, t) {
  await page.evaluate((tt) => {
    window.__timelines.main.seek(tt, false);
    window.JYFilm.render(tt);
  }, t);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const name = join(out, 't' + t.toFixed(2).padStart(6, '0') + '.png');
  await page.screenshot({ path: name });
  console.log('wrote', name);
}
if (fresh) {
  for (const t of times) {
    const page = await open();
    await at(page, t);
    await page.close();
  }
} else {
  const page = await open();
  for (const t of times) await at(page, t);
  await page.close();
}
await browser.close();
server.close();
