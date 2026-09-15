/**
 * calendar-rings: the page's real content, gathered in one place.
 *
 * Every string here is shipped copy or shipped data: the headline roster
 * from the production home, the translated outputs from the hero window's
 * session, the review rows, the capability outputs of the frameworks
 * window, the nine story beats, the published rate ledger, the six
 * customers and the footer's destinations. Nothing is invented; the
 * sections only arrange these into rings, and the disk's rings read them.
 */
import { CAP_DEMOS } from '@/app/d/dither-field/sections/stacks';
import { BEATS, RAIL } from '@/app/d/dither-field/sections/story/beats';
import { SUPPORTED_LOCALES } from '@/app/d/production/sections/locales-data';
import type { LocaleProperties } from '@/app/d/production/sections/locales-data';
import { PLAN_CTAS } from '@/app/d/production/sections/pricing-links';
import { PRIVACY_URL, TERMS_URL } from '@/app/d/production/sections/site-links';

/** One shaped text node: the string, its language, its direction. */
export type Word = { text: string; lang: string; dir: 'ltr' | 'rtl' };

/** The headline roster of the production home, "Scale to every language" in the shipped locales. */
export const CLAIM_WORDS: readonly Word[] = [
  { text: 'Scale to every language', lang: 'en', dir: 'ltr' },
  { text: 'Crece en todos los idiomas', lang: 'es', dir: 'ltr' },
  { text: 'あらゆる言語に展開', lang: 'ja', dir: 'ltr' },
  { text: 'In jeder Sprache wachsen', lang: 'de', dir: 'ltr' },
  { text: '모든 언어로 확장하세요', lang: 'ko', dir: 'ltr' },
  { text: 'Passez au multilingue, sans limite', lang: 'fr', dir: 'ltr' },
  { text: '让产品说每一种语言', lang: 'zh', dir: 'ltr' },
  { text: 'Cresça em todos os idiomas', lang: 'pt', dir: 'ltr' },
  { text: 'हर भाषा में आगे बढ़ें', lang: 'hi', dir: 'ltr' },
  { text: 'Rośnij w każdym języku', lang: 'pl', dir: 'ltr' },
];

/** Every destination the page links to. The primary CTAs point at the product, never at an in-page hop. */
export const HREFS = {
  getStarted: 'https://dash.generaltranslation.com/en-US/signin',
  signIn: 'https://dash.generaltranslation.com/en-US/signin',
  demo: 'https://generaltranslation.com/enterprise/contact',
  docs: 'https://generaltranslation.com/docs',
  pricing: 'https://generaltranslation.com/pricing',
  blog: 'https://generaltranslation.com/blog',
  enterprise: 'https://generaltranslation.com/enterprise',
  locales: 'https://generaltranslation.com/locales',
  careers: 'https://generaltranslation.com/careers',
  contact: 'https://generaltranslation.com/contact',
  github: 'https://github.com/generaltranslation',
  discord: 'https://discord.gg/generaltranslation',
  terms: TERMS_URL,
  privacy: PRIVACY_URL,
  acceptableUse: 'https://generaltranslation.com/legal/acceptable-use',
  starterPlan: PLAN_CTAS.starter,
  enterprisePlan: PLAN_CTAS.enterpriseContact,
} as const;

/** The command the hero offers to copy. */
export const INSTALL_COMMAND = 'npx gt@latest';

/* ------------------------------------------------------------------ *
 * The disk's rings. Each ring of the instrument reads one of these lists,
 * and one section later on the page unrolls it.
 * ------------------------------------------------------------------ */

/** Ring two: the four surfaces of the product, in the order the stack section shows them. */
export type Surface = { id: 'libraries' | 'cli' | 'dashboard' | 'locadex'; label: string };

export const SURFACES: readonly Surface[] = [
  { id: 'libraries', label: 'libraries' },
  { id: 'cli', label: 'gt cli' },
  { id: 'dashboard', label: 'dashboard' },
  { id: 'locadex', label: 'locadex' },
];

/** Ring four: the twenty locales of the outer ring, in two rows of ten. Each resolves to its endonym from the roster. */
export const RING_LOCALES: readonly (readonly string[])[] = [
  ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'sv', 'tr'],
  ['ru', 'el', 'ar', 'he', 'hi', 'th', 'id', 'ja', 'ko', 'zh'],
];

/** The outer ring flattened, in reading order from the top of the disk. */
export const OUTER_RING: readonly string[] = RING_LOCALES.flat();

