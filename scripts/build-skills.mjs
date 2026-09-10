// Builds src/lib/skills.ts, the typed data behind /skills and /skills/<slug>,
// and public/skills/<slug>.md, the body each skill page renders, from every
// published SKILL.md. Three groups are published: the engineering and
// productivity categories of the wiki's skill tree
// (skills/<category>/<slug>/SKILL.md) and the General Translation
// repository's own skills (.agents/skills/<slug>/SKILL.md). The personal,
// misc, in-progress and deprecated categories stay out. Each skill carries
// its folder name as the id (the slug of its page), the frontmatter name and
// description (folded to one line), its category and its source; the list
// is sorted by category in the order below, then by name. Ids must be unique
// across the groups, since the shell tracks the active skill by id in the
// hash and the page route by slug; an id may not be `index` or contain a
// slash, since /skills/index would shadow the index and a slash would nest
// the route.
//
// Only name and description are read from the frontmatter, so the parser
// handles the scalar forms those two keys take in the tree: plain (with
// indented continuation lines), single and double quoted, and the folded
// and literal block forms (>, >-, |, |-). Nested mappings under other keys
// (metadata:) are skipped.
//
// The body file is the SKILL.md with its frontmatter block removed; a body
// that does not open with an h1 gets the skill's name as one, so every raw
// file reads with a title. Bodies stale from a renamed or retired skill are
// removed. The bodies stay out of the client bundle: the page reads its own
// file on the server (src/app/skills/[slug]/body.ts) and the toolbar links
// the raw file at /skills/<slug>.md.
//
// Both outputs are committed, so the site builds without either checkout;
// this script runs where both exist.
//
// Usage: pnpm build:skills
// KEVIN_WIKI_DIR and GT_CLOUD_DIR override the two checkouts.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/lib/skills.ts');

/** Where the bodies go, relative to the repository root; the page reads them from process.cwd() and the site serves them under /skills/. */
const BODY_DIR = 'public/skills';
const BODY_OUT = join(ROOT, BODY_DIR);

const WIKI = process.env.KEVIN_WIKI_DIR ?? '/Users/kevinliu/repos/Kevin-Wiki-v3';
const GT_CLOUD = process.env.GT_CLOUD_DIR ?? '/Users/kevinliu/gt/gt-cloud';

/** The published groups, in the order the route lists them. */
const CATEGORIES = [
  { id: 'engineering', label: 'Engineering', dir: join(WIKI, 'skills/engineering'), source: 'wiki' },
  { id: 'productivity', label: 'Productivity', dir: join(WIKI, 'skills/productivity'), source: 'wiki' },
  { id: 'general-translation', label: 'General Translation', dir: join(GT_CLOUD, '.agents/skills'), source: 'gt-cloud' },
];

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
 * follow it. A block indicator folds or keeps the lines; a quote opens a
 * string that may run on; anything else is a plain scalar whose
 * continuation lines join with a space.
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
    if (close <= 0) throw new Error(`unterminated double-quoted scalar: ${whole.slice(0, 60)}`);
    return whole
      .slice(1, close)
      .replace(/\\n/g, ' ')
      .replace(/\\(["\\/])/g, '$1');
  }
  if (whole.startsWith("'")) {
    const close = whole.lastIndexOf("'");
    if (close <= 0) throw new Error(`unterminated single-quoted scalar: ${whole.slice(0, 60)}`);
    return whole.slice(1, close).replace(/''/g, "'");
  }
  return whole;
}

/**
 * The frontmatter block and the body: the line index of the closing fence,
 * or -1 when the file opens with no block.
 */
function fenceEnd(lines) {
  if (!FENCE.test(lines[0] ?? '')) return -1;
  return lines.findIndex((line, i) => i > 0 && FENCE.test(line));
}

/** The top-level keys of the frontmatter block, each with its scalar text; null when the file has no block. */
function frontmatter(lines, end) {
  if (end < 0) return null;
  const body = lines.slice(1, end);
  const out = {};
  for (let i = 0; i < body.length; i += 1) {
    const match = KEY.exec(body[i]);
    if (!match) continue;
    const continuation = [];
    let j = i + 1;
    while (j < body.length && (/^\s/.test(body[j]) || body[j].trim() === '')) {
      continuation.push(body[j]);
      j += 1;
    }
    while (continuation.length > 0 && continuation[continuation.length - 1].trim() === '') continuation.pop();
    out[match[1]] = scalar(match[2], continuation);
    i = j - 1;
  }
  return out;
}

/**
 * The body file: everything after the frontmatter, trimmed of the blank
 * lines around it, opened by an h1 that names the skill when the text does
 * not open with one of its own. One trailing newline.
 */
function bodyText(lines, end, name) {
  const rest = lines.slice(end + 1);
  while (rest.length > 0 && rest[0].trim() === '') rest.shift();
  while (rest.length > 0 && rest[rest.length - 1].trim() === '') rest.pop();
  const opensWithTitle = /^#\s+\S/.test(rest[0] ?? '');
  const out = opensWithTitle ? rest : [`# ${name}`, '', ...rest];
  return `${out.join('\n')}\n`;
}

/** Every skill folder under a category directory, by name. */
function skillDirs(dir) {
  if (!existsSync(dir)) throw new Error(`build-skills: ${dir} is missing; set KEVIN_WIKI_DIR or GT_CLOUD_DIR`);
  return readdirSync(dir)
    .filter((entry) => !entry.startsWith('.') && statSync(join(dir, entry)).isDirectory())
    .sort();
}

/** A folder name the page route can take: not the index, no slash, and only the characters a slug carries. */
function checkSlug(id, file) {
  if (id === 'index') throw new Error(`build-skills: ${file} is named index, which would shadow /skills`);
  if (id.includes('/')) throw new Error(`build-skills: ${file} has a slash in its name`);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) throw new Error(`build-skills: ${file} has a name a route cannot carry`);
}

