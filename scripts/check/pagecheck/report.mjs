// Folds the shard files into cells.jsonl and writes REPORT.md and the
// contact sheets. The report carries, in this order: the run's line (wall
// time, jobs, preset, machine load at the start and the end), the defects
// table (page, device, theme, what, where in the code as file:line when
// the hooks can place it, the proposed fix), the notes table (40 to 43px
// tap targets, a tablet's small targets, ellipsis truncations, layout
// shifts over 0.05, console messages the allowlist absorbed, failed
// captures), the page by device grid with each cell's time, the pass
// counts per device, the site invariants' readings per device across
// pages, the layout shifts and paints, the interactions, the presenter's
// slide by device table, the deck's slides and the contact sheets.
//
// A defect is a failed check on a cell: horizontal overflow, a box past
// the viewport edge, text clipped mid-word, a console error outside the
// allowlist, the theme not applied, a tap target under 40px on a phone, a
// layout shift score over 0.1, or a site invariant that did not hold.
// Rows that say the same thing about one page are folded across devices
// and themes into one row naming where it was seen. A tap target is one
// row per element and page, keyed on the element and its text, with every
// box it was read at listed, so a link that wraps to two lines at 390 is
// still the same row as its one line at 360. A note is a reading worth a
// look that is not a failure.
//
// The contact sheets are made in the browser: an HTML montage of the dark
// first-screen captures at 390x844, 1440x900 and 1920x1080 (one tile per
// page, its id above it) opened from a file URL in a Playwright page and
// screenshotted, so the repository needs no image library.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { DEVICES } from '../site-pages.mjs';
import { parseErrors } from './context.mjs';
import { CLS_DEFECT, CLS_NOTE, TAP_DEFECT_UNDER, TAP_NOTE_UNDER } from './probes.mjs';

/** The viewports the sheets are made for. */
export const SHEET_VIEWPORTS = ['390x844', '1440x900', '1920x1080'];

/** How many failed paths one console row lists before counting the rest. */
const PATHS_SHOWN = 6;

const table = (rows, cols) =>
  [
    `| ${cols.join(' | ')} |`,
    `| ${cols.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${cols.map((c) => String(r[c] ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`),
  ].join('\n');

const short = (v, n = 160) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > n ? `${s.slice(0, n)}...` : s;
};

/**
 * One sentence for a cell's console errors: the http failures grouped by
 * status (and by the optimizer when /_next/image asked for the file) with
 * their paths, theme suffix dropped so the two themes fold, then the
 * other messages.
 */
function describeConsole(errors) {
  const { http, other } = parseErrors(errors);
  const parts = [];
  const byStatus = new Map();
  for (const h of http) {
    const key = h.via ? `http ${h.status} from ${h.via}` : `http ${h.status}`;
    const set = byStatus.get(key) ?? new Set();
    set.add(h.display);
    byStatus.set(key, set);
  }
  for (const [key, set] of byStatus) {
    const paths = [...set].sort();
    const rest = paths.length > PATHS_SHOWN ? ` (+${paths.length - PATHS_SHOWN} more)` : '';
    parts.push(`${key} for ${paths.length} path(s): ${paths.slice(0, PATHS_SHOWN).join(', ')}${rest}`);
  }
  for (const o of other.slice(0, 2)) parts.push(`console: ${short(o, 160)}`);
  if (other.length > 2) parts.push(`+${other.length - 2} more message(s)`);
  return parts.join('; ');
}

/** What a failed check's detail is, from the cell's reads and infos. */
function detailFor(key, row) {
  switch (key) {
    case 'noOverflow':
      return `scrollWidth ${row.reads.scrollWidth} over innerWidth ${row.reads.innerWidth}; ${short(row.reads.pastEdge, 120)}`;
    case 'noPastEdge':
      return short(row.reads.pastEdge);
    case 'noClippedText':
      return short(row.info.clippedText);
    case 'noConsoleErrors':
      return describeConsole(row.consoleErrors);
    case 'themeApplied':
      return `html[data-theme] reads ${row.reads.theme.data}`;
    case 'noLayoutShift':
      return `score ${row.vitals.cls} over ${CLS_DEFECT}: ${row.vitals.shifts.map((x) => `${x.value} at ${x.t}ms (${x.sources.join(' ')})`).join('; ')}`;
    default:
      return short(row.info[key] ?? row.siteInfo?.[key] ?? '');
  }
}

