#!/usr/bin/env node
// stress.mjs: walks a scroll story or an animated section through the stress
// matrix of gt-verify section 3 at several viewports and writes the readings
// and the captures a reviewer looks at.
//
// Phases, in order, per viewport:
//   first     the first frames after navigation (0, 150, 400, 1000 and
//             2500 ms), where stacked layers, flashes and gaps that heal
//             later show up
//   slow      down the story in small wheel steps, settling at each step
//   fast      jumps to the end, the middle, the top and three quarters,
//             captured 100 ms after each jump and again once settled
//   reverse   up the story in small steps from the end
//   reload    a reload from the middle of the story, captured as it paints
//   deeplink  a fresh load of <url>#<hash> (with --hash)
//   zoom      the viewport made four times larger (a browser zoomed out to
//             25%) and back, then the story read again at the position it
//             left (desktop viewports only)
//   throttle  the slow walk again under CPU throttling (Chromium only), its
//             settled states compared with the unthrottled walk
//
// At every settled step it reads the copy elements (--copy) whose centre
// sits inside the viewport band (--band, default 0.1,0.9 of the height). An
// element counts as invisible when the product of its and its ancestors'
// opacity is under --min-opacity (default 0.05) or it is visibility hidden.
// Copy under a fixed layer at its centre (a consent banner, a toast, a
// header) counts as covered and is not visible. --hide takes a selector for
// such a layer when it lies outside the change, so the story itself is read.
// A step fails when copy sits in the band and none of it is visible, which
// is how a story reads when its beats never lit (a mobile stage stacks its
// beats and shows one at a time). With --each, every element in the band
// must be visible, for lists that show all their rows. It records layout-shift entries (Chromium), console
// and page errors, failed responses, and the requestAnimationFrame cadence
// per phase. Under throttle, settled states that equal the unthrottled walk
// mean the run was frame-starved and correct; a state that differs is a
// defect in the story's logic.
//
// Usage, with the working directory in a checkout that has playwright-core
// (Prototemplate does; from an installed copy, run this folder's file the
// same way):
//   node skills/gt-verify/scripts/stress.mjs <url> --copy "<css>"
//     [--story <css>] [--hash <id>]
//     [--viewports 1440x900,1920x1080,1100x800,868x525,390x844]
//     [--theme dark|light] [--browser chromium|webkit] [--steps 8]
//     [--settle 700] [--cpu 10] [--phases first,slow,fast,reverse,reload,deeplink,zoom,throttle]
//     [--band 0.1,0.9] [--min-opacity 0.05] [--each] [--hide <css>]
//     [--out <dir>] [--timeout 120000]
//
// Example, the landing's stack story:
//   node skills/gt-verify/scripts/stress.mjs http://localhost:3001/en-US \
//     --copy ".v0-stack-beat" --story "#platform" --hash platform --theme dark
//
// Widths under 768 load as a phone (isMobile and hasTouch) and scroll with
// window.scrollTo; wider viewports scroll with the mouse wheel. The output
// folder (--out, default <tmpdir>/gt-verify/stress; pass a scratch folder)
// holds REPORT.md, results.json, the JPEG captures and index.html, a sheet
// of every capture by viewport and phase. Exit codes: 0 when every check held; 1 on a step with no visible
// copy, a layout shift over 0.001 outside the zoom phase, a page error, a
// story state the zoom round trip changed or a throttled state that differs;
// 2 when the page could not be loaded.
//
// Requires: playwright-core (in a Prototemplate checkout) and Chrome for Testing
// or the ms-playwright WebKit build.
// Last real run: 2026-10-06, Prototemplate session workflow runs after authoring
// (a transcript scan on 2026-10-10).

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

