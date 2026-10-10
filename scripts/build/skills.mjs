// Builds src/lib/skills.ts, the typed registry behind /skills, /skills/<slug>
// and the raw files under /skills/<slug>/, from the curated skills in this
// repository: skills/<slug>/SKILL.md and the supporting files beside it. It
// reads nothing outside the checkout, so it runs anywhere the repository is
// cloned.
//
// Every SKILL.md follows one contract, and the build fails on any break:
//   - the folder name is a slug (lowercase letters, digits and hyphens, never
//     `index`) and the frontmatter `name` equals it;
//   - `description` is present, at most 1024 characters, and says when to use
//     the skill ("Use when", or "Use before", "Use after", "Use for");
//   - `metadata.title` is set, names the thing with no leading "The"
//     (Kevin, 2026-10-07: "fix the The titles"), and the body's first h1
//     repeats it;
//   - `metadata.areas` lists one or more areas from AREAS, the first being the
//     area the skill is filed under;
//   - `metadata.updated` is a real date, YYYY-MM-DD;
//   - `metadata.origin` is `prototemplate`, which is how the installer
//     (scripts/skills/install.mjs) knows a folder is its own;
//   - supporting files are .md, .mjs, .json, .py, .sh, .txt or .js, since
//     the route that serves them raw sends text (the last four as
//     text/plain, so a browser shows a script and never runs it).
// It also lints each folder: no em dash in a Markdown file, no /Users/ path
// and no email address in any file, a `## Sources` section in SKILL.md, and
// no slug that the wiki's runtime skill list already holds where that list
// exists on this machine (~/.claude/skills and ~/.agents/skills, or the
// folder KEVIN_WIKI_RUNTIME names), so an install never shadows one of
// Kevin's general skills. A runtime entry that is a link back to this
// checkout's skills, or a copy carrying `origin: prototemplate`, is the
// installer's own and is not a collision. Every skill must also have its row
// in README.md's Skills table.
//
// SKILLS is sorted by the area a skill is filed under, in AREAS order, then
// by ORDER inside the area; a skill missing from ORDER follows the listed
// ones by slug. The first entry's `id: '<slug>'` line is read by
// scripts/lint/lines.mjs and scripts/check/pagecheck/pages.mjs (the first match
// after `export const SKILLS`), so the array keeps that shape.
//
// The output is committed, so the site builds from the registry alone; the
// pages read the SKILL.md bodies and the supporting files from skills/ on
// the server at build time. It also writes skills/README.md, the index a
// reader of the folder sees on GitHub or in an imported copy: every skill by
// the area it is filed under, with its one-line summary (the description's
// first clause, as the /skills rows show it) and its other areas.
//
// Usage:
//   node scripts/build/skills.mjs           write src/lib/skills.ts and skills/README.md
//   node scripts/build/skills.mjs --check   exit 1 when either is stale or a skill breaks the contract
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const SKILLS_DIR = 'skills';
const SOURCE = join(ROOT, SKILLS_DIR);
const OUT_REL = 'src/lib/skills.ts';
const OUT = join(ROOT, OUT_REL);
const INDEX_REL = `${SKILLS_DIR}/README.md`;
const INDEX = join(ROOT, INDEX_REL);
const CHECK = process.argv.includes('--check');

/**
 * The areas with the labels the site shows: the eleven Kevin named, in his
 * order and in his words, then workflow, which holds how the work moves
 * (local servers, proof, landing, reports to Kevin, agent lanes). A skill is
 * filed under its first.
 */
const AREAS = [
  { id: 'voice', label: 'Voice' },
  { id: 'website', label: 'Website' },
  { id: 'landing', label: 'Landing pages' },
  { id: 'aesthetic', label: 'Aesthetic' },
  { id: 'lints', label: 'Lints' },
  { id: 'motion', label: 'Motion' },
  { id: 'graphics', label: 'Graphics' },
  { id: 'videos', label: 'Videos' },
  { id: 'diagrams', label: 'Diagrams' },
  { id: 'isometry', label: 'Isometry' },
  { id: 'components', label: 'Components' },
  { id: 'workflow', label: 'Workflow' },
];

