/**
 * textile-block: the content cast into the wall. Pure data, no JSX.
 *
 * Every string here is the shipped one or a transcription of a data file the
 * charter names (stacks.ts FRAMEWORKS and CAP_DEMOS, Pricing.tsx RATES,
 * Locales.tsx ROWS, fields.ts HELLOS, Hero.tsx EVERY and CUSTOMERS,
 * ReviewWorkspace.tsx ROWS, Bento.tsx CONFIG and TRANSLATE_RUN,
 * pricing-links.ts, the V0Footer link roster). Nothing is invented except
 * the "Hello, world!" localizations, which are the conventional renderings
 * of that sentence and are marked as product output samples.
 */

/* ------------------------------------------------------------------------ *
 * The hero claim: the word "language" across scripts (Hero.tsx EVERY).
 * One shaped text node, lang and dir carried on the node.
 * ------------------------------------------------------------------------ */

export type EveryWord = { text: string; lang: string; rtl?: boolean };

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

/* ------------------------------------------------------------------------ *
 * Languages as material: one greeting per script (fields.ts HELLOS), with
 * the name of the script the block is cast in.
 * ------------------------------------------------------------------------ */

export type Greeting = { text: string; tag: string; script: string; rtl?: boolean };

export const GREETINGS: readonly Greeting[] = [
  { text: 'hello', tag: 'en', script: 'Latin' },
  { text: 'hola', tag: 'es', script: 'Latin' },
  { text: 'こんにちは', tag: 'ja', script: 'Hiragana' },
  { text: 'bonjour', tag: 'fr', script: 'Latin' },
  { text: '你好', tag: 'zh', script: 'Han' },
  { text: 'hallo', tag: 'de', script: 'Latin' },
  { text: '안녕하세요', tag: 'ko', script: 'Hangul' },
  { text: 'مرحبا', tag: 'ar', script: 'Arabic', rtl: true },
  { text: 'привет', tag: 'ru', script: 'Cyrillic' },
  { text: 'नमस्ते', tag: 'hi', script: 'Devanagari' },
  { text: 'olá', tag: 'pt', script: 'Latin' },
];

/* ------------------------------------------------------------------------ *
 * The T proof: the source string and its rendered output per locale. The
 * exclamation marks are the product output itself, the one place the copy
 * register allows them. `¡Hola, mundo!` and `こんにちは世界！` are the
 * repository's own samples; the rest are the conventional renderings.
 * ------------------------------------------------------------------------ */

export type CastString = { text: string; tag: string; rtl?: boolean };

export const HELLO_WORLD: readonly CastString[] = [
  { text: '¡Hola, mundo!', tag: 'es' },
  { text: 'Bonjour, le monde !', tag: 'fr' },
  { text: 'Hallo, Welt!', tag: 'de' },
  { text: 'こんにちは世界！', tag: 'ja' },
  { text: '你好，世界！', tag: 'zh' },
  { text: '안녕하세요, 세계!', tag: 'ko' },
  { text: 'مرحبا بالعالم!', tag: 'ar', rtl: true },
  { text: 'Olá, mundo!', tag: 'pt' },
  { text: 'Привет, мир!', tag: 'ru' },
  { text: 'नमस्ते, दुनिया!', tag: 'hi' },
  { text: 'Ciao, mondo!', tag: 'it' },
  { text: 'Hallo, wereld!', tag: 'nl' },
];

/* The formatted values the same tree renders per locale (stacks.ts
   CAP_DEMOS, verbatim): the capability name, the locale, and the output. */
export type Format = { cap: string; tag: string; out: string };

export const FORMATS: readonly Format[] = [
  { cap: 'Numbers', tag: 'de', out: '1.234.567,89' },
  { cap: 'Currencies', tag: 'de', out: '1.280,00 €' },
  { cap: 'Plurals', tag: 'pl', out: '1 plik · 4 pliki' },
  { cap: 'Routing', tag: 'fr', out: '/fr/a-propos' },
];

/* ------------------------------------------------------------------------ *
 * Libraries: the six first-party stacks (stacks.ts FRAMEWORKS), the fields
 * the ledger prints. The Next.js sample is the one the source block casts.
 * ------------------------------------------------------------------------ */

export type Library = {
  id: string;
  name: string;
  pkg: string;
  file: string;
  install: string;
};

export const LIBRARIES: readonly Library[] = [
  { id: 'next', name: 'Next.js', pkg: 'gt-next', file: 'app/page.tsx', install: 'npm i gt-next' },
  { id: 'react', name: 'React', pkg: 'gt-react', file: 'src/Home.tsx', install: 'npm i gt-react' },
  {
    id: 'react-native',
    name: 'React Native',
    pkg: 'gt-react-native',
    file: 'app/index.tsx',
    install: 'npm i gt-react-native',
  },
  {
    id: 'tanstack',
    name: 'TanStack Start',
    pkg: 'gt-tanstack-start',
    file: 'src/routes/index.tsx',
    install: 'npm i gt-tanstack-start',
  },
  { id: 'node', name: 'Node.js', pkg: 'gt-node', file: 'server.ts', install: 'npm i gt-node' },
  { id: 'python', name: 'Python', pkg: 'gt-fastapi', file: 'app.py', install: 'pip install gt-fastapi' },
];

