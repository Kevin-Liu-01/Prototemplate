import { chromium } from 'playwright-core';
const EXE = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const S = '/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/4a0c8a33-b34b-43b6-b98d-dcbcef60f24f/scratchpad';
const b = await chromium.launch({ executablePath: EXE });
for (const W of [1437, 1301]) {
  const ctx = await b.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
  const p = await ctx.newPage();
  await p.goto('http://localhost:3006/d/singularity-dossier', { waitUntil: 'networkidle' });
  await p.waitForSelector('.v0-cust', { timeout: 30000 });
  await p.waitForTimeout(1200);
  const g = await p.evaluate(() => {
    const cust = document.querySelector('.v0-cust').getBoundingClientRect();
    const rail = document.querySelector('.tc-rail').getBoundingClientRect();
    return { top: cust.top + scrollY, L: rail.left, R: rail.right };
  });
  console.log('W=' + W, 'railL=' + g.L, 'railR=' + g.R, 'custTop=' + g.top);
  await p.evaluate((yy) => window.scrollTo(0, yy - 400), g.top);
  await p.waitForTimeout(500);
  const vy = g.top - (await p.evaluate(() => window.scrollY));
  for (const [tag, x] of [['L', g.L], ['R', g.R]]) {
    const buf = await p.screenshot({ clip: { x: x - 8, y: vy - 8, width: 16, height: 16 } });
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
        for (let x2 = 0; x2 < img.width; x2++) {
          const i = (y * img.width + x2) * 4;
          const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          row += lum > 140 ? '#' : lum > 70 ? '+' : lum > 30 ? '.' : ' ';
        }
        lines.push(row);
      }
      return lines.join('\n');
    }, buf.toString('base64'));
    console.log('--- ' + tag + ' rail, crop origin x=' + (x - 8));
    console.log(map);
  }
  await ctx.close();
}
await b.close();
