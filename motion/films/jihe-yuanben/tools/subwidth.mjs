// Measures how many rows of the subtitle bar each line takes: every subtitle
// of tools/timeline.py (its SUB table, passed as JSON on stdin) is set in the
// bar's own type (lib/page.css, fonts/fonts.css) in a 1480 px line, and the
// rows are its height over the 44 px row.
//   python3 tools/timeline.py --subs | node tools/subwidth.mjs
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, realpathSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const subs = JSON.parse(readFileSync(0, 'utf8'));
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/measure.html') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.end('<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="fonts/fonts.css"><link rel="stylesheet" href="lib/page.css">' +
      '<style>.jy-sub{position:absolute;top:0;height:auto;display:block} .sub-line{display:block;width:1480px;line-height:44px;text-wrap:balance}</style></head><body><div class="jy-sub"></div></body></html>');
  }
  const p = join(ROOT, url);
  if (!existsSync(p) || statSync(p).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.end(readFileSync(realpathSync(p)));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const pw = await import('playwright-core');
const browser = await (pw.default ?? pw).chromium.launch({ executablePath: (process.env.CHROME_PATH || (pw.default ?? pw).chromium.executablePath()) });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`http://127.0.0.1:${server.address().port}/measure.html`);
const out = await page.evaluate(async (subs) => {
  await document.fonts.ready;
  const bar = document.querySelector('.jy-sub');
  const r = {};
  for (const [id, html] of Object.entries(subs)) {
    const el = document.createElement('span');
    el.className = 'sub-line';
    el.innerHTML = html;
    bar.appendChild(el);
    await document.fonts.load('500 37px ' + getComputedStyle(el).fontFamily);
    const one = document.createElement('span');
    one.innerHTML = html;
    one.style.whiteSpace = 'nowrap';
    one.style.position = 'absolute';
    bar.appendChild(one);
    r[id] = { rows: Math.round(el.getBoundingClientRect().height / 44), width: Math.round(one.getBoundingClientRect().width) };
    el.remove();
    one.remove();
  }
  return r;
}, subs);
console.log(JSON.stringify(out));
await browser.close();
server.close();
