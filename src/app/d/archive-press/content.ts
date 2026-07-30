/**
 * Static content for Wide Field.
 *
 * The hero is a film still: a handful of real product surfaces scattered wide
 * across a band of dispersed light, English on the left and the same surfaces
 * translated on the right. Every translated string is a real translation of the
 * English it mirrors — the composition's whole claim is that what leaves the
 * gate is shippable copy, so placeholder glyph soup would break the premise.
 */

export type ScatterCard =
  | { kind: 'nav'; items: string[] }
  | { kind: 'line'; text: string }
  | { kind: 'field'; label: string; value: string }
  | { kind: 'button'; label: string }
  | { kind: 'toast'; label: string }
  | { kind: 'plan'; name: string; price: string }
  | { kind: 'quote'; name: string; role: string; quote: string };

export type ScatterItem = {
  id: string;
  /** Percent of the hero's width. */
  x: number;
  /** Percent of the hero's height. */
  y: number;
  /** Depth: scale, opacity and defocus all read off the same distance. */
  scale: number;
  opacity: number;
  blur: number;
  /** Vertical drift amplitude in px, and its period in seconds. */
  drift: number;
  dur: number;
  /** Locale stamp — only the translated half carries one. */
  locale?: string;
  /**
   * Desktop only. At 390px the wide composition has room for exactly one
   * mirrored pair beside the gate; everything else is dropped rather than
   * compressed into a cluttered strip.
   */
  wide?: boolean;
  /** Narrow-viewport placement. Without one the desktop placement is reused. */
  mobile?: { x: number; y: number; scale: number };
  card: ScatterCard;
};

const THEO_EN =
  '“Every once in awhile, I see a snippet of code that makes me a bit emotional. Now is one of those moments. Internationalization went from "$%!# this" to "trivial".”';

const THEO_JA =
  '「たまに、少し感動するようなコードに出会うことがあります。今がまさにその瞬間です。国際化が『$%!# this』から『trivial』に変わりました。」';

/**
 * Left half is the English source, right half is the same surface translated,
 * mirrored about the gate's axis (x and 100 - x) so the eye pairs them without
 * a single connecting line.
 *
 * PLACEMENT IS A CONTRAST DECISION, NOT JUST A COMPOSITIONAL ONE. The band's
 * light lives between roughly 24% and 48% down the frame and is at its most
 * violent out at the left and right lobes — light-grey type dropped there at
 * low alpha reads as dirt on the shader, not as a product surface. So the
 * frame is worked as three shelves:
 *
 *   15–19%   the quiet black under the nav — the far tier's upper shelf
 *   26–47%   inside the light — only the loudest surfaces, on its fringes
 *   52%      the quiet black under the light — the far tier's lower shelf
 *
 * Depth is therefore carried by SCALE first (0.82 far → 1.15 near) and by
 * position in the frame, with opacity floored at 0.58 and defocus kept under
 * 0.4px so every pair is actually readable. The composition's whole claim is
 * "English left, the same surface translated right"; hiding the evidence to
 * buy atmosphere loses the argument.
 */
export const SCATTER: ScatterItem[] = [
  /* ---- near field: full size, full contrast, right on the axis ---- */
  {
    id: 'greet-en',
    x: 24.5,
    y: 38,
    scale: 1.15,
    opacity: 0.96,
    blur: 0,
    drift: -7,
    dur: 16,
    /* the one pair that survives to 390px — sized and set so each half clears
       the 52px gate by a comfortable margin instead of crowding it */
    mobile: { x: 25.5, y: 43, scale: 0.62 },
    card: { kind: 'line', text: 'Welcome back!' },
  },
  {
    id: 'greet-tr',
    x: 75.5,
    y: 38,
    scale: 1.15,
    opacity: 0.96,
    blur: 0,
    drift: 7,
    dur: 17.5,
    locale: 'ES',
    mobile: { x: 74.5, y: 43, scale: 0.52 },
    card: { kind: 'line', text: '¡Bienvenido de nuevo!' },
  },

  /* ---- mid field: below the axis, on the light's lower fringe ---- */
  {
    id: 'btn-en',
    x: 37.5,
    y: 47,
    scale: 0.8,
    opacity: 0.66,
    blur: 0.2,
    drift: 8,
    dur: 18,
    wide: true,
    card: { kind: 'button', label: 'Sign in' },
  },
  {
    id: 'btn-tr',
    x: 62.5,
    y: 47,
    scale: 0.8,
    opacity: 0.66,
    blur: 0.2,
    drift: -9,
    dur: 20,
    locale: 'JA',
    wide: true,
    card: { kind: 'button', label: '始める' },
  },

  /* ---- mid field: above the axis, on the light's upper fringe ---- */
  {
    id: 'nav-en',
    x: 30,
    y: 26,
    scale: 0.88,
    opacity: 0.68,
    blur: 0.15,
    drift: 9,
    dur: 19,
    wide: true,
    card: { kind: 'nav', items: ['Home', 'Docs', 'Pricing'] },
  },
  {
    id: 'nav-tr',
    x: 70,
    y: 26,
    scale: 0.88,
    opacity: 0.68,
    blur: 0.15,
    drift: -8,
    dur: 21,
    locale: 'JA',
    wide: true,
    card: { kind: 'nav', items: ['ホーム', 'ドキュメント', '料金'] },
  },

  /* ---- far field, UPPER SHELF: the quiet black between the nav and the
     light. Small and wide-set, but on black they keep their hairlines ---- */
  {
    id: 'theo-en',
    x: 11.5,
    y: 15.5,
    scale: 0.82,
    opacity: 0.6,
    blur: 0.3,
    drift: 10,
    dur: 27,
    wide: true,
    card: { kind: 'quote', name: 'Theo', role: 'CEO, T3Chat', quote: THEO_EN },
  },
  {
    id: 'theo-tr',
    x: 88.5,
    y: 15.5,
    scale: 0.82,
    opacity: 0.6,
    blur: 0.3,
    drift: -11,
    dur: 29,
    locale: 'JA',
    wide: true,
    card: { kind: 'quote', name: 'Theo', role: 'T3Chat CEO', quote: THEO_JA },
  },
  {
    id: 'toast-en',
    x: 31,
    y: 19,
    scale: 0.86,
    opacity: 0.58,
    blur: 0.3,
    drift: -12,
    dur: 26,
    wide: true,
    card: { kind: 'toast', label: 'Payment received' },
  },
  {
    id: 'plan-tr',
    x: 69,
    y: 19,
    scale: 0.86,
    opacity: 0.58,
    blur: 0.3,
    drift: 12,
    dur: 25,
    locale: 'JA',
    wide: true,
    card: { kind: 'plan', name: 'PRO', price: '¥2,900/月' },
  },

  /* ---- far field, LOWER SHELF: the quiet black between the light's lower
     fringe and the headline, set wide so it frames the type ---- */
  {
    id: 'field-en',
    x: 12,
    y: 52,
    scale: 0.88,
    opacity: 0.68,
    blur: 0.2,
    drift: 11,
    dur: 24,
    wide: true,
    card: { kind: 'field', label: 'Email address', value: 'you@company.com' },
  },
  {
    id: 'field-tr',
    x: 88,
    y: 52,
    scale: 0.88,
    opacity: 0.68,
    blur: 0.2,
    drift: -10,
    dur: 22.5,
    locale: 'ES',
    wide: true,
    card: { kind: 'field', label: 'Correo electrónico', value: 'tu@empresa.com' },
  },
];