export const SOURCE_FILE = 'app/page.tsx';
export const SOURCE_PKG = 'gt-next';
export const SOURCE_INSTALL: readonly [string, string] = ['npm i gt-next', 'npx gt@latest'];

/* ------------------------------------------------------------------------ *
 * The CLI object: the config the run reads (Bento.tsx CONFIG, verbatim, as
 * marked tokens so the locale strings carry the string hue) and the run
 * itself (Bento.tsx TRANSLATE_RUN, dashes rewritten as middle dots). The
 * five locales the config names are the five chips the run writes.
 * ------------------------------------------------------------------------ */

export type ConfigKind = 'p' | 'k' | 's';
export type ConfigToken = readonly [ConfigKind, string];

export const CONFIG_FILE = 'gt.config.json';

export const CONFIG: readonly (readonly ConfigToken[])[] = [
  [['p', '{']],
  [['p', '  '], ['k', '"defaultLocale"'], ['p', ': '], ['s', '"en"'], ['p', ',']],
  [
    ['p', '  '],
    ['k', '"locales"'],
    ['p', ': ['],
    ['s', '"es"'],
    ['p', ', '],
    ['s', '"fr"'],
    ['p', ', '],
    ['s', '"ja"'],
    ['p', ', '],
    ['s', '"de"'],
    ['p', ', '],
    ['s', '"zh"'],
    ['p', '],'],
  ],
  [['p', '  '], ['k', '"files"'], ['p', ': {']],
  [['p', '    '], ['k', '"gt"'], ['p', ': {']],
  [['p', '      '], ['k', '"output"'], ['p', ': '], ['s', '"public/_gt/[locale].json"']],
  [['p', '    },']],
  [['p', '    '], ['k', '"json"'], ['p', ': {']],
  [['p', '      '], ['k', '"include"'], ['p', ': ['], ['s', '"content/[locale]/*.json"'], ['p', ']']],
  [['p', '    }']],
  [['p', '  }']],
  [['p', '}']],
];

export const CLI_COMMAND = 'npx gt translate';
export const CLI_SCAN = 'Scanning src · 128 strings found';
export const CLI_LOCALES: readonly string[] = ['es', 'fr', 'ja', 'de', 'zh'];
export const CLI_OUTPUT = (tag: string) => `public/_gt/${tag}.json`;
export const CLI_DONE = 'Done · 640 translations · served from the edge';

/* ------------------------------------------------------------------------ *
 * The review workspace rows (ReviewWorkspace.tsx ROWS).
 * ------------------------------------------------------------------------ */

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

export const WORKSPACE_BAR: readonly [string, string] = ['workspace · es-419', '4 strings'];
export const WORKSPACE_FOOT: readonly string[] = ['⌘K search', 'history', 'download', 'agent · locadex'];

/* The Locadex trace: one run, sharing PR #218 with the shipped band. */
export const TRACE: readonly (readonly [string, string])[] = [
  ['push', 'workflow'],
  ['scan', 'app/page.tsx'],
  ['edit', '<T> · <DateTime>'],
  ['PR #218', '6 locales · merged'],
];

/* ------------------------------------------------------------------------ *
 * The locales atlas rows (Locales.tsx ROWS) and the count line.
 * ------------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------------ *
 * The trust course (Hero.tsx CUSTOMERS, Customers.tsx hrefs). Marks are the
 * monochrome SVGs in public/logos, printed through a mask in the page ink.
 * ------------------------------------------------------------------------ */

export type Customer = { id: string; name: string; href: string; ratio: number };

export const CUSTOMERS: readonly Customer[] = [
  { id: 'cursor', name: 'Cursor', href: 'https://cursor.com', ratio: 739 / 186 },
  { id: 'ramp', name: 'Ramp', href: 'https://ramp.com', ratio: 643.93 / 170.94 },
  { id: 'mintlify', name: 'Mintlify', href: 'https://mintlify.com', ratio: 2191 / 484 },
  { id: 'profound', name: 'Profound', href: 'https://tryprofound.com', ratio: 166 / 28 },
  { id: 'partiful', name: 'Partiful', href: 'https://partiful.com', ratio: 204 / 46 },
  { id: 'clickhouse', name: 'ClickHouse', href: 'https://clickhouse.com', ratio: 649.3 / 198.3 },
];

/* ------------------------------------------------------------------------ *
 * The pricing file (Pricing.tsx RATES, the two footnotes, the plans, and
 * pricing-links.ts PLAN_CTAS). These are the only rates that may appear.
 * ------------------------------------------------------------------------ */

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

export const DRY_RUN_COMMAND = 'npx gt translate --dry-run';
export const DRY_RUN_NOTE = 'prints what would be translated and bills 0 tokens.';

