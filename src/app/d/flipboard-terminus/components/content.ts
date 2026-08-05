/**
 * Copy for the Flipboard Terminus direction.
 *
 * Every `tr` string is a real, human-checked translation of its `en` pair —
 * the hero's gravitational lens emits these verbatim, so glyph soup or
 * machine-mangled text would break the whole premise.
 */

export type Bilingual = { en: string; tr: string };

/**
 * Lane geometry for the hero gate.
 *
 * `row` is the horizontal track a component rides (0 = top). `phase` is where
 * it sits on that track at t=0, so the two lanes either side of the gate are
 * always populated in a still frame. `period` is one crossing, in seconds.
 */
export type LaneGeometry = { row: number; phase: number; period: number };

export type StreamSpec = LaneGeometry &
  (
    | { id: string; kind: 'button'; locale: string; label: Bilingual }
    | { id: string; kind: 'toast'; locale: string; label: Bilingual }
    | {
        id: string;
        kind: 'field';
        locale: string;
        label: Bilingual;
        placeholder: Bilingual;
      }
    | {
        id: string;
        kind: 'price';
        locale: string;
        plan: Bilingual;
        amount: Bilingual;
      }
    | { id: string; kind: 'nav'; locale: string; label: Bilingual }
    | { id: string; kind: 'copy'; locale: string; label: Bilingual }
    | {
        id: string;
        kind: 'theo';
        locale: string;
        quote: Bilingual;
        role: Bilingual;
      }
  );

/**
 * Rows in the gate band, top to bottom. Traffic only rides rows 0–2; the
 * bottom quarter is reserved for the two resident testimonial cards so the
 * storyboard's Theo card is on screen in every single frame rather than
 * whenever a 30-second lane happens to carry it past.
 */
export const LANE_ROWS = 4;

/** The component the phone gate shows above and below the dial. */
const PHONE_BUTTON: StreamSpec = {
  id: 'btn',
  kind: 'button',
  row: 1,
  phase: 0.1,
  period: 18.5,
  locale: 'DE',
  // German is the classic expansion case: the button has to widen for it.
  label: { en: 'Get started', tr: 'Jetzt loslegen' },
};

/*
 * Five components per lane, evenly phased, on one period per lane: constant
 * spacing means they never bunch or overlap, and a still frame always catches
 * roughly three of the five inside the viewport on each side of the dial.
 */
export const STREAM_ITEMS: StreamSpec[] = [
  // --- row 0 ---------------------------------------------------------------
  {
    id: 'nav-ko',
    kind: 'nav',
    row: 0,
    phase: 0,
    period: 15.5,
    locale: 'KO',
    label: { en: 'Docs · Pricing · Blog', tr: '문서 · 요금 · 블로그' },
  },
  {
    id: 'copy-ar',
    kind: 'copy',
    row: 0,
    phase: 0.2,
    period: 15.5,
    locale: 'AR',
    label: { en: 'Launch in every language', tr: 'أطلق بكل اللغات' },
  },
  {
    id: 'toast-nl',
    kind: 'toast',
    row: 0,
    phase: 0.4,
    period: 15.5,
    locale: 'NL',
    label: { en: 'Invite sent', tr: 'Uitnodiging verzonden' },
  },
  {
    id: 'nav-ja',
    kind: 'nav',
    row: 0,
    phase: 0.6,
    period: 15.5,
    locale: 'JA',
    label: { en: 'Home · Docs · Pricing', tr: 'ホーム · ドキュメント · 料金' },
  },
  {
    id: 'copy-tr',
    kind: 'copy',
    row: 0,
    phase: 0.8,
    period: 15.5,
    locale: 'TR',
    label: { en: 'Welcome back!', tr: 'Tekrar hoş geldiniz!' },
  },

  // --- row 1 ---------------------------------------------------------------
  PHONE_BUTTON,
  {
    id: 'toast-fr',
    kind: 'toast',
    row: 1,
    phase: 0.3,
    period: 18.5,
    locale: 'FR',
    label: { en: 'Payment received', tr: 'Paiement reçu' },
  },
  {
    id: 'field-es',
    kind: 'field',
    row: 1,
    phase: 0.5,
    period: 18.5,
    locale: 'ES',
    label: { en: 'Email address', tr: 'Correo electrónico' },
    placeholder: { en: 'you@company.com', tr: 'tu@empresa.com' },
  },
  {
    id: 'button-zh',
    kind: 'button',
    row: 1,
    phase: 0.7,
    period: 18.5,
    locale: 'ZH',
    label: { en: 'Continue', tr: '继续' },
  },
  {
    id: 'price-ja',
    kind: 'price',
    row: 1,
    phase: 0.9,
    period: 18.5,
    locale: 'JA',
    plan: { en: 'Starter', tr: 'スターター' },
    amount: { en: '$0/mo', tr: '¥0/月' },
  },

  // --- row 2 ---------------------------------------------------------------
  {
    id: 'copy-hi',
    kind: 'copy',
    row: 2,
    phase: 0.05,
    period: 16.5,
    locale: 'HI',
    label: { en: 'Ship to every market', tr: 'हर बाज़ार में लॉन्च करें' },
  },
  {
    id: 'field-ja',
    kind: 'field',
    row: 2,
    phase: 0.25,
    period: 16.5,
    locale: 'JA',
    label: { en: 'Full name', tr: 'お名前' },
    placeholder: { en: 'Jane Doe', tr: '山田 花子' },
  },
  {
    id: 'button-es',
    kind: 'button',
    row: 2,
    phase: 0.45,
    period: 16.5,
    locale: 'ES',
    label: { en: 'Create account', tr: 'Crear cuenta' },
  },
  {
    id: 'toast-pt',
    kind: 'toast',
    row: 2,
    phase: 0.65,
    period: 16.5,
    locale: 'PT',
    label: { en: 'Changes saved', tr: 'Alterações salvas' },
  },
  {
    id: 'price-de',
    kind: 'price',
    row: 2,
    phase: 0.85,
    period: 16.5,
    locale: 'DE',
    plan: { en: 'Pro', tr: 'Pro' },
    amount: { en: '$20/mo', tr: '20 $/Monat' },
  },
];

