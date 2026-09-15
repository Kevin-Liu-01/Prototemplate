/**
 * talud-tablero: every string, rate, locale and link the page renders.
 *
 * All copy here is real General Translation copy transcribed from the
 * charter's data sources (the shipped stacks samples, the published rate
 * ledger, the locales atlas rows, the review workspace rows, the dark band
 * trace, the footer columns). Nothing is invented: no new numbers, no new
 * customers, no new API names. Sections import from this file and nowhere
 * else, so a reviewer can audit the page's content in one read.
 */

/* ---------------------------------------------------------------- links */

export const LINKS = {
  getStarted: 'https://dash.generaltranslation.com/en-US/signin',
  signIn: 'https://dash.generaltranslation.com/en-US/signin',
  demo: 'https://generaltranslation.com/enterprise/contact',
  docs: 'https://generaltranslation.com/docs',
  pricing: 'https://generaltranslation.com/pricing',
  blog: 'https://generaltranslation.com/blog',
  enterprise: 'https://generaltranslation.com/enterprise',
  locales: 'https://generaltranslation.com/locales',
  starterPlan: 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1',
  github: 'https://github.com/generaltranslation',
  discord: 'https://discord.gg/generaltranslation',
} as const;

export type NavLink = { label: string; href: string };

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Docs', href: LINKS.docs },
  { label: 'Pricing', href: LINKS.pricing },
  { label: 'Blog', href: LINKS.blog },
  { label: 'Enterprise', href: LINKS.enterprise },
];

/* ----------------------------------------------------------------- hero */

/** One shaped word of the claim, swapped in place with its lang and dir. */
export type EveryWord = { text: string; lang: string; rtl?: boolean };

