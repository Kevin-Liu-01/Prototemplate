/**
 * The real content of the page, transcribed from the charter's data sources
 * (deco-charter.md section A): the published rates and plans, the six
 * customers, the locale variant rows, the hero roster, the shipped Next.js
 * sample, the review rows, and the footer links. Nothing here is invented;
 * every number is on the charter's allowed list.
 */

export const SIGN_IN_HREF = 'https://dash.generaltranslation.com/en-US/signin';
export const DEMO_HREF = 'https://generaltranslation.com/enterprise/contact';
export const DOCS_HREF = 'https://generaltranslation.com/docs';
export const STARTER_HREF = 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1';
export const USAGE_RATES_HREF = 'https://generaltranslation.com/pricing/usage';
/** The full locale catalog. The real route is /supported-locales, not a docs path. */
export const SUPPORTED_LOCALES_HREF = 'https://generaltranslation.com/supported-locales';

export const NAV_LINKS: readonly { label: string; href: string }[] = [
  { label: 'Docs', href: DOCS_HREF },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: 'https://generaltranslation.com/blog' },
  { label: 'Enterprise', href: 'https://generaltranslation.com/enterprise' },
];

/** The claim in sixteen locales; the hero cycles through them as one shaped text node. */
export type Claim = { text: string; lang: string; rtl?: boolean };

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

export const HERO_SUB = 'builds full-stack infrastructure for localizing apps, docs, and websites';

export const INSTALL_COMMAND = 'npx gt@latest';

/** The six customer wordmarks, in the trust register's order. */
export type Customer = { id: string; name: string; href: string; ratio: string; height: number };

export const CUSTOMERS: readonly Customer[] = [
  { id: 'cursor', name: 'Cursor', href: 'https://cursor.com', ratio: '739 / 186', height: 22 },
  { id: 'ramp', name: 'Ramp', href: 'https://ramp.com', ratio: '643.93 / 170.94', height: 16 },
  { id: 'mintlify', name: 'Mintlify', href: 'https://mintlify.com', ratio: '2191 / 484', height: 18 },
  { id: 'profound', name: 'Profound', href: 'https://tryprofound.com', ratio: '166 / 28', height: 17 },
  { id: 'partiful', name: 'Partiful', href: 'https://partiful.com', ratio: '204 / 46', height: 20 },
  { id: 'clickhouse', name: 'ClickHouse', href: 'https://clickhouse.com', ratio: '649.3 / 198.3', height: 21 },
];

export const TRUST_LEAD = 'Cursor, Ramp and Profound ship in over thirty languages';

/** The shipped Next.js sample, byte for byte. */
export const NEXT_SAMPLE = {
  file: 'app/page.tsx',
  pkg: 'gt-next',
  install: ['npm i gt-next', 'npx gt@latest'] as const,
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
};

/**
 * The source string of the sample rendered in five locales, one per step,
 * in the order the shipped translation window serves them. These are the
 * outputs the window shows; no translation here is written by hand.
 */
export type Step = { code: string; text: string; lang: string; rtl?: boolean };

export const STEPS: readonly Step[] = [
  { code: 'es', text: '¡Hola, mundo!', lang: 'es' },
  { code: 'ja', text: 'こんにちは、世界！', lang: 'ja' },
  { code: 'de', text: 'Hallo, Welt!', lang: 'de' },
  { code: 'fr', text: 'Bonjour le monde !', lang: 'fr' },
  { code: 'zh', text: '你好，世界！', lang: 'zh' },
];

/** Where the CLI writes each locale's translations, as the shipped window prints it. */
export const SERVED_PATH = 'public/_gt/[locale].json';

/** The six first-party stacks, package and install lines as shipped. */
export type Stack = { name: string; pkg: string; install: string };

export const STACKS: readonly Stack[] = [
  { name: 'Next.js', pkg: 'gt-next', install: 'npm i gt-next' },
  { name: 'React', pkg: 'gt-react', install: 'npm i gt-react' },
  { name: 'React Native', pkg: 'gt-react-native', install: 'npm i gt-react-native' },
  { name: 'TanStack Start', pkg: 'gt-tanstack-start', install: 'npm i gt-tanstack-start' },
  { name: 'Node.js', pkg: 'gt-node', install: 'npm i gt-node' },
  { name: 'Python', pkg: 'gt-fastapi', install: 'pip install gt-fastapi' },
];

/** One real product output per capability. */
export const CAPABILITIES: readonly { name: string; demo: string }[] = [
  { name: 'Numbers', demo: '1.234.567,89' },
  { name: 'Currencies', demo: '1.280,00 €' },
  { name: 'Dates', demo: '29 juil. 2026' },
  { name: 'Plurals', demo: '1 plik · 4 pliki' },
  { name: 'Routing', demo: '/fr/a-propos' },
  { name: 'Functions', demo: 'useGT() · getGT()' },
];

/** The CLI session's locales. */
export const CLI_LOCALES: readonly string[] = ['es', 'fr', 'ja', 'de', 'zh', 'ko'];

/**
 * Greetings, the living material: real modern strings with their script,
 * the source language first. Twenty cells, so the meander runs in four
 * courses of five on the wide page.
 */
export type Greeting = { code: string; text: string; lang: string; name: string; rtl?: boolean };

