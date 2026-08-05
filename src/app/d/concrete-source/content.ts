/**
 * Copy tables lifted verbatim from 02-concrete-mono.html. Nothing here is
 * rewritten — the repetitive lists live outside the JSX only so the section
 * components stay readable against the original markup.
 */

export type StreamItem = {
  /** Extra classes the original put on the .uicard. */
  card?: string;
  /** Hidden on mobile in the original (.s-item.m-hide). */
  mobileHide?: boolean;
  text?: string;
  /** <b>…</b> lead-in, as in "<b>PRO</b> — $20/mo · unlimited projects". */
  bold?: string;
  /** Theo's testimonial card. */
  theo?: string;
};

export const STREAM_LEFT: StreamItem[] = [
  { card: 'btn-card', text: 'Get started →' },
  { card: 'toast', text: 'Payment received' },
  { card: 'field', text: 'Email address' },
  { bold: 'PRO', text: ' — $20/mo · unlimited projects', mobileHide: true },
  { text: 'Home / Docs / Pricing', mobileHide: true },
  { text: 'Welcome back!' },
  {
    card: 'theo-card',
    theo: '“Every once in awhile, I see a snippet of code that makes me a bit emotional. Now is one of those moments. Internationalization went from "$%!# this" to "trivial".”',
  },
  { text: 'Sign in' },
];

export const STREAM_RIGHT: StreamItem[] = [
  { card: 'btn-card', text: '始める →' },
  { card: 'toast', text: 'Paiement reçu' },
  { card: 'field', text: 'Correo electrónico' },
  { bold: 'PRO', text: ' — ¥2,900/月 · プロジェクト無制限', mobileHide: true },
  { text: 'ホーム / ドキュメント / 料金', mobileHide: true },
  { text: '¡Bienvenido de nuevo!' },
  {
    card: 'theo-card',
    theo: '「国際化は "$%!# this" から "trivial" になった。コードを見て感動する瞬間が、いままさに訪れた。」',
  },
  { text: '로그인' },
];

export const GLYPHS = ['語', '界', 'ñ', 'ü', '한', 'ع', 'अ', '中', 'ß', 'é', 'ル', 'Ж'];

const FLAG_SET: readonly [flag: string, name: string][] = [
  ['es', 'Español'],
  ['fr', 'Français'],
  ['jp', '日本語'],
  ['de', 'Deutsch'],
  ['cn', '中文'],
  ['kr', '한국어'],
  ['br', 'Português'],
  ['it', 'Italiano'],
  ['in', 'हिन्दी'],
  ['sa', 'العربية'],
  ['nl', 'Nederlands'],
  ['pl', 'Polski'],
  ['se', 'Svenska'],
  ['tr', 'Türkçe'],
  ['vn', 'Tiếng Việt'],
  ['il', 'עברית'],
];

/** The marquee track is the set twice over — the loop tweens xPercent -50. */
export const FLAGS = [...FLAG_SET, ...FLAG_SET];

export const TRUSTED_BY = ['Cursor', 'Ramp', 'Mintlify', 'Profound', 'Partiful', 'ClickHouse'];

export const HERO_ROTATIONS = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese',
  'Portuguese',
  'Korean',
  'Italian',
  'Hindi',
  'Arabic',
];

export const CLOSING_ROTATIONS = [
  'EVERY LANGUAGE',
  'CADA IDIOMA',
  'CHAQUE LANGUE',
  'すべての言語',
  'JEDER SPRACHE',
  '모든 언어',
];

/** [progress, caption, index-label, ticks-lit] */
export type Beat = [number, string, string, number];

