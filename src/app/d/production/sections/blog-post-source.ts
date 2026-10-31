import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseFrontmatter } from '@/lib/blog';

import type { PostType } from './blog-article-data';

/**
 * The MDX body of a /d/production blog post, read at build time.
 *
 * The text is vendored in content/production/{blog,devlog}/en-US from the
 * public repository github.com/generaltranslation/content at befd13c1
 * (2026-10-09), the commit gt-cloud pins as the apps/landing/content
 * submodule, with the blog posts at content main 333efa3b (2026-10-30),
 * which the live deploy checks out; the content is licensed CC BY 4.0. This reader follows live's
 * apps/landing/src/components/blog/utils.ts: getPostBySlug reads the file
 * and drops the frontmatter, splitHeaderIntro lifts a leading <Callout>
 * or <OpenSourceGrants /> into the header when the frontmatter sets
 * headerIntro, and
 * extractHeadings lists the h2 and h3 headings with the ids rehype-slug
 * gives them.
 */

const CONTENT = join(process.cwd(), 'content', 'production');

/** Live's SAFE_SLUG: a bare basename, so a slug never climbs out of the folder. */
const SAFE_SLUG = /^[A-Za-z0-9_-]+$/;

export type PostHeading = {
  id: string;
  text: string;
  level: number;
};

export type PostSource = {
  /** The MDX the article body renders. */
  body: string;
  /** The leading Callout the header renders, when headerIntro is set. */
  header: string | null;
  /** The body's h2 and h3 headings, in document order. */
  headings: PostHeading[];
};

export function readPostSource(slug: string, postType: PostType): PostSource | null {
  if (!SAFE_SLUG.test(slug)) return null;
  let text: string;
  try {
    text = readFileSync(join(CONTENT, postType, 'en-US', `${slug}.mdx`), 'utf8');
  } catch {
    return null;
  }
  const { data, body: content } = parseFrontmatter(text);
  const { body, header } = splitHeaderIntro(content, data.headerIntro === 'true');
  return { body, header, headings: extractHeadings(body) };
}

/**
 * Live parses the body as MDX and lifts its first node when that node is a
 * <Callout> element or an <OpenSourceGrants /> note, which renders one
 * (HEADER_INTRO_ELEMENTS, gt-cloud #5598). The vendored posts open a header
 * intro with the self-closing note or with a Callout that holds no nested
 * Callout, so the element runs from the opening tag at the start of the
 * body to the end of the note or to the first closing tag.
 */
function splitHeaderIntro(content: string, enabled: boolean): { body: string; header: string | null } {
  if (!enabled) return { body: content, header: null };
  const start = content.search(/\S/);
  if (start < 0) return { body: content, header: null };
  const end = start + introLength(content.slice(start));
  if (end === start) return { body: content, header: null };
  return {
    body: content.slice(end).replace(/^(?:[ \t]*\r?\n)+/, ''),
    header: content.slice(start, end),
  };
}

/** The length of the intro element the text opens with, or 0 when it opens with something else. */
function introLength(text: string): number {
  const note = /^<OpenSourceGrants\s*\/>/.exec(text);
  if (note) return note[0].length;
  if (!/^<Callout[\s>]/.test(text)) return 0;
  const close = text.indexOf('</Callout>');
  return close < 0 ? 0 : close + '</Callout>'.length;
}

/**
 * github-slugger, which rehype-slug runs: lower case, then every character
 * that is not a letter, mark, number, connector, space or hyphen dropped,
 * then spaces to hyphens; a repeat takes -1, -2 and so on across every
 * heading level in document order.
 */
function slugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const base = text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
      .replace(/ /g, '-');
    let id = base;
    let count = seen.get(base) ?? 0;
    while (seen.has(id)) {
      count += 1;
      id = `${base}-${count}`;
    }
    seen.set(base, count);
    seen.set(id, 0);
    return id;
  };
}

/** A heading's text: the text and inline code of its children, as live's extractHeadings joins them. */
function headingText(source: string): string {
  return source
    .split(/(`[^`]*`)/)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 1
        ? part.slice(1, -1)
        : part
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/<[^>]+>/g, '')
            .replace(/(\*\*|__)(.+?)\1/g, '$2')
            .replace(/(\*|_)(.+?)\1/g, '$2')
            .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
    )
    .join('')
    .trim();
}

function extractHeadings(content: string): PostHeading[] {
  const slug = slugger();
  const headings: PostHeading[] = [];
  let fence: string | null = null;
  for (const line of content.split(/\r?\n/)) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (fence === null) fence = marker;
      else if (marker.startsWith(fence)) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match?.[1] || !match[2]) continue;
    const text = headingText(match[2]);
    if (!text) continue;
    const id = slug(text);
    const level = match[1].length;
    if (level === 2 || level === 3) headings.push({ id, text, level });
  }
  return headings;
}
