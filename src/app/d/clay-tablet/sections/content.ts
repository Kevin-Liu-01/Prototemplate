/**
 * clay-tablet content: every string the tablets carry, transcribed from the
 * shipped data files the charter names (section A). Nothing here is invented.
 *
 * Sources, by block:
 *   HERO_WORDS        src/app/d/production/sections/HomeHero.tsx (WORDS)
 *   HERO_SUB          HomeHero.tsx (the sub line)
 *   CUSTOMERS, TRUST  src/app/d/dither-field/sections/Hero.tsx (CUSTOMERS, the trust lead)
 *   PROOF_SOURCE      src/app/d/dither-field/sections/stacks.ts (FRAMEWORKS[0], gt-next)
 *   PROOF_LOCALES     src/app/d/_v0/TranslateWindow.tsx (ROWS) and stacks.ts (CAP_DEMOS: the fr date)
 *   TRANSLATE_RUN     src/app/d/dither-field/sections/Bento.tsx (TRANSLATE_RUN, dashes replaced)
 *   GT_CONFIG         Bento.tsx (CONFIG)
 *   SDKS              stacks.ts (FRAMEWORKS: pkg, name, install)
 *   STATS             Bento.tsx shell 5 (StatRow)
 *   CLI_TERMINAL      src/app/d/dither-field/sections/DarkBand.tsx (the gt cli cell)
 *   LOCADEX_TRACE     src/app/d/dither-field/sections/story/beats.ts (annot lines)
 *   DASHBOARD_ITEMS   src/app/d/production/sections/pricing-features.ts (feature names)
 *   SCRIPT_CELLS      src/app/d/production/sections/locales-data.ts (nativeName, name)
 *   VARIANT_ROWS      src/app/d/dither-field/sections/Locales.tsx (ROWS, the tail, the count)
 *   REVIEW_ROWS       src/app/d/dither-field/sections/ReviewWorkspace.tsx (ROWS, the bar, the footer)
 *   RATES, PLANS      src/app/d/dither-field/sections/Pricing.tsx (RATES, notes, plans)
 *   PLAN_CTAS         src/app/d/production/sections/pricing-links.ts
 *   FOOTER            src/app/d/dither-field/sections/SiteFooter.tsx (COLUMNS, the bar) and
 *                     src/app/d/_v0/V0Footer.tsx (destinations)
 */

export type Dir = 'ltr' | 'rtl';

export type HeroWord = { text: string; lang: string; dir: Dir };

/** The claim in sixteen locales. English leads: the reader's own language first, then the translations. */
export const HERO_WORDS: readonly HeroWord[] = [
  { text: 'Scale to every language', lang: 'en', dir: 'ltr' },
  { text: 'Crece en todos los idiomas', lang: 'es', dir: 'ltr' },
  { text: 'あらゆる言語に展開', lang: 'ja', dir: 'ltr' },
  { text: 'In jeder Sprache wachsen', lang: 'de', dir: 'ltr' },
  { text: '모든 언어로 확장하세요', lang: 'ko', dir: 'ltr' },
  { text: 'Passez au multilingue, sans limite', lang: 'fr', dir: 'ltr' },
  { text: '让产品说每一种语言', lang: 'zh', dir: 'ltr' },
  { text: 'Cresça em todos os idiomas', lang: 'pt', dir: 'ltr' },
  { text: 'Развивайте продукт на всех языках', lang: 'ru', dir: 'ltr' },
  { text: 'Cresci in ogni lingua', lang: 'it', dir: 'ltr' },
  { text: 'हर भाषा में आगे बढ़ें', lang: 'hi', dir: 'ltr' },
  { text: 'Groei in elke taal', lang: 'nl', dir: 'ltr' },
  { text: 'Her dile açılın', lang: 'tr', dir: 'ltr' },
  { text: 'Väx på alla språk', lang: 'sv', dir: 'ltr' },
  { text: 'Tumbuh dalam setiap bahasa', lang: 'id', dir: 'ltr' },
  { text: 'Rośnij w każdym języku', lang: 'pl', dir: 'ltr' },
];

