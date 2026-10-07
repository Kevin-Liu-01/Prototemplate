#!/usr/bin/env node
// probe.mjs: measures what renders at one spot of a page, the way a fix is
// verified before it is reported as done (gt-verify sections 1 and 4).
//
// For one element (--sel) it prints the computed box model (margin, border,
// padding and content box per side), the layout and type values that move
// spacing, the space to its previous and next siblings with the margins and
// the parent gap that make it up, and a crop of the element plus 24px at the
// device scale. --frames takes the same reading several times, so the states
// an animation passes through are read as well as its rest. --point lists what
// paints at a viewport point (elementsFromPoint, top first) with the
// composite pixel there. --scan reads the pixels across a seam, one value per
// device pixel, groups them into segments of one grey and marks the segments
// that are lines. --a11y lists controls with
// no accessible name, icon-only controls with the name they announce, and
// text a reader cannot select.
//
// Usage, with the working directory in a checkout that has playwright-core
// (Prototemplate does; from an installed copy, run this folder's file the
// same way):
//   node skills/gt-verify/scripts/probe.mjs <url>
//     [--browser chromium|webkit] [--viewport 1440x900] [--dsf 2]
//     [--theme dark|light] [--storage key=value,key=value]
//     [--scroll-through] [--scroll-to <css>] [--scroll <y>] [--wait 800]
//     [--sel <css>] [--nth 0] [--frames 1] [--every 120]
//     [--point x,y]... [--scan x,y,down|right,len]...
//     [--a11y] [--out <dir>] [--timeout 120000] [--json] [--strict]
//
// Examples:
//   node skills/gt-verify/scripts/probe.mjs http://localhost:3005/brand --sel ".pt-sheet-head" --theme dark
//   node skills/gt-verify/scripts/probe.mjs http://localhost:3005/ --point 280,52 --scan 280,40,down,24 --dsf 4
//   node skills/gt-verify/scripts/probe.mjs http://localhost:3005/docs --viewport 390x844 --a11y --strict
//   node skills/gt-verify/scripts/probe.mjs http://localhost:3001/en-US --browser webkit --sel ".blog-card" --scroll-through
//
// Coordinates for --point and --scan are CSS pixels in the viewport after the
// scroll options ran. The theme is seeded the way GT pages read it:
// localStorage gt-theme (the Prototemplate shell and the deck) and theme
// (next-themes in gt-cloud), plus the prefers-color-scheme emulation. Widths
// under 768 load as a phone (isMobile and hasTouch). Crops and the viewport
// capture go to --out (default <tmpdir>/gt-verify/probe; pass a scratch
// folder). CHROME_PATH overrides the Chromium binary; WebKit comes from the
// ms-playwright cache.
//
// Exit codes: 0 after a reading; 1 with --strict when --a11y found a control
// with no name or unselectable text; 2 when the page could not be read.

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, platform, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);

function takeValue(name, fallback) {
  const at = argv.indexOf(`--${name}`);
  if (at === -1) return fallback;
  const value = argv[at + 1];
  argv.splice(at, 2);
  return value;
}

function takeAll(name) {
  const values = [];
  for (let at = argv.indexOf(`--${name}`); at !== -1; at = argv.indexOf(`--${name}`)) {
    values.push(argv[at + 1]);
    argv.splice(at, 2);
  }
  return values;
}

function takeFlag(name) {
  const at = argv.indexOf(`--${name}`);
  if (at === -1) return false;
  argv.splice(at, 1);
  return true;
}

const engine = takeValue('browser', 'chromium');
const [vw, vh] = takeValue('viewport', '1440x900').split('x').map(Number);
const dsf = Number(takeValue('dsf', '2')) || 2;
const theme = takeValue('theme', '');
const storage = takeValue('storage', '')
  .split(',')
  .filter((pair) => pair.includes('='))
  .map((pair) => [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]);
