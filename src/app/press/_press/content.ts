/* Loads the press's stories from the blog's MDX at build time. Prototemplate
   keeps the shipped posts in content/production/blog/en-US and their pictures
   in public/static/blogs; another app sets PRESS_CONTENT and PRESS_PUBLIC. */

import fs from 'node:fs';
import path from 'node:path';

import { HOME, type LatLon } from './coords';
import { parseBody, parseInline, plain, splitFrontmatter, wordCount, type Block, type Figure, type Inline } from './parse';
import { AUTHORS, STORIES, type LiveKind, type Localized, type Look, type Topic } from './stories';

const CONTENT = process.env.PRESS_CONTENT ?? path.join(process.cwd(), 'content/production/blog/en-US');
const PUBLIC = process.env.PRESS_PUBLIC ?? path.join(process.cwd(), 'public');
/** Stories still in draft, which the blog does not carry yet. */
const DRAFTS = path.join(process.cwd(), 'src/app/press/_press/drafts');

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
  coverLight: string | null;
  words: number;
  minutes: number;
  dateline: LatLon;
  blocks: Block[];
  figures: PlateFigure[];
};

export type StoryCard = Omit<Story, 'blocks' | 'figures'> & { figureCount: number; sections: { id: string; text: string }[] };

function publicFile(src: string): string {
  return path.join(PUBLIC, (src.split('?')[0] ?? src).replace(/^\//, ''));
}

function exists(src: string): boolean {
  return fs.existsSync(publicFile(src));
}

/** The same file with -light before its extension, if that file exists. */
function lightTwin(src: string): string | null {
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

function load(slug: string, n: number): Story | null {
  const entry = STORIES.find((s) => s.slug === slug);
  const published = path.join(CONTENT, `${slug}.mdx`);
  const file = fs.existsSync(published) ? published : path.join(DRAFTS, `${slug}.mdx`);
  if (!entry || !fs.existsSync(file)) return null;
  const { data, body } = splitFrontmatter(fs.readFileSync(file, 'utf8'));
  const blocks = parseBody(body, videoFor).map((block) => {
    if (block.kind !== 'para') return block;
    // links to another story in the press stay in the press
    const relink = (nodes: typeof block.inline): typeof block.inline =>
      nodes.map((node) => {
        if (node.t === 'link') {
          const m = /generaltranslation\.com\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?blog\/([a-z0-9-]+)/.exec(node.href);
          const inPress = m && STORIES.some((s) => s.slug === m[1]);
          return { ...node, href: inPress ? `/press/${m[1]}` : node.href };
        }
        return node.t === 'strong' || node.t === 'em' ? { ...node, c: relink(node.c) } : node;
      });
    return { ...block, inline: relink(block.inline) };
  });

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

  const images = (data.images as string[] | undefined) ?? [];
  const cover = images[0] ?? figures[0]?.frames[0]?.src ?? '';
  const words = wordCount(blocks);
  const authors = ((data.authors as string[] | undefined) ?? []).map((a) => AUTHORS[a] ?? a);
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
    coverLight: lightTwin(cover),
    words,
    minutes: Math.max(1, Math.round(words / 230)),
    dateline: HOME,
    blocks,
    figures,
  };
}

export function getStory(slug: string): Story | null {
  const index = STORIES.findIndex((s) => s.slug === slug);
  return index === -1 ? null : load(slug, index + 1);
}

export function getCatalog(): StoryCard[] {
  return STORIES.map((entry, i) => load(entry.slug, i + 1))
    .filter((story): story is Story => story !== null)
    .map(({ blocks, figures, ...card }) => ({
      ...card,
      figureCount: figures.length,
      sections: blocks.flatMap((b) => (b.kind === 'heading' ? [{ id: b.id, text: b.text }] : [])),
    }));
}

export function storySlugs(): string[] {
  return STORIES.map((s) => s.slug);
}
