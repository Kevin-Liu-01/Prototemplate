// Renders the plain globe at several tilts and times into one review sheet.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
const MOTION = new URL('../..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => { const p = join(MOTION, decodeURIComponent(req.url.split('?')[0])); if (!existsSync(p)) { res.statusCode = 404; return res.end(); } res.setHeader('content-type', TYPES[extname(p)] || 'application/octet-stream'); res.end(readFileSync(p)); }).listen(8796);
const pw = await import('playwright-core');
const chromium = (pw.default ?? pw).chromium;
const browser = await chromium.launch({ executablePath: (process.env.CHROME_PATH || (pw.default ?? pw).chromium.executablePath()) });
const page = await browser.newPage({ viewport: { width: 2048, height: 2048 } });
const shots = [];
for (const q of process.argv.slice(3)) {
  await page.goto(`http://127.0.0.1:8796/stills/partnership-globe/index.html?${q}`);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 120000 });
  shots.push(await page.evaluate(() => document.getElementById('c').toDataURL('image/png')));
}
await page.setViewportSize({ width: 1600, height: 400 * Math.ceil(shots.length / 4) });
await page.setContent(`<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(4,400px)">${shots.map((s, i) => `<div style="position:relative"><img src="${s}" width="400" height="400"><span style="position:absolute;left:6px;top:4px;color:#fff;font:12px sans-serif">${process.argv[3 + i]}</span></div>`).join('')}</body>`);
await page.screenshot({ path: process.argv[2] });
await browser.close(); server.close();
