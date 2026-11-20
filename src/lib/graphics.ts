import { closeSync, openSync, readdirSync, readFileSync, readSync } from 'node:fs';
import { join } from 'node:path';

import { getPosts, postFigures } from '@/lib/blog';
import type { Post } from '@/lib/blog';
import { POST_SHORT } from '@/lib/post-names';
import { pictureNote } from '@/lib/previous-mark';

/**
 * The illustration set behind /graphics: the manifest
 * graphics/build/gen-visuals.js writes (one row per visual) joined with
 * the exports under public/static/blogs, the grounds under
 * public/graphics/bg, the contact sheets, and the covers and figures of
 * every other post. Read on the server at build time. Each post is one
 * section, newest first, with its cover ahead of its figures. Every version of one
 * image (dark and light, the social card cut from a cover, a clip's still,
 * GIF and video) is one entry with variants, so the viewer shows them in
 * one place. Each variant's size is read from its file's header, so the
 * frame the viewer reserves matches the picture.
 */

export type Visual = {
  id: string;
  /** the area letter: A to F for the post's sections, H for covers */
  area: string;
  name: string;
  /** the background key from gen-lib.js's BG map */
  bg: string;
  why: string;
  w: number;
  h: number;
  animated: boolean;
};

import type { Block, Entry, Variant } from '@/lib/graphics-model';

/** The sections of the docs series post, in its order; each names the images that illustrate it. */
const AREA_NAMES: Readonly<Record<string, string>> = {
  A: 'Intuitive flow and direction',
  B: 'Cleaning up mental clutter',
  C: 'One singular accordion',
  D: 'Drawing the eye',
  E: 'A unique General Translation flair',
  F: 'The hit list',
};

/** The covers first, then the post's sections in order. */
const AREA_ORDER = ['H', 'A', 'B', 'C', 'D', 'E', 'F'] as const;

/** The post the manifest illustrates. */
const DOCS_SERIES = 'designing-docs-for-humans';

/** The clips, by visual id: the GIF the post embeds and the MP4 master beside it. */
const CLIPS: Readonly<Record<string, { gif: string; video: string }>> = {
  'E1-hover-mask': { gif: '/static/blogs/designing-docs-toc-slide.gif', video: '/static/blogs/designing-docs-toc-slide.mp4' },
  'E6-sidebar-mask': { gif: '/static/blogs/designing-docs-sidebar-mask.gif', video: '/static/blogs/designing-docs-sidebar-mask.mp4' },
};

/** The social cards the post ships, cut from the exploded cover at 2400 by 1260. */
const SHIPPED_CARDS: Readonly<Record<string, { card: string; cardLight: string }>> = {
  'H1-cover-exploded': { card: '/static/blogs/designing-docs-og.png', cardLight: '/static/blogs/designing-docs-og-light.png' },
};

/** The blue grounds by their BG key; the user palette maps by name. */
const BLUE_GROUNDS: Readonly<Record<string, string>> = { blue16: 'blue/u16-A.webp', blue25: 'blue/u25-A.webp', blue25light: 'blue/u25-light.webp' };

export function readManifest(): readonly Visual[] {
  const file = join(process.cwd(), 'graphics', 'build', 'manifest.json');
  return JSON.parse(readFileSync(file, 'utf8')) as Visual[];
}

/** The 3840-wide export of a visual. */
function visualSrc(id: string): string {
  return `/static/blogs/designing-docs-${id}.webp`;
}

const PUBLIC = join(process.cwd(), 'public');

/**
 * The pixel size of a file under public/, read from its first 4 KB: a PNG's
 * IHDR, a GIF's screen, a WebP's first chunk, a JPEG's frame header, or an
 * MP4's first track header with a picture (the moov box must lead, as a faststart export
 * does). Undefined for a remote, missing or other file; the viewer then
 * frames it at 16 by 9.
 */
