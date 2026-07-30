/**
 * Static content for the Bento Foundry direction.
 *
 * Every non-English string here is a real translation of the English string it
 * sits beside — the hero gate and the story window both claim to *translate*,
 * so placeholder glyph soup would break the premise.
 */

export type StreamKind = 'button' | 'toast' | 'field' | 'nav' | 'price' | 'quote' | 'copy' | 'welcome';

export type StreamSide = {
  /**
   * Target locale, on the translated leg only. The English leg carries no tag:
   * a button labelled “Get started” is already a button, and naming it would be
   * an eyebrow on a component that speaks for itself.
   */
  tag?: string;
  text: string;
  sub?: string;
  rtl?: boolean;
};

export type StreamItem = {
  id: string;
  kind: StreamKind;
  /** Angle of this item's ray, in degrees off the horizon. Both legs share it. */
  angle: number;
  /** Phase offset into the shared cycle, 0–1. */
  phase: number;
  en: StreamSide;
  tr: StreamSide;
};

const THEO_EN =
  '“Every once in awhile, I see a snippet of code that makes me a bit emotional. Now is one of those moments. Internationalization went from "$%!# this" to "trivial".”';
const THEO_JA =
  '「たまに、少し感動するコードのスニペットに出会うことがある。今がまさにその瞬間だ。国際化が『最悪だ』から『簡単だ』に変わった。」';

export const STREAM_ITEMS: StreamItem[] = [
  {
    id: 'button',
    kind: 'button',
    angle: -21,
    phase: 0,
    /* Never the hero's own CTA copy: a floating card repeating “Get started”
       110px from the real button reads as a rendering fault, not a demo. */
    en: { text: 'Continue' },
    tr: { tag: 'ja — 日本語', text: '続ける' },
  },
  {
    id: 'toast',
    kind: 'toast',
    angle: 15,
    phase: 0.125,
    en: { text: 'Payment received' },
    tr: { tag: 'fr — français', text: 'Paiement reçu' },
  },
  {
    id: 'field',
    kind: 'field',
    angle: -7,
    phase: 0.25,
    en: { text: 'Email address' },
    tr: { tag: 'es — español', text: 'Correo electrónico' },
  },
  {
    id: 'nav',
    kind: 'nav',
    angle: 23,
    phase: 0.375,
    en: { text: 'Pricing · Docs · Blog' },
    tr: { tag: 'ko — 한국어', text: '요금제 · 문서 · 블로그' },
  },
  {
    id: 'price',
    kind: 'price',
    angle: -14,
    phase: 0.5,
    en: { text: 'Pro', sub: '$20 / month' },
    tr: { tag: 'de — Deutsch', text: 'Pro', sub: '20 € / Monat' },
  },
  {
    id: 'quote',
    kind: 'quote',
    angle: 6,
    phase: 0.625,
    en: { text: THEO_EN, sub: 'Theo — CEO, T3 Chat' },
    tr: { tag: 'ja — 日本語', text: THEO_JA, sub: 'Theo — CEO, T3 Chat' },
  },
  {
    id: 'copy',
    kind: 'copy',
    angle: 20,
    phase: 0.75,
    en: { text: 'Built for every market' },
    tr: { tag: 'zh — 中文', text: '为每一个市场而生' },
  },
  {
    id: 'welcome',
    kind: 'welcome',
    angle: -3,
    phase: 0.875,
    en: { text: 'Welcome back, Sarah' },
    tr: { tag: 'ar — العربية', text: 'مرحبًا بعودتك يا سارة', rtl: true },
  },
];

/** Scripts that orbit the machined dial in the hero. */
export const WHEEL_GLYPHS = '語한عñß日글مनé中กЖçあāΩרü文ᄀ';

export const FLAGS: [string, string][] = [
  ['🇪🇸', 'Español'], ['🇫🇷', 'Français'], ['🇯🇵', '日本語'], ['🇩🇪', 'Deutsch'],
  ['🇨🇳', '中文'], ['🇰🇷', '한국어'], ['🇧🇷', 'Português'], ['🇮🇹', 'Italiano'],
  ['🇮🇳', 'हिन्दी'], ['🇸🇦', 'العربية'], ['🇷🇺', 'Русский'], ['🇹🇷', 'Türkçe'],
  ['🇳🇱', 'Nederlands'], ['🇵🇱', 'Polski'], ['🇸🇪', 'Svenska'], ['🇻🇳', 'Tiếng Việt'],
  ['🇹🇭', 'ไทย'], ['🇮🇩', 'Bahasa'], ['🇮🇱', 'עברית'], ['🇬🇷', 'Ελληνικά'],
];

export const TRUSTED_BY = ['Cursor', 'Ramp', 'Mintlify', 'Profound', 'Partiful', 'ClickHouse'];

export const ROTATING_LANGUAGES = [
  'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Portuguese', 'Korean', 'Italian', 'Hindi', 'Arabic',
];

export const STAT_ROW: [string, string][] = [
  ['118', 'languages'],
  ['1,000,000,000', 'users reachable'],
  ['6', 'frameworks'],
  ['$0', 'to start'],
];

/** Dock captions for the shared story, one per beat. */
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
  'It edits code, then translates in context.',
  'It opens the PR. You review and merge.',
];
