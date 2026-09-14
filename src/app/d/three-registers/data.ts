/**
 * The stele's content, read from the data files the charter names. Every
 * string and figure here is one the shipped site or the charter already
 * carries; nothing is invented.
 *
 *   CLAIM, CLAIM_ROSTER   src/app/d/production/sections/HomeHero.tsx (WORD_EN, WORDS)
 *   BELT                  src/app/d/_v0/TranslateWindow.tsx (the belt's served outputs)
 *   SCRIPTS               src/app/d/production/sections/locales-data.ts (nativeName by code)
 *   VARIANTS, TAIL        src/app/d/dither-field/sections/Locales.tsx (ROWS, the tail row)
 *   REVIEW_ROWS           src/app/d/dither-field/sections/ReviewWorkspace.tsx (ROWS)
 *   RAIL, TRACE           src/app/d/dither-field/sections/story/beats.ts (RAIL, annot lines)
 *   RATES, PLANS          src/app/d/dither-field/sections/Pricing.tsx, charter A10
 *   CUSTOMERS             src/app/d/dither-field/sections/Hero.tsx (CUSTOMERS)
 *   LINKS, FOOTER         src/app/d/_v0/V0Footer.tsx, production/sections/site-links.ts, pricing-links.ts
 */

export type Shaped = { text: string; lang: string; dir?: 'rtl' };

/** The claim, incised in the first band of the first register. */
export const CLAIM: Shaped = { text: 'Scale to every language', lang: 'en' };

/** The same claim in the living scripts, one shaped node at a time. */
export const CLAIM_ROSTER: readonly Shaped[] = [
  { text: 'あらゆる言語に展開', lang: 'ja' },
  { text: 'Crece en todos los idiomas', lang: 'es' },
  { text: 'हर भाषा में आगे बढ़ें', lang: 'hi' },
  { text: 'In jeder Sprache wachsen', lang: 'de' },
  { text: '모든 언어로 확장하세요', lang: 'ko' },
  { text: 'Passez au multilingue, sans limite', lang: 'fr' },
  { text: '让产品说每一种语言', lang: 'zh' },
  { text: 'Cresça em todos os idiomas', lang: 'pt' },
  { text: 'Развивайте продукт на всех языках', lang: 'ru' },
  { text: 'Cresci in ogni lingua', lang: 'it' },
  { text: 'Groei in elke taal', lang: 'nl' },
  { text: 'Her dile açılın', lang: 'tr' },
  { text: 'Väx på alla språk', lang: 'sv' },
  { text: 'Tumbuh dalam setiap bahasa', lang: 'id' },
  { text: 'Rośnij w każdym języku', lang: 'pl' },
];

export type BeltRow = { source: string; outputs: readonly { loc: string; text: string }[] };

/** The served strings the translation window's belt carries. */
export const BELT: readonly BeltRow[] = [
  {
    source: 'Hello, world!',
    outputs: [
      { loc: 'es', text: '¡Hola, mundo!' },
      { loc: 'ja', text: 'こんにちは、世界！' },
      { loc: 'de', text: 'Hallo, Welt!' },
      { loc: 'fr', text: 'Bonjour le monde !' },
      { loc: 'zh', text: '你好，世界！' },
    ],
  },
  {
    source: 'Get started',
    outputs: [
      { loc: 'es', text: 'Comenzar ahora' },
      { loc: 'ja', text: '始める' },
      { loc: 'de', text: 'Jetzt starten' },
      { loc: 'fr', text: 'Commencer' },
      { loc: 'zh', text: '立即开始' },
    ],
  },
];

/** One real product output per capability, with the locale that produced it. */
export const OUTPUTS: readonly { cap: string; api: string; out: string; loc: string }[] = [
  { cap: 'Numbers', api: '<Num>', out: '1.234.567,89', loc: 'de' },
  { cap: 'Currencies', api: '<Currency>', out: '1.280,00 €', loc: 'de' },
  { cap: 'Dates', api: '<DateTime>', out: '29 juil. 2026', loc: 'fr' },
  { cap: 'Plurals', api: '<Plural>', out: '1 plik · 4 pliki', loc: 'pl' },
  { cap: 'Routing', api: 'middleware', out: '/fr/a-propos', loc: 'fr' },
];

export type Script = { code: string; name: string; lang: string; dir?: 'rtl' };

/** Eighteen scripts, each named in itself. RTL cells set right to left. */
export const SCRIPTS: readonly Script[] = [
  { code: 'ar', name: 'العربية', lang: 'ar', dir: 'rtl' },
  { code: 'he', name: 'עברית', lang: 'he', dir: 'rtl' },
  { code: 'el', name: 'Ελληνικά', lang: 'el' },
  { code: 'ru', name: 'русский', lang: 'ru' },
  { code: 'hi', name: 'हिन्दी', lang: 'hi' },
  { code: 'th', name: 'ไทย', lang: 'th' },
  { code: 'ja', name: '日本語', lang: 'ja' },
  { code: 'ko', name: '한국어', lang: 'ko' },
  { code: 'zh-Hans', name: '简体中文', lang: 'zh-Hans' },
  { code: 'zh-Hant', name: '繁體中文', lang: 'zh-Hant' },
  { code: 'de', name: 'Deutsch', lang: 'de' },
  { code: 'fr', name: 'français', lang: 'fr' },
  { code: 'es', name: 'español', lang: 'es' },
  { code: 'pt-BR', name: 'português (Brasil)', lang: 'pt-BR' },
  { code: 'it', name: 'italiano', lang: 'it' },
  { code: 'tr', name: 'Türkçe', lang: 'tr' },
  { code: 'pl', name: 'polski', lang: 'pl' },
  { code: 'id', name: 'Indonesia', lang: 'id' },
];

