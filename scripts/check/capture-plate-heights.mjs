// Measures the height of every live plate on /components across the
// viewport widths, into src/lib/plate-heights.json. src/lib/component-library.ts
// reads the file, and each row reserves its plate's height at the reader's
// width before the plate mounts, so a plate that mounts in view or above the
// reader moves nothing.
//
// Two passes. The ladder loads the page fresh at each width of LADDER and
// takes every plate's height there. The sweep then mounts a few plates at a
// time and narrows the viewport 2px at a time from 1492 to 320, taking
// their heights at each width once they hold still for 300ms, so every
// step a plate takes (a controls row wraps, a figure takes its phone
// layout) is found to within 2px. Where the two passes meet, the taller
// height stands (a row reserved too tall keeps a floor under its plate in
// view; one reserved too short grows), and a plate whose sweep misses its
// ladder by more than 2px is reported, since its height then depends on the
// width it mounted at or on time; at more than two widths only its ladder
// counts. The file keeps, per plate, the fewest [width, height] points
// whose straight lines pass within 1px of every measured height.
//
// Under reduced motion a plate that moves adds a line to its controls row
// (Plate's note that it shows its still), so --reduced measures every plate
// that way into src/lib/plate-heights-still.json and keeps only the plates
// whose height there differs from src/lib/plate-heights.json; the viewer
// reads that table when the reader asks for reduced motion.
//
// A ladder plate's height is the height of what it rendered once it has
// drawn (.is-drawn), its frames have loaded and it has held still for
// 2.5 s (a framed page's anatomy legend lands 1.6 s after the page loads).
// A plate that never settles within 60 s is reported, and the run exits 1
// without writing.
//
// Usage: pnpm capture:plate-heights [--base <url>, default PT_BASE] [--jobs <n>, default 3]
//   [--out <file>, default src/lib/plate-heights.json] [--raw <file>: also
//   write every measured point, the sweep's beside it as <file>.sweep.json]
//   [--from <raw file>: start from the points a --raw run wrote, measuring
//   only what they lack] [--only <id,id>: measure these plates again]
//   [--reduced: measure under reduced motion, into plate-heights-still.json]
//   [--partial: write even with plates that never settled, to study them]
// Needs a running server (a production build: next start) and the Chrome
// for Testing build playwright-core expects; CHROME_PATH overrides the
// executable.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

import { option } from '../lib/args.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { BASE_URL, chromePath, HIDE_DEV_UI_CSS, ROOT, seedTheme } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const BASE = (option(argv, '--base') ?? BASE_URL).replace(/\/$/, '');
const JOBS = Math.max(1, Number(option(argv, '--jobs') ?? 3));
const REDUCED = argv.includes('--reduced');
const MOTION_FILE = join(ROOT, 'src/lib/plate-heights.json');
const OUT = option(argv, '--out') ?? (REDUCED ? join(ROOT, 'src/lib/plate-heights-still.json') : MOTION_FILE);
const RAW = option(argv, '--raw');
const FROM = option(argv, '--from');
const ONLY = new Set(option(argv, '--only')?.split(',') ?? []);
const PARTIAL = argv.includes('--partial');

/**
 * The fresh-load widths, ascending. Up to 900 the sidebar is a drawer and a
 * slot is the viewport less 38px; from 901 the sidebar takes its place and
 * a slot is the viewport less 482px, up to the column's 1010px at 1492,
 * past which no plate changes. The ladder takes each side of the plates'
 * media breakpoints (480, 560, 620, 640, 700, 720, 767, 900, 1023, 1160)
 * and the common screens.
 */
const LADDER = [
  320, 360, 375, 390, 414, 430, 470, 480, 481, 520, 560, 561, 600, 620, 621, 640, 641, 680, 700, 701, 720, 721, 767, 768, 800, 820, 860, 900,
  901, 940, 980, 1023, 1024, 1060, 1100, 1140, 1160, 1161, 1200, 1240, 1280, 1320, 1366, 1400, 1440, 1492,
];
/** The sweep's widths: every second pixel from 1492 down to 320, and both sides of every ladder width. */
const SWEEP = [...new Set([...Array.from({ length: (1492 - 320) / 2 + 1 }, (_, i) => 1492 - i * 2), ...LADDER])].sort((a, b) => b - a);
/**
 * The viewport's height. No plate reads it, and a tall viewport puts a
 * dozen plates inside the plate window at once, so they settle together.
 */
