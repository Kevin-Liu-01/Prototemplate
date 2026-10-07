#!/usr/bin/env node
// measure-type.mjs: reads the type of a page's headings and leads the way
// Kevin reviews it, at each width and theme, and flags what the gt-aesthetic
// review standard calls a defect.
//
// For every visible element the selector matches it prints the size, weight,
// line height, tracking in em, feature list, line count, characters per full
// line, the contrast of the text against the solid grounds behind it, and the
// flags: a weight above 500 on a heading, a display heading (32px and up) on
// more than two lines, a lead on more than three lines (five at phone
// widths), prose wider than 75 characters, a heading without balanced
// wrapping, a display heading without cv11 and ss01, tracking above +0.02em
// or below -0.03em, a face other than Inter outside code, a last line under a
// fifth of the widest one, and text under the WCAG contrast floor (4.5:1, or
// 3:1 at 24px and up).
//
// Usage, with the working directory in a checkout that has playwright-core
// (Prototemplate does; from an installed copy, run this folder's file the
// same way):
//   node skills/gt-aesthetic/scripts/measure-type.mjs <url> [<url> ...]
//     [--widths 1440,390] [--themes dark,light] [--sel "h1, h2, .lead"]
//     [--max 40] [--storage key=value,key=value] [--timeout 120000] [--json]
//     [--strict]
//
// Measure the reference first and the new page second, with the same flags:
//   node skills/gt-aesthetic/scripts/measure-type.mjs http://localhost:3005/brand-deck.html \
//     --storage gt-deck-mode=book --sel ".book-head h1, .book-head p"
//   node skills/gt-aesthetic/scripts/measure-type.mjs http://localhost:3005/brand
//
// The theme is seeded the way GT pages read it: localStorage gt-theme (the
// Prototemplate shell and the deck) and theme (next-themes in gt-cloud), plus
// the prefers-color-scheme emulation. --storage seeds further localStorage
// keys before load, such as gt-deck-mode=book, which opens the deck's book
// view. Contrast reads the element's ancestor grounds only; a canvas, an image
// or a gradient behind the text makes the value "n/a" and the check is done
// by eye. Only the top document is read, so measure an iframe's page at its
// own URL.
//
// CHROME_PATH overrides the browser; otherwise the newest Chrome for Testing
// build under the ms-playwright cache is used. --timeout sets the load limit
// per page in ms (default 120000); a dev server on a loaded machine can need
// more, and a page that misses it prints "could not load" and counts as no
// reading. --strict exits 1 when any flag
// is raised. The default exit is 0, so a review loop can run the script
// without failing on a flag it has already accepted.

import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

const DEFAULT_SELECTOR = 'h1, h2, h3, h1 ~ p, [class*="lead"]';

const argv = process.argv.slice(2);

function takeValue(name, fallback) {
  const at = argv.indexOf(`--${name}`);
  if (at === -1) return fallback;
  const value = argv[at + 1];
  argv.splice(at, 2);
  return value;
}

function takeFlag(name) {
  const at = argv.indexOf(`--${name}`);
  if (at === -1) return false;
  argv.splice(at, 1);
  return true;
}

const widths = takeValue('widths', '1440,390').split(',').map(Number).filter(Boolean);
const themes = takeValue('themes', 'dark,light').split(',').filter((t) => t === 'dark' || t === 'light');
const selector = takeValue('sel', DEFAULT_SELECTOR);
const max = Number(takeValue('max', '40'));
const storage = takeValue('storage', '')
  .split(',')
  .filter((pair) => pair.includes('='))
  .map((pair) => [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]);
const timeout = Number(takeValue('timeout', '120000')) || 120000;
const asJson = takeFlag('json');
const strict = takeFlag('strict');
const urls = argv.filter((a) => !a.startsWith('--'));

