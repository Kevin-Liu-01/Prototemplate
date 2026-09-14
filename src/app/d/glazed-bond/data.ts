/**
 * glazed-bond: the page's content, gathered from the shipped data files.
 *
 * Every string here is either a shipped line (production HomeHero,
 * dither-field Pricing, Locales, ReviewWorkspace, SiteFooter, the story
 * beats) or a plain sentence written in the same register. Numbers are the
 * charter's allowed figures only. Nothing is ancient text presented as a
 * translation; the living material is the modern strings with their tags.
 */

export type Shaped = { text: string; lang: string; dir?: 'rtl' | 'ltr' };

/* ------------------------------------------------------------------ *
 * Destinations
 * ------------------------------------------------------------------ */

export const URLS = {
  getStarted: 'https://dash.generaltranslation.com/en-US/signin',
  starterPlan: 'https://dash.generaltranslation.com/en-US/signin?selected_plan=tier1',
  demo: 'https://generaltranslation.com/enterprise/contact',
  docs: 'https://generaltranslation.com/docs',
  pricing: 'https://generaltranslation.com/pricing',
  usage: 'https://generaltranslation.com/pricing/usage',
  blog: 'https://generaltranslation.com/blog',
  enterprise: 'https://generaltranslation.com/enterprise',
  locales: 'https://generaltranslation.com/locales',
  careers: 'https://generaltranslation.com/careers',
  contact: 'https://generaltranslation.com/contact',
  github: 'https://github.com/generaltranslation',
  discord: 'https://discord.gg/generaltranslation',
  terms: 'https://generaltranslation.com/legal/terms',
  privacy: 'https://generaltranslation.com/legal/privacy-policy',
  acceptableUse: 'https://generaltranslation.com/legal/acceptable-use',
} as const;

export const NAV_LINKS: readonly { label: string; href: string }[] = [
  { label: 'Docs', href: URLS.docs },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: URLS.blog },
  { label: 'Enterprise', href: URLS.enterprise },
];

/* ------------------------------------------------------------------ *
 * The claim roster: "Scale to every language" in the sixteen shipped
 * locales of production HomeHero. The hero morphs through all of them;
 * the bond wall lays the source and thirteen of them as bricks.
 * ------------------------------------------------------------------ */

