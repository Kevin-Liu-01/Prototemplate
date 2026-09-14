/**
 * brick-lattice · the page's copy and figures, as data.
 *
 * Every string here is shipped copy or a published figure, transcribed
 * from the charter's data sources so the section files carry no prose of
 * their own that a reviewer cannot trace:
 *
 * - RATES and the two footnotes: the rate ledger in
 *   src/app/d/dither-field/sections/Pricing.tsx (charter A10, the only
 *   rates that may appear anywhere).
 * - WORDS: the sixteen-locale headline roster in
 *   src/app/d/production/sections/HomeHero.tsx.
 * - CUSTOMERS: the six wordmarks in src/app/d/dither-field/sections/Hero.tsx.
 * - REVIEW_ROWS and the bar text: src/app/d/dither-field/sections/ReviewWorkspace.tsx.
 * - VARIANT_ROWS and the count line: src/app/d/dither-field/sections/Locales.tsx.
 * - FOOTER_COLUMNS: src/app/d/dither-field/sections/SiteFooter.tsx, with
 *   the destinations resolved to the shipped site's routes.
 * - Story figures (128 strings, 6 locales, 640 translations, PR #218):
 *   src/app/d/dither-field/sections/story/beats.ts.
 */

export type Rate = { workflow: string; rate: string; gtLibs?: string };

export const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens' },
  { workflow: 'Project context surcharge', rate: '+$0.10 / 10k tokens per 500 tokens of context' },
  { workflow: 'Locadex', rate: '$5 / LCU' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits' },
];

export const RATE_NOTES = {
  limit: 'A Usage Limit is a hard cap. It blocks billing even with auto-reload on.',
  dryRun: 'prints what would be translated and bills 0 tokens.',
} as const;

/** One shaped headline per locale: the text node swaps whole, with its tag. */
export type Word = { code: string; text: string; lang: string; dir: 'ltr' | 'rtl' };

export const WORDS: readonly Word[] = [
  { code: 'en', text: 'Scale to every language', lang: 'en', dir: 'ltr' },
  { code: 'es', text: 'Crece en todos los idiomas', lang: 'es', dir: 'ltr' },
  { code: 'ja', text: 'あらゆる言語に展開', lang: 'ja', dir: 'ltr' },
  { code: 'de', text: 'In jeder Sprache wachsen', lang: 'de', dir: 'ltr' },
  { code: 'ko', text: '모든 언어로 확장하세요', lang: 'ko', dir: 'ltr' },
  { code: 'fr', text: 'Passez au multilingue, sans limite', lang: 'fr', dir: 'ltr' },
  { code: 'zh', text: '让产品说每一种语言', lang: 'zh', dir: 'ltr' },
  { code: 'pt', text: 'Cresça em todos os idiomas', lang: 'pt', dir: 'ltr' },
  { code: 'ru', text: 'Развивайте продукт на всех языках', lang: 'ru', dir: 'ltr' },
  { code: 'it', text: 'Cresci in ogni lingua', lang: 'it', dir: 'ltr' },
  { code: 'hi', text: 'हर भाषा में आगे बढ़ें', lang: 'hi', dir: 'ltr' },
  { code: 'nl', text: 'Groei in elke taal', lang: 'nl', dir: 'ltr' },
  { code: 'tr', text: 'Her dile açılın', lang: 'tr', dir: 'ltr' },
  { code: 'sv', text: 'Väx på alla språk', lang: 'sv', dir: 'ltr' },
  { code: 'id', text: 'Tumbuh dalam setiap bahasa', lang: 'id', dir: 'ltr' },
  { code: 'pl', text: 'Rośnij w każdym języku', lang: 'pl', dir: 'ltr' },
];

export const SOURCE_WORD: Word = WORDS[0]!;

/** The roster the wall lights, keyed by locale code, in WORDS order. */
export function wordFor(code: string): Word {
  return WORDS.find((w) => w.code === code) ?? SOURCE_WORD;
}

export type Customer = { name: string; mark: string; href: string; viewBox: readonly [number, number] };

