/**
 * The hero's burst axis.
 *
 * The prismatic field throws its light as a horizontal band through the hero,
 * and the GT dial sits on that band's dark centre. Everything here is measured
 * in the band's own space: a component's distance from the mark along its lane
 * IS its depth, so the CSS `perspective` on the stage must equal PERSPECTIVE
 * or the projected scale will not match the light.
 *
 * The unit of the hero is the PAIR. One English source and its translation are
 * emitted together on mirrored lanes and always sit at the same distance from
 * the mark, so the two are read across the axis as one string in two
 * languages. The right-hand instance re-letters itself a few dozen pixels out
 * — English going in, the localized twin coming out.
 */

export const PERSPECTIVE = 1300;

/** The shader's streaks are squashed vertically; the lanes match that ratio. */
export const LANE_SQUASH = 0.5;

const R_NEAR = 116;
const Z_NEAR = -430;
const Z_FAR = 140;

export type LanePlacement = {
  x: number;
  y: number;
  z: number;
  /** Projected scale, for depth-dependent styling. */
  scale: number;
};

/**
 * How far a lane may reach before its card would leave the frame. Measured
 * from the stage rather than hard-coded, so a card is never clipped by the
 * viewport edge on any width.
 */
export function laneReach(halfWidth: number): number {
  return Math.max(240, Math.min(680, halfWidth - 178));
}

/**
 * Position along a lane. `u` is 0 at the mark and 1 at the outer end; the lane
 * opens as it travels, so the fan spreads like light instead of running as
 * parallel rails.
 */
export function placeOnLane(u: number, laneDeg: number, reach: number): LanePlacement {
  const r = R_NEAR + (reach - R_NEAR) * u;
  const rad = (laneDeg * (0.3 + 0.7 * u) * Math.PI) / 180;
  const z = Z_NEAR + (Z_FAR - Z_NEAR) * u;
  return {
    x: Math.cos(rad) * r,
    y: Math.sin(rad) * r * LANE_SQUASH,
    z,
    scale: PERSPECTIVE / (PERSPECTIVE - z),
  };
}

export type PairKind = 'button' | 'toast' | 'field' | 'price' | 'nav' | 'line';

export type PairCopy = {
  primary: string;
  secondary?: string;
};

export type PairItem = {
  id: string;
  kind: PairKind;
  /** Degrees off the burst axis at the outer end of the lane. */
  lane: number;
  /** Starting position along the lane, so the fan is never empty. */
  phase: number;
  /** Seconds for one full run, mark → outer end. */
  duration: number;
  lang: string;
  rtl?: boolean;
  en: PairCopy;
  translated: PairCopy;
};

/**
 * Real UI, and real translations of it. Six pairs at six lane angles, phased a
 * sixth of a run apart, so four or more are always out in the legible band.
 */
export const PAIR_ITEMS: PairItem[] = [
  {
    id: 'cta',
    kind: 'button',
    lane: -27,
    phase: 0.06,
    duration: 15,
    lang: 'ja',
    en: { primary: 'Get started' },
    translated: { primary: '始める' },
  },
  {
    id: 'toast',
    kind: 'toast',
    lane: 15,
    phase: 0.23,
    duration: 17,
    lang: 'fr',
    en: { primary: 'Payment received' },
    translated: { primary: 'Paiement reçu' },
  },
  {
    id: 'field',
    kind: 'field',
    lane: -13,
    phase: 0.4,
    duration: 19,
    lang: 'es',
    en: { primary: 'Email address', secondary: 'you@company.com' },
    translated: { primary: 'Correo electrónico', secondary: 'tu@empresa.com' },
  },
  {
    id: 'price',
    kind: 'price',
    lane: 27,
    phase: 0.56,
    duration: 18,
    lang: 'de',
    en: { primary: 'Pro — $20/mo' },
    translated: { primary: 'Pro — 20 €/Monat' },
  },
  {
    id: 'nav',
    kind: 'nav',
    lane: -4,
    phase: 0.73,
    duration: 16,
    lang: 'ko',
    en: { primary: 'Home · Docs · Pricing' },
    translated: { primary: '홈 · 문서 · 요금제' },
  },
  {
    id: 'line',
    kind: 'line',
    lane: 5,
    phase: 0.89,
    duration: 20,
    lang: 'ar',
    rtl: true,
    en: { primary: 'Launch faster, with confidence.' },
    translated: { primary: 'أطلق بسرعة أكبر وبثقة.' },
  },
];

/**
 * Set to 1 by the stream whenever a pair is emitted; the dial decays it back
 * to 0. Keeps the two components independent of each other's render trees
 * while still letting the mark react to what it is putting out.
 */
export const lensPulse = { charge: 0 };

/** Scripts drawn into the ring around the mark. */
export const ACCRETION_GLYPHS = [
  '言',
  '어',
  'ع',
  'न',
  'ß',
  'ñ',
  '中',
  'Я',
  'あ',
  '한',
  'ك',
  'ह',
  'ю',
  'Ω',
  '訳',
  '語',
  'ロ',
  'م',
  'क',
  'こ',
  '文',
  'ъ',
  'é',
  'ת',
];
