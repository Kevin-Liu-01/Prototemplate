/* Loads the press's stories from the blog's MDX at build time. Prototemplate
   keeps the shipped posts in content/production/blog/en-US and their pictures
   in public/static/blogs; another app sets PRESS_CONTENT and PRESS_PUBLIC. */

import fs from 'node:fs';
import path from 'node:path';

import { cache } from 'react';

import { HOME, type LatLon } from './coords';
import {
  parseBody,
  parseInline,
  splitFrontmatter,
  wordCount,
  type Block,
  type Figure,
  type Inline,
} from './parse';
import { plain } from './plain';
import {
  AUTHORS,
  HOME_SHEET,
  SHEETS,
  STORIES,
  type LiveKind,
  type Localized,
  type Look,
  type MapSheet,
  type Topic,
} from './stories';

const CONTENT =
  process.env.PRESS_CONTENT ??
  path.join(process.cwd(), 'content/production/blog/en-US');
const PUBLIC = process.env.PRESS_PUBLIC ?? path.join(process.cwd(), 'public');
/** Stories still in draft, which the blog does not carry yet. */
const DRAFTS = path.join(
  process.cwd(),
  'src/app/atlas/(magazine)/_atlas/drafts'
);

export type PlateFigure = Figure & {
  /** 1-based figure number in the story. */
  n: number;
  live: LiveKind | null;
  /** The light-theme twin of the first frame, when the blog has one. */
  light: string | null;
};

export type Story = {
  slug: string;
  n: number;
  title: string;
  /** The title as the frontmatter writes it, with any **bold** or *italics* it marks, for the page's own heading; `title` is its plain text, for the page's name, its metadata and every list. */
  titleInline: Inline[];
  titles: Localized;
  topics: readonly Topic[];
  look: Look;
  summary: string;
  date: string;
  authors: string[];
  cover: string;
  words: number;
  minutes: number;
  dateline: LatLon;
  blocks: Block[];
  figures: PlateFigure[];
};

export type StoryCard = Omit<Story, 'blocks' | 'figures'> & {
  figureCount: number;
  sections: { id: string; text: string }[];
};

