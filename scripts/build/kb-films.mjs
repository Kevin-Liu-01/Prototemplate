// Mirrors gt-cloud's knowledge base films into the hub: writes
// src/lib/kb-films.ts, the typed list /motion's knowledge base section reads,
// and copies each film's poster and captions to public/static/videos/, the
// paths generaltranslation.com serves them at. The list is gt-cloud's
// FILM_LIST in apps/landing/src/lib/seo/films.ts, in its order; each film's
// video is gt-cloud's FILM_STORE URL (the films/v2 folder of the gt-films
// Vercel Blob store, which carries the refined globe logo since #6044), so
// the hub plays the same file the site does and keeps no copy of it.
//
// gt-cloud is read with git, never through a working tree: the script runs
// `git show <ref>:<path>` in the checkout GT_CLOUD names (default
// ~/gt/gt-cloud) at GT_CLOUD_REF (default origin/main), so a dirty checkout
// changes nothing. Fetch first. films.ts is TypeScript with gt-next's msg()
// around each string; the script transpiles it with the typescript package
// and runs it with msg() as the identity, so a change to the file's shape
// fails here instead of writing a wrong list. A rerun on the same commit
// writes byte-identical files.
//
// Usage: pnpm build:kb-films
//        GT_CLOUD=<checkout> GT_CLOUD_REF=<ref> node scripts/build/kb-films.mjs
//        node scripts/build/kb-films.mjs --check   (exit 1 when a rerun would change a file)
// Requires: git, and a gt-cloud checkout with the ref fetched.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';

import ts from 'typescript';

import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

const CHECK = process.argv.includes('--check');
const GT_CLOUD = process.env.GT_CLOUD ?? join(homedir(), 'gt/gt-cloud');
const REF = process.env.GT_CLOUD_REF ?? 'origin/main';
const FILMS_TS = 'apps/landing/src/lib/seo/films.ts';
const SRC_DIR = 'apps/landing/public/static/videos';
const OUT = join(ROOT, 'src/lib/kb-films.ts');
const PUBLIC_DIR = 'public/static/videos';
const OUT_DIR = join(ROOT, PUBLIC_DIR);

function git(args, encoding = 'utf8') {
  return execFileSync('git', ['-C', GT_CLOUD, ...args], { encoding, maxBuffer: 64 * 1024 * 1024 });
}

function fail(message) {
  console.error(`build-kb-films: ${message}`);
  process.exit(1);
}

if (!existsSync(GT_CLOUD)) fail(`no gt-cloud checkout at ${GT_CLOUD}; set GT_CLOUD`);
const commit = git(['rev-parse', '--short=10', REF]).trim();
const source = git(['show', `${REF}:${FILMS_TS}`]);

