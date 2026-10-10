#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * Reports drift between the registries a Prototemplate page, document or
 * skill has to appear in. Pure Node and read-only: it reads the sources
 * with regular expressions, the way scripts/lib/site-pages.mjs reads the
 * registries, so it needs no TypeScript
 * loader and no dev server.
 *
 *   1. Headings. Every h2 of every document the docs registry serves
 *      (src/app/docs/registry.ts, plus README.md as `readme` with the build
 *      log's CRAFT_SECTIONS after it) against DOC_HEADINGS in
 *      src/lib/search-index.ts, and every h2 of the handbook
 *      (src/app/handbook/registry.ts, plus docs/handbook/README.md as
 *      `readme`) against HANDBOOK_HEADINGS, by the anchor
 *      src/app/docs/markdown.tsx gives a heading (headingId). A heading
 *      missing from a table cannot be searched; a table row with no heading
 *      links to a dead anchor.
 *   2. Routes. Every Pages and Knowledge row of src/lib/surfaces.ts with a
 *      fixed path, against the sitemap (src/app/sitemap.ts), public/llms.txt,
 *      the shared route list the browser tools read (scripts/lib/site-pages.mjs,
 *      siteRoutes: a row's `tools` names the capture list, the page check
 *      and the line audit's shell routes), the sidebar's and the search's
 *      icon maps, the search keywords and the row's WebP thumbnail under
 *      public/shots/thumb, where no JPEG may be left (pnpm build:thumbs cuts
 *      a capture pass's JPEGs to WebP and removes them).
 *   3. First slugs. The four regexes scripts/lib/site-pages.mjs uses to find a
 *      first slug in src/lib/skills.ts, src/lib/motion.ts,
 *      src/lib/archive.ts and src/lib/directions.ts. A generator that
 *      changes its output shape breaks every browser gate; this says so
 *      first.
 *   4. Skills (when skills/ exists; --no-skills skips them). Each
 *      skills/<slug> against the frontmatter and body contract of the
 *      curated set.
 *
 * Usage:
 *   node scripts/lint/registries.mjs [--root <dir>] [--no-skills]   (pnpm lint:registries)
 *
 * The root defaults to the checkout this file sits in, then to the working
 * directory. Exit 0 when the hard checks pass, 1 when one fails (heading
 * drift, a page missing from the sitemap or the search icons, a JPEG left
 * in public/shots/thumb, a broken first-slug regex, a skill off its
 * contract), 2 when a file it needs is
 * missing. The other route columns are printed as notes that never fail
 * the run, because not every page belongs in every list (/present is not
 * on the shell, /blog has no thumbnail yet).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

/* no module imports this file, only the shim at the skill's old path */
helpIfAsked(import.meta.url, false);

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};

/** The checkout: --root, else the repository this file sits in, else the working directory. */
function findRoot() {
  const given = flag('--root');
  const candidates = given
    ? [resolve(given)]
    : [REPO_ROOT, process.cwd()];
  for (const dir of candidates) if (existsSync(join(dir, 'src/lib/surfaces.ts'))) return dir;
  console.error(`lint:registries: no Prototemplate checkout at ${candidates.join(' or ')} (src/lib/surfaces.ts missing)`);
  process.exit(2);
}

const ROOT = findRoot();

function read(rel) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) {
    console.error(`lint:registries: missing ${rel}`);
    process.exit(2);
  }
  return readFileSync(abs, 'utf8');
}

/** The text from `start` to the first `end` after it, or an empty string. */
function block(text, start, end) {
  const at = text.indexOf(start);
  if (at < 0) return '';
  const stop = text.indexOf(end, at);
  return stop < 0 ? text.slice(at) : text.slice(at, stop);
}

