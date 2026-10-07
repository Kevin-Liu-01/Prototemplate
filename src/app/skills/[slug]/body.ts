import { readFileSync } from 'node:fs';
import { posix, join } from 'node:path';

import { DOC_ROUTES, repoPath } from '@/app/docs/links';
import { parseBlocks } from '@/app/docs/markdown';
import type { Block } from '@/app/docs/markdown';
import { getSkill, skillFileHref, skillHref } from '@/lib/skills';

/**
 * The server side of /skills/[slug]: reads one skill's SKILL.md from the
 * curated folder (skills/<slug>/SKILL.md, relative to process.cwd(), as the
 * docs read theirs), drops its frontmatter, and parses the body with the
 * docs' markdown parser, so the page renders prose the way /docs does.
 * Nothing here reaches a client bundle, and a slug is read only when the
 * generated registry knows it, so the path can name nothing else.
 *
 * The parser reads the subset the repository documents use. The skill
 * bodies are written for agents and reach a little further, so the text is
 * normalized to that subset first: HTML comments (notes to the author) are
 * dropped; headings deeper than h3 read as h3; the opening h1 is dropped,
 * since the page's head carries the title, and any later h1 reads as h2;
 * a blockquote reads as a paragraph; a list nested under a bullet flattens
 * into sibling rows, and one nested under a numbered step stays inside the
 * step's row with a middle dot for each item, so the steps keep their
 * numbers (the docs grammar counts each list from one); single-star and
 * underscore emphasis reads as plain text; an image reads as its link.
 *
 * Links into the skill's own folder become links to the published raw
 * files (/skills/<slug>/references/<file>, served by the route beside this
 * one), and so does a code span that names one of the skill's files
 * exactly (`references/type.md`); a link into a sibling skill's folder
 * (../gt-brand/SKILL.md) opens that skill's page. A link to a document the
 * site renders (../../docs/handbook/glossary.md), or a code span that names
 * one by its repository path (`docs/handbook/quality-bar.md`, `DESIGN.md`),
 * opens that document's route. Any other relative link reads as its text
 * with the path in code, since nothing else in the folder is published.
 * Fenced code is left exactly as written.
 */

const FENCE = /^(```|~~~)/;
const COMMENT_OPEN = '<!--';
const COMMENT_CLOSE = '-->';

/** A link or an image, or a single-backtick code span: the tokens the inline pass reads whole. */
const TOKEN = /(!?\[[^\]]*\]\([^)\s]+\)|`[^`\n]+`)/;
const LINK = /^!?\[([^\]]*)\]\(([^)\s]+)\)$/;

/** A target with a scheme (`https:`, `mailto:`), an absolute path or an anchor: left as written. */
const NOT_RELATIVE = /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i;