/** A picture's file in the public folder, from the path the page asks for. */
export function publicFile(src: string): string {
  return path.join(PUBLIC, (src.split('?')[0] ?? src).replace(/^\//, ''));
}

function exists(src: string): boolean {
  return fs.existsSync(publicFile(src));
}

/** The same file with -light before its extension, if that file exists. */
export function lightTwin(src: string): string | null {
  const clean = src.split('?')[0] ?? src;
  const twin = clean.replace(/(\.[a-z0-9]+)$/i, '-light$1');
  return twin !== clean && exists(twin) ? twin : null;
}

/** A GIF with an MP4 beside it plays as video. */
function videoFor(src: string): string | undefined {
  const clean = src.split('?')[0] ?? src;
  if (!clean.endsWith('.gif')) return undefined;
  const mp4 = clean.replace(/\.gif$/, '.mp4');
  return exists(mp4) ? mp4 : undefined;
}

/** A link to another story stays in Atlas, at its section when it names one. */
const BLOG_POST =
  /generaltranslation\.com\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?blog\/([a-z0-9-]+)\/?(#[^\s)]*)?/;

function relink(href: string): string {
  const m = BLOG_POST.exec(href);
  return m && STORIES.some((s) => s.slug === m[1])
    ? `/atlas/${m[1]}${m[2] ?? ''}`
    : href;
}

/** Every link in a run of inline text through `to`, inside bold, italics and other links too. */
function mapLinks(nodes: Inline[], to: (href: string) => string): Inline[] {
  return nodes.map((node) =>
    node.t === 'link'
      ? { ...node, href: to(node.href), c: mapLinks(node.c, to) }
      : node.t === 'strong' || node.t === 'em'
        ? { ...node, c: mapLinks(node.c, to) }
        : node
  );
}

/** A block's links through `to`, wherever its text is: paragraphs, lists, rules, notes, captions and credits. */
function relinkBlock(block: Block, to: (href: string) => string): Block {
  const run = (nodes: Inline[]) => mapLinks(nodes, to);
  switch (block.kind) {
    case 'para':
    case 'footnote':
      return { ...block, inline: run(block.inline) };
    case 'list':
      return { ...block, items: block.items.map(run) };
    case 'rules':
      return {
        ...block,
        items: block.items.map((r) => ({ ...r, inline: run(r.inline) })),
      };
    case 'note':
      return { ...block, paras: block.paras.map(run) };
    case 'side':
      return {
        ...block,
        caption: run(block.caption),
        credit: run(block.credit),
      };
    case 'figure': {
      const { caption, credit } = block.figure;
      return {
        ...block,
        figure: {
          ...block.figure,
          ...(caption ? { caption: run(caption) } : {}),
          ...(credit ? { credit: run(credit) } : {}),
        },
      };
    }
    default:
      return block;
  }
}

/** A frontmatter value as a list: a list as it is, one value as a list of one, nothing as none. */
function listOf(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : value ? [value] : [];
}

/** A story from its MDX, read and parsed once per request however many times a page asks for it. */
const load = cache((slug: string): Story | null => {
  const n = STORIES.findIndex((s) => s.slug === slug) + 1;
  const entry = STORIES[n - 1];
  const published = path.join(CONTENT, `${slug}.mdx`);
  const file = fs.existsSync(published)
    ? published
    : path.join(DRAFTS, `${slug}.mdx`);
  if (!entry || !fs.existsSync(file)) return null;
  const { data, body } = splitFrontmatter(fs.readFileSync(file, 'utf8'));
  const blocks = parseBody(body, videoFor).map((block) =>
    relinkBlock(block, relink)
  );

  let count = 0;
  const figures: PlateFigure[] = [];
  for (const block of blocks) {
    if (block.kind !== 'figure') continue;
    count += 1;
    const first = block.figure.frames[0]?.src ?? '';
    figures.push({
      ...block.figure,
      n: count,
      live: entry.live?.[block.figure.id] ?? null,
      light: lightTwin(first),
    });
  }

  const images = listOf(data.images);
  const cover = images[0] ?? figures[0]?.frames[0]?.src ?? '';
  const words = wordCount(blocks);
  const authors = listOf(data.authors).map((a) => AUTHORS[a] ?? a);
  const titleInline = parseInline(String(data.title ?? entry.titles.en));
  return {
    slug,
    n,
    title: plain(titleInline),
    titleInline,
    titles: entry.titles,
    topics: entry.topics,
    look: entry.look ?? 'docs',
    summary: String(data.summary ?? ''),
    date: String(data.date ?? ''),
    authors,
    cover: cover.split('?')[0] ?? cover,
    words,
    minutes: Math.max(1, Math.round(words / 230)),
    dateline: HOME,
    blocks,
    figures,
  };
});

export function getStory(slug: string): Story | null {
  return load(slug);
}

export function getCatalog(): StoryCard[] {
  return STORIES.map((entry) => load(entry.slug))
    .filter((story): story is Story => story !== null)
    .map(({ blocks, figures, ...card }) => ({
      ...card,
      figureCount: figures.length,
      sections: blocks.flatMap((b) =>
        b.kind === 'heading' ? [{ id: b.id, text: b.text }] : []
      ),
    }));
}

export function storySlugs(): string[] {
  return STORIES.map((s) => s.slug);
}

/** A story that prints as a magazine, with the map sheet inside it that the rack's lifted corner shows (ui/MapSheet.tsx). The magazine view fetches the whole article (riffle/article.ts). */
export type MagazineIssue = { sheet: MapSheet };

/* Every story that loads prints as a magazine, its inside page the map sheet of its place, or of General Translation's
   home where it has none of its own. */
export function getMagazineIssues(): Record<string, MagazineIssue> {
  const issues: Record<string, MagazineIssue> = {};
  STORIES.forEach((entry) => {
    if (load(entry.slug))
      issues[entry.slug] = { sheet: SHEETS[entry.slug] ?? HOME_SHEET };
  });
  return issues;
}
