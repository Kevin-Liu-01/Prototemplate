import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ReactNode } from 'react';

import { parseBlocks, renderBlocks, renderInline, splitDoc } from '@/app/docs/markdown';
import type { Block } from '@/app/docs/markdown';
import { MOTION_BODY_DIR, getMotionFilm } from '@/lib/motion';
import type { PackageSectionId } from '@/lib/motion';

import { langText } from '../lang-text';

/**
 * The server side of /motion/[slug]: reads one research package from the
 * file scripts/build-motion.mjs writes (public/motion/<slug>.md, the
 * film's BRIEF.md from the package's own h1 on) and renders it with the
 * docs' markdown renderer and the script hook, so the client receives
 * elements and no markdown ships in a bundle. A slug is read only when the
 * generated registry knows it as a package, so the path can name nothing
 * else.
 *
 * The text is normalized to the renderer's subset first. The --- rules go,
 * since each section's divider already draws its rule. A paragraph that is
 * one bold line (Primary texts, Rights, the three fact-check groups) reads
 * as an h3. A bullet nested under another (the Academy pages in the Hebrew
 * sources) becomes a sibling row, since the parser would join it to its
 * parent's text.
 *
 * Bare URLs become links after parsing, never in the source: a table line
 * is split on every `|`, and an address such as `version=hebrew%7CTanach`
 * would split its cell if it were decoded first. The href keeps its
 * percent escapes, percent-encodes every other character outside ASCII and
 * escapes the parentheses (the renderer's link syntax ends at the first
 * `)`); the link text is the address without its scheme, decoded, which
 * the hook sets left to right. A `doi:` reference links to doi.org.
 */

/** The package as the page lays it out. */
export type PackagePage = {
  /** the series line, inline, for the book head's lead */
  lead: ReactNode;
  /** the paragraphs after the series line (the Journey to the West package has one), or null */
  leadRest: ReactNode | null;
  sections: readonly PackageSectionPage[];
};

export type PackageSectionPage = {
  id: PackageSectionId;
  n: string;
  title: string;
  note: string;
  body: ReactNode;
  /** the table-heavy sections, whose tables keep a minimum width and scroll inside their wrap */
  wide: boolean;
};

const WIDE: ReadonlySet<PackageSectionId> = new Set(['script', 'vocabulary']);

const FENCE = /^(```|~~~)/;
const RULE = /^-{3,}\s*$/;
const BOLD_LINE = /^\*\*([^*]+)\*\*\s*$/;
const NESTED_BULLET = /^\s{2,}[-*]\s+/;

/** The body text in the renderer's subset; see the module comment for the rules. */
function normalize(md: string): string {
  const out: string[] = [];
  let inFence = false;
  for (const line of md.split('\n')) {
    if (FENCE.test(line)) inFence = !inFence;
    if (inFence) {
      out.push(line);
      continue;
    }
    if (RULE.test(line)) continue;
    const bold = BOLD_LINE.exec(line);
    if (bold?.[1]) {
      out.push(`### ${bold[1].trim()}`);
      continue;
    }
    out.push(line.replace(NESTED_BULLET, '- '));
  }
  return out.join('\n');
}

/* ---- links ---- */

/** A code span or a link already written, kept whole by the link pass. */
const KEEP = /(`[^`\n]+`|\[[^\]]+\]\([^)\s]+\))/;

/**
 * A bare address, or a DOI reference, with the semicolon or period the
 * briefs set one space after an address so it is not read as part of it.
 * Once the address is a link, that space goes.
 */
const ADDRESS = /(?:(https?:\/\/[^\s<>"“”「」]+)|\bdoi:(10\.\d{4,9}\/[^\s<>"“”「」]+))( [;.](?=\s|$))?/g;

function count(text: string, ch: string): number {
  return text.split(ch).length - 1;
}

/** Trailing sentence punctuation and an unbalanced closing parenthesis belong to the prose, not the address. */
function trimAddress(url: string): string {
  let u = url;
  for (;;) {
    if (/[.,;:]$/.test(u)) u = u.slice(0, -1);
    else if (u.endsWith(')') && count(u, ')') > count(u, '(')) u = u.slice(0, -1);
    else return u;
  }
}

/** Percent escapes kept, every code point outside ASCII encoded, parentheses escaped. */
function hrefOf(url: string): string {
  let out = '';
  for (const ch of url) {
    if (ch === '(') out += '%28';
    else if (ch === ')') out += '%29';
    else if ((ch.codePointAt(0) ?? 0) > 0x7e) out += encodeURIComponent(ch);
    else out += ch;
  }
  return out;
}

/** The link text: the address without its scheme and `www.`, decoded where it decodes cleanly. */
function displayOf(url: string): string {
  const bare = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  let text = bare;
  try {
    text = decodeURI(bare);
  } catch {
    text = bare;
  }
  return /[[\]`*]/.test(text) ? bare : text;
}