/**
 * The reading order inside each area: the skill a reader needs first leads
 * (the website before the hub and its performance, the taste before the
 * brand, the deck and the rounds, the graphics before the dither they use,
 * and in workflow the order work moves: run it locally, prove it, land it,
 * report it, then run many lanes of it).
 */
const ORDER = [
  'gt-voice',
  'gt-website',
  'prototemplate',
  'gt-performance',
  'gt-landing-pages',
  'gt-aesthetic',
  'gt-brand',
  'gt-deck',
  'gt-explorations',
  'gt-lints',
  'gt-motion',
  'gt-graphics',
  'gt-dither',
  'gt-films',
  'gt-diagrams',
  'gt-isometric',
  'gt-components',
  'gt-local-dev',
  'gt-verify',
  'gt-ship',
  'gt-reporting',
  'gt-orchestration',
];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const WHEN = /\bUse (when|before|after|for)\b/;
/* the types the raw route (src/app/skills/[slug]/[...path]/route.ts) serves; skills.test.mjs keeps the lists equal */
const SUPPORT = /\.(md|mjs|json|py|sh|txt|js)$/;
const MAX_DESCRIPTION = 1024;
const EM_DASH = '\u2014';
const HOME_PATH = /\/Users\/[^/\s]+/;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const SOURCES = /^## Sources\s*$/m;

const FENCE = /^---\s*$/;
const KEY = /^([A-Za-z0-9_-]+):(.*)$/;

/** Whitespace runs become one space; a folded description reads as one line. */
function clean(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/** The common leading indentation of the non-blank lines, stripped from every line. */
function dedent(lines) {
  const indents = lines.filter((line) => line.trim() !== '').map((line) => /^\s*/.exec(line)[0].length);
  const depth = indents.length > 0 ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(depth));
}

/**
 * One scalar value: the text after `key:` and the indented lines that
 * follow it. A block indicator (>, >-, |, |-) folds or keeps the lines; a
 * quote opens a string that may run on; anything else is a plain scalar
 * whose continuation lines join with a space.
 */
function scalar(rest, continuation) {
  const head = rest.trim();
  if (head.startsWith('>') || head.startsWith('|')) {
    const lines = dedent(continuation);
    if (head.startsWith('|')) return lines.join('\n').trim();
    let out = '';
    for (const line of lines) {
      if (line.trim() === '') out += '\n';
      else out += (out === '' || out.endsWith('\n') ? '' : ' ') + line.trim();
    }
    return out.trim();
  }
  const whole = [head, ...continuation.map((line) => line.trim())].join(' ').trim();
  if (whole.startsWith('"')) {
    const close = whole.lastIndexOf('"');
    return close > 0 ? whole.slice(1, close).replace(/\\(["\\/])/g, '$1') : whole;
  }
  if (whole.startsWith("'")) {
    const close = whole.lastIndexOf("'");
    return close > 0 ? whole.slice(1, close).replace(/''/g, "'") : whole;
  }
  return whole;
}

/** The keys of one mapping level: each key with its scalar, or with its nested lines when it opens a map. */
function mapping(lines) {
  const out = {};
  for (let i = 0; i < lines.length; i += 1) {
    const match = KEY.exec(lines[i]);
    if (!match) continue;
    const continuation = [];
    let j = i + 1;
    while (j < lines.length && (/^\s/.test(lines[j]) || lines[j].trim() === '')) {
      continuation.push(lines[j]);
      j += 1;
    }
    while (continuation.length > 0 && continuation[continuation.length - 1].trim() === '') continuation.pop();
    const [, key, rest] = match;
    out[key] = rest.trim() === '' && continuation.some((line) => KEY.test(line.trim())) ? mapping(dedent(continuation)) : scalar(rest, continuation);
    i = j - 1;
  }
  return out;
}

/** The index of the frontmatter's closing fence, or -1 when the file opens with no block. */
function fenceEnd(lines) {
  if (!FENCE.test(lines[0] ?? '')) return -1;
  return lines.findIndex((line, i) => i > 0 && FENCE.test(line));
}

/** Every file under a folder, relative to it, dotfiles left out: references first, then scripts, then the rest. */
function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    if (entry.startsWith('.')) continue;
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) out.push(...walk(abs, base));
    else out.push(relative(base, abs).split(sep).join('/'));
  }
  return out;
}

