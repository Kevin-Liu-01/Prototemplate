/**
 * apadana-grid: the page's copy and data, gathered from the GT sources the
 * charter names. Nothing here is invented: the rates and plans are the
 * published pricing file (dither-field sections/Pricing.tsx, A10), the
 * customer names are the trust strip's six (dither-field sections/Hero.tsx,
 * A5), the locale roster comes from the production catalog
 * (production/sections/locales-data.ts, A7), the "language" word roster and
 * the sixteen-locale headline are the shipped hero data (dither-field
 * sections/Hero.tsx EVERY, production/sections/HomeHero.tsx WORDS), the
 * review rows are the review workspace's four (dither-field
 * sections/ReviewWorkspace.tsx, A6), the CLI lines and the trace are the
 * dark band's and the story's (A9, sections/story/beats.ts), and the footer
 * links are the shipped footer's destinations (_v0/V0Footer.tsx, A11).
 */
import { SUPPORTED_LOCALES } from '@/app/d/production/sections/locales-data';
import type { LocaleProperties } from '@/app/d/production/sections/locales-data';
import { PLAN_CTAS } from '@/app/d/production/sections/pricing-links';

export const SITE = 'https://generaltranslation.com';
export const DOCS_URL = `${SITE}/docs`;
export const SIGNIN_URL = 'https://dash.generaltranslation.com/en-US/signin';
export const DEMO_URL = `${SITE}/enterprise/contact`;
export const LOCALES_URL = `${SITE}/locales`;
export const PRICING_URL = `${SITE}/pricing`;
/* the legal documents live on the live site (the shipped footer's destinations) */
export const TERMS_URL = `${SITE}/legal/terms`;
export const PRIVACY_URL = `${SITE}/legal/privacy-policy`;

export const NAV_LINKS: readonly { label: string; href: string }[] = [
  { label: 'Docs', href: DOCS_URL },
  { label: 'Pricing', href: PRICING_URL },
  { label: 'Blog', href: `${SITE}/blog` },
  { label: 'Enterprise', href: `${SITE}/enterprise` },
];

/* ------------------------------------------------------------------ hero */

export type ShapedWord = { text: string; lang: string; rtl?: boolean };

/** "language" across eight writing systems; the hero's one morphing node. */
export const EVERY: readonly ShapedWord[] = [
  { text: 'language', lang: 'en' },
  { text: '言語', lang: 'ja' },
  { text: 'لغة', lang: 'ar', rtl: true },
  { text: 'भाषा', lang: 'hi' },
  { text: 'язык', lang: 'ru' },
  { text: '语言', lang: 'zh' },
  { text: '언어', lang: 'ko' },
  { text: 'γλώσσα', lang: 'el' },
];

export const HERO_SUB =
  'builds full-stack infrastructure for localizing apps, docs, and websites.';

export const INSTALL_COMMAND = 'npx gt@latest';

export const TRUST_LEAD = 'Cursor, Ramp and Profound ship in over thirty languages';

export type Customer = { id: string; name: string; href: string };

export const CUSTOMERS: readonly Customer[] = [
  { id: 'cursor', name: 'Cursor', href: 'https://cursor.com' },
  { id: 'ramp', name: 'Ramp', href: 'https://ramp.com' },
  { id: 'mintlify', name: 'Mintlify', href: 'https://mintlify.com' },
  { id: 'profound', name: 'Profound', href: 'https://tryprofound.com' },
  { id: 'partiful', name: 'Partiful', href: 'https://partiful.com' },
  { id: 'clickhouse', name: 'ClickHouse', href: 'https://clickhouse.com' },
];

/* ----------------------------------------------------------------- proof */

/** The shipped headline in its source locale and eight of its locale builds. */
export const SOURCE_STRING = 'Scale to every language';

export type Translation = { code: string; text: string };

export const TRANSLATIONS: readonly Translation[] = [
  { code: 'ja', text: 'あらゆる言語に展開' },
  { code: 'es', text: 'Crece en todos los idiomas' },
  { code: 'zh', text: '让产品说每一种语言' },
  { code: 'fr', text: 'Passez au multilingue, sans limite' },
  { code: 'de', text: 'In jeder Sprache wachsen' },
  { code: 'ko', text: '모든 언어로 확장하세요' },
  { code: 'pt', text: 'Cresça em todos os idiomas' },
  { code: 'hi', text: 'हर भाषा में आगे बढ़ें' },
];

/* ------------------------------------------------------------ great hall */

const RTL = new Set(['ar', 'he', 'fa', 'ur']);

const BY_CODE = new Map<string, LocaleProperties>(SUPPORTED_LOCALES.map((row) => [row.code, row]));

export type LocaleBay = {
  code: string;
  /** the endonym, the script sample the bay is set in */
  native: string;
  name: string;
  lang: string;
  dir: 'ltr' | 'rtl';
  tell?: boolean;
};

/** The catalog's English name for a locale, for the caption under a script sample. */
export function localeName(code: string): string {
  return BY_CODE.get(code)?.name ?? code;
}

/** Text direction for a locale, so every sample carries the right `dir`. */
export function localeDir(code: string): 'ltr' | 'rtl' {
  const lang = code.split('-')[0] ?? code;
  return RTL.has(lang) ? 'rtl' : 'ltr';
}

function bay(code: string, tell = false): LocaleBay {
  const row = BY_CODE.get(code);
  const lang = code.split('-')[0] ?? code;
  return {
    code,
    native: row?.nativeName ?? code,
    name: row?.name ?? code,
    lang: code,
    dir: RTL.has(lang) ? 'rtl' : 'ltr',
    tell,
  };
}

