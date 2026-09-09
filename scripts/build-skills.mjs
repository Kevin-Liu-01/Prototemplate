// Builds src/lib/skills.ts, the typed data behind /skills, from the YAML
// frontmatter of every published SKILL.md. Three groups are published: the
// engineering and productivity categories of the wiki's skill tree
// (skills/<category>/<slug>/SKILL.md) and the General Translation
// repository's own skills (.agents/skills/<slug>/SKILL.md). The personal,
// misc, in-progress and deprecated categories stay out. Each skill carries
// its folder name as the id, the frontmatter name and description (folded
// to one line), its category and its source; the list is sorted by category
// in the order below, then by name. Ids must be unique across the groups,
// since the shell tracks the active skill by id in the hash.
//
// Only name and description are read, so the parser handles the scalar
// forms those two keys take in the tree: plain (with indented continuation
// lines), single and double quoted, and the folded and literal block forms
// (>, >-, |, |-). Nested mappings under other keys (metadata:) are skipped.
//
// The output is committed, so the site builds without either checkout;
// this script runs where both exist.
//
// Usage: pnpm build:skills
// KEVIN_WIKI_DIR and GT_CLOUD_DIR override the two checkouts.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/lib/skills.ts');

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

/** The top-level keys of the frontmatter block, each with its scalar text; null when the file has no block. */
function frontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (!FENCE.test(lines[0] ?? '')) return null;
  const end = lines.findIndex((line, i) => i > 0 && FENCE.test(line));
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

/** Every skill folder under a category directory, by name. */
function skillDirs(dir) {
  if (!existsSync(dir)) throw new Error(`build-skills: ${dir} is missing; set KEVIN_WIKI_DIR or GT_CLOUD_DIR`);
  return readdirSync(dir)
    .filter((entry) => !entry.startsWith('.') && statSync(join(dir, entry)).isDirectory())
    .sort();
}

const skills = [];
const seen = new Map();
const renamed = [];

for (const category of CATEGORIES) {
  for (const id of skillDirs(category.dir)) {
    const file = join(category.dir, id, 'SKILL.md');
    if (!existsSync(file)) {
      console.warn(`build-skills: ${file} is missing, skipped`);
      continue;
    }
    const data = frontmatter(readFileSync(file, 'utf8'));
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
  '   in SKILL_CATEGORIES order, then by name. */',
  '',
  "/** Where a skill's SKILL.md lives: the wiki's skill tree, or the General Translation repository's .agents/skills. */",
  `export type SkillSource = ${sourceUnion};`,
  '',
  '/** The published groups; the id is the sidebar section id on /skills. */',
  `export type SkillCategory = ${categoryUnion};`,
  '',
  'export type Skill = {',
  '  /** the folder name; unique across the categories, and what the hash names */',
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
];

writeFileSync(OUT, lines.join('\n'));

const counts = CATEGORIES.map((category) => `${category.label} ${skills.filter((s) => s.category === category.id).length}`);
console.log(`build-skills: ${skills.length} skills (${counts.join(', ')}) -> ${OUT.replace(`${ROOT}/`, '')}`);
if (renamed.length > 0) console.log(`build-skills: named differently from their folder: ${renamed.join(', ')}`);