/** The raw detail the hooks' where() reads an element or a path from. */
function rawDetail(key, row) {
  switch (key) {
    case 'noOverflow':
    case 'noPastEdge':
      return row.reads.pastEdge;
    case 'noClippedText':
      return row.info.clippedText;
    case 'noConsoleErrors':
      return row.consoleErrors;
    default:
      return row.siteInfo?.[key] ?? row.info[key] ?? null;
  }
}

/** Reads every shard under outDir/shards and writes the sorted cells.jsonl. */
export function foldShards(outDir) {
  const dir = join(outDir, 'shards');
  const rows = [];
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.jsonl'))) {
      for (const line of readFileSync(join(dir, f), 'utf8').split('\n')) if (line.trim()) rows.push(JSON.parse(line));
    }
  }
  rows.sort((a, b) => deviceOrder(a.viewport) - deviceOrder(b.viewport) || a.theme.localeCompare(b.theme) || a.page.localeCompare(b.page));
  writeFileSync(join(outDir, 'cells.jsonl'), rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''));
  return rows;
}

/** A sortable number for a device name: its place in DEVICES (phones, tablets, desktops), then any other WxH by width and height. */
export function deviceOrder(name) {
  const at = DEVICES.findIndex((d) => d.name === name);
  if (at >= 0) return at;
  const [w, h] = name.split(/[x@]/).map(Number);
  return DEVICES.length + w * 10000 + h;
}

/**
 * Folds rows that say the same thing about one page across devices and
 * themes into one row naming where it was seen: `all 8 devices`, or the
 * list when it is shorter than that. `cells` counts the (device, theme)
 * cells the row was read on.
 */
function fold(list, viewports, themes) {
  const groups = new Map();
  for (const d of list) {
    const key = JSON.stringify([d.page, d.what, d.file, d.fix]);
    const g = groups.get(key) ?? { ...d, vps: new Set(), themes: new Set(), seen: new Set() };
    g.vps.add(d.viewport);
    g.themes.add(d.theme);
    g.seen.add(`${d.viewport} ${d.theme}`);
    groups.set(key, g);
  }
  const order = (set, all) => all.filter((v) => set.has(v)).concat([...set].filter((v) => !all.includes(v)));
  return [...groups.values()]
    .map((g) => {
      const vps = order(g.vps, viewports);
      const ths = order(g.themes, themes);
      const vpText = vps.length === viewports.length && viewports.length > 1 ? `all ${vps.length} devices` : vps.join(', ');
      const themeText = ths.length === themes.length && themes.length > 1 ? 'both' : ths.join(', ');
      const { vps: _v, themes: _t, seen, ...rest } = g;
      return { ...rest, viewport: vpText, theme: themeText, cells: seen.size };
    })
    .sort((a, b) => a.page.localeCompare(b.page) || a.what.localeCompare(b.what));
}

/** One tap target's row text: its size (a range when the box changed between viewports), its text, its element and every box read. */
function tapWhat(g, label) {
  const min = Math.min(...g.sizes);
  const max = Math.max(...g.sizes);
  const size = min === max ? `${min}px` : `${min} to ${max}px`;
  return `tap target ${size}${label}: ${g.sample.text || g.sample.el} (${g.sample.el}; ${[...g.boxes].join(', ')})`;
}

/**
 * The defects, notes and pass counts from the cells. hooks.where names the
 * file and the fix for a check on a page. Rows are folded across devices
 * and themes (fold above), so one missing file on a page is one row
 * across every cell it was read on; tap targets are grouped per element
 * first, so one control is one row whatever its box read at each width.
 */
