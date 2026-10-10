#!/usr/bin/env node
// frame-probe.mjs: measures how smoothly a page animates, the way the
// gt-performance skill asks for before and after numbers.
//
// For each run it opens the page in a fresh browser context, waits for load
// and a warmup, then samples requestAnimationFrame intervals for a fixed
// window while the page runs (or while it scrolls, with --scroll). It prints
// the median, p95 and worst frame interval, the share of intervals over the
// budget, the long tasks inside the window, the WebGL contexts the page
// created and lost, the canvases left in the DOM, any glyph-field governor
// tiers (`canvas[data-gf-tier]`), the GL renderer string, and the machine's
// one-minute load average before and after the run. Several runs print one
// line each and a median line.
//
// Usage, with the working directory in a checkout that has playwright-core
// (Prototemplate does; from an installed copy, run this folder's file the
// same way):
//   node skills/gt-performance/scripts/frame-probe.mjs <url> [<url> ...]
//     [--runs 3] [--seconds 8] [--warmup 3] [--cpu 1] [--size 1440x900]
//     [--dpr 2] [--theme dark] [--scroll] [--hover "<selector>"]
//     [--budget 22] [--headed] [--timeout 120000] [--json]
//     [--max-median <ms>] [--max-slow <fraction>] [--max-contexts <n>]
//     [--max-long <ms>]
//
// Examples:
//   node skills/gt-performance/scripts/frame-probe.mjs http://localhost:3005/ --runs 3
//   node skills/gt-performance/scripts/frame-probe.mjs http://localhost:3005/ --cpu 12 --seconds 12
//   node skills/gt-performance/scripts/frame-probe.mjs http://localhost:3001/en-US --scroll --size 390x844 --dpr 3
//
// --cpu sets Chrome's CPU throttling rate through the DevTools protocol (12
// is the rate the glyph-field governor was proven against). --budget is the
// interval in ms that counts as slow (22 is the governor's budget; use 16.7
// to count every interval that missed 60 fps on a 60 Hz display). --headed
// runs a visible Chrome: headless Chrome may draw WebGL in software, so read
// the renderer column, and use --headed for GPU-bound pages. Any --max-*
// flag turns the run into a gate: the script exits 1 when the median run
// breaches it, so a budget fails the change like a lint.
//
// The theme is seeded the way GT pages read it: localStorage gt-theme
// (Prototemplate) and theme (next-themes in gt-cloud), plus the
// prefers-color-scheme emulation. Reduced motion is emulated off, so the
// page's motion runs. CHROME_PATH overrides the browser; otherwise the newest
// Chrome for Testing build under the ms-playwright cache is used.
//
// The load average is the machine's, not the page's. Parallel agent
// sessions on the same machine pushed it into the hundreds in September
// 2026, and every timing taken under that load reads slow. The script warns
// when the load is above the core count; rerun at low load and compare
// before and after runs taken under similar load.
//
// Requires: playwright-core (in a Prototemplate checkout) and Chrome for Testing.
// Last real run: none (kept for: frame-rate checks in performance rounds).

import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { cpus, homedir, loadavg, platform } from 'node:os';
import { join } from 'node:path';

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

function takeNumber(name, fallback) {
  const raw = takeValue(name, undefined);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    console.error(`frame-probe: --${name} needs a number, got "${raw}"`);
    process.exit(2);
  }
  return value;
}

const runs = Math.max(1, Math.round(takeNumber('runs', 1)));
const seconds = takeNumber('seconds', 8);
const warmup = takeNumber('warmup', 3);
const cpu = takeNumber('cpu', 1);
const [width, height] = takeValue('size', '1440x900').split('x').map(Number);
const dpr = takeNumber('dpr', 2);
const theme = takeValue('theme', 'dark') === 'light' ? 'light' : 'dark';
const scroll = takeFlag('scroll');
const hover = takeValue('hover', '');
const budget = takeNumber('budget', 22);
const headed = takeFlag('headed');
const timeout = takeNumber('timeout', 120000);
const asJson = takeFlag('json');
const gates = {
  median: takeNumber('max-median', undefined),
  slow: takeNumber('max-slow', undefined),
  contexts: takeNumber('max-contexts', undefined),
  long: takeNumber('max-long', undefined),
};
const urls = argv.filter((a) => !a.startsWith('--'));

