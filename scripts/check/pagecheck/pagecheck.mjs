// The page check: one line of automatic reads and a capture of the first
// screen per (page, device, theme) cell on the running site, the declared
// interactions with before and after captures, and REPORT.md with the
// defects, the notes, a page by device grid, the presenter's and the
// deck's tables, the pass counts and the run's timing. The system that
// verified the dashboard's plate pages, carried over as a tool of this
// repository.
//
// Usage: pnpm check:pages [--preset quick|full] [--pages id,id]
//   [--viewports name,...] [--themes dark,light] [--base URL] [--jobs N]
//   [--out DIR] [--no-interactions] [--interactions id,id] [--full-shots]
//   [--cls-trace] [--sheets] [--no-warm] [--report-only]
//   [--pages-module path] [--hooks-module path]
// Defaults: the full preset (every device of scripts/lib/site-pages.mjs
// DEVICES in dark, light on three), base PT_BASE or http://localhost:3005, 4 jobs
// (contexts of one browser working through one queue of cells and
// interactions), output under .pagecheck/ at the repo root (ignored by
// git). --preset quick reads eight devices in dark and 1440x900 in light,
// the check a round runs on its touched pages. --viewports names devices
// (a WxH outside the table is a desktop) and reads them in every theme of
// --themes. Exit 1 when any defect is found or an interaction fails, 0
// otherwise; the summary line names the report path.
//
// Before the cells, every route is requested once, one at a time
// (--no-warm skips it), so the dev server compiles it outside the timed
// cells and never compiles two routes at once.
//
// Per cell: a fresh context with the device's viewport, scale and touch
// flags, the theme seeded through the site's pre-boot door and the
// context's color scheme, the vitals observers (context.mjs), console and
// page errors collected against the hooks' allowlist, the dev server's
// indicator hidden. The reads start once the page's ready selector
// (pages.mjs) has matched and the layout has held still for 300ms, at
// most settleMs (default 3000) after that; then one page.evaluate running
// probes.mjs readPage, the site's own reads (hooks.mjs siteReads), the
// judgements split into pass or fail and readings, one JSON line in
// shards/<job>.jsonl and one line on the console. The capture is the
// first screen; a failing cell (or every cell with --full-shots) also gets
// the full page, cut at ten screens. A capture that fails is a note on a
// row that keeps its reads. A cell whose navigation fails is tried once
// more in a fresh context.
//
// --report-only rebuilds REPORT.md from a finished run's files without a
// browser; its pages, devices and themes come from the flags when given
// and otherwise from the rows themselves.
//
// The page list and the site hooks are modules so another site can bring
// its own (--pages-module, --hooks-module); those two paths are the one
// place this tool loads a module by a path it is handed, so dynamic import
// is the only way to do it.
import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from 'playwright-core';

import { BASE_URL, chromePath, HIDE_DEV_UI_CSS, PRESETS, ROOT, device } from '../../lib/site-pages.mjs';
import { runCls } from './cls.mjs';
import { cellContext, collectErrors } from './context.mjs';
import { interactionTasks, runInteraction } from './interactions.mjs';
import { CLS_NOTE, judgeReads, readPage, readVitals, summarizeVitals } from './probes.mjs';
import { SHEET_VIEWPORTS, deviceOrder, foldShards, writeReport, writeSheets } from './report.mjs';
import { helpIfAsked } from '../../lib/help.mjs';

helpIfAsked(import.meta.url);

const DEFAULT_JOBS = 4;
const DEFAULT_SETTLE_MS = 3000;
/** How long the layout must hold still before the reads. */
const QUIET_MS = 300;
/** How long a page may take to show its ready selector on a loaded dev server. */
const READY_TIMEOUT_MS = 90000;
/** A full-page capture stops at this many screens. */
const FULL_SHOT_SCREENS = 10;
const SHOT_TIMEOUT_MS = 60000;

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};
const has = (name) => argv.includes(name);
const list = (name) => flag(name)?.split(',').map((s) => s.trim()).filter(Boolean);

const BASE = (flag('--base') ?? BASE_URL).replace(/\/$/, '');
const OUT = resolve(ROOT, flag('--out') ?? '.pagecheck');
const PRESET = flag('--preset') ?? 'full';
if (!PRESETS[PRESET]) throw new Error(`--preset is ${Object.keys(PRESETS).join(' or ')}, got ${PRESET}`);
const VIEWPORTS = list('--viewports') ?? list('--devices');
const THEMES = list('--themes') ?? ['dark', 'light'];
const JOBS = Math.max(1, Number(flag('--jobs') ?? flag('--shards') ?? DEFAULT_JOBS));
const ONLY = list('--pages');
const WITH_INTERACTIONS = !has('--no-interactions');
const ONLY_INTERACTIONS = list('--interactions');
const WITH_SHEETS = has('--sheets');
const FULL_SHOTS = has('--full-shots');
const CLS_TRACE = has('--cls-trace');
const WARM = !has('--no-warm');
/* rebuild REPORT.md from a finished run's files (shards, interactions, sheets) without opening a browser */
const REPORT_ONLY = has('--report-only');

