// Builds src/lib/blog-posts.ts, the post and release list behind /blog, its
// sidebar run and the search: the frontmatter of every post in content/blog
// (title, summary, date, authors, tags, covers) with each author's name and
// avatar from content/authors, and every release of the changelog in
// content/production/devlog/en-US (title, headline, date). Posts run newest
// first; releases run newest first with the title as a descending numeric
// tiebreak, the order generaltranslation.com/blog prints them in. The
// bodies stay on disk: the server pages read them through src/lib/blog.ts.
//
// Usage:
//   node scripts/build/blog.mjs           write src/lib/blog-posts.ts
//   node scripts/build/blog.mjs --check   exit 1 when src/lib/blog-posts.ts is stale
/* oxlint-disable no-console -- a generator reporting its result to stdout. */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const OUT_REL = 'src/lib/blog-posts.ts';
const OUT = join(ROOT, OUT_REL);
const POSTS_DIR = join(ROOT, 'content/blog');
const AUTHORS_DIR = join(ROOT, 'content/authors');
const RELEASES_DIR = join(ROOT, 'content/production/devlog/en-US');
const CHECK = process.argv.includes('--check');

function unquote(text) {
  const t = text.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}

/** The `key: value` lines between the fences, the parse src/lib/blog.ts applies; `[a, 'b']` becomes an array. */
function frontmatter(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  if ((lines[0] ?? '').trim() !== '---') throw new Error(`${file}: no frontmatter`);
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (end < 0) throw new Error(`${file}: the frontmatter is not closed`);
  const data = {};
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!match) continue;
    const raw = match[2].trim();
    data[match[1]] = raw.startsWith('[') && raw.endsWith(']')
      ? raw.slice(1, -1).split(',').map(unquote).filter((item) => item !== '')
      : unquote(raw);
  }
  return data;
}

/** The field as a required string; throws so a renamed field fails the run. */
function required(data, key, file) {
  const value = data[key];
  if (typeof value !== 'string' || value === '') throw new Error(`${file}: no ${key}`);
  return value;
}

function list(data, key) {
  const value = data[key];
  if (Array.isArray(value)) return value;
  return typeof value === 'string' && value !== '' ? [value] : [];
}

function mdxSlugs(dir) {
  return readdirSync(dir).filter((file) => file.endsWith('.mdx')).map((file) => file.slice(0, -4));
}

function author(slug) {
  const file = join(AUTHORS_DIR, `${slug}.mdx`);
  if (!existsSync(file)) throw new Error(`content/authors/${slug}.mdx is missing; a post names it`);
  const data = frontmatter(file);
  const optional = (key) => (typeof data[key] === 'string' && data[key] !== '' ? { [key]: data[key] } : {});
  return { slug, name: required(data, 'name', file), ...optional('occupation'), ...optional('company'), ...optional('avatar') };
}

const posts = mdxSlugs(POSTS_DIR)
  .map((slug) => {
    const file = join(POSTS_DIR, `${slug}.mdx`);
    const data = frontmatter(file);
    const image = list(data, 'images')[0];
    const imageLight = list(data, 'imagesLight')[0];
    return {
      slug,
      title: required(data, 'title', file),
      summary: required(data, 'summary', file),
      date: required(data, 'date', file),
      authors: list(data, 'authors').map(author),
      tags: list(data, 'tags'),
      ...(image ? { image } : {}),
      ...(imageLight ? { imageLight } : {}),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

const releases = mdxSlugs(RELEASES_DIR)
  .map((slug) => {
    const file = join(RELEASES_DIR, `${slug}.mdx`);
    const data = frontmatter(file);
    return {
      slug,
      title: required(data, 'title', file),
      headline: required(data, 'headline', file),
      date: required(data, 'date', file),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date) || b.title.localeCompare(a.title, undefined, { numeric: true }));

if (posts.length === 0) throw new Error('no posts under content/blog');

/** A single-quoted TypeScript string literal. */
function quote(text) {
  return `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

/** A value as a TypeScript literal at `indent` spaces: strings single-quoted, arrays and objects one entry a line, an array of strings on one line. */
function literal(value, indent = 0) {
  const pad = ' '.repeat(indent + 2);
  const end = ' '.repeat(indent);
  if (typeof value === 'string') return quote(value);
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === 'string')) return `[${value.map(quote).join(', ')}]`;
    return `[\n${value.map((item) => `${pad}${literal(item, indent + 2)},`).join('\n')}\n${end}]`;
  }
  const entries = Object.entries(value).map(([key, item]) => `${pad}${key}: ${literal(item, indent + 2)},`);
  return `{\n${entries.join('\n')}\n${end}}`;
}

const HEADER = `/* Generated by scripts/build/blog.mjs (pnpm build:blog) from the frontmatter
   of content/blog, content/authors and content/production/devlog/en-US.
   Do not edit by hand: edit the files and run the script. The server pages
   read each body from disk through src/lib/blog.ts. */`;

const output = `${HEADER}

export type BlogAuthor = {
  /** the file name under content/authors */
  slug: string;
  name: string;
  occupation?: string;
  company?: string;
  /** a public path, or a full address for a contributor's GitHub portrait */
  avatar?: string;
};

export type BlogPostMeta = {
  /** the file name under content/blog, and the page under /blog */
  slug: string;
  title: string;
  summary: string;
  /** ISO date, \`2026-09-17\` */
  date: string;
  authors: readonly BlogAuthor[];
  tags: readonly string[];
  /** the dark cover, a public path that may carry a cache stamp */
  image?: string;
  /** the light cover, when the post has one */
  imageLight?: string;
};

export type BlogRelease = {
  /** the file name under content/production/devlog/en-US, and the page under /d/production/blog */
  slug: string;
  /** the packages and versions, \`gt@2.23.0 / @generaltranslation/api@0.5.0\` */
  title: string;
  headline: string;
  /** ISO date */
  date: string;
};

/** Every post, newest first. */
export const BLOG_POSTS: readonly BlogPostMeta[] = ${literal(posts)};

/** Every release of the changelog, newest first. */
export const BLOG_RELEASES: readonly BlogRelease[] = ${literal(releases)};
`;

const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
if (CHECK) {
  if (current !== output) {
    console.error(`build:blog: ${OUT_REL} is stale; run pnpm build:blog`);
    process.exit(1);
  }
  console.log(`build:blog: ${OUT_REL} is current`);
} else {
  if (current !== output) writeFileSync(OUT, output);
  console.log(`build:blog: ${posts.length} posts and ${releases.length} releases in ${OUT_REL}`);
}