function fileRank(file) {
  if (file.startsWith('references/')) return 0;
  if (file.startsWith('scripts/')) return 1;
  return 2;
}

/** True for a real calendar date written YYYY-MM-DD. */
function isDate(text) {
  const m = DATE.exec(text);
  if (!m) return false;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return date.getUTCFullYear() === Number(m[1]) && date.getUTCMonth() === Number(m[2]) - 1 && date.getUTCDate() === Number(m[3]);
}

/** The slugs of the wiki's runtime skill list on this machine that are not this checkout's own installs. */
function runtimeSlugs() {
  const dirs = process.env.KEVIN_WIKI_RUNTIME
    ? [process.env.KEVIN_WIKI_RUNTIME]
    : [join(homedir(), '.claude/skills'), join(homedir(), '.agents/skills')];
  const realSource = existsSync(SOURCE) ? realpathSync(SOURCE) : SOURCE;
  const taken = new Map();
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith('.') || taken.has(entry)) continue;
      const abs = join(dir, entry);
      let real = abs;
      try {
        real = realpathSync(abs);
      } catch {
        continue;
      }
      if (real === realSource || real.startsWith(`${realSource}${sep}`)) continue;
      const skillFile = join(real, 'SKILL.md');
      if (existsSync(skillFile) && /^\s+origin:\s*prototemplate\s*$/m.test(readFileSync(skillFile, 'utf8'))) continue;
      taken.set(entry, dir);
    }
  }
  return taken;
}

const failures = [];
const fail = (slug, message) => failures.push(`${slug}: ${message}`);

if (!existsSync(SOURCE)) {
  console.error(`build-skills: ${SKILLS_DIR}/ is missing`);
  process.exit(2);
}

const runtime = runtimeSlugs();
const areaIds = AREAS.map((area) => area.id);
const skills = [];

