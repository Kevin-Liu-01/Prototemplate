import { readdirSync, readFileSync } from 'node:fs';
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
 * one place.
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

export type Area = {
  id: string;
  name: string;
  /** where in the post the area's visuals sit */
  slot: string;
  visuals: readonly Visual[];
};

export type { Block, Entry, Variant } from '@/lib/graphics-model';
export { backgroundLabel } from '@/lib/graphics-model';
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

/** The visuals grouped by area, in the post's order, covers last. */
export function getAreas(): readonly Area[] {
  const visuals = readManifest();
  return AREA_ORDER.map((id) => ({
    id,
    name: AREA_NAMES[id]?.name ?? id,
    slot: AREA_NAMES[id]?.slot ?? '',
    visuals: visuals.filter((v) => v.area === id),
  })).filter((area) => area.visuals.length > 0);
}

/** The 3840-wide export of a visual. */
export function visualSrc(id: string): string {
  return `/static/blogs/designing-docs-${id}.webp`;
}

/** The export's pixel size: every visual renders 3840 wide, whatever its stage. */
function exportSize(visual: Visual): { w: number; h: number } {
  return { w: 3840, h: Math.round((3840 * visual.h) / visual.w) };
}

/** The GIF of an animated visual, when it has one. */
export function clipSrc(id: string): string | undefined {
  return CLIPS[id]?.gif;
}

/** The served path of a ground, by its BG key. */
export function backgroundSrc(bg: string): string | undefined {
  if (/^u\d+$/.test(bg)) return `/graphics/bg/user/${bg}.webp`;
  const blue = BLUE_GROUNDS[bg];
  return blue ? `/graphics/bg/${blue}` : undefined;
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
        { key: 'gif', label: 'GIF', src: clip.gif, w: 1400, h: 788, kind: 'gif' },
        { key: 'video', label: 'Video', src: clip.video, w: 1400, h: 788, kind: 'video' },
        { key: 'still', label: 'Still', src: visualSrc(visual.id), ...exportSize(visual), kind: 'image' },
      ];
    } else {
      const rank: Record<string, number> = { dark: 0, light: 1, card: 2, 'card-light': 3 };
      variants = parts
        .sort((a, b) => (rank[a.key] ?? 9) - (rank[b.key] ?? 9))
        .map(({ key, label, visual: v }) => {
          /* the post ships the exploded cover's cards as 2400 by 1260 PNGs; those are the versions that matter */
          if (shipped && key === 'card') return { key, label, src: shipped.card, w: 2400, h: 1260, kind: 'image' as const };
          if (shipped && key === 'card-light') return { key, label, src: shipped.cardLight, w: 2400, h: 1260, kind: 'image' as const };
          return { key, label, src: visualSrc(v.id), ...exportSize(v), kind: 'image' as const };
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

/** The three contact sheets under public/graphics/sheets. */
function sheetEntries(): Entry[] {
  const dir = join(process.cwd(), 'public', 'graphics', 'sheets');
  const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
  const notes = ['areas A to D at thumbnail size', 'areas D to F', 'the covers'];
  return files.map((file, i) => {
    const src = `/graphics/sheets/${file}`;
    return {
      id: `sheet-${i + 1}`,
      n: '',
      title: `Contact sheet ${i + 1} of ${files.length}`,
      why: `The set tiled at the size a reader meets it, ${notes[i] ?? 'the rest of the set'}; what the set was reviewed on.`,
      variants: [{ key: 'image', label: 'Image', src, w: 2560, h: i === files.length - 1 ? 768 : 1536, kind: 'image' }],
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
        variants: [{ key: 'image', label: 'Image', src, w: 1920, h: 1080, kind: 'image' }],
        shot: { light: src },
      });
    }
  }
  return entries;
}

/** An earlier post: its cover in every version it has, then its figures. */
function postEntries(slug: string): Entry[] {
  const post = getPost(slug);
  if (!post) return [];
  const entries: Entry[] = [];
  if (post.image) {
    const variants: Variant[] = [{ key: 'dark', label: post.imageLight ? 'Dark' : 'Cover', src: post.image, w: 1920, h: 1080, kind: 'image' }];
    if (post.imageLight) variants.push({ key: 'light', label: 'Light', src: post.imageLight, w: 1920, h: 1080, kind: 'image' });
    if (post.ogImage) variants.push({ key: 'card', label: 'Card', src: post.ogImage, kind: 'image' });
    entries.push({
      id: `${slug}-cover`,
      n: '',
      title: 'The cover',
      why: post.imageLight ? 'The header cover in both themes, and the social card the post’s Open Graph and Twitter tags point at.' : 'The header cover, and the social card the post’s Open Graph and Twitter tags point at.',
      variants,
      shot: post.imageLight ? { light: post.imageLight, dark: post.image } : { light: post.image },
    });
  }
  postFigures(post.body).forEach((figure, i) => {
    entries.push({
      id: `${slug}-figure-${i + 1}`,
      n: '',
      title: figureTitle(figure.src, `Figure ${i + 1}`),
      why: figure.alt,
      variants: [{ key: 'image', label: 'Image', src: figure.src, kind: 'image' }],
      shot: { light: figure.src },
    });
  });
  return entries;
}

const EARLIER = [
  { slug: 'rewriting-our-docs', lead: 'Part one of the series: the content rewrite, illustrated with captures of the shipped docs.' },
  { slug: 'fuma-nama', lead: 'The interview with the creator of Fumadocs: the landing page, the slider, and the architecture diagram drawn in the post.' },
] as const;

/** Every section of /graphics with its entries numbered through the whole set. */
export function getGraphicsBlocks(): readonly Block[] {
  const visuals = readManifest();
  const blocks: Omit<Block, 'ordinal'>[] = [];
  for (const id of AREA_ORDER) {
    const area = AREA_NAMES[id];
    const entries = visualEntries(visuals.filter((v) => v.area === id));
    if (!entries.length || !area) continue;
    blocks.push({ id: `area-${id.toLowerCase()}`, label: area.name, eyebrow: id === 'H' ? 'Covers' : `Area ${id}`, lead: area.slot, entries });
  }
  blocks.push({ id: 'sheets', label: 'Contact sheets', eyebrow: 'Review', lead: 'The finished set tiled at thumbnail size, the way a reader meets it.', entries: sheetEntries() });
  blocks.push({ id: 'grounds', label: 'Backgrounds', eyebrow: 'Grounds', lead: 'The glyphfield exports the visuals sit on, at their native 1920 by 1080 and their own aspect; each names the visuals that use it.', entries: groundEntries(visuals) });
  for (const { slug, lead } of EARLIER) {
    const post = getPost(slug);
    const entries = postEntries(slug);
    if (post && entries.length) blocks.push({ id: slug, label: post.title, eyebrow: 'Earlier in the series', lead, entries });
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