export const HERO_SUB = 'builds full-stack infrastructure for localizing apps, docs, and websites.';

export const INSTALL_COMMAND = 'npx gt@latest';

export const LINKS = {
  site: 'https://generaltranslation.com',
  docs: 'https://generaltranslation.com/docs',
  pricing: 'https://generaltranslation.com/pricing',
  blog: 'https://generaltranslation.com/blog',
  enterprise: 'https://generaltranslation.com/enterprise',
  contact: 'https://generaltranslation.com/enterprise/contact',
  signin: 'https://dash.generaltranslation.com/en-US/signin',
  locales: 'https://generaltranslation.com/locales',
  careers: 'https://generaltranslation.com/careers',
  github: 'https://github.com/generaltranslation',
  discord: 'https://discord.gg/generaltranslation',
  terms: 'https://generaltranslation.com/legal/terms',
  privacy: 'https://generaltranslation.com/legal/privacy-policy',
  acceptableUse: 'https://generaltranslation.com/legal/acceptable-use',
  usageRates: 'https://generaltranslation.com/pricing/usage',
} as const;

/** The plan CTAs, as the shipped /pricing resolves them. */
export const PLAN_CTAS = {
  starter: 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1',
  enterpriseContact: 'https://generaltranslation.com/enterprise/contact',
} as const;

export type Customer = { name: string; key: string };

export const CUSTOMERS: readonly Customer[] = [
  { name: 'Cursor', key: 'cursor' },
  { name: 'Ramp', key: 'ramp' },
  { name: 'Mintlify', key: 'mintlify' },
  { name: 'Profound', key: 'profound' },
  { name: 'Partiful', key: 'partiful' },
  { name: 'ClickHouse', key: 'clickhouse' },
];

export const TRUST_LEAD = 'Cursor, Ramp and Profound ship in over thirty languages';

/** The shipped gt-next sample, verbatim. */
export const PROOF_SOURCE = {
  file: 'app/page.tsx',
  pkg: 'gt-next',
  code: `import { T, Num, DateTime } from 'gt-next';

export default function Home() {
  return (
    <T>
      <main>
        <h1>Hello, world!</h1>
        <p>
          <DateTime>{new Date()}</DateTime>
        </p>
        <p>
          GT has everything you need to ship your
          product in <Num>{118}</Num> languages.
        </p>
      </main>
    </T>
  );
}`,
} as const;

export type ProofLocale = {
  code: string;
  dir: Dir;
  /** The h1 as the translation window ships it. */
  hello: string;
  /** `<DateTime>` for 29 July 2026, the date the shipped fr sample prints, as Intl formats it. */
  date: string;
  /** `<Num>{118}</Num>`. */
  num: string;
};

export const PROOF_LOCALES: readonly ProofLocale[] = [
  { code: 'es', dir: 'ltr', hello: '¡Hola, mundo!', date: '29 jul 2026', num: '118' },
  { code: 'ja', dir: 'ltr', hello: 'こんにちは、世界！', date: '2026年7月29日', num: '118' },
  { code: 'de', dir: 'ltr', hello: 'Hallo, Welt!', date: '29. Juli 2026', num: '118' },
  { code: 'fr', dir: 'ltr', hello: 'Bonjour le monde !', date: '29 juil. 2026', num: '118' },
  { code: 'zh', dir: 'ltr', hello: '你好，世界！', date: '2026年7月29日', num: '118' },
];

export type RunLine = { tone: 'cmd' | 'dim' | 'out'; key?: string; text: string };

export const TRANSLATE_RUN: readonly RunLine[] = [
  { tone: 'cmd', key: '$ ', text: 'npx gt translate' },
  { tone: 'dim', text: 'Scanning src · 128 strings found' },
  { tone: 'out', key: 'Wrote ', text: 'public/_gt/es.json' },
  { tone: 'out', key: 'Wrote ', text: 'public/_gt/fr.json' },
  { tone: 'out', key: 'Wrote ', text: 'public/_gt/ja.json' },
  { tone: 'out', key: 'Wrote ', text: 'public/_gt/de.json' },
  { tone: 'out', key: 'Wrote ', text: 'public/_gt/zh.json' },
  { tone: 'dim', text: 'Done · 640 translations' },
];

