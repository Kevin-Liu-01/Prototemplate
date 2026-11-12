#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * Holds every logo in this repository to its one drawing, LOGO.d in
 * src/lib/logo.ts, and to the manifest scripts/lint/logo.json, which lists
 * the files a generator writes from it (generated), the files that show a
 * previous mark on purpose (history), the files that look like a logo by
 * name or shape but are not one (notLogo) and the copies in other
 * repositories (external, notes only).
 *
 * It reads every text file git tracks (or would track), content/ (the
 * docs and blog MDX), src/app/d and the top-level files included, and
 * takes every path data run in them: SVG d="...", JSX d={...}, d: '...'
 * and string constants alike. It fails on:
 *   1. monogram: the doubled-line monogram's path (its bar or potrace
 *      drawing, its path hash, or its opening shape, so a copy with other
 *      spacing, a shift or a uniform scale is caught) outside history
 *   2. edited or stale copy: a path that opens like LOGO.d, has LOGO.d's
 *      commands, or has its box and size, but is not byte for byte LOGO.d
 *   3. vote loser: a path that hashes to a losing candidate outside
 *      public/marks/ and src/lib/marks.ts
 *   4. hand copy: LOGO.d byte for byte in a file that is neither
 *      src/lib/logo.ts nor generated; components import LOGO instead
 *   5. stale generated file: a generated picture whose recorded LOGO.d hash
 *      or own sha256 no longer holds, a generated text file without the
 *      current LOGO.d, a fingerprint (public/brand/gt-globe-logo.json)
 *      that differs from what pnpm build:logo writes, or a
 *      src/lib/previous-mark.json (the history the site labels) that
 *      differs from what pnpm build:previous-mark writes
 *   6. retired address: code or markup that loads /brand/gt-logo-* or
 *      no-bg-gt-logo-*; those addresses serve the globe for outside links
 *      (Kevin, 2026-11-10), and this site uses the gt-globe-* names. A
 *      history entry waives it only when its rules name 6: a dated study
 *      that loads such an address draws the logo, not the previous mark
 *   7. typeset name: a <text> element or live text "General Translation"
 *      in an SVG under public/brand/ or a deck gt-* symbol; a lockup is
 *      always outlines from pnpm build:lockup
 *   8. unlisted picture: a PNG, ICO, WEBP or MP4 named gt-logo, gt-mark,
 *      gt-globe, avatars/logo or under og/, or any film, poster or picture
 *      in public/media/ or contact sheet in public/motion/sheets/, that the
 *      manifest does not list; a checked picture that changed since it was
 *      checked fails too
 *   9. monogram reference: code or markup naming the monogram's file
 *      (gt-monogram.svg) or symbol (#gt-monogram) outside history, so the
 *      previous mark is shown only where history lists it (the /brand
 *      previous-mark figure and deck slide 16)
 *  10. cropped logo: a CSS rule (a .css file or an HTML <style>) that
 *      masks or paints a logo picture (gt-globe-logo* or a retired
 *      address) at a size other than contain, cover-free auto or one
 *      length for both sides, so the round globe is stretched or cut, as a
 *      crop sized for the wide monogram does. Like 6, only an entry whose
 *      rules name 10 waives it
 *  11. unlabelled previous mark: a deck slide (deck/slides, deck/parts and
 *      the built public/brand-deck.html) that shows a history picture
 *      without saying so beside it (scripts/lint/logo-labels.mjs has the
 *      scope it reads); --built reads the pages next build prerendered the
 *      same way, and --dom reads them in a browser on a running server, so
 *      a picture a client component draws after load (the hub's grid, its
 *      preview card) is held too (scripts/lint/logo-dom.mjs)
 *  12. previous logo: a path whose sha256 is a previous logo's
 *      (PREVIOUS_LOGOS in scripts/lib/logo-lock.mjs: the 11-06 globe), or
 *      that has its whole outline (every command and every number, so a
 *      copy renumbered, respaced, shifted or uniformly scaled is caught), in
 *      code, markup or an SVG outside history; draw LOGO instead. Dated
 *      films and pictures that end on it are history (GLOBE_1106_REASON),
 *      and --external reports the same on the other repositories' copies
 * and, in every HTML file, the #gt-mark symbol must draw LOGO.d and nothing
 * else (rule 2); no manifest entry waives that.
 * A listed path that is not on disk fails too. Exemptions: a history entry
 * skips every rule, or only the rules it lists; one with "symbol" skips
 * them only inside that <symbol> element of the file; one with "count"
 * (rules [9] only) allows that many monogram references in the file and
 * fails every one past it; checked (one file each, with the sha256 it was
 * looked at in) satisfies rule 8; notLogo skips 2, 3
 * and 8 (never 1: the monogram under public/marks/ belongs only in
 * public/marks/previous/); a generated entry marked "derived" (it holds
 * pieces cut from LOGO.d) skips 2.
 *
 * Rule 8 makes every new film, poster and contact sheet a decision:
 * someone looks at its frames and lists it under history or checked, and a
 * history film is labelled where the site plays it. This run reads names
 * and text only and needs no browser; --pixels adds the pixel check
 * (scripts/lint/logo-pixels.mjs), which searches every picture and every
 * film's first and last frame for the monogram at any size, so a screenshot
 * that shows it under any name fails unless history lists it.
 *
 * Usage:
 *   node scripts/lint/logo.mjs [--root <dir>]          (pnpm lint:logo)
 *   node scripts/lint/logo.mjs --pixels                also runs the pixel
 *        check (python3 with numpy and Pillow, ffmpeg and Chrome; results
 *        cached by sha256); the pre-push hook runs it
 *   node scripts/lint/logo.mjs --built                 also reads the pages
 *        next build prerendered for rule 11 (pnpm build runs it)
 *   node scripts/lint/logo.mjs --dom [--base <url>]    also opens those
 *        pages in Chrome on a running server (the built site: pnpm start)
 *        and reads rule 11 there, with the hub's grid and preview card
 *   node scripts/lint/logo.mjs --external              also notes drift in the
 *        copies of GT_CLOUD, GLYPHFIELD and TURBOSLIDE checkouts; never fails
 *   node scripts/lint/logo.mjs --record <path>...      records generated
 *        pictures after their generator ran (pnpm build:logo does its own),
 *        and checked pictures after someone looked at them
 *
 * Exit 0 when nothing fails, 1 on any failure, 2 when logo.json is missing
 * or malformed.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { FINGERPRINT, MANIFEST, PREVIOUS_LOGOS, PREVIOUS_MARK, RASTER, fingerprint, fingerprintText, loadLogo, matches, previousMarkText, readManifest, recordGenerated, sha256 } from '../lib/logo-lock.mjs';
import { unlabelled } from './logo-labels.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const at = argv.indexOf('--root');
const ROOT = at >= 0 ? resolve(argv[at + 1]) : REPO_ROOT;
const EXTERNAL = argv.includes('--external');

const TEXT = /\.(ts|tsx|js|mjs|cjs|jsx|py|css|html|svg|json|md|mdx|txt|sh)$/i;
/* prose may name a retired address when it tells the history; rule 6 reads code and markup */
const PROSE = /\.(md|mdx|txt)$/i;
/* this lint spells the patterns it looks for */
const SELF = new Set([
  'scripts/lint/logo.mjs',
  'scripts/lint/logo.test.mjs',
  'scripts/lint/logo.json',
  'scripts/lib/logo-lock.mjs',
  /* the pixel check draws the monogram's two drawings as its templates */
  'scripts/lint/logo-pixels.mjs',
  'scripts/lint/logo-pixels.test.mjs',
  'scripts/lint/logo-pixels-potrace.svg',
]);
const LOGO_SOURCE = 'src/lib/logo.ts';

/* the doubled-line monogram, the mark until 2026-11-08: its bar drawing, its potrace drawing and its master path's sha256 */
const MONOGRAM_SIGNATURES = ['M363 222.5L1197', 'M6875 14819'];
const MONOGRAM_SHA = '0c2c5bfe44f4e540e050e005b7693599ea47b7ccd4eae85744d9b4eb57cbac11';
/* the monogram's two drawings, read for their shape: a copy respaced, renumbered or scaled still opens with the same commands in the same proportions */
const MONOGRAM_DRAWINGS = ['public/marks/previous/gt-monogram.svg', 'scripts/lint/logo-pixels-potrace.svg'];
/* the vote's losing candidates (public/marks/graticule/variations), by their path's sha256 */
const LOSERS = new Map([
  ['ac45f71da23eb400a33b3fd90f305c64982e272e13107c258bad47a2e0aafe28', 'meridian-wide-axis-gap'],
  ['98e9c4a172b7bef1f1ed10c93b75faa25201a7fd59d539bb58962e1726777ef9', 'meridian-axis-behind'],
]);
const LOSERS_AT = ['public/marks/', 'src/lib/marks.ts'];
/* the monogram's old addresses: /brand/gt-logo-light and -dark (svg and png) and no-bg-gt-logo-*, not a kit file such as kit/brand/gt-logo-motion.js */
const RETIRED = /\/brand\/gt-logo-(?:light|dark)\b|no-bg-gt-logo-/g;
/* the monogram's file and its deck symbol, by name */
const MONOGRAM_NAME = 'gt-monogram';
const RASTER_NAME = /gt-(logo|mark|globe)|avatars\/logo|(^|\/)og\//;
/* the films, their posters and their contact sheets, whose frames end on a mark */
const FILM_PICTURE = /^public\/media\/[^/]+$|^public\/motion\/sheets\//;
/* a path data run: an M and a number, then path characters only */
const PATH_RUN = /M\s?-?\.?\d[\d\s.,+\-eEMmLlHhVvCcSsQqTtAaZz]{40,}/g;

let manifest;
try {
  manifest = readManifest(ROOT);
} catch (error) {
  console.error(`lint:logo: ${MANIFEST}: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}
const { LOGO, LOCKUP } = await loadLogo(ROOT);
const LOGO_SHA = sha256(LOGO.d);

if (argv.includes('--record')) {
  const rels = argv.slice(argv.indexOf('--record') + 1).filter((a) => !a.startsWith('--'));
  recordGenerated(ROOT, rels, LOGO_SHA);
  console.log(`lint:logo: recorded ${rels.length} generated file(s) at LOGO.d ${LOGO_SHA.slice(0, 12)}`);
  process.exit(0);
}

/* ---- the files ---- */

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.next', '.git'].includes(entry)) continue;
    const abs = join(dir, entry);
    const stat = lstatSync(abs);
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) walk(abs, out);
    else if (stat.isFile()) out.push(relative(ROOT, abs));
  }
  return out;
}

/**
 * Every file git tracks or would track (cached and untracked, not ignored),
 * less the deleted ones and the symbolic links, from three git calls and no
 * per-file stat; the whole tree without git.
 */
function allFiles() {
  if (existsSync(join(ROOT, '.git'))) {
    const git = (...args) => spawnSync('git', ['ls-files', '-z', ...args], { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const listed = git('--cached', '--others', '--exclude-standard');
    const staged = git('--stage');
    const deleted = git('--deleted');
    if (listed.status === 0 && staged.status === 0 && deleted.status === 0) {
      const skip = new Set(deleted.stdout.split('\0'));
      /* a symbolic link is staged with mode 120000; an untracked one is rare and read through its target */
      for (const line of staged.stdout.split('\0')) if (line.startsWith('120000 ')) skip.add(line.slice(line.indexOf('\t') + 1));
      return [...new Set(listed.stdout.split('\0'))].filter((rel) => rel && !skip.has(rel));
    }
  }
  return walk(ROOT);
}

const ALL = allFiles();
/* every file is read: a docs page in content/ or a top-level Markdown file is held like a component */
const SCANNED = ALL;

const listedIn = (list, rel) => manifest[list].find((entry) => matches(entry.path, rel));
const generatedEntry = (rel) => listedIn('generated', rel);
/* notLogo files skip these rules; a history entry skips every rule, or the ones it lists */
const NOT_LOGO_RULES = [2, 3, 8];
/* rules a history entry waives only by naming them: these addresses and pictures draw the logo itself, so a dated study must draw it right */
const NAMED_ONLY = [6, 10];
/** True when the manifest exempts the whole file from the rule (a symbol-scoped history entry exempts only its symbol). */
function exempt(rel, rule) {
  const history = manifest.history.filter((entry) => matches(entry.path, rel) && !entry.symbol && !entry.count);
  if (history.some((entry) => (entry.rules ? entry.rules.includes(rule) : !NAMED_ONLY.includes(rule)))) return true;
  return NOT_LOGO_RULES.includes(rule) && Boolean(listedIn('notLogo', rel));
}
/** How many occurrences of a rule-9 reference the manifest allows in this file: the sum of the counts its counted history entries give. */
const allowed = (rel, rule) =>
  manifest.history.filter((entry) => entry.count && matches(entry.path, rel) && (!entry.rules || entry.rules.includes(rule))).reduce((sum, entry) => sum + entry.count, 0);
/** The symbol ids whose element the manifest exempts from the rule in this file. */
const exemptSymbols = (rel, rule) =>
  manifest.history.filter((entry) => entry.symbol && matches(entry.path, rel) && (!entry.rules || entry.rules.includes(rule))).map((entry) => entry.symbol);
/** The text with each listed <symbol id="..."> element blanked, line breaks kept so line numbers hold. */
function blankSymbols(text, ids) {
  let out = text;
  for (const id of ids) {
    out = out.replace(new RegExp(`<symbol id="${id}"[\\s\\S]*?</symbol>`, 'g'), (element) => element.replace(/[^\n]/g, ' '));
  }
  return out;
}

/* ---- the report ---- */

let failures = 0;
const fail = (rule, where, line) => {
  failures += 1;
  console.log(`  FAIL ${rule} ${where}: ${line}`);
};
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/* ---- the listed paths exist ---- */

const ON_DISK = new Set(ALL);
for (const list of ['generated', 'history', 'notLogo', 'checked']) {
  for (const entry of manifest[list]) {
    if (!entry.path) fail('manifest', MANIFEST, `an entry under "${list}" has no path`);
    else if (!(ON_DISK.has(entry.path) || ALL.some((rel) => matches(entry.path, rel)))) fail('manifest', MANIFEST, `${entry.path} is listed under "${list}" but not on disk`);
    else if (list !== 'generated' && !entry.reason) fail('manifest', MANIFEST, `${entry.path} under "${list}" has no reason`);
    else if (list === 'generated' && !entry.generator) fail('manifest', MANIFEST, `${entry.path} under "generated" names no generator`);
    else if (list === 'checked' && (entry.path.includes('*') || entry.path.endsWith('/') || !entry.sha256)) fail('manifest', MANIFEST, `${entry.path} under "checked" needs one file and the sha256 it was checked at (node scripts/lint/logo.mjs --record ${entry.path})`);
    else if (entry.count !== undefined && (list !== 'history' || !Number.isInteger(entry.count) || entry.count < 1 || JSON.stringify(entry.rules) !== '[9]')) fail('manifest', MANIFEST, `${entry.path}: "count" is a positive whole number on a history entry whose rules are [9]`);
  }
}

/* ---- rules 1 to 4, 6 and 7: the text files ---- */

const PREFIX = LOGO.d.slice(0, 22);
const commands = (d) => d.replace(/[^A-Za-z]/g, '');
const LOGO_COMMANDS = commands(LOGO.d);
const LOGO_BOX = LOGO.viewBox.split(' ').map(Number);

/** The box of a path drawn with absolute M, L, C, Q and Z only; undefined for any other path. */
function box(d) {
  if (!/^[MLCQZ\d\s.,-]+$/.test(d)) return undefined;
  const nums = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  if (nums.length < 4) return undefined;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    x0 = Math.min(x0, nums[i]);
    x1 = Math.max(x1, nums[i]);
    y0 = Math.min(y0, nums[i + 1]);
    y1 = Math.max(y1, nums[i + 1]);
  }
  return [x0, y0, x1 - x0, y1 - y0];
}

/** True when a path is LOGO.d with edits: its opening, its command letters, or its box and size. */
function nearLogo(d) {
  if (d.startsWith(PREFIX)) return 'opens like LOGO.d';
  const cmds = commands(d);
  if (cmds === LOGO_COMMANDS) return 'has LOGO.d\'s commands with other numbers';
  if (Math.abs(cmds.length - LOGO_COMMANDS.length) > LOGO_COMMANDS.length * 0.05) return undefined;
  const b = box(d);
  if (b && b.every((v, i) => Math.abs(v - LOGO_BOX[i]) < 0.5)) return 'has LOGO.d\'s box and size';
  return undefined;
}

/* a logo picture by address: the generated globe files and the retired addresses that now serve it */
const LOGO_PICTURE = /\/brand\/(?:no-bg-)?gt-(?:globe-)?logo[\w-]*\.(?:png|svg|webp)/;
/** Every CSS rule body in a stylesheet or the <style> elements of HTML: { body, index }. Nested at-rules yield their inner rules. */
function cssBlocks(text) {
  const out = [];
  for (const m of text.matchAll(/\{([^{}]*)\}/g)) out.push({ body: m[1], index: m.index });
  return out;
}
/** The mask and background sizes in a rule body that are neither contain nor auto nor one length for both sides. */
function badSizes(body) {
  const sizes = [];
  for (const m of body.matchAll(/(?:-webkit-)?(?:mask|background)-size\s*:\s*([^;]+)/g)) sizes.push(...m[1].split(','));
  /* the shorthand: position / size */
  for (const m of body.matchAll(/(?:-webkit-)?(?:mask|background)\s*:\s*([^;]+)/g)) {
    for (const layer of m[1].split(/,(?![^(]*\))/)) {
      const size = /\/\s*([^\s/]+(?:\s+(?!no-repeat|repeat|border-box|content-box|padding-box)[\d.]+[a-z%]*)?)/.exec(layer.replace(/url\([^)]*\)/g, ''));
      if (size) sizes.push(size[1]);
    }
  }
  return sizes
    .map((size) => size.trim().replace(/\s*!important$/, ''))
    .filter((size) => {
      if (size === 'cover') return true;
      if (/^(contain|auto|auto auto|inherit|initial|unset)$/.test(size)) return false;
      const parts = size.split(/\s+/);
      return !(parts.length === 1 || (parts.length === 2 && parts[0] === parts[1]));
    });
}

/**
 * A path's opening as a shape: its first eight command letters and their
 * numbers, moved so it starts at 0,0 and scaled so the largest is 1. The
 * same drawing written with other spacing, other separators, a uniform
 * scale or a shift has the same shape; null for a path too short to say.
 */
function shape(d) {
  const tokens = [...d.matchAll(/([MLHVCSQTAZmlhvcsqtaz])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/g)];
  let letters = '';
  const nums = [];
  for (const [, letter, num] of tokens) {
    if (letter) {
      if (letters.length === 8) break;
      letters += letter;
    } else nums.push({ n: Number(num), after: letters.at(-1) ?? '' });
  }
  if (letters.length < 8 || !letters.startsWith('M') || nums.length < 6) return null;
  const [x0, y0] = [nums[0].n, nums[1].n];
  /* absolute coordinates move with the start; a relative step does not */
  const absolute = /^[MLCSQT]+$/.test(letters.replace(/Z/g, ''));
  const moved = nums.slice(2).map((v, i) => (absolute && /[MLCSQT]/.test(v.after) ? v.n - (i % 2 === 0 ? x0 : y0) : v.n));
  const scale = Math.max(...moved.map(Math.abs));
  if (!scale) return null;
  return { letters, vec: moved.map((v) => v / scale) };
}
const sameShape = (a, b) => a && b && a.letters === b.letters && a.vec.length === b.vec.length && a.vec.every((v, i) => Math.abs(v - b.vec[i]) < 0.005);
/* read from this repository, as the pixel check reads its templates, so a --root checkout is held to the same drawings */
const MONOGRAM_SHAPES = MONOGRAM_DRAWINGS.filter((rel) => existsSync(join(REPO_ROOT, rel)))
  .flatMap((rel) => [...readFileSync(join(REPO_ROOT, rel), 'utf8').matchAll(/ d="([^"]+)"/g)].map((m) => shape(m[1])))
  .filter(Boolean);

/**
 * A whole path as an outline: every command letter and every number, the
 * absolute coordinates moved so the path starts at 0,0 (H moves with x, V
 * with y), then scaled so the largest is 1. The same drawing renumbered to
 * fewer decimals, respaced, shifted or uniformly scaled has the same
 * outline; null for a path with arcs, which the logos never use.
 */
function outline(d) {
  let letters = '';
  const nums = [];
  let axis = 0;
  for (const [, letter, num] of d.matchAll(/([MLHVCSQTAZmlhvcsqtaz])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/g)) {
    if (letter) {
      if (/[Aa]/.test(letter)) return null;
      letters += letter;
      axis = 0;
      continue;
    }
    const cmd = letters.at(-1) ?? 'M';
    const which = cmd === 'H' || cmd === 'h' ? 0 : cmd === 'V' || cmd === 'v' ? 1 : axis++ % 2;
    nums.push({ n: Number(num), which, absolute: cmd === cmd.toUpperCase() });
  }
  if (nums.length < 2 || !letters.startsWith('M')) return null;
  const origin = [nums[0].n, nums[1].n];
  const moved = nums.map((v) => (v.absolute ? v.n - origin[v.which] : v.n));
  const scale = Math.max(...moved.map(Math.abs));
  return scale ? { letters, vec: moved.map((v) => v / scale) } : null;
}
const sameOutline = (a, b) => a && b && a.letters === b.letters && a.vec.length === b.vec.length && a.vec.every((v, i) => Math.abs(v - b.vec[i]) < 0.005);
/* each previous logo's outline, read from its history file in this repository, as the monogram's drawings are */
const PREVIOUS_OUTLINES = PREVIOUS_LOGOS.filter((logo) => logo.file && existsSync(join(REPO_ROOT, logo.file))).flatMap((logo) =>
  [...readFileSync(join(REPO_ROOT, logo.file), 'utf8').matchAll(/ d="([^"]+)"/g)]
    .filter((m) => sha256(m[1]) === logo.sha256)
    .map((m) => ({ logo, outline: outline(m[1]), size: m[1].length }))
);
if (PREVIOUS_OUTLINES.length !== PREVIOUS_LOGOS.length) {
  console.error('lint:logo: a previous logo\'s file does not hold its drawing (PREVIOUS_LOGOS in scripts/lib/logo-lock.mjs)');
  process.exit(2);
}
/** The previous logo a path is, by its hash or by its outline; undefined when it is none. */
function previousLogo(d, hash) {
  const exact = PREVIOUS_LOGOS.find((logo) => logo.sha256 === hash);
  if (exact) return { logo: exact, how: '' };
  /* a renumbered copy is shorter or longer, but not by half */
  const near = PREVIOUS_OUTLINES.filter((p) => d.length > p.size * 0.5 && d.length < p.size * 1.5);
  if (!near.length) return undefined;
  const mine = outline(d);
  const found = near.find((p) => sameOutline(p.outline, mine));
  return found ? { logo: found.logo, how: ', renumbered, respaced or scaled (by its outline)' } : undefined;
}

let textFiles = 0;
for (const rel of SCANNED) {
  if (!TEXT.test(rel) || SELF.has(rel)) continue;
  textFiles += 1;
  const raw = readFileSync(join(ROOT, rel), 'utf8');
  const generated = generatedEntry(rel);
  /* the text each rule reads: a symbol the manifest lists for that rule is blanked */
  const textFor = (rule) => blankSymbols(raw, exemptSymbols(rel, rule));
  const text = textFor(1);

  /* 1: the monogram's signatures, anywhere in the text */
  if (!exempt(rel, 1)) {
    for (const signature of MONOGRAM_SIGNATURES) {
      const i = text.indexOf(signature);
      if (i >= 0) fail('rule 1 monogram', `${rel}:${lineOf(text, i)}`, `the doubled-line monogram's path (${signature}); draw LOGO from src/lib/logo.ts, or list the file under history with a reason`);
    }
  }

  /* 2: the deck's #gt-mark symbol draws LOGO.d and nothing else, whatever the manifest says */
  if (rel.endsWith('.html')) {
    for (const m of raw.matchAll(/<symbol id="gt-mark"[^>]*>([\s\S]*?)<\/symbol>/g)) {
      const paths = [...m[1].matchAll(/ d="([^"]*)"/g)].map((p) => p[1]);
      if (paths.length !== 1 || paths[0] !== LOGO.d) fail('rule 2 edited copy', `${rel}:${lineOf(raw, m.index)}`, 'the #gt-mark symbol does not draw LOGO.d alone; regenerate it (pnpm build:logo)');
    }
  }

  /* 9: the monogram's file or symbol, named in code or markup; a counted history entry allows that many and no more */
  if (!PROSE.test(rel) && !exempt(rel, 9)) {
    const scoped = textFor(9);
    const found = [];
    for (let i = scoped.indexOf(MONOGRAM_NAME); i >= 0; i = scoped.indexOf(MONOGRAM_NAME, i + MONOGRAM_NAME.length)) found.push(i);
    const allows = allowed(rel, 9);
    if (found.length > allows) {
      for (const i of found) {
        fail('rule 9 monogram reference', `${rel}:${lineOf(scoped, i)}`, `names ${MONOGRAM_NAME}, the previous mark${allows ? ` (${found.length} times; the manifest allows ${allows})` : ''}; draw LOGO, or list the file under history if it shows the previous mark on purpose`);
      }
    }
  }

  for (const match of text.matchAll(PATH_RUN)) {
    const d = match[0].trim();
    const where = `${rel}:${lineOf(text, match.index)}`;
    const hash = sha256(d);
    if (d === LOGO.d) {
      /* 4: a byte copy outside the source and the generated files */
      if (rel !== LOGO_SOURCE && !generated && !exempt(rel, 4)) fail('rule 4 hand copy', where, `LOGO.d copied by hand; import LOGO from @/lib/logo, or list a generator's output under generated`);
      continue;
    }
    if (!exempt(rel, 1) && !MONOGRAM_SIGNATURES.some((s) => d.startsWith(s))) {
      if (hash === MONOGRAM_SHA) fail('rule 1 monogram', where, 'the doubled-line monogram\'s path (by its hash)');
      else if (MONOGRAM_SHAPES.some((m) => sameShape(m, shape(d)))) fail('rule 1 monogram', where, 'the doubled-line monogram\'s path, respaced, renumbered or scaled (by its shape)');
    }
    /* 12: a previous logo's path outside history */
    const previous = previousLogo(d, hash);
    if (previous && !exempt(rel, 12)) fail('rule 12 previous logo', where, `carries the ${previous.logo.name}${previous.how}; use LOGO`);
    const loser = LOSERS.get(hash);
    if (loser && !LOSERS_AT.some((p) => matches(p, rel)) && !exempt(rel, 3)) fail('rule 3 vote loser', where, `the losing candidate ${loser}; it belongs only on /marks`);
    if (!loser && !previous && !generated?.derived && !exempt(rel, 2)) {
      const why = nearLogo(d);
      if (why) fail('rule 2 edited copy', where, `a path that ${why} but is not byte for byte LOGO.d; draw LOGO itself`);
    }
  }

  /* 6: code and markup loading a retired address */
  if (!PROSE.test(rel) && !exempt(rel, 6)) {
    for (const m of text.matchAll(RETIRED)) {
      fail('rule 6 retired address', `${rel}:${lineOf(text, m.index)}`, `loads ${m[0]}*; use the gt-globe-logo files, or list the file under history`);
    }
  }

  /* 10: a logo picture masked or painted at a size that stretches or cuts the round globe */
  if ((rel.endsWith('.css') || rel.endsWith('.html')) && !exempt(rel, 10)) {
    for (const block of cssBlocks(text)) {
      if (!LOGO_PICTURE.test(block.body)) continue;
      for (const bad of badSizes(block.body)) fail('rule 10 cropped logo', `${rel}:${lineOf(text, block.index)}`, `sizes a logo picture at "${bad}"; the globe is round, so use contain (or one length for both sides) in a square box`);
    }
  }

  /* 7: typeset name in a brand SVG or a deck gt-* symbol */
  const pieces = [];
  if (exempt(rel, 7)) continue;
  if (rel.startsWith('public/brand/') && rel.endsWith('.svg')) pieces.push(['the SVG', text]);
  if (rel.endsWith('.html')) for (const m of text.matchAll(/<symbol id="(gt-[^"]*)"[^>]*>([\s\S]*?)<\/symbol>/g)) pieces.push([`the #${m[1]} symbol`, m[2]]);
  for (const [what, body] of pieces) {
    const bare = body.replace(/<!--[\s\S]*?-->/g, '').replace(/<(title|desc)\b[\s\S]*?<\/\1>/g, '');
    if (/<text[\s>]/.test(bare)) fail('rule 7 typeset name', rel, `${what} sets type with <text>; use the outlines pnpm build:lockup draws`);
    else if (/General\s+Translation/.test(bare.replace(/<[^>]*>/g, ' '))) fail('rule 7 typeset name', rel, `${what} holds the name as live text; use the outlines pnpm build:lockup draws`);
  }
}