if (urls.length === 0) {
  console.error('Usage: measure-type.mjs <url> [<url> ...] [--widths 1440,390] [--themes dark,light] [--sel "h1, h2"] [--max 40] [--storage key=value] [--timeout 120000] [--json] [--strict]');
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
  console.error('measure-type: playwright-core is not installed in this checkout. Run the script from Prototemplate, or add playwright-core as a dev dependency.');
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

// Runs in the page. Kept free of outer references because Playwright
// serialises it.
function readType({ selector, max }) {
  const parse = (value) => {
    const rgb = value.match(/rgba?\(([^)]+)\)/);
    const srgb = value.match(/color\(srgb ([^)]+)\)/);
    const body = rgb ? rgb[1] : srgb ? srgb[1] : null;
    if (!body) return null;
    const parts = body.split(/[\s,/]+/).filter(Boolean).map(Number);
    const scale = rgb ? 1 : 255;
    return { r: parts[0] * scale, g: parts[1] * scale, b: parts[2] * scale, a: parts.length > 3 ? parts[3] : 1 };
  };
  const over = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
    a: 1,
  });
  const luminance = ({ r, g, b }) => {
    const f = (v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const groundOf = (el) => {
    const chain = [];
    for (let n = el; n; n = n.parentElement) chain.push(n);
    chain.reverse();
    const dark = getComputedStyle(document.documentElement).colorScheme.includes('dark') && document.documentElement.dataset.theme !== 'light';
    // With no painted ancestor the ground is GT's paper: #070707 dark, white light.
    let ground = dark ? { r: 7, g: 7, b: 7, a: 1 } : { r: 255, g: 255, b: 255, a: 1 };
    let solid = true;
    for (const n of chain) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none') solid = false;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) ground = over(c, ground);
    }
    return { ground, solid };
  };
  const linesOf = (el) => {
    const rects = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (!t.textContent.trim()) continue;
      range.selectNodeContents(t);
      for (const r of range.getClientRects()) if (r.width > 0.5 && r.height > 0.5) rects.push(r);
    }
    rects.sort((a, b) => a.top - b.top);
    const lines = [];
    for (const r of rects) {
      const last = lines[lines.length - 1];
      if (last && Math.abs(r.top - last.top) < Math.min(r.height, last.height) / 2) {
        last.left = Math.min(last.left, r.left);
        last.right = Math.max(last.right, r.right);
      } else {
        lines.push({ top: r.top, left: r.left, right: r.right, height: r.height });
      }
    }
    return lines.map((l) => l.right - l.left);
  };

  // A lead reads in two or three lines at a 60 to 70 character measure; a
  // phone column holds about 45 characters, so the same lead runs to five.
  const leadLimit = window.innerWidth <= 500 ? 5 : 3;
  const out = [];
  for (const el of document.querySelectorAll(selector)) {
    if (out.length >= max) break;
    const box = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (box.width < 4 || box.height < 4 || cs.visibility === 'hidden' || cs.display === 'none') continue;
    const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const widthsPx = linesOf(el);
    if (widthsPx.length === 0) continue;
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight);
    const track = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / size;
    const widest = Math.max(...widthsPx);
    const total = widthsPx.reduce((s, w) => s + w, 0);
    const lines = widthsPx.length;
    const cpl = Math.round((text.length * widest) / total);
    const tag = el.tagName.toLowerCase();
    const heading = /^h[1-6]$/.test(tag);
    const lead = !heading && el.matches('[class*="lead"], h1 ~ p');
    const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const code = el.closest('code, pre, kbd, samp') !== null;
    const features = cs.fontFeatureSettings;
    const wrap = cs.textWrapStyle || cs.textWrap || '';
    const color = parse(cs.color);
    const { ground, solid } = groundOf(el);
    let contrast = null;
    if (color && solid) {
      const fg = color.a < 1 ? over(color, ground) : color;
      const [hi, lo] = [luminance(fg), luminance(ground)].sort((a, b) => b - a);
      contrast = (hi + 0.05) / (lo + 0.05);
    }
    const flags = [];
    if (heading && weight > 500) flags.push(`weight ${weight}`);
    if (heading && size >= 32 && lines > 2) flags.push(`display head on ${lines} lines`);
    if (lead && lines > leadLimit) flags.push(`lead on ${lines} lines`);
    if (!heading && lines >= 2 && cpl > 75) flags.push(`measure ${cpl} chars`);
    if (heading && lines >= 2 && !wrap.includes('balance')) flags.push('no balance');
    if (heading && size >= 32 && !(/cv11/.test(features) && /ss01/.test(features))) flags.push('no cv11/ss01');
    if (track > 0.021) flags.push(`tracking +${track.toFixed(3)}em`);
    if (track < -0.031) flags.push(`tracking ${track.toFixed(3)}em`);
    if (!code && !/inter/i.test(family)) flags.push(`face ${family}`);
    if (lines >= 2 && widthsPx[lines - 1] < widest * 0.2) flags.push('short last line');
    if (contrast !== null) {
      const floor = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
      if (contrast < floor) flags.push(`contrast ${contrast.toFixed(2)}`);
    }
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
    out.push({
      element: [tag, ...cls].join('.'),
      text: text.length > 48 ? `${text.slice(0, 47)}...` : text,
      size,
      weight,
      lineHeight: cs.lineHeight === 'normal' ? 'normal' : Math.round(parseFloat(cs.lineHeight) * 10) / 10,
      track: Math.round(track * 1000) / 1000,
      features,
      family,
      lines,
      cpl,
      contrast: contrast === null ? null : Math.round(contrast * 100) / 100,
      flags,
    });
  }
  return out;
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
const results = [];
let flagged = 0;

