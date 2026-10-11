// Writes the picture's sound cues (window.JYFilm.events: every brush mark and
// paper move, with its film time) to audio/events.json for tools/mix.py.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = new URL('..', import.meta.url).pathname;
const server = createServer((req, res) => {
  const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p) || statSync(p).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.end(readFileSync(realpathSync(p)));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const pw = await import('playwright-core');
const browser = await (pw.default ?? pw).chromium.launch({ executablePath: (process.env.CHROME_PATH || (pw.default ?? pw).chromium.executablePath()) });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
await page.waitForFunction(() => !!(window.JYFilm && window.JYFilm.events), null, { polling: 200, timeout: 60000 });
const ev = await page.evaluate(() => window.JYFilm.events);
writeFileSync(join(ROOT, 'audio/events.json'), JSON.stringify(ev, null, 1));
console.log('events', ev.length, Object.entries(ev.reduce((a, e) => ((a[e.kind + (e.mark ? ':' + e.mark : '')] = (a[e.kind + (e.mark ? ':' + e.mark : '')] || 0) + 1), a), {})));
await browser.close();
server.close();