/* ---- rule 5: the generated files ---- */

const print = fingerprintText(fingerprint(ROOT, LOGO, LOCKUP));
for (const entry of manifest.generated) {
  for (const rel of ALL.filter((file) => matches(entry.path, file))) {
    const abs = join(ROOT, rel);
    const rerun = `regenerate it (${entry.generator})`;
    if (rel === FINGERPRINT) {
      if (readFileSync(abs, 'utf8') !== print) fail('rule 5 stale', rel, `differs from the fingerprint of LOGO.d and the lockup; ${rerun}`);
    } else if (RASTER.test(rel)) {
      if (!entry.sha256 || !entry.sourceSha256) fail('rule 5 stale', rel, `a generated picture needs its sha256 and the LOGO.d hash it was drawn from; ${rerun} and record it (node scripts/lint/logo.mjs --record ${rel})`);
      else if (entry.sourceSha256 !== LOGO_SHA) fail('rule 5 stale', rel, `drawn from LOGO.d ${entry.sourceSha256.slice(0, 12)}, now ${LOGO_SHA.slice(0, 12)}; ${rerun}`);
      else if (sha256(readFileSync(abs)) !== entry.sha256) fail('rule 5 stale', rel, `edited since its generator wrote it; ${rerun}`);
    } else if (!readFileSync(abs, 'utf8').includes(LOGO.d)) {
      fail('rule 5 stale', rel, `does not hold the current LOGO.d; ${rerun}`);
    }
  }
}