for (const slug of readdirSync(SOURCE).sort()) {
  const dir = join(SOURCE, slug);
  if (slug.startsWith('.') || !lstatSync(dir).isDirectory()) continue;
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) {
    fail(slug, 'no SKILL.md');
    continue;
  }
  if (!SLUG.test(slug) || slug === 'index') fail(slug, 'the folder name is not a slug (lowercase letters, digits and hyphens; never index)');

  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const end = fenceEnd(lines);
  if (end < 0) {
    fail(slug, 'no frontmatter block');
    continue;
  }
  const data = mapping(lines.slice(1, end));
  const meta = typeof data.metadata === 'object' ? data.metadata : {};
  const name = clean(typeof data.name === 'string' ? data.name : '');
  const description = clean(typeof data.description === 'string' ? data.description : '');
  const title = clean(typeof meta.title === 'string' ? meta.title : '');
  const areas = (typeof meta.areas === 'string' ? meta.areas : '')
    .split(',')
    .map((area) => area.trim())
    .filter(Boolean);
  const updated = typeof meta.updated === 'string' ? meta.updated.trim() : '';

  if (name !== slug) fail(slug, `name '${name}' differs from the folder`);
  if (!description) fail(slug, 'no description');
  else {
    if (description.length > MAX_DESCRIPTION) fail(slug, `the description is ${description.length} characters (at most ${MAX_DESCRIPTION})`);
    if (!WHEN.test(description)) fail(slug, 'the description does not say when to use the skill ("Use when ...")');
  }
  if (!title) fail(slug, 'no metadata.title');
  else {
    if (/^The\s/.test(title)) fail(slug, `metadata.title '${title}' opens with "The"; name the thing itself`);
    const h1 = /^# (.+)$/m.exec(lines.slice(end + 1).join('\n'))?.[1]?.trim();
    if (h1 !== title) fail(slug, `the h1 '${h1 ?? ''}' differs from metadata.title '${title}'`);
  }
  if (areas.length === 0) fail(slug, 'no metadata.areas');
  const unknown = areas.filter((area) => !areaIds.includes(area));
  if (unknown.length > 0) fail(slug, `areas outside the fixed set: ${unknown.join(', ')} (the set: ${areaIds.join(', ')})`);
  if (!isDate(updated)) fail(slug, `metadata.updated '${updated}' is not a YYYY-MM-DD date`);
  if (meta.origin !== 'prototemplate') fail(slug, 'metadata.origin is not prototemplate');
  if (!SOURCES.test(text)) fail(slug, 'no "## Sources" section');
  const owner = runtime.get(slug);
  if (owner) fail(slug, `the slug is already in the wiki's runtime list (${owner}); choose another`);

  const files = walk(dir)
    .filter((rel) => rel !== 'SKILL.md')
    .sort((a, b) => fileRank(a) - fileRank(b) || a.localeCompare(b, 'en'));
  for (const rel of ['SKILL.md', ...files]) {
    if (rel !== 'SKILL.md' && !SUPPORT.test(rel)) fail(slug, `${rel}: supporting files are .md, .mjs, .json, .py, .sh, .txt or .js`);
    const body = readFileSync(join(dir, rel), 'utf8');
    if (rel.endsWith('.md') && body.includes(EM_DASH)) {
      const at = body.split('\n').findIndex((line) => line.includes(EM_DASH));
      fail(slug, `${rel}:${at + 1}: an em dash (rewrite the sentence; see gt-voice)`);
    }
    const home = HOME_PATH.exec(body);
    if (home) fail(slug, `${rel}: names a home path (${home[0]}); write $PROTOTEMPLATE, $GT_CLOUD or ~ instead`);
    const email = EMAIL.exec(body);
    if (email) fail(slug, `${rel}: holds an email address (${email[0]})`);
  }

  skills.push({ id: slug, name, title, description, areas, updated, files });
}

/* README.md's Skills table lists the set, linked as ./skills/<slug>/SKILL.md */
const readme = existsSync(join(ROOT, 'README.md')) ? readFileSync(join(ROOT, 'README.md'), 'utf8') : '';
for (const skill of skills) {
  if (!readme.includes(`(./skills/${skill.id}/SKILL.md)`)) fail(skill.id, "README.md's Skills table does not list it (a row linking ./skills/<slug>/SKILL.md)");
}

const areaRank = new Map(areaIds.map((id, i) => [id, i]));
const orderRank = new Map(ORDER.map((id, i) => [id, i]));
skills.sort(
  (a, b) =>
    (areaRank.get(a.areas[0]) ?? areaIds.length) - (areaRank.get(b.areas[0]) ?? areaIds.length) ||
    (orderRank.get(a.id) ?? ORDER.length) - (orderRank.get(b.id) ?? ORDER.length) ||
    a.id.localeCompare(b.id, 'en')
);

if (failures.length > 0) {
  console.error(`build-skills: ${failures.length} problem${failures.length === 1 ? '' : 's'} in ${SKILLS_DIR}/`);
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}
if (skills.length === 0) {
  console.error(`build-skills: no skills under ${SKILLS_DIR}/`);
  process.exit(1);
}