const VIEW_H = 3000;
/** The part of the tall viewport a sweep group takes its plates from, so they stay inside the plate window as rows above them grow. */
const GROUP_H = 2400;
/** On a Mac the headless browser draws WebGL on the GPU through ANGLE's Metal backend, not in software, so a dozen live fields cost little. */
const GPU_ARGS = process.platform === 'darwin' ? ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] : [];
const STILL_MS = 2500;
const TIMEOUT_MS = 60_000;
const SWEEP_STILL_MS = 300;
const SWEEP_TIMEOUT_MS = 6000;

/** Runs in the page: the settled plate height of each slot in `only` (every slot when null) by id, -1 for a plate that never settled. */
async function measureSlots([still, timeout, only]) {
  const sheet = document.querySelector('.sheet-flow');
  const wanted = only ? new Set(only) : null;
  const slots = Array.from(document.querySelectorAll('[data-plate]')).filter((slot) => !wanted || wanted.has(slot.dataset.plate));
  const heights = {};
  if (!sheet) return heights;
  /* a frame starts on a blank document that reads as loaded */
  const loaded = (frame) => {
    const doc = frame.contentDocument;
    return !doc || (doc.URL !== 'about:blank' && doc.readyState === 'complete');
  };
  const plateHeight = (slot) =>
    Array.from(slot.querySelectorAll(':scope > :not([aria-hidden="true"])')).reduce((sum, node) => sum + node.getBoundingClientRect().height, 0);
  const seen = new Map();
  for (const slot of slots) {
    const id = slot.dataset.plate;
    if (id in heights) continue;
    sheet.scrollTop += slot.getBoundingClientRect().top - sheet.getBoundingClientRect().top;
    const start = performance.now();
    while (!(id in heights)) {
      await new Promise((done) => setTimeout(done, 100));
      const now = performance.now();
      if (now - start > timeout) {
        heights[id] = -1;
        break;
      }
      for (const other of slots) {
        const key = other.dataset.plate;
        if (key in heights) continue;
        if (!other.classList.contains('is-drawn') || !Array.from(other.querySelectorAll('iframe')).every(loaded)) {
          seen.delete(key);
          continue;
        }
        const height = Math.round(plateHeight(other));
        const last = seen.get(key);
        if (!last || last.height !== height) seen.set(key, { height, since: now });
        else if (height > 0 && now - last.since >= still) heights[key] = height;
      }
    }
  }
  return heights;
}

/** Runs in the page: the heights of the plates in `ids` once all of them have held still for `still` ms (or at `timeout`), -1 for one not drawn. */
async function stillHeights([ids, still, timeout]) {
  const loaded = (frame) => {
    const doc = frame.contentDocument;
    return !doc || (doc.URL !== 'about:blank' && doc.readyState === 'complete');
  };
  const read = () =>
    ids.map((id) => {
      const slot = document.querySelector(`[data-plate="${CSS.escape(id)}"]`);
      if (!slot?.classList.contains('is-drawn') || !Array.from(slot.querySelectorAll('iframe')).every(loaded)) return -1;
      return Math.round(Array.from(slot.querySelectorAll(':scope > :not([aria-hidden="true"])')).reduce((sum, node) => sum + node.getBoundingClientRect().height, 0));
    });
  const start = performance.now();
  let last = read();
  let since = start;
  while (performance.now() - start < timeout) {
    await new Promise((done) => requestAnimationFrame(() => setTimeout(done, 30)));
    const now = read();
    if (now.some((h, i) => h !== last[i])) {
      last = now;
      since = performance.now();
    } else if (performance.now() - since >= still) break;
  }
  return Object.fromEntries(ids.map((id, i) => [id, last[i]]));
}