/* the site's copy of the history it labels (src/lib/previous-mark.json) */
if (!existsSync(join(ROOT, PREVIOUS_MARK)) || readFileSync(join(ROOT, PREVIOUS_MARK), 'utf8') !== previousMarkText(manifest)) {
  fail('rule 5 stale', PREVIOUS_MARK, `differs from the manifest's history, so the site would label the wrong pictures; regenerate it (pnpm build:previous-mark)`);
}

/* ---- rule 8: logo-named pictures and the films ---- */

for (const rel of SCANNED) {
  if (!RASTER.test(rel)) continue;
  const film = FILM_PICTURE.test(rel);
  if (!film && !RASTER_NAME.test(rel)) continue;
  if (generatedEntry(rel) || exempt(rel, 8)) continue;
  const checked = manifest.checked.find((entry) => entry.path === rel);
  if (checked) {
    if (checked.sha256 && sha256(readFileSync(join(ROOT, rel))) !== checked.sha256) fail('rule 8 changed picture', rel, `changed since it was checked; look at every frame again and record it (node scripts/lint/logo.mjs --record ${rel}), or move it to history`);
    continue;
  }
  fail(
    'rule 8 unlisted picture',
    rel,
    film
      ? 'a film, poster or contact sheet the manifest does not list; look at its frames and list it under history (it shows the previous mark) or checked (it shows the logo or no mark)'
      : 'a logo-named picture the manifest does not list; list it under generated (with its generator), history, notLogo or checked'
  );
}