/** src/app/docs/markdown.tsx, plainText then headingId. */
function headingId(text) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The h2 anchors of a markdown file, fenced code skipped. */
function h2Ids(markdown) {
  const ids = [];
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (/^(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = /^## (.+)$/.exec(line);
    if (m) ids.push(headingId(m[1]));
  }
  return ids;
}

let failures = 0;
const fail = (line) => {
  failures += 1;
  console.log(`  FAIL ${line}`);
};
const note = (line) => console.log(`  note ${line}`);

/* ---- 1. headings ---- */

console.log('Headings: documents against DOC_HEADINGS (src/lib/search-index.ts)');
/** The `slug` and `file` pairs of a registry file, in order. */
function entries(text) {
  return [...text.matchAll(/slug:\s*'([^']+)'[\s\S]*?file:\s*'([^']+)'/g)].map((m) => ({ slug: m[1], file: m[2] }));
}

const registry = read('src/app/docs/registry.ts');
const docs = [{ slug: 'readme', file: 'README.md' }, ...entries(registry)];
/* the handbook registry lists its readme first (HANDBOOK_README), then the documents */
const handbook = existsSync(join(ROOT, 'src/app/handbook/registry.ts')) ? entries(read('src/app/handbook/registry.ts')) : [];

const searchIndex = read('src/lib/search-index.ts');

/** A heading snapshot table in search-index.ts: each key with the anchors its rows name. */
function headingRows(name) {
  const text = block(searchIndex, `const ${name}`, '\n};');
  const keys = [...text.matchAll(/^ {2}(?:'([^']+)'|([a-z0-9-]+)):\s*\[/gm)].map((m) => ({ key: m[1] ?? m[2], at: m.index }));
  const rows = new Map();
  keys.forEach(({ key, at }, i) => {
    const body = text.slice(at, keys[i + 1]?.at ?? text.length);
    rows.set(key, [...body.matchAll(/\[\s*'([a-z0-9-]+)'\s*,/g)].map((m) => m[1]));
  });
  return rows;
}

const table = headingRows('DOC_HEADINGS');
const handbookTable = headingRows('HANDBOOK_HEADINGS');

const craft = block(read('src/app/craft/CraftArticle.tsx'), 'export const CRAFT_SECTIONS', '\n];');
const craftIds = [...craft.matchAll(/^ {4}id: '([^']+)'/gm)].map((m) => m[1]);

let headingDrift = 0;
for (const doc of docs) {
  if (!existsSync(join(ROOT, doc.file))) {
    fail(`${doc.slug}: ${doc.file} is in the docs registry but not on disk`);
    continue;
  }
  const expected = h2Ids(readFileSync(join(ROOT, doc.file), 'utf8'));
  if (doc.slug === 'readme') expected.push(...craftIds);
  const rows = table.get(doc.slug) ?? [];
  const missing = expected.filter((id) => !rows.includes(id));
  const stale = rows.filter((id) => !expected.includes(id));
  if (missing.length === 0 && stale.length === 0) {
    console.log(`  ok   ${doc.slug}: ${expected.length} headings`);
    continue;
  }
  headingDrift += 1;
  if (missing.length > 0) fail(`${doc.slug} (${doc.file}): not in DOC_HEADINGS: ${missing.join(', ')}`);
  if (stale.length > 0) fail(`${doc.slug}: DOC_HEADINGS rows with no heading (dead anchors): ${stale.join(', ')}`);
}
for (const key of table.keys()) {
  if (!docs.some((doc) => doc.slug === key)) fail(`DOC_HEADINGS names '${key}', which the docs registry does not serve`);
}

for (const doc of handbook) {
  if (!existsSync(join(ROOT, doc.file))) {
    fail(`handbook ${doc.slug}: ${doc.file} is in the handbook registry but not on disk`);
    continue;
  }
  const expected = h2Ids(readFileSync(join(ROOT, doc.file), 'utf8'));
  const rows = handbookTable.get(doc.slug) ?? [];
  const missing = expected.filter((id) => !rows.includes(id));
  const stale = rows.filter((id) => !expected.includes(id));
  if (missing.length === 0 && stale.length === 0) {
    console.log(`  ok   handbook ${doc.slug}: ${expected.length} headings`);
    continue;
  }
  headingDrift += 1;
  if (missing.length > 0) fail(`handbook ${doc.slug} (${doc.file}): not in HANDBOOK_HEADINGS: ${missing.join(', ')}`);
  if (stale.length > 0) fail(`handbook ${doc.slug}: HANDBOOK_HEADINGS rows with no heading (dead anchors): ${stale.join(', ')}`);
}
for (const key of handbookTable.keys()) {
  if (!handbook.some((doc) => doc.slug === key)) fail(`HANDBOOK_HEADINGS names '${key}', which the handbook registry does not serve`);
}

/* ---- 2. routes ---- */

console.log('\nRoutes: Pages and Knowledge rows (src/lib/surfaces.ts) against the lists that name them');
const surfaces = read('src/lib/surfaces.ts');
const rows = [];
for (const name of ['const PAGES', 'const KNOWLEDGE']) {
  const body = block(surfaces, name, '\n];');
  /* the name is a literal or pageLabel('<id>') (src/lib/page-names.ts) */
  for (const m of body.matchAll(/internal\(\s*'([^']+)',\s*(?:'[^']*'|pageLabel\('[^']*'\)),\s*(?:'([^']*)'|`([^`]*)`)([\s\S]*?)\)(?:,|\s*$)/gm)) {
    const dynamic = m[3] !== undefined;
    rows.push({ id: m[1], path: m[2] ?? m[3], dynamic, thumb: /thumb\('/.test(m[4]) });
  }
}
if (rows.length === 0) fail('found no internal(...) rows in PAGES or KNOWLEDGE; the surfaces shape changed, update this script');

const sitemap = read('src/app/sitemap.ts');
const llms = read('public/llms.txt');
/* the route list's rows are one line each: `{ id, path, tools: '<tool> <tool>', source }` */
const routeRows = read('scripts/lib/site-pages.mjs').split('\n');
const walks = (p, tool) => routeRows.some((line) => line.includes(`path: '${p}'`) && new RegExp(`tools: '[^']*\\b${tool}\\b`).test(line));
const sidebarIcons = block(read('src/components/viewer/Sidebar.tsx'), 'const PAGE_ICON', '\n};');
const searchIcons = block(searchIndex, 'const PAGE_ICON', '\n};');
const keywords = block(searchIndex, 'const PAGE_KEYWORDS', '\n};');

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasKey = (text, id) => new RegExp(`^\\s*(?:'${escape(id)}'|${escape(id)}):`, 'm').test(text);

const COLUMNS = ['sitemap', 'llms', 'capture', 'pagecheck', 'lines', 'sb-icon', 'search-icon', 'keywords', 'thumb'];
console.log(`  ${'id'.padEnd(10)} ${'path'.padEnd(10)} ${COLUMNS.map((c) => c.padEnd(11)).join(' ')}`);
for (const row of rows) {
  const p = row.path;
  const cells = {
    sitemap: row.dynamic ? 'loop' : sitemap.includes('${SITE_URL}' + p + '`') ? 'yes' : 'NO',
    llms: row.dynamic ? 'n/a' : new RegExp(`\\]\\(https?://[^/)\\s]+${p === '/' ? '/?' : escape(p)}\\)`).test(llms) ? 'yes' : 'no',
    capture: row.dynamic ? 'n/a' : walks(p, 'capture') ? 'yes' : 'no',
    pagecheck: row.dynamic ? 'first' : walks(p, 'check') ? 'yes' : 'no',
    lines: row.dynamic ? 'first' : walks(p, 'lines') ? 'yes' : 'no',
    'sb-icon': hasKey(sidebarIcons, row.id) ? 'yes' : 'fallback',
    'search-icon': hasKey(searchIcons, row.id) ? 'yes' : 'NO',
    keywords: hasKey(keywords, row.id) ? 'yes' : 'no',
    thumb: !row.thumb
      ? 'none'
      : existsSync(join(ROOT, `public/shots/thumb/${row.id}.webp`)) &&
          existsSync(join(ROOT, `public/shots/thumb/${row.id}-dark.webp`))
        ? 'yes'
        : 'MISSING',
  };
  console.log(`  ${row.id.padEnd(10)} ${(row.dynamic ? '(dynamic)' : p).padEnd(10)} ${COLUMNS.map((c) => cells[c].padEnd(11)).join(' ')}`);
  if (cells.sitemap === 'NO') fail(`${row.id}: ${p} is not in src/app/sitemap.ts`);
  if (cells['search-icon'] === 'NO') fail(`${row.id}: no PAGE_ICON entry in src/lib/search-index.ts`);
  if (cells.thumb === 'MISSING') fail(`${row.id}: surfaces.ts points at public/shots/thumb/${row.id}.webp and -dark.webp, which do not both exist`);
}
note('lower-case "no" and "fallback" are notes and do not fail the run: /present is not on the shell, and a row without a sidebar icon draws the pages glyph');

for (const [book, doc] of [...docs.map((d) => ['docs', d]), ...handbook.map((d) => ['handbook', d])]) {
  const stem = `${book}-${doc.slug}`;
  if (!existsSync(join(ROOT, `public/shots/thumb/${stem}.webp`))) {
    note(`${stem}: no thumbnail; run pnpm capture:pages --only ${stem}, then cut public/shots/pages/${stem}-{light,dark}.jpg into public/shots/thumb (pnpm build:thumbs)`);
  }
}
const thumbJpegs = readdirSync(join(ROOT, 'public/shots/thumb')).filter((file) => /\.jpg$/i.test(file));
if (thumbJpegs.length > 0) {
  fail(`public/shots/thumb holds ${thumbJpegs.length} JPEG file(s) (${thumbJpegs.slice(0, 3).join(', ')}); the surfaces read WebP, so run pnpm build:thumbs, which cuts them and removes the JPEGs`);
}

/* ---- 3. first slugs ---- */

console.log('\nFirst slugs: the regexes scripts/lib/site-pages.mjs reads');
const firsts = [
  ['src/lib/skills.ts', /id: '([^']+)'/, 'export const SKILLS'],
  ['src/lib/motion.ts', /'([^']+)'/, 'export const MOTION_PACKAGE_SLUGS'],
  ['src/lib/archive.ts', /entry\('([^']+)'/, undefined],
  ['src/lib/directions.ts', /slug: '([^']+)'/, undefined],
];
for (const [file, pattern, from] of firsts) {
  let text = read(file);
  if (from) {
    const at = text.indexOf(from);
    if (at < 0) {
      fail(`${file}: no "${from}"; the browser gates (scripts/lib/site-pages.mjs) throw`);
      continue;
    }
    text = text.slice(at);
  }
  const slug = text.match(pattern)?.[1];
  if (slug) console.log(`  ok   ${file}: ${slug}`);
  else fail(`${file}: ${pattern} matches nothing after ${from ?? 'the start'}; the browser gates (scripts/lib/site-pages.mjs) throw`);
}