/** How to read the disk, one row per ring from the center out. `n` is the ring's count as a bar-and-dot numeral; 0 is the hub. */
export type KeyRow = { n: number; ring: string; what: string };

export const DISK_KEY: readonly KeyRow[] = [
  { n: 0, ring: 'Hub', what: 'the source string' },
  { n: 1, ring: 'Ring one', what: 'the name' },
  { n: SURFACES.length, ring: 'Ring two', what: 'the surfaces' },
  { n: 7, ring: 'Ring three', what: 'the usage rates' },
  { n: OUTER_RING.length, ring: 'Ring four', what: 'the locales' },
  { n: OUTER_RING.length, ring: 'Rim', what: 'one notch per locale' },
];

/* ------------------------------------------------------------------ *
 * The customers
 * ------------------------------------------------------------------ */

/**
 * The six customers of the trust strip, with the geometry of their wordmarks
 * (the SVG files under public/logos, cap-height aligned by height).
 */
export type Customer = { id: string; name: string; href: string; height: number; aspect: number };

export const CUSTOMERS: readonly Customer[] = [
  { id: 'cursor', name: 'Cursor', href: 'https://cursor.com', height: 23, aspect: 739 / 186 },
  { id: 'ramp', name: 'Ramp', href: 'https://ramp.com', height: 15.5, aspect: 643.93 / 170.94 },
  { id: 'mintlify', name: 'Mintlify', href: 'https://mintlify.com', height: 16.5, aspect: 2191 / 484 },
  { id: 'profound', name: 'Profound', href: 'https://tryprofound.com', height: 14.5, aspect: 166 / 28 },
  { id: 'partiful', name: 'Partiful', href: 'https://partiful.com', height: 17.5, aspect: 204 / 46 },
  { id: 'clickhouse', name: 'ClickHouse', href: 'https://clickhouse.com', height: 18, aspect: 600 / 110 },
];

/* ------------------------------------------------------------------ *
 * The T component
 * ------------------------------------------------------------------ */

/** One translated output of the hero window's session, tagged with its locale. */
export type Output = { loc: string; text: string };

/** The two source strings of the shipped hero session and their outputs, in the session's locale order. */
export type ProofRow = { source: string; outputs: readonly Output[] };