try {
  for (const url of urls) {
    for (const theme of themes) {
      for (const width of widths) {
        const context = await browser.newContext({
          viewport: { width, height: width <= 500 ? 844 : 900 },
          deviceScaleFactor: 1,
          colorScheme: theme,
          reducedMotion: 'reduce',
        });
        await context.addInitScript(
          ({ t, pairs }) => {
            try {
              localStorage.setItem('gt-theme', t);
              localStorage.setItem('theme', t);
              for (const [key, value] of pairs) localStorage.setItem(key, value);
            } catch {
              // storage can be blocked on some origins
            }
          },
          { t: theme, pairs: storage },
        );
        const page = await context.newPage();
        try {
          await page.goto(url, { waitUntil: 'load', timeout });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(400);
          const rows = await page.evaluate(readType, { selector, max });
          flagged += rows.filter((r) => r.flags.length > 0).length;
          results.push({ url, theme, width, rows });
        } catch (error) {
          results.push({ url, theme, width, error: String(error.message || error).split('\n')[0], rows: [] });
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  const pad = (v, n) => String(v).padEnd(n).slice(0, n);
  for (const r of results) {
    console.log(`\n${r.url}  ${r.width}px  ${r.theme}`);
    if (r.error) {
      console.log(`  could not load: ${r.error}`);
      continue;
    }
    if (r.rows.length === 0) {
      console.log('  nothing matched the selector');
      continue;
    }
    console.log(`  ${pad('element', 26)} ${pad('size/wt', 9)} ${pad('lh', 6)} ${pad('track', 7)} ${pad('lines', 5)} ${pad('cpl', 4)} ${pad('ratio', 6)} text / flags`);
    for (const row of r.rows) {
      const ratio = row.contrast === null ? 'n/a' : row.contrast.toFixed(2);
      console.log(
        `  ${pad(row.element, 26)} ${pad(`${row.size}/${row.weight}`, 9)} ${pad(row.lineHeight, 6)} ${pad(row.track, 7)} ${pad(row.lines, 5)} ${pad(row.cpl, 4)} ${pad(ratio, 6)} ${row.text}`,
      );
      if (row.flags.length > 0) console.log(`  ${' '.repeat(26)} flags: ${row.flags.join('; ')}`);
    }
  }
  console.log(`\n${flagged} flagged element readings across ${results.length} page loads.`);
}

process.exit(strict && flagged > 0 ? 1 : 0);