export const BEATS: Beat[] = [
  [0.0, 'gt helps you…', '00', 0],
  [0.08, '01 — GT KNOWS YOUR CONTEXT.', '01', 1],
  [0.2, '02 — GT DOES YOUR TRANSLATING.', '02', 2],
  [0.315, '03 — AROUND ANY COMPONENT.', '03', 3],
  [0.43, '04 — WITH YOUR OWN CONTEXT.', '04', 4],
  [0.545, '05 — WITH YOUR REVIEW.', '05', 5],
  [0.665, 'THIS IS WHERE LOCADEX COMES IN.', '06', 6],
  [0.775, '06 — PUSH → LOCADEX SCANS YOUR CODE.', '06', 6],
  [0.845, '07 — LOCADEX MAPS WHAT CHANGED · HOVER THE MARKS', '07', 7],
  [0.885, '08 — LOCADEX EDITS YOUR CODE.', '08', 8],
  [0.922, '09 — LOCADEX OPENS THE PR.', '09', 9],
  [0.96, '09 — MERGED → SHIPPED IN EVERY LANGUAGE.', '09', 10],
];

export const STATIC_BEATS: Array<[string, string]> = [
  ['01', "GT knows your context — every marked string on the page streams into GT's context core."],
  ['02', 'GT does your translating — flagged copy is translated in place, using that context.'],
  ['03', 'Around any component — wrap JSX in <T>…</T> and the rendered label ships translated.'],
  ['04', 'With your own context — <T context="Playful, upbeat marketing tone"> lands the right tone.'],
  ['05', 'With your review — "requires review" strings ping your lawyer for approval.'],
  ['06', 'This is where Locadex comes in — a push triggers the workflow; the agent scans the codebase.'],
  ['07', 'Locadex maps what changed and leaves numbered notes on the lines.'],
  ['08', 'Locadex edits code — internationalizes strings, then creates translations in context.'],
  ['09', 'Locadex opens the PR — reviewed, merged, and the site ships in every language.'],
];

export const FEATURES: Array<{ cat: string; title: string; body: string }> = [
  {
    cat: 'Libraries //',
    title: 'Code',
    body: 'Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users.',
  },
  {
    cat: 'Platform //',
    title: 'Context',
    body: 'Glossaries, locale rules, and custom prompts. Control tone, terminology, and regional nuance.',
  },
  {
    cat: 'AI //',
    title: 'Translation',
    body: 'AI agents that understand your project structure and localize your content in context.',
  },
  {
    cat: 'Middleware //',
    title: 'Routing',
    body: 'Automatic language detection and locale-based routing. SEO-friendly paths with zero configuration.',
  },
  {
    cat: 'Edge //',
    title: 'Delivery',
    body: 'A global, low-latency translation CDN. Push over-the-air updates without redeploying your app.',
  },
  {
    cat: 'Dashboard //',
    title: 'Previews',
    body: 'Preview translations in development before they go live. Catch issues early and ship with confidence.',
  },
  {
    cat: 'Runtime //',
    title: 'Live Translation',
    body: 'Translate user-generated content on demand, with low latency and full context.',
  },
  {
    cat: 'Config //',
    title: 'Customization',
    body: 'Build your own language detection functions, locale-specific components, and formatting logic.',
  },
];

export const STATS: Array<[string, string]> = [
  ['118', 'Languages'],
  ['1,000,000,000', 'Users to reach'],
  ['6', 'Frameworks'],
  ['$0', 'To start'],
];

export const FOOTER_COLUMNS: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: 'Guides',
    links: [
      ['#docs', 'Locadex Agent'],
      ['#docs', 'Next.js'],
      ['#docs', 'React'],
      ['#docs', 'React Native'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['#docs', 'Documentation'],
      ['#blog', 'Blog'],
      ['#pricing', 'Pricing'],
      ['#locales', 'Supported Locales'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['#careers', 'Careers'],
      ['#contact', 'Contact'],
      ['#github', 'GitHub'],
      ['#x', '𝕏'],
      ['#discord', 'Discord'],
      ['#linkedin', 'LinkedIn'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['#terms', 'Terms of Service'],
      ['#privacy', 'Privacy'],
      ['#aup', 'Acceptable Use'],
    ],
  },
];
