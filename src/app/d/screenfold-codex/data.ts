import type { Motif } from './components/GlyphBlock';

/**
 * The codex's copy and figures. Every string here is reused from the shipped
 * landing files (HomeHero's headline roster, the TranslateWindow belt rows,
 * the review workspace rows, the dither-field rate ledger, the compare grid's
 * feature names, the footer columns) or is one of the figures the round
 * allows. Nothing is invented.
 */

export const SITE = 'https://generaltranslation.com';
export const DOCS = `${SITE}/docs`;
export const SIGN_IN = 'https://dash.generaltranslation.com/en-US/signin';
export const DEMO = `${SITE}/enterprise/contact`;
export const LOCALES_URL = `${SITE}/locales`;
/** The published usage-rates page, where the compare grid's rate cells and the compare link point. */
export const USAGE_RATES_URL = `${SITE}/pricing/usage`;

/* ------------------------------------------------------------------ *
 * The leaves and the signs
 * ------------------------------------------------------------------ */

/** One leaf of the strip: its folio, its anchor, its sign, and which way it leans. */
export type Leaf = { n: number; id: string; label: string; sign: Motif; fold: 'a' | 'b' };

export const LEAVES: readonly Leaf[] = [
  { n: 1, id: 'hero', label: 'The claim', sign: 'rosette', fold: 'a' },
  { n: 2, id: 'proof', label: 'The T component', sign: 'bond', fold: 'b' },
  { n: 3, id: 'surfaces', label: 'The surfaces', sign: 'key', fold: 'a' },
  { n: 4, id: 'languages', label: 'The languages', sign: 'lozenge', fold: 'b' },
  { n: 5, id: 'review', label: 'The review', sign: 'cross', fold: 'a' },
  { n: 6, id: 'story', label: 'The story', sign: 'step', fold: 'b' },
  { n: 7, id: 'pricing', label: 'The rates', sign: 'disk', fold: 'a' },
  { n: 8, id: 'starter', label: 'Starter', sign: 'rings', fold: 'b' },
  { n: 9, id: 'enterprise', label: 'Enterprise', sign: 'quad', fold: 'a' },
  { n: 10, id: 'compare', label: 'The comparison', sign: 'pylon', fold: 'b' },
];

export function leaf(id: string): Leaf {
  return LEAVES.find((l) => l.id === id) ?? { n: 0, id, label: id, sign: 'fret', fold: 'a' };
}

/** The sign vocabulary: one geometric sign per product concept, read the same everywhere it prints. */
export type Sign = { motif: Motif; label: string; note: string };

export const SIGNS: readonly Sign[] = [
  { motif: 'bond', label: 'Strings', note: 'The running bond is the ledger of text a page carries.' },
  { motif: 'fret', label: 'Build', note: 'The stepped fret is the build run that writes each locale.' },
  { motif: 'rings', label: 'Runtime', note: 'Concentric rings are the request and its response.' },
  { motif: 'key', label: 'CLI', note: 'The meander is the command line.' },
  { motif: 'pylon', label: 'Dashboard', note: 'The battered wall is the workspace.' },
  { motif: 'cross', label: 'Review', note: 'Crossed diagonals mark a string held for review.' },
  { motif: 'lozenge', label: 'Locale', note: 'The lozenge is one locale tag.' },
  { motif: 'rosette', label: 'Languages', note: 'The radial repeat is the full roster.' },
  { motif: 'chevron', label: 'Routing', note: 'Chevrons are the locale path.' },
  { motif: 'step', label: 'Edge', note: 'The stepped pyramid is delivery from the edge.' },
  { motif: 'quad', label: 'Context', note: 'The quartered field is shared context.' },
  { motif: 'disk', label: 'Tokens', note: 'The disk and its bars are the metered unit.' },
];

/* ------------------------------------------------------------------ *
 * The claim and the proof
 * ------------------------------------------------------------------ */

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

/** The two source strings the TranslateWindow belt carries, and their outputs per locale. */
export const HELLO_SOURCE = 'Hello, world!';
export const START_SOURCE = 'Get started';

export type ProofRow = { loc: string; hello: string; start: string; file: string };