export const PROOF_ROWS: readonly ProofRow[] = [
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

/** The source sample: the shipped Next.js sample's T wrapper around the session's two strings. */
export const PROOF_CODE = `import { T } from 'gt-next';

export default function Home() {
  return (
    <T>
      <h1>Hello, world!</h1>
      <p>Get started</p>
    </T>
  );
}`;

/* ------------------------------------------------------------------ *
 * The stack: four surfaces as concrete objects, and the pipeline
 * ------------------------------------------------------------------ */

/** The four rows of the review workspace, source beside its Spanish translation. */
export type ReviewRow = { source: string; translation: string };

export const REVIEW_ROWS: readonly ReviewRow[] = [
  { source: 'Hello, world!', translation: '¡Hola, mundo!' },
  { source: 'Launch in every language', translation: 'Lanza en todos los idiomas' },
  {
    source: "End-to-end localization for the world's best companies",
    translation: 'Localización integral para las mejores empresas del mundo.',
  },
  {
    source: 'By continuing you agree to our Terms of Service.',
    translation: 'Al continuar, aceptas nuestros Términos de Servicio.',
  },
];

/** The six first-party libraries, in the order the docs list them, with the two commands that install each. */
export type Library = { name: string; pkg: string; install: readonly [string, string] };

export const LIBRARIES: readonly Library[] = [
  { name: 'Next.js', pkg: 'gt-next', install: ['npm i gt-next', 'npx gt@latest'] },
  { name: 'React', pkg: 'gt-react', install: ['npm i gt-react', 'npx gt@latest'] },
  { name: 'React Native', pkg: 'gt-react-native', install: ['npm i gt-react-native', 'npx gt@latest'] },
  { name: 'TanStack Start', pkg: 'gt-tanstack-start', install: ['npm i gt-tanstack-start', 'npx gt@latest'] },
  { name: 'Node.js', pkg: 'gt-node', install: ['npm i gt-node', 'npx gt@latest'] },
  { name: 'Python', pkg: 'gt-fastapi', install: ['pip install gt-fastapi', 'gt init'] },
];

/** Four capability outputs of the frameworks window, label and the real formatted output. */
export type Capability = { label: string; output: string };

export const CAPABILITIES: readonly Capability[] = (['Numbers', 'Currencies', 'Plurals', 'Routing'] as const).map(
  (label) => ({ label: label.toLowerCase(), output: CAP_DEMOS[label] ?? '' })
);

/** The CLI session's locales, as the Node sample configures them. */
export const CLI_LOCALES: readonly string[] = ['es', 'fr', 'ja', 'de', 'zh'];

/** The config the session reads, as the CLI writes it. */
export const CLI_CONFIG: readonly string[] = [
  '"defaultLocale": "en",',
  `"locales": [${CLI_LOCALES.map((code) => `"${code}"`).join(', ')}]`,
];

/** The nine beats of the story, title and pipeline step only. */
export type PipelineStep = { n: number; title: string; step: string };

export const PIPELINE: readonly PipelineStep[] = BEATS.map((beat, i) => ({
  n: i + 1,
  title: beat.title,
  step: RAIL[beat.step] ?? RAIL[0],
}));

/* ------------------------------------------------------------------ *
 * Languages as material
 * ------------------------------------------------------------------ */

/** The base languages whose regional variants the register expands, in the shipped order. */
const VARIANT_BASES = ['zh', 'ar', 'de', 'pt'] as const;

export type VariantRow = { base: string; variants: readonly string[] };

/** One row per base language: every variant the roster lists under it, in the roster's order. */
export const VARIANT_ROWS: readonly VariantRow[] = VARIANT_BASES.map((base) => ({
  base,
  variants: SUPPORTED_LOCALES.filter((row) => row.languageCode === base && row.code !== base).map((row) => row.code),
}));

/** The two variants that prove the count is a technical claim. */
export const TELL_LOCALES: readonly string[] = ['zh-Hans', 'zh-Hant'];

/** The tail of the catalog: two languages named to show the count reaches past the large ones. */
export type TailLocale = { code: string; name: string };

export const TAIL_LOCALES: readonly TailLocale[] = [
  { code: 'cnr', name: 'Montenegrin' },
  { code: 'cy', name: 'Welsh' },
];

const RTL = new Set(['ar', 'he', 'fa', 'ur']);

const BY_CODE = new Map<string, LocaleProperties>(SUPPORTED_LOCALES.map((row) => [row.code, row]));

/** The endonym of a locale as one shaped word with its lang and dir. */
export function endonym(code: string): Word {
  const row = BY_CODE.get(code);
  const lang = code.split('-')[0] ?? code;
  return { text: row?.nativeName ?? code, lang: code, dir: RTL.has(lang) ? 'rtl' : 'ltr' };
}

/** The English name of a locale from the roster. */
export function localeName(code: string): string {
  return BY_CODE.get(code)?.name ?? code;
}

/* ------------------------------------------------------------------ *
 * The pricing file
 * ------------------------------------------------------------------ */

/** The published rate ledger. These are the only rates that may appear anywhere. */
export type Rate = { workflow: string; rate: string; libraries: string };

export const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', libraries: '$20' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens', libraries: '' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', libraries: '$4' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens', libraries: '' },
  { workflow: 'Project context surcharge', rate: '+$0.10 / 10k tokens per 500 tokens of context', libraries: '' },
  { workflow: 'Locadex', rate: '$5 / LCU', libraries: '' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits', libraries: '' },
];

/** Ring three unrolled in two arcs: the first four rows, then the last three. */
export const RATE_BANDS: readonly (readonly Rate[])[] = [RATES.slice(0, 4), RATES.slice(4)];

export const RATE_NOTES: readonly string[] = [
  'A Usage Limit is a hard cap. It blocks billing even with auto-reload on.',
  'npx gt translate --dry-run prints what would be translated and bills 0 tokens.',
];

/* ------------------------------------------------------------------ *
 * The footer
 * ------------------------------------------------------------------ */

export type FooterLink = { label: string; href: string };

export const FOOTER_COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: HREFS.docs },
      { label: 'Next.js', href: HREFS.docs },
      { label: 'React', href: HREFS.docs },
      { label: 'React Native', href: HREFS.docs },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: HREFS.docs },
      { label: 'Blog', href: HREFS.blog },
      { label: 'Pricing', href: HREFS.pricing },
      { label: 'Supported Locales', href: HREFS.locales },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers', href: HREFS.careers },
      { label: 'Contact', href: HREFS.contact },
      { label: 'GitHub', href: HREFS.github },
      { label: 'Discord', href: HREFS.discord },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: HREFS.terms },
      { label: 'Privacy', href: HREFS.privacy },
      { label: 'Acceptable Use', href: HREFS.acceptableUse },
      { label: 'Manage Cookies', href: '#top' },
    ],
  },
];