const skills = [];
const bodies = new Map();
const seen = new Map();
const renamed = [];

for (const category of CATEGORIES) {
  for (const id of skillDirs(category.dir)) {
    const file = join(category.dir, id, 'SKILL.md');
    if (!existsSync(file)) {
      console.warn(`build-skills: ${file} is missing, skipped`);
      continue;
    }
    checkSlug(id, file);
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const end = fenceEnd(lines);
    const data = frontmatter(lines, end);
    if (!data) throw new Error(`build-skills: ${file} has no frontmatter`);
    const name = clean(data.name ?? '');
    const description = clean(data.description ?? '');
    if (!name) throw new Error(`build-skills: ${file} has no name`);
    if (!description) throw new Error(`build-skills: ${file} has no description`);
    const before = seen.get(id);
    if (before) throw new Error(`build-skills: ${id} is in both ${before} and ${category.id}`);
    seen.set(id, category.id);
    if (name !== id) renamed.push(`${id} (named ${name})`);
    skills.push({ id, name, description, category: category.id, source: category.source });
    bodies.set(id, bodyText(lines, end, name));
  }
}

const order = new Map(CATEGORIES.map((category, i) => [category.id, i]));
skills.sort((a, b) => order.get(a.category) - order.get(b.category) || a.name.localeCompare(b.name, 'en'));

