// The page check: one full-page capture and one line of automatic reads
// per (page, viewport, theme) cell on the running site, a layout-shift run
// per page at four viewports, the declared interactions with before and
// after captures, and REPORT.md with the defects, the notes, the pass
// counts and the contact sheets. The system that verified the dashboard's
// plate pages, carried over as a tool of this repository.
//
// Usage: pnpm check:pages [--base URL] [--pages id,id] [--viewports WxH,...]
//   [--themes dark,light] [--shards N] [--out DIR] [--no-cls]
//   [--no-interactions] [--sheets] [--report-only] [--pages-module path]
//   [--hooks-module path]
// Defaults: base http://localhost:3005, the ten viewports (360x800,
// 390x844, 430x932, 768x1024, 1024x768, 1280x720, 1440x900, 1527x814,
// 1920x1080, 2560x1440), both themes, 3 shards of pages running in
// parallel contexts of one browser, output under .pagecheck/ at the repo
// root (ignored by git). Exit 1 when any defect is found, 0 otherwise; the
// summary line names the report path.
//
// Per cell: a fresh context with the viewport (phones get isMobile,
// hasTouch and a device scale of 2), the theme seeded through the site's
// pre-boot door and the context's color scheme, console and page errors
// collected against the hooks' allowlist, the dev server's indicator
// hidden, the page's settle, one page.evaluate running probes.mjs
// readPage, the site's own reads (hooks.mjs siteReads), the judgements
// split into pass or fail and readings, a full-page PNG under shots/, one
// JSON line in shards/<n>.jsonl and one line on the console.
//
// --report-only rebuilds REPORT.md from a finished run's files without a
// browser; its pages, viewports and themes come from the flags when given
// and otherwise from the rows themselves, so a slice run's report rebuilds
// with that slice's counts.
//
// The page list and the site hooks are modules so another site can bring
// its own (--pages-module, --hooks-module); those two paths are the one
// place this tool loads a module by a path it is handed, so dynamic import
// is the only way to do it.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from 'playwright-core';

import { CHROME_PATH, HIDE_DEV_UI_CSS, ROOT } from '../site-pages.mjs';
import { runCls } from './cls.mjs';
import { cellContext, collectErrors, isPhone, parseViewport } from './context.mjs';
import { runInteractions } from './interactions.mjs';
import { judgeReads, readPage } from './probes.mjs';
import { SHEET_VIEWPORTS, foldShards, viewportOrder, writeReport, writeSheets } from './report.mjs';

const DEFAULT_VIEWPORTS = ['360x800', '390x844', '430x932', '768x1024', '1024x768', '1280x720', '1440x900', '1527x814', '1920x1080', '2560x1440'];
const DEFAULT_THEMES = ['dark', 'light'];
const DEFAULT_SHARDS = 3;
const DEFAULT_SETTLE_MS = 3000;

/** The layout-shift run's viewports (dark only). */
const CLS_VIEWPORTS = ['390x844', '1024x768', '1440x900', '1920x1080'];

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};
const has = (name) => argv.includes(name);
const list = (name) => flag(name)?.split(',').map((s) => s.trim()).filter(Boolean);

const BASE = (flag('--base') ?? 'http://localhost:3005').replace(/\/$/, '');
const OUT = resolve(ROOT, flag('--out') ?? '.pagecheck');
const VIEWPORTS = list('--viewports') ?? DEFAULT_VIEWPORTS;
const THEMES = list('--themes') ?? DEFAULT_THEMES;
const SHARDS = Math.max(1, Number(flag('--shards') ?? DEFAULT_SHARDS));
const ONLY = list('--pages');
const WITH_CLS = !has('--no-cls');
const WITH_INTERACTIONS = !has('--no-interactions');
const WITH_SHEETS = has('--sheets');
/* rebuild REPORT.md from a finished run's files (shards, cls, interactions, sheets) without opening a browser */
const REPORT_ONLY = has('--report-only');

for (const vp of VIEWPORTS) parseViewport(vp);
for (const theme of THEMES) if (theme !== 'dark' && theme !== 'light') throw new Error(`theme must be dark or light, got ${theme}`);