const scrollThrough = takeFlag('scroll-through');
const scrollToSel = takeValue('scroll-to', '');
const scrollY = takeValue('scroll', '');
const wait = Number(takeValue('wait', '800'));
const selector = takeValue('sel', '');
const nth = Number(takeValue('nth', '0')) || 0;
const frames = Math.max(1, Number(takeValue('frames', '1')) || 1);
const every = Number(takeValue('every', '120')) || 120;
const points = takeAll('point').map((p) => p.split(',').map(Number));
const scans = takeAll('scan').map((s) => {
  const [x, y, dir, len] = s.split(',');
  return { x: Number(x), y: Number(y), dir: dir === 'right' ? 'right' : 'down', len: Number(len) || 24 };
});
const a11y = takeFlag('a11y');
const outDir = resolve(takeValue('out', join(tmpdir(), 'gt-verify', 'probe')));
const timeout = Number(takeValue('timeout', '120000')) || 120000;
const asJson = takeFlag('json');
const strict = takeFlag('strict');
const url = argv.find((a) => !a.startsWith('--'));

if (!url || !vw || !vh || !['chromium', 'webkit'].includes(engine)) {
  console.error('Usage: probe.mjs <url> [--browser chromium|webkit] [--viewport 1440x900] [--dsf 2] [--theme dark|light] [--sel <css>] [--frames n --every ms] [--point x,y] [--scan x,y,down|right,len] [--a11y] [--out dir] [--json] [--strict]');
  process.exit(2);
}

function loadPlaywright() {
  const bases = [join(process.cwd(), 'package.json'), join(process.cwd(), 'scripts', 'package.json')];
  for (const base of bases) {
    try {
      return createRequire(base)('playwright-core');
    } catch {
      // try the next base
    }
  }
  console.error('probe: playwright-core is not installed in this checkout. Run the script from Prototemplate, or add playwright-core as a dev dependency.');
  process.exit(2);
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = platform() === 'darwin' ? join(homedir(), 'Library/Caches/ms-playwright') : join(homedir(), '.cache/ms-playwright');
  if (!existsSync(cache)) return undefined;
  const builds = readdirSync(cache)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  const app = 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  const tails = [`chrome-mac-arm64/${app}`, `chrome-mac-x64/${app}`, `chrome-mac/${app}`, 'chrome-linux64/chrome', 'chrome-linux/chrome'];
  for (const build of builds) {
    for (const tail of tails) {
      const path = join(cache, build, tail);
      if (existsSync(path)) return path;
    }
  }
  return undefined;
}

// The functions below run in the page. Each is kept free of outer references
// because Playwright serialises it.

