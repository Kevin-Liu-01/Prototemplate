// Builds src/lib/motion.ts, the typed data behind /motion and /motion/<slug>,
// and public/motion/<slug>.md, the research package each translation-series
// page renders, from the motion folder: the roster in motion/MOTION.md (its
// "## The films" section, one "### <slug>: <title> (<length>)" entry per
// film) and the package in motion/films/<slug>/BRIEF.md of every film that
// has one. A film whose BRIEF.md opens with "# Brief: <slug>" (the package
// format) belongs to the translation series; a production brief, such as
// slash-partnership's "# slash-partnership: the brief", does not. The rest
// are the roster's other films, kept in roster order.
//
// Each film's status is read from the files, never written by hand: a film
// is rendered when its final render exists (a published copy under
// public/media, or motion/out/<slug>.mp4 by that exact name; a
// _draft-<slug>.mp4 or a <slug>-share.mp4 is not the final), in production
// when its folder under motion/films exists, and planned otherwise. A film
// with a web copy under public/media (pinned in public/motion/published.json:
// the two blog films and the three films of the translation series) plays on
// the site; every other render stays in the motion folder and is listed by
// its repository-relative path. The script reads motion/ and never writes
// there, and it never copies a render into public/: the web copies are made
// by hand, each named <name>-film.mp4 with the moov atom at the front and
// <name>-poster.jpg at 1920x1080 (public/media/README.md lists every file).
//
// The version rule. The film on the site, its credits, its contact sheet and
// its script describe one cut. public/motion/published.json pins that cut
// per film: the web copy and its poster, the cut's label and length as its
// script states them, and the SHA-256 of its video and audio streams
// (ffmpeg's streamhash with the streams copied, so a faststart remux of a
// render hashes the same as the render). The script checks every web copy
// against its pin and throws when one differs. It then looks for the
// published cut in motion/out and in each folder under it that holds the
// kit's records (sheets/ or scripts/, such as out/series-100s): the folder
// whose <slug>.mp4 or <slug>-share.mp4 has the pinned streams holds the cut,
// and its <slug>.credits.txt, sheets/<slug>.webp (with the .png when it is
// at most SHEET_PNG_CAP) and scripts/<slug>.md are copied to public/motion,
// after the script's label and length are checked against the pin. When no
// folder holds the cut, the copies already in public/motion stay as they
// are (their script must still match the pin). A render in motion/out that
// is not the published cut is listed as in review, by its label (when its
// own script names it and runs the same length) and its length, and nothing
// else of it reaches the site: no picture, no sheet, no script, no credits.
// To publish a new cut, replace the web copy, then run
// `node scripts/build/motion.mjs --pin <slug> ...`, which pins the web copy's
// streams and the label and length of the folder that holds them, and run
// the script again.
//
// The package body is the BRIEF.md from the package's own h1 to the end:
// the "# Brief: <slug>" header block above it (the lane instructions, up to
// its first ---) is left out. Each body must have the five numbered
// sections in order, a table in sections 1 and 3, the three fact-check
// groups in section 5 and fact-check numbers that run without a gap; the
// script throws when the shape changes, before it writes anything, so the
// last generated files stay intact.
//
// Both outputs are committed, so the site builds without motion/, which is
// untracked; this script runs where motion/ exists. A rerun on unchanged
// input writes byte-identical files.
//
// Usage: pnpm build:motion
//        node scripts/build/motion.mjs --pin <slug> [<slug> ...]
// MOTION_DIR overrides the motion folder (default: <repo>/motion). ffmpeg and
// ffprobe must be on the PATH: the version rule reads which cut each render
// holds.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const OUT = join(ROOT, 'src/lib/motion.ts');
const MOTION = process.env.MOTION_DIR ?? join(ROOT, 'motion');

/** Where the package bodies go, relative to the repository root; the page reads them from process.cwd() and the site serves them under /motion/. */
const BODY_DIR = 'public/motion';
const BODY_OUT = join(ROOT, BODY_DIR);

/** The published copies of the contact sheets and the scripts, served under /motion/sheets/ and /motion/scripts/. */
const SHEET_DIR = 'sheets';
const SCRIPT_DIR = 'scripts';

/** The pinned cut of each published film; hand-edited, or written by --pin. */
const MANIFEST = join(BODY_OUT, 'published.json');

/** The full-resolution PNG of a sheet is published beside the WebP when it is at most this size; a larger one is linked nowhere. */
const SHEET_PNG_CAP = 20_000_000;

/** The kit's contact sheet (motion/kit/contact-sheet.sh): 384 x 216 tiles, eight to a row, 3 px gaps, two frames a second from frame 0. */
const SHEET_TILE = { width: 384, height: 216, gap: 3, perSecond: 2 };

/** The motion folder as the generated paths name it, relative to the repository root. */
const REL = 'motion';

/** The post each blog film trails; emitted only when content/blog/<post>.mdx exists. */
const BLOG_POST = {
  'blog-designing-docs': 'designing-docs-for-humans',
  'blog-rewriting-docs': 'rewriting-our-docs',
  'blog-fuma-nama': 'fuma-nama',
  'blog-open-source': 'supporting-open-source-software',
};

/** The two sections of /motion, in page order; the leads are the page's own copy. */
const SECTIONS = [
  {
    id: 'motion-films',
    label: 'Films',
    lead: 'The brand film, the mark sting, the blog films, the Lottie film, the release board and the showreel, in the order of the roster.',
  },
  {
    id: 'motion-series',
    label: 'Translation series',
    lead: 'Three films about how a translation made the words a language uses. Each one has a research package with a script, a post, a vocabulary table, sources and a fact-check list.',
  },
];

const STATUS_LABEL = { rendered: 'Rendered', 'in-production': 'In production', planned: 'Planned' };

/** Section number to package section id. */
const PACKAGE_IDS = { 1: 'script', 2: 'post', 3: 'vocabulary', 4: 'sources', 5: 'checks' };

