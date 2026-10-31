import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The blog posts and authors of generaltranslation.com that /blog renders:
 * `content/blog/<slug>.mdx` and `content/authors/<slug>.mdx`, copied from
 * the generaltranslation/content repository (scripts/lint/copies.json pins
 * each post). Read from disk on the server at build time, like the
 * documents; the frontmatter parser covers the fields these files use
 * (scalars and one-line arrays), nothing more.
 */

export type Author = {
  slug: string;
  name: string;
  company?: string;
  occupation?: string;
  /** a public path */
  avatar?: string;
};

export type Post = {
  slug: string;
  title: string;
  summary: string;
  /** ISO date, `2026-09-17` */
  date: string;
  authors: readonly string[];
  tags: readonly string[];
  /** the header cover, a public path (may carry a cache stamp) */
  image?: string;
  /** the cover for the light theme, when the post has one; `image` is the dark one */
  imageLight?: string;
  ogImage?: string;
  /** the MDX after the frontmatter */
  body: string;
};

type Scalar = string | readonly string[];

const CONTENT = join(process.cwd(), 'content');

function unquote(text: string): string {
  const t = text.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}

/** `key: value` lines between the fences; `[a, 'b']` becomes an array. */
export function parseFrontmatter(text: string): { data: Record<string, Scalar>; body: string } {
  const lines = text.split(/\r?\n/);
  if ((lines[0] ?? '').trim() !== '---') return { data: {}, body: text };
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (end < 0) return { data: {}, body: text };
  const data: Record<string, Scalar> = {};
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!match?.[1]) continue;
    const raw = (match[2] ?? '').trim();
    if (raw.startsWith('[') && raw.endsWith(']')) {
      data[match[1]] = raw
        .slice(1, -1)
        .split(',')
        .map(unquote)
        .filter((item) => item !== '');
    } else {
      data[match[1]] = unquote(raw);
    }
  }
  return { data, body: lines.slice(end + 1).join('\n').trim() };
}

function scalar(data: Record<string, Scalar>, key: string): string | undefined {
  const value = data[key];
  return typeof value === 'string' && value !== '' ? value : undefined;
}

function list(data: Record<string, Scalar>, key: string): readonly string[] {
  const value = data[key];
  if (Array.isArray(value)) return value;
  return typeof value === 'string' && value !== '' ? [value] : [];
}

function readPost(slug: string): Post {
  const { data, body } = parseFrontmatter(readFileSync(join(CONTENT, 'blog', `${slug}.mdx`), 'utf8'));
  return {
    slug,
    title: scalar(data, 'title') ?? slug,
    summary: scalar(data, 'summary') ?? '',
    date: scalar(data, 'date') ?? '',
    authors: list(data, 'authors'),
    tags: list(data, 'tags'),
    image: list(data, 'images')[0],
    imageLight: list(data, 'imagesLight')[0],
    ogImage: list(data, 'ogImages')[0],
    body,
  };
}

/** Every post under content/blog, newest first. */
export function getPosts(): readonly Post[] {
  return readdirSync(join(CONTENT, 'blog'))
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => readPost(file.replace(/\.mdx$/, '')))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** One post, or undefined for a slug that is not a file (the route answers 404). */
export function getPost(slug: string): Post | undefined {
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
  try {
    return readPost(slug);
  } catch {
    return undefined;
  }
}

/** An author file, or undefined. */
function getAuthor(slug: string): Author | undefined {
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
  try {
    const { data } = parseFrontmatter(readFileSync(join(CONTENT, 'authors', `${slug}.mdx`), 'utf8'));
    return {
      slug,
      name: scalar(data, 'name') ?? slug,
      company: scalar(data, 'company'),
      occupation: scalar(data, 'occupation'),
      avatar: scalar(data, 'avatar'),
    };
  } catch {
    return undefined;
  }
}

/** The authors of a post that have files, in the post's order. */
export function getAuthors(slugs: readonly string[]): readonly Author[] {
  return slugs.map(getAuthor).filter((author): author is Author => author !== undefined);
}

/** A string attribute of a JSX tag, `name='value'` or `name="value"`. */
function attribute(tag: string, name: string): string | undefined {
  const match = new RegExp(`\\b${name}=(?:'([^']*)'|"([^"]*)")`).exec(tag);
  return match ? (match[1] ?? match[2]) : undefined;
}

/**
 * The figures of a post body in order: each `![alt](src)` image, and each
 * `<CarouselItem>` of a `<Carousel>` with the carousel's label as its title.
 */
export function postFigures(body: string): readonly { alt: string; src: string; title?: string }[] {
  const figures: { alt: string; src: string; title?: string }[] = [];
  for (const m of body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)|<Carousel\b([^>]*)>([\s\S]*?)<\/Carousel>/g)) {
    if (m[2]) {
      figures.push({ alt: m[1] ?? '', src: m[2] });
      continue;
    }
    const title = attribute(m[3] ?? '', 'label');
    for (const item of (m[4] ?? '').matchAll(/<CarouselItem\b[^>]*>/g)) {
      const src = attribute(item[0], 'src');
      if (src) figures.push({ alt: attribute(item[0], 'alt') ?? '', src, ...(title ? { title } : {}) });
    }
  }
  return figures;
}