function linkifyPlain(text: string): string {
  return text.replace(ADDRESS, (_match: string, url: string | undefined, doi: string | undefined, spaced: string | undefined) => {
    const raw = url ?? `doi:${doi ?? ''}`;
    const kept = trimAddress(raw);
    const tail = raw.slice(kept.length) + (spaced?.trimStart() ?? '');
    if (url) return `[${displayOf(kept)}](${hrefOf(kept)})${tail}`;
    const id = kept.slice('doi:'.length);
    return `[${kept}](${hrefOf(`https://doi.org/${id}`)})${tail}`;
  });
}

function linkify(text: string): string {
  return text
    .split(KEEP)
    .map((part, i) => (i % 2 === 1 ? part : linkifyPlain(part)))
    .join('');
}

function linkBlock(block: Block): Block {
  switch (block.kind) {
    case 'heading':
      return { ...block, text: linkify(block.text) };
    case 'p':
      return { ...block, text: linkify(block.text) };
    case 'ul':
    case 'ol':
      return { ...block, items: block.items.map(linkify) };
    case 'table':
      return { ...block, header: block.header.map(linkify), rows: block.rows.map((row) => row.map(linkify)) };
    default:
      return block;
  }
}

/**
 * The fact-check groups are one numbered run split by their group
 * headings; each list after the first starts where the one before ended
 * (the generator checks that the numbers run without a gap).
 */
function numberOn(blocks: readonly Block[]): Block[] {
  let seen = 0;
  return blocks.map((block) => {
    if (block.kind !== 'ol') return block;
    const start = seen + 1;
    seen += block.items.length;
    return start > 1 ? { ...block, start } : block;
  });
}

export function readPackageBody(slug: string): string {
  if (!getMotionFilm(slug)?.pkg) throw new Error(`motion: no package for ${slug}`);
  return readFileSync(join(process.cwd(), MOTION_BODY_DIR, `${slug}.md`), 'utf8');
}

const OPTS = { text: langText };

/**
 * A published film's credits, read from the copy of the Videos session's
 * file under public/motion and shown under the player with its words
 * unchanged. The file is hard-wrapped plain text: blocks part at blank
 * lines, a bullet's continuation lines join its item, a paragraph's lines
 * join with the space the wrap took, and a one-line block with no full
 * stop ("Images") reads as a bold line. Addresses link as in the package.
 */
export function buildCredits(slug: string): ReactNode | null {
  const path = getMotionFilm(slug)?.credits;
  if (!path) return null;
  const text = readFileSync(join(process.cwd(), 'public', path), 'utf8');
  const md = text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines[0]?.startsWith('- ')) {
        const items: string[] = [];
        for (const line of lines) {
          if (line.startsWith('- ')) items.push(line);
          else items[items.length - 1] += ` ${line}`;
        }
        return items.join('\n');
      }
      if (lines.length === 1 && !/[.:]$/.test(lines[0] ?? '')) return `**${lines[0]}**`;
      return lines.join(' ');
    })
    .join('\n\n');
  return renderBlocks(parseBlocks(md).map(linkBlock), `${slug}-credits`, OPTS);
}

/** The package as ReactNodes: the lead, and the five sections with their dividers' data. */
export function buildPackage(slug: string): PackagePage {
  const film = getMotionFilm(slug);
  const pkg = film?.pkg;
  if (!film || !pkg) throw new Error(`motion: no package for ${slug}`);

  const split = splitDoc(parseBlocks(normalize(readPackageBody(slug))).map(linkBlock));
  if (split.rows.length !== pkg.sections.length) {
    throw new Error(`motion: ${slug} has ${split.rows.length} sections; the registry lists ${pkg.sections.length}`);
  }

  const [series, ...rest] = split.lead;
  const lead = series?.kind === 'p' ? renderInline(series.text, `${slug}-series`, OPTS) : renderInline(pkg.series, `${slug}-series`, OPTS);
  const restBlocks = series?.kind === 'p' ? rest : split.lead;
  const leadRest = restBlocks.length > 0 ? renderBlocks(restBlocks, `${slug}-lead`, OPTS) : null;

  const sections = pkg.sections.map((section, i): PackageSectionPage => {
    const row = split.rows[i];
    /* the divider prints the title, so the row's own h2 is left out */
    const blocks = (row?.blocks ?? []).slice(1);
    const numbered = section.id === 'checks' ? numberOn(blocks) : blocks;
    return {
      id: section.id,
      n: section.n,
      title: section.title,
      note: section.note,
      body: renderBlocks(numbered, `${slug}-${section.id}`, OPTS),
      wide: WIDE.has(section.id),
    };
  });

  return { lead, leadRest, sections };
}