export function summarize(rows, viewports, hooks, themes = ['dark', 'light'], pages = []) {
  const defects = [];
  const notes = [];
  const counts = {};
  const seen = new Set();
  const items = new Map(pages.map((p) => [p.id, p]));
  const add = (list, d) => {
    const k = JSON.stringify(d);
    if (!seen.has(k)) {
      seen.add(k);
      list.push(d);
    }
  };
  const taps = new Map();
  const tapNotes = new Map();
  const tabletNotes = new Map();
  const group = (map, r, t) => {
    /* the theme button's glyph flips with the theme; the key drops leading symbols so one control is one row */
    const key = JSON.stringify([r.page, t.el, (t.text ?? '').replace(/^[^\p{L}\p{N}]+/u, '')]);
    const g = map.get(key) ?? { page: r.page, sample: t, boxes: new Set(), sizes: [], cells: [] };
    g.boxes.add(`${t.w}x${t.h}`);
    g.sizes.push(t.size);
    g.cells.push({ viewport: r.viewport, theme: r.theme });
    map.set(key, g);
  };
  for (const vp of viewports) counts[vp] = { cells: 0, pass: 0, fail: 0, error: 0, checks: 0, checkFails: 0 };
  for (const r of rows) {
    const item = items.get(r.page);
    const c = (counts[r.viewport] ??= { cells: 0, pass: 0, fail: 0, error: 0, checks: 0, checkFails: 0 });
    c.cells++;
    if (r.error) {
      c.error++;
      add(defects, { page: r.page, viewport: r.viewport, theme: r.theme, what: `capture error: ${r.error}`, file: r.path ?? '', fix: 'load the page by hand; a timeout here is the dev server or the page' });
      continue;
    }
    const all = { ...r.judge, ...r.siteJudge };
    const fails = Object.entries(all)
      .filter(([, v]) => v === false)
      .map(([k]) => k);
    c.checks += Object.values(all).filter((v) => typeof v === 'boolean').length;
    c.checkFails += fails.length;
    if (fails.length) c.fail++;
    else c.pass++;
    for (const k of fails) {
      if (k === 'tapTargets') {
        for (const t of r.info.targetsUnder40) group(taps, r, t);
        continue;
      }
      const w = hooks.where(k, rawDetail(k, r), item);
      add(defects, { page: r.page, viewport: r.viewport, theme: r.theme, what: `${k} failed: ${detailFor(k, r)}`, file: w.file, fix: w.fix });
    }
    for (const t of r.info.targets40to43 ?? []) group(tapNotes, r, t);
    for (const t of r.info.tabletUnder40 ?? []) group(tabletNotes, r, t);
    const cls = r.vitals?.cls ?? 0;
    if (cls > CLS_NOTE && cls <= CLS_DEFECT) {
      add(notes, { page: r.page, viewport: r.viewport, theme: r.theme, what: `layout shift ${cls} (over ${CLS_NOTE}): ${r.vitals.shifts.map((x) => x.sources.join(' ')).join('; ')}` });
    }
    if (r.shotError) add(notes, { page: r.page, viewport: r.viewport, theme: r.theme, what: `capture failed, the reads stand: ${r.shotError}` });
    for (const t of r.info.truncated ?? []) {
      add(notes, { page: r.page, viewport: r.viewport, theme: r.theme, what: `text truncated with an ellipsis: ${t.el} "${t.text}"` });
    }
    if (r.knownConsole > 0) add(notes, { page: r.page, viewport: r.viewport, theme: r.theme, what: `${r.knownConsole} console message(s) on the allowlist` });
  }
  for (const g of taps.values()) {
    const w = hooks.where('tapTargets', g.sample, items.get(g.page));
    const what = tapWhat(g, '');
    for (const cell of g.cells) add(defects, { page: g.page, viewport: cell.viewport, theme: cell.theme, what, file: w.file, fix: w.fix });
  }
  for (const g of tapNotes.values()) {
    const what = tapWhat(g, ` (${TAP_DEFECT_UNDER} to ${TAP_NOTE_UNDER - 1})`);
    for (const cell of g.cells) add(notes, { page: g.page, viewport: cell.viewport, theme: cell.theme, what });
  }
  for (const g of tabletNotes.values()) {
    const what = tapWhat(g, ` on a tablet (under ${TAP_DEFECT_UNDER}; Kevin decides on tablet touch sizing)`);
    for (const cell of g.cells) add(notes, { page: g.page, viewport: cell.viewport, theme: cell.theme, what });
  }
  return { defects: fold(defects, viewports, themes), notes: fold(notes, viewports, themes), counts };
}

/** The distribution of a reading across the cells of one viewport: value to count. */
function distribution(rows, pick) {
  const out = {};
  for (const r of rows) {
    const v = pick(r);
    if (v == null) continue;
    const k = JSON.stringify(v);
    out[k] = (out[k] ?? 0) + 1;
  }
  return Object.entries(out)
    .map(([k, n]) => `${k} x${n}`)
    .join('; ');
}