/** `*text*` and `_text_` at word boundaries, never `**`, never a list marker or a glob. */
const STAR_EM = /(^|[\s(["'])\*(?!\*)([^*\s](?:[^*\n]*?[^*\s])?)\*(?=$|[\s.,;:)!?"'\]])/g;
const UNDERSCORE_EM = /(^|[\s(["'])_(?!_)([^_\s](?:[^_\n]*?[^_\s])?)_(?=$|[\s.,;:)!?"'\]])/g;

/**
 * Repository document names a skill also uses for another repository's
 * file (gt-cloud's `README.md`, a film project's `AGENTS.md`), so a code
 * span naming one stays text.
 */
const AMBIGUOUS_DOCS: ReadonlySet<string> = new Set(['README.md', 'AGENTS.md']);

/** The site route of a document named by its repository path in a code span, or null. */
function docSpanTarget(name: string): string | null {
  return AMBIGUOUS_DOCS.has(name) ? null : (DOC_ROUTES[name] ?? null);
}

/** The skill whose body is being read, so its links can reach its published files. */
type SkillContext = { slug: string; files: ReadonlySet<string> };

/**
 * Where a relative target in a skill's body points on the site: a file of
 * the skill's own folder (its raw address), a sibling skill's folder or
 * file (that skill's page or raw file), or null for anything unpublished.
 */
function publishedTarget(target: string, ctx: SkillContext): string | null {
  const hash = target.indexOf('#');
  const path = hash >= 0 ? target.slice(0, hash) : target;
  const anchor = hash >= 0 ? target.slice(hash) : '';
  /* a document the site renders, by its path from the repository root */
  const fromRoot = repoPath(`skills/${ctx.slug}`, path);
  const doc = fromRoot ? DOC_ROUTES[fromRoot] : undefined;
  if (doc) return `${doc}${anchor}`;
  const resolved = posix.normalize(posix.join(ctx.slug, path)).replace(/\/$/, '');
  const [owner, ...rest] = resolved.split('/');
  if (!owner) return null;
  const file = rest.join('/');
  if (owner === ctx.slug) {
    if (file === '') return skillHref(owner);
    if (file === 'SKILL.md' || ctx.files.has(file)) return `${skillFileHref(owner, file)}${anchor}`;
    return null;
  }
  const sibling = getSkill(owner);
  if (!sibling) return null;
  if (file === '' || file === 'SKILL.md') return skillHref(owner);
  return sibling.files.includes(file) ? skillFileHref(owner, file) : null;
}

/** Text outside the links and code spans: emphasis to plain text. */
function plain(text: string): string {
  return text.replace(STAR_EM, '$1$2').replace(UNDERSCORE_EM, '$1$2');
}

/** One line's inline markup in the docs subset; see the module comment for the rules. */
function normalizeInline(text: string, ctx: SkillContext | null): string {
  return text
    .split(TOKEN)
    .map((part, i) => {
      if (i % 2 === 0) return plain(part);
      if (part.startsWith('`')) {
        const name = part.slice(1, -1).replace(/^\.\//, '');
        if (ctx && ctx.files.has(name)) return `[${part}](${skillFileHref(ctx.slug, name)})`;
        const doc = docSpanTarget(name);
        return doc ? `[${part}](${doc})` : part;
      }
      const link = LINK.exec(part);
      if (!link) return part;
      const target = link[2] ?? '';
      const label = link[1] || target;
      if (NOT_RELATIVE.test(target)) return `[${label}](${target})`;
      const href = ctx ? publishedTarget(target, ctx) : null;
      if (href) return `[${label}](${href})`;
      return label === target ? `\`${target}\`` : `${label} (\`${target}\`)`;
    })
    .join('');
}

/** The lines of a comment removed from one line; true while a comment runs on past its end. */
function stripComments(line: string, open: boolean): { text: string; open: boolean } {
  let text = '';
  let rest = line;
  let inside = open;
  while (rest.length > 0) {
    if (inside) {
      const close = rest.indexOf(COMMENT_CLOSE);
      if (close < 0) return { text, open: true };
      rest = rest.slice(close + COMMENT_CLOSE.length);
      inside = false;
    } else {
      const start = rest.indexOf(COMMENT_OPEN);
      if (start < 0) {
        text += rest;
        break;
      }
      text += rest.slice(0, start);
      rest = rest.slice(start + COMMENT_OPEN.length);
      inside = true;
    }
  }
  return { text, open: inside };
}

/** A top-level list item's marker: a bullet, or a number. */
const BULLET = /^[-*]\s+/;
const NUMBER = /^\d+\.\s+/;

/** An item indented under another: the indentation, then a bullet or a number. */
const NESTED = /^(\s{2,})([-*]|\d+\.)\s+/;

/** The list the current line sits in, when it sits in one; the parser ends a list at a blank line or a line at the margin. */
type ListKind = 'ul' | 'ol' | null;

/** The body text in the docs' markdown subset; see the module comment for the rules. Without a skill, relative links read as their text. */
export function normalizeSkillMarkdown(md: string, ctx: SkillContext | null = null): string {
  const out: string[] = [];
  let inFence = false;
  let inComment = false;
  let sawTitle = false;
  let list: ListKind = null;
  for (const raw of md.split('\n')) {
    if (FENCE.test(raw)) {
      inFence = !inFence;
      out.push(raw);
      continue;
    }
    if (inFence) {
      out.push(raw);
      continue;
    }
    const stripped = stripComments(raw, inComment);
    inComment = stripped.open;
    let line = stripped.text;
    if (line.trim() === '' && raw.trim() !== '') continue;
    const heading = /^(#{1,})\s+(.*)$/.exec(line);
    if (heading?.[1] && heading[2] !== undefined) {
      const depth = heading[1].length;
      if (depth === 1 && !sawTitle) {
        sawTitle = true;
        continue;
      }
      const level = depth === 1 ? 2 : Math.min(depth, 3);
      out.push(`${'#'.repeat(level)} ${normalizeInline(heading[2], ctx)}`);
      continue;
    }
    /* a blockquote reads as prose */
    line = line.replace(/^>\s?/, '');
    /* a nested item: a sibling row under a bullet list, a dotted run inside a numbered step */
    const nested = NESTED.exec(line);
    if (nested?.[1] !== undefined) {
      line = list === 'ol' ? `${nested[1]}· ${line.slice(nested[0].length)}` : line.slice(nested[1].length);
    }
    if (BULLET.test(line)) list = 'ul';
    else if (NUMBER.test(line)) list = 'ol';
    else if (line.trim() === '' || !/^\s{2,}\S/.test(line)) list = null;
    out.push(normalizeInline(line, ctx));
  }
  return out.join('\n');
}

/** The body of a SKILL.md: everything after the frontmatter block, trimmed of the blank lines that open it. */
export function stripFrontmatter(text: string): string {
  const lines = text.split(/\r?\n/);
  let start = 0;
  if (/^---\s*$/.test(lines[0] ?? '')) {
    const close = lines.findIndex((line, i) => i > 0 && /^---\s*$/.test(line));
    start = close < 0 ? 0 : close + 1;
  }
  while (start < lines.length && (lines[start] ?? '').trim() === '') start += 1;
  return lines.slice(start).join('\n');
}

/** A skill's SKILL.md as written, frontmatter included. Throws for a slug the registry does not know. */
export function readSkillFile(slug: string): string {
  if (!getSkill(slug)) throw new Error(`skills: no skill ${slug}`);
  /* the folder is a literal (SKILL_DIR's value), so the build traces skills/ and not the whole project */
  return readFileSync(join(process.cwd(), 'skills', slug, 'SKILL.md'), 'utf8');
}

/** The skill's body as parsed blocks, ready for the docs renderer. */
export function skillBlocks(slug: string): Block[] {
  const skill = getSkill(slug);
  const ctx = skill ? { slug, files: new Set(skill.files) } : null;
  return parseBlocks(normalizeSkillMarkdown(stripFrontmatter(readSkillFile(slug)), ctx));
}
