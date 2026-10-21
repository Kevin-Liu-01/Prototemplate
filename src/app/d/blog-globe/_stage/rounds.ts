import type { CSSProperties, ReactNode } from 'react';

/* Every round of the globe figures on the stage, oldest first. Each round
   is a copy of gt-cloud's globe folder in ../_rounds/<key>/ and has its own
   route below /d/blog-globe; the last round is served at /d/blog-globe
   itself. In gt-cloud round 3 is the live code, so here it is frozen at the
   commit it was copied from. */
export type GlobeRoundKey = 'r1' | 'r2' | 'r3';

/* commit is typed string | null, so the stage's label for a live round (no
   commit) still type-checks while every round here is frozen */
export type GlobeRound = {
  key: GlobeRoundKey;
  number: number;
  path: string;
  commit: string | null;
};

export const GLOBE_ROUNDS: readonly GlobeRound[] = [
  { key: 'r1', number: 1, path: '/r1', commit: 'c7031e2ca8' },
  { key: 'r2', number: 2, path: '/r2', commit: 'ee19373e96' },
  { key: 'r3', number: 3, path: '', commit: '5ba413acfb' },
];

export const GLOBE_VARIANT_KEYS = ['a', 'b', 'c', 'd'] as const;

export type GlobeVariantKey = (typeof GLOBE_VARIANT_KEYS)[number];

/** The order the design review reads the variants in, used by /d/blog-globe/all's rows. */
export const GLOBE_REVIEW_ORDER: readonly GlobeVariantKey[] = [
  'd',
  'a',
  'b',
  'c',
];

/** One round's four figures, as the round's route renders them. */
export type GlobeFigures = Record<GlobeVariantKey, ReactNode>;

const STAGE_WIDTH = 760;
const STAGE_GUTTER = 24;

/** The stage's column, the width every figure was reviewed at. */
export const STAGE_COLUMN = STAGE_WIDTH - 2 * STAGE_GUTTER;

export const STAGE_MAIN: CSSProperties = {
  maxWidth: STAGE_WIDTH,
  margin: '0 auto',
  padding: `64px ${STAGE_GUTTER}px`,
};

/** What an embedded stage (?embed=1) posts to its parent when it mounts, when its height changes and when the parent asks. */
export const EMBED_HEIGHT = 'globe-embed-height';

export type EmbedHeight = { type: typeof EMBED_HEIGHT; height: number };

/** What the parent posts to a frame when it mounts, in case the frame posted its height before anyone listened. */
export const EMBED_ASK = 'globe-embed-ask';

export type EmbedAsk = { type: typeof EMBED_ASK };