export const GREETINGS: readonly Greeting[] = [
  { code: 'en', text: 'Hello', lang: 'en', name: 'English' },
  { code: 'es', text: 'Hola', lang: 'es', name: 'español' },
  { code: 'fr', text: 'Bonjour', lang: 'fr', name: 'français' },
  { code: 'ja', text: 'こんにちは', lang: 'ja', name: '日本語' },
  { code: 'ko', text: '안녕하세요', lang: 'ko', name: '한국어' },
  { code: 'zh', text: '你好', lang: 'zh', name: '中文' },
  { code: 'ar', text: 'مرحبا', lang: 'ar', name: 'العربية', rtl: true },
  { code: 'hi', text: 'नमस्ते', lang: 'hi', name: 'हिन्दी' },
  { code: 'de', text: 'Hallo', lang: 'de', name: 'Deutsch' },
  { code: 'pt', text: 'Olá', lang: 'pt', name: 'português' },
  { code: 'ru', text: 'Привет', lang: 'ru', name: 'русский' },
  { code: 'it', text: 'Ciao', lang: 'it', name: 'italiano' },
  { code: 'el', text: 'Γεια σας', lang: 'el', name: 'Ελληνικά' },
  { code: 'th', text: 'สวัสดี', lang: 'th', name: 'ไทย' },
  { code: 'he', text: 'שלום', lang: 'he', name: 'עברית', rtl: true },
  { code: 'tr', text: 'Merhaba', lang: 'tr', name: 'Türkçe' },
  { code: 'pl', text: 'Cześć', lang: 'pl', name: 'polski' },
  { code: 'nl', text: 'Hallo', lang: 'nl', name: 'Nederlands' },
  { code: 'sv', text: 'Hej', lang: 'sv', name: 'svenska' },
  { code: 'id', text: 'Halo', lang: 'id', name: 'Indonesia' },
];

/** The variants that matter, as the locales atlas lists them. */
export type LocaleRow = { tag: string; name: string; variants: readonly string[] };

export const LOCALE_ROWS: readonly LocaleRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export const LOCALE_TAIL: readonly { tag: string; name: string }[] = [
  { tag: 'cnr', name: 'Montenegrin' },
  { tag: 'cy', name: 'Welsh' },
];

export const LOCALE_COUNT = '78 base languages, 129 distinct locale tags.';

/** The review workspace's four rows. */
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

/** The platform's tiers, bottom to top, from the shipped compare grid's core products. */
export const TIERS: readonly { name: string; note: string }[] = [
  { name: 'Open-Source SDKs', note: 'gt-next, gt-react, gt-node and the rest' },
  { name: 'Translation CLI', note: 'npx gt translate at build time' },
  { name: 'Context Platform', note: 'glossary, context groups, custom prompts' },
  { name: 'Version Branching', note: 'one branch of translations per branch of code' },
  { name: 'Translation CDN', note: 'every variant negotiated per request' },
  { name: 'Locadex AI Agent', note: 'opens the pull request' },
];

/** The published rate ledger. The only rates that may appear anywhere. */
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

export const RATE_NOTES: readonly string[] = [
  'A Usage Limit is a hard cap. It blocks billing even with auto-reload on.',
];

export type Plan = {
  id: 'starter' | 'enterprise';
  name: string;
  price: string;
  period: string;
  blurb: string;
  items: readonly string[];
  cta: string;
  href: string;
};

export const PLANS: readonly Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    period: 'per month',
    blurb:
      'Unlimited users, projects and languages. Editor, GitHub integration and Locadex included. Minimum top-up $10.',
    items: [
      'Every SDK and the translation CLI',
      'Dashboard, glossaries, and the editor',
      'Locadex agent runs on your repo',
    ],
    cta: 'Get Started',
    href: STARTER_HREF,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual',
    blurb:
      'Forward-deployed engineers, custom workflows for any format or framework, shared context across projects.',
    items: [
      'SSO, RBAC, webhooks, custom SLA',
      'SOC 2 Type II, GDPR, ISO 27001',
      'Support from the engineers who build it',
    ],
    cta: 'Contact Us',
    href: DEMO_HREF,
  },
];

export type FooterLink = { label: string; href: string; mark?: 'locadex' | 'next' | 'react' | 'github' | 'discord' };

export const FOOTER_COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: 'https://generaltranslation.com/docs/locadex', mark: 'locadex' },
      { label: 'Next.js', href: 'https://generaltranslation.com/docs/next', mark: 'next' },
      { label: 'React', href: 'https://generaltranslation.com/docs/react', mark: 'react' },
      { label: 'React Native', href: 'https://generaltranslation.com/docs/react-native', mark: 'react' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: DOCS_HREF },
      { label: 'Blog', href: 'https://generaltranslation.com/blog' },
      { label: 'Pricing', href: 'https://generaltranslation.com/pricing' },
      { label: 'Supported Locales', href: SUPPORTED_LOCALES_HREF },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers', href: 'https://generaltranslation.com/careers' },
      { label: 'Contact', href: DEMO_HREF },
      { label: 'GitHub', href: 'https://github.com/generaltranslation', mark: 'github' },
      { label: 'Discord', href: 'https://discord.gg/generaltranslation', mark: 'discord' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: 'https://generaltranslation.com/legal/terms' },
      { label: 'Privacy', href: 'https://generaltranslation.com/legal/privacy-policy' },
      { label: 'Acceptable Use', href: 'https://generaltranslation.com/legal/acceptable-use' },
    ],
  },
];

export const FOOTER_LINE = "End-to-end localization for the world's best companies.";
export const COPYRIGHT = '© 2026 General Translation, Inc. All rights reserved.';
export const COMPLIANCE = 'SOC 2 Type II · GDPR · ISO 27001';