/** Six wordmarks; the artwork is public/logos/<mark>.light.svg, used as an alpha mask. */
export const CUSTOMERS: readonly Customer[] = [
  { name: 'Cursor', mark: 'cursor', href: 'https://cursor.com', viewBox: [739, 186] },
  { name: 'Ramp', mark: 'ramp', href: 'https://ramp.com', viewBox: [643.93, 170.94] },
  { name: 'Mintlify', mark: 'mintlify', href: 'https://mintlify.com', viewBox: [2191, 484] },
  { name: 'Profound', mark: 'profound', href: 'https://tryprofound.com', viewBox: [166, 28] },
  { name: 'Partiful', mark: 'partiful', href: 'https://partiful.com', viewBox: [204, 46] },
  { name: 'ClickHouse', mark: 'clickhouse', href: 'https://clickhouse.com', viewBox: [649.3, 198.3] },
];

export type ReviewRow = {
  key: string;
  source: string;
  translation: string;
  previous?: string;
  state: 'approved' | 'edit';
};

export const REVIEW_ROWS: readonly ReviewRow[] = [
  { key: 'hello', source: 'Hello, world!', translation: '¡Hola, mundo!', state: 'approved' },
  { key: 'hero', source: 'Launch in every language', translation: 'Lanza en todos los idiomas', state: 'approved' },
  {
    key: 'meta',
    source: "End-to-end localization for the world's best companies",
    previous: 'Localización de extremo a extremo para las mejores empresas del mundo.',
    translation: 'Localización integral para las mejores empresas del mundo.',
    state: 'edit',
  },
  {
    key: 'terms',
    source: 'By continuing you agree to our Terms of Service.',
    translation: 'Al continuar, aceptas nuestros Términos de Servicio.',
    state: 'approved',
  },
];

export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANT_ROWS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export const LOCALE_COUNT_LINE = '78 base languages, 129 distinct locale tags.';

/** The sixteen medallions of the languages band, in reading order. */
export const BAND_LOCALES: readonly string[] = [
  'es',
  'fr',
  'de',
  'it',
  'pl',
  'ru',
  'el',
  'tr',
  'ar',
  'he',
  'hi',
  'th',
  'ja',
  'ko',
  'zh-Hans',
  'zh-Hant',
];

/** Right-to-left scripts in the band; everything else is ltr. */
export const RTL_LOCALES: ReadonlySet<string> = new Set(['ar', 'he', 'fa', 'ur']);

export const SITE = 'https://generaltranslation.com';

export const LINKS = {
  docs: `${SITE}/docs`,
  pricing: `${SITE}/pricing`,
  blog: `${SITE}/blog`,
  enterprise: `${SITE}/enterprise`,
  demo: `${SITE}/enterprise/contact`,
  contact: `${SITE}/contact`,
  careers: `${SITE}/careers`,
  locales: `${SITE}/supported-locales`,
  signIn: 'https://dash.generaltranslation.com/en-US/signin',
  getStarted: 'https://dash.generaltranslation.com/en-US/signin',
  github: 'https://github.com/generaltranslation',
  discord: `${SITE}/discord`,
  terms: `${SITE}/legal/terms`,
  privacy: `${SITE}/legal/privacy-policy`,
  legal: `${SITE}/legal`,
} as const;

export type FooterLink = { label: string; href: string };

export const FOOTER_COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: LINKS.docs },
      { label: 'Next.js', href: `${SITE}/docs/next` },
      { label: 'React', href: `${SITE}/docs/react` },
      { label: 'React Native', href: `${SITE}/docs/react-native` },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: LINKS.docs },
      { label: 'Blog', href: LINKS.blog },
      { label: 'Pricing', href: LINKS.pricing },
      { label: 'Supported Locales', href: LINKS.locales },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers', href: LINKS.careers },
      { label: 'Contact', href: LINKS.contact },
      { label: 'GitHub', href: LINKS.github },
      { label: 'Discord', href: LINKS.discord },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: LINKS.terms },
      { label: 'Privacy', href: LINKS.privacy },
      { label: 'Acceptable Use', href: LINKS.legal },
    ],
  },
];

/** The CLI session in the kiln: the story's figures, nothing invented. */
export const CLI_LOCALES: readonly string[] = ['es', 'fr', 'ja', 'de', 'zh', 'ko'];
