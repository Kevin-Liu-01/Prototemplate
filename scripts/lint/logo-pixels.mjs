#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * The pixel half of the logo lock (pnpm lint:logo --pixels): finds the
 * doubled-line monogram in pictures, where lint:logo's file and path rules
 * cannot see it. A screenshot of a page from before 2026-11-08 shows the
 * monogram in its header whatever the file is called, so every picture is
 * searched, not only the logo-named ones.
 *
 * Templates, drawn by Chromium as white on black masks: the monogram's bar
 * drawing (public/marks/previous/gt-monogram.svg), its potrace drawing
 * (scripts/lint/logo-pixels-potrace.svg, the plate's mark until
 * 2026-11-09) and LOGO.d from src/lib/logo.ts.
 *
 * Pictures: every jpg, jpeg, png, webp, gif, avif and ico git tracks (or
 * would track) under public/, deck/, graphics/, content/ and docs/, the
 * first and last frame of every gif, and the first and last frame of every
 * tracked video (mp4, webm, mov, m4v), cut with ffmpeg. A film's poster is
 * a picture of its own and is searched as one.
 *
 * scripts/lint/logo-pixels.py does the search (edge maps, normalised
 * cross-correlation at every size, then a fit on the picture's own pixels;
 * its docstring has the method); the thresholds below decide a hit.
 * Results are cached by each file's sha256 and the matcher's own hash in
 * node_modules/.cache/logo-pixels, so a rerun reads only new or changed
 * pictures.
 *
 * Fails on a monogram hit in a file the manifest (scripts/lint/logo.json)
 * does not list under history (an entry that waives every rule) or
 * notLogo (the /marks catalog and the speed marks, which are built on the
 * bar monogram). A hit in a generated or checked file fails too: those are
 * listed as showing the logo or no mark.
 *
 * Needs python3 with numpy and Pillow (requirements.txt), ffmpeg for the
 * films and the Chrome playwright-core installs. It is not part of
 * pnpm build; run it before a push and whenever pictures change.
 *
 * Usage:
 *   pnpm lint:logo --pixels                 (node scripts/lint/logo-pixels.mjs)
 *   node scripts/lint/logo-pixels.mjs --json <file>   also writes every hit
 *        and near miss with its score, size, box, the files that name the
 *        picture and whether the manifest lists it
 *   node scripts/lint/logo-pixels.mjs <path>...       searches only these
 *        pictures (any path, tracked or not) and prints what it found
 *   --workers <n>   matcher processes (default: half the cores)
 *
 * Exit 0 when nothing fails, 1 on any unlisted monogram, 2 when a tool it
 * needs is missing.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';

import { helpIfAsked } from '../lib/help.mjs';
import { loadLogo, matches, readManifest, sha256 } from '../lib/logo-lock.mjs';
import { ROOT as REPO_ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

/*
 * A monogram hit, from the fit (scripts/lint/logo-pixels.py): `score` is the
 * edge correlation, `agree` the intensity correlation, `clutter` how much
 * the ground around the mark varies against the mark's contrast. A hit has
 * score at least SCORE and score x agree at least FIT, or at least
 * FIT_ALONE when the mark stands alone (clutter at most CLUTTER): below
 * 12 px a letter such as "a" fits about as well as the mark does, and
 * only its neighbouring letters tell it apart. From LARGE px up no text
 * comes close, so a textured or tinted mark (a dithered cover, a gold
 * foil, a checkerboard ground) passes at SCORE_LARGE and FIT_LARGE.
 * Calibrated on 2026-11-11 over every picture in the tree, each hit and
 * near miss looked at on a contact sheet, against captures of the site
 * from before and after the globe. Not found: a mark under about 9 px (a
 * header in a small thumbnail) and the dotted outline of the monogram the
 * old contact page drew behind its form; the --json report keeps every
 * near miss for a person to look at.
 */
export const SCORE = 0.6;
export const FIT = 0.55;
export const FIT_ALONE = 0.43;
export const CLUTTER = 0.12;
export const LARGE = 16;
export const SCORE_LARGE = 0.55;
export const FIT_LARGE = 0.42;
export const NEAR = 0.38;

const PICTURE = /\.(jpe?g|png|webp|gif|avif|ico)$/i;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
const FOLDERS = ['public/', 'deck/', 'graphics/', 'content/', 'docs/'];
const TEXT = /\.(ts|tsx|js|mjs|cjs|jsx|py|css|html|svg|json|md|mdx|txt|yml|yaml)$/i;
const TEXT_DATA = /\.(json|md|mdx|txt)$/i;

const argv = process.argv.slice(2);
const option = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};
const ROOT = option('--root') ? resolve(option('--root')) : REPO_ROOT;
const JSON_OUT = option('--json');
const WORKERS = option('--workers');
const valued = new Set(['--root', '--json', '--workers']);
const ONLY = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));