function readBox({ selector, nth }) {
  const describe = (el) => {
    if (!el || !el.tagName) return String(el);
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls.map((c) => `.${c}`).join('')}`;
  };
  const px = (v) => Math.round(parseFloat(v) * 100) / 100 || 0;
  const sides = (cs, prop, suffix = '') => ['Top', 'Right', 'Bottom', 'Left'].map((s) => px(cs[`${prop}${s}${suffix}`]));
  const all = document.querySelectorAll(selector);
  const el = all[nth];
  if (!el) return { error: `no element matches ${selector} at index ${nth} (${all.length} match)` };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  let opacity = 1;
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
  const parent = el.parentElement;
  const pcs = parent ? getComputedStyle(parent) : null;
  const neighbour = (sib, before) => {
    if (!sib) return null;
    const sr = sib.getBoundingClientRect();
    const scs = getComputedStyle(sib);
    const vertical = before ? r.top - sr.bottom : sr.top - r.bottom;
    const horizontal = before ? r.left - sr.right : sr.left - r.right;
    return {
      element: describe(sib),
      vertical: Math.round(vertical * 100) / 100,
      horizontal: Math.round(horizontal * 100) / 100,
      margins: before ? { sibling: px(scs.marginBottom), self: px(cs.marginTop) } : { self: px(cs.marginBottom), sibling: px(scs.marginTop) },
    };
  };
  return {
    element: describe(el),
    matches: all.length,
    text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
    rect: { x: Math.round(r.x * 100) / 100, y: Math.round(r.y * 100) / 100, w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100 },
    page: { x: r.x + window.scrollX, y: r.y + window.scrollY },
    margin: sides(cs, 'margin'),
    border: sides(cs, 'border', 'Width'),
    borderColor: ['Top', 'Right', 'Bottom', 'Left'].map((s) => cs[`border${s}Color`]),
    padding: sides(cs, 'padding'),
    content: {
      w: Math.round((r.width - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.borderLeftWidth) - px(cs.borderRightWidth)) * 100) / 100,
      h: Math.round((r.height - px(cs.paddingTop) - px(cs.paddingBottom) - px(cs.borderTopWidth) - px(cs.borderBottomWidth)) * 100) / 100,
    },
    layout: {
      display: cs.display,
      position: cs.position,
      boxSizing: cs.boxSizing,
      gap: `${cs.rowGap} ${cs.columnGap}`,
      overflow: `${cs.overflowX} ${cs.overflowY}`,
      transform: cs.transform,
      zIndex: cs.zIndex,
    },
    type: {
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
    },
    paint: { color: cs.color, background: cs.backgroundColor, opacity: cs.opacity, effectiveOpacity: Math.round(opacity * 1000) / 1000, visibility: cs.visibility, userSelect: cs.userSelect || cs.webkitUserSelect },
    parent: parent ? { element: describe(parent), display: pcs.display, gap: `${pcs.rowGap} ${pcs.columnGap}`, padding: sides(pcs, 'padding'), alignItems: pcs.alignItems, justifyContent: pcs.justifyContent } : null,
    previous: neighbour(el.previousElementSibling, true),
    next: neighbour(el.nextElementSibling, false),
  };
}

function readPoint({ x, y }) {
  const describe = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls.map((c) => `.${c}`).join('')}`;
  };
  return document
    .elementsFromPoint(x, y)
    .slice(0, 8)
    .map((el) => {
      const cs = getComputedStyle(el);
      const borders = ['Top', 'Right', 'Bottom', 'Left']
        .map((s) => (parseFloat(cs[`border${s}Width`]) > 0 ? `${s[0].toLowerCase()} ${cs[`border${s}Width`]} ${cs[`border${s}Color`]}` : ''))
        .filter(Boolean)
        .join(', ');
      return { element: describe(el), background: cs.backgroundColor, opacity: cs.opacity, borders: borders || 'none', shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow, outline: cs.outlineStyle === 'none' ? '' : `${cs.outlineWidth} ${cs.outlineColor}` };
    });
}