/**
 * The great hall, five bays by five, read row by row. The center is the
 * globe with the source chip; the two script variants of Chinese flank it
 * so the tell reads across the axis; the outer ring carries the scripts
 * that stress a layout most: Arabic, Hebrew and Persian right to left,
 * Devanagari, Bengali and Thai with their tall marks, Greek and Cyrillic.
 */
export const HALL_ROWS: readonly (LocaleBay | null)[][] = [
  [bay('ar'), bay('hi'), bay('ru'), bay('el'), bay('he')],
  [bay('it'), bay('es'), bay('fr'), bay('de'), bay('nl')],
  [bay('tr'), bay('zh-Hans', true), null, bay('zh-Hant', true), bay('sv')],
  [bay('pl'), bay('ja'), bay('ko'), bay('pt'), bay('id')],
  [bay('fa'), bay('bn'), bay('uk'), bay('th'), bay('vi')],
];

export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANT_ROWS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export const COUNT_LINE = '78 base languages, 129 distinct locale tags.';

/* ------------------------------------------------------------ throne hall */

export const CLI_LINES: readonly { tone?: 'prompt' | 'dim'; text: string }[] = [
  { tone: 'prompt', text: '$ npx gt translate' },
  { tone: 'dim', text: 'gt-next detected · Next.js App Router' },
  { text: '128 strings · 3 new · 2 changed' },
];

export const CLI_LOCALES = ['es', 'fr', 'ja', 'de', 'zh'] as const;

export const CLI_TAIL = 'done · local edits preserved';

export type ReviewRow = {
  key: string;
  source: string;
  translation: string;
  previous?: string;
  final: 'approved' | 'edit';
};

export const REVIEW_ROWS: readonly ReviewRow[] = [
  { key: 'hello', source: 'Hello, world!', translation: '¡Hola, mundo!', final: 'approved' },
  {
    key: 'hero',
    source: 'Launch in every language',
    translation: 'Lanza en todos los idiomas',
    final: 'approved',
  },
  {
    key: 'meta',
    source: "End-to-end localization for the world's best companies",
    previous: 'Localización de extremo a extremo para las mejores empresas del mundo.',
    translation: 'Localización integral para las mejores empresas del mundo.',
    final: 'edit',
  },
  {
    key: 'terms',
    source: 'By continuing you agree to our Terms of Service.',
    translation: 'Al continuar, aceptas nuestros Términos de Servicio.',
    final: 'approved',
  },
];

export const REVIEW_BAR = { scope: 'workspace · es-419', count: '4 strings' } as const;
export const REVIEW_FOOT = ['⌘K search', 'history', 'download', 'agent · locadex'] as const;

/** The agent's account of one run, from the story's annotations. */
export const LOCADEX_TRACE: readonly { step: string; text: string }[] = [
  { step: 'scan', text: 'push → workflow · locadex scans app/page.tsx' },
  { step: 'map', text: 'unwrapped copy · hand-rolled date · unbuilt label' },
  { step: 'edit', text: '+ <T> · + <DateTime> · − toLocaleDateString()' },
  { step: 'open pr', text: 'PR #218 · 6 locales · merged' },
];

/* --------------------------------------------------------------- treasury */

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

export const FOOTNOTE_LIMIT = 'A Usage Limit is a hard cap. It blocks billing even with auto-reload on.';
export const FOOTNOTE_DRY_RUN_CMD = 'npx gt translate --dry-run';
export const FOOTNOTE_DRY_RUN = 'prints what would be translated and bills 0 tokens.';

export type Plan = {
  id: 'starter' | 'enterprise';
  name: string;
  price: string;
  cadence: string;
  body: string;
  cta: string;
  href: string;
  solid: boolean;
};

export const PLANS: readonly Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    cadence: 'per month',
    body: 'Unlimited users, projects and languages. Editor, GitHub integration and Locadex included. Minimum top-up $10.',
    cta: 'Get Started',
    href: PLAN_CTAS.starter,
    solid: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'annual',
    body: 'Forward-deployed engineers, custom workflows for any format or framework, shared context across projects.',
    cta: 'Contact Us',
    href: PLAN_CTAS.enterpriseContact,
    solid: false,
  },
];

export const COMPARE_LABEL = 'Compare Plans and Usage Pricing';

/* ----------------------------------------------------------------- footer */

export type FooterLink = { label: string; href: string; mark?: 'locadex' | 'next' | 'react' | 'github' | 'discord' };

export const FOOTER_SENTENCE = "End-to-end localization for the world's best companies.";

export const FOOTER_COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: DOCS_URL, mark: 'locadex' },
      { label: 'Next.js', href: `${DOCS_URL}/next`, mark: 'next' },
      { label: 'React', href: `${DOCS_URL}/react`, mark: 'react' },
      { label: 'React Native', href: `${DOCS_URL}/react-native`, mark: 'react' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: DOCS_URL },
      { label: 'Blog', href: `${SITE}/blog` },
      { label: 'Pricing', href: PRICING_URL },
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
      { label: 'Terms of Service', href: TERMS_URL },
      { label: 'Privacy', href: PRIVACY_URL },
      { label: 'Acceptable Use', href: `${SITE}/legal/acceptable-use` },
      { label: 'Manage Cookies', href: '#' },
    ],
  },
];

export const COPYRIGHT = '© 2026 General Translation, Inc. All rights reserved.';
export const COMPLIANCE = 'SOC 2 Type II · GDPR · ISO 27001';