if (urls.length === 0 || !width || !height) {
  console.error(
    'Usage: frame-probe.mjs <url> [<url> ...] [--runs 3] [--seconds 8] [--warmup 3] [--cpu 1] [--size 1440x900] [--dpr 2] [--theme dark] [--scroll] [--hover "<selector>"] [--budget 22] [--headed] [--timeout 120000] [--json] [--max-median ms] [--max-slow fraction] [--max-contexts n] [--max-long ms]',
  );
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
  console.error('frame-probe: playwright-core is not installed in this checkout. Run the script from Prototemplate, or add playwright-core as a dev dependency.');
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

// Installed before any page script. Counts WebGL contexts as the page
// creates them (wrapping getContext creates nothing itself: a probe that
// calls getContext to count contexts creates them and exhausts the budget it
// measures), records context losses, the first GL renderer string, and long
// tasks. Kept free of outer references because Playwright serialises it.
function instrument({ t }) {
  try {
    localStorage.setItem('gt-theme', t);
    localStorage.setItem('theme', t);
  } catch {
    // storage can be blocked; the color-scheme emulation still applies
  }
  const fp = { contexts: 0, lost: 0, renderer: '', longtasks: [] };
  window.__frameProbe = fp;
  const seen = new WeakSet();
  const wrap = (proto) => {
    if (!proto || !proto.getContext) return;
    const original = proto.getContext;
    proto.getContext = function getContext(type, ...rest) {
      const ctx = original.call(this, type, ...rest);
      if (ctx && /webgl/i.test(String(type)) && !seen.has(ctx)) {
        seen.add(ctx);
        fp.contexts += 1;
        try {
          this.addEventListener('webglcontextlost', () => {
            fp.lost += 1;
          });
        } catch {
          // an OffscreenCanvas without listeners still counts
        }
        if (!fp.renderer) {
          try {
            const info = ctx.getExtension('WEBGL_debug_renderer_info');
            fp.renderer = String(info ? ctx.getParameter(info.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER));
          } catch {
            fp.renderer = 'unknown';
          }
        }
      }
      return ctx;
    };
  };
  wrap(window.HTMLCanvasElement && window.HTMLCanvasElement.prototype);
  wrap(window.OffscreenCanvas && window.OffscreenCanvas.prototype);
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) fp.longtasks.push({ start: entry.startTime, duration: entry.duration });
    }).observe({ type: 'longtask', buffered: true });
  } catch {
    // long task timing is Chromium only
  }
}

// Samples requestAnimationFrame intervals for `ms` and reads the counters.
function sample({ ms }) {
  return new Promise((resolve) => {
    const fp = window.__frameProbe ?? { contexts: 0, lost: 0, renderer: '', longtasks: [] };
    const deltas = [];
    const t0 = performance.now();
    let last = -1;
    const tick = (ts) => {
      if (last >= 0) deltas.push(ts - last);
      last = ts;
      if (ts - t0 < ms) {
        requestAnimationFrame(tick);
        return;
      }
      const inside = fp.longtasks.filter((e) => e.start >= t0);
      resolve({
        deltas,
        longCount: inside.length,
        longMs: inside.reduce((sum, e) => sum + e.duration, 0),
        contexts: fp.contexts,
        lost: fp.lost,
        renderer: fp.renderer,
        canvases: document.querySelectorAll('canvas').length,
        tiers: [...document.querySelectorAll('canvas[data-gf-tier]')].map((c) => c.dataset.gfTier),
      });
    };
    requestAnimationFrame(tick);
  });
}