/**
 * Loose script particles inside the same corridor — atmosphere, not decoration.
 * They never climb into the quiet above the band or drop into the quiet below
 * it, so nothing ever sits behind the display type.
 *
 * `wide` drops a glyph below 900px. At 390px the gate's rim reaches to within
 * 24px of the axis and the one surviving mirrored pair sits at 43% — so every
 * particle that would land on the mark or crowd that pair is dropped, taking
 * the count from ten to four.
 */
export const GLYPHS: {
  g: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  wide?: boolean;
}[] = [
  { g: '語', x: 44, y: 27.5, size: 22, opacity: 0.2, wide: true },
  { g: 'Ж', x: 56, y: 27.5, size: 18, opacity: 0.16, wide: true },
  { g: 'ü', x: 41, y: 42.5, size: 16, opacity: 0.15, wide: true },
  { g: 'ع', x: 59, y: 42.5, size: 20, opacity: 0.16, wide: true },
  { g: '한', x: 46.5, y: 49, size: 17, opacity: 0.13 },
  { g: 'द', x: 53.5, y: 49, size: 16, opacity: 0.12 },
  { g: '中', x: 35.5, y: 32, size: 18, opacity: 0.12 },
  { g: 'é', x: 64.5, y: 32, size: 15, opacity: 0.11 },
  { g: 'ñ', x: 50, y: 29.5, size: 15, opacity: 0.13, wide: true },
  { g: 'ル', x: 50, y: 45.5, size: 16, opacity: 0.12, wide: true },
];

/** The lower-right counterweight to the headline block. */
export const HERO_STATS: { value: string; label: string }[] = [
  { value: '118', label: 'Locales' },
  { value: '<1s', label: 'OTA updates' },
  { value: '99.99%', label: 'Uptime' },
];

export const ROTATIONS = [
  'Portuguese',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese',
  'Korean',
  'Italian',
  'Hindi',
  'Arabic',
];

export const FLAGS: { flag: string; name: string }[] = [
  { flag: '🇪🇸', name: 'Español' },
  { flag: '🇫🇷', name: 'Français' },
  { flag: '🇯🇵', name: '日本語' },
  { flag: '🇩🇪', name: 'Deutsch' },
  { flag: '🇨🇳', name: '中文' },
  { flag: '🇰🇷', name: '한국어' },
  { flag: '🇧🇷', name: 'Português' },
  { flag: '🇮🇹', name: 'Italiano' },
  { flag: '🇮🇳', name: 'हिन्दी' },
  { flag: '🇸🇦', name: 'العربية' },
  { flag: '🇳🇱', name: 'Nederlands' },
  { flag: '🇵🇱', name: 'Polski' },
  { flag: '🇸🇪', name: 'Svenska' },
  { flag: '🇹🇷', name: 'Türkçe' },
  { flag: '🇻🇳', name: 'Tiếng Việt' },
  { flag: '🇮🇱', name: 'עברית' },
];

export const TRUSTED_BY = ['Cursor', 'Ramp', 'Mintlify', 'Profound', 'Partiful', 'ClickHouse'];

/** Closing headline rotations — the same promise in the languages it names. */
export const CLOSERS = [
  'EVERY LANGUAGE',
  'CADA IDIOMA',
  'CHAQUE LANGUE',
  'すべての言語',
  'JEDER SPRACHE',
  '모든 언어',
];