const CACHE = join(ROOT, 'node_modules/.cache/logo-pixels');
const MATCHER = join(ROOT, 'scripts/lint/logo-pixels.py');
const POTRACE = join(ROOT, 'scripts/lint/logo-pixels-potrace.svg');
const BAR = join(ROOT, 'public/marks/previous/gt-monogram.svg');
mkdirSync(join(CACHE, 'frames'), { recursive: true });

function need(cmd, args, why) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(`lint:logo --pixels: ${why}`);
    process.exit(2);
  }
}
need('python3', ['-c', 'import numpy, PIL'], 'needs python3 with numpy and Pillow (pip install -r requirements.txt)');

/* ---- the masks, drawn once per template source ---- */

const { LOGO } = await loadLogo(ROOT);
const svgBody = (file) => readFileSync(file, 'utf8').replace(/<\?xml[^>]*>/, '');
const SOURCES = {
  'mono-bar': svgBody(BAR),
  'mono-potrace': svgBody(POTRACE),
  logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO.viewBox}"><path fill-rule="${LOGO.fillRule}" d="${LOGO.d}"/></svg>`,
};
const MASK_KEY = sha256(JSON.stringify(SOURCES)).slice(0, 16);
const MASKS = join(CACHE, `masks-${MASK_KEY}`);
if (!existsSync(join(MASKS, 'logo.png'))) {
  const { chromium } = await import('playwright-core');
  const { chromePath } = await import('../lib/site-pages.mjs');
  mkdirSync(MASKS, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath() });
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1, viewport: { width: 1000, height: 640 } });
    for (const [name, svg] of Object.entries(SOURCES)) {
      const sized = svg.replace(/<svg\b/, '<svg height="600" style="display:block;color:#fff;fill:#fff"');
      await page.setContent(`<style>html,body{margin:0;background:#000}</style>${sized}`);
      await page.screenshot({ path: join(MASKS, `${name}.png`), clip: { x: 0, y: 0, width: 1000, height: 640 } });
    }
  } finally {
    await browser.close();
  }
}

/* ---- the files ---- */