const quantile = (sorted, q) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : NaN);
const median = (values) => {
  const sorted = [...values].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

function summarise(raw, loadBefore, loadAfter) {
  const sorted = [...raw.deltas].sort((a, b) => a - b);
  const med = quantile(sorted, 0.5);
  return {
    frames: sorted.length,
    medianMs: med,
    fps: med ? 1000 / med : NaN,
    p95Ms: quantile(sorted, 0.95),
    worstMs: sorted.length ? sorted[sorted.length - 1] : NaN,
    slowShare: sorted.length ? sorted.filter((d) => d > budget).length / sorted.length : NaN,
    longTasks: raw.longCount,
    longMs: raw.longMs,
    contexts: raw.contexts,
    lost: raw.lost,
    canvases: raw.canvases,
    tiers: raw.tiers,
    renderer: raw.renderer,
    loadBefore,
    loadAfter,
  };
}

const fmt = (n, digits = 1) => (Number.isFinite(n) ? n.toFixed(digits) : 'n/a');

function line(label, r) {
  const tiers = r.tiers.length ? ` tiers ${r.tiers.join(',')}` : '';
  return `${label}  median ${fmt(r.medianMs)} ms (${fmt(r.fps, 0)} fps)  p95 ${fmt(r.p95Ms)}  worst ${fmt(r.worstMs)}  slow ${fmt(r.slowShare * 100)}%  long ${r.longTasks} / ${fmt(r.longMs, 0)} ms  gl ${r.contexts} lost ${r.lost}  canvases ${r.canvases}${tiers}  load ${fmt(r.loadBefore, 2)} to ${fmt(r.loadAfter, 2)}`;
}

const { chromium } = loadPlaywright();
const cores = cpus().length;
const browser = await chromium.launch({ executablePath: findChrome(), headless: !headed });
const report = [];
let breached = false;

try {
  for (const url of urls) {
    const results = [];
    for (let run = 1; run <= runs; run += 1) {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: dpr,
        colorScheme: theme,
        reducedMotion: 'no-preference',
      });
      await context.addInitScript(instrument, { t: theme });
      const page = await context.newPage();
      if (cpu > 1) {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
      }
      const loadBefore = loadavg()[0];
      try {
        await page.goto(url, { waitUntil: 'load', timeout });
      } catch (error) {
        console.error(`frame-probe: could not load ${url} (${error.message.split('\n')[0]})`);
        await context.close();
        continue;
      }
      if (hover) {
        try {
          await page.hover(hover, { timeout: 10000 });
        } catch {
          console.error(`frame-probe: nothing to hover at "${hover}"`);
        }
      }
      await page.waitForTimeout(warmup * 1000);
      const sampling = page.evaluate(sample, { ms: seconds * 1000 });
      if (scroll) {
        await page.mouse.move(width / 2, height / 2);
        const steps = Math.max(1, Math.round((seconds * 1000) / 120));
        for (let i = 0; i < steps; i += 1) {
          await page.mouse.wheel(0, 120);
          await page.waitForTimeout(100);
        }
      }
      const raw = await sampling;
      const loadAfter = loadavg()[0];
      const result = summarise(raw, loadBefore, loadAfter);
      results.push(result);
      if (!asJson) console.log(line(`${url} run ${run}`, result));
      await context.close();
    }
    if (!results.length) continue;
    const pick = (key) => median(results.map((r) => r[key]));
    const summary = {
      url,
      runs: results.length,
      settings: { seconds, warmup, cpu, width, height, dpr, theme, scroll, hover, budget, headed, cores },
      medianMs: pick('medianMs'),
      fps: pick('fps'),
      p95Ms: pick('p95Ms'),
      worstMs: pick('worstMs'),
      slowShare: pick('slowShare'),
      longTasks: pick('longTasks'),
      longMs: pick('longMs'),
      contexts: Math.max(...results.map((r) => r.contexts)),
      lost: Math.max(...results.map((r) => r.lost)),
      canvases: Math.max(...results.map((r) => r.canvases)),
      tiers: results.at(-1).tiers,
      renderer: results.find((r) => r.renderer)?.renderer ?? '',
      loadBefore: pick('loadBefore'),
      loadAfter: pick('loadAfter'),
      runsDetail: results,
    };
    const failures = [];
    if (gates.median !== undefined && summary.medianMs > gates.median) failures.push(`median ${fmt(summary.medianMs)} ms > ${gates.median}`);
    if (gates.slow !== undefined && summary.slowShare > gates.slow) failures.push(`slow share ${fmt(summary.slowShare, 3)} > ${gates.slow}`);
    if (gates.contexts !== undefined && summary.contexts > gates.contexts) failures.push(`WebGL contexts ${summary.contexts} > ${gates.contexts}`);
    if (gates.long !== undefined && summary.longMs > gates.long) failures.push(`long tasks ${fmt(summary.longMs, 0)} ms > ${gates.long}`);
    summary.failures = failures;
    if (failures.length) breached = true;
    report.push(summary);
    if (!asJson) {
      if (results.length > 1) console.log(line(`${url} median of ${results.length}`, summary));
      console.log(`  renderer: ${summary.renderer || 'no WebGL context'}  cpu x${cpu}  ${width}x${height} @${dpr}x  ${theme}${scroll ? '  scrolling' : ''}${hover ? `  hover ${hover}` : ''}`);
      if (Math.max(summary.loadBefore, summary.loadAfter) > cores) {
        console.log(`  warning: load average above the ${cores} cores; the timings read slow under it. Rerun at low load.`);
      }
      for (const failure of failures) console.log(`  BUDGET FAILED: ${failure}`);
    }
  }
} finally {
  await browser.close();
}

if (asJson) console.log(JSON.stringify(report, null, 2));
process.exit(breached ? 1 : 0);