export const PROOF_ROWS: readonly ProofRow[] = [
  { loc: 'es', hello: '¡Hola, mundo!', start: 'Comenzar ahora', file: 'public/_gt/es.json' },
  { loc: 'ja', hello: 'こんにちは、世界！', start: '始める', file: 'public/_gt/ja.json' },
  { loc: 'de', hello: 'Hallo, Welt!', start: 'Jetzt starten', file: 'public/_gt/de.json' },
  { loc: 'fr', hello: 'Bonjour le monde !', start: 'Commencer', file: 'public/_gt/fr.json' },
  { loc: 'zh', hello: '你好，世界！', start: '立即开始', file: 'public/_gt/zh.json' },
];

/** The other components, each with one shipped output (stacks.ts, CAP_DEMOS) and the locale that formats it. */
export type ComponentProof = { api: string; output: string; loc: string; what: string };

export const COMPONENT_PROOF: readonly ComponentProof[] = [
  { api: '<Num>', output: '1.234.567,89', loc: 'de', what: 'Numbers' },
  { api: '<Currency>', output: '1.280,00 €', loc: 'de', what: 'Currencies' },
  { api: '<DateTime>', output: '29 juil. 2026', loc: 'fr', what: 'Dates' },
  { api: '<Plural>', output: '1 plik · 4 pliki', loc: 'pl', what: 'Plurals' },
  { api: 'useGT() · getGT()', output: '¡Hola, mundo!', loc: 'es', what: 'Strings' },
  { api: 'initializeGT()', output: '/fr/a-propos', loc: 'fr', what: 'Routing' },
];

/** The CLI run's locale roster: the dark band's five chips. */
export const CLI_LOCALES: readonly string[] = ['es', 'ja', 'de', 'fr', 'zh'];

/* ------------------------------------------------------------------ *
 * The surfaces
 * ------------------------------------------------------------------ */

/** The dashboard's context cascade: three setbacks, each listing the real objects that live at that level. */
export type CascadeLevel = { name: string; items: readonly string[] };

export const CASCADE: readonly CascadeLevel[] = [
  { name: 'Organization', items: ['Context groups', 'Keyword glossary', 'Custom prompts'] },
  { name: 'Project', items: ['Locales', 'Version branching', 'Usage limit'] },
  { name: 'Component', items: ['<T> nodes', 'context="file"'] },
];

/** The pull request Locadex opens: the wrap, as the diff reads. */
export type DiffLine = { kind: '-' | '+' | ' '; text: string };

export const LOCADEX_DIFF: readonly DiffLine[] = [
  { kind: ' ', text: 'export default function Home() {' },
  { kind: ' ', text: '  return (' },
  { kind: '-', text: '    <h1>Hello, world!</h1>' },
  { kind: '+', text: '    <T>' },
  { kind: '+', text: '      <h1>Hello, world!</h1>' },
  { kind: '+', text: '    </T>' },
  { kind: ' ', text: '  );' },
  { kind: ' ', text: '}' },
];

/* ------------------------------------------------------------------ *
 * The trust and the review
 * ------------------------------------------------------------------ */

/** The six customer marks from public/logos, in the shipped order. */
export type Customer = { name: string; file: string; href: string };

export const CUSTOMERS: readonly Customer[] = [
  { name: 'Cursor', file: 'cursor', href: 'https://cursor.com' },
  { name: 'Ramp', file: 'ramp', href: 'https://ramp.com' },
  { name: 'Mintlify', file: 'mintlify', href: 'https://mintlify.com' },
  { name: 'Profound', file: 'profound', href: 'https://tryprofound.com' },
  { name: 'Partiful', file: 'partiful', href: 'https://partiful.com' },
  { name: 'ClickHouse', file: 'clickhouse', href: 'https://clickhouse.com' },
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

/* ------------------------------------------------------------------ *
 * The languages
 * ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ *
 * The pricing file
 * ------------------------------------------------------------------ */

/**
 * The published rate ledger, verbatim. `count` is the figure the bar-and-dot
 * numeral beside the row prints: the whole-dollar figure where the rate is
 * whole, the cents figure where it is not (`unit` says which). `gtCount` is
 * the GT-libraries figure where that column has one.
 */
export type Rate = {
  workflow: string;
  rate: string;
  gtLibs?: string;
  gtCount?: number;
  count: number;
  unit: '$' | '¢';
};

export const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20', gtCount: 20, count: 10, unit: '$' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens', count: 1, unit: '$' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4', gtCount: 4, count: 1, unit: '$' },
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

/* ------------------------------------------------------------------ *
 * The back board
 * ------------------------------------------------------------------ */

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
