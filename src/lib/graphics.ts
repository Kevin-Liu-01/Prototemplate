import { closeSync, openSync, readdirSync, readFileSync, readSync } from 'node:fs';
import { join } from 'node:path';

import { getPost, postFigures } from '@/lib/blog';

/**
 * The illustration set behind /graphics: the manifest
 * graphics/build/gen-visuals.js writes (one row per visual) joined with
 * the exports under public/static/blogs, the grounds under
 * public/graphics/bg, the contact sheets, and the figures of the two
 * earlier posts. Read on the server at build time. Every version of one
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

const AREA_NAMES: Readonly<Record<string, { name: string; slot: string }>> = {
  H: { name: 'Covers', slot: 'The header cover in both themes with the social card cut from it, and the wireframe-map direction kept as the alternate.' },
  A: { name: 'Intuitive flow and direction', slot: 'The zones of the page and the reading path; inline in the post, then the carousel.' },
  B: { name: 'Cleaning up mental clutter', slot: 'The redline of what was deleted, then the before-and-after set.' },
  C: { name: 'One singular accordion', slot: 'The navigation census and the anatomy of the sidebar, then its persistence, the comparison and the tree.' },
  D: { name: 'Drawing the eye', slot: 'Icons, separators and type, one image each, then the quickstart before and after.' },
  E: { name: 'A unique GT flair', slot: 'The two clips, the UI primitives carousel, and the localized page.' },
  F: { name: 'The hit list', slot: 'The anti-patterns as a poster and as a mock; the list itself renders as text.' },
};

const AREA_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'H'] as const;

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
    const files = readdirSync(join(root, folder)).filter((f) => f.endsWith('.webp')).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    for (const file of files) {
      const stem = file.replace(/\.webp$/, '');
      const key = folder === 'user' ? stem : Object.entries(BLUE_GROUNDS).find(([, path]) => path === `${folder}/${file}`)?.[0];
      const users = key ? byKey.get(key) ?? [] : [];
      const number = /(\d+)/.exec(stem)?.[1] ?? stem;
      const flavor = folder === 'blue' ? (stem.endsWith('light') ? ', light ground' : `, blue duotone ${stem.split('-')[1] ?? ''}`.trimEnd()) : '';
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

/** A post content/blog keeps: its frontmatter covers and its markdown figures. */
function keptPost(slug: string): (PostGraphics & { title: string }) | undefined {
  const post = getPost(slug);
  if (!post) return undefined;
  return { slug, title: post.title, image: post.image, imageLight: post.imageLight, ogImage: post.ogImage, figures: postFigures(post.body) };
}

const DANIEL_WHITE = '/static/blogs/daniel-white';
const DANIEL_WHITE_STAMP = '?v=20261028-2300';

/**
 * The posts live on generaltranslation.com that content/blog does not keep
 * yet, because /blog has not ported the components they use (Spotlight and
 * OpenSourceGrants). Their files are copied from gt-cloud main under
 * public/static/blogs at the paths the post uses, and each figure takes its
 * carousel's label as its title and the post's alt text as its line (content
 * main fd28ea4f, 2026-10-28). The post's portrait is a photograph, not a
 * graphic, and stays out.
 */