function readA11y({ scope }) {
  const root = scope ? document.querySelector(scope) : document.body;
  if (!root) return { error: `no element matches ${scope}` };
  const describe = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls.map((c) => `.${c}`).join('')}`;
  };
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const nameOf = (el) => {
    const by = el.getAttribute('aria-labelledby');
    if (by) {
      const text = by
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
        .join(' ')
        .trim();
      if (text) return { name: text, from: 'aria-labelledby' };
    }
    const label = el.getAttribute('aria-label')?.trim();
    if (label) return { name: label, from: 'aria-label' };
    const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
    if (text) return { name: text, from: 'text' };
    const alt = [...el.querySelectorAll('img[alt]')].map((i) => i.alt.trim()).filter(Boolean).join(' ');
    if (alt) return { name: alt, from: 'img alt' };
    const svgTitle = el.querySelector('svg title')?.textContent?.trim();
    if (svgTitle) return { name: svgTitle, from: 'svg title' };
    if (el.id) {
      const forLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent?.trim();
      if (forLabel) return { name: forLabel, from: 'label' };
    }
    const title = el.getAttribute('title')?.trim();
    if (title) return { name: title, from: 'title' };
    const value = el.getAttribute('value')?.trim();
    if (value && el.tagName === 'INPUT') return { name: value, from: 'value' };
    return { name: '', from: '' };
  };
  const controls = root.querySelectorAll('button, a[href], [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="switch"], summary, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], select, textarea, input:not([type])');
  const unnamed = [];
  const iconOnly = [];
  for (const el of controls) {
    if (!shown(el) || el.closest('[aria-hidden="true"], [inert]')) continue;
    const { name, from } = nameOf(el);
    const state = ['aria-expanded', 'aria-pressed', 'aria-checked', 'aria-selected', 'aria-current']
      .filter((a) => el.hasAttribute(a))
      .map((a) => `${a}=${el.getAttribute(a)}`)
      .join(' ');
    if (!name) unnamed.push({ element: describe(el), state });
    else if (from !== 'text' && from !== 'label') iconOnly.push({ element: describe(el), name, from, state });
  }
  const unselectable = [];
  const textTags = 'label, legend, dt, dd, th, td, p, li, h1, h2, h3, h4, h5, h6, span, figcaption, caption';
  for (const el of root.querySelectorAll(textTags)) {
    if (unselectable.length >= 40) break;
    if (!shown(el) || el.closest('button, a[href], [role="button"], [aria-hidden="true"]')) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) continue;
    const cs = getComputedStyle(el);
    if ((cs.userSelect || cs.webkitUserSelect) === 'none') unselectable.push({ element: describe(el), text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) });
  }
  const live = root.querySelectorAll('[aria-live], [role="status"], [role="alert"], output').length;
  return { controls: controls.length, unnamed, iconOnly, unselectable, live };
}

async function decodePixels(context, png, coords) {
  const page = await context.newPage();
  try {
    return await page.evaluate(
      async ({ data, coords }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return coords.map(([x, y]) => {
          const cx = Math.min(Math.max(0, Math.round(x)), canvas.width - 1);
          const cy = Math.min(Math.max(0, Math.round(y)), canvas.height - 1);
          const d = ctx.getImageData(cx, cy, 1, 1).data;
          return [d[0], d[1], d[2]];
        });
      },
      { data: png.toString('base64'), coords },
    );
  } finally {
    await page.close();
  }
}

// Groups the samples of a scan into segments of one grey level (within 3)
// and marks as a line every segment no wider than two CSS px that differs
// from both neighbours by more than 8: a 1px rule reads as one such segment
// of `dsf` device px, two touching rules as one wider or brighter segment.
function segments(samples, dsf) {
  const grey = samples.map(([r, g, b]) => Math.round((r + g + b) / 3));
  const segs = [];
  grey.forEach((v, i) => {
    const last = segs[segs.length - 1];
    if (last && Math.abs(v - last.grey) <= 3) last.end = i;
    else segs.push({ start: i, end: i, grey: v, rgb: samples[i] });
  });
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const width = s.end - s.start + 1;
    const before = segs[i - 1];
    const after = segs[i + 1];
    s.line = width <= 2 * dsf && !!before && !!after && Math.abs(s.grey - before.grey) > 8 && Math.abs(s.grey - after.grey) > 8;
  }
  return { grey, segs };
}

const pw = loadPlaywright();
const browserType = pw[engine];
const browser = await browserType.launch(engine === 'chromium' ? { executablePath: findChrome(), headless: true } : { headless: true });
const phone = vw < 768;
const context = await browser.newContext({
  viewport: { width: vw, height: vh },
  deviceScaleFactor: dsf,
  isMobile: phone,
  hasTouch: phone,
  colorScheme: theme === 'dark' || theme === 'light' ? theme : 'no-preference',
});
await context.addInitScript(
  ({ theme, storage }) => {
    try {
      if (theme) {
        localStorage.setItem('gt-theme', theme);
        localStorage.setItem('theme', theme);
      }
      for (const [k, v] of storage) localStorage.setItem(k, v);
    } catch {
      // storage blocked on this origin
    }
  },
  { theme, storage },
);

const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${String(e.message || e).slice(0, 200)}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`);
});
page.on('response', (r) => {
  if (r.status() >= 400) errors.push(`${r.status()} ${r.url().slice(0, 200)}`);
});

const result = { url, browser: `${engine} ${browser.version()}`, viewport: `${vw}x${vh}`, dsf, theme: theme || 'unseeded', errors };
let exit = 0;
mkdirSync(outDir, { recursive: true });

try {
  await page.goto(url, { waitUntil: 'load', timeout });
} catch (e) {
  console.error(`probe: could not load ${url}: ${String(e.message || e).split('\n')[0]}`);
  await browser.close();
  process.exit(2);
}
await page.waitForTimeout(wait);