/** "Your product speaks every language." The word EVERY in eight scripts. */
export const EVERY: readonly EveryWord[] = [
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

/* ---------------------------------------------------------------- trust */

export type Customer = { name: string; slug: string };

/** The six customers whose wordmarks live in /public/logos. */
export const CUSTOMERS: readonly Customer[] = [
  { name: 'Cursor', slug: 'cursor' },
  { name: 'Ramp', slug: 'ramp' },
  { name: 'Mintlify', slug: 'mintlify' },
  { name: 'Profound', slug: 'profound' },
  { name: 'Partiful', slug: 'partiful' },
  { name: 'ClickHouse', slug: 'clickhouse' },
];

export const TRUST_LEAD = 'Cursor, Ramp and Profound ship in over thirty languages';

/* ------------------------------------------------------- the T component */

/** The shipped Next.js sample, trimmed to the lines that carry the idea. */
export const T_SOURCE = {
  file: 'app/page.tsx',
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

export type Translation = { code: string; text: string; lang: string; rtl?: boolean };

/** `Hello, world!` as the product returns it. */
export const HELLO: readonly Translation[] = [
  { code: 'es', text: '¡Hola, mundo!', lang: 'es' },
  { code: 'fr', text: 'Bonjour, le monde !', lang: 'fr' },
  { code: 'de', text: 'Hallo, Welt!', lang: 'de' },
  { code: 'ja', text: 'こんにちは世界！', lang: 'ja' },
  { code: 'zh', text: '你好，世界！', lang: 'zh' },
  { code: 'ar', text: 'مرحباً بالعالم!', lang: 'ar', rtl: true },
];

export type Output = { capability: string; value: string; code: string };

/** One real product output per capability. */
export const OUTPUTS: readonly Output[] = [
  { capability: 'Numbers', value: '1.234.567,89', code: 'de' },
  { capability: 'Currencies', value: '1.280,00 €', code: 'de' },
  { capability: 'Dates', value: '29 juil. 2026', code: 'fr' },
  { capability: 'Plurals', value: '1 plik · 4 pliki', code: 'pl' },
  { capability: 'Routing', value: '/fr/a-propos', code: 'fr' },
];

/* ------------------------------------------------------------- surfaces */

export type Sdk = { name: string; pkg: string; install: string };

/** The six first-party stacks, in the order the docs nav lists them. */
export const SDKS: readonly Sdk[] = [
  { name: 'Next.js', pkg: 'gt-next', install: 'npm i gt-next' },
  { name: 'React', pkg: 'gt-react', install: 'npm i gt-react' },
  { name: 'React Native', pkg: 'gt-react-native', install: 'npm i gt-react-native' },
  { name: 'TanStack Start', pkg: 'gt-tanstack-start', install: 'npm i gt-tanstack-start' },
  { name: 'Node.js', pkg: 'gt-node', install: 'npm i gt-node' },
  { name: 'Python', pkg: 'gt-fastapi', install: 'pip install gt-fastapi' },
];

/** The shipped Node.js sample: request-scoped locale on the server. */
export const NODE_SOURCE = {
  file: 'server.ts',
  code: `import { getGT, initializeGT } from 'gt-node';

initializeGT({
  defaultLocale: 'en',
  locales: ['es', 'fr', 'ja', 'de', 'zh'],
});

app.get('/', async (req, res) => {
  const gt = await getGT();
  res.send(gt('Hello, world!'));
});`,
} as const;

export const CONFIG_SOURCE = {
  file: 'gt.config.json',
  code: `{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"],
  "files": {
    "json": { "include": ["public/_gt/[locale].json"] }
  }
}`,
} as const;

/** The CLI locales, the five the config names. */
export const CLI_LOCALES: readonly string[] = ['es', 'fr', 'ja', 'de', 'zh'];

export type GlossaryRow = { term: string; code: string; value: string };

/** The term Vault pinned across three locales. */
export const GLOSSARY: readonly GlossaryRow[] = [
  { term: 'Vault', code: 'de', value: 'Vault' },
  { term: 'Vault', code: 'es', value: 'Vault' },
  { term: 'Vault', code: 'ja', value: 'Vault' },
];

export const GLOSSARY_DIRECTIVE = 'Formal register (Sie) for de';

export type DiffLine = { kind: 'del' | 'add' | 'ctx'; text: string };

/** The Locadex edit: the tree wrapped in <T>. */
export const LOCADEX_DIFF: readonly DiffLine[] = [
  { kind: 'ctx', text: 'export function Receipt() {' },
  { kind: 'del', text: '  return <p>Payment received</p>;' },
  { kind: 'add', text: '  return (' },
  { kind: 'add', text: '    <T>' },
  { kind: 'add', text: '      <p>Payment received</p>' },
  { kind: 'add', text: '    </T>' },
  { kind: 'add', text: '  );' },
  { kind: 'ctx', text: '}' },
];

export type Stat = { value: string; label: string };

export const STATS: readonly Stat[] = [
  { value: '118', label: 'locales, ready today' },
  { value: '6', label: 'first-party SDKs' },
  { value: '<1s', label: 'over-the-air updates' },
  { value: '$0', label: 'to start' },
];

/* ------------------------------------------------------------- material */

export type LocaleRow = { tag: string; name: string; variants: readonly string[] };

/** Four base languages expanded into their regional variants. */
export const LOCALE_ROWS: readonly LocaleRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

/** The two variants whose difference is the tell. */
export const TELL: readonly string[] = ['zh-Hans', 'zh-Hant'];

export const LOCALE_TAIL: readonly { tag: string; name: string }[] = [
  { tag: 'cnr', name: 'Montenegrin' },
  { tag: 'cy', name: 'Welsh' },
];

export const LOCALE_COUNT = '78 base languages, 129 distinct locale tags.';

export type Greeting = { code: string; text: string; lang: string; name: string; rtl?: boolean };

/** Eighteen scripts, each greeting named in its own language. */
export const GREETINGS: readonly Greeting[] = [
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
  { code: 'sv', text: 'Hej', lang: 'sv', name: 'svenska' },
  { code: 'id', text: 'Halo', lang: 'id', name: 'Bahasa Indonesia' },
];

/* --------------------------------------------------------------- review */

export type ReviewRow = {
  key: string;
  source: string;
  translation: string;
  /** The struck previous translation on the regenerated row. */
  previous?: string;
  final: 'approved' | 'edit';
};

/** Four real rows, source beside its Spanish translation. */
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

export const REVIEW_BAR = { workspace: 'workspace · es-419', count: '4 strings' } as const;

export const REVIEW_FOOT: readonly string[] = ['⌘K search', 'history', 'download'];

export const REVIEW_AGENT = 'agent · locadex';

/* ---------------------------------------------------------------- plaza */

export type TraceRow = { time: string; stage: string; value: string; code?: string };

/** One commit's journey, timestamped. */
export const TRACE: readonly TraceRow[] = [
  { time: '09:41:02', stage: 'committed', value: 'app/page.tsx' },
  { time: '09:41:18', stage: 'extracted', value: 'hash 0f3a92' },
  { time: '09:41:44', stage: 'pr opened', value: 'locadex · #218' },
  { time: '09:42:03', stage: 'translated', value: '6 locales · 3.4 s' },
  { time: '09:44:37', stage: 'approved', value: 'review · @mira' },
  { time: '09:45:01', stage: 'published', value: 'edge · 3 regions' },
  { time: '09:45:09', stage: 'rendered', value: '38 ms', code: 'de' },
];

export const CLI_SESSION = {
  command: '$ npx gt translate',
  summary: '128 strings · 3 new · 2 changed',
  result: '640 translations · 6 locales',
} as const;

export type ContextStep = { level: string; rule: string; sample: string };

/** Context defined once at the top, inherited by every level below. */
export const CONTEXT_STEPS: readonly ContextStep[] = [
  {
    level: 'Organization',
    rule: 'Glossary and tone set once.',
    sample: 'Locadex is the GT agent. Do not translate.',
  },
  {
    level: 'Project',
    rule: 'Locales and files per project.',
    sample: 'locales: es, fr, ja, de, zh',
  },
  {
    level: 'Component',
    rule: 'One attribute reaches the agent.',
    sample: '<T context="Playful, upbeat tone">',
  },
];

/* -------------------------------------------------------------- pricing */

export type Rate = { workflow: string; rate: string; gtLibs?: string };

/** The published rate ledger. These are the only rates on the page. */
export const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens' },
  { workflow: 'Project context surcharge', rate: '+$0.10 / 10k tokens per 500 tokens of context' },
  { workflow: 'Locadex', rate: '$5 / LCU' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits' },
];

export const PRICING_HEAD = 'Start at $0. Pay per token.';
export const PRICING_SUB = 'The price of a translation is knowable before you run it.';

export const FOOTNOTE_LIMIT = 'A Usage Limit is a hard cap. It blocks billing even with auto-reload on.';
export const FOOTNOTE_DRY_RUN_CMD = 'npx gt translate --dry-run';
export const FOOTNOTE_DRY_RUN = 'prints what would be translated and bills 0 tokens.';

export type Plan = {
  name: string;
  price: string;
  cadence: string;
  copy: string;
  items: readonly string[];
  cta: string;
  href: string;
  solid: boolean;
};

export const PLANS: readonly Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    cadence: 'per month',
    copy: 'Unlimited users, projects and languages. Editor, GitHub integration and Locadex included. Minimum top-up $10.',
    items: [
      'Every SDK and the translation CLI',
      'Dashboard, glossaries, and the editor',
      'Locadex agent runs on your repo',
    ],
    cta: 'Get Started',
    href: LINKS.starterPlan,
    solid: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'annual',
    copy: 'Forward-deployed engineers, custom workflows for any format or framework, shared context across projects.',
    items: [
      'SSO, RBAC, webhooks, custom SLA',
      'SOC 2 Type II, GDPR, ISO 27001',
      'Support from the engineers who build it',
    ],
    cta: 'Contact Us',
    href: LINKS.demo,
    solid: false,
  },
];