/* ---- 4. skills ---- */

const AREAS = ['voice', 'website', 'landing', 'aesthetic', 'lints', 'motion', 'graphics', 'videos', 'diagrams', 'isometry', 'components', 'workflow'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SUPPORT = /\.(md|mjs|json|py|sh|txt|js)$/;
const MAX_LINES = 500;
const MAX_DESCRIPTION = 1024;

/** The frontmatter keys this contract uses: top-level scalars and folded blocks, and the metadata map. */
function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) return null;
  const out = { metadata: {} };
  const src = m[1].split('\n');
  for (let i = 0; i < src.length; i += 1) {
    const top = /^([a-z_]+):\s*(.*)$/.exec(src[i]);
    if (!top) continue;
    const [, key, rest] = top;
    if (key === 'metadata') {
      while (i + 1 < src.length && /^\s+\S/.test(src[i + 1])) {
        i += 1;
        const sub = /^\s+([a-z_]+):\s*(.*)$/.exec(src[i]);
        if (sub) out.metadata[sub[1]] = sub[2].replace(/^['"]|['"]$/g, '');
      }
      continue;
    }
    if (/^[>|]-?$/.test(rest)) {
      const parts = [];
      while (i + 1 < src.length && (/^\s+\S/.test(src[i + 1]) || src[i + 1] === '')) {
        i += 1;
        parts.push(src[i].trim());
      }
      out[key] = parts.filter(Boolean).join(rest.startsWith('|') ? '\n' : ' ');
    } else {
      out[key] = rest.replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}

/** Every file under a folder, relative to it. */
function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((entry) => {
    const abs = join(dir, entry);
    return statSync(abs).isDirectory() ? walk(abs, base) : [abs.slice(base.length + 1)];
  });
}

const skillsDir = join(ROOT, 'skills');
if (!argv.includes('--no-skills') && existsSync(skillsDir)) {
  console.log('\nSkills: skills/<slug> against the contract');
  for (const slug of readdirSync(skillsDir).sort()) {
    const dir = join(skillsDir, slug);
    if (!statSync(dir).isDirectory()) continue;
    const file = join(dir, 'SKILL.md');
    if (!existsSync(file)) {
      fail(`${slug}: no SKILL.md`);
      continue;
    }
    const text = readFileSync(file, 'utf8');
    const fm = frontmatter(text);
    const problems = [];
    if (!SLUG.test(slug) || slug === 'index') problems.push('folder name is not a slug (lowercase letters, digits, hyphens; never index)');
    if (!fm) problems.push('no frontmatter block');
    else {
      if (fm.name !== slug) problems.push(`name '${fm.name}' differs from the folder`);
      const description = fm.description ?? '';
      if (!description) problems.push('no description');
      if (description.length > MAX_DESCRIPTION) problems.push(`description is ${description.length} characters (at most ${MAX_DESCRIPTION})`);
      if (description && !/\bUse (when|before|after|for)\b/.test(description)) problems.push('description does not say when to use it ("Use when ...")');
      const md = fm.metadata;
      if (!md.title) problems.push('no metadata.title');
      const areas = (md.areas ?? '').split(',').map((a) => a.trim()).filter(Boolean);
      if (areas.length === 0) problems.push('no metadata.areas');
      const unknown = areas.filter((a) => !AREAS.includes(a));
      if (unknown.length > 0) problems.push(`areas outside the fixed set: ${unknown.join(', ')}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(md.updated ?? '')) problems.push('metadata.updated is not YYYY-MM-DD');
      if (md.origin !== 'prototemplate') problems.push('metadata.origin is not prototemplate');
      const h1 = /^# (.+)$/m.exec(text.slice(text.indexOf('\n---\n', 4) + 5))?.[1]?.trim();
      if (md.title && h1 !== md.title) problems.push(`h1 '${h1 ?? ''}' differs from metadata.title '${md.title}'`);
    }
    const count = text.split('\n').length;
    if (count >= MAX_LINES) problems.push(`SKILL.md is ${count} lines (under ${MAX_LINES}; move detail to references/)`);
    if (!/^## Sources\s*$/m.test(text)) problems.push('no "## Sources" section');
    for (const rel of walk(dir)) {
      const body = readFileSync(join(dir, rel), 'utf8');
      if (rel !== 'SKILL.md' && !SUPPORT.test(rel) && !rel.startsWith('assets/')) problems.push(`${rel}: supporting files are .md, .mjs, .json, .py, .sh, .txt or .js`);
      if (/\/Users\/[^/\s]+/.test(body)) problems.push(`${rel}: names an absolute home path; use $PROTOTEMPLATE or $GT_CLOUD`);
      if (/\.md$/.test(rel) && body.includes('\u2014')) problems.push(`${rel}: holds an em dash`);
    }
    if (problems.length === 0) console.log(`  ok   ${slug}`);
    else for (const problem of problems) fail(`${slug}: ${problem}`);
  }
}

console.log(`\nlint:registries: ${failures === 0 ? 'pass' : `${failures} failure${failures === 1 ? '' : 's'}`}${headingDrift ? ` (${headingDrift} documents drift from DOC_HEADINGS)` : ''}`);
process.exit(failures === 0 ? 0 : 1);