for (const theme of THEMES) if (theme !== 'dark' && theme !== 'light') throw new Error(`theme must be dark or light, got ${theme}`);
/** The devices each theme is read on: the --viewports list in every theme, else the preset's list for that theme. */
const DEVICES_BY_THEME = Object.fromEntries(THEMES.map((theme) => [theme, (VIEWPORTS ?? PRESETS[PRESET][theme]).map(device)]));

const pagesModule = await import(pathToFileURL(resolve(ROOT, flag('--pages-module') ?? 'scripts/check/pagecheck/pages.mjs')).href);
const hooks = await import(pathToFileURL(resolve(ROOT, flag('--hooks-module') ?? 'scripts/check/pagecheck/hooks.mjs')).href);

const allPages = pagesModule.pages();
const PAGES = ONLY ? allPages.filter((p) => ONLY.includes(p.id)) : allPages;
if (PAGES.length === 0) {
  console.error(`pagecheck: no pages match ${ONLY?.join(',') ?? '(none)'}; known ids: ${allPages.map((p) => p.id).join(', ')}`);
  process.exit(2);
}

const load = () => {
  try {
    return execSync('uptime', { encoding: 'utf8' }).trim().replace(/.*load averages?: /, '');
  } catch {
    return 'unknown';
  }
};

/** The summary line and the exit code, shared by a run and a report rebuild. */
function finish({ rows, interactions, sheets, run, pages, devices, themes }) {
  const { defects, notes, counts } = writeReport({ outDir: OUT, base: BASE, rows, pages, devices, themes, interactions, hooks, sheets, run });
  const passed = Object.values(counts).reduce((n, c) => n + c.pass, 0);
  const failedInteractions = interactions.filter((i) => !i.pass).length;
  const wall = run.wallMs ? ` in ${Math.round(run.wallMs / 1000)}s` : '';
  console.log(
    `check:pages  ${rows.length} cells, ${passed} pass, ${defects.length} defect(s), ${notes.length} note(s), ${interactions.length} interaction run(s) (${failedInteractions} failed)${wall} -> ${join(OUT, 'REPORT.md')}`
  );
  process.exit(defects.length > 0 || failedInteractions > 0 ? 1 : 0);
}

if (REPORT_ONLY) {
  const rows = foldShards(OUT);
  const names = VIEWPORTS ?? [...new Set(rows.map((r) => r.viewport))].sort((a, b) => deviceOrder(a) - deviceOrder(b));
  const themes = list('--themes') ?? [...new Set(rows.map((r) => r.theme))].sort();
  const ids = new Set(rows.map((r) => r.page));
  const known = PAGES.filter((p) => ids.has(p.id));
  const unknown = [...ids].filter((id) => !known.some((p) => p.id === id)).map((id) => ({ id, path: rows.find((r) => r.page === id).path, source: [] }));
  const resultsPath = join(OUT, 'interactions', 'results.json');
  const interactions = existsSync(resultsPath) ? JSON.parse(readFileSync(resultsPath, 'utf8')) : [];
  const sheets = existsSync(OUT) ? readdirSync(OUT).filter((f) => /^sheet-.*\.png$/.test(f)).map((f) => join(OUT, f)) : [];
  const runPath = join(OUT, 'run.json');
  const run = existsSync(runPath) ? { ...JSON.parse(readFileSync(runPath, 'utf8')), rebuilt: true } : { rebuilt: true };
  finish({ rows, interactions, sheets, run, pages: [...known, ...unknown], devices: names.map(device), themes });
}

const startedAt = new Date().toISOString();
const t0 = Date.now();
const loadAtStart = load();
for (const dir of ['shots', 'shards', 'interactions', 'cls']) rmSync(join(OUT, dir), { recursive: true, force: true });
for (const dir of ['shots', 'shards', 'interactions']) mkdirSync(join(OUT, dir), { recursive: true });

/**
 * Requests every route once, one at a time, so the dev server compiles
 * them before the timed cells. One at a time on purpose: first compiles
 * running side by side wrote .next/dev/prerender-manifest.json twice into
 * one file on 2026-10-08 (Next 16.2.12), and every route answered 500
 * until the server was restarted.
 */
async function warm(paths) {
  for (const path of paths) {
    const at = Date.now();
    try {
      const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(180000) });
      await res.arrayBuffer();
      console.log(`warm ${path} ${res.status} ${Date.now() - at}ms`);
    } catch (err) {
      console.log(`warm ${path} failed: ${String(err).slice(0, 120)}`);
    }
  }
}