export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANTS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export const TAIL: readonly { code: string; name: string }[] = [
  { code: 'cnr', name: 'Montenegrin' },
  { code: 'cy', name: 'Welsh' },
];

export type ReviewRow = {
  key: string;
  source: string;
  previous?: string;
  translation: string;
  state: 'approved' | 'edited';
};

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
    state: 'edited',
  },
  {
    key: 'terms',
    source: 'By continuing you agree to our Terms of Service.',
    translation: 'Al continuar, aceptas nuestros Términos de Servicio.',
    state: 'approved',
  },
];

/** The pipeline, in the story's own lowercase. */
export const RAIL = ['extract', 'translate', 'review', 'scan', 'edit', 'open pr'] as const;

/** The agent's account of the code beats, verbatim from the story. */
export const TRACE: readonly string[] = [
  'push → workflow · locadex scans app/page.tsx',
  'unwrapped copy · hand-rolled date · unbuilt label',
  '+ <T> · + <DateTime> · − toLocaleDateString()',
  'PR #218 · 6 locales · merged',
];

/** The transcript the `gt` CLI prints for the story's run. */
export const CLI_LOCALES = ['es', 'fr', 'ja', 'de', 'zh'] as const;

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

export type Plan = {
  name: string;
  price: string;
  period: string;
  body: string;
  items: readonly string[];
  cta: { label: string; href: string; solid: boolean };
};

export const LINKS = {
  docs: 'https://generaltranslation.com/docs',
  pricing: 'https://generaltranslation.com/pricing',
  blog: 'https://generaltranslation.com/blog',
  enterprise: 'https://generaltranslation.com/enterprise',
  signin: 'https://dash.generaltranslation.com/en-US/signin',
  demo: 'https://generaltranslation.com/enterprise/contact',
  contact: 'https://generaltranslation.com/contact',
  careers: 'https://generaltranslation.com/careers',
  locales: 'https://generaltranslation.com/locales',
  github: 'https://github.com/generaltranslation',
  discord: 'https://discord.gg/generaltranslation',
  status: 'https://gt-status.com/',
  terms: 'https://generaltranslation.com/legal/terms',
  privacy: 'https://generaltranslation.com/legal/privacy-policy',
  acceptableUse: 'https://generaltranslation.com/legal/acceptable-use',
  planStarter: 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1',
  planEnterprise: 'https://generaltranslation.com/enterprise/contact',
} as const;

export const PLANS: readonly Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    period: 'per month',
    body: 'Unlimited users, projects and languages. Editor, GitHub integration and Locadex included. Minimum top-up $10.',
    items: [
      'Every SDK and the translation CLI',
      'Dashboard, glossaries, and the editor',
      'Locadex agent runs on your repo',
    ],
    cta: { label: 'Get Started', href: LINKS.planStarter, solid: true },
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual',
    body: 'Forward-deployed engineers, custom workflows for any format or framework, shared context across projects.',
    items: [
      'SSO, RBAC, webhooks, custom SLA',
      'SOC 2 Type II, GDPR, ISO 27001',
      'Support from the engineers who build it',
    ],
    cta: { label: 'Contact Us', href: LINKS.planEnterprise, solid: false },
  },
];

/** The compare grid's four groups, by name only. */
export const COMPARE_GROUPS = ['Pricing', 'Core Products', 'Platform', 'Support'] as const;

export type Customer = { name: string; file: string; href: string };

/** Six wordmarks, printed from public/logos as the dark-ink drawings. */
export const CUSTOMERS: readonly Customer[] = [
  { name: 'Cursor', file: 'cursor', href: 'https://cursor.com' },
  { name: 'Ramp', file: 'ramp', href: 'https://ramp.com' },
  { name: 'Mintlify', file: 'mintlify', href: 'https://mintlify.com' },
  { name: 'Profound', file: 'profound', href: 'https://tryprofound.com' },
  { name: 'Partiful', file: 'partiful', href: 'https://partiful.com' },
  { name: 'ClickHouse', file: 'clickhouse', href: 'https://clickhouse.com' },
];

export type FooterLink = { label: string; href: string; mark?: 'next' | 'react' | 'github' | 'discord' | 'locadex' };

export const FOOTER: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: LINKS.docs, mark: 'locadex' },
      { label: 'Next.js', href: `${LINKS.docs}/next`, mark: 'next' },
      { label: 'React', href: `${LINKS.docs}/react`, mark: 'react' },
      { label: 'React Native', href: `${LINKS.docs}/react-native`, mark: 'react' },
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
      { label: 'Acceptable Use Policy', href: LINKS.acceptableUse },
      { label: 'Status', href: LINKS.status },
    ],
  },
];
