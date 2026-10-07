#!/usr/bin/env node
// Captures one figure at 2x device pixels in the light and dark themes and
// reports the SVG facts the line auditor cannot see, because
// scripts/lint-lines.mjs skips every element inside an svg or a canvas:
//
//   - labels whose rendered size is under the surface's floor (--min);
//   - labels that are rotated, skewed or stretched by a transform or by a
//     viewBox drawn with preserveAspectRatio="none";
//   - strokes in a stretched viewBox without vector-effect:
//     non-scaling-stroke, and curves there, which warp;
//   - dash patterns that rely on pathLength under non-scaling-stroke, which
//     Chromium ignores;
//   - geometry that differs between the light and the dark capture.
//
// Usage:
//   node skills/gt-diagrams/scripts/figure-check.mjs <url> --selector <css>
//     [--out <dir>] [--width 1440] [--height 900] [--min 18]
//     [--crop x,y,w,h]... [--wait 800] [--theme both|light|dark]
//     [--press <key>]... [--motion] [--chrome <path>]
//
// --crop is in CSS px from the figure's top left corner and may repeat;
// each crop is written at 2x beside the full capture, for reading a junction
// by eye. --min is the smallest rendered label in CSS px: 18 on a deck
// sheet, 26 on a 1600px graphics stage, and on a page the page's own
// smallest label token. Reduced motion is on unless --motion is passed, so
// the capture is the figure's still. The theme is seeded the way the sites
// seed it before first paint (localStorage gt-theme, gt-deck-theme and
// theme, plus the data-theme attribute and prefers-color-scheme). --press
// sends keys after load: the assembled deck takes `--press p` for present
// mode, where the sheet fills a 1600x900 viewport and CSS px are sheet px
// (put the slide number in the URL hash).
//
// Exit code 1 on any finding marked "error"; warnings are printed only.
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { chromium } from 'playwright-core';

function parseArgs(argv) {
  const opts = { url: '', selector: '', out: 'figure-check', width: 1440, height: 900, min: 18, crops: [], keys: [], wait: 800, themes: ['light', 'dark'], motion: false, chrome: process.env.CHROME_PATH || '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--selector') opts.selector = next();
    else if (a === '--out') opts.out = next();
    else if (a === '--width') opts.width = Number(next());
    else if (a === '--height') opts.height = Number(next());
    else if (a === '--min') opts.min = Number(next());
    else if (a === '--wait') opts.wait = Number(next());
    else if (a === '--motion') opts.motion = true;
    else if (a === '--press') opts.keys.push(next());
    else if (a === '--chrome') opts.chrome = next();
    else if (a === '--theme') {
      const t = next();
      opts.themes = t === 'both' ? ['light', 'dark'] : [t];
    } else if (a === '--crop') {
      const [x, y, w, h] = next().split(',').map(Number);
      opts.crops.push({ x, y, w, h });
    } else if (!a.startsWith('--')) opts.url = a;
  }
  if (!opts.url || !opts.selector) {
    console.error('usage: figure-check.mjs <url> --selector <css> [--out dir] [--min 18] [--crop x,y,w,h]');
    process.exit(2);
  }
  return opts;
}

async function launch(chromePath) {
  if (chromePath) return chromium.launch({ executablePath: chromePath });
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ channel: 'chrome' });
  }
}

/* Runs in the page. Returns the figure's box, each svg's scale, and the
   findings for that theme. */