const ALL_PHASES = ['first', 'slow', 'fast', 'reverse', 'reload', 'deeplink', 'zoom', 'throttle'];
const engine = takeValue('browser', 'chromium');
const copy = takeValue('copy', '');
const story = takeValue('story', '');
const hash = takeValue('hash', '').replace(/^#/, '');
const viewports = takeValue('viewports', '1440x900,1920x1080,1100x800,868x525,390x844')
  .split(',')
  .map((v) => v.split('x').map(Number))
  .filter(([w, h]) => w > 0 && h > 0);
const theme = takeValue('theme', '');
const steps = Math.max(2, Number(takeValue('steps', '8')) || 8);
const settle = Number(takeValue('settle', '700')) || 700;
const cpu = Math.max(1, Number(takeValue('cpu', '10')) || 10);
const phases = takeValue('phases', ALL_PHASES.join(','))
  .split(',')
  .filter((p) => ALL_PHASES.includes(p));
const [bandTop, bandBottom] = takeValue('band', '0.1,0.9').split(',').map(Number);
const minOpacity = Number(takeValue('min-opacity', '0.05'));
const hide = takeValue('hide', '');
const each = argv.includes('--each');
if (each) argv.splice(argv.indexOf('--each'), 1);
const outDir = resolve(takeValue('out', join(tmpdir(), 'gt-verify', 'stress')));
const timeout = Number(takeValue('timeout', '120000')) || 120000;
const url = argv.find((a) => !a.startsWith('--'));

if (!url || !['chromium', 'webkit'].includes(engine) || viewports.length === 0) {
  console.error('Usage: stress.mjs <url> --copy "<css>" [--story <css>] [--hash <id>] [--viewports WxH,...] [--theme dark|light] [--browser chromium|webkit] [--steps 8] [--settle 700] [--cpu 10] [--phases ...] [--band 0.1,0.9] [--min-opacity 0.05] [--out dir]');
  process.exit(2);
}
if (!copy) console.error('stress: no --copy selector, so the visibility checks are skipped and only captures, shifts and errors are read.');

function loadPlaywright() {
  const bases = [join(process.cwd(), 'package.json'), join(process.cwd(), 'scripts', 'package.json')];
  for (const base of bases) {
    try {
      return createRequire(base)('playwright-core');
    } catch {
      // try the next base
    }
  }
  console.error('stress: playwright-core is not installed in this checkout. Run the script from Prototemplate, or add playwright-core as a dev dependency.');
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

// Installed before every document: the theme seed, a requestAnimationFrame
// ledger and a layout-shift observer. Kept free of outer references because
// Playwright serialises it.
function ledger({ theme, hide }) {
  if (hide) {
    const style = document.createElement('style');
    style.textContent = `${hide} { display: none !important; }`;
    const add = () => (document.head || document.documentElement).appendChild(style);
    if (document.documentElement) add();
    else document.addEventListener('DOMContentLoaded', add);
  }
  try {
    if (theme) {
      localStorage.setItem('gt-theme', theme);
      localStorage.setItem('theme', theme);
    }
  } catch {
    // storage blocked on this origin
  }
  const store = { frames: [], shifts: [] };
  window.__gtv = store;
  const tick = (t) => {
    store.frames.push(t);
    if (store.frames.length > 40000) store.frames.splice(0, 20000);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const describe = (el) => {
    if (!el || !el.tagName) return el && el.nodeName ? el.nodeName.toLowerCase() : '';
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls.map((c) => `.${c}`).join('')}`;
  };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        store.shifts.push({
          t: e.startTime,
          value: e.value,
          sources: (e.sources || []).slice(0, 3).map((s) => {
            const a = s.previousRect;
            const b = s.currentRect;
            const moves = [['x', a.x, b.x], ['y', a.y, b.y], ['w', a.width, b.width], ['h', a.height, b.height]]
              .filter(([, from, to]) => Math.round(from) !== Math.round(to))
              .map(([k, from, to]) => `${k} ${Math.round(from)} to ${Math.round(to)}`);
            return `${describe(s.node)} ${moves.join(', ') || 'moved under 1px'}`;
          }),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {
    // layout-shift entries are Chromium only
  }
}

// Reads the copy elements whose centre sits in the viewport band.
function readCopy({ copy, bandTop, bandBottom, minOpacity, each }) {
  const out = { inBand: 0, visible: 0, hidden: [], failed: false, states: [], scrollY: Math.round(window.scrollY) };
  if (!copy) return out;
  const describe = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls.map((c) => `.${c}`).join('')}`;
  };
  const top = window.innerHeight * bandTop;
  const bottom = window.innerHeight * bandBottom;
  [...document.querySelectorAll(copy)].forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const centre = r.top + r.height / 2;
    if (centre < top || centre > bottom) return;
    let opacity = 1;
    let hidden = false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      opacity *= Number(cs.opacity);
      if (cs.visibility === 'hidden' || cs.display === 'none') hidden = true;
    }
    out.inBand += 1;
    let cover = '';
    if (!hidden && opacity >= minOpacity) {
      const cx = Math.min(window.innerWidth - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(window.innerHeight - 1, Math.max(0, centre));
      for (let n = document.elementFromPoint(cx, cy); n && n !== document.body; n = n.parentElement) {
        if (n.contains(el)) break;
        if (getComputedStyle(n).position === 'fixed') {
          cover = describe(n);
          break;
        }
      }
    }
    const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
    let h = 0;
    for (const ch of text) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    const classes = typeof el.className === 'string' ? el.className.trim().split(/\s+/).sort().join(' ') : '';
    out.states.push(`${i}|${Math.round(opacity * 10) / 10}|${hidden ? 'hidden' : 'shown'}|${classes}|${h.toString(36)}|${Math.round(r.top / 8) * 8}`);
    if (hidden || opacity < minOpacity || cover) out.hidden.push({ element: describe(el), index: i, opacity: Math.round(opacity * 1000) / 1000, cover, text: text.slice(0, 50) });
    else out.visible += 1;
  });
  out.failed = out.inBand > 0 && (each ? out.hidden.length > 0 : out.visible === 0);
  return out;
}

