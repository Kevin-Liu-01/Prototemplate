/**
 * The page's content, declared once. Every string here is either shipped GT
 * copy, a published rate, a real locale name from the supported-locales
 * roster, or a real destination on generaltranslation.com. Nothing is
 * invented; numbers appear only where the charter allows them.
 */

export type Word = { text: string; lang: string; rtl?: boolean };

/* The hero claim in the locales the morphing node cycles through. The
   shipped roster is "Scale to every language" in sixteen locales; the four
   longest sentences are left out so the widest line still fits the passage
   on one row at desktop widths. */
export const HERO_WORDS: Record<string, Word> = {
  en: { text: 'Scale to every language', lang: 'en' },
  es: { text: 'Crece en todos los idiomas', lang: 'es' },
  ja: { text: 'あらゆる言語に展開', lang: 'ja' },
  de: { text: 'In jeder Sprache wachsen', lang: 'de' },
  ko: { text: '모든 언어로 확장하세요', lang: 'ko' },
  zh: { text: '让产品说每一种语言', lang: 'zh' },
  it: { text: 'Cresci in ogni lingua', lang: 'it' },
  hi: { text: 'हर भाषा में आगे बढ़ें', lang: 'hi' },
  nl: { text: 'Groei in elke taal', lang: 'nl' },
  tr: { text: 'Her dile açılın', lang: 'tr' },
  sv: { text: 'Väx på alla språk', lang: 'sv' },
  pl: { text: 'Rośnij w każdym języku', lang: 'pl' },
};

export const HERO_ORDER: readonly string[] = [
  'en',
  'es',
  'ja',
  'de',
  'ko',
  'zh',
  'it',
  'hi',
  'nl',
  'tr',
  'sv',
  'pl',
];

/* The source string of the T proof and its translations, one cartouche each.
   The source is the shipped sample's heading; each translation is the
   product output for that locale. */
export const SOURCE_STRING = 'Hello, world!';

export type Translation = { code: string; text: string; lang: string; rtl?: boolean };

export const TRANSLATIONS: readonly Translation[] = [
  { code: 'es', text: '¡Hola, mundo!', lang: 'es' },
  { code: 'fr', text: 'Bonjour, le monde !', lang: 'fr' },
  { code: 'de', text: 'Hallo, Welt!', lang: 'de' },
  { code: 'ja', text: 'こんにちは世界！', lang: 'ja' },
  { code: 'ko', text: '안녕, 세계!', lang: 'ko' },
  { code: 'zh', text: '你好，世界！', lang: 'zh' },
  { code: 'ar', text: 'مرحباً بالعالم!', lang: 'ar', rtl: true },
  { code: 'hi', text: 'नमस्ते, दुनिया!', lang: 'hi' },
];

/* The six first-party stacks, in the order the docs nav lists them. */
export type Framework = { name: string; pkg: string; file: string; install: string };

export const FRAMEWORKS: readonly Framework[] = [
  { name: 'Next.js', pkg: 'gt-next', file: 'app/page.tsx', install: 'npm i gt-next' },
  { name: 'React', pkg: 'gt-react', file: 'src/Home.tsx', install: 'npm i gt-react' },
  { name: 'React Native', pkg: 'gt-react-native', file: 'app/index.tsx', install: 'npm i gt-react-native' },
  { name: 'TanStack Start', pkg: 'gt-tanstack-start', file: 'src/routes/index.tsx', install: 'npm i gt-tanstack-start' },
  { name: 'Node.js', pkg: 'gt-node', file: 'server.ts', install: 'npm i gt-node' },
  { name: 'Python', pkg: 'gt-fastapi', file: 'app.py', install: 'pip install gt-fastapi' },
];

/* The register band: twenty locales, each with its endonym from the
   supported-locales roster. Right-to-left scripts carry the flag. */
export type Tile = { code: string; name: string; native: string; rtl?: boolean };

export const TILES: readonly Tile[] = [
  { code: 'es', name: 'Spanish', native: 'español' },
  { code: 'fr', name: 'French', native: 'français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'italiano' },
  { code: 'pt', name: 'Portuguese', native: 'português' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'sv', name: 'Swedish', native: 'svenska' },
  { code: 'pl', name: 'Polish', native: 'polski' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'ru', name: 'Russian', native: 'русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'zh-Hant', name: 'Traditional Chinese', native: '繁體中文' },
  { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
  { code: 'he', name: 'Hebrew', native: 'עברית', rtl: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'id', name: 'Indonesian', native: 'Indonesia' },
];

/* The variants that matter: one language expanded into its regional tags. */
export type VariantRow = { tag: string; name: string; variants: readonly string[] };

export const VARIANTS: readonly VariantRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

/* The review workspace's four rows. */
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

/* The published rate ledger. These are the only rates that may appear. */
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

/* The trust register: six customers, each mark a monochrome SVG print from
   /public/logos, sized so the wordmarks sit on one cap height. */
export type Customer = { id: string; name: string; href: string; width: number; height: number };

export const CUSTOMERS: readonly Customer[] = [
  { id: 'cursor', name: 'Cursor', href: 'https://cursor.com', width: 72, height: 18 },
  { id: 'ramp', name: 'Ramp', href: 'https://ramp.com', width: 64, height: 17 },
  { id: 'mintlify', name: 'Mintlify', href: 'https://mintlify.com', width: 72, height: 16 },
  { id: 'profound', name: 'Profound', href: 'https://tryprofound.com', width: 77, height: 13 },
  { id: 'partiful', name: 'Partiful', href: 'https://partiful.com', width: 71, height: 16 },
  { id: 'clickhouse', name: 'ClickHouse', href: 'https://clickhouse.com', width: 59, height: 18 },
];

/* Destinations on the live product and site. */
export const HREF = {
  signIn: 'https://dash.generaltranslation.com/en-US/signin',
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