export const PLAN_CTAS = {
  starter: 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1',
  enterpriseContact: 'https://generaltranslation.com/enterprise/contact',
} as const;

export type Plan = {
  id: string;
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
    id: 'starter',
    name: 'Starter',
    price: '$0',
    cadence: 'per month',
    copy: 'Unlimited users, projects and languages. Editor, GitHub integration and Locadex included. Minimum top-up $10.',
    items: ['Every SDK and the translation CLI', 'Dashboard, glossaries, and the editor', 'Locadex agent runs on your repo'],
    cta: 'Get Started',
    href: PLAN_CTAS.starter,
    solid: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'annual',
    copy: 'Forward-deployed engineers, custom workflows for any format or framework, shared context across projects.',
    items: ['SSO, RBAC, webhooks, custom SLA', 'SOC 2 Type II, GDPR, ISO 27001', 'Support from the engineers who build it'],
    cta: 'Contact Us',
    href: PLAN_CTAS.enterpriseContact,
    solid: false,
  },
];

/* ------------------------------------------------------------------------ *
 * Destinations. The primary CTA points at the product, never an in-page hop.
 * ------------------------------------------------------------------------ */

const LIVE = 'https://generaltranslation.com';

export const LINKS = {
  signIn: 'https://dash.generaltranslation.com/en-US/signin',
  getStarted: 'https://dash.generaltranslation.com/en-US/signin',
  demo: `${LIVE}/enterprise/contact`,
  docs: `${LIVE}/docs`,
  pricing: `${LIVE}/pricing`,
  blog: `${LIVE}/blog`,
  enterprise: `${LIVE}/enterprise`,
  locales: `${LIVE}/locales`,
  careers: `${LIVE}/careers`,
  contact: `${LIVE}/contact`,
  github: 'https://github.com/generaltranslation',
  discord: 'https://discord.gg/generaltranslation',
  terms: `${LIVE}/legal/terms`,
  privacy: `${LIVE}/legal/privacy-policy`,
  acceptableUse: `${LIVE}/legal/acceptable-use`,
} as const;

export const INSTALL_COMMAND = 'npx gt@latest';

/* ------------------------------------------------------------------------ *
 * The footer roster (SiteFooter.tsx COLUMNS with V0Footer's destinations).
 * ------------------------------------------------------------------------ */

export type FooterMark = 'locadex' | 'next' | 'react' | 'github' | 'discord';

export type FooterLink = { label: string; href: string; mark?: FooterMark };

export const FOOTER_COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
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
      { label: 'Manage Cookies', href: '#top' },
    ],
  },
];

export const FOOTER_LEAD = "End-to-end localization for the world's best companies.";
export const FOOTER_COPYRIGHT = '© 2026 General Translation, Inc. All rights reserved.';
export const FOOTER_COMPLIANCE = 'SOC 2 Type II · GDPR · ISO 27001';

/* ------------------------------------------------------------------------ *
 * The shadowed course: the stack as a ziggurat, bottom course to top
 * platform, and the shade the upper wall casts across the top of the course.
 * ------------------------------------------------------------------------ */

export type Tier = { name: string; fact: string; cover: number };

/** Top platform first. `cover` is the Bayer coverage of the lit face, k/16:
    light falls from above, so the top tier is the most lit. */
export const TIERS: readonly Tier[] = [
  { name: 'Locadex', fact: 'reads the changed file, opens the PR', cover: 10 },
  { name: 'Review', fact: 'editor, branches, webhooks, approval', cover: 7 },
  { name: 'Translations', fact: 'negotiated per request, edge-served', cover: 5 },
  { name: 'Context', fact: 'glossary, prompts, context groups', cover: 3 },
  { name: 'Libraries', fact: 'six first-party SDKs, one provider', cover: 2 },
];

/** The shade ramp, top strip first: Bayer coverage k/16, densest under the wall. */
export const SHADE_STEPS: readonly number[] = [16, 14, 12, 10, 8, 6, 4, 2];

/* ------------------------------------------------------------------------ *
 * The materials legend: the five colors of the wall, each named for the
 * material it stands for and the token that carries it.
 * ------------------------------------------------------------------------ */

export type MaterialId = 'ground' | 'face' | 'relief' | 'accent' | 'jade';

export type Material = { id: MaterialId; name: string; token: string; role: string };

export const MATERIALS: readonly Material[] = [
  { id: 'ground', name: 'Cast concrete', token: '--deco-ground', role: 'The patterned face. The ground of the wall.' },
  { id: 'face', name: 'Smooth face', token: '--tb-cast-face', role: 'The content face, cast one step lighter.' },
  { id: 'relief', name: 'Moss', token: '--deco-ornament', role: 'The relief. Lichen in the recesses of the blocks.' },
  { id: 'accent', name: 'Terracotta', token: '--deco-accent', role: 'The live string, and nothing else.' },
  { id: 'jade', name: 'Jade', token: '--tb-dk-ground', role: 'The shadowed course. It does not remap.' },
];