if (scrollThrough) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(wait);
}
if (scrollY) {
  await page.evaluate((y) => window.scrollTo(0, y), Number(scrollY));
  await page.waitForTimeout(wait);
}
if (scrollToSel || selector) {
  await page.evaluate(
    ({ sel, nth }) => {
      const el = document.querySelectorAll(sel)[nth];
      if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
    },
    { sel: scrollToSel || selector, nth: scrollToSel ? 0 : nth },
  );
  await page.waitForTimeout(wait);
}

result.themeRead = await page.evaluate(() => ({ dataTheme: document.documentElement.dataset.theme ?? '', darkClass: document.documentElement.classList.contains('dark'), scrollY: Math.round(window.scrollY) }));

if (selector) {
  result.frames = [];
  for (let f = 0; f < frames; f++) {
    const box = await page.evaluate(readBox, { selector, nth });
    if (box.error) {
      result.frames.push(box);
      break;
    }
    const pad = 24;
    const clip = {
      x: Math.max(0, box.rect.x - pad),
      y: Math.max(0, box.rect.y - pad),
      width: Math.min(vw - Math.max(0, box.rect.x - pad), box.rect.w + pad * 2),
      height: Math.min(vh - Math.max(0, box.rect.y - pad), box.rect.h + pad * 2),
    };
    if (clip.width > 0 && clip.height > 0) {
      const file = join(outDir, `sel${frames > 1 ? `-f${String(f).padStart(2, '0')}` : ''}.png`);
      await page.screenshot({ path: file, clip });
      box.crop = file;
    }
    result.frames.push(box);
    if (f < frames - 1) await page.waitForTimeout(every);
  }
}

if (points.length || scans.length) {
  const shot = await page.screenshot();
  writeFileSync(join(outDir, 'viewport.png'), shot);
  result.viewportShot = join(outDir, 'viewport.png');
  if (points.length) {
    const pixels = await decodePixels(context, shot, points.map(([x, y]) => [x * dsf, y * dsf]));
    result.points = [];
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      result.points.push({ x, y, pixel: pixels[i], stack: await page.evaluate(readPoint, { x, y }) });
    }
  }
  if (scans.length) {
    result.scans = [];
    for (const s of scans) {
      const count = Math.round(s.len * dsf);
      const coords = Array.from({ length: count }, (_, i) => (s.dir === 'down' ? [s.x * dsf, s.y * dsf + i] : [s.x * dsf + i, s.y * dsf]));
      const samples = await decodePixels(context, shot, coords);
      const { grey, segs } = segments(samples, dsf);
      const origin = s.dir === 'down' ? s.y : s.x;
      result.scans.push({
        ...s,
        grey,
        segments: segs.map((g) => ({ at: Math.round((origin + g.start / dsf) * 100) / 100, devicePx: g.end - g.start + 1, grey: g.grey, rgb: g.rgb, line: g.line })),
        lines: segs.filter((g) => g.line).length,
      });
    }
  }
}

if (a11y) {
  result.a11y = await page.evaluate(readA11y, { scope: '' });
  if (strict && !result.a11y.error && (result.a11y.unnamed.length || result.a11y.unselectable.length)) exit = 1;
}

await browser.close();

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(exit);
}