function tracked() {
  const r = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const deleted = new Set(spawnSync('git', ['ls-files', '-z', '--deleted'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout.split('\0'));
  return [...new Set(r.stdout.split('\0'))].filter((rel) => rel && !deleted.has(rel) && existsSync(join(ROOT, rel)));
}

const ALL = tracked();
const targets = ONLY.length
  ? ONLY.map((p) => (isAbsolute(p) ? relative(ROOT, p) : p))
  : ALL.filter((rel) => (PICTURE.test(rel) && FOLDERS.some((f) => rel.startsWith(f))) || VIDEO.test(rel));

/** The frames of a video, cut once per video sha256: [label, absolute png]. */
function videoFrames(abs, sha) {
  const first = join(CACHE, 'frames', `${sha}-first.png`);
  const last = join(CACHE, 'frames', `${sha}-last.png`);
  if (!existsSync(first)) spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', abs, '-frames:v', '1', first]);
  if (!existsSync(last)) spawnSync('ffmpeg', ['-v', 'error', '-y', '-sseof', '-1', '-i', abs, '-update', '1', last]);
  return [['first frame', first], ['last frame', last]].filter(([, f]) => existsSync(f));
}

/* the matcher's VERSION keys the cache: raise it when a change to logo-pixels.py changes what it finds */
const SELF_KEY = `v${readFileSync(MATCHER, 'utf8').match(/^VERSION = (\d+)/m)?.[1] ?? '0'}`;
const jobs = [];
const units = [];
let videos = 0;
for (const rel of targets) {
  const abs = isAbsolute(rel) ? rel : join(ROOT, rel);
  if (!existsSync(abs)) continue;
  const sha = sha256(readFileSync(abs));
  const pieces = VIDEO.test(rel) ? videoFrames(abs, sha) : [['', abs]];
  if (VIDEO.test(rel)) {
    videos += 1;
    if (!pieces.length) console.log(`  note ${rel}: ffmpeg cut no frame`);
  }
  for (const [label, file] of pieces) {
    const key = `${sha}:${label}:${SELF_KEY}:${MASK_KEY}`;
    units.push({ rel, label, key, sha });
    jobs.push({ key, file });
  }
}

/* ---- the cache, then the matcher for whatever it lacks ---- */

const RESULTS = join(CACHE, 'results.jsonl');
const readCache = () => {
  const map = new Map();
  if (!existsSync(RESULTS)) return map;
  for (const line of readFileSync(RESULTS, 'utf8').split('\n')) {
    if (!line) continue;
    try {
      const r = JSON.parse(line);
      map.set(r.key, r);
    } catch {
      // a line cut short by an interrupted run is read again next time
    }
  }
  return map;
};
let cache = readCache();
const todo = [...new Map(jobs.filter((j) => !cache.has(j.key)).map((j) => [j.key, j])).values()];
if (todo.length) {
  console.log(`lint:logo --pixels: searching ${todo.length} picture(s); ${jobs.length - todo.length} cached`);
  const jobsFile = join(CACHE, 'jobs.json');
  writeFileSync(jobsFile, JSON.stringify(todo));
  const args = [MATCHER, MASKS, jobsFile, RESULTS];
  if (WORKERS) args.push(WORKERS);
  const r = spawnSync('python3', args, { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) {
    console.error('lint:logo --pixels: the matcher stopped; run it again to resume');
    process.exit(2);
  }
  cache = readCache();
}
/* drop the results of older matcher versions and masks, so the cache holds one line per picture */
const current = `:${SELF_KEY}:${MASK_KEY}`;
if ([...cache.keys()].some((key) => !key.endsWith(current))) {
  for (const key of [...cache.keys()]) if (!key.endsWith(current)) cache.delete(key);
  writeFileSync(RESULTS, [...cache.values()].map((r) => `${JSON.stringify(r)}\n`).join(''));
}

/* ---- the verdicts ---- */

const manifest = readManifest(ROOT);
/** Where the manifest lists a file, or undefined. */
function listing(rel) {
  /* a history entry that waives only some of lint:logo's rules does not cover the pixels */
  const history = manifest.history.find((e) => matches(e.path, rel) && !e.symbol && !e.count && !e.rules);
  if (history) return { list: 'history', reason: history.reason };
  const notLogo = manifest.notLogo.find((e) => matches(e.path, rel));
  if (notLogo) return { list: 'notLogo', reason: notLogo.reason };
  const generated = manifest.generated.find((e) => matches(e.path, rel));
  if (generated) return { list: 'generated', reason: generated.generator, showsLogo: true };
  const checked = manifest.checked.find((e) => e.path === rel);
  if (checked) return { list: 'checked', reason: checked.reason, showsLogo: true };
  return undefined;
}

const fit = (c) => c.score * c.agree;
const isHit = (c) =>
  (c.score >= SCORE && (fit(c) >= FIT || (fit(c) >= FIT_ALONE && c.clutter <= CLUTTER))) || (c.h >= LARGE && c.score >= SCORE_LARGE && fit(c) >= FIT_LARGE);
const isNear = (c) => !isHit(c) && fit(c) >= NEAR;
const best = (found, prefix) =>
  Object.entries(found ?? {})
    .filter(([name]) => name.startsWith(prefix))
    .flatMap(([name, cands]) => cands.map((c) => ({ template: name, ...c })))
    .sort((a, b) => Number(isHit(b)) - Number(isHit(a)) || fit(b) - fit(a));

const report = [];
let failures = 0;
let errors = 0;
for (const unit of units) {
  const r = cache.get(unit.key);
  if (!r) continue;
  if (r.error) {
    errors += 1;
    console.log(`  note ${unit.rel}${unit.label ? ` (${unit.label})` : ''}: ${r.error}`);
    continue;
  }
  const mono = best(r.found, 'mono-');
  const logo = best(r.found, 'logo');
  const hits = mono.filter(isHit);
  const near = mono.filter(isNear);
  const logoHits = logo.filter(isHit);
  if (!hits.length && !near.length && !logoHits.length) continue;
  const listed = listing(unit.rel);
  const entry = {
    file: unit.rel,
    frame: unit.label || undefined,
    size: r.size,
    sha256: unit.sha,
    monogram: hits.length > 0,
    hits: hits.map(({ template, score, agree, clutter, h, box, frame }) => ({ template, score, agree, clutter, scale: h, box, frame })),
    near: near.slice(0, 3).map(({ template, score, agree, clutter, h, box, frame }) => ({ template, score, agree, clutter, scale: h, box, frame })),
    logo: logoHits.slice(0, 3).map(({ score, agree, clutter, h, box, frame }) => ({ score, agree, clutter, scale: h, box, frame })),
    listed: listed ?? null,
  };
  report.push(entry);
  if (hits.length && (!listed || listed.showsLogo)) {
    failures += 1;
    const top = hits[0];
    const why = listed ? `the manifest lists it under ${listed.list}, as showing the logo or no mark` : 'the manifest does not list it';
    console.log(
      `  FAIL pixels ${unit.rel}${unit.label ? ` (${unit.label})` : ''}: the doubled-line monogram at [${top.box.join(', ')}], ${Math.round(top.h)} px (score ${top.score}, agree ${top.agree}, clutter ${top.clutter}); ${why}. Recapture or re-render it, or list it under history with a reason on a page that labels it`
    );
  }
}

/* ---- the files that name each picture, for --json ---- */

if (JSON_OUT) {
  const texts = ALL.filter((rel) => TEXT.test(rel) && !rel.startsWith('node_modules/') && !rel.endsWith('.jsonl')).map((rel) => {
    let text = '';
    try {
      text = readFileSync(join(ROOT, rel), 'utf8');
    } catch {
      // unreadable: no references from it
    }
    return [rel, text];
  });
  for (const entry of report) {
    const name = basename(entry.file);
    const stem = basename(entry.file, extname(entry.file));
    /* the name, or the stem when a page builds the name (a slug plus an extension, a thumb or a -dark variant) */
    const needles = [name, ...(stem.length >= 6 ? [stem, stem.replace(/-(dark|light)$/, '')] : [])];
    entry.shownBy = texts.filter(([rel, text]) => rel !== entry.file && needles.some((n) => text.includes(n))).map(([rel]) => rel);
    /* the code that builds names inside the picture's folder (a thumb from a slug, a gallery shot from a section id) */
    const folder = entry.file.startsWith('public/') ? `${dirname(entry.file).slice('public'.length)}/` : `${dirname(entry.file)}/`;
    entry.folderUsedBy = texts.filter(([rel, text]) => !TEXT_DATA.test(rel) && new RegExp(`${folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\$\\{`).test(text)).map(([rel]) => rel);
  }
  const out = {
    $comment: 'pnpm lint:logo --pixels --json: every picture with a monogram hit, a monogram near miss or a LOGO hit; shownBy lists the files that name it (by file name, or by stem for built names)',
    generatedAt: new Date().toISOString(),
    thresholds: { SCORE, FIT, FIT_ALONE, CLUTTER, LARGE, SCORE_LARGE, FIT_LARGE, NEAR },
    searched: { pictures: units.length, videos, errors },
    failures,
    files: report,
  };
  writeFileSync(resolve(JSON_OUT), `${JSON.stringify(out, null, 2)}\n`);
  console.log(`lint:logo --pixels: wrote ${JSON_OUT}`);
}

const monogramFiles = report.filter((e) => e.monogram).length;
console.log(`Logo pixels: ${units.length} pictures and frames searched (${videos} videos); ${monogramFiles} show the monogram, ${monogramFiles - failures} of them listed`);
console.log(`lint:logo --pixels: ${failures === 0 ? 'pass' : `${failures} failure${failures === 1 ? '' : 's'}`}`);
process.exit(failures === 0 ? 0 : 1);