const ENTRY = /^###\s+([a-z0-9][a-z0-9-]*)(?::\s*(.+?))?\s*\(([^()]*)\)\s*$/;
const LENGTH = /^\d+(?:\s+to\s+\d+)?\s*s$/;
const LENGTH_IN_TEXT = /(\d+\s+to\s+\d+\s*s)\b/;
const FENCE = /^```/;
const RULE = /^-{3,}\s*$/;
const COORDINATE = /^\d+\.\d+° [NS]/;
const SENTENCE = /^(.+?[.!?]["”’)]?)(?=\s+[A-Z“"(])/;
const BARE_URL = /https?:\/\/[^\s<>"“”「」]+/g;

function fail(message) {
  throw new Error(`build-motion: ${message}`);
}

/** A folder name the page route can take: not the index, no slash, and only the characters a slug carries. */
function checkSlug(slug, where) {
  if (slug === 'index') fail(`${where} is named index, which would shadow /motion`);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug)) fail(`${where} has a name a route cannot carry`);
}

function readLines(file) {
  return readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').split('\n');
}

/** `the bar monogram sting` becomes `The bar monogram sting`. */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Paragraphs of a run of lines: blank-line separated, each joined with single spaces. */
function paragraphs(lines) {
  const out = [];
  let current = [];
  for (const line of lines) {
    if (line.trim() === '') {
      if (current.length > 0) out.push(current.join(' '));
      current = [];
    } else {
      current.push(line.trim());
    }
  }
  if (current.length > 0) out.push(current.join(' '));
  return out;
}

/** The first sentence of a paragraph, or the paragraph when it holds one. */
function firstSentence(paragraph) {
  return (SENTENCE.exec(paragraph)?.[1] ?? paragraph).trim();
}

/**
 * Parentheticals that name a local path, a code span or a branch are
 * removed with the space before them: absolute paths must never reach the
 * public site, and a summary has no use for a working note.
 */
function stripLocalNotes(text) {
  let out = text;
  for (let at = out.indexOf('('); at >= 0; at = out.indexOf('(', at + 1)) {
    let depth = 0;
    let end = -1;
    for (let i = at; i < out.length; i += 1) {
      if (out[i] === '(') depth += 1;
      else if (out[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) break;
    const inner = out.slice(at + 1, end);
    if (inner.includes('/Users/') || inner.includes('`') || /\bbranch\b/.test(inner)) {
      const start = at > 0 && out[at - 1] === ' ' ? at - 1 : at;
      out = out.slice(0, start) + out.slice(end + 1);
      at = start - 1;
    }
  }
  return out;
}

function summaryOf(paragraph, where) {
  const text = stripLocalNotes(firstSentence(paragraph)).replace(/\s+/g, ' ').trim();
  if (!text) fail(`${where} has no summary sentence`);
  if (text.includes('/Users/')) fail(`${where}'s summary still names a local path`);
  return text;
}

/** A file's duration in seconds as ffprobe reads it; undefined when ffprobe is missing or cannot read the file. */
function durationOf(file) {
  if (!file || !existsSync(file)) return undefined;
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const seconds = Number.parseFloat(out.trim());
    return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
  } catch {
    return undefined;
  }
}