/** Runs in the page: scrolls `id`'s slot to the top and lists the slots whose top is within `span` of it. */
function groupFrom([id, span]) {
  const sheet = document.querySelector('.sheet-flow');
  const slot = document.querySelector(`[data-plate="${CSS.escape(id)}"]`);
  if (!sheet || !slot) return [];
  sheet.scrollTop += slot.getBoundingClientRect().top - sheet.getBoundingClientRect().top;
  const top = slot.getBoundingClientRect().top;
  return Array.from(document.querySelectorAll('[data-plate]'))
    .filter((el) => {
      const at = el.getBoundingClientRect().top - top;
      return at >= 0 && at < span;
    })
    .map((el) => el.dataset.plate);
}

async function openPage(browser, width) {
  const context = await browser.newContext({
    viewport: { width, height: VIEW_H },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: REDUCED ? 'reduce' : 'no-preference',
  });
  await seedTheme(context, 'dark');
  const page = await context.newPage();
  await page.goto(`${BASE}/components`, { waitUntil: 'load', timeout: 180_000 });
  await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

/** Runs `work` on each task, JOBS at a time. */
async function pool(tasks, work) {
  const queue = [...tasks];
  await Promise.all(
    Array.from({ length: JOBS }, async () => {
      for (let task = queue.shift(); task !== undefined; task = queue.shift()) await work(task);
    })
  );
}

const ladder = new Map();
const swept = new Map();
const put = (into, id, width, height) => {
  if (!into.has(id)) into.set(id, new Map());
  into.get(id).set(width, height);
};
/** A --raw file's points by plate, without the plates --only measures again. */
function seed(file, into) {
  if (!file || !existsSync(file)) return;
  for (const [id, list] of Object.entries(JSON.parse(readFileSync(file, 'utf8')))) {
    if (ONLY.has(id)) continue;
    for (const [width, height] of list) put(into, id, width, height);
  }
}
seed(FROM, ladder);
seed(FROM?.replace(/(\.json)?$/, '.sweep.json'), swept);
for (const id of ONLY) ladder.set(id, new Map());

const browser = await chromium.launch({ executablePath: chromePath(), headless: true, args: GPU_ARGS });

/* the ladder: every plate at every width, or, after --from, each plate at the widths it lacks */
const lacking = (width) => [...ladder].filter(([, byWidth]) => !(byWidth.get(width) > 0)).map(([id]) => id);
const rungs = LADDER.map((width) => ({ width, only: ladder.size === 0 ? null : lacking(width) })).filter((task) => task.only === null || task.only.length > 0);
await pool(rungs, async ({ width, only }) => {
  const { context, page } = await openPage(browser, width);
  const heights = await page.evaluate(measureSlots, [STILL_MS, TIMEOUT_MS, only]);
  await context.close();
  for (const [id, height] of Object.entries(heights)) put(ladder, id, width, height);
  console.log(`  ladder ${width}: ${Object.keys(heights).length} plates`);
});

/* the sweep: groups of plates that mount together, each narrowed through every width */
const ids = [...ladder.keys()];
const pending = new Set(ids.filter((id) => !swept.has(id)));
const groups = [];
{
  const { context, page } = await openPage(browser, SWEEP[0]);
  for (const id of ids) {
    if (!pending.has(id)) continue;
    const group = (await page.evaluate(groupFrom, [id, GROUP_H])).filter((member) => pending.has(member));
    if (!group.includes(id)) group.unshift(id);
    for (const member of group) pending.delete(member);
    groups.push(group);
  }
  await context.close();
}
await pool(groups, async (group) => {
  const { context, page } = await openPage(browser, SWEEP[0]);
  await page.evaluate(groupFrom, [group[0], GROUP_H]);
  await page.evaluate(measureSlots, [STILL_MS, TIMEOUT_MS, group]);
  for (const width of SWEEP) {
    await page.setViewportSize({ width, height: VIEW_H });
    const heights = await page.evaluate(stillHeights, [group, SWEEP_STILL_MS, SWEEP_TIMEOUT_MS]);
    for (const [id, height] of Object.entries(heights)) if (height > 0) put(swept, id, width, height);
  }
  await context.close();
  console.log(`  sweep ${group.join(', ')}`);
});
await browser.close();

/*
 * The taller height stands where both measured, and a sweep that misses its
 * ladder by more than 2px is reported. A miss at one or two widths is a
 * plate caught mid-change on one pass; a plate that misses at more keeps
 * its layout from the width it mounted at (a still drawn once), so only
 * its ladder counts.
 */
const drift = [];
const merged = new Map();
for (const id of ids) {
  const misses = [...(ladder.get(id) ?? [])].filter(([width, height]) => {
    const sweepHeight = swept.get(id)?.get(width);
    return height > 0 && sweepHeight !== undefined && Math.abs(sweepHeight - height) > 2;
  });
  for (const [width, height] of misses) drift.push(`${id} at ${width}: ladder ${height}, sweep ${swept.get(id)?.get(width)}`);
  const byWidth = new Map(misses.length > 2 ? [] : (swept.get(id) ?? []));
  for (const [width, height] of ladder.get(id) ?? []) if (height > 0) byWidth.set(width, Math.max(height, byWidth.get(width) ?? 0));
  merged.set(id, [...byWidth].sort((a, b) => a[0] - b[0]));
}
if (drift.length > 0) console.error(`capture-plate-heights: ${drift.length} sweep heights miss the ladder\n${drift.map((d) => `  ${d}`).join('\n')}`);

/** The fewest points whose straight lines pass within 1px of every measured one. */
function simplify(points) {
  if (points.length <= 2) return points;
  const out = [points[0]];
  let start = 0;
  for (let end = 2; end < points.length; end += 1) {
    const [x0, y0] = points[start];
    const [x1, y1] = points[end];
    const fits = points.slice(start + 1, end).every(([x, y]) => Math.abs(y0 + ((y1 - y0) * (x - x0)) / (x1 - x0) - y) <= 1);
    if (!fits) {
      out.push(points[end - 1]);
      start = end - 1;
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

const failed = ids.flatMap((id) => [...(ladder.get(id) ?? [])].filter(([, height]) => height < 0).map(([width]) => `${width}: ${id}`));
if (RAW) {
  const raw = (from) => ids.map((id) => `  ${JSON.stringify(id)}: ${JSON.stringify([...(from.get(id) ?? [])].sort((a, b) => a[0] - b[0]))}`).join(',\n');
  writeFileSync(RAW, `{\n${raw(ladder)}\n}\n`);
  writeFileSync(RAW.replace(/(\.json)?$/, '.sweep.json'), `{\n${raw(swept)}\n}\n`);
}
if (ids.length === 0 || failed.length > 0) {
  console.error(`capture-plate-heights: ${failed.length} plates never settled\n${failed.map((f) => `  ${f}`).join('\n')}`);
  if (!PARTIAL || ids.length === 0) process.exit(1);
}
/** The height the motion table gives a plate at `width`, joined as the viewer joins it. */
function motionAt(points, width) {
  if (!points?.length) return null;
  if (width <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i += 1) {
    const [hiW, hiH] = points[i];
    if (width > hiW) continue;
    const [loW, loH] = points[i - 1];
    return Math.round(loH + ((hiH - loH) * (width - loW)) / (hiW - loW));
  }
  return points[points.length - 1][1];
}
/* under --reduced, a plate whose every height matches the motion table within 1px needs no row of its own */
const motion = REDUCED && existsSync(MOTION_FILE) ? JSON.parse(readFileSync(MOTION_FILE, 'utf8')) : {};
const differs = (id) => !REDUCED || (merged.get(id) ?? []).some(([width, height]) => Math.abs((motionAt(motion[id], width) ?? -9) - height) > 1);
const rows = ids.filter(differs).map((id) => `  ${JSON.stringify(id)}: ${JSON.stringify(simplify(merged.get(id) ?? []))}`);
writeFileSync(OUT, `{\n${rows.join(',\n')}\n}\n`);
console.log(`capture-plate-heights: ${rows.length} plates in ${groups.length} sweep groups into ${OUT}`);
if (failed.length > 0) process.exit(1);