function fileSize(src: string): { w: number; h: number } | undefined {
  if (!src.startsWith('/')) return undefined;
  const head = Buffer.alloc(4096);
  let read: number;
  try {
    const fd = openSync(join(PUBLIC, src.split('?')[0] ?? src), 'r');
    try {
      read = readSync(fd, head, 0, head.length, 0);
    } finally {
      closeSync(fd);
    }
  } catch {
    return undefined;
  }
  const b = head.subarray(0, read);
  if (b.length < 32) return undefined;
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.toString('ascii', 0, 3) === 'GIF') return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8X') return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    /* a JPEG: step over the segments to the first frame header (SOF0 to SOF15 less DHT, JPG and DAC), which holds the height, then the width */
    for (let at = 2; at + 9 <= b.length && b[at] === 0xff; at += 2 + b.readUInt16BE(at + 2)) {
      const marker = b[at + 1] ?? 0;
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return { w: b.readUInt16BE(at + 7), h: b.readUInt16BE(at + 5) };
    }
  }
  if (b.toString('ascii', 4, 8) === 'ftyp') {
    for (let at = b.indexOf('tkhd'); at >= 0; at = b.indexOf('tkhd', at + 4)) {
      /* width and height are the box's last two 16.16 fields; version 1 widens its times to 64 bits */
      const end = at + (b[at + 4] === 1 ? 92 : 80);
      if (end + 8 > b.length) break;
      const w = b.readUInt32BE(end) >>> 16;
      const h = b.readUInt32BE(end + 4) >>> 16;
      if (w && h) return { w, h };
    }
  }
  return undefined;
}

/** One version of an image, sized from its file. */
function variantOf(key: string, label: string, src: string, kind: Variant['kind'] = 'image'): Variant {
  return { key, label, src, ...fileSize(src), kind };
}

/* ---------- the entries ---------- */

/** `7` becomes `007`: three digits, since the set runs past a hundred. */
function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