export const COMPARE_LABEL = 'Compare Plans and Usage Pricing';

/* --------------------------------------------------------------- footer */

export type FooterLink = { label: string; href: string };

export type FooterColumn = { title: string; links: readonly FooterLink[] };

const SITE = 'https://generaltranslation.com';

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: LINKS.docs },
      { label: 'Next.js', href: LINKS.docs },
      { label: 'React', href: LINKS.docs },
      { label: 'React Native', href: LINKS.docs },
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
      { label: 'Careers', href: `${SITE}/careers` },
      { label: 'Contact', href: `${SITE}/contact` },
      { label: 'GitHub', href: LINKS.github },
      { label: 'Discord', href: LINKS.discord },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: `${SITE}/legal/terms` },
      { label: 'Privacy', href: `${SITE}/legal/privacy-policy` },
      { label: 'Acceptable Use', href: `${SITE}/legal/acceptable-use` },
      { label: 'Manage Cookies', href: '#' },
    ],
  },
];

export const FOOTER_SENTENCE =
  'General Translation builds full-stack infrastructure for localizing apps, docs, and websites.';

export const COPYRIGHT = '© 2026 General Translation, Inc. All rights reserved.';

export const COMPLIANCE = 'SOC 2 Type II · GDPR · ISO 27001';