const pagesModule = await import(pathToFileURL(resolve(ROOT, flag('--pages-module') ?? 'scripts/pagecheck/pages.mjs')).href);
const hooks = await import(pathToFileURL(resolve(ROOT, flag('--hooks-module') ?? 'scripts/pagecheck/hooks.mjs')).href);

const allPages = pagesModule.pages();
const PAGES = ONLY ? allPages.filter((p) => ONLY.includes(p.id)) : allPages;
if (PAGES.length === 0) {
  console.error(`pagecheck: no pages match ${ONLY?.join(',') ?? '(none)'}; known ids: ${allPages.map((p) => p.id).join(', ')}`);
  process.exit(2);
}

/** The summary line and the exit code, shared by a run and a report rebuild. */
function finish({ rows, cls, interactions, sheets, startedAt, pages, viewports, themes }) {
  const { defects, notes, counts } = writeReport({ outDir: OUT, base: BASE, rows, pages, viewports, themes, cls, interactions, hooks, sheets, startedAt });
  const passed = Object.values(counts).reduce((n, c) => n + c.pass, 0);
  const failedInteractions = interactions.filter((i) => !i.pass).length;
  console.log(
    `check:pages  ${rows.length} cells, ${passed} pass, ${defects.length} defect(s), ${notes.length} note(s), ${interactions.length} interaction run(s) (${failedInteractions} failed), ${cls.length} layout-shift run(s) -> ${join(OUT, 'REPORT.md')}`
  );
  process.exit(defects.length > 0 || failedInteractions > 0 ? 1 : 0);
}

if (REPORT_ONLY) {
  const rows = foldShards(OUT);
  /* the flags when given, else what the rows hold */
  const viewports = list('--viewports') ?? [...new Set(rows.map((r) => r.viewport))].sort((a, b) => viewportOrder(a) - viewportOrder(b));
  const themes = list('--themes') ?? [...new Set(rows.map((r) => r.theme))].sort();
  const ids = new Set(rows.map((r) => r.page));
  const known = PAGES.filter((p) => ids.has(p.id));
  const unknown = [...ids].filter((id) => !known.some((p) => p.id === id)).map((id) => ({ id, path: rows.find((r) => r.page === id).path, source: [] }));
  const clsDir = join(OUT, 'cls');
  const cls = existsSync(clsDir)
    ? readdirSync(clsDir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => JSON.parse(readFileSync(join(clsDir, f), 'utf8')))
        .sort((a, b) => a.id.localeCompare(b.id) || a.viewport.localeCompare(b.viewport))
    : [];
  const resultsPath = join(OUT, 'interactions', 'results.json');
  const interactions = existsSync(resultsPath) ? JSON.parse(readFileSync(resultsPath, 'utf8')) : [];
  const sheets = existsSync(OUT) ? readdirSync(OUT).filter((f) => /^sheet-.*\.png$/.test(f)).map((f) => join(OUT, f)) : [];
  finish({ rows, cls, interactions, sheets, startedAt: 'rebuilt from the files of the last run', pages: [...known, ...unknown], viewports, themes });
}

const startedAt = new Date().toISOString();
rmSync(join(OUT, 'shards'), { recursive: true, force: true });
for (const dir of ['shots', 'shards', 'cls', 'interactions']) mkdirSync(join(OUT, dir), { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });

/** One cell: load, read, judge, capture; never throws (an error is a row). */
async function runCell(item, vp, theme) {
  const { w, h } = parseViewport(vp);
  const phone = isPhone(w);
  const cell = { page: item.id, path: item.path, viewport: vp, w, h, theme, phone };
  const t0 = Date.now();
  const context = await cellContext(browser, { w, h, theme });
  const page = await context.newPage();
  const errors = collectErrors(page);
  let row = { ...cell };
  try {
    const response = await page.goto(`${BASE}${item.path}`, { waitUntil: 'load', timeout: 120000 });
    const status = response?.status() ?? 0;
    if (status >= 400) throw new Error(`HTTP ${status}`);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
    if (item.hide?.length) await page.addStyleTag({ content: `${item.hide.join(', ')} { display: none !important; }` });
    await page.waitForTimeout(item.settleMs ?? DEFAULT_SETTLE_MS);
    const reads = await page.evaluate(readPage, { phone, w, h, skip: [...hooks.SKIP, ...(item.hide ?? [])], landmarks: hooks.LANDMARKS, tapScope: hooks.TAP_SCOPE });
    const site = await hooks.siteReads(page, cell, item);
    const shot = join(OUT, 'shots', `${item.id}-${vp}-${theme}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    const kept = errors.filter((e) => !hooks.CONSOLE_ALLOW.test(e));
    const generic = judgeReads(reads, cell, kept);
    const own = hooks.judge(reads, site, cell, item);
    row = {
      ...row,
      status,
      ms: Date.now() - t0,
      shot: `shots/${item.id}-${vp}-${theme}.png`,
      consoleErrors: kept,
      knownConsole: errors.length - kept.length,
      reads,
      site,
      judge: generic.judge,
      info: generic.info,
      siteJudge: own.judge,
      siteInfo: own.info,
    };
  } catch (err) {
    row = { ...row, ms: Date.now() - t0, error: String(err).slice(0, 400), consoleErrors: errors };
  }
  await context.close();
  return row;
}

/** Pages are dealt round robin into the shards; each shard walks its pages through every viewport and theme. */
async function runShard(n, items) {
  const out = join(OUT, 'shards', `${n}.jsonl`);
  writeFileSync(out, '');
  for (const vp of VIEWPORTS) {
    const { w } = parseViewport(vp);
    for (const theme of THEMES) {
      for (const item of items) {
        if (item.phoneOnly && !isPhone(w)) continue;
        if (item.desktopOnly && isPhone(w)) continue;
        const row = await runCell(item, vp, theme);
        appendFileSync(out, JSON.stringify(row) + '\n');
        const fails = Object.entries({ ...row.judge, ...row.siteJudge })
          .filter(([, v]) => v === false)
          .map(([k]) => k);
        console.log(`shard${n} ${item.id} ${vp} ${theme} ${row.error ? 'ERROR ' + row.error : fails.length ? 'FAIL ' + fails.join(',') : 'ok'} ${row.ms}ms`);
      }
    }
  }
}

const shards = Array.from({ length: Math.min(SHARDS, PAGES.length) }, () => []);
PAGES.forEach((p, i) => shards[i % shards.length].push(p));
await Promise.all(shards.map((items, i) => runShard(i + 1, items)));

const rows = foldShards(OUT);

/* the layout-shift runs: every page at four viewports in dark, three at a time */
const cls = [];
if (WITH_CLS) {
  const jobs = [];
  for (const vp of CLS_VIEWPORTS) for (const item of PAGES) jobs.push({ item, viewport: parseViewport(vp) });
  const lanes = Array.from({ length: Math.min(SHARDS, jobs.length) }, () => []);
  jobs.forEach((j, i) => lanes[i % lanes.length].push(j));
  await Promise.all(
    lanes.map(async (lane) => {
      for (const { item, viewport } of lane) {
        const r = await runCls(browser, { base: BASE, item, viewport, theme: 'dark', outDir: join(OUT, 'cls'), landmarks: hooks.LANDMARKS });
        cls.push(r);
        console.log(`cls ${item.id} ${r.viewport} ${r.error ? 'ERROR ' + r.error : `${r.count} shifts, max ${r.max}, over 0.001: ${r.over001.length}`}`);
      }
    })
  );
  cls.sort((a, b) => a.id.localeCompare(b.id) || a.viewport.localeCompare(b.viewport));
}

const interactions = WITH_INTERACTIONS ? await runInteractions(browser, { base: BASE, pages: PAGES, outDir: join(OUT, 'interactions'), log: (line) => console.log(line) }) : [];

const sheets = WITH_SHEETS ? await writeSheets(browser, { outDir: OUT, pages: PAGES, viewports: VIEWPORTS.filter((vp) => SHEET_VIEWPORTS.includes(vp)) }) : [];

await browser.close();

finish({ rows, cls, interactions, sheets, startedAt, pages: PAGES, viewports: VIEWPORTS, themes: THEMES });