/** A single-quoted TypeScript string literal. */
function quote(text) {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const categoryUnion = CATEGORIES.map((category) => quote(category.id)).join(' | ');
const sourceUnion = [...new Set(CATEGORIES.map((category) => category.source))].map(quote).join(' | ');

const lines = [
  '/* Generated by scripts/build-skills.mjs (pnpm build:skills) from the frontmatter',
  '   of every published SKILL.md: the engineering and productivity categories of',
  "   the wiki's skill tree and the General Translation repository's own skills.",
  '   Do not edit by hand; edit a SKILL.md and run the script. Sorted by category',
  '   in SKILL_CATEGORIES order, then by name. The same run writes each body to',
  `   ${BODY_DIR}/<slug>.md, read by the skill page on the server and served raw. */`,
  '',
  "/** Where a skill's SKILL.md lives: the wiki's skill tree, or the General Translation repository's .agents/skills. */",
  `export type SkillSource = ${sourceUnion};`,
  '',
  '/** The published groups; the id is the sidebar section id on /skills. */',
  `export type SkillCategory = ${categoryUnion};`,
  '',
  'export type Skill = {',
  '  /** the folder name; unique across the categories, the slug of the page, and what the hash names */',
  '  id: string;',
  '  /** the frontmatter name; the folder name in all but a few cases */',
  '  name: string;',
  '  /** the frontmatter description, folded to one line */',
  '  description: string;',
  '  category: SkillCategory;',
  '  source: SkillSource;',
  '};',
  '',
  '/** The categories in the order the route lists them, with their labels. */',
  'export const SKILL_CATEGORIES: readonly { id: SkillCategory; label: string }[] = [',
  ...CATEGORIES.map((category) => `  { id: ${quote(category.id)}, label: ${quote(category.label)} },`),
  '];',
  '',
  '/** Where the generator writes each body, relative to the repository root; the file is served at /skills/<slug>.md. */',
  `export const SKILL_BODY_DIR = ${quote(BODY_DIR)};`,
  '',
  "/** The page of one skill: `/skills/<slug>`. */",
  'export function skillHref(slug: string): string {',
  '  return `/skills/${slug}`;',
  '}',
  '',
  'export const SKILLS: readonly Skill[] = [',
  ...skills.flatMap((skill) => [
    '  {',
    `    id: ${quote(skill.id)},`,
    `    name: ${quote(skill.name)},`,
    `    description: ${quote(skill.description)},`,
    `    category: ${quote(skill.category)},`,
    `    source: ${quote(skill.source)},`,
    '  },',
  ]),
  '];',
  '',
  'const SKILL_BY_SLUG: ReadonlyMap<string, Skill> = new Map(SKILLS.map((skill) => [skill.id, skill]));',
  '',
  '/** The skill a slug names, or undefined for a slug that is not published. */',
  'export function getSkill(slug: string): Skill | undefined {',
  '  return SKILL_BY_SLUG.get(slug);',
  '}',
  '',
  '/** One category as the sidebar, the search and the sitemap list it: its skills by name, each with the address of its page. */',
  'export type SkillGroup = {',
  '  id: SkillCategory;',
  '  label: string;',
  '  /** skills.length, for a count next to the label */',
  '  count: number;',
  '  skills: readonly { slug: string; name: string; href: string }[];',
  '};',
  '',
  '/** The categories with their skills, in SKILL_CATEGORIES order and the order SKILLS holds them; a category with no skills is left out. */',
  'export const SKILL_GROUPS: readonly SkillGroup[] = SKILL_CATEGORIES.map((category) => {',
  '  const skills = SKILLS.filter((skill) => skill.category === category.id).map((skill) => ({',
  '    slug: skill.id,',
  '    name: skill.name,',
  '    href: skillHref(skill.id),',
  '  }));',
  '  return { id: category.id, label: category.label, count: skills.length, skills };',
  '}).filter((group) => group.count > 0);',
  '',
];

writeFileSync(OUT, lines.join('\n'));

/* the bodies: one file per skill, and no file for a skill that is gone */
mkdirSync(BODY_OUT, { recursive: true });
let removed = 0;
for (const entry of readdirSync(BODY_OUT)) {
  if (entry.endsWith('.md') && !bodies.has(entry.slice(0, -3))) {
    unlinkSync(join(BODY_OUT, entry));
    removed += 1;
  }
}
let bytes = 0;
for (const [id, text] of bodies) {
  writeFileSync(join(BODY_OUT, `${id}.md`), text);
  bytes += Buffer.byteLength(text);
}

const counts = CATEGORIES.map((category) => `${category.label} ${skills.filter((s) => s.category === category.id).length}`);
console.log(`build-skills: ${skills.length} skills (${counts.join(', ')}) -> ${OUT.replace(`${ROOT}/`, '')}`);
console.log(
  `build-skills: ${bodies.size} bodies, ${(bytes / 1024).toFixed(0)} KB -> ${BODY_DIR}/<slug>.md${removed > 0 ? ` (${removed} stale removed)` : ''}`
);
if (renamed.length > 0) console.log(`build-skills: named differently from their folder: ${renamed.join(', ')}`);