const LIVE_ONLY: readonly (PostGraphics & { title: string })[] = [
  {
    slug: 'daniel-white',
    title: 'Daniel White: Interfaces that follow the physics of sound',
    image: `${DANIEL_WHITE}/cover.webp${DANIEL_WHITE_STAMP}`,
    ogImage: `${DANIEL_WHITE}/og.png${DANIEL_WHITE_STAMP}`,
    figures: [
      {
        src: `${DANIEL_WHITE}/cues.webp${DANIEL_WHITE_STAMP}`,
        title: 'The fourteen cues',
        alt: 'Cuelume’s fourteen cues in two groups, interactions (tap, type, select, toggle, open, close, navigate) and states (success, error, warning, loading, ready, attention, count), each beside the outline of its loudness over its own length, with tap in green',
      },
      {
        src: `${DANIEL_WHITE}/hearing.webp${DANIEL_WHITE_STAMP}`,
        title: 'Hearing and sight',
        alt: 'Two bars: sight at 1×, and hearing solid to 20× and dithered on to 100×, credited to Seth Horowitz, NPR, 2015',
      },
      {
        src: `${DANIEL_WHITE}/strike.webp${DANIEL_WHITE_STAMP}`,
        title: 'The strike',
        alt: 'The first 12 ms of the success cue on one scale: the green noise burst is over within about 3 ms while the white pitch trace is still swelling in',
      },
      {
        src: `${DANIEL_WHITE}/sine.webp${DANIEL_WHITE_STAMP}`,
        title: 'Sine waves',
        alt: 'A sine, a square and a sawtooth wave at tap’s 1,175 Hz, each beside its frequencies from 0 to 10 kHz: the sine is one line, while the square and the sawtooth add overtones that run past the 5 kHz line',
      },
      {
        src: `${DANIEL_WHITE}/overtones.webp${DANIEL_WHITE_STAMP}`,
        title: 'Overtones',
        alt: 'The ready cue’s glass note and its two overtones as bands over half a second: 392 Hz rings for 0.50 s, and its quieter overtones at 1,082 Hz and 2,117 Hz end at 0.23 s and 0.14 s',
      },
      {
        src: `${DANIEL_WHITE}/repeats.webp${DANIEL_WHITE_STAMP}`,
        title: 'Repeated plays',
        alt: 'Eight plays of tap whose peaks rise and fall within dashed lines at 12 percent above and below, over eight plays of success whose peaks sit on one line',
      },
      {
        src: `${DANIEL_WHITE}/themes.webp${DANIEL_WHITE_STAMP}`,
        title: 'Four themes',
        alt: 'The tap cue in the default, mech, bubble and press themes over the same 0.2 seconds, its clicks above each line and its pitch below: a glass ring of about 80 ms in default, a dry click gone within 20 ms in mech, tones and no click in bubble, and in press a click over a deep note that swells in, with a lighter click 90 ms later as it lets go',
      },
    ],
  },
];

/**
 * The other posts after the series: part one of the series first, then the
 * rest of the blog newest first. A slug in LIVE_ONLY reads from there (its
 * figures are carousels, which postFigures does not parse); the others read
 * their file in content/blog.
 */
const POSTS = [
  { slug: 'rewriting-our-docs', lead: 'Part one of the series: the content rewrite, illustrated with captures of the shipped docs.' },
  { slug: 'daniel-white', lead: 'The open-source grant to Cuelume, Daniel White’s library of interaction sounds: the cover in Cuelume’s green, then seven figures on how its cues are made and heard.' },
  { slug: 'supporting-slash-companies', lead: 'The translation credits for companies that bank with Slash, published with one cover.' },
  { slug: 'fuma-nama', lead: 'The interview with the creator of Fumadocs: the landing page, the slider, and the architecture diagram drawn in the post.' },
  { slug: 'supporting-open-source-software', lead: 'The announcement of the open-source grants, published with one cover.' },
] as const;

/** The posts /graphics illustrates: the docs series, then each post in POSTS that has a section. */
export function graphicsPostCount(blocks: readonly Block[]): number {
  return 1 + blocks.filter((block) => POSTS.some((post) => post.slug === block.id)).length;
}

/** Every section of /graphics with its entries numbered through the whole set. */
export function getGraphicsBlocks(): readonly Block[] {
  const visuals = readManifest();
  const blocks: Omit<Block, 'ordinal'>[] = [];
  for (const id of AREA_ORDER) {
    const area = AREA_NAMES[id];
    const entries = visualEntries(visuals.filter((v) => v.area === id));
    if (!entries.length || !area) continue;
    blocks.push({ id: `area-${id.toLowerCase()}`, label: area.name, lead: area.slot, entries });
  }
  blocks.push({ id: 'sheets', label: 'Contact sheets', lead: 'The finished set tiled at thumbnail size, the way a reader meets it.', entries: sheetEntries() });
  blocks.push({ id: 'grounds', label: 'Backgrounds', lead: 'The glyphfield exports the visuals sit on, at their native 1920 by 1080 and their own aspect; each names the visuals that use it.', entries: groundEntries(visuals) });
  for (const { slug, lead } of POSTS) {
    const post = LIVE_ONLY.find((p) => p.slug === slug) ?? keptPost(slug);
    const entries = post ? postEntries(post) : [];
    if (post && entries.length) blocks.push({ id: slug, label: post.title, lead, entries });
  }
  let n = 0;
  return blocks.map((block, i) => ({
    ...block,
    ordinal: i + 1,
    entries: block.entries.map((entry) => {
      n += 1;
      return { ...entry, n: pad3(n) };
    }),
  }));
}