/** Resolves with the frame (the page's, else a child's) whose ready selector matched with a box. */
async function waitReady(page, selector) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  const boxed = (s) => {
    const b = document.querySelector(s)?.getBoundingClientRect();
    return Boolean(b) && b.width > 0 && b.height > 0;
  };
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (await frame.evaluate(boxed, selector).catch(() => false)) return frame;
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`ready selector ${selector} never matched`);
}

/** Waits until the layout (the document's size, the h1, the landmarks, the ready element) holds still for QUIET_MS, or until capMs. */
async function waitQuiet(page, frame, selector, capMs) {
  const end = Date.now() + capMs;
  const marks = Object.values(hooks.LANDMARKS);
  const signature = async () => {
    const main = await page.evaluate((list) => {
      const box = (el) => {
        const b = el?.getBoundingClientRect();
        return b ? [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] : null;
      };
      const doc = document.documentElement;
      return JSON.stringify([doc.scrollWidth, doc.scrollHeight, box(document.querySelector('h1')), ...list.map((s) => box(document.querySelector(s)))]);
    }, marks);
    const own = await frame.evaluate((s) => JSON.stringify(document.querySelector(s)?.getBoundingClientRect() ?? null), selector).catch(() => '');
    return main + own;
  };
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  let last = await signature();
  let since = Date.now();
  while (Date.now() < end) {
    await page.waitForTimeout(100);
    const now = await signature();
    if (now !== last) {
      last = now;
      since = Date.now();
    } else if (Date.now() - since >= QUIET_MS) return Date.now() - (end - capMs);
  }
  return capMs;
}

/** Loads a page into a context and waits until it is ready to read; returns the load status and how long the settle took. */
async function openPage(page, item) {
  const response = await page.goto(`${BASE}${item.path}`, { waitUntil: 'load', timeout: 120000 });
  const status = response?.status() ?? 0;
  if (status >= 400) throw new Error(`HTTP ${status}`);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
  if (item.hide?.length) await page.addStyleTag({ content: `${item.hide.join(', ')} { display: none !important; }` });
  const selector = item.ready ?? 'body';
  const frame = await waitReady(page, selector);
  const settledMs = await waitQuiet(page, frame, selector, item.settleMs ?? DEFAULT_SETTLE_MS);
  return { status, settledMs };
}

/** True for a failure of the browser or the network rather than of the page: worth one more try. */
const retryable = (err) => /ERR_ABORTED|ERR_CONNECTION|has been closed|Target closed|net::|page\.goto: Timeout/i.test(String(err));

/** One cell: load, read, judge, capture; never throws (an error is a row). */
async function runCell(item, d, theme, attempt = 1) {
  const cell = { page: item.id, path: item.path, viewport: d.name, w: d.w, h: d.h, kind: d.kind, theme };
  const started = Date.now();
  const context = await cellContext(browser, { device: d, theme });
  const page = await context.newPage();
  const errors = collectErrors(page);
  let row = { ...cell };
  try {
    const { status, settledMs } = await openPage(page, item);
    const reads = await page.evaluate(readPage, { touch: d.kind !== 'desktop', w: d.w, h: d.h, skip: [...hooks.SKIP, ...(item.hide ?? [])], landmarks: hooks.LANDMARKS, tapScope: hooks.TAP_SCOPE });
    const site = await hooks.siteReads(page, cell, item);
    const vitals = summarizeVitals(await page.evaluate(readVitals));
    const kept = errors.filter((e) => !hooks.CONSOLE_ALLOW.test(e));
    const generic = judgeReads(reads, cell, kept, vitals);
    const own = hooks.judge(reads, site, cell, item);
    const failed = [...Object.values(generic.judge), ...Object.values(own.judge)].includes(false);
    const stem = `${item.id}-${d.name}-${theme}`;
    const shots = { shot: `shots/${stem}.png` };
    try {
      await page.screenshot({ path: join(OUT, shots.shot), timeout: SHOT_TIMEOUT_MS });
      if (failed || FULL_SHOTS) {
        const height = Math.min(reads.scrollHeight, d.h * FULL_SHOT_SCREENS);
        shots.full = `shots/${stem}-full.png`;
        await page.screenshot({ path: join(OUT, shots.full), fullPage: true, clip: { x: 0, y: 0, width: d.w, height }, timeout: SHOT_TIMEOUT_MS });
      }
    } catch (err) {
      shots.shotError = String(err).split('\n')[0].slice(0, 200);
    }
    row = {
      ...row,
      status,
      ms: Date.now() - started,
      settledMs,
      ...shots,
      consoleErrors: kept,
      knownConsole: errors.length - kept.length,
      reads,
      site,
      vitals,
      judge: generic.judge,
      info: generic.info,
      siteJudge: own.judge,
      siteInfo: own.info,
    };
  } catch (err) {
    row = { ...row, ms: Date.now() - started, error: String(err).slice(0, 400), consoleErrors: errors };
  }
  await context.close().catch(() => {});
  if (row.error && attempt === 1 && retryable(row.error)) {
    console.log(`retry ${item.id} ${d.name} ${theme}: ${row.error.split('\n')[0].slice(0, 120)}`);
    return runCell(item, d, theme, 2);
  }
  return attempt > 1 ? { ...row, retried: true } : row;
}