/* ---- rule 11: a history picture shown without its label ---- */

/* the pictures that show the previous mark: history entries that waive every rule, under public/ and deck/ */
const SHOWN_HISTORY = manifest.history.filter((entry) => !entry.rules && !entry.symbol && /^(public|deck)\//.test(entry.path));
const showsPrevious = (rel) => SHOWN_HISTORY.some((entry) => matches(entry.path, rel));
/**
 * A deck address as a repository path: `shots/a.jpg` under deck/, `deck-assets/a.jpg` and `/a.jpg` under public/.
 * A slide or part one folder down may write `../shots/a.jpg`; the leading steps up are dropped, so it is read too.
 */
function deckPath(address) {
  const bare = address.replace(/^(?:\.\.\/)+/, '');
  if (bare.startsWith('/')) return `public${bare}`;
  if (bare.startsWith('shots/')) return `deck/${bare}`;
  if (bare.startsWith('deck-assets/')) return `public/${bare}`;
  return null;
}
const report11 = (where, misses) => {
  /* one line per picture and line: a minified page repeats a picture in every srcset width */
  const seen = new Set();
  for (const miss of misses) {
    const key = `${miss.rel}:${miss.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    fail('rule 11 unlabelled previous mark', `${where}:${miss.line}`, `shows ${miss.rel}, which history lists as showing the previous mark, with no label in its ${miss.scope ? `<${miss.scope}>` : 'element'}; say so beside it (src/lib/previous-mark.ts has the words) or mark the card that does with data-previous-mark`);
  }
};
const DECK_PAGES = ALL.filter((rel) => /^deck\/(slides|parts)\/[^/]+\.html$/.test(rel) || rel === 'public/brand-deck.html');
for (const rel of DECK_PAGES) {
  if (exempt(rel, 11)) continue;
  report11(rel, unlabelled(readFileSync(join(ROOT, rel), 'utf8'), deckPath, showsPrevious));
}

/* --built: the pages next build prerendered, outside the dated studies under /d (history; /d/production mirrors the product and is read) */
if (argv.includes('--built')) {
  const { builtPages } = await import('./seo.mjs');
  const pages = builtPages(ROOT);
  if (pages.size === 0) {
    console.log('lint:logo --built: no prerendered pages; run next build first');
    process.exit(2);
  }
  let read = 0;
  for (const [route, file] of pages) {
    if (route.startsWith('/d/') && !route.startsWith('/d/production')) continue;
    read += 1;
    report11(`built ${route}`, unlabelled(readFileSync(file, 'utf8'), (address) => (address.startsWith('/') ? `public${address}` : null), showsPrevious));
  }
  console.log(`Logo labels: ${read} prerendered pages read`);
}

/* ---- external copies: notes only ---- */

const REPOS = { 'gt-cloud': 'GT_CLOUD', glyphfield: 'GLYPHFIELD', turboslide: 'TURBOSLIDE' };
if (EXTERNAL) {
  for (const entry of manifest.external) {
    const [repo, file] = String(entry.path).split(':');
    const base = process.env[REPOS[repo] ?? ''];
    if (!base) {
      console.log(`  note ${entry.path}: set ${REPOS[repo] ?? `a checkout for ${repo}`} to compare`);
      continue;
    }
    const abs = join(resolve(base), file);
    if (!existsSync(abs)) {
      console.log(`  note ${entry.path}: not in ${base}`);
      continue;
    }
    const text = readFileSync(abs, 'utf8');
    const previous = [...text.matchAll(PATH_RUN)].map((m) => previousLogo(m[0].trim(), sha256(m[0].trim()))).find(Boolean);
    console.log(`  note ${entry.path}: ${text.includes(LOGO.d) ? 'holds LOGO.d' : 'does not hold LOGO.d byte for byte'}${previous ? `; carries the ${previous.logo.name}${previous.how}; use LOGO` : ''}`);
  }
}

console.log(`Logo: LOGO.d ${LOGO_SHA.slice(0, 12)}; ${textFiles} text files read; ${manifest.generated.length} generated, ${manifest.history.length} history, ${manifest.notLogo.length} notLogo, ${manifest.checked.length} checked entries`);
console.log(`lint:logo: ${failures === 0 ? 'pass' : `${failures} failure${failures === 1 ? '' : 's'}`}`);

/* --pixels and --dom: the pixel check and the browser label check, with the options each reads passed on */
for (const [mode, script] of [
  ['--pixels', 'logo-pixels.mjs'],
  ['--dom', 'logo-dom.mjs'],
]) {
  if (!argv.includes(mode)) continue;
  const rest = argv.filter((a) => !['--pixels', '--dom', '--external', '--built'].includes(a));
  const run = spawnSync(process.execPath, [join(REPO_ROOT, 'scripts/lint', script), ...rest], { stdio: 'inherit' });
  if (run.status === 2) process.exit(2);
  if (run.status !== 0) process.exit(1);
}
process.exit(failures === 0 ? 0 : 1);