/** `rewriting-docs-next-steps.png` becomes `Next steps`. */
function figureTitle(src: string, fallback: string): string {
  const file = src.split('/').pop()?.split('?')[0] ?? '';
  const stem = file.replace(/\.[a-z0-9]+$/i, '').replace(/^(rewriting-docs|rewriting-our-docs|fuma-nama|fumadocs)-?/, '');
  if (!stem) return fallback;
  const words = stem.split('-').join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const VARIANT_SUFFIXES = [
  ['-og-light', 'card-light', 'Card, light'],
  ['-og', 'card', 'Card'],
  ['-light', 'light', 'Light'],
] as const;

/** `H1-cover-exploded-og-light` splits into its base id and the version it is. */
function splitVariant(id: string): { base: string; key: string; label: string } {
  for (const [suffix, key, label] of VARIANT_SUFFIXES) {
    if (id.endsWith(suffix)) return { base: id.slice(0, -suffix.length), key, label };
  }
  return { base: id, key: 'dark', label: 'Dark' };
}

/** The manifest's visuals as entries: versions of one image folded together, clips with their still, GIF and video. */
function visualEntries(visuals: readonly Visual[]): Entry[] {
  const order: string[] = [];
  const groups = new Map<string, { base: Visual; parts: { key: string; label: string; visual: Visual }[] }>();
  for (const visual of visuals) {
    const { base, key, label } = splitVariant(visual.id);
    let group = groups.get(base);
    if (!group) {
      group = { base: visual, parts: [] };
      groups.set(base, group);
      order.push(base);
    }
    if (key === 'dark') group.base = visual;
    group.parts.push({ key, label, visual });
  }
  return order.map((base) => {
    const group = groups.get(base);
    if (!group) throw new Error(`no group for ${base}`);
    const { base: visual, parts } = group;
    const shipped = SHIPPED_CARDS[base];
    const clip = CLIPS[base];
    let variants: Variant[];
    if (clip) {
      variants = [
        variantOf('gif', 'GIF', clip.gif, 'gif'),
        variantOf('video', 'Video', clip.video, 'video'),
        variantOf('still', 'Still', visualSrc(visual.id)),
      ];
    } else {
      const rank: Record<string, number> = { dark: 0, light: 1, card: 2, 'card-light': 3 };
      variants = parts
        .sort((a, b) => (rank[a.key] ?? 9) - (rank[b.key] ?? 9))
        .map(({ key, label, visual: v }) => {
          /* the post ships the exploded cover's cards as 2400 by 1260 PNGs; those are the versions that matter */
          if (shipped && key === 'card') return variantOf(key, label, shipped.card);
          if (shipped && key === 'card-light') return variantOf(key, label, shipped.cardLight);
          return variantOf(key, label, visualSrc(v.id));
        });
      if (variants.length === 1 && variants[0]) variants = [{ ...variants[0], key: 'image', label: 'Image' }];
    }
    const dark = variants.find((v) => v.key === 'dark' || v.key === 'image' || v.key === 'still') ?? variants[0];
    const light = variants.find((v) => v.key === 'light');
    if (!dark) throw new Error(`no version for ${base}`);
    return {
      id: base,
      n: '',
      title: visual.name,
      why: visual.why,
      ground: visual.bg,
      variants,
      shot: light ? { light: light.src, dark: dark.src } : { light: dark.src },
    };
  });
}

/** The three contact sheets under public/graphics/sheets, lossless WebP (a PNG still reads). */
function sheetEntries(): Entry[] {
  const dir = join(process.cwd(), 'public', 'graphics', 'sheets');
  const files = readdirSync(dir).filter((f) => /\.(webp|png)$/.test(f)).sort();
  const notes = ['areas A to D at thumbnail size', 'areas D to F', 'the covers'];
  return files.map((file, i) => {
    const src = `/graphics/sheets/${file}`;
    return {
      id: `sheet-${i + 1}`,
      n: '',
      title: `Contact sheet ${i + 1} of ${files.length}`,
      why: `The set tiled at the size a reader meets it, ${notes[i] ?? 'the rest of the set'}; what the set was reviewed on.`,
      variants: [variantOf('image', 'Image', src)],
      shot: { light: src },
    };
  });
}

/** Every ground under public/graphics/bg, with the visuals that sit on it. */
function groundEntries(visuals: readonly Visual[]): Entry[] {
  const root = join(process.cwd(), 'public', 'graphics', 'bg');
  const byKey = new Map<string, string[]>();
  for (const v of visuals) {
    const list = byKey.get(v.bg) ?? [];
    list.push(v.name);
    byKey.set(v.bg, list);
  }
  const entries: Entry[] = [];
  for (const folder of ['user', 'blue'] as const) {
    const files = readdirSync(join(root, folder)).filter((f) => f.endsWith('.webp')).sort((a, b) => a.slice(0, -5).localeCompare(b.slice(0, -5), undefined, { numeric: true }));
    for (const file of files) {
      const stem = file.replace(/\.webp$/, '');
      const key = folder === 'user' ? stem : Object.entries(BLUE_GROUNDS).find(([, path]) => path === `${folder}/${file}`)?.[0];
      const users = key ? byKey.get(key) ?? [] : [];
      const number = /(\d+)/.exec(stem)?.[1] ?? stem;
      const [, tone = '', ...cut] = stem.split('-');
      const cutName = cut.join(' ').replace(/\bog\b/, 'social card');
      const flavor = folder === 'blue' ? (stem.endsWith('light') ? ', light ground' : `, blue duotone ${tone}${cutName ? `, ${cutName}` : ''}`) : '';
      const src = `/graphics/bg/${folder}/${file}`;
      entries.push({
        id: `ground-${folder}-${stem}`,
        n: '',
        title: `glyphfield export ${number}${flavor}`,
        why: users.length ? `Ground of ${users.join(', ')}.` : 'Kept in the palette; no visual sits on it yet.',
        variants: [variantOf('image', 'Image', src)],
        shot: { light: src },
      });
    }
  }
  return entries;
}

/** A post's graphics: its cover in the versions it has, then its figures in order. */
type PostGraphics = {
  slug: string;
  image?: string;
  imageLight?: string;
  ogImage?: string;
  ogImageLight?: string;
  /** each figure's file and the post's alt text; `title` names it where the file name would not */
  figures: readonly { src: string; alt: string; title?: string }[];
};

/** `/static/blogs/x.jpg?v=1` and `/static/blogs/x.jpg` are one file. */
function samePath(a: string, b: string): boolean {
  return a.split('?')[0] === b.split('?')[0];
}

/**
 * A post's entries: its cover with every version (a social card that is the
 * cover's own file is not a second version), then its figures.
 */
function postEntries(post: PostGraphics): Entry[] {
  const { slug } = post;
  const entries: Entry[] = [];
  if (post.image) {
    const card = post.ogImage && !samePath(post.ogImage, post.image) ? post.ogImage : undefined;
    const variants: Variant[] = [variantOf('dark', post.imageLight ? 'Dark' : 'Cover', post.image)];
    if (post.imageLight) variants.push(variantOf('light', 'Light', post.imageLight));
    if (card) variants.push(variantOf('card', 'Card', card));
    if (card && post.ogImageLight) variants.push(variantOf('card-light', 'Card, light', post.ogImageLight));
    const cover = post.imageLight ? 'The header cover in both themes' : 'The header cover';
    entries.push({
      id: `${slug}-cover`,
      n: '',
      title: 'The cover',
      why: card
        ? `${cover}, and the social card the post’s Open Graph and Twitter tags point at.`
        : `${cover}, which is also the social card the post’s Open Graph and Twitter tags point at.`,
      variants,
      shot: post.imageLight ? { light: post.imageLight, dark: post.image } : { light: post.image },
    });
  }
  post.figures.forEach((figure, i) => {
    entries.push({
      id: `${slug}-figure-${i + 1}`,
      n: '',
      title: figure.title ?? figureTitle(figure.src, `Figure ${i + 1}`),
      why: figure.alt,
      variants: [variantOf('image', 'Image', figure.src)],
      shot: { light: figure.src },
    });
  });
  return entries;
}

/** A post's graphics read from its file in content/blog: the frontmatter covers and the figures of the body. */
function keptPost(post: Post): PostGraphics {
  return { slug: post.slug, image: post.image, imageLight: post.imageLight, ogImage: post.ogImage, figures: postFigures(post.body) };
}

const PARAGLIDE_CONTEXT_DIR = '/static/blogs/paraglide-js-context';

/** Kept here as images: the post shows its four figures as live components in gt-cloud, and its file is not in content/blog. */
const PARAGLIDE_CONTEXT: PostGraphics & { title: string } = {
  slug: 'paraglide-js-context',
  title: 'How we extract translation context from compiled i18n',
  image: `${PARAGLIDE_CONTEXT_DIR}/cover.webp`,
  imageLight: `${PARAGLIDE_CONTEXT_DIR}/cover-light.webp`,
  ogImage: `${PARAGLIDE_CONTEXT_DIR}/og.png`,
  ogImageLight: `${PARAGLIDE_CONTEXT_DIR}/og-light.png`,
  figures: [
    { src: `${PARAGLIDE_CONTEXT_DIR}/order-in-context.webp`, title: 'Order in context', alt: 'One en.json entry, "order": "Order", called as m.order() in a <button>, an <h1> and a <select aria-label>, translated as a verb, a noun and a sequence in German, Spanish and Chinese.' },
    { src: `${PARAGLIDE_CONTEXT_DIR}/call-site.webp`, title: 'Call site', alt: 'A split diff of src/Header.tsx: the two versions match except line 3, where <h1>Hello {name}!</h1> becomes <h1>{m.greeting({ name })}</h1>.' },
    { src: `${PARAGLIDE_CONTEXT_DIR}/tracing.webp`, title: 'Tracing', alt: 'The four tracing steps (module graph, usage collector, value evaluator, call-site and importer indexes), each with the code it reads and the message or pattern it finds: Paraglide output, an alias, greeting and err_*.' },
    { src: `${PARAGLIDE_CONTEXT_DIR}/context-window.webp`, title: 'Context window', alt: 'CheckoutSummary.tsx with the 10 lines around m.order highlighted, and the en.metadata.json entry that records them as before, target and after.' },
  ],
};

/**
 * What each post's section holds, by slug; a post without a line here leads
 * with its summary. The Daniel White post's portrait is a Spotlight
 * attribute, a photograph rather than a graphic, so it stays out.
 */
const POST_LEADS: Readonly<Record<string, string>> = {
  'paraglide-js': 'The announcement that Paraglide JS joins General Translation, published with one cover and its social card.',
  'paraglide-js-context': 'The Paraglide JS context post, not yet published: the cover and social card in both themes, and the four figures the post shows as live components.',
  'daniel-white': 'The open-source grant to Cuelume, Daniel White’s library of interaction sounds: the cover in Cuelume’s green, then seven figures on how its cues are made and heard.',
  'supporting-slash-companies': 'The translation credits for companies that bank with Slash, published with one cover.',
  [DOCS_SERIES]: 'Part two of the series: the header cover in both themes with the social card cut from it and the wireframe-map direction kept as the alternate, then the figures in the order of the post’s sections, each row naming its section.',
  'rewriting-our-docs': 'Part one of the series: the content rewrite, illustrated with captures of the shipped docs.',
  'fuma-nama': 'The interview with the creator of Fumadocs: the landing page, the slider, and the architecture diagram drawn in the post.',
  'supporting-open-source-software': 'The announcement of the open-source grants, published with one cover.',
};

/** The docs series post's images from the manifest: the covers, then each section's visuals in the post's order. */
function docsSeriesEntries(visuals: readonly Visual[]): Entry[] {
  return AREA_ORDER.flatMap((area) => {
    const part = AREA_NAMES[area];
    const entries = visualEntries(visuals.filter((v) => v.area === area));
    return part ? entries.map((entry) => ({ ...entry, part })) : entries;
  });
}

/**
 * One section per post, newest first as /blog lists them, with the
 * unpublished context post ahead of them: the docs series from the
 * manifest, the others from their files in content/blog.
 */
function postBlocks(visuals: readonly Visual[]): Omit<Block, 'ordinal'>[] {
  const posts: readonly { slug: string; title: string; summary: string; set: PostGraphics }[] = [
    { slug: PARAGLIDE_CONTEXT.slug, title: PARAGLIDE_CONTEXT.title, summary: '', set: PARAGLIDE_CONTEXT },
    ...getPosts().map((post) => ({ slug: post.slug, title: post.title, summary: post.summary, set: keptPost(post) })),
  ];
  return posts.flatMap(({ slug, title, set, summary }) => {
    const entries = slug === DOCS_SERIES ? docsSeriesEntries(visuals) : postEntries(set);
    if (!entries.length) return [];
    return [{ id: slug, label: title, short: POST_SHORT[slug], lead: POST_LEADS[slug] ?? summary, entries }];
  });
}

/** The sections that are not posts: the docs series' contact sheets and the grounds of its visuals. */
const TOOLCHAIN_BLOCKS = new Set(['sheets', 'grounds']);

/** The posts /graphics illustrates: every section but the sheets and the grounds. */
export function graphicsPostCount(blocks: readonly Block[]): number {
  return blocks.filter((block) => !TOOLCHAIN_BLOCKS.has(block.id)).length;
}

/** Every section of /graphics with its entries numbered through the whole set: the posts, then the sheets and the grounds. */
export function getGraphicsBlocks(): readonly Block[] {
  const visuals = readManifest();
  const blocks: Omit<Block, 'ordinal'>[] = [
    ...postBlocks(visuals),
    { id: 'sheets', label: 'Contact sheets', lead: 'The docs series tiled at thumbnail size, the way a reader meets it.', entries: sheetEntries() },
    { id: 'grounds', label: 'Backgrounds', lead: 'The glyphfield exports the docs series sits on, at their native 1920 by 1080 and their own aspect; each names the visuals that use it.', entries: groundEntries(visuals) },
  ];
  let n = 0;
  return blocks.map((block, i) => ({
    ...block,
    ordinal: i + 1,
    entries: block.entries.map((entry) => {
      n += 1;
      /* an image the logo lock holds as history says so on its row */
      const markNote = entry.variants.map((v) => pictureNote(v.src)).find(Boolean);
      return markNote ? { ...entry, n: pad3(n), markNote } : { ...entry, n: pad3(n) };
    }),
  }));
}
