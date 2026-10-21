import {
  GLOBE_ROUNDS,
  type GlobeRoundKey,
  type GlobeVariantKey,
} from '@/app/d/blog-globe/_stage/rounds';

/**
 * What the docs frames know about the globe figures without loading one:
 * where each round's stage lives, each variant's name and each figure's
 * height. The figures themselves live in src/app/d/blog-globe, one route
 * per round, and a frame shows one of them with ?v=<variant>&embed=1.
 */

/** The route of the last round; the earlier rounds sit below it (/r1, /r2). */
export const GLOBE_BASE = '/d/blog-globe';

/** Each variant's drawing, as /docs/components/blog-globe names it. */
export const VARIANT_NAMES: Record<GlobeVariantKey, string> = {
  a: 'dithered',
  b: 'line',
  c: 'glyph',
  d: 'dot',
};

function roundPath(round: GlobeRoundKey): string {
  return GLOBE_ROUNDS.find((entry) => entry.key === round)?.path ?? '';
}

/** One variant of one round on its stage, with the links between rounds around it. */
export function stageHref(round: GlobeRoundKey, variant: GlobeVariantKey): string {
  return `${GLOBE_BASE}${roundPath(round)}?v=${variant}`;
}

/** The figure alone, for a frame: it posts its height to the page around it. */
export function embedHref(round: GlobeRoundKey, variant: GlobeVariantKey): string {
  return `${stageHref(round, variant)}&embed=1`;
}

/**
 * Each figure's height in CSS px with its outer margins at 0, laid out at
 * the review column (712 px) and at 343 px (the docs column on a 375 px
 * phone), measured on 2026-10-20 in Chromium. A frame keeps this space
 * until its figure reports the exact height, so a frame that loads as the
 * reader scrolls does not move the text around it. Rounds 1 and 2 share
 * their layout: round 2 only adds the city targets.
 */
export const FIGURE_HEIGHTS: Record<
  GlobeRoundKey,
  Record<GlobeVariantKey, readonly [column: number, phone: number]>
> = {
  r1: { a: [507, 528], b: [624, 766], c: [491, 560], d: [416, 349] },
  r2: { a: [507, 528], b: [624, 766], c: [491, 560], d: [416, 349] },
  r3: { a: [596, 867], b: [571, 919], c: [609, 879], d: [576, 886] },
};
