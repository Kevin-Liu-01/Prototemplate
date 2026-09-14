/**
 * papyrus-registers · the scroll's text.
 *
 * Every rendered string below is transcribed from the round's data sources
 * named in the charter, section A: the hero roster from production
 * HomeHero.tsx (WORDS), the rate ledger and plan copy from dither-field
 * Pricing.tsx (RATES), the customers from dither-field Hero.tsx (CUSTOMERS),
 * the footer columns from dither-field SiteFooter.tsx with the shipped
 * footer's link targets, the review rows from ReviewWorkspace.tsx, the SDK
 * ledger and the Next.js sample from stacks.ts (FRAMEWORKS), the endonyms
 * from production locales-data.ts, the "Hello, world!" outputs from the
 * shipped samples. Nothing here is invented; the layout that reads it is.
 */

export type Dir = 'ltr' | 'rtl';

/** The claim in sixteen locales. One shaped text node carries it. */
export type Claim = { text: string; lang: string; dir: Dir };

export const CLAIMS: readonly Claim[] = [
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

/** The trust register: six customers, marks drawn from public/logos. */
export type Customer = { name: string; mark: string; href: string };

export const CUSTOMERS: readonly Customer[] = [
  { name: 'Cursor', mark: 'is-cursor', href: 'https://cursor.com' },
  { name: 'Ramp', mark: 'is-ramp', href: 'https://ramp.com' },
  { name: 'Mintlify', mark: 'is-mintlify', href: 'https://mintlify.com' },
  { name: 'Profound', mark: 'is-profound', href: 'https://tryprofound.com' },
  { name: 'Partiful', mark: 'is-partiful', href: 'https://partiful.com' },
  { name: 'ClickHouse', mark: 'is-clickhouse', href: 'https://clickhouse.com' },
];

/** The shipped Next.js sample, verbatim from stacks.ts. */
export const NEXT_SAMPLE = `import { T, Num, DateTime } from 'gt-next';

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
}`;

/** The source string of the proof, and its rendering per locale. */
export type Hello = { code: string; lang: string; dir: Dir; text: string };

export const HELLO_SOURCE = 'Hello, world!';

export const HELLOS: readonly Hello[] = [
  { code: 'es', lang: 'es', dir: 'ltr', text: '¡Hola, mundo!' },
  { code: 'fr', lang: 'fr', dir: 'ltr', text: 'Bonjour, le monde !' },
  { code: 'de', lang: 'de', dir: 'ltr', text: 'Hallo, Welt!' },
  { code: 'ja', lang: 'ja', dir: 'ltr', text: 'こんにちは世界！' },
  { code: 'ko', lang: 'ko', dir: 'ltr', text: '안녕하세요, 세계!' },
  { code: 'zh', lang: 'zh', dir: 'ltr', text: '你好，世界！' },
  { code: 'ar', lang: 'ar', dir: 'rtl', text: 'مرحبا بالعالم!' },
  { code: 'hi', lang: 'hi', dir: 'ltr', text: 'नमस्ते, दुनिया!' },
  { code: 'pt', lang: 'pt', dir: 'ltr', text: 'Olá, mundo!' },
  { code: 'ru', lang: 'ru', dir: 'ltr', text: 'Привет, мир!' },
  { code: 'he', lang: 'he', dir: 'rtl', text: 'שלום, עולם!' },
  { code: 'it', lang: 'it', dir: 'ltr', text: 'Ciao, mondo!' },
];

/** The six first-party SDKs, in the docs nav order, from stacks.ts. */
export type Sdk = { pkg: string; name: string; install: string; file: string; docs: string };

const DOCS = 'https://generaltranslation.com/docs';

export const SDKS: readonly Sdk[] = [
  { pkg: 'gt-next', name: 'Next.js', install: 'npm i gt-next', file: 'app/page.tsx', docs: `${DOCS}/next` },
  { pkg: 'gt-react', name: 'React', install: 'npm i gt-react', file: 'src/Home.tsx', docs: `${DOCS}/react` },
  {
    pkg: 'gt-react-native',
    name: 'React Native',
    install: 'npm i gt-react-native',
    file: 'app/index.tsx',
    docs: `${DOCS}/react-native`,
  },
  {
    pkg: 'gt-tanstack-start',
    name: 'TanStack Start',
    install: 'npm i gt-tanstack-start',
    file: 'src/routes/index.tsx',
    docs: `${DOCS}/tanstack-start`,
  },
  { pkg: 'gt-node', name: 'Node.js', install: 'npm i gt-node', file: 'server.ts', docs: `${DOCS}/node` },
  { pkg: 'gt-fastapi', name: 'Python', install: 'pip install gt-fastapi', file: 'app.py', docs: `${DOCS}/python` },
];

/** The CLI session's locale set, the one the gt-node sample configures. */
export const CLI_LOCALES: readonly string[] = ['es', 'fr', 'ja', 'de', 'zh'];

/** The review workspace's four rows, from ReviewWorkspace.tsx. */
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

/** The Locadex trace: what the agent does to a repository, in order. */
export type TraceStep = { verb: string; object: string };

export const LOCADEX_TRACE: readonly TraceStep[] = [
  { verb: 'read', object: 'the repository' },
  { verb: 'wrap', object: '128 strings in <T>' },
  { verb: 'run', object: 'npx gt translate' },
  { verb: 'open', object: 'PR #218' },
];

/** The scripts register: eighteen locales, one per canon square, endonyms from locales-data.ts. */
export type Script = { code: string; name: string; native: string; lang: string; dir: Dir };

export const SCRIPTS: readonly Script[] = [
  { code: 'en', name: 'English', native: 'English', lang: 'en', dir: 'ltr' },
  { code: 'es', name: 'Spanish', native: 'español', lang: 'es', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'français', lang: 'fr', dir: 'ltr' },
  { code: 'de', name: 'German', native: 'Deutsch', lang: 'de', dir: 'ltr' },
  { code: 'pt-BR', name: 'Brazilian Portuguese', native: 'português (Brasil)', lang: 'pt-BR', dir: 'ltr' },
  { code: 'it', name: 'Italian', native: 'italiano', lang: 'it', dir: 'ltr' },
  { code: 'pl', name: 'Polish', native: 'polski', lang: 'pl', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', lang: 'tr', dir: 'ltr' },
  { code: 'ru', name: 'Russian', native: 'русский', lang: 'ru', dir: 'ltr' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', lang: 'el', dir: 'ltr' },
  { code: 'he', name: 'Hebrew', native: 'עברית', lang: 'he', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', native: 'العربية', lang: 'ar', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', lang: 'hi', dir: 'ltr' },
  { code: 'th', name: 'Thai', native: 'ไทย', lang: 'th', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', native: '日本語', lang: 'ja', dir: 'ltr' },
  { code: 'ko', name: 'Korean', native: '한국어', lang: 'ko', dir: 'ltr' },
  { code: 'zh-Hans', name: 'Simplified Chinese', native: '简体中文', lang: 'zh-Hans', dir: 'ltr' },
  { code: 'zh-TW', name: 'Chinese (Taiwan)', native: '中文（台灣）', lang: 'zh-Hant-TW', dir: 'ltr' },
];

/** The variants atlas: one language expanded into its regional tags. */
export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANT_ROWS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export const VARIANT_TELL: readonly string[] = ['zh-Hans', 'zh-Hant'];

export const LONG_TAIL: readonly { tag: string; name: string }[] = [
  { tag: 'cnr', name: 'Montenegrin' },
  { tag: 'cy', name: 'Welsh' },
];

export const LOCALE_COUNT = '78 base languages, 129 distinct locale tags.';

/** The published rate ledger. These are the only rates that may appear. */
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

export type Plan = {
  name: string;
  price: string;
  period: string;
  body: string;
  items: readonly string[];
  cta: string;
  href: string;
  solid: boolean;
};

export const PLANS: readonly Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    period: 'per month',
    body: 'Unlimited users, projects and languages. Editor, GitHub integration and Locadex included. Minimum top-up $10.',
    items: ['Every SDK and the translation CLI', 'Dashboard, glossaries, and the editor', 'Locadex agent runs on your repo'],
    cta: 'Get Started',
    href: 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1',
    solid: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual',
    body: 'Forward-deployed engineers, custom workflows for any format or framework, shared context across projects.',
    items: ['SSO, RBAC, webhooks, custom SLA', 'SOC 2 Type II, GDPR, ISO 27001', 'Support from the engineers who build it'],
    cta: 'Contact Us',
    href: 'https://generaltranslation.com/enterprise/contact',
    solid: false,
  },
];

/** The CTA destinations, as the shipped site resolves them. */
export const LINKS = {
  signIn: 'https://dash.generaltranslation.com/en-US/signin',
  demo: 'https://generaltranslation.com/enterprise/contact',
  docs: DOCS,
  pricing: 'https://generaltranslation.com/pricing',
  usage: 'https://generaltranslation.com/pricing/usage',
  blog: 'https://generaltranslation.com/blog',
  enterprise: 'https://generaltranslation.com/enterprise',
  locales: 'https://generaltranslation.com/supported-locales',
} as const;

/** The footer's four columns with the shipped footer's targets. */
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
      { label: 'Blog', href: LINKS.blog },
      { label: 'Pricing', href: LINKS.pricing },
      { label: 'Supported Locales', href: LINKS.locales },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers', href: 'https://generaltranslation.com/careers' },
      { label: 'Contact', href: 'https://generaltranslation.com/contact' },
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

export const FOOTER_SENTENCE = 'End-to-end localization for the world’s best companies.';
export const FOOTER_COPYRIGHT = '© 2026 General Translation, Inc. All rights reserved.';
export const FOOTER_COMPLIANCE = 'SOC 2 Type II · GDPR · ISO 27001';