/** A single-quoted TypeScript string literal. */
function quote(text) {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const list = (items) => `[${items.map(quote).join(', ')}]`;

const output = [
  '/* Generated by scripts/build/skills.mjs (pnpm build:skills) from the curated',
  '   skills in skills/<slug>/SKILL.md. Do not edit by hand: edit a SKILL.md and',
  '   run the script; `pnpm lint:skills` fails while this file is stale. Sorted',
  '   by the area each skill is filed under (its first), in SKILL_AREAS order,',
  "   then by the script's reading order inside the area. The pages read each",
  '   body and supporting file from skills/<slug>/ on the server. */',
  '',
  '/** The areas a skill is filed under, in the order the site lists them. */',
  `export type SkillArea = ${areaIds.map(quote).join(' | ')};`,
  '',
  'export type Skill = {',
  '  /** the folder name under skills/: the slug of the page and of the raw files, and what the hash names */',
  '  id: string;',
  '  /** the frontmatter name; always the folder name */',
  '  name: string;',
  '  /** metadata.title: the page title and the row name */',
  '  title: string;',
  '  /** the frontmatter description, folded to one line: what the skill covers, then when to use it */',
  '  description: string;',
  '  /** metadata.areas; the first is the area the skill is filed under */',
  '  areas: readonly SkillArea[];',
  '  /** metadata.updated, YYYY-MM-DD */',
  '  updated: string;',
  '  /** the supporting files beside SKILL.md, relative to the folder: references, then scripts */',
  '  files: readonly string[];',
  '};',
  '',
  '/** The areas in order, with their labels. */',
  'export const SKILL_AREAS: readonly { id: SkillArea; label: string }[] = [',
  ...AREAS.map((area) => `  { id: ${quote(area.id)}, label: ${quote(area.label)} },`),
  '];',
  '',
  '/** The folder the skills live in, relative to the repository root. */',
  `export const SKILL_DIR = ${quote(SKILLS_DIR)};`,
  '',
  "/** The page of one skill: `/skills/<slug>`. */",
  'export function skillHref(slug: string): string {',
  '  return `/skills/${slug}`;',
  '}',
  '',
  "/** One raw file of a skill as the site serves it: `/skills/<slug>/SKILL.md`, `/skills/<slug>/references/<file>`. */",
  "export function skillFileHref(slug: string, file = 'SKILL.md'): string {",
  '  return `/skills/${slug}/${file}`;',
  '}',
  '',
  'export const SKILLS: readonly Skill[] = [',
  ...skills.flatMap((skill) => [
    '  {',
    `    id: ${quote(skill.id)},`,
    `    name: ${quote(skill.name)},`,
    `    title: ${quote(skill.title)},`,
    `    description: ${quote(skill.description)},`,
    `    areas: ${list(skill.areas)},`,
    `    updated: ${quote(skill.updated)},`,
    `    files: ${list(skill.files)},`,
    '  },',
  ]),
  '];',
  '',
  'const SKILL_BY_SLUG: ReadonlyMap<string, Skill> = new Map(SKILLS.map((skill) => [skill.id, skill]));',
  '',
  '/** The skill a slug names, or undefined for a slug that is not in the set. */',
  'export function getSkill(slug: string): Skill | undefined {',
  '  return SKILL_BY_SLUG.get(slug);',
  '}',
  '',
  '/** One area as the index, the search and the sitemap list it: the skills filed under it, in SKILLS order. */',
  'export type SkillGroup = {',
  '  id: SkillArea;',
  '  label: string;',
  '  /** skills.length, for a count next to the label */',
  '  count: number;',
  '  skills: readonly { slug: string; title: string; href: string }[];',
  '};',
  '',
  '/** The areas with the skills filed under them, in SKILL_AREAS order; an area with none is left out. */',
  'export const SKILL_GROUPS: readonly SkillGroup[] = SKILL_AREAS.map((area) => {',
  '  const skills = SKILLS.filter((skill) => skill.areas[0] === area.id).map((skill) => ({',
  '    slug: skill.id,',
  '    title: skill.title,',
  '    href: skillHref(skill.id),',
  '  }));',
  '  return { id: area.id, label: area.label, count: skills.length, skills };',
  '}).filter((group) => group.count > 0);',
  '',
].join('\n');

/**
 * A description's one-line summary: its first sentence, cut at the first
 * colon, as src/app/skills/model.ts (describe) reads it for the /skills rows.
 */
function summaryOf(description) {
  const useAt = description.search(WHEN);
  const before = (useAt >= 0 ? description.slice(0, useAt) : description).trim();
  const end = before.search(/[.!?](\s|$)/);
  const first = end >= 0 ? before.slice(0, end + 1) : before;
  const colon = first.indexOf(': ');
  return colon > 0 ? `${first.slice(0, colon)}.` : first.trim();
}

const labelOf = (id) => AREAS.find((area) => area.id === id)?.label ?? id;
const cell = (text) => text.replace(/\|/g, '\\|');

const index = [
  '# Skills',
  '',
  "The curated skills of Prototemplate, Kevin Liu's hub for General Translation (GT) work. Each folder holds a `SKILL.md` in the Agent Skills format (frontmatter `name` and `description`, a `metadata` block with the title, the areas and the last update, then the body), with its references and scripts beside it, so Claude Code, Codex and other agents load it as it is.",
  '',
  '- To use them in another project, copy this folder to its root and `scripts/skills/install.mjs` to the same path there, and run `node scripts/skills/install.mjs --project . --dry-run`, then the same command without `--dry-run`. README.md (Skills, and Import this into another project) gives every flag and the other way, linking from a checkout of this repository.',
  '- Several skills name the handbook (`docs/handbook/`), `AGENTS.md`, `BRAND.md` and `DESIGN.md`. Copy them beside the skills, so the links between them keep working.',
  '- The site shows each skill with its files and its install line at prototemplate.com/skills, and `/skills/index.json` lists the set for an agent.',
  '',
  ...AREAS.flatMap((area) => {
    const filed = skills.filter((skill) => skill.areas[0] === area.id);
    if (filed.length === 0) return [];
    return [
      `## ${area.label}`,
      '',
      '| Skill | Title | What it is | Also in |',
      '| --- | --- | --- | --- |',
      ...filed.map(
        (skill) =>
          `| [\`${skill.id}\`](${skill.id}/SKILL.md) | ${cell(skill.title)} | ${cell(summaryOf(skill.description))} | ${skill.areas.slice(1).map(labelOf).join(', ')} |`
      ),
      '',
    ];
  }),
  `This index is written by \`pnpm build:skills\` from each skill's frontmatter, and \`pnpm lint:skills\` fails while it is stale. To change a row, edit the skill's \`SKILL.md\` and run the script. The contract a skill follows is in [\`prototemplate\`](prototemplate/SKILL.md) section 10.`,
  '',
].join('\n');

const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
const currentIndex = existsSync(INDEX) ? readFileSync(INDEX, 'utf8') : '';
const counts = AREAS.map((area) => [area.label, skills.filter((skill) => skill.areas[0] === area.id).length])
  .filter(([, n]) => n > 0)
  .map(([label, n]) => `${label} ${n}`);

if (CHECK) {
  const stale = [current !== output ? OUT_REL : null, currentIndex !== index ? INDEX_REL : null].filter(Boolean);
  if (stale.length > 0) {
    console.error(`build-skills: ${stale.join(' and ')} ${stale.length === 1 ? 'is' : 'are'} stale against ${SKILLS_DIR}/; run pnpm build:skills`);
    process.exit(1);
  }
  console.log(`build-skills: ${skills.length} skills pass the contract, and ${OUT_REL} and ${INDEX_REL} are current`);
} else {
  if (current !== output) writeFileSync(OUT, output);
  if (currentIndex !== index) writeFileSync(INDEX, index);
  const unchanged = current === output && currentIndex === index;
  console.log(`build-skills: ${skills.length} skills (${counts.join(', ')}) -> ${OUT_REL} and ${INDEX_REL}${unchanged ? ' (unchanged)' : ''}`);
}
