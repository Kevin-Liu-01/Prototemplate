// Builds src/lib/motion.ts, the typed data behind /motion and /motion/<slug>,
// and public/motion/<slug>.md, the research package each translation-series
// page renders, from the motion folder: the roster in motion/MOTION.md (its
// "## The films" section, one "### <slug>: <title> (<length>)" entry per
// film) and the package in motion/films/<slug>/BRIEF.md of every film that
// has one. A film with a BRIEF.md belongs to the translation series; the
// rest are the roster's other films, kept in roster order.
//
// Each film's status is read from the files, never written by hand: a film
// is rendered when its final render exists (a published copy under
// public/media, or motion/out/<slug>.mp4 by that exact name; a
// _draft-<slug>.mp4 or a <slug>-share.mp4 is not the final), in production
// when its folder under motion/films exists, and planned otherwise. A film
// with a web copy under public/media (PUBLISHED: the two blog films and the
// three films of the translation series) plays on the site; every other
// render stays in the motion folder and is listed by its repository-relative
// path. The script reads motion/ and never writes there, and it never copies
// a render into public/: the web copies are made by hand, each named
// <name>-film.mp4 with the moov atom at the front and <name>-poster.jpg at
// 1920x1080 (public/media/README.md lists every file).
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
// MOTION_DIR overrides the motion folder (default: <repo>/motion).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/lib/motion.ts');
const MOTION = process.env.MOTION_DIR ?? join(ROOT, 'motion');

/** Where the package bodies go, relative to the repository root; the page reads them from process.cwd() and the site serves them under /motion/. */
const BODY_DIR = 'public/motion';
const BODY_OUT = join(ROOT, BODY_DIR);

/** The motion folder as the generated paths name it, relative to the repository root. */
const REL = 'motion';

/**
 * The films with a web copy under public/media, by roster slug: the two blog
 * films (also on /brand) and the three films of the translation series. Each
 * file is checked before it is used, so a slug whose copy is missing reads as
 * its motion folder says.
 */
const PUBLISHED = {
  'blog-designing-docs': { video: '/media/designing-docs-film.mp4', poster: '/media/designing-docs-poster.jpg' },
  'blog-fuma-nama': { video: '/media/fuma-nama-film.mp4', poster: '/media/fuma-nama-poster.jpg' },
  'jihe-yuanben': { video: '/media/jihe-yuanben-film.mp4', poster: '/media/jihe-yuanben-poster.jpg' },
  'journey-to-the-west': { video: '/media/journey-to-the-west-film.mp4', poster: '/media/journey-to-the-west-poster.jpg' },
  'modern-hebrew': { video: '/media/modern-hebrew-film.mp4', poster: '/media/modern-hebrew-poster.jpg' },
};

/**
 * A film's credits, the plain-text file the Videos session writes beside the
 * render (motion/out/<slug>.credits.txt) and asks to ship with the film
 * wherever it is published. It is copied verbatim to public/motion and read by
 * the film's page; its text stays out of motion.ts, whose guards refuse
 * quoted hex colors, and the jihe-yuanben credits name one.
 */
function creditsOf(slug) {
  const file = join(MOTION, 'out', `${slug}.credits.txt`);
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

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

/** `100.0` seconds becomes `1:40`; undefined when ffprobe is missing or cannot read the file. */
function runtimeOf(file) {
  if (!file || !existsSync(file)) return undefined;
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const seconds = Math.round(Number.parseFloat(out.trim()));
    if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  } catch {
    return undefined;
  }
}

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

for (const entry of rosterEntries()) {
  const { slug } = entry;
  const folder = join(MOTION, 'films', slug);
  const brief = join(folder, 'BRIEF.md');
  const series = existsSync(brief);
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

  /* the published copy, when every file of it is there */
  const published = PUBLISHED[slug];
  const media =
    published && existsSync(join(ROOT, 'public', published.video)) && existsSync(join(ROOT, 'public', published.poster))
      ? published
      : undefined;

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
  const creditText = media ? creditsOf(slug) : undefined;
  if (creditText) credits.set(slug, creditText);
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
    pkg,
  });
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
    .map(([key, value]) => `${pad}${key}: ${quote(value)},`);
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
  "/* Generated by scripts/build-motion.mjs (pnpm build:motion) from motion/MOTION.md's",
  "   roster (\"## The films\") and the translation series' motion/films/<slug>/BRIEF.md.",
  '   Do not edit by hand. motion/ is untracked; this file and public/motion/<slug>.md',
  '   are what the site reads, so it builds without motion/. Statuses are read from the',
  '   files when the script runs: rerun it after a render lands. */',
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
  '  /** a published film\'s credits, copied verbatim from motion/out/<slug>.credits.txt and served at this root path */',
  '  credits?: string;',
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
for (const [slug, text] of credits) {
  if (text.includes('/Users/')) fail(`public/motion/${slug}.credits.txt would carry an absolute local path`);
  writeFileSync(join(BODY_OUT, `${slug}.credits.txt`), text);
}
let bytes = 0;
for (const [slug, body] of bodies) {
  writeFileSync(join(BODY_OUT, `${slug}.md`), body);
  bytes += Buffer.byteLength(body);
}

const counts = Object.entries(STATUS_LABEL)
  .map(([status, label]) => `${label.toLowerCase()} ${films.filter((film) => film.status === status).length}`)
  .join(', ');
console.log(`build-motion: ${films.length} films (${counts}) -> ${OUT.replace(`${ROOT}/`, '')}, ${(Buffer.byteLength(text) / 1024).toFixed(1)} KB`);
console.log(
  `build-motion: ${bodies.size} packages, ${(bytes / 1024).toFixed(0)} KB -> ${BODY_DIR}/<slug>.md, ${credits.size} credit files -> ${BODY_DIR}/<slug>.credits.txt${removed > 0 ? ` (${removed} stale removed)` : ''}`
);