const line = (s = '') => console.log(s);
line(`${url}  ${result.browser}  ${result.viewport} @${dsf}x  theme ${result.theme} (data-theme "${result.themeRead.dataTheme}", dark class ${result.themeRead.darkClass})  scrollY ${result.themeRead.scrollY}`);
for (const [i, box] of (result.frames ?? []).entries()) {
  if (i === 0) line();
  if (box.error) {
    line(`  ${box.error}`);
    continue;
  }
  if (i === 0) {
    line(`${box.element}  (${box.matches} match${box.matches === 1 ? '' : 'es'}, index ${nth})  "${box.text}"`);
    line(`  rect      x ${box.rect.x}  y ${box.rect.y}  w ${box.rect.w}  h ${box.rect.h}`);
    line(`  margin    ${box.margin.join(' ')}   (top right bottom left)`);
    line(`  border    ${box.border.join(' ')}   ${[...new Set(box.borderColor)].join(' | ')}`);
    line(`  padding   ${box.padding.join(' ')}`);
    line(`  content   ${box.content.w} x ${box.content.h}`);
    line(`  layout    ${Object.entries(box.layout).map(([k, v]) => `${k} ${v}`).join('; ')}`);
    line(`  type      ${Object.entries(box.type).map(([k, v]) => `${k} ${v}`).join('; ')}`);
    line(`  paint     ${Object.entries(box.paint).map(([k, v]) => `${k} ${v}`).join('; ')}`);
    if (box.parent) line(`  parent    ${box.parent.element}: display ${box.parent.display}; gap ${box.parent.gap}; padding ${box.parent.padding.join(' ')}; align ${box.parent.alignItems}; justify ${box.parent.justifyContent}`);
    const space = (n, before) => (n.vertical >= 0 ? `${n.vertical}px ${before ? 'above' : 'below'}` : `beside it, ${n.horizontal}px to the ${before ? 'left' : 'right'}`);
    if (box.previous) line(`  previous  ${box.previous.element}: ${space(box.previous, true)} (its margin-bottom ${box.previous.margins.sibling}, this margin-top ${box.previous.margins.self})`);
    if (box.next) line(`  next      ${box.next.element}: ${space(box.next, false)} (this margin-bottom ${box.next.margins.self}, its margin-top ${box.next.margins.sibling})`);
  }
  if (frames > 1) line(`  frame ${String(i).padStart(2, '0')}  w ${box.rect.w}  h ${box.rect.h}  x ${box.rect.x}  y ${box.rect.y}  opacity ${box.paint.effectiveOpacity}  transform ${box.layout.transform}${box.crop ? `  ${box.crop}` : ''}`);
  else if (box.crop) line(`  crop      ${box.crop}`);
}
for (const p of result.points ?? []) {
  line();
  line(`point ${p.x},${p.y}  pixel rgb(${p.pixel.join(', ')})`);
  for (const s of p.stack) line(`  ${s.element}  bg ${s.background}  opacity ${s.opacity}  borders ${s.borders}${s.shadow ? `  shadow ${s.shadow}` : ''}${s.outline ? `  outline ${s.outline}` : ''}`);
}
for (const s of result.scans ?? []) {
  line();
  line(`scan ${s.dir} from ${s.x},${s.y} over ${s.len}px: ${s.segments.length} segments, ${s.lines} line${s.lines === 1 ? '' : 's'}`);
  for (const g of s.segments) line(`  ${g.line ? 'LINE ' : '     '} at ${g.at}px  ${g.devicePx} device px  grey ${g.grey}  rgb(${g.rgb.join(', ')})`);
}
if (result.a11y) {
  line();
  if (result.a11y.error) line(`a11y: ${result.a11y.error}`);
  else {
    line(`a11y: ${result.a11y.controls} controls, ${result.a11y.unnamed.length} with no accessible name, ${result.a11y.unselectable.length} unselectable text elements, ${result.a11y.live} live regions`);
    for (const u of result.a11y.unnamed) line(`  NO NAME   ${u.element}${u.state ? `  ${u.state}` : ''}`);
    for (const c of result.a11y.iconOnly.slice(0, 40)) line(`  announces "${c.name.length > 80 ? `${c.name.slice(0, 77)}...` : c.name}" (${c.from})  ${c.element}${c.state ? `  ${c.state}` : ''}`);
    if (result.a11y.iconOnly.length > 40) line(`  ... ${result.a11y.iconOnly.length - 40} more named by attribute (--json lists them all)`);
    for (const t of result.a11y.unselectable) line(`  SELECT-NONE  ${t.element}  "${t.text}"`);
  }
}
if (errors.length) {
  line();
  line(`console and page errors (${errors.length}):`);
  for (const e of errors.slice(0, 20)) line(`  ${e}`);
}
if (result.viewportShot) line(`\nviewport capture: ${result.viewportShot}`);
process.exit(exit);
