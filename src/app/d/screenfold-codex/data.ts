/**
 * The codex's copy and figures. Every string here is reused from the shipped
 * landing files (HomeHero's headline roster, the TranslateWindow belt rows,
 * the review workspace rows, the dither-field rate ledger, the footer
 * columns) or is one of the figures the round allows. Nothing is invented.
 */

export const SITE = 'https://generaltranslation.com';
export const DOCS = `${SITE}/docs`;
export const SIGN_IN = 'https://dash.generaltranslation.com/en-US/signin';
export const DEMO = `${SITE}/enterprise/contact`;
export const LOCALES_URL = `${SITE}/locales`;

/** The claim, one shaped sentence per locale: production HomeHero's WORDS roster. */
export type ClaimWord = { text: string; lang: string; dir?: 'rtl' };

export const CLAIMS: readonly ClaimWord[] = [
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

/** One translated output per locale: the TranslateWindow belt's first row. */
export type Translation = { loc: string; text: string; file: string };

export const HELLO_SOURCE = 'Hello, world!';

export const HELLO_ROWS: readonly Translation[] = [
  { loc: 'es', text: '¡Hola, mundo!', file: 'public/_gt/es.json' },
  { loc: 'ja', text: 'こんにちは、世界！', file: 'public/_gt/ja.json' },
  { loc: 'de', text: 'Hallo, Welt!', file: 'public/_gt/de.json' },
  { loc: 'fr', text: 'Bonjour le monde !', file: 'public/_gt/fr.json' },
  { loc: 'zh', text: '你好，世界！', file: 'public/_gt/zh.json' },
];

/** The CLI run's locale roster: the dark band's five chips. */
export const CLI_LOCALES: readonly string[] = ['es', 'ja', 'de', 'fr', 'zh'];

/** The six customer marks from public/logos, in the shipped order. */
export type Customer = { name: string; file: string };

export const CUSTOMERS: readonly Customer[] = [
  { name: 'Cursor', file: 'cursor' },
  { name: 'Ramp', file: 'ramp' },
  { name: 'Mintlify', file: 'mintlify' },
  { name: 'Profound', file: 'profound' },
  { name: 'Partiful', file: 'partiful' },
  { name: 'ClickHouse', file: 'clickhouse' },
];

/** The review workspace's four rows. */
export type ReviewRow = {
  source: string;
  translation: string;
  previous?: string;
  state: 'approved' | 'edit';
};

export const REVIEW_ROWS: readonly ReviewRow[] = [
  { source: 'Hello, world!', translation: '¡Hola, mundo!', state: 'approved' },
  { source: 'Launch in every language', translation: 'Lanza en todos los idiomas', state: 'approved' },
  {
    source: "End-to-end localization for the world's best companies",
    previous: 'Localización de extremo a extremo para las mejores empresas del mundo.',
    translation: 'Localización integral para las mejores empresas del mundo.',
    state: 'edit',
  },
  {
    source: 'By continuing you agree to our Terms of Service.',
    translation: 'Al continuar, aceptas nuestros Términos de Servicio.',
    state: 'approved',
  },
];

/** The languages-as-material panel: sixteen scripts with a flag in the chip map. */
export const SCRIPT_CODES: readonly string[] = [
  'ja',
  'ko',
  'zh',
  'ar',
  'he',
  'hi',
  'th',
  'el',
  'ru',
  'de',
  'fr',
  'es',
  'pt',
  'tr',
  'pl',
  'nl',
];

export const RTL_CODES: ReadonlySet<string> = new Set(['ar', 'he', 'fa', 'ur']);

/** The variants ledger. */
export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANT_ROWS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

/**
 * The published rate ledger, verbatim. `count` is the figure the bar-and-dot
 * numeral beside the row prints: the whole-dollar figure where the rate is
 * whole, the cents figure where it is not (`unit` says which).
 */
export type Rate = {
  workflow: string;
  rate: string;
  gtLibs?: string;
  count: number;
  unit: '$' | '¢';
};

export const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20', count: 10, unit: '$' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens', count: 1, unit: '$' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4', count: 1, unit: '$' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens', count: 50, unit: '¢' },
  {
    workflow: 'Project context surcharge',
    rate: '+$0.10 / 10k tokens per 500 tokens of context',
    count: 10,
    unit: '¢',
  },
  { workflow: 'Locadex', rate: '$5 / LCU', count: 5, unit: '$' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits', count: 1, unit: '$' },
];

/** The footer's columns with their live destinations. */
export type FooterLink = { label: string; href: string; mark?: 'locadex' | 'next' | 'react' | 'github' | 'discord' };

export type FooterColumn = { title: string; links: readonly FooterLink[] };

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: DOCS, mark: 'locadex' },
      { label: 'Next.js', href: `${DOCS}/next`, mark: 'next' },
      { label: 'React', href: `${DOCS}/react`, mark: 'react' },
      { label: 'React Native', href: `${DOCS}/react-native`, mark: 'react' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: DOCS },
      { label: 'Blog', href: `${SITE}/blog` },
      { label: 'Pricing', href: `${SITE}/pricing` },
      { label: 'Supported Locales', href: LOCALES_URL },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers', href: `${SITE}/careers` },
      { label: 'Contact', href: `${SITE}/contact` },
      { label: 'GitHub', href: 'https://github.com/generaltranslation', mark: 'github' },
      { label: 'Discord', href: 'https://discord.gg/generaltranslation', mark: 'discord' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: `${SITE}/legal/terms` },
      { label: 'Privacy', href: `${SITE}/legal/privacy-policy` },
      { label: 'Acceptable Use', href: `${SITE}/legal/acceptable-use` },
      { label: 'Manage Cookies', href: '#top' },
    ],
  },
];