export const CLAIMS: readonly Shaped[] = [
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

/** The bricks of the T proof: the source, then the translations laid beside it. */
export const SOURCE_CLAIM: Shaped = CLAIMS[0] ?? { text: 'Scale to every language', lang: 'en' };

const WALL_LOCALES = ['es', 'ja', 'de', 'ko', 'fr', 'zh', 'pt', 'ru', 'it', 'hi', 'nl', 'tr', 'pl'];

export const WALL_TRANSLATIONS: readonly Shaped[] = WALL_LOCALES.flatMap((lang) => {
  const hit = CLAIMS.find((row) => row.lang === lang);
  return hit ? [hit] : [];
});

/* ------------------------------------------------------------------ *
 * Languages as material: one rosette medallion per locale, the endonym
 * from the shipped locales fixture at its center. Every code here has a
 * flag in the shared LocaleTag map, so the chips stay uniform.
 * ------------------------------------------------------------------ */

export type Medallion = Shaped & { code: string; name: string };

export const MEDALLIONS_TOP: readonly Medallion[] = [
  { code: 'ja', name: 'Japanese', text: '日本語', lang: 'ja' },
  { code: 'ko', name: 'Korean', text: '한국어', lang: 'ko' },
  { code: 'zh', name: 'Chinese', text: '中文', lang: 'zh' },
  { code: 'ar', name: 'Arabic', text: 'العربية', lang: 'ar', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', text: 'हिन्दी', lang: 'hi' },
  { code: 'he', name: 'Hebrew', text: 'עברית', lang: 'he', dir: 'rtl' },
  { code: 'th', name: 'Thai', text: 'ไทย', lang: 'th' },
];

export const MEDALLIONS_BOTTOM: readonly Medallion[] = [
  { code: 'el', name: 'Greek', text: 'Ελληνικά', lang: 'el' },
  { code: 'ru', name: 'Russian', text: 'русский', lang: 'ru' },
  { code: 'tr', name: 'Turkish', text: 'Türkçe', lang: 'tr' },
  { code: 'es', name: 'Spanish', text: 'español', lang: 'es' },
  { code: 'fr', name: 'French', text: 'français', lang: 'fr' },
  { code: 'de', name: 'German', text: 'Deutsch', lang: 'de' },
];

/** The variants register (dither-field Locales ROWS): the tell is zh-Hans beside zh-Hant. */
export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANT_ROWS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export const TELL_VARIANTS: readonly string[] = ['zh-Hans', 'zh-Hant'];

export const VARIANT_TAIL: readonly { tag: string; name: string }[] = [
  { tag: 'cnr', name: 'Montenegrin' },
  { tag: 'cy', name: 'Welsh' },
];

export const VARIANT_COUNT = '78 base languages, 129 distinct locale tags.';

/* ------------------------------------------------------------------ *
 * The inner court: the four product surfaces as tablets.
 * ------------------------------------------------------------------ */

export const PACKAGES: readonly string[] = [
  'gt-next',
  'gt-react',
  'gt-react-native',
  'gt-tanstack-start',
  'gt-node',
  'gt-fastapi',
];

/** Real outputs from the shipped capability table, the thing rather than the word. */
export const OUTPUTS: readonly { label: string; value: string }[] = [
  { label: 'Numbers', value: '1.234.567,89' },
  { label: 'Currencies', value: '1.280,00 €' },
  { label: 'Plurals', value: '1 plik · 4 pliki' },
  { label: 'Routing', value: '/fr/a-propos' },
];

export const CLI_LOCALES: readonly string[] = ['es', 'fr', 'ja', 'de', 'zh'];

export type ReviewRow = {
  key: string;
  source: string;
  translation: string;
  previous?: string;
  state: 'approved' | 'edit';
};

/** The four real rows of the review workspace. */
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

export const LOCADEX_FINDINGS: readonly string[] = [
  'unwrapped copy',
  'hand-rolled date',
  'unbuilt label',
];

export const LOCADEX_DIFF: readonly { sign: '+' | '-'; line: string }[] = [
  { sign: '+', line: '<T>' },
  { sign: '+', line: '<DateTime>' },
  { sign: '-', line: 'toLocaleDateString()' },
];

/* ------------------------------------------------------------------ *
 * The ziggurat: nine beats, each rewritten without dashes.
 * ------------------------------------------------------------------ */

export type Beat = { n: number; title: string; body: string; annot: string };

export const BEATS: readonly Beat[] = [
  {
    n: 1,
    title: 'GT reads the page you already wrote.',
    body: 'Every text node is picked up where it stands: nav label, heading, body copy, button, legal line, with the markup around it as its context.',
    annot: '128 strings · 6 locales · context attached',
  },
  {
    n: 2,
    title: 'It translates in place.',
    body: 'The strings come back in Spanish and every container re-measures itself. Nothing is re-laid out by hand; the layout absorbs the new lengths.',
    annot: 'es · translated in place · re-measured',
  },
  {
    n: 3,
    title: 'Around any component.',
    body: 'The button is JSX wrapped in <T>. GT extracts the label, ships the locale build, and the button widens to hold whatever came back.',
    annot: '<T><button>Get started</button></T>',
  },
  {
    n: 4,
    title: 'In the voice you asked for.',
    body: 'A context attribute goes straight to the translation agent. Same source string, different register. The heading lands in the tone you wrote for.',
    annot: '<T context="Playful, upbeat tone">',
  },
  {
    n: 5,
    title: 'With your review, where it matters.',
    body: 'A node marked requires review fires a webhook instead of shipping. Legal reads the Spanish, approves it, and only then does it go live.',
    annot: 'webhook → legal counsel · approved',
  },
  {
    n: 6,
    title: 'Then the code moves.',
    body: 'A commit triggers the workflow and Locadex reads the file that changed. Not a diff of strings, the source that produced them.',
    annot: 'push → workflow · locadex scans app/page.tsx',
  },
  {
    n: 7,
    title: 'Locadex maps what changed.',
    body: 'Three findings land on the exact lines that need work: copy that was never wrapped, a date formatted by hand, a label with no locale build.',
    annot: 'unwrapped copy · hand-rolled date · unbuilt label',
  },
  {
    n: 8,
    title: 'It edits, then translates in context.',
    body: 'The agent wraps the tree in <T>, swaps the hand-rolled date for <DateTime>, and writes the translations against the file it just read.',
    annot: '+ <T> · + <DateTime> · - toLocaleDateString()',
  },
  {
    n: 9,
    title: 'And opens the pull request.',
    body: 'One PR, six locales, a diff you can read. Review it like any other change. Merge, and the site is live in every language.',
    annot: 'PR #218 · 6 locales · merged',
  },
];

/* ------------------------------------------------------------------ *
 * The pricing file: the only rates that may appear anywhere.
 * ------------------------------------------------------------------ */

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
  cap: 'A Usage Limit is a hard cap. It blocks billing even with auto-reload on.',
  dryRunCommand: 'npx gt translate --dry-run',
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
    items: [
      'Every SDK and the translation CLI',
      'Dashboard, glossaries, and the editor',
      'Locadex agent runs on your repo',
    ],
    cta: 'Get Started',
    href: URLS.starterPlan,
    solid: true,
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
    cta: 'Contact Us',
    href: URLS.demo,
    solid: false,
  },
];