/** `100.0` seconds becomes `1:40`; undefined when ffprobe is missing or cannot read the file. */
function runtimeOf(file) {
  const duration = durationOf(file);
  if (duration === undefined) return undefined;
  const seconds = Math.round(duration);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/* ---- the version rule ---- */

/**
 * The SHA-256 of a render's video and audio streams, copied as they are
 * (ffmpeg's streamhash muxer): the identity of a cut, the same for a render
 * and its faststart remux. Throws without ffmpeg, since the rule cannot be
 * kept without it.
 */
function streamsOf(file) {
  let out;
  try {
    out = execFileSync(
      'ffmpeg',
      ['-v', 'error', '-i', file, '-map', '0:v', '-map', '0:a?', '-c', 'copy', '-f', 'streamhash', '-hash', 'sha256', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 20 }
    );
  } catch (error) {
    fail(`ffmpeg could not hash the streams of ${file.replace(`${ROOT}/`, '')} (${String(error.message ?? error).split('\n')[0]})`);
  }
  const streams = {};
  for (const line of out.trim().split('\n')) {
    const match = /^\d+,([va]),SHA256=([0-9a-f]{64})$/.exec(line.trim());
    if (!match) continue;
    const kind = match[1] === 'v' ? 'video' : 'audio';
    if (streams[kind]) fail(`${file.replace(`${ROOT}/`, '')} has more than one ${kind} stream`);
    streams[kind] = match[2];
  }
  if (!streams.video) fail(`${file.replace(`${ROOT}/`, '')} has no video stream`);
  return streams;
}

const sameStreams = (a, b) => a.video === b.video && (a.audio ?? null) === (b.audio ?? null);

/** `100.0 s` becomes 100. */
const secondsOf = (length) => Number.parseFloat(length);

/** A script's length beside a render's duration: the kit writes one decimal, so 74.85 s reads `74.8 s`. */
const sameLength = (length, seconds) => Math.abs(secondsOf(length) - seconds) <= 0.1;

const SCRIPT_HEADER = '| Time | Voice | Line | On screen |';
const SCRIPT_TIME = /^\d+:\d{2}\.\d{2}$/;
const SCRIPT_LENGTH = /^\d+(?:\.\d+)? s$/;
const SCRIPT_VOICE = /^[A-Z][A-Za-z ]*: \S/;

/** `1:05.66` becomes 65.66. */
function timeOf(text) {
  const [minutes, seconds] = text.split(':');
  return Number(minutes) * 60 + Number(seconds);
}

/** The cells of a table line, outer pipes dropped. */
function cellsOf(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

/** A line's words for the search: no markup and no Subtitle label, the <br> a space. */
function searchWords(text) {
  return text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\*Subtitle:\*/g, ' ')
    .replace(/\*+/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * A script as built (motion/kit/script-export.py): an h1, the line
 * `<length> s · <label> · <Voice>: <name> ...`, the story in one paragraph,
 * the table Time | Voice | Line | On screen with every time later than the
 * one before, then a closing note. Throws on any other shape, before
 * anything is written. Returns the second line's facts, the line count and
 * the words the search matches (the story and the spoken lines).
 */
function scriptOf(file) {
  const where = file.replace(`${ROOT}/`, '');
  const lines = readLines(file);
  const title = /^# (.+)$/.exec(lines[0] ?? '')?.[1]?.trim();
  if (!title) fail(`${where} does not open with an h1`);
  const header = lines.findIndex((line) => line.trim() === SCRIPT_HEADER);
  if (header < 0) fail(`${where} has no "${SCRIPT_HEADER}" table`);
  const front = paragraphs(lines.slice(1, header));
  const [meta, ...story] = front;
  if (!meta || story.length !== 1) fail(`${where} needs its length line and a one-paragraph story above the table`);
  const [length, ...fields] = meta.split(' · ').map((field) => field.trim());
  if (!SCRIPT_LENGTH.test(length ?? '')) fail(`${where}: "${meta}" does not open with a length such as 100.0 s`);
  const voices = fields.filter((field) => SCRIPT_VOICE.test(field));
  const labels = fields.filter((field) => !SCRIPT_VOICE.test(field));
  if (labels.length > 1) fail(`${where}: "${meta}" names more than one cut`);
  if (voices.length === 0) fail(`${where}: "${meta}" names no voice`);
  if (!/^\|[\s|:-]+\|$/.test(lines[header + 1]?.trim() ?? '')) fail(`${where}: the table's separator row is missing`);
  const rows = [];
  let end = header + 2;
  for (; end < lines.length && lines[end].trim().startsWith('|'); end += 1) {
    const cells = cellsOf(lines[end]);
    if (cells.length !== 4) fail(`${where}: table row ${rows.length + 1} has ${cells.length} cells, not 4`);
    if (!SCRIPT_TIME.test(cells[0])) fail(`${where}: table row ${rows.length + 1} starts at "${cells[0]}", not m:ss.cc`);
    if (rows.length > 0 && timeOf(cells[0]) <= timeOf(rows[rows.length - 1][0])) fail(`${where}: table row ${rows.length + 1} does not start after the row before it`);
    /* a silent row (an end card) reads "No voice" and may leave its line empty */
    if (!cells[1] || (!cells[2] && !/^no voice$/i.test(cells[1]))) fail(`${where}: table row ${rows.length + 1} has no voice or no line`);
    rows.push(cells);
  }
  if (rows.length === 0) fail(`${where} has an empty table`);
  if (lines.slice(end).some((line) => line.trim().startsWith('|'))) fail(`${where} has a second table`);
  const spoken = rows.filter((row) => !/^no voice$/i.test(row[1])).map((row) => searchWords(row[2]));
  return {
    length,
    label: labels[0],
    voices: voices.join(' · '),
    lines: rows.length,
    words: [searchWords(story[0]), ...spoken].join(' '),
  };
}

/** The pixel size of a lossy, lossless or extended WebP, from its first chunk. */
function webpSize(bytes, where) {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') fail(`${where} is not a WebP`);
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
  fail(`${where} has an unknown WebP chunk ${chunk}`);
}

/** The pixel size of a PNG, from its IHDR. */
function pngSize(bytes, where) {
  if (bytes.readUInt32BE(0) !== 0x89504e47 || bytes.toString('ascii', 12, 16) !== 'IHDR') fail(`${where} is not a PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/**
 * The frames a sheet shows when its grid is the kit's for a cut of this
 * length: two a second from frame 0, eight to a row. Undefined when the
 * picture is some other grid, so the page states no count it cannot read.
 */
function sheetFrames(size, seconds) {
  const { width, height, gap, perSecond } = SHEET_TILE;
  const columns = (size.width + gap) / (width + gap);
  const rows = (size.height + gap) / (height + gap);
  if (!Number.isInteger(columns) || !Number.isInteger(rows)) return undefined;
  const frames = Math.ceil(seconds * perSecond - 1e-6);
  return Math.ceil(frames / columns) === rows ? frames : undefined;
}

/** A copy that already holds these bytes is left alone, so a rerun touches nothing. */
function writeIfChanged(file, bytes) {
  if (existsSync(file)) {
    const old = readFileSync(file);
    if (old.equals(Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes))) return false;
  }
  writeFileSync(file, bytes);
  return true;
}

/**
 * The pinned cuts: `{ films: { <slug>: { cut, length, film, poster, streams } } }`.
 * While --pin runs, an entry may hold only its film and poster paths (and a
 * hand label for a cut made before the scripts).
 */
function readManifest(pinning = false) {
  if (!existsSync(MANIFEST)) fail(`${MANIFEST.replace(`${ROOT}/`, '')} is missing; it pins the cut of each published film`);
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  for (const [slug, pin] of Object.entries(manifest.films ?? {})) {
    const where = `published.json ${slug}`;
    if (typeof pin.film !== 'string' || typeof pin.poster !== 'string') fail(`${where} needs film and poster paths under /media`);
    if (!/^\/media\/[\w.-]+$/.test(pin.film) || !/^\/media\/[\w.-]+$/.test(pin.poster)) fail(`${where}: film and poster are root paths under /media`);
    if (pinning) continue;
    if (pin.cut !== null && typeof pin.cut !== 'string') fail(`${where}: cut is a label or null`);
    if (!SCRIPT_LENGTH.test(pin.length ?? '')) fail(`${where}: length reads like 100.0 s`);
    if (!/^[0-9a-f]{64}$/.test(pin.streams?.video ?? '')) fail(`${where}: streams.video is a SHA-256`);
    if (pin.streams.audio !== undefined && !/^[0-9a-f]{64}$/.test(pin.streams.audio)) fail(`${where}: streams.audio is a SHA-256`);
  }
  for (const slug of manifest.offSite ?? []) {
    if (manifest.films?.[slug]) fail(`published.json both pins and leaves off ${slug}`);
  }
  return manifest;
}

/**
 * The folders that can hold a cut's records: motion/out, then each folder
 * under it with the kit's sheets/ or scripts/ (out/series-100s holds the
 * 100 s cuts of the translation series), in name order.
 */
function cutFolders() {
  const out = join(MOTION, 'out');
  if (!existsSync(out)) return [];
  const archived = readdirSync(out, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .filter((entry) => existsSync(join(out, entry.name, SHEET_DIR)) || existsSync(join(out, entry.name, SCRIPT_DIR)))
    .map((entry) => `out/${entry.name}`)
    .sort();
  return ['out', ...archived];
}

const FOLDERS = cutFolders();

/**
 * The folder that holds a cut: the first whose <slug>.mp4 or
 * <slug>-share.mp4 has these streams. A render whose duration is not the
 * cut's length is not hashed.
 */
function folderWith(slug, streams, seconds) {
  for (const folder of FOLDERS) {
    for (const name of [`${slug}.mp4`, `${slug}-share.mp4`]) {
      const file = join(MOTION, folder, name);
      const duration = durationOf(file);
      if (duration === undefined || Math.abs(duration - seconds) > 0.06) continue;
      if (sameStreams(streamsOf(file), streams)) return folder;
    }
  }
  return undefined;
}

/**
 * The records of the published cut for one film: read from the folder that
 * holds it, or kept from public/motion when no folder does. Each script's
 * label and length must match the pin; a sheet's PNG is kept only under
 * the cap and only when it is the WebP's size.
 */
function publishedRecords(slug, pin) {
  const where = `${slug}'s published cut (${pin.cut ?? 'no label'}, ${pin.length})`;
  const folder = folderWith(slug, pin.streams, secondsOf(pin.length));
  const base = folder ? join(MOTION, folder) : BODY_OUT;
  const files = {
    credits: join(base, `${slug}.credits.txt`),
    webp: join(base, SHEET_DIR, `${slug}.webp`),
    png: join(base, SHEET_DIR, `${slug}.png`),
    script: join(base, SCRIPT_DIR, `${slug}.md`),
  };
  const records = { folder: folder ?? 'public/motion' };
  /* the cut's final render, which the page names: the folder's <slug>.mp4 (a share copy may be what matched) */
  if (folder) {
    const final = [`${slug}.mp4`, `${slug}-share.mp4`].find((name) => existsSync(join(MOTION, folder, name)));
    if (final) records.render = `${REL}/${folder}/${final}`;
  }
  if (existsSync(files.credits)) records.credits = readFileSync(files.credits, 'utf8');
  if (existsSync(files.script)) {
    const meta = scriptOf(files.script);
    if (meta.length !== pin.length || (meta.label ?? null) !== pin.cut) {
      fail(`the script in ${records.folder} reads "${meta.length}${meta.label ? ` · ${meta.label}` : ''}", but ${where} is pinned; its records are not the published cut's`);
    }
    records.script = { text: readFileSync(files.script, 'utf8'), meta };
  }
  if (existsSync(files.webp)) {
    const webp = readFileSync(files.webp);
    const size = webpSize(webp, files.webp);
    let png;
    if (existsSync(files.png) && statSync(files.png).size <= SHEET_PNG_CAP) {
      png = readFileSync(files.png);
      const pngDims = pngSize(png, files.png);
      if (pngDims.width !== size.width || pngDims.height !== size.height) fail(`${files.png} is not the size of ${files.webp}`);
    }
    records.sheet = { webp, png, ...size, frames: sheetFrames(size, secondsOf(pin.length)) };
  }
  return records;
}

/**
 * The cut in motion/out when it is not the published one: its label, when
 * its own script names it and runs its length, and its length. Undefined
 * when motion/out holds the published cut or no render.
 */
function reviewOf(slug, publishedFolder) {
  if (publishedFolder === 'out') return undefined;
  const render = join(MOTION, 'out', `${slug}.mp4`);
  const seconds = durationOf(render);
  if (seconds === undefined) return undefined;
  const scriptFile = join(MOTION, 'out', SCRIPT_DIR, `${slug}.md`);
  let script;
  try {
    script = existsSync(scriptFile) ? scriptOf(scriptFile) : undefined;
  } catch {
    script = undefined;
  }
  const labelled = script && sameLength(script.length, seconds);
  return { label: labelled ? script.label : undefined, length: labelled ? script.length : `${seconds.toFixed(1)} s` };
}

/**
 * --pin <slug>: pins the cut public/media holds for one film. The entry's
 * film and poster paths are written by hand first; this reads the web copy's
 * streams, finds the folder in motion/out that holds them, and takes the
 * cut's label and length from that folder's script (the web copy's duration
 * and the label already pinned when the folder has no script).
 */
function pin(slug) {
  const manifest = readManifest(true);
  const entry = manifest.films?.[slug];
  if (!entry) fail(`published.json has no entry for ${slug}; add its film and poster paths first`);
  const web = join(ROOT, 'public', entry.film);
  if (!existsSync(web)) fail(`${entry.film} is missing under public/`);
  const streams = streamsOf(web);
  const seconds = durationOf(web);
  if (seconds === undefined) fail(`ffprobe could not read ${entry.film}`);
  const folder = folderWith(slug, streams, seconds);
  const scriptFile = folder ? join(MOTION, folder, SCRIPT_DIR, `${slug}.md`) : undefined;
  const script = scriptFile && existsSync(scriptFile) ? scriptOf(scriptFile) : undefined;
  manifest.films[slug] = {
    cut: script ? (script.label ?? null) : (entry.cut ?? null),
    length: script ? script.length : `${seconds.toFixed(1)} s`,
    film: entry.film,
    poster: entry.poster,
    streams,
  };
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `build-motion: pinned ${slug} at ${manifest.films[slug].cut ?? 'no label'}, ${manifest.films[slug].length}${folder ? `, records in motion/${folder}` : ', no folder in motion/out holds it'}`
  );
}

const pinAt = process.argv.indexOf('--pin');
if (pinAt >= 0) {
  const slugs = process.argv.slice(pinAt + 1);
  if (slugs.length === 0) fail('--pin takes one or more film slugs');
  for (const slug of slugs) pin(slug);
  process.exit(0);
}

const MANIFEST_DATA = readManifest();
const PINS = MANIFEST_DATA.films ?? {};
/** roster films the site leaves out (Kevin's call), though the roster keeps them */
const OFF_SITE = new Set(MANIFEST_DATA.offSite ?? []);

/* ---- the roster ---- */

const ROSTER = join(MOTION, 'MOTION.md');
if (!existsSync(ROSTER)) fail(`${ROSTER} is missing; set MOTION_DIR, or run where motion/ exists`);

function rosterEntries() {
  const lines = readLines(ROSTER);
  let inFence = false;
  let inFilms = false;
  const entries = [];
  let current = null;
  for (const line of lines) {
    if (FENCE.test(line)) inFence = !inFence;
    if (!inFence && /^## /.test(line)) {
      inFilms = /^## The films\s*$/.test(line);
      current = null;
      continue;
    }
    if (!inFilms) continue;
    if (!inFence && /^###\s/.test(line)) {
      const match = ENTRY.exec(line);
      if (!match) fail(`MOTION.md: "${line}" in The films is not a roster entry`);
      current = { slug: match[1], heading: match[2], paren: match[3].trim(), lines: [] };
      entries.push(current);
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (entries.length === 0) fail('MOTION.md has no entries under ## The films');
  const seen = new Set();
  for (const entry of entries) {
    checkSlug(entry.slug, `MOTION.md entry ${entry.slug}`);
    if (seen.has(entry.slug)) fail(`MOTION.md lists ${entry.slug} twice`);
    seen.add(entry.slug);
  }
  return entries;
}

/* ---- the packages ---- */

/** The package body: from the package's own h1 to the end, trimmed, one trailing newline. */
function packageBody(file) {
  const lines = readLines(file);
  let from = 0;
  const firstText = lines.findIndex((line) => line.trim() !== '');
  if (/^#\s+Brief:/.test(lines[firstText] ?? '')) {
    const rule = lines.findIndex((line, i) => i > firstText && RULE.test(line));
    if (rule < 0) fail(`${file} opens with a Brief header that no --- closes`);
    from = rule + 1;
  }
  const h1 = lines.findIndex((line, i) => i >= from && /^#\s+/.test(line) && !/^#\s+Brief:/.test(line));
  if (h1 < 0) fail(`${file} has no package h1`);
  const body = lines.slice(h1);
  while (body.length > 0 && body[body.length - 1].trim() === '') body.pop();
  return `${body.join('\n')}\n`;
}

/** The lines of each numbered section, `## N. ` to the next h2, outside fences. */
function splitSections(body, file) {
  const lines = body.split('\n');
  const heads = [];
  let inFence = false;
  lines.forEach((line, i) => {
    if (FENCE.test(line)) inFence = !inFence;
    if (!inFence && /^## /.test(line)) heads.push(i);
  });
  if (heads.length !== 5) fail(`${file} has ${heads.length} h2 sections; the package has five`);
  return heads.map((at, k) => {
    const heading = lines[at];
    const match = /^## ([1-5])\.\s+(.+)$/.exec(heading);
    if (!match || Number(match[1]) !== k + 1) fail(`${file}: "${heading}" is not section ${k + 1}`);
    return { n: k + 1, heading: match[2].trim(), lines: lines.slice(at + 1, heads[k + 1] ?? lines.length), from: at };
  });
}

const isTableLine = (line) => line.startsWith('|');
const isSeparator = (line) => /^[\s|:-]+$/.test(line);

/** The body rows of the first table in a run of lines (the header and its separator left out). */
function tableRows(lines) {
  const start = lines.findIndex(isTableLine);
  if (start < 0) return 0;
  let end = start;
  while (end < lines.length && isTableLine(lines[end])) end += 1;
  return lines.slice(start + 1, end).filter((line) => !isSeparator(line)).length;
}

function plainHeading(text) {
  return text.replace(/\*/g, '').trim();
}

function buildPackage(slug, file) {
  const body = packageBody(file);
  const lines = body.split('\n');
  const title = plainHeading(lines[0].replace(/^#\s+/, ''));
  const sections = splitSections(body, file);
  const lead = paragraphs(lines.slice(1, sections[0].from).filter((line) => !RULE.test(line)));
  const series = lead[0];
  if (!series) fail(`${file} has no series line under its h1`);
  const seriesName = /^(\S+) series\b/.exec(series)?.[1];
  if (!seriesName) fail(`${file}: the series line does not open with "<Name> series"`);

  const [script, post, vocabulary, sources, checks] = sections;
  if (!script.lines.some(isTableLine)) fail(`${file}: section 1 has no table`);
  if (!vocabulary.lines.some(isTableLine)) fail(`${file}: section 3 has no table`);
  for (const group of ['**Verified', '**Contested', '**Unverified']) {
    if (!checks.lines.some((line) => line.startsWith(group))) fail(`${file}: section 5 has no ${group}** group`);
  }
  const numbers = checks.lines.map((line) => /^(\d+)\.\s/.exec(line)?.[1]).filter(Boolean).map(Number);
  numbers.forEach((n, i) => {
    if (n !== i + 1) fail(`${file}: fact-check item ${i + 1} is numbered ${n}`);
  });
  if (numbers.length === 0) fail(`${file}: section 5 has no numbered items`);

  const prose = paragraphs(post.lines.filter((line) => !RULE.test(line))).filter((p) => !COORDINATE.test(p));
  if (prose.length === 0) fail(`${file}: section 2 has no prose`);

  const duration = /\(about (\d+) seconds\)/i.exec(script.heading)?.[1];
  const beats = tableRows(script.lines);
  const urls = sources.lines.join('\n').match(BARE_URL)?.length ?? 0;
  const notes = {
    1: duration ? `About ${duration} seconds, ${beats} beats` : `${beats} beats`,
    2: `${prose.length} paragraphs`,
    3: `${tableRows(vocabulary.lines)} terms`,
    4: `${urls} links`,
    5: `${numbers.length} items`,
  };

  return {
    body,
    summarySource: prose[0],
    pkg: {
      title,
      series,
      seriesName,
      sections: sections.map((section) => ({
        id: PACKAGE_IDS[section.n],
        n: String(section.n).padStart(2, '0'),
        title: section.heading.replace(/\s*\([^()]*\)\s*$/, '').trim(),
        note: notes[section.n],
      })),
    },
  };
}

/* ---- the films ---- */

const films = [];
const bodies = new Map();
const credits = new Map();
/** slug to the published sheet's bytes: `{ webp, png? }` */
const sheets = new Map();
/** slug to the published script's text */
const scripts = new Map();
/** slug to the published script's words, for the search */
const scriptWords = new Map();
/** slug to the folder its records came from, for the log */
const recordFolders = new Map();

const ROSTER_ENTRIES = rosterEntries();
for (const slug of OFF_SITE) {
  if (!ROSTER_ENTRIES.some((entry) => entry.slug === slug)) fail(`published.json leaves off ${slug}, which is not on the MOTION.md roster`);
}

for (const entry of ROSTER_ENTRIES) {
  const { slug } = entry;
  if (OFF_SITE.has(slug)) continue;
  const folder = join(MOTION, 'films', slug);
  const brief = join(folder, 'BRIEF.md');
  const series = existsSync(brief) && /^# Brief: /.test(readFileSync(brief, 'utf8'));
  const title = entry.heading ? capitalize(entry.heading.trim()) : capitalize(slug);

  let length = entry.paren;
  let note;
  const first = paragraphs(entry.lines)[0] ?? '';
  if (!LENGTH.test(entry.paren)) {
    note = entry.paren;
    const found = LENGTH_IN_TEXT.exec(first)?.[1];
    if (!found) fail(`MOTION.md entry ${slug} gives no length`);
    length = found;
  }

  /* the published copy, when every file of it is there; it must still be the pinned cut */
  const pinned = PINS[slug];
  const media =
    pinned && existsSync(join(ROOT, 'public', pinned.film)) && existsSync(join(ROOT, 'public', pinned.poster))
      ? { video: pinned.film, poster: pinned.poster }
      : undefined;
  if (media && !sameStreams(streamsOf(join(ROOT, 'public', media.video)), pinned.streams)) {
    fail(`public${media.video} is not the cut published.json pins for ${slug} (${pinned.cut ?? 'no label'}, ${pinned.length}); run --pin ${slug} once the new cut is approved`);
  }

  /* what the motion folder holds for the film, as repository-relative paths */
  const local = {};
  if (existsSync(folder) && statSync(folder).isDirectory()) local.folder = `${REL}/films/${slug}`;
  const candidates = {
    video: `out/${slug}.mp4`,
    poster: `out/${slug}.png`,
    sheet: `out/_sheets/${slug}.png`,
    draft: `out/_draft-${slug}.mp4`,
  };
  for (const [key, path] of Object.entries(candidates)) {
    if (existsSync(join(MOTION, path))) local[key] = `${REL}/${path}`;
  }

  const status = media || local.video ? 'rendered' : local.folder ? 'in-production' : 'planned';
  const runtime = runtimeOf(media ? join(ROOT, 'public', media.video) : local.video ? join(MOTION, `out/${slug}.mp4`) : undefined);
  /* the version rule: the published cut's records, and the cut in review */
  const records = media ? publishedRecords(slug, pinned) : undefined;
  const review = media ? reviewOf(slug, records.folder) : undefined;
  const creditText = records?.credits;
  if (creditText) credits.set(slug, creditText);
  if (records) recordFolders.set(slug, records.folder);
  let sheet;
  if (records?.sheet) {
    const { webp, png, width, height, frames } = records.sheet;
    sheets.set(slug, { webp, png });
    sheet = {
      src: `/motion/${SHEET_DIR}/${slug}.webp`,
      width,
      height,
      bytes: webp.length,
      frames,
      png: png ? `/motion/${SHEET_DIR}/${slug}.png` : undefined,
      pngBytes: png ? png.length : undefined,
    };
  }
  let script;
  if (records?.script) {
    const { text, meta } = records.script;
    scripts.set(slug, text);
    scriptWords.set(slug, meta.words);
    script = { src: `/motion/${SCRIPT_DIR}/${slug}.md`, label: meta.label, length: meta.length, voices: meta.voices, lines: meta.lines };
  }
  const postSlug = BLOG_POST[slug];
  const post = postSlug && existsSync(join(ROOT, 'content/blog', `${postSlug}.mdx`)) ? `/blog/${postSlug}` : undefined;

  let pkg;
  let summary;
  if (series) {
    const built = buildPackage(slug, brief);
    pkg = built.pkg;
    bodies.set(slug, built.body);
    summary = summaryOf(built.summarySource, `${slug}/BRIEF.md`);
  } else {
    summary = summaryOf(first, `MOTION.md entry ${slug}`);
  }

  films.push({
    slug,
    title,
    length,
    note,
    runtime,
    status,
    section: series ? 'motion-series' : 'motion-films',
    summary,
    media,
    local: Object.keys(local).length > 0 ? local : undefined,
    post,
    credits: creditText ? `/motion/${slug}.credits.txt` : undefined,
    cut: media ? { label: pinned.cut ?? undefined, length: pinned.length, render: records.render } : undefined,
    sheet,
    script,
    review,
    pkg,
  });
}

for (const slug of Object.keys(PINS)) {
  if (!films.some((film) => film.slug === slug)) fail(`published.json pins ${slug}, which is not on the MOTION.md roster`);
}

/* page order: the roster's other films, then the series, each in roster order */
const ordered = SECTIONS.flatMap((section) => films.filter((film) => film.section === section.id));
ordered.forEach((film, i) => {
  film.n = String(i + 1).padStart(2, '0');
});

/* ---- motion.ts ---- */

/** A single-quoted TypeScript string literal. */
function quote(text) {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function objectLines(indent, fields) {
  const pad = ' '.repeat(indent);
  return Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${pad}${key}: ${typeof value === 'number' ? String(value) : quote(value)},`);
}

/** `key: { ... },` at four spaces, the fields at six; nothing for an absent object. */
function nested(key, fields) {
  return fields ? [`    ${key}: {`, ...objectLines(6, fields), '    },'] : [];
}

function filmLines(film) {
  const lines = [
    '  {',
    `    slug: ${quote(film.slug)},`,
    `    id: ${quote(`film-${film.slug}`)},`,
    `    n: ${quote(film.n)},`,
    `    title: ${quote(film.title)},`,
    `    length: ${quote(film.length)},`,
  ];
  if (film.note) lines.push(`    note: ${quote(film.note)},`);
  if (film.runtime) lines.push(`    runtime: ${quote(film.runtime)},`);
  lines.push(`    status: ${quote(film.status)},`, `    section: ${quote(film.section)},`, `    summary: ${quote(film.summary)},`);
  if (film.media) lines.push('    media: {', ...objectLines(6, film.media), '    },');
  if (film.local) lines.push('    local: {', ...objectLines(6, film.local), '    },');
  if (film.post) lines.push(`    post: ${quote(film.post)},`);
  if (film.credits) lines.push(`    credits: ${quote(film.credits)},`);
  lines.push(...nested('cut', film.cut), ...nested('sheet', film.sheet), ...nested('script', film.script), ...nested('review', film.review));
  if (film.pkg) {
    lines.push(
      '    pkg: {',
      `      title: ${quote(film.pkg.title)},`,
      `      series: ${quote(film.pkg.series)},`,
      `      seriesName: ${quote(film.pkg.seriesName)},`,
      '      sections: [',
      ...film.pkg.sections.map(
        (s) => `        { id: ${quote(s.id)}, n: ${quote(s.n)}, title: ${quote(s.title)}, note: ${quote(s.note)} },`
      ),
      '      ],',
      '    },'
    );
  }
  lines.push('  },');
  return lines;
}

const out = [
  "/* Generated by scripts/build/motion.mjs (pnpm build:motion) from motion/MOTION.md's",
  "   roster (\"## The films\") and the translation series' motion/films/<slug>/BRIEF.md.",
  '   Do not edit by hand. motion/ is untracked; this file and public/motion/ (the',
  '   packages, and the published cuts\' credits, sheets and scripts under the version',
  '   rule pinned in public/motion/published.json) are what the site reads, so it builds',
  '   without motion/. Statuses are read from the files when the script runs: rerun it',
  '   after a render lands. */',
  '',
  "export type MotionStatus = 'rendered' | 'in-production' | 'planned';",
  `export type MotionSectionId = ${SECTIONS.map((s) => quote(s.id)).join(' | ')};`,
  `export type PackageSectionId = ${Object.values(PACKAGE_IDS).map(quote).join(' | ')};`,
  '',
  '/** A published render under public/media: root paths the page can play. */',
  'export type MotionMedia = { video: string; poster: string };',
  '',
  '/** Repository-relative paths that existed in motion/ at build time. Display only; never served. */',
  'export type MotionLocal = { folder?: string; video?: string; poster?: string; sheet?: string; draft?: string };',
  '',
  '/** One of the five sections of a research package, with a note read from its contents. */',
  'export type PackageSection = { id: PackageSectionId; n: string; title: string; note: string };',
  '',
  '/**',
  ' * The published cut as public/motion/published.json pins it: its label (absent for a cut',
  ' * made before the scripts), its length, and the repository-relative path of its final',
  ' * render when a folder in motion/out holds it (display only; never served).',
  ' */',
  'export type MotionCut = { label?: string; length: string; render?: string };',
  '',
  '/**',
  ' * The published cut\'s contact sheet (two frames a second from frame 0, eight to a row):',
  ' * the WebP the page shows, its pixel size and bytes, the frames it holds when its grid',
  ' * is the kit\'s, and the full-resolution PNG when it is published.',
  ' */',
  'export type MotionSheet = { src: string; width: number; height: number; bytes: number; frames?: number; png?: string; pngBytes?: number };',
  '',
  '/** The published cut\'s script as built: the copy served at src, the label, length and voices of its second line, and its count of lines. */',
  'export type MotionScript = { src: string; label?: string; length: string; voices: string; lines: number };',
  '',
  '/** A newer cut in motion/out, in review and not published: its label when its own script names it, and its length. Nothing else of it reaches the site. */',
  'export type MotionReview = { label?: string; length: string };',
  '',
  'export type MotionPackage = {',
  '  /** the package h1 as plain text (asterisks stripped) */',
  '  title: string;',
  '  /** the series line under the h1, inline markdown */',
  '  series: string;',
  '  /** the word before " series": `Chinese`, `Hebrew` */',
  '  seriesName: string;',
  '  sections: readonly PackageSection[];',
  '};',
  '',
  'export type MotionFilm = {',
  '  /** the roster slug; also /motion/<slug> for a film with a package */',
  '  slug: string;',
  '  /** `film-<slug>`: the shell item id and the row anchor on /motion */',
  '  id: string;',
  "  /** '01' to '12' in page order */",
  '  n: string;',
  '  /** the roster title, first letter capitalized; an entry without one takes its slug */',
  '  title: string;',
  '  /** the planned length from the roster: `45 to 50 s` */',
  '  length: string;',
  '  /** a roster parenthetical that is not a length: `assembled last` */',
  '  note?: string;',
  '  /** the final render\'s running time, `1:40`, read with ffprobe when it was available */',
  '  runtime?: string;',
  '  status: MotionStatus;',
  '  section: MotionSectionId;',
  '  /** one sentence of inline markdown */',
  '  summary: string;',
  '  media?: MotionMedia;',
  '  local?: MotionLocal;',
  '  /** the blog post the film trails, when it is on this site */',
  '  post?: string;',
  '  /** a published film\'s credits, copied verbatim from the folder that holds its published cut and served at this root path */',
  '  credits?: string;',
  '  /** the published cut, for a film with a web copy */',
  '  cut?: MotionCut;',
  '  /** the published cut\'s contact sheet, when the Videos session made one */',
  '  sheet?: MotionSheet;',
  '  /** the published cut\'s script as built, when the Videos session made one */',
  '  script?: MotionScript;',
  '  /** the cut in motion/out when it is not the published one */',
  '  review?: MotionReview;',
  '  pkg?: MotionPackage;',
  '};',
  '',
  '/** The two sections of /motion in page order, with their labels and leads. */',
  'export const MOTION_SECTIONS: readonly { id: MotionSectionId; label: string; lead: string }[] = [',
  ...SECTIONS.map((s) => `  { id: ${quote(s.id)}, label: ${quote(s.label)}, lead: ${quote(s.lead)} },`),
  '];',
  '',
  '/** Where the generator writes each package body, relative to the repository root; the file is served at /motion/<slug>.md. */',
  `export const MOTION_BODY_DIR = ${quote(BODY_DIR)};`,
  '',
  '/** Every film on the roster, in page order. */',
  'export const MOTION_FILMS: readonly MotionFilm[] = [',
  ...ordered.flatMap(filmLines),
  '];',
  '',
  '/** Each published script\'s story and spoken lines as plain text, by film slug: what the search matches a script on. */',
  'export const MOTION_SCRIPT_WORDS: Readonly<Record<string, string>> = {',
  ...ordered.filter((film) => scriptWords.has(film.slug)).map((film) => `  ${quote(film.slug)}: ${quote(scriptWords.get(film.slug))},`),
  '};',
  '',
  '/** The films with a research package, each a page at /motion/<slug>. */',
  'export const MOTION_PACKAGE_SLUGS: readonly string[] = [',
  ...ordered.filter((film) => film.pkg).map((film) => `  ${quote(film.slug)},`),
  '];',
  '',
  'const FILM_BY_SLUG: ReadonlyMap<string, MotionFilm> = new Map(MOTION_FILMS.map((film) => [film.slug, film]));',
  '',
  '/** The film a slug names, or undefined for a slug that is not on the roster. */',
  'export function getMotionFilm(slug: string): MotionFilm | undefined {',
  '  return FILM_BY_SLUG.get(slug);',
  '}',
  '',
  '/** Where a film opens: its package page, or its row on /motion. */',
  'export function motionHref(film: MotionFilm): string {',
  '  return film.pkg ? `/motion/${film.slug}` : `/motion#${film.id}`;',
  '}',
  '',
  'export const MOTION_STATUS_LABEL: Readonly<Record<MotionStatus, string>> = {',
  ...Object.entries(STATUS_LABEL).map(([key, label]) => `  ${/^[a-z]+$/.test(key) ? key : quote(key)}: ${quote(label)},`),
  '};',
  '',
];

/* ---- guards, then the writes ---- */

const text = out.join('\n');
out.forEach((line, i) => {
  if (/['"`(]#[0-9a-fA-F]{6}\b/.test(line)) fail(`motion.ts line ${i + 1} would carry a quoted hex color: ${line.trim().slice(0, 80)}`);
});
if (text.includes('/Users/')) fail('motion.ts would carry an absolute local path');
for (const [slug, body] of bodies) {
  if (body.includes('/Users/')) fail(`public/motion/${slug}.md would carry an absolute local path`);
}
for (const [slug, credit] of credits) {
  if (credit.includes('/Users/')) fail(`public/motion/${slug}.credits.txt would carry an absolute local path`);
}
for (const [slug, script] of scripts) {
  if (script.includes('/Users/')) fail(`public/motion/${SCRIPT_DIR}/${slug}.md would carry an absolute local path`);
}

writeFileSync(OUT, text);

mkdirSync(BODY_OUT, { recursive: true });
let removed = 0;
for (const entry of readdirSync(BODY_OUT)) {
  const stale =
    entry.endsWith('.credits.txt') ? !credits.has(entry.slice(0, -'.credits.txt'.length)) : entry.endsWith('.md') && !bodies.has(entry.slice(0, -3));
  if (stale) {
    unlinkSync(join(BODY_OUT, entry));
    removed += 1;
  }
}
for (const [slug, credit] of credits) {
  writeIfChanged(join(BODY_OUT, `${slug}.credits.txt`), credit);
}
let bytes = 0;
for (const [slug, body] of bodies) {
  writeIfChanged(join(BODY_OUT, `${slug}.md`), body);
  bytes += Buffer.byteLength(body);
}

/* the published cuts' sheets and scripts: a file no published cut owns goes */
const wanted = new Map();
for (const [slug, sheet] of sheets) {
  wanted.set(`${SHEET_DIR}/${slug}.webp`, sheet.webp);
  if (sheet.png) wanted.set(`${SHEET_DIR}/${slug}.png`, sheet.png);
}
for (const [slug, script] of scripts) wanted.set(`${SCRIPT_DIR}/${slug}.md`, script);
let copied = 0;
for (const dir of [SHEET_DIR, SCRIPT_DIR]) {
  mkdirSync(join(BODY_OUT, dir), { recursive: true });
  for (const entry of readdirSync(join(BODY_OUT, dir))) {
    if (wanted.has(`${dir}/${entry}`)) continue;
    unlinkSync(join(BODY_OUT, dir, entry));
    removed += 1;
  }
}
for (const [path, content] of wanted) {
  if (writeIfChanged(join(BODY_OUT, path), content)) copied += 1;
}

const counts = Object.entries(STATUS_LABEL)
  .map(([status, label]) => `${label.toLowerCase()} ${films.filter((film) => film.status === status).length}`)
  .join(', ');
console.log(`build-motion: ${films.length} films (${counts}) -> ${OUT.replace(`${ROOT}/`, '')}, ${(Buffer.byteLength(text) / 1024).toFixed(1)} KB`);
console.log(
  `build-motion: ${bodies.size} packages, ${(bytes / 1024).toFixed(0)} KB -> ${BODY_DIR}/<slug>.md, ${credits.size} credit files -> ${BODY_DIR}/<slug>.credits.txt${removed > 0 ? ` (${removed} stale removed)` : ''}`
);
for (const film of ordered.filter((f) => f.cut)) {
  const records = [film.credits && 'credits', film.sheet && (film.sheet.png ? 'sheet (WebP, PNG)' : 'sheet (WebP)'), film.script && 'script'].filter(Boolean);
  console.log(
    `build-motion: ${film.slug}: published ${film.cut.label ?? 'cut'}, ${film.cut.length}; ${records.length > 0 ? `${records.join(', ')} from ${recordFolders.get(film.slug)}` : 'no records'}${film.review ? `; in review: ${film.review.label ? `${film.review.label}, ` : ''}${film.review.length}` : ''}`
  );
}
console.log(`build-motion: ${sheets.size} sheets and ${scripts.size} scripts -> ${BODY_DIR}/${SHEET_DIR}, ${BODY_DIR}/${SCRIPT_DIR} (${copied} written)`);