export const GT_CONFIG = `{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"],
  "files": {
    "gt": {
      "output": "public/_gt/[locale].json"
    },
    "json": {
      "include": ["content/[locale]/*.json"]
    }
  }
}`;

export type Sdk = { pkg: string; name: string; install: string };

export const SDKS: readonly Sdk[] = [
  { pkg: 'gt-next', name: 'Next.js', install: 'npm i gt-next' },
  { pkg: 'gt-react', name: 'React', install: 'npm i gt-react' },
  { pkg: 'gt-react-native', name: 'React Native', install: 'npm i gt-react-native' },
  { pkg: 'gt-tanstack-start', name: 'TanStack Start', install: 'npm i gt-tanstack-start' },
  { pkg: 'gt-node', name: 'Node.js', install: 'npm i gt-node' },
  { pkg: 'gt-fastapi', name: 'Python', install: 'pip install gt-fastapi' },
];

export type Stat = { value: string; label: string };

export const STATS: readonly Stat[] = [
  { value: '118', label: 'locales, ready today' },
  { value: '6', label: 'first-party SDKs' },
  { value: '<1s', label: 'over-the-air updates' },
  { value: '$0', label: 'to start' },
];

export const CLI_TERMINAL = {
  prompt: '$ npx gt translate',
  summary: '128 strings · 3 new · 2 changed',
  locales: ['es', 'fr', 'ja', 'de', 'zh'],
} as const;

export const LOCADEX_TRACE: readonly string[] = [
  'push → workflow · locadex scans app/page.tsx',
  'unwrapped copy · hand-rolled date · unbuilt label',
  '+ <T> · + <DateTime> · - toLocaleDateString()',
  'PR #218 · 6 locales · merged',
];

export const DASHBOARD_ITEMS: readonly string[] = [
  'Translation Editor',
  'Context Groups',
  'Keyword Glossary',
  'Custom Prompts',
  'Version Branching',
  'Translation CDN',
];

export type ScriptCell = { code: string; native: string; name: string; dir: Dir };

/** Twenty scripts and languages, endonym first, as the locales catalogue names them. */
export const SCRIPT_CELLS: readonly ScriptCell[] = [
  { code: 'ar', native: 'العربية', name: 'Arabic', dir: 'rtl' },
  { code: 'he', native: 'עברית', name: 'Hebrew', dir: 'rtl' },
  { code: 'hi', native: 'हिन्दी', name: 'Hindi', dir: 'ltr' },
  { code: 'th', native: 'ไทย', name: 'Thai', dir: 'ltr' },
  { code: 'ja', native: '日本語', name: 'Japanese', dir: 'ltr' },
  { code: 'ko', native: '한국어', name: 'Korean', dir: 'ltr' },
  { code: 'zh', native: '中文', name: 'Chinese', dir: 'ltr' },
  { code: 'el', native: 'Ελληνικά', name: 'Greek', dir: 'ltr' },
  { code: 'ru', native: 'русский', name: 'Russian', dir: 'ltr' },
  { code: 'es', native: 'español', name: 'Spanish', dir: 'ltr' },
  { code: 'fr', native: 'français', name: 'French', dir: 'ltr' },
  { code: 'de', native: 'Deutsch', name: 'German', dir: 'ltr' },
  { code: 'pt', native: 'português', name: 'Portuguese', dir: 'ltr' },
  { code: 'it', native: 'italiano', name: 'Italian', dir: 'ltr' },
  { code: 'pl', native: 'polski', name: 'Polish', dir: 'ltr' },
  { code: 'nl', native: 'Nederlands', name: 'Dutch', dir: 'ltr' },
  { code: 'tr', native: 'Türkçe', name: 'Turkish', dir: 'ltr' },
  { code: 'sv', native: 'svenska', name: 'Swedish', dir: 'ltr' },
  { code: 'id', native: 'Indonesia', name: 'Indonesian', dir: 'ltr' },
  { code: 'en', native: 'English', name: 'English', dir: 'ltr' },
];

