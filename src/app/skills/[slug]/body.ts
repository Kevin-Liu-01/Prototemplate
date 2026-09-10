import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseBlocks } from '@/app/docs/markdown';
import type { Block } from '@/app/docs/markdown';
import { SKILL_BODY_DIR, getSkill } from '@/lib/skills';

/**
 * The server side of /skills/[slug]: reads one skill's body from the files
 * scripts/build-skills.mjs writes (public/skills/<slug>.md, the SKILL.md
 * with its frontmatter removed) and parses it with the docs' markdown
 * parser, so the page renders prose the way /docs does. Files are read
 * relative to process.cwd(), as the docs read theirs; nothing here reaches
 * a client bundle, and a slug is read only when the generated registry
 * knows it, so the path can name nothing else.
 *
 * The parser reads the subset the repository documents use. The skill
 * bodies are written for agents and reach a little further, so the text is
 * normalized to that subset first: HTML comments (notes to the author) are
 * dropped; headings deeper than h3 read as h3; the opening h1 is dropped,
 * since the page's head carries the name, and any later h1 reads as h2;
 * a blockquote reads as a paragraph; a list nested under a bullet flattens
 * into sibling rows, and one nested under a numbered step stays inside the
 * step's row with a middle dot for each item, so the steps keep their
 * numbers (the docs grammar counts each list from one); single-star and
 * underscore emphasis reads as plain text; an image reads as its link; and
 * a link into the skill's own folder (references/, scripts/, a sibling
 * file) reads as its text with the path in code, since only SKILL.md is
 * published. Fenced code is left exactly as written, and so is anything
 * inside an inline code span.
 */

const FENCE = /^(```|~~~)/;
const COMMENT_OPEN = '<!--';
const COMMENT_CLOSE = '-->';

/** A single-backtick code span, kept whole by the inline pass. */
const CODE_SPAN = /(`[^`\n]+`)/;

/** `![alt](src)`: the image becomes its link. */
const IMAGE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

/** `[text](target)` where the target is a relative path: neither a scheme, nor an absolute path, nor an anchor. */
const RELATIVE_LINK = /\[([^\]]+)\]\((?![a-z][a-z0-9+.-]*:|\/|#)([^)\s]+)\)/g;

/** `*text*` and `_text_` at word boundaries, never `**`, never a list marker or a glob. */
const STAR_EM = /(^|[\s(["'])\*(?!\*)([^*\s](?:[^*\n]*?[^*\s])?)\*(?=$|[\s.,;:)!?"'\]])/g;
const UNDERSCORE_EM = /(^|[\s(["'])_(?!_)([^_\s](?:[^_\n]*?[^_\s])?)_(?=$|[\s.,;:)!?"'\]])/g;

/** Text outside code spans: images, relative links and emphasis, in that order. */
function normalizeInline(text: string): string {
  return text
    .split(CODE_SPAN)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      return part
        .replace(IMAGE, '[$1]($2)')
        .replace(RELATIVE_LINK, (_match, label: string, target: string) =>
          label === target ? `\`${target}\`` : `${label} (\`${target}\`)`
        )
        .replace(STAR_EM, '$1$2')
        .replace(UNDERSCORE_EM, '$1$2');
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

/** The body text in the docs' markdown subset; see the module comment for the rules. */
export function normalizeSkillMarkdown(md: string): string {
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
      out.push(`${'#'.repeat(level)} ${normalizeInline(heading[2])}`);
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
    out.push(normalizeInline(line));
  }
  return out.join('\n');
}

/** The raw body file, as the generator wrote it. Throws for a slug the registry does not know. */
export function readSkillBody(slug: string): string {
  if (!getSkill(slug)) throw new Error(`skills: no body for ${slug}`);
  return readFileSync(join(process.cwd(), SKILL_BODY_DIR, `${slug}.md`), 'utf8');
}

/** The skill's body as parsed blocks, ready for the docs renderer. */
export function skillBlocks(slug: string): Block[] {
  return parseBlocks(normalizeSkillMarkdown(readSkillBody(slug)));
}
