// Mobile survey: per-section computed type/padding metrics + section screenshots at 390px.
import { chromium } from 'playwright-core';

const S = '/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/6fd2c510-1ace-47e6-b8b7-e35166a7416a/scratchpad';
const EXE = '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({ executablePath: EXE });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(5000);
// settle lazy content: scroll through the page once, then back
await page.evaluate(async () => {
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 700) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  const sections = [];
  const main = document.querySelector('main.tc-rail');
  const kids = [...main.children].filter(
    (el) => el.tagName !== 'SCRIPT' && el.getBoundingClientRect === undefined ? false : true
  );
  const roster = [];
  for (const el of main.children) {
    const r = el.getBoundingClientRect();
    if (r.height < 40) continue;
    roster.push(el);
  }
  const footer = document.querySelector('.v0-foot-rail') ?? document.querySelector('footer');
  if (footer) roster.push(footer);
  const nav = document.querySelector('header') ?? document.querySelector('nav');
  if (nav) roster.unshift(nav);

  const measure = (el, name) => {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const scrollY = window.scrollY;
    // font-size histogram over visible text-bearing elements
    const hist = {};
    const heads = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim();
      if (!t) continue;
      const p = n.parentElement;
      if (!p || seen.has(p)) continue;
      seen.add(p);
      const pcs = getComputedStyle(p);
      if (pcs.display === 'none' || pcs.visibility === 'hidden') continue;
      const pr = p.getBoundingClientRect();
      if (pr.width === 0 || pr.height === 0) continue;
      const fs = Math.round(parseFloat(pcs.fontSize) * 10) / 10;
      const lh = pcs.lineHeight;
      const key = `${fs}px/${lh === 'normal' ? 'normal' : Math.round(parseFloat(lh) * 10) / 10}`;
      if (!hist[key]) hist[key] = { count: 0, ex: [] };
      hist[key].count++;
      if (hist[key].ex.length < 3) hist[key].ex.push(t.slice(0, 38));
      if (/^H[1-6]$/.test(p.tagName)) {
        heads.push({ tag: p.tagName, fs, lh: key.split('/')[1], txt: t.slice(0, 44) });
      }
    }
    return {
      name,
      cls: (el.className && String(el.className).split(' ').slice(0, 3).join(' ')) || el.tagName,
      top: Math.round(rect.top + scrollY),
      height: Math.round(rect.height),
      padTop: cs.paddingTop,
      padBottom: cs.paddingBottom,
      marTop: cs.marginTop,
      marBottom: cs.marginBottom,
      heads,
      hist,
    };
  };
  let i = 0;
  for (const el of roster) {
    sections.push(measure(el, `s${String(i++).padStart(2, '0')}`));
  }
  return { pageH: document.documentElement.scrollHeight, sections };
});

console.log(JSON.stringify(data, null, 1));

// per-section screenshots (clip from full render)
for (const s of data.sections) {
  const clipH = Math.min(s.height, 6000);
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, s.top - 8));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${S}/maud/${s.name}_${(s.cls || 'x').replace(/[^a-z0-9-]/gi, '_').slice(0, 24)}.png` });
}
// long sections: extra screenfuls
for (const s of data.sections) {
  if (s.height > 1200) {
    for (let off = 800, k = 1; off < Math.min(s.height, 8000); off += 800, k++) {
      await page.evaluate((y) => window.scrollTo(0, y), s.top + off);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${S}/maud/${s.name}_p${k}.png` });
    }
  }
}
await browser.close();
console.log('DONE');