export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANT_ROWS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export const LOCALES_HEAD = '100+ languages, and the variants that matter';
export const LOCALES_SUB = 'zh-Hant is not zh-Hans. Both ship.';
export const LOCALES_COUNT = '78 base languages, 129 distinct locale tags.';

export type ReviewRow = {
  key: string;
  source: string;
  translation: string;
  /** The struck previous translation on the regenerated row. */
  previous?: string;
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

export const REVIEW_BAR = { title: 'workspace · es-419', count: '4 strings' } as const;
export const REVIEW_HEADS = { source: 'source · en', translation: 'translation · es', state: 'state' } as const;
export const REVIEW_FOOT: readonly string[] = ['⌘K search', 'history', 'download', 'agent · locadex'];

export type Plane = { numeral: string; name: string; fact: string };

/** The stack in seven registers, top to bottom, source to screen. */
export const STACK_PLANES: readonly Plane[] = [
  { numeral: 'I', name: 'App code', fact: 'Strings wrapped in <T> in the source you already wrote.' },
  { numeral: 'II', name: 'gt cli', fact: 'npx gt translate scans the source and writes one file per locale.' },
  { numeral: 'III', name: 'Locadex', fact: 'The agent reads the file that changed and opens the pull request.' },
  { numeral: 'IV', name: 'Context', fact: 'Organization, project, and component context reach every translation.' },
  { numeral: 'V', name: 'Review', fact: 'Source beside translation. Approval is recorded per string.' },
  { numeral: 'VI', name: 'Edge CDN', fact: 'Every variant negotiated per request · served from the edge' },
  { numeral: 'VII', name: 'Runtime', fact: 'The translated string reaches the screen in the reader’s locale.' },
];

export const DEPLOY_LEAD = "Join the world's best developer teams on General Translation";

export type Rate = { workflow: string; rate: string; gtLibs?: string };

/** The only rates that may appear anywhere on the page. */
export const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens' },
  { workflow: 'Project context surcharge', rate: '+$0.10 / 10k tokens per 500 tokens of context' },
  { workflow: 'Locadex', rate: '$5 / LCU' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits' },
];

export const RATE_NOTE_LIMIT = 'A Usage Limit is a hard cap. It blocks billing even with auto-reload on.';
export const RATE_NOTE_DRY_RUN_CMD = 'npx gt translate --dry-run';
export const RATE_NOTE_DRY_RUN = 'prints what would be translated and bills 0 tokens.';

export const PRICING_HEAD = 'Start at $0. Pay per token.';
export const PRICING_SUB = 'The price of a translation is knowable before you run it.';

/** Feature names from the shipped compare grid, by the tier that carries them. */
export const STARTER_ITEMS: readonly string[] = [
  'Locadex AI Agent',
  'Open-Source SDKs',
  'Translation CLI',
  'Context Platform',
  'Translation CDN',
  'Version Branching',
];

export const ENTERPRISE_ITEMS: readonly string[] = [
  'Custom Workflows',
  'Custom Roles',
  'Webhooks',
  'SSO (SAML & OIDC)',
  'SOC 2 Type II Certification',
  'ISO 27001 Certification',
  'Slack Support',
  'Phone Support',
];

export type FooterLink = { label: string; href: string; mark?: 'locadex' | 'next' | 'react' | 'github' | 'discord' };
export type FooterColumn = { title: string; links: readonly FooterLink[] };

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: LINKS.docs, mark: 'locadex' },
      { label: 'Next.js', href: LINKS.docs, mark: 'next' },
      { label: 'React', href: LINKS.docs, mark: 'react' },
      { label: 'React Native', href: LINKS.docs, mark: 'react' },
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
export const FOOTER_COPYRIGHT = '© 2026 General Translation, Inc. All rights reserved.';
export const FOOTER_COMPLIANCE = 'SOC 2 Type II · GDPR · ISO 27001';