/** The invariants' readings per device across pages, as the report's table rows. */
function invariantRows(rows, viewports) {
  return viewports.map((vp) => {
    const cells = rows.filter((r) => r.viewport === vp && !r.error);
    return {
      viewport: vp,
      toolbar: distribution(cells, (r) => r.siteInfo?.toolbar && [r.siteInfo.toolbar[1], r.siteInfo.toolbar[3]]),
      sidebar: distribution(cells, (r) => {
        const s = r.siteInfo?.sidebar;
        if (!s) return null;
        if (s.narrow) return `narrow visible=${s.visible} overlay=${s.overlay}`;
        if (s.closed) return 'closed';
        return s.w;
      }),
      stage: distribution(cells, (r) => r.siteInfo?.stage && [r.siteInfo.stage[1], r.siteInfo.stage[3]]),
      docsToc: distribution(cells, (r) => r.siteInfo?.docsToc && r.siteInfo.docsToc.columns),
      deck: distribution(cells, (r) => r.siteInfo?.deck && (r.siteInfo.deck.scale ?? 'missing')),
      h1y: distribution(cells, (r) => r.reads.h1Box?.y),
    };
  });
}

/** Writes sheet-<WxH>-dark.png for each sheet viewport from the captures under outDir/shots. */
export async function writeSheets(browser, { outDir, pages, viewports = SHEET_VIEWPORTS, theme = 'dark' }) {
  const written = [];
  const page = await browser.newPage();
  for (const vp of viewports) {
    const [w, h] = vp.split('x').map(Number);
    const phone = w < 768;
    const cols = phone ? 9 : 4;
    const tileW = phone ? 300 : 480;
    const scale = tileW / w;
    const maxH = Math.round(h * scale * 2.4);
    const tiles = pages
      .map((p) => ({ id: p.id, file: join(outDir, 'shots', `${p.id}-${vp}-${theme}.png`) }))
      .filter((t) => existsSync(t.file));
    if (tiles.length === 0) continue;
    const html = `<!doctype html><meta charset="utf-8"><title>sheet ${vp} ${theme}</title>
<style>
  body { margin: 0; padding: 16px; background: #181818; color: #e6e6e6; font: 500 15px/1.2 Inter, -apple-system, Helvetica, Arial, sans-serif; }
  .grid { display: grid; grid-template-columns: repeat(${cols}, ${tileW}px); gap: 16px; align-items: start; }
  figure { margin: 0; }
  figcaption { height: 24px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .frame { width: ${tileW}px; max-height: ${maxH}px; overflow: hidden; outline: 1px solid #464646; background: #000; }
  img { display: block; width: ${tileW}px; height: auto; }
</style>
<div class="grid">${tiles
      .map(
        (t) =>
          `<figure><figcaption>${t.id}</figcaption><div class="frame"><img src="${pathToFileURL(t.file).href}" alt=""></div></figure>`
      )
      .join('')}</div>`;
    const htmlPath = join(outDir, `sheet-${vp}-${theme}.html`);
    writeFileSync(htmlPath, html);
    await page.setViewportSize({ width: cols * (tileW + 16) + 32, height: 900 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((res) => (i.onload = i.onerror = res))))));
    const out = join(outDir, `sheet-${vp}-${theme}.png`);
    await page.screenshot({ path: out, fullPage: true });
    written.push(out);
  }
  await page.close();
  return written;
}

/** Seconds with one decimal, from ms. */
const sec = (ms) => (ms == null ? '' : (ms / 1000).toFixed(1));

/** The page by device grid: a row per page, a column per (device, theme), each cell `ok`, `FAIL` or `error` with its time in seconds. */
function gridRows(rows, pages, devices, themes) {
  const columns = themes.flatMap((theme) => devices.filter((d) => rows.some((r) => r.viewport === d.name && r.theme === theme)).map((d) => ({ d, theme, label: theme === 'dark' ? d.name : `${d.name} ${theme}` })));
  const lines = pages.map((p) => {
    const line = { page: p.id };
    for (const c of columns) {
      const r = rows.find((x) => x.page === p.id && x.viewport === c.d.name && x.theme === c.theme);
      if (!r) line[c.label] = '';
      else if (r.error) line[c.label] = `error ${sec(r.ms)}`;
      else line[c.label] = `${Object.values({ ...r.judge, ...r.siteJudge }).includes(false) ? 'FAIL' : 'ok'} ${sec(r.ms)}`;
    }
    return line;
  });
  return { lines, cols: ['page', ...columns.map((c) => c.label)] };
}