if (WARM) await warm([...new Set(PAGES.map((p) => p.path))]);
const warmMs = Date.now() - t0;

const browser = await chromium.launch({ executablePath: chromePath(), headless: true });

/* one queue: every cell, then every interaction run, worked through by JOBS contexts at a time */
const tasks = [];
for (const theme of THEMES) {
  for (const d of DEVICES_BY_THEME[theme]) {
    for (const item of PAGES) {
      if (item.kinds && !item.kinds.includes(d.kind)) continue;
      tasks.push({ kind: 'cell', item, device: d, theme });
    }
  }
}
const runDevices = DEVICES_BY_THEME.dark ?? Object.values(DEVICES_BY_THEME)[0];
if (WITH_INTERACTIONS) {
  for (const t of interactionTasks({ pages: PAGES, devices: runDevices, only: ONLY_INTERACTIONS, log: (line) => console.log(line) })) tasks.push({ kind: 'interaction', ...t });
}

const interactions = [];
const resultsPath = join(OUT, 'interactions', 'results.json');
let next = 0;
async function worker(n) {
  const out = join(OUT, 'shards', `${n}.jsonl`);
  writeFileSync(out, '');
  while (next < tasks.length) {
    const task = tasks[next++];
    if (task.kind === 'cell') {
      const row = await runCell(task.item, task.device, task.theme);
      appendFileSync(out, JSON.stringify(row) + '\n');
      const fails = Object.entries({ ...row.judge, ...row.siteJudge })
        .filter(([, v]) => v === false)
        .map(([k]) => k);
      console.log(`job${n} ${task.item.id} ${task.device.name} ${task.theme} ${row.error ? 'ERROR ' + row.error.split('\n')[0] : fails.length ? 'FAIL ' + fails.join(',') : 'ok'} ${row.ms}ms`);
    } else {
      const row = await runInteraction(browser, { base: BASE, outDir: join(OUT, 'interactions'), open: openPage, hooks, ...task });
      interactions.push(row);
      writeFileSync(resultsPath, JSON.stringify(interactions, null, 1));
      console.log(`job${n} interaction ${row.id} ${row.page} ${row.viewport} ${row.pass ? 'pass' : 'FAIL'}${row.error ? ' ' + row.error.split('\n')[0] : ''} ${row.ms}ms`);
    }
  }
}
await Promise.all(Array.from({ length: Math.min(JOBS, tasks.length) }, (_, i) => worker(i + 1)));
interactions.sort((a, b) => a.id.localeCompare(b.id) || a.page.localeCompare(b.page) || deviceOrder(a.viewport) - deviceOrder(b.viewport));
writeFileSync(resultsPath, JSON.stringify(interactions, null, 1));

const rows = foldShards(OUT);

/* --cls-trace: the 50ms box samples behind every dark cell whose layout shift reached a note */
if (CLS_TRACE) {
  mkdirSync(join(OUT, 'cls'), { recursive: true });
  for (const r of rows.filter((x) => x.theme === 'dark' && (x.vitals?.cls ?? 0) > CLS_NOTE)) {
    const item = PAGES.find((p) => p.id === r.page);
    const trace = await runCls(browser, { base: BASE, item, device: device(r.viewport), theme: 'dark', outDir: join(OUT, 'cls'), landmarks: hooks.LANDMARKS });
    console.log(`cls-trace ${r.page} ${r.viewport} ${trace.error ? 'ERROR ' + trace.error : `${trace.count} shifts, max ${trace.max}`}`);
  }
}

const sheets = WITH_SHEETS ? await writeSheets(browser, { outDir: OUT, pages: PAGES, viewports: runDevices.map((d) => d.name).filter((n) => SHEET_VIEWPORTS.includes(n)) }) : [];

await browser.close();

const run = { startedAt, wallMs: Date.now() - t0, warmMs, jobs: JOBS, preset: VIEWPORTS ? 'custom' : PRESET, loadAtStart, loadAtEnd: load() };
writeFileSync(join(OUT, 'run.json'), JSON.stringify(run, null, 1));
const devices = [...new Map(Object.values(DEVICES_BY_THEME).flat().map((d) => [d.name, d])).values()].sort((a, b) => deviceOrder(a.name) - deviceOrder(b.name));
finish({ rows, interactions, sheets, run, pages: PAGES, devices, themes: THEMES });
