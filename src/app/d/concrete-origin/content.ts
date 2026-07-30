/**
 * Static content for the Concrete Mono direction.
 *
 * Every translated string here is a real translation of the English string it
 * is paired with — the hero's whole claim is that what leaves the lens is
 * correct copy, so placeholder glyph soup would break the premise.
 */

export type RayCard =
  | { kind: 'button'; label: string }
  | { kind: 'toast'; label: string }
  | { kind: 'field'; label: string; value: string }
  | { kind: 'chip'; lead?: string; label: string }
  | { kind: 'testimonial'; name: string; role: string; quote: string };

export type RayPair = {
  id: string;
  /** Degrees off the horizontal axis. Negative rides the upper fan. */
  angle: number;
  /** Where in the shared in-and-out cycle this pair starts, 0–1. */
  phase: number;
  /** Seconds for one full cycle: fall in on the left, emit on the right. */
  duration: number;
  /** Locale badge stamped on the emitted card. */
  locale: string;
  en: RayCard;
  tr: RayCard;
};

export const RAY_PAIRS: RayPair[] = [
  {
    id: 'cta',
    angle: -19,
    phase: 0,
    duration: 15,
    locale: 'JA',
    en: { kind: 'button', label: 'Get started →' },
    tr: { kind: 'button', label: '始める →' },
  },
  {
    id: 'toast',
    angle: 9,
    phase: 0.14,
    duration: 16.5,
    locale: 'FR',
    en: { kind: 'toast', label: 'Payment received' },
    tr: { kind: 'toast', label: 'Paiement reçu' },
  },
  {
    id: 'field',
    angle: -6,
    phase: 0.29,
    duration: 17.5,
    locale: 'ES',
    en: { kind: 'field', label: 'Email address', value: 'you@company.com' },
    tr: { kind: 'field', label: 'Correo electrónico', value: 'tu@empresa.com' },
  },
  {
    id: 'plan',
    angle: 21,
    phase: 0.43,
    duration: 18,
    locale: 'DE',
    en: { kind: 'chip', lead: 'PRO', label: '$20/mo · unlimited projects' },
    tr: { kind: 'chip', lead: 'PRO', label: '20 $/Monat · unbegrenzte Projekte' },
  },
  {
    id: 'nav',
    angle: -27,
    phase: 0.57,
    duration: 16,
    locale: 'KO',
    en: { kind: 'chip', label: 'Home / Docs / Pricing' },
    tr: { kind: 'chip', label: '홈 / 문서 / 요금제' },
  },
  {
    id: 'greeting',
    angle: 27,
    phase: 0.71,
    duration: 15.5,
    locale: 'AR',
    en: { kind: 'chip', label: 'Welcome back!' },
    tr: { kind: 'chip', label: '!مرحبًا بعودتك' },
  },
  {
    id: 'theo',
    angle: 2,
    phase: 0.855,
    duration: 19,
    locale: 'JA',
    en: {
      kind: 'testimonial',
      name: 'Theo',
      role: 'CEO, T3Chat',
      quote:
        '“Every once in awhile, I see a snippet of code that makes me a bit emotional. Now is one of those moments. Internationalization went from "$%!# this" to "trivial".”',
    },
    tr: {
      kind: 'testimonial',
      name: 'Theo',
      role: 'T3Chat CEO',
      quote:
        '「たまに、少し感動するようなコードに出会うことがあります。今がまさにその瞬間です。国際化が『$%!# this』から『trivial』に変わりました。」',
    },
  },
];

/** Glyphs pulled inward around the lens rim — the accretion disc. */
export const ACCRETION_GLYPHS = [
  '語', '界', 'ñ', 'ü', '한', 'ع', 'अ', '中',
  'ß', 'é', 'ル', 'Ж', 'ą', '문', 'ص', 'द',
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

export const STATS: { value: string; label: string }[] = [
  { value: '118', label: 'Languages' },
  { value: '1,000,000,000', label: 'Users to reach' },
  { value: '6', label: 'Frameworks' },
  { value: '$0', label: 'To start' },
];

export const FEATURES: { cat: string; title: string; body: string }[] = [
  {
    cat: 'Libraries',
    title: 'Code',
    body: 'Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users.',
  },
  {
    cat: 'Platform',
    title: 'Context',
    body: 'Glossaries, locale rules, and custom prompts. Control tone, terminology, and regional nuance.',
  },
  {
    cat: 'AI',
    title: 'Translation',
    body: 'AI agents that understand your project structure and localize your content in context.',
  },
  {
    cat: 'Middleware',
    title: 'Routing',
    body: 'Automatic language detection and locale-based routing. SEO-friendly paths with zero configuration.',
  },
  {
    cat: 'Edge',
    title: 'Delivery',
    body: 'A global, low-latency translation CDN. Push over-the-air updates without redeploying your app.',
  },
  {
    cat: 'Dashboard',
    title: 'Previews',
    body: 'Preview translations in development before they go live. Catch issues early and ship with confidence.',
  },
  {
    cat: 'Runtime',
    title: 'Live Translation',
    body: 'Translate user-generated content on demand, with low latency and full context.',
  },
  {
    cat: 'Config',
    title: 'Customization',
    body: 'Build your own language detection functions, locale-specific components, and formatting logic.',
  },
];

/**
 * Scrub bands for the pinned story. Each entry is [progress, caption, index,
 * lit ticks]; bands are wide enough that a frame grabbed at any 10% depth lands
 * on one held, unambiguous scene rather than between two.
 */
export const STORY_BEATS: [number, string, string, number][] = [
  [0.0, 'gt helps you…', '00', 0],
  [0.05, '01 — GT KNOWS YOUR CONTEXT.', '01', 1],
  [0.17, '02 — GT DOES YOUR TRANSLATING.', '02', 2],
  [0.29, '03 — AROUND ANY COMPONENT.', '03', 3],
  [0.41, '04 — WITH YOUR OWN CONTEXT.', '04', 4],
  [0.53, '05 — WITH YOUR REVIEW.', '05', 5],
  [0.615, 'THIS IS WHERE LOCADEX COMES IN.', '06', 6],
  [0.648, '06 — PUSH → LOCADEX SCANS YOUR CODE.', '06', 6],
  [0.724, '07 — LOCADEX MAPS WHAT CHANGED · HOVER THE MARKS', '07', 7],
  [0.77, '08 — LOCADEX EDITS YOUR CODE.', '08', 8],
  [0.855, '09 — LOCADEX OPENS THE PR.', '09', 9],
  [0.955, '09 — MERGED → SHIPPED IN EVERY LANGUAGE.', '09', 10],
];

export const STATIC_BEATS: string[] = [
  '01 — GT knows your context: every marked string on the page streams into GT’s context core.',
  '02 — GT does your translating: flagged copy is translated in place, using that context.',
  '03 — Around any component: wrap JSX in <T>…</T> and the rendered label ships translated.',
  '04 — With your own context: <T context="Playful, upbeat marketing tone"> lands the right tone.',
  '05 — With your review: “requires review” strings ping your lawyer for approval.',
  '06 — This is where Locadex comes in: a push triggers the workflow; the agent scans the codebase.',
  '07 — Locadex maps what changed and leaves numbered notes on the lines.',
  '08 — Locadex edits code: internationalizes strings, then creates translations in context.',
  '09 — Locadex opens the PR: reviewed, merged, and the site ships in every language.',
];