/**
 * The testimonial that never leaves the frame: the English card is parked on
 * the source side of the seam, its Spanish twin on the far side, so the whole
 * premise — English in, every other language out — reads in a static shot.
 */
export const TESTIMONIAL: StreamSpec = {
  id: 'theo',
  kind: 'theo',
  row: 3,
  phase: 0,
  period: 1,
  locale: 'ES',
  quote: {
    en: 'I see a snippet of code that makes me a bit emotional. Internationalization went from “$%!# this” to “trivial”.',
    tr: 'Veo un fragmento de código que me emociona un poco. La internacionalización pasó de «$%!# esto» a «trivial».',
  },
  role: { en: 'CEO, T3 Chat', tr: 'CEO, T3 Chat' },
};

/** The vertical gate shown instead of the lanes on a phone. */
export const PHONE_GATE = PHONE_BUTTON;

/** Scripts that orbit the hero dial. */
export const WHEEL_GLYPHS = '言ع한अ中ЖñßהกΔç語ییł조åΩदø文ü';

export const DEPARTURES: [flag: string, name: string][] = [
  ['es', 'ESPAÑOL'],
  ['fr', 'FRANÇAIS'],
  ['jp', '日本語'],
  ['de', 'DEUTSCH'],
  ['cn', '中文'],
  ['br', 'PORTUGUÊS'],
  ['kr', '한국어'],
  ['it', 'ITALIANO'],
  ['in', 'हिन्दी'],
  ['sa', 'العربية'],
  ['nl', 'NEDERLANDS'],
  ['se', 'SVENSKA'],
  ['pl', 'POLSKI'],
  ['tr', 'TÜRKÇE'],
  ['vn', 'TIẾNG VIỆT'],
  ['th', 'ไทย'],
  ['gr', 'ΕΛΛΗΝΙΚΆ'],
  ['il', 'עברית'],
  ['ua', 'УКРАЇНСЬКА'],
  ['id', 'INDONESIA'],
];

export const TRUSTED_BY = ['Cursor', 'Ramp', 'Mintlify', 'Profound', 'Partiful', 'ClickHouse'];

/** Dock captions for the shared story section — eleven, one per beat. */
export const DOCK_CAPTIONS = [
  'gt helps you…',
  'GT knows your context.',
  'GT does your translating.',
  'Around any component.',
  'With your own context.',
  'With your review.',
  'This is where Locadex comes in.',
  'Code is pushed. Locadex scans.',
  'Locadex maps what changed.',
  'It edits code — and translates in context.',
  '…and opens the PR. Review, merge, live.',
];

export const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Guides', links: ['Locadex Agent', 'Next.js', 'React', 'React Native'] },
  { title: 'Resources', links: ['Documentation', 'Blog', 'Pricing', 'Supported Locales'] },
  { title: 'Social', links: ['GitHub', '𝕏', 'Discord', 'LinkedIn'] },
  { title: 'Company', links: ['Careers', 'Contact', 'Terms', 'Privacy'] },
];