/* run films.ts with msg() as the identity and read its FILM_LIST */
const js = ts.transpileModule(`${source}\n;exports.__FILM_LIST = FILM_LIST;\n`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exportsObject = {};
const sandbox = {
  exports: exportsObject,
  require: (name) => {
    if (name === 'gt-next') return { msg: (text) => text };
    if (name === '@/lib/seo/types') return {};
    throw new Error(`films.ts imports ${name}, which this script does not stub`);
  },
  Intl,
};
vm.runInNewContext(js, sandbox, { filename: FILMS_TS });
const list = exportsObject.__FILM_LIST;
if (!Array.isArray(list) || list.length === 0) fail(`${FILMS_TS} at ${commit} has no FILM_LIST`);

const store = String(list[0].video).replace(/\/[^/]+\.mp4$/, '');
const films = list.map((film, i) => {
  const where = `${FILMS_TS} entry ${i + 1} (${film.slug})`;
  for (const key of ['slug', 'name', 'description', 'video', 'poster', 'uploadDate']) {
    if (typeof film[key] !== 'string' || film[key] === '') fail(`${where} has no string ${key}`);
  }
  for (const key of ['width', 'height', 'duration']) {
    if (!Number.isFinite(film[key])) fail(`${where} has no number ${key}`);
  }
  if (!film.slug.startsWith('kb-')) fail(`${where}: the slug does not start with kb-`);
  if (film.video !== `${store}/${film.slug}.mp4`) fail(`${where}: the video is not ${store}/${film.slug}.mp4`);
  if (film.poster !== `/static/videos/${film.slug}.jpg`) fail(`${where}: the poster is not /static/videos/${film.slug}.jpg`);
  if (film.captions !== undefined && film.captions !== `/static/videos/${film.slug}.vtt`) fail(`${where}: the captions are not /static/videos/${film.slug}.vtt`);
  return {
    slug: film.slug,
    title: film.name,
    summary: film.description,
    video: film.video,
    poster: film.poster,
    ...(film.captions ? { captions: film.captions } : {}),
    width: film.width,
    height: film.height,
    duration: film.duration,
    uploadDate: film.uploadDate,
  };
});
const slugs = new Set(films.map((film) => film.slug));
if (slugs.size !== films.length) fail('FILM_LIST repeats a slug');

/* the files each film needs, read from the same commit */
const wanted = new Map();
for (const film of films) {
  wanted.set(`${film.slug}.jpg`, film.poster);
  if (film.captions) wanted.set(`${film.slug}.vtt`, film.captions);
}

const q = (text) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const lines = [
  `/* Generated by scripts/build/kb-films.mjs (pnpm build:kb-films) from gt-cloud ${commit}:`,
  `   ${FILMS_TS}'s FILM_LIST, in its order, with each poster and captions file copied`,
  `   to ${PUBLIC_DIR}/. Do not edit by hand. The videos are gt-cloud's own files on the`,
  `   gt-films Blob store (FILM_STORE, films/v2 since #6044), so the hub plays what`,
  '   generaltranslation.com plays. */',
  '',
  '/** One knowledge base film as generaltranslation.com publishes it. */',
  'export type KbFilm = {',
  '  slug: string;',
  '  /** the visible title, a question */',
  '  title: string;',
  '  /** the visible summary, inline markdown */',
  '  summary: string;',
  '  /** the film on the gt-films Blob store */',
  '  video: string;',
  '  /** the poster, served from public/ */',
  '  poster: string;',
  '  /** English captions for a narrated film, served from public/ */',
  '  captions?: string;',
  '  width: number;',
  '  height: number;',
  '  /** seconds */',
  '  duration: number;',
  '  /** ISO 8601 with an offset */',
  '  uploadDate: string;',
  '};',
  '',
  '/** The gt-cloud commit the list was read at. */',
  `export const KB_FILMS_SOURCE = ${q(`gt-cloud ${commit}`)};`,
  '',
  '/** The folder of the gt-films Blob store the films play from. */',
  `export const KB_FILM_STORE = ${q(store)};`,
  '',
  '/** Every knowledge base film on generaltranslation.com, in gt-cloud\'s order. */',
  'export const KB_FILMS: readonly KbFilm[] = [',
  ...films.map((film) => {
    const fields = Object.entries(film).map(([key, value]) => `    ${key}: ${typeof value === 'number' ? value : q(value)},`);
    return ['  {', ...fields, '  },'].join('\n');
  }),
  '];',
  '',
];
const text = lines.join('\n');

let changed = 0;
function write(path, body) {
  const old = existsSync(path) ? readFileSync(path) : null;
  if (old && Buffer.compare(old, Buffer.from(body)) === 0) return;
  changed += 1;
  if (CHECK) {
    console.error(`build-kb-films: ${path.replace(`${ROOT}/`, '')} would change`);
    return;
  }
  writeFileSync(path, body);
}

if (!CHECK) mkdirSync(OUT_DIR, { recursive: true });
write(OUT, text);
for (const name of wanted.keys()) {
  write(join(OUT_DIR, name), git(['show', `${REF}:${SRC_DIR}/${name}`], 'buffer'));
}
/* a poster or captions file for a film gt-cloud dropped */
let removed = 0;
if (existsSync(OUT_DIR)) {
  for (const name of readdirSync(OUT_DIR)) {
    if (!/^kb-.*\.(jpg|vtt)$/.test(name) || wanted.has(name)) continue;
    removed += 1;
    if (CHECK) console.error(`build-kb-films: ${PUBLIC_DIR}/${name} would be removed`);
    else unlinkSync(join(OUT_DIR, name));
  }
}

if (CHECK) {
  if (changed + removed > 0) fail(`${changed + removed} file(s) differ from gt-cloud ${commit}; run pnpm build:kb-films`);
  console.log(`build-kb-films: ${films.length} films match gt-cloud ${commit}`);
} else {
  console.log(`build-kb-films: ${films.length} films from gt-cloud ${commit} -> src/lib/kb-films.ts, ${wanted.size} files in ${PUBLIC_DIR}/ (${changed} written, ${removed} removed)`);
}
