import { chromium } from 'playwright-core';
const EXE = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const SLUGS = ['singularity-dossier','singularity-orbit','singularity-signal','singularity-observatory','singularity-procession'];
const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
for (const slug of SLUGS) {
  const p = await ctx.newPage();
  await p.goto('http://localhost:3006/d/' + slug, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  const rows = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      for (const ps of ['::before', '::after']) {
        const cs = getComputedStyle(el, ps);
        if (cs.content === 'none') continue;
        const bg = cs.backgroundImage || '';
        const sz = cs.backgroundSize || '';
        if (bg.includes('linear-gradient') && sz.includes('1px 9px')) {
          const r = el.getBoundingClientRect();
          out.push({
            sel: el.tagName.toLowerCase() + '.' + [...el.classList].join('.'),
            ps, top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY),
            pos: cs.backgroundPosition,
          });
        }
      }
    }
    return out;
  });
  console.log('=== ' + slug + ' (' + rows.length + ' painters)');
  for (const r of rows) console.log(`  ${r.ps} y[${r.top}..${r.bottom}] ${r.sel}`);
  await p.close();
}
await b.close();