/** The layout shift and paint readings per page: the worst score with its device, the largest paint's range, the most blocking time. */
function vitalsRows(rows, pages) {
  return pages
    .map((p) => {
      const cells = rows.filter((r) => r.page === p.id && r.vitals);
      if (!cells.length) return null;
      const worst = cells.reduce((a, b) => (b.vitals.cls > a.vitals.cls ? b : a));
      const lcps = cells.map((r) => r.vitals.lcp).filter((v) => v != null);
      const blocking = cells.reduce((a, b) => (b.vitals.blockingMs > a.vitals.blockingMs ? b : a));
      return {
        page: p.id,
        cls: `${worst.vitals.cls} (${worst.viewport} ${worst.theme})`,
        shifted: worst.vitals.cls > 0 ? worst.vitals.shifts.map((x) => `${x.value} at ${x.t}ms: ${x.sources.join(' ')}`).join('; ') : '',
        lcp: lcps.length ? `${Math.min(...lcps)} to ${Math.max(...lcps)}ms` : '',
        blocking: `${blocking.vitals.blockingMs}ms in ${blocking.vitals.longTasks} task(s) (${blocking.viewport})`,
      };
    })
    .filter(Boolean);
}

/**
 * Writes REPORT.md under outDir from the cells and the interaction
 * results; returns the defects, the notes and the counts so the runner
 * can set its exit code and print the summary. `devices` are the device
 * rows the run read, `run` its timing (pagecheck.mjs run.json).
 */