function stats(frames) {
  const gaps = [];
  for (let i = 1; i < frames.length; i++) gaps.push(frames[i] - frames[i - 1]);
  if (gaps.length === 0) return { frames: frames.length, median: null, p95: null, max: null };
  const sorted = [...gaps].sort((a, b) => a - b);
  const pick = (q) => Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] * 10) / 10;
  return { frames: frames.length, median: pick(0.5), p95: pick(0.95), max: Math.round(sorted[sorted.length - 1] * 10) / 10 };
}

const pw = loadPlaywright();
const browser = await pw[engine].launch(engine === 'chromium' ? { executablePath: findChrome(), headless: true } : { headless: true });
mkdirSync(outDir, { recursive: true });
const results = [];
let failed = false;

for (const [vw, vh] of viewports) {
  const tag = `${vw}x${vh}`;
  const phone = vw < 768;
  const context = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: 1,
    isMobile: phone,
    hasTouch: phone,
    colorScheme: theme === 'dark' || theme === 'light' ? theme : 'no-preference',
  });
  await context.addInitScript(ledger, { theme, hide });
  const page = await context.newPage();
  const vp = { viewport: tag, phases: [], errors: [] };
  results.push(vp);
  page.on('pageerror', (e) => vp.errors.push(`pageerror: ${String(e.message || e).slice(0, 200)}`));
  page.on('console', (m) => {
    if (m.type() === 'error') vp.errors.push(`console: ${m.text().slice(0, 200)}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) vp.errors.push(`${r.status()} ${r.url().slice(0, 200)}`);
  });

  const shot = async (name, opts = {}) => {
    const file = `${tag}-${name}.jpg`;
    try {
      await page.screenshot({ path: join(outDir, file), type: 'jpeg', quality: 70, ...opts });
      return file;
    } catch {
      return null;
    }
  };
  const now = () => page.evaluate(() => performance.now());
  const check = () => page.evaluate(readCopy, { copy, bandTop, bandBottom, minOpacity, each });
  const gather = (t0) =>
    page.evaluate((t0) => {
      const s = window.__gtv || { frames: [], shifts: [] };
      return { frames: s.frames.filter((t) => t >= t0), shifts: s.shifts.filter((x) => x.t >= t0) };
    }, t0);
  const scrollTo = async (y) => {
    const from = await page.evaluate(() => window.scrollY);
    if (!phone && Math.abs(y - from) > 0) {
      await page.mouse.move(vw / 2, vh / 2);
      await page.mouse.wheel(0, y - from);
      await page.waitForTimeout(120);
      const at = await page.evaluate(() => window.scrollY);
      if (Math.abs(at - y) <= 4) return 'wheel';
    }
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    return 'scrollTo';
  };
  const range = async () =>
    page.evaluate((story) => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const el = story ? document.querySelector(story) : null;
      if (!el) return { start: 0, end: max, found: !story };
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      return { start: Math.max(0, Math.round(top)), end: Math.min(max, Math.max(Math.round(top), Math.round(top + r.height - window.innerHeight))), found: true };
    }, story);
  const finish = async (phase, t0, extra = {}) => {
    const g = await gather(t0);
    const shifts = g.shifts.filter((s) => s.value > 0.001);
    const entry = { phase, ...extra, frameStats: stats(g.frames), shifts };
    vp.phases.push(entry);
    return entry;
  };
  const walk = async (name, from, to, wait) => {
    const out = { checks: [], shots: [], method: new Set() };
    await scrollTo(from);
    await page.waitForTimeout(wait);
    for (let i = 1; i <= steps; i++) {
      const target = Math.round(from + ((to - from) * i) / steps);
      const prev = Math.round(from + ((to - from) * (i - 1)) / steps);
      for (let k = 1; k <= 4; k++) {
        out.method.add(await scrollTo(Math.round(prev + ((target - prev) * k) / 4)));
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(wait);
      const c = await check();
      out.checks.push({ step: i, target, ...c });
      const f = await shot(`${name}-${String(i).padStart(2, '0')}`);
      if (f) out.shots.push(f);
    }
    out.method = [...out.method].join(', ');
    return out;
  };

  try {
    await page.goto(url, { waitUntil: 'commit', timeout });
  } catch (e) {
    console.error(`stress: could not load ${url} at ${tag}: ${String(e.message || e).split('\n')[0]}`);
    await browser.close();
    process.exit(2);
  }

  let r = { start: 0, end: 0, found: true };
  let slowStates = null;

  if (phases.includes('first')) {
    const shots = [];
    let last = 0;
    for (const t of [0, 150, 400, 1000, 2500]) {
      await page.waitForTimeout(t - last);
      last = t;
      const f = await shot(`first-${String(t).padStart(4, '0')}ms`);
      if (f) shots.push(f);
    }
    await page.waitForLoadState('load', { timeout }).catch(() => {});
    await page.waitForTimeout(settle);
    const c = await check();
    await finish('first', 0, { checks: [{ step: 'settled', ...c }], shots });
  } else {
    await page.waitForLoadState('load', { timeout }).catch(() => {});
    await page.waitForTimeout(settle);
  }
  r = await range();
  vp.range = r;
  if (!r.found) vp.errors.push(`story selector ${story} matched nothing; the whole page was walked`);
  const mid = Math.round((r.start + r.end) / 2);

  if (phases.includes('slow')) {
    const t0 = await now();
    const w = await walk('slow', r.start, r.end, settle);
    slowStates = w.checks.map((c) => c.states.join(' ; '));
    await finish('slow', t0, w);
  }

  if (phases.includes('fast')) {
    await scrollTo(r.start);
    await page.waitForTimeout(settle);
    const t0 = await now();
    const checks = [];
    const shots = [];
    for (const [label, y] of [
      ['end', r.end],
      ['middle', mid],
      ['top', r.start],
      ['three-quarters', Math.round(r.start + (r.end - r.start) * 0.75)],
    ]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(100);
      const a = await shot(`fast-${label}-100ms`);
      await page.waitForTimeout(settle);
      checks.push({ step: label, target: y, ...(await check()) });
      const b = await shot(`fast-${label}-settled`);
      shots.push(...[a, b].filter(Boolean));
    }
    await finish('fast', t0, { checks, shots });
  }

  if (phases.includes('reverse')) {
    const t0 = await now();
    const w = await walk('reverse', r.end, r.start, settle);
    await finish('reverse', t0, w);
  }

  if (phases.includes('reload')) {
    await scrollTo(mid);
    await page.waitForTimeout(settle);
    await page.reload({ waitUntil: 'commit', timeout });
    const shots = [];
    let last = 0;
    for (const t of [0, 150, 400, 1000]) {
      await page.waitForTimeout(t - last);
      last = t;
      const f = await shot(`reload-${String(t).padStart(4, '0')}ms`);
      if (f) shots.push(f);
    }
    await page.waitForLoadState('load', { timeout }).catch(() => {});
    await page.waitForTimeout(settle);
    const c = await check();
    shots.push(await shot('reload-settled'));
    await finish('reload', 0, { checks: [{ step: 'settled', target: mid, ...c }], shots: shots.filter(Boolean), restoredTo: c.scrollY, leftAt: mid });
  }

  if (phases.includes('deeplink') && hash) {
    const link = `${url.split('#')[0]}#${hash}`;
    await page.goto(link, { waitUntil: 'commit', timeout });
    await page.waitForTimeout(400);
    const a = await shot('deeplink-0400ms');
    await page.waitForLoadState('load', { timeout }).catch(() => {});
    await page.waitForTimeout(settle);
    const c = await check();
    const b = await shot('deeplink-settled');
    await finish('deeplink', 0, { checks: [{ step: 'settled', ...c }], shots: [a, b].filter(Boolean), link });
    await page.goto(url, { waitUntil: 'load', timeout });
    await page.waitForTimeout(settle);
  }

  if (phases.includes('zoom') && phone) vp.errors.push('zoom skipped: browser zoom applies to desktop viewports');
  if (phases.includes('zoom') && !phone) {
    await scrollTo(mid);
    await page.waitForTimeout(settle);
    const before = await check();
    const t0 = await now();
    await page.setViewportSize({ width: vw * 4, height: vh * 4 });
    await page.waitForTimeout(settle);
    const a = await shot('zoom-out', { quality: 50 });
    await page.setViewportSize({ width: vw, height: vh });
    await page.waitForTimeout(settle);
    const returned = await page.evaluate(() => Math.round(window.scrollY));
    const b = await shot('zoom-back');
    await scrollTo(mid);
    await page.waitForTimeout(settle);
    const after = await check();
    const c = await shot('zoom-back-same-position');
    const same = before.states.join(' ; ') === after.states.join(' ; ');
    await finish('zoom', t0, { checks: [{ step: 'back', ...after }], shots: [a, b, c].filter(Boolean), sameAsBefore: same, before: before.states, after: after.states, scrollBefore: before.scrollY, scrollReturned: returned });
  }

  if (phases.includes('throttle')) {
    if (engine !== 'chromium') vp.errors.push('throttle skipped: CPU throttling needs Chromium');
    else {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
      const t0 = await now();
      const w = await walk('throttle', r.start, r.end, settle * Math.min(cpu, 4));
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      const states = w.checks.map((c) => c.states.join(' ; '));
      const diff = slowStates ? states.map((s, i) => (s === slowStates[i] ? null : { step: i + 1, throttled: s, normal: slowStates[i] })).filter(Boolean) : null;
      await finish('throttle', t0, { ...w, rate: cpu, differsFromSlow: diff });
    }
  }

  await context.close();
}
await browser.close();

// Folds the readings into a verdict and the report.
const lines = [`# Stress run`, '', `${url}, ${engine}, theme ${theme || 'unseeded'}, copy \`${copy || 'none'}\`${story ? `, story \`${story}\`` : ''}${hash ? `, deep link #${hash}` : ''}, ${steps} steps, settle ${settle} ms.`, ''];
const summary = [];
for (const vp of results) {
  lines.push(`## ${vp.viewport}`, '', `Story range: scrollY ${vp.range?.start ?? 0} to ${vp.range?.end ?? 0}.`, '');
  lines.push(`| Phase | Checks | ${each ? 'Hidden copy' : 'Steps with no visible copy'} | Layout shifts over 0.001 | Frames (median, p95, max ms) | Notes |`, '| --- | --- | --- | --- | --- | --- |');
  for (const p of vp.phases) {
    const checks = p.checks ?? [];
    const hidden = checks
      .filter((c) => c.failed)
      .flatMap((c) => (each ? c.hidden.map((h) => `step ${c.step}: ${h.element} #${h.index} ${h.cover ? `under ${h.cover}` : `at opacity ${h.opacity}`}`) : [`step ${c.step}: ${c.inBand} in the band, none visible (${c.hidden.map((h) => `#${h.index} ${h.cover ? `under ${h.cover}` : h.opacity}`).join(', ')})`]));
    const notes = [];
    if (p.method) notes.push(`scrolled by ${p.method}`);
    if (p.phase === 'reload') notes.push(`left at ${p.leftAt}, restored to ${p.restoredTo}`);
    if (p.phase === 'zoom') notes.push(`${p.sameAsBefore ? 'copy state at the same position equal before and after' : 'copy state at the same position changed by the zoom round trip'}; scrollY ${p.scrollBefore} came back as ${p.scrollReturned}`);
    if (p.phase === 'throttle') notes.push(p.differsFromSlow === null ? `${p.rate}x, no slow walk to compare` : p.differsFromSlow.length ? `${p.rate}x, ${p.differsFromSlow.length} settled states differ from the slow walk` : `${p.rate}x, settled states equal the slow walk (frame-starved only)`);
    const empty = checks.filter((c) => c.inBand === 0).length;
    if (empty) notes.push(`${empty} ${empty === 1 ? 'step' : 'steps'} with no copy in the band`);
    const fs = p.frameStats;
    lines.push(`| ${p.phase} | ${checks.length} | ${hidden.length ? hidden.join('<br>') : 'none'} | ${engine !== 'chromium' ? 'not measured in WebKit' : p.shifts.length ? p.shifts.map((s) => `${s.value.toFixed(4)}: ${s.sources.join('; ')}`).join('<br>') : 'none'} | ${fs.median ?? '-'}, ${fs.p95 ?? '-'}, ${fs.max ?? '-'} | ${notes.join('; ')} |`);
    const shiftFail = p.phase !== 'zoom' && p.shifts.length > 0;
    const throttleFail = p.phase === 'throttle' && p.differsFromSlow && p.differsFromSlow.length > 0;
    const zoomFail = p.phase === 'zoom' && !p.sameAsBefore;
    if (hidden.length || shiftFail || throttleFail || zoomFail) {
      failed = true;
      summary.push(`${vp.viewport} ${p.phase}: ${[hidden.length ? `${hidden.length} ${each ? 'hidden copy' : 'steps with no visible copy'}` : '', shiftFail ? `${p.shifts.length} layout shifts` : '', zoomFail ? 'story state changed by the zoom round trip' : '', throttleFail ? `${p.differsFromSlow.length} throttled states differ` : ''].filter(Boolean).join(', ')}`);
    }
  }
  const pageErrors = vp.errors.filter((e) => e.startsWith('pageerror'));
  if (pageErrors.length) {
    failed = true;
    summary.push(`${vp.viewport}: ${pageErrors.length} page errors`);
  }
  for (const p of vp.phases.filter((x) => x.phase === 'zoom' && !x.sameAsBefore)) {
    lines.push('', 'Copy state before and after the zoom round trip (index|opacity|shown|classes|text hash|top):', '');
    lines.push(`- before: \`${p.before.join(' ; ') || 'no copy'}\``, `- after: \`${p.after.join(' ; ') || 'no copy'}\``);
  }
  for (const p of vp.phases.filter((x) => x.phase === 'throttle' && x.differsFromSlow?.length)) {
    lines.push('', 'Throttled states that differ from the slow walk:', '');
    for (const d of p.differsFromSlow) lines.push(`- step ${d.step}: throttled \`${d.throttled || 'no copy'}\`, normal \`${d.normal || 'no copy'}\``);
  }
  if (vp.errors.length) {
    lines.push('', 'Errors, failed responses and skipped phases:', '');
    for (const e of [...new Set(vp.errors)].slice(0, 30)) lines.push(`- ${e}`);
  }
  lines.push('');
}
lines.push('## Verdict', '', failed ? summary.map((s) => `- ${s}`).join('\n') : 'Every check held. Read the captures in index.html before calling the story done: the first frames, the 100 ms captures after each jump and the reload frames are judged by eye.', '');
writeFileSync(join(outDir, 'REPORT.md'), lines.join('\n'));
writeFileSync(join(outDir, 'results.json'), JSON.stringify(results, null, 2));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const sheet = [
  '<!doctype html><meta charset="utf-8"><title>Stress captures</title>',
  '<style>body{font:13px/1.4 system-ui;margin:24px;background:#111;color:#eee}h2{margin:32px 0 8px}h3{margin:16px 0 6px;color:#aaa}div{display:flex;flex-wrap:wrap;gap:8px}figure{margin:0;width:240px}img{width:240px;border:1px solid #333}figcaption{color:#aaa}</style>',
  `<h1>${esc(url)}</h1>`,
];
for (const vp of results) {
  sheet.push(`<h2>${vp.viewport}</h2>`);
  for (const p of vp.phases) {
    if (!p.shots?.length) continue;
    sheet.push(`<h3>${p.phase}</h3><div>`);
    for (const f of p.shots) sheet.push(`<figure><a href="${esc(f)}"><img src="${esc(f)}" loading="lazy"></a><figcaption>${esc(f.replace(`${vp.viewport}-`, '').replace('.jpg', ''))}</figcaption></figure>`);
    sheet.push('</div>');
  }
}
writeFileSync(join(outDir, 'index.html'), sheet.join('\n'));

console.log(failed ? `stress: defects found\n${summary.map((s) => `  ${s}`).join('\n')}` : 'stress: every check held; read the captures before calling it done');
console.log(`report: ${join(outDir, 'REPORT.md')}\nsheet:  ${join(outDir, 'index.html')}`);
process.exit(failed ? 1 : 0);
