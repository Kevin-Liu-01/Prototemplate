/**
 * raking-relief content. Every string here is real: the claim roster is the
 * shipped hero's sixteen locales of "Scale to every language", the greetings
 * are the "Hello, world!" sample in eight languages (es, fr, de, ja and zh
 * are the shipped translation window's outputs; ko, ar and hi are the same
 * sentence in those languages, with their lang and dir), the rates are the
 * published ledger, the customer names are the six on the shipped trust
 * strip, and the footer links are the live site's destinations. The locale
 * rosettes read their native names from the generated locale table so
 * nothing is retyped.
 */

import { SUPPORTED_LOCALES } from '@/app/d/production/sections/locales-data';

export type Claim = { text: string; lang: string; dir?: 'rtl' };

/** The hero claim in sixteen locales, in the shipped order. */
export const CLAIMS: readonly Claim[] = [
  { text: 'Scale to every language', lang: 'en' },
  { text: 'Crece en todos los idiomas', lang: 'es' },
  { text: 'あらゆる言語に展開', lang: 'ja' },
  { text: 'In jeder Sprache wachsen', lang: 'de' },
  { text: '모든 언어로 확장하세요', lang: 'ko' },
  { text: 'Passez au multilingue, sans limite', lang: 'fr' },
  { text: '让产品说每一种语言', lang: 'zh' },
  { text: 'Cresça em todos os idiomas', lang: 'pt' },
  { text: 'Развивайте продукт на всех языках', lang: 'ru' },
  { text: 'Cresci in ogni lingua', lang: 'it' },
  { text: 'हर भाषा में आगे बढ़ें', lang: 'hi' },
  { text: 'Groei in elke taal', lang: 'nl' },
  { text: 'Her dile açılın', lang: 'tr' },
  { text: 'Väx på alla språk', lang: 'sv' },
  { text: 'Tumbuh dalam setiap bahasa', lang: 'id' },
  { text: 'Rośnij w każdym języku', lang: 'pl' },
];

export const LINKS = {
  top: '#top',
  docs: 'https://generaltranslation.com/docs',
  pricing: 'https://generaltranslation.com/pricing',
  blog: 'https://generaltranslation.com/blog',
  enterprise: 'https://generaltranslation.com/enterprise',
  careers: 'https://generaltranslation.com/careers',
  contact: 'https://generaltranslation.com/contact',
  locales: 'https://generaltranslation.com/locales',
  locadex: 'https://generaltranslation.com/locadex',
  signIn: 'https://dash.generaltranslation.com/en-US/signin',
  getStarted: 'https://dash.generaltranslation.com/en-US/signin',
  demo: 'https://generaltranslation.com/enterprise/contact',
  github: 'https://github.com/generaltranslation',
  discord: 'https://discord.gg/generaltranslation',
  terms: 'https://generaltranslation.com/legal/terms',
  privacy: 'https://generaltranslation.com/legal/privacy-policy',
  acceptableUse: 'https://generaltranslation.com/legal/acceptable-use',
  docsNext: 'https://generaltranslation.com/docs/next',
  docsReact: 'https://generaltranslation.com/docs/react',
  docsReactNative: 'https://generaltranslation.com/docs/react-native',
  docsLocadex: 'https://generaltranslation.com/docs/locadex',
} as const;

export const INSTALL_COMMAND = 'npx gt@latest';

export type Greeting = { code: string; lang: string; text: string; dir?: 'rtl' };

/** The T component's proof: one source string, its shipped translations. */
export const HELLO_SOURCE = 'Hello, world!';

export const HELLO: readonly Greeting[] = [
  { code: 'es', lang: 'es', text: '¡Hola, mundo!' },
  { code: 'fr', lang: 'fr', text: 'Bonjour le monde !' },
  { code: 'de', lang: 'de', text: 'Hallo, Welt!' },
  { code: 'ja', lang: 'ja', text: 'こんにちは世界！' },
  { code: 'zh', lang: 'zh', text: '你好，世界！' },
  { code: 'ko', lang: 'ko', text: '안녕, 세계!' },
  { code: 'ar', lang: 'ar', text: 'مرحبا بالعالم!', dir: 'rtl' },
  { code: 'hi', lang: 'hi', text: 'नमस्ते, दुनिया!' },
];

export type Output = { cap: string; value: string; code: string };

/** One real product output per capability, with the locale that produced it. */
export const OUTPUTS: readonly Output[] = [
  { cap: 'Numbers', value: '1.234.567,89', code: 'de' },
  { cap: 'Currencies', value: '1.280,00 €', code: 'de' },
  { cap: 'Dates', value: '29 juil. 2026', code: 'fr' },
  { cap: 'Plurals', value: '1 plik · 4 pliki', code: 'pl' },
  { cap: 'Routing', value: '/fr/a-propos', code: 'fr' },
];