export function writeReport({ outDir, base, rows, pages, devices, themes, interactions, hooks, sheets, run }) {
  const names = devices.map((d) => d.name);
  const { defects, notes, counts } = summarize(rows, names, hooks, themes, pages);
  const md = [];
  md.push('# Page check', '');
  md.push(
    `Generated ${new Date().toISOString()} against ${base}: ${rows.length} cells (${pages.length} pages on ${devices.length} device${devices.length === 1 ? '' : 's'} in ${themes.join(' and ')}) and ${interactions.length} interaction run(s). Captures under shots/ (the first screen, and -full for a failing cell), one JSON line per cell in cells.jsonl, interaction captures under interactions/.`,
    ''
  );
  if (run?.startedAt) {
    const wall = run.wallMs != null ? `${Math.round(run.wallMs / 1000)}s wall (${Math.round((run.warmMs ?? 0) / 1000)}s of it warming the routes)` : 'wall time not recorded';
    md.push(`Run: started ${run.startedAt}, ${wall}, ${run.jobs} jobs, preset ${run.preset}, load average ${run.loadAtStart} at the start and ${run.loadAtEnd} at the end.${run.rebuilt ? ' This report was rebuilt from the run\'s files.' : ''}`, '');
  }
  const cellsOf = (list) => list.reduce((n, d) => n + (d.cells ?? 1), 0);
  md.push(
    '## Defects',
    '',
    `${defects.length} distinct, seen on ${cellsOf(defects)} cell readings. A row names the devices and themes it was read on; a tap target row is one element on one page with every box it was read at. The file column reads file:line and what found the line (the element's class, its text, the path a request named); a folder stands in when no line matched. Picture paths are shown without their -dark or -light suffix; the dark theme asks for the -dark file.`,
    '',
    defects.length ? table(defects, ['page', 'viewport', 'theme', 'what', 'file', 'fix']) : 'None.',
    ''
  );
  md.push('## Notes', '', `${notes.length} distinct, seen on ${cellsOf(notes)} cell readings.`, '', notes.length ? table(notes, ['page', 'viewport', 'theme', 'what']) : 'None.', '');
  const grid = gridRows(rows, pages, devices, themes);
  md.push('## Pages by device', '', 'Each cell: ok, FAIL or error, then its time in seconds (the load, the settle, the reads and the capture).', '', table(grid.lines, grid.cols), '');
  md.push('## Pass counts per device', '', table(names.map((vp) => ({ device: vp, kind: devices.find((d) => d.name === vp)?.kind ?? '', ...counts[vp] })), ['device', 'kind', 'cells', 'pass', 'fail', 'error', 'checks', 'checkFails']), '');
  md.push(
    `A cell passes when every check holds: no horizontal overflow, no box past the viewport edges, no text clipped mid-word (sr-only and ellipsis truncations excluded), no console error beyond the allowlist, the theme applied, on a phone every tap target at least ${TAP_DEFECT_UNDER}px on its smaller side (${TAP_NOTE_UNDER} is the target; a tablet's are notes), a layout shift score of ${CLS_DEFECT} at most, and every site invariant that applies to the page (scripts/pagecheck/hooks.mjs names them).`,
    ''
  );
  md.push('## Site invariants per device', '', table(invariantRows(rows, names), ['viewport', 'toolbar', 'sidebar', 'stage', 'docsToc', 'deck', 'h1y']), '');
  md.push('toolbar: [y, h] of .pt-toolbar; sidebar: the open list width, `closed`, or the narrow reading; stage: [y, bottom] of .pt-stagewrap; docsToc: the contents grid columns; deck: the sheet drawn over its 1600px width; h1y: the first heading y. Each value with the number of cells reading it.', '');
  md.push('## Layout shifts and paints', '', 'Read in every cell from the load to the reads: the shift score (Web Vitals windows), the largest contentful paint and the blocking time of long tasks (each task over 50ms). The dev server compiles on demand, so the paints and the blocking time are readings, not budgets.', '');
  const vitals = vitalsRows(rows, pages);
  md.push(vitals.length ? table(vitals, ['page', 'cls', 'shifted', 'lcp', 'blocking']) : 'Not read.', '');
  md.push('## Interactions (dark)', '');
  const plain = interactions.filter((i) => i.id !== 'present-walk' && i.id !== 'deck-slides');
  if (plain.length) {
    md.push(
      table(
        plain.map((i) => {
          const { id, page, viewport, pass, before, after, consoleErrors, ms, error, ...readings } = i;
          return { interaction: id, page, viewport, pass: error ? `error: ${error}` : pass ? 'pass' : 'FAIL', readings: short(readings, 400), seconds: sec(ms), consoleErrors: short(consoleErrors ?? [], 120) };
        }),
        ['interaction', 'page', 'viewport', 'pass', 'readings', 'seconds', 'consoleErrors']
      ),
      ''
    );
  } else md.push('Not run.', '');
  const walks = interactions.filter((i) => i.id === 'present-walk');
  md.push('## The presenter by device', '');
  if (walks.length) {
    const stopNames = [...new Set(walks.flatMap((w) => Object.keys(w.stops ?? {})))];
    md.push(
      `The walk presses j through the slides; each column is that slide's title on screen with nothing painted over it. close is the "So I built 12" beat with its tile count, grid the prototypes grid with its card count and the cards clear of the dock; both must show ${walks[0].count ?? 'the presenter\'s'} prototypes.`,
      '',
      table(
        walks.map((w) => ({
          device: w.viewport,
          pass: w.error ? `error: ${w.error}` : w.pass ? 'pass' : 'FAIL',
          ...Object.fromEntries(stopNames.map((n) => [n, w.stops?.[n] ?? ''])),
          close: w.close ? `${w.close.verdict}; ${w.close.tiles} tiles${w.close.tiles === w.count ? '' : ` (${w.count} wanted)`}` : '',
          grid: w.grid ? `${w.grid.verdict}; ${w.grid.cards} cards${w.grid.cards === w.count ? '' : ` (${w.count} wanted)`}, ${w.grid.clear} clear of the dock` : '',
          seconds: sec(w.ms),
        })),
        ['device', 'pass', ...stopNames, 'close', 'grid', 'seconds']
      ),
      ''
    );
  } else md.push('Not run.', '');
  const slides = interactions.find((i) => i.id === 'deck-slides');
  md.push('## The deck slides', '');
  if (!slides) md.push('Not run.', '');
  else if (slides.error) md.push(`error: ${slides.error}`, '');
  else {
    md.push(`${slides.slides} slides opened by their hash at ${slides.viewport}; ${slides.over.length} with an element past the 1600x900 sheet (positions in sheet units).`, '');
    if (slides.over.length) md.push(table(slides.over.map((o) => ({ slide: o.slide, outside: o.outside.join('; ') })), ['slide', 'outside']), '');
  }
  md.push('## Contact sheets', '', sheets.length ? sheets.map((x) => `- ${x}`).join('\n') : 'Not made.', '');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'REPORT.md'), md.join('\n'));
  return { defects, notes, counts };
}
