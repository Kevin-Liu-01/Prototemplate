/**
 * Static content for the Wide Rule hero.
 *
 * The shelves carry the product argument: real English surfaces on the left,
 * the SAME surfaces genuinely translated on the right, mirrored about the 50%
 * rule (x and 100 − x) so the eye pairs them without a single connecting
 * line. Every translated string is a real translation — placeholder glyph
 * soup would break the premise that what leaves the gate is shippable copy.
 * (Strings inherited from the Wide Field prototype's vetted content.)
 */

export type WrCard =
  | { kind: 'nav'; items: string[] }
  | { kind: 'line'; text: string }
  | { kind: 'toast'; label: string; dir?: 'rtl'; lang?: string };

export type WrSlot = {
  id: string;
  /** Percent of the hero's width. Pairs are placed at x and 100 − x. */
  x: number;
  /** Percent of the hero's height. */
  y: number;
  /** Depth is carried by scale first; opacity is floored at 0.58 and there is
      no defocus at all — on paper, blur reads as a print error, not depth. */
  scale: number;
  opacity: number;
  /** Vertical drift amplitude in px, and its period in seconds. Signs
      alternate so mirrored halves breathe in opposition; all periods are
      distinct so no two pieces ever move together. */
  drift: number;
  dur: number;
  /** Locale stamp — only the translated half carries one. */
  locale?: string;
  /** Desktop only. At 390px there is room for exactly one mirrored pair
      beside the gate; the rest are dropped rather than shrunk. */
  wide?: boolean;
  /** Lower-shelf items sit just above the headline's top edge on a full-height
      frame; on short viewports (≤ 760px) the gap closes, so they are dropped
      rather than allowed to graze the display type. */
  low?: boolean;
  /** Narrow-viewport placement. Without one the desktop placement is reused. */
  mobile?: { x: number; y: number; scale: number };
  card: WrCard;
};

/**
 * Four shelves, worked against the band the way the prototype worked its
 * light: the quiet paper above it, its upper and lower fringes, and the
 * calmer paper below. The chips are opaque, so the fringe shelves sit ON the
 * light event and occlude it cleanly — every pair mirrored x / 100 − x so
 * both flanks of the corridor carry content.
 */
export const SLOTS: WrSlot[] = [
  /* ---- upper shelf: quiet paper between the nav and the band ---- */
  {
    id: 'nav-en',
    x: 27,
    y: 14.5,
    scale: 0.88,
    opacity: 0.8,
    drift: 8,
    dur: 19,
    wide: true,
    card: { kind: 'nav', items: ['Home', 'Docs', 'Pricing'] },
  },
  {
    id: 'nav-ja',
    x: 73,
    y: 14.5,
    scale: 0.88,
    opacity: 0.8,
    drift: -8,
    dur: 21,
    locale: 'JA',
    wide: true,
    card: { kind: 'nav', items: ['ホーム', 'ドキュメント', '料金'] },
  },

  /* ---- upper-fringe shelf: seated on the band's top feather. This pair
     carries the RTL story — dir flips and the tick swaps sides with the
     script, the same surface genuinely mirrored. ---- */
  {
    id: 'saved-en',
    x: 35.5,
    y: 28.5,
    scale: 0.92,
    opacity: 0.85,
    drift: 6,
    dur: 22.5,
    wide: true,
    card: { kind: 'toast', label: 'Changes saved' },
  },
  {
    id: 'saved-ar',
    x: 64.5,
    y: 28.5,
    scale: 0.92,
    opacity: 0.85,
    drift: -6,
    dur: 28.5,
    locale: 'AR',
    wide: true,
    card: { kind: 'toast', label: 'تم حفظ التغييرات', dir: 'rtl', lang: 'ar' },
  },

  /* ---- fringe shelf: the near pair, seated on the band's lower fringe.
     The one pair that survives to 390px, set clear of the gate. ---- */
  {
    id: 'greet-en',
    x: 23.5,
    y: 44.5,
    scale: 1.06,
    opacity: 0.97,
    drift: -7,
    dur: 16,
    mobile: { x: 26, y: 47.5, scale: 0.78 },
    card: { kind: 'line', text: 'Welcome back!' },
  },
  {
    id: 'greet-es',
    x: 76.5,
    y: 44.5,
    scale: 1.06,
    opacity: 0.97,
    drift: 7,
    dur: 17.5,
    locale: 'ES',
    mobile: { x: 74, y: 47.5, scale: 0.7 },
    card: { kind: 'line', text: '¡Bienvenido de nuevo!' },
  },

  /* ---- lower shelf: set wide, framing the headline void. y and drift are
     capped so the chip's drift ceiling clears the h1 top on every viewport
     the 880px drop gate lets through. ---- */
  {
    id: 'toast-en',
    x: 13.5,
    y: 54,
    scale: 0.9,
    opacity: 0.78,
    drift: 8,
    dur: 24,
    wide: true,
    low: true,
    card: { kind: 'toast', label: 'Payment received' },
  },
  {
    id: 'toast-de',
    x: 86.5,
    y: 54,
    scale: 0.9,
    opacity: 0.78,
    drift: -9,
    dur: 26,
    locale: 'DE',
    wide: true,
    low: true,
    card: { kind: 'toast', label: 'Zahlung erhalten' },
  },
];

/** The lower-right counterweight, hung off the 50% rule. */
export const HERO_STATS: { value: string; label: string }[] = [
  { value: '118', label: 'Locales' },
  { value: '<1s', label: 'OTA updates' },
  { value: '99.99%', label: 'Uptime' },
];

/** The one live word in the subhead — ~3s cadence, out faster than in. */
export const ROTATIONS = [
  'Spanish',
  'Japanese',
  'German',
  'French',
  'Portuguese',
  'Korean',
  'Chinese',
  'Italian',
  'Hindi',
  'Arabic',
];