export const CUSTOMERS: readonly { name: string; file: string }[] = [
  { name: 'Cursor', file: 'cursor' },
  { name: 'Ramp', file: 'ramp' },
  { name: 'Mintlify', file: 'mintlify' },
  { name: 'Profound', file: 'profound' },
  { name: 'Partiful', file: 'partiful' },
  { name: 'ClickHouse', file: 'clickhouse' },
];

export const TRUST_LEAD = 'Cursor, Ramp and Profound ship in over thirty languages';

export type Stat = { value: string; label: string };

export const STATS: readonly Stat[] = [
  { value: '118', label: 'locales ready today' },
  { value: '6', label: 'first-party SDKs' },
  { value: '<1s', label: 'over-the-air updates' },
  { value: '$0', label: 'to start' },
];

/** The CLI run and the five locales it wrote. */
export const CLI_RUN = {
  command: 'npx gt translate',
  result: '128 strings · 3 new · 2 changed',
  locales: ['es', 'fr', 'ja', 'de', 'zh'],
} as const;

export type ReviewRow = {
  key: string;
  source: string;
  previous?: string;
  translation: string;
  state: 'approved' | 'edit';
};

/** The review workspace's four rows, as shipped. */
export const REVIEW_ROWS: readonly ReviewRow[] = [
  { key: 'hello', source: 'Hello, world!', translation: '¡Hola, mundo!', state: 'approved' },
  {
    key: 'hero',
    source: 'Launch in every language',
    translation: 'Lanza en todos los idiomas',
    state: 'approved',
  },
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

/** What Locadex found on the changed file, and what it did about it. */
export const LOCADEX_FINDINGS: readonly string[] = [
  'Copy that was never wrapped',
  'A date formatted by hand',
  'A label with no locale build',
];

export const LOCADEX_DIFF = '+ <T> · + <DateTime> · − toLocaleDateString()';

/** The agent's trace, one line per step, from the shipped story. */
export const LOCADEX_TRACE: readonly string[] = [
  'push → workflow · locadex scans app/page.tsx',
  'unwrapped copy · hand-rolled date · unbuilt label',
  '+ <T> · + <DateTime> · − toLocaleDateString()',
  'PR #218 · 6 locales · merged',
];

/** The locales carved into the rosette band, one rosette each. */
const ROSETTE_CODES: readonly string[] = [
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'nl',
  'pl',
  'tr',
  'sv',
  'ru',
  'uk',
  'el',
  'he',
  'ar',
  'fa',
  'hi',
  'bn',
  'ta',
  'th',
  'vi',
  'id',
  'ja',
  'ko',
  'zh-Hans',
  'zh-Hant',
  'am',
  'ka',
];

const RTL = new Set(['ar', 'he', 'fa', 'ur']);

export type Rosette = { code: string; lang: string; name: string; dir: 'ltr' | 'rtl' };

export const ROSETTES: readonly Rosette[] = ROSETTE_CODES.flatMap((code) => {
  const row = SUPPORTED_LOCALES.find((entry) => entry.code === code);
  if (!row) return [];
  return [
    {
      code,
      lang: code,
      name: row.nativeName,
      dir: RTL.has(row.languageCode) ? 'rtl' : 'ltr',
    },
  ];
});

export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANT_ROWS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export const LOCALE_COUNT_LINE = '78 base languages, 129 distinct locale tags.';

export type Rate = { workflow: string; rate: string; gtLibs?: string };

/** The published rate ledger. These are the only rates that may appear. */
export const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens' },
  { workflow: 'Project context surcharge', rate: '+$0.10 / 10k tokens per 500 tokens of context' },
  { workflow: 'Locadex', rate: '$5 / LCU' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits' },
];

export const RATE_NOTES: readonly string[] = [
  'A Usage Limit is a hard cap. It blocks billing even with auto-reload on.',
];

export const DRY_RUN_COMMAND = 'npx gt translate --dry-run';
export const DRY_RUN_NOTE = 'prints what would be translated and bills 0 tokens.';

export type FooterLink = { label: string; href: string; mark?: 'locadex' | 'next' | 'react' | 'github' | 'discord' };

export const FOOTER_COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: LINKS.docsLocadex, mark: 'locadex' },
      { label: 'Next.js', href: LINKS.docsNext, mark: 'next' },
      { label: 'React', href: LINKS.docsReact, mark: 'react' },
      { label: 'React Native', href: LINKS.docsReactNative, mark: 'react' },
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
      { label: 'GitHub', href: LINKS.github, mark: 'github' },
      { label: 'Discord', href: LINKS.discord, mark: 'discord' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: LINKS.terms },
      { label: 'Privacy', href: LINKS.privacy },
      { label: 'Acceptable Use', href: LINKS.acceptableUse },
      { label: 'Manage Cookies', href: '#' },
    ],
  },
];

export const FOOTER_SENTENCE = 'End-to-end localization for the world’s best companies.';
export const COPYRIGHT = '© 2026 General Translation, Inc. All rights reserved.';
export const COMPLIANCE = 'SOC 2 Type II · GDPR · ISO 27001';
