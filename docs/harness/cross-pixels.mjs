import { chromium } from 'playwright-core';
const EXE = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const p = await ctx.newPage();
await p.goto('http://localhost:3006/d/singularity-dossier', { waitUntil: 'networkidle' });
await p.waitForSelector('.v0-cust', { timeout: 30000 });
await p.waitForTimeout(1500);
const g = await p.evaluate(() => {
  const cust = document.querySelector('.v0-cust').getBoundingClientRect();
  const rail = document.querySelector('.tc-rail').getBoundingClientRect();
  return { custTop: cust.top + scrollY, railL: rail.left };
});
await p.evaluate((yy) => window.scrollTo(0, yy - 400), g.custTop);
await p.waitForTimeout(800);
const vy = g.custTop - (await p.evaluate(() => window.scrollY));
const buf = await p.screenshot({ clip: { x: g.railL - 8, y: vy - 8, width: 16, height: 16 } });
// decode in-browser
const map = await p.evaluate(async (b64) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g2 = c.getContext('2d');
  g2.drawImage(img, 0, 0);
  const d = g2.getImageData(0, 0, img.width, img.height).data;
  const lines = [];
  for (let y = 0; y < img.height; y++) {
    let row = '';
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      row += lum > 140 ? '#' : lum > 70 ? '+' : lum > 30 ? '.' : ' ';
    }
    lines.push(row);
  }
  return lines.join('\n');
}, buf.toString('base64'));
console.log('origin CSS(', g.railL - 8, vy - 8, ') dpr2 — each char = 1 device px; rail CSS x=' + g.railL + ' → col ' + ((8) * 2) + '..' + ((8) * 2 + 1));
console.log(map);
await b.close();