/* ------------------------------------------------------------------ *
 * Trust: the six customer marks, monochrome, as SVG masks.
 * ------------------------------------------------------------------ */

export type Customer = { name: string; mark: string; aspect: number };

export const CUSTOMERS: readonly Customer[] = [
  { name: 'Cursor', mark: 'cursor', aspect: 739 / 186 },
  { name: 'Ramp', mark: 'ramp', aspect: 644 / 171 },
  { name: 'Mintlify', mark: 'mintlify', aspect: 2191 / 484 },
  { name: 'Profound', mark: 'profound', aspect: 166 / 28 },
  { name: 'Partiful', mark: 'partiful', aspect: 204 / 46 },
  { name: 'ClickHouse', mark: 'clickhouse', aspect: 649 / 198 },
];

export const TRUST_LEAD = 'Cursor, Ramp and Profound ship in over thirty languages';

/* ------------------------------------------------------------------ *
 * The foundation: footer columns with the real links.
 * ------------------------------------------------------------------ */

export type FooterLink = { label: string; href: string; mark?: 'locadex' | 'next' | 'react' | 'github' | 'discord' };

export const FOOTER_COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: URLS.docs, mark: 'locadex' },
      { label: 'Next.js', href: URLS.docs, mark: 'next' },
      { label: 'React', href: URLS.docs, mark: 'react' },
      { label: 'React Native', href: URLS.docs, mark: 'react' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: URLS.docs },
      { label: 'Blog', href: URLS.blog },
      { label: 'Pricing', href: URLS.pricing },
      { label: 'Supported Locales', href: URLS.locales },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers', href: URLS.careers },
      { label: 'Contact', href: URLS.contact },
      { label: 'GitHub', href: URLS.github, mark: 'github' },
      { label: 'Discord', href: URLS.discord, mark: 'discord' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: URLS.terms },
      { label: 'Privacy', href: URLS.privacy },
      { label: 'Acceptable Use', href: URLS.acceptableUse },
      { label: 'Manage Cookies', href: '#' },
    ],
  },
];

export const FOOTER_LINE = "End-to-end localization for the world's best companies.";
export const COPYRIGHT = '© 2026 General Translation, Inc. All rights reserved.';
export const COMPLIANCE = 'SOC 2 Type II · GDPR · ISO 27001';