function probe({ selector, min }) {
  const root = document.querySelector(selector);
  if (!root) return null;
  const r2 = (n) => Math.round(n * 100) / 100;
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r2(r.x + window.scrollX), y: r2(r.y + window.scrollY), w: r2(r.width), h: r2(r.height) };
  };
  const name = (el) => {
    const cls = typeof el.className === 'string' ? el.className : el.getAttribute('class') || '';
    const text = el.tagName.toLowerCase() === 'text' ? ` "${(el.textContent || '').trim().slice(0, 32)}"` : '';
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls ? `.${cls.trim().split(/\s+/).join('.')}` : ''}${text}`;
  };
  const scaleOf = (m) => ({ sx: Math.hypot(m.a, m.b), sy: Math.hypot(m.c, m.d), turned: Math.abs(m.b) > 1e-3 || Math.abs(m.c) > 1e-3 });
  const svgs = root.tagName.toLowerCase() === 'svg' ? [root, ...root.querySelectorAll('svg')] : [...root.querySelectorAll('svg')];
  const findings = [];
  const add = (level, msg) => findings.push({ level, msg });
  const scales = [];
  for (const svg of svgs) {
    const m = svg.getScreenCTM();
    if (!m) continue;
    const { sx, sy } = scaleOf(m);
    const stretched = Math.abs(sx / sy - 1) > 0.01;
    const vb = svg.getAttribute('viewBox') || '(none)';
    scales.push({ svg: name(svg), viewBox: vb, sx: r2(sx), sy: r2(sy), stretched, box: rect(svg) });
    if (!stretched) continue;
    for (const el of svg.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse')) {
      const cs = getComputedStyle(el);
      if (cs.stroke === 'none' || cs.strokeWidth === '0px') continue;
      if (cs.vectorEffect !== 'non-scaling-stroke') add('error', `${name(el)}: stroke without non-scaling-stroke in a stretched viewBox (${vb}, x ${r2(sx)}, y ${r2(sy)})`);
      const d = el.getAttribute('d') || '';
      if (/[CcSsQqTtAa]/.test(d) || el.tagName === 'circle' || el.tagName === 'ellipse') add('warn', `${name(el)}: curve in a stretched viewBox warps; prefer straight taps`);
    }
  }
  for (const el of root.querySelectorAll('text')) {
    const m = el.getScreenCTM();
    if (!m || !(el.textContent || '').trim()) continue;
    const { sx, sy, turned } = scaleOf(m);
    const size = r2(parseFloat(getComputedStyle(el).fontSize) * sy);
    if (size < min) add('error', `${name(el)}: renders at ${size}px, under the ${min}px floor`);
    if (turned) add('error', `${name(el)}: label is rotated or skewed; keep labels horizontal`);
    else if (Math.abs(sx / sy - 1) > 0.01) add('error', `${name(el)}: label is stretched (x ${r2(sx)}, y ${r2(sy)})`);
  }
  for (const el of root.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse')) {
    const cs = getComputedStyle(el);
    if (cs.strokeDasharray === 'none' || cs.vectorEffect !== 'non-scaling-stroke') continue;
    if (el.hasAttribute('pathLength')) add('error', `${name(el)}: dash with pathLength under non-scaling-stroke; Chromium dashes in screen px and ignores pathLength`);
    else add('warn', `${name(el)}: dash under non-scaling-stroke is measured in screen px; a single traveling dash tiles on a scaled svg`);
  }
  return { box: rect(root), scales, texts: root.querySelectorAll('text').length, findings };
}

const opts = parseArgs(process.argv.slice(2));
const outDir = resolve(opts.out);
mkdirSync(outDir, { recursive: true });
const slug = opts.selector.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'figure';
const browser = await launch(opts.chrome);
const runs = {};
let failed = false;

for (const theme of opts.themes) {
  const ctx = await browser.newContext({
    viewport: { width: opts.width, height: opts.height },
    deviceScaleFactor: 2,
    colorScheme: theme,
    reducedMotion: opts.motion ? 'no-preference' : 'reduce',
  });
  await ctx.addInitScript((t) => {
    try {
      for (const key of ['gt-theme', 'gt-deck-theme', 'theme']) localStorage.setItem(key, t);
    } catch {
      /* storage blocked: the attribute below still applies */
    }
    document.addEventListener('DOMContentLoaded', () => document.documentElement.setAttribute('data-theme', t));
  }, theme);
  const page = await ctx.newPage();
  await page.goto(opts.url, { waitUntil: 'load', timeout: 180000 });
  for (const key of opts.keys) {
    await page.keyboard.press(key);
    await page.waitForTimeout(250);
  }
  const el = page.locator(opts.selector).first();
  await el.scrollIntoViewIfNeeded({ timeout: 60000 });
  await page.waitForTimeout(opts.wait);
  const res = await page.evaluate(probe, { selector: opts.selector, min: opts.min });
  if (!res) {
    console.error(`${theme}: no element matches ${opts.selector}`);
    process.exit(2);
  }
  const shot = join(outDir, `${slug}-${theme}@2x.png`);
  await el.screenshot({ path: shot });
  const crops = [];
  for (const [k, c] of opts.crops.entries()) {
    const path = join(outDir, `${slug}-${theme}-crop${k + 1}@2x.png`);
    await page.screenshot({ path, fullPage: true, clip: { x: res.box.x + c.x, y: res.box.y + c.y, width: c.w, height: c.h } });
    crops.push(path);
  }
  runs[theme] = res;
  console.log(`\n${theme}: ${opts.selector} ${res.box.w}x${res.box.h} css px, ${res.texts} labels`);
  for (const s of res.scales) console.log(`  ${s.svg} viewBox ${s.viewBox} scale x ${s.sx} y ${s.sy}${s.stretched ? ' (stretched)' : ''}`);
  for (const f of res.findings) {
    console.log(`  ${f.level}: ${f.msg}`);
    if (f.level === 'error') failed = true;
  }
  console.log(`  wrote ${shot}`);
  for (const p of crops) console.log(`  wrote ${p}`);
  await ctx.close();
}

if (runs.light && runs.dark) {
  const a = runs.light;
  const b = runs.dark;
  const moved = (p, q) => Math.abs(p.w - q.w) > 0.5 || Math.abs(p.h - q.h) > 0.5;
  const shifts = [];
  if (moved(a.box, b.box)) shifts.push(`figure ${a.box.w}x${a.box.h} light, ${b.box.w}x${b.box.h} dark`);
  a.scales.forEach((s, i) => {
    const t = b.scales[i];
    if (t && moved(s.box, t.box)) shifts.push(`${s.svg} ${s.box.w}x${s.box.h} light, ${t.box.w}x${t.box.h} dark`);
  });
  if (a.texts !== b.texts) shifts.push(`${a.texts} labels light, ${b.texts} dark`);
  console.log('\nthemes:');
  if (shifts.length === 0) console.log('  same geometry in both themes');
  for (const s of shifts) {
    console.log(`  error: geometry moves between themes: ${s}`);
    failed = true;
  }
}

await browser.close();
console.log(failed ? '\nfigure-check: errors found' : '\nfigure-check: clean');
process.exit(failed ? 1 : 0);
