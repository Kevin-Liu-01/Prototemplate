/**
 * The real blog index, regenerated from the landing app's content tree
 * (apps/landing/content/{blog,devlog}/en-US on gt-cloud k/preview-restart,
 * 2026-08-13). Titles, dates, authors, summaries and tags are the MDX
 * frontmatter, untouched; author display names resolve from
 * content/authors/<slug>.mdx. Devlog frontmatter carries no summary
 * field, so each release's dek is that post's own first body sentence —
 * no release is described with words its post doesn't contain.
 *
 * Post links point at the real articles on generaltranslation.com; this
 * redesign rebuilds the index, not every essay behind it.
 */

export type IndexedPost = {
  slug: string;
  title: string;
  /** ISO date, exactly as the frontmatter stores it. */
  date: string;
  /** Author display names, resolved from content/authors/<slug>.mdx. */
  authors: string[];
  /** Frontmatter `summary` (blog) or the post's own first sentence (devlog). */
  summary: string;
  tags: string[];
};

export const BLOG_URL = 'https://generaltranslation.com/blog';

export function postHref(slug: string): string {
  return `${BLOG_URL}/${slug}`;
}

/** The newest blog post — the index's one filed feature plate. */
export const FEATURED: IndexedPost = {

  slug: 'i18n-without-translation-files',
  title: 'i18n without translation files',
  date: '2026-05-07',
  authors: ['Jackie Chen'],
  summary: 'Most i18n libraries force you to maintain JSON files for each language you support. There\'s a different way to handle it.',
  tags: ['guide', 'internationalization', 'nextjs', 'i18n', 'gt-next', 'translation-files', 'developer-experience'],

};

/** content/blog/en-US — the remaining essays, newest first. */
export const ESSAY_ROWS: IndexedPost[] = [
  {
    slug: 'best-localization-software',
    title: 'Best localization software for developers in 2026',
    date: '2026-05-04',
    authors: ['Jackie Chen'],
    summary: 'Why the traditional split between i18n libraries and translation management systems is the wrong approach, and what end-to-end localization actually looks like',
    tags: ['comparison', 'localization', 'internationalization', 'gt-next', 'gt-react'],
  },
  {
    slug: 'multilingual-nextjs-seo',
    title: 'How to Optimize SEO for a Multilingual Next.js App',
    date: '2026-02-17',
    authors: ['Team'],
    summary: 'A practical guide to multilingual SEO in Next.js — locale routing, HTML lang tags, canonical URLs, hreflang, sitemaps, and metadata, all implemented with gt-next',
    tags: ['guide', 'seo', 'internationalization', 'nextjs', 'i18n', 'routing', 'metadata'],
  },
  {
    slug: 'nextjs-i18n-code-is-the-source-of-truth',
    title: 'You\'re Doing Next.js i18n Wrong',
    date: '2026-02-17',
    authors: ['Ernest McCarter'],
    summary: 'Translation keys separate content from where it\'s used. Here\'s the case for keeping them together.',
    tags: ['guide', 'internationalization', 'nextjs', 'i18n', 'gt-next', 'app-router', 'tutorial'],
  },
  {
    slug: 'branch_vs_ternary',
    title: 'Translating JSX - How to use Conditionals',
    date: '2025-09-26',
    authors: ['Ernest McCarter'],
    summary: 'Learn how to handle translations with better context and flexibility',
    tags: ['gt-next', 'Branch', 'ternary', 'conditional', 'translation', 'i18n', 'Translate Jsx'],
  },
  {
    slug: 'ai-chatbot',
    title: 'How to Internationalize an AI chatbot',
    date: '2025-02-26',
    authors: ['Brian Lou'],
    summary: 'Build and deploy a fully translated AI chatbot in minutes using gt-next',
    tags: ['guide', 'ai', 'chatbot', 'internationalization', 'nextjs', 'vercel'],
  },
  {
    slug: 'plurals',
    title: 'How to Handle Pluralization in React',
    date: '2025-02-17',
    authors: ['Archie McKenzie'],
    summary: 'How to handle plural forms in React and Next.js — from simple English plurals to full multilingual i18n support with examples',
    tags: ['guide', 'plurals', 'internationalization', 'react', 'nextjs', 'i18n', 'intl'],
  },
  {
    slug: 'gt-next',
    title: 'Launching gt-next',
    date: '2025-01-07',
    authors: ['Archie McKenzie'],
    summary: 'The easiest way to internationalize your Next.js app',
    tags: ['guide', 'internationalization', 'nextjs', 'gt-next'],
  },
];

/** content/devlog/en-US — every release, newest first. */
export const RELEASES: IndexedPost[] = [
  {
    slug: 'gt-sanity_v2_1_0',
    title: 'gt-sanity@2.1.0',
    date: '2026-07-14',
    authors: ['Brian Lou'],
    summary: 'gt-sanity v2.1 adds field-level localization: instead of creating a separate document per locale, you can now store every language\'s value inside the same document using internationalized arrays.',
    tags: ['gt-sanity', 'v2.1.0', 'sanity', 'cms', 'translation', 'minor'],
  },
  {
    slug: 'gt-react-native_v10_20_0',
    title: 'gt-react-native@10.20.0',
    date: '2026-06-01',
    authors: ['Ernest McCarter'],
    summary: 'gt-react-native 10.20.0 adds getLocaleFromNativeStore() — a synchronous function that reads the persisted locale from the native store without needing React context.',
    tags: ['gt-react-native', 'locale', 'native-store'],
  },
  {
    slug: 'gt-i18n_v0_9_0',
    title: 'gt-i18n@0.9.0',
    date: '2026-05-07',
    authors: ['Ernest McCarter'],
    summary: 'gt-i18n now supports dictionary-backed translations via getTranslations().',
    tags: ['gt-i18n', 'gt-node', 'dictionaries', 'getTranslations', 'i18n'],
  },
  {
    slug: 'gt-react_v10_19_0',
    title: 'gt-react@10.19.0',
    date: '2026-04-16',
    authors: ['Ernest McCarter'],
    summary: 'gt-react/browser now supports dev hot reload for translations.',
    tags: ['gt-react', 'browser', 'hot-reload', 'dev-experience', 'i18n'],
  },
  {
    slug: 'gt-node_v0_6_0',
    title: 'gt-node@0.6.0',
    date: '2026-04-14',
    authors: ['Ernest McCarter'],
    summary: 'gt-node now has tx() — a function for translating strings at runtime.',
    tags: ['gt-node', 'runtime-translation', 'tx'],
  },
  {
    slug: 'compiler_v1_3_0',
    title: 'compiler@1.3.0',
    date: '2026-04-06',
    authors: ['Ernest McCarter'],
    summary: 'The GT compiler now supports auto JSX injection for client-side React SPAs.',
    tags: ['compiler', 'auto-jsx-injection', 'gt-react', 'i18n'],
  },
  {
    slug: 'gt-react_v10_18_0',
    title: 'gt-react@10.18.0',
    date: '2026-04-06',
    authors: ['Ernest McCarter'],
    summary: 'This release adds support for derivable context values in gt-react.',
    tags: ['gt-react', 'derive', 'context', 'i18n'],
  },
  {
    slug: 'gt-next_v6_15_0',
    title: 'gt-next@6.15.0',
    date: '2026-04-01',
    authors: ['Archie McKenzie'],
    summary: 'A new <RelativeTime> component is now available across all GT React packages.',
    tags: ['gt-next', 'gt-react', 'gt-tanstack-start', 'relative-time', 'components'],
  },
  {
    slug: 'gt-react_v10_16_0',
    title: 'gt-react@10.16.0',
    date: '2026-04-01',
    authors: ['Ernest McCarter'],
    summary: 'New <RelativeTime> variable component for rendering localized relative time strings like "2 hours ago" or "in 3 days".',
    tags: ['gt-react', 'relative-time', 'intl', 'variables'],
  },
  {
    slug: 'gt-sanity_v2_0_0',
    title: 'gt-sanity@2.0.0',
    date: '2026-04-01',
    authors: ['Brian Lou'],
    summary: 'gt-sanity v2 is a major release that upgrades the plugin to support Sanity v5 and React 19, simplifies setup with a zero-config translate dialog, and adds new options for controlling which fields appear on translated documents.',
    tags: ['gt-sanity', 'v2.0.0', 'sanity', 'cms', 'translation', 'major'],
  },
  {
    slug: 'gt_v2_13_0',
    title: 'gt@2.13.0',
    date: '2026-03-20',
    authors: ['Ernest McCarter'],
    summary: 'The t() function now automatically derives dynamic content — no more wrapping variables in derive().',
    tags: ['gt', 'derive', 't-function', 'dx'],
  },
  {
    slug: 'gt-cli_v2_11_3',
    title: 'gt@2.11.3',
    date: '2026-03-19',
    authors: ['Ernest McCarter'],
    summary: 'derive() now supports object and array access.',
    tags: ['gt-cli', 'derive', 'objects', 'arrays'],
  },
  {
    slug: 'gt-cli_v2_12_0',
    title: 'gt@2.12.0',
    date: '2026-03-19',
    authors: ['Ernest McCarter'],
    summary: 'derive() can now resolve values from objects and arrays — not just function return values.',
    tags: ['gt-cli', 'derive', 'object', 'array', 'dictionary', 'python', 'i18n'],
  },
  {
    slug: 'gt-cli_v2_11_0',
    title: 'gt@2.11.0',
    date: '2026-03-18',
    authors: ['Fernando Aviles'],
    summary: 'The GT CLI can now publish any translated file type to the GT CDN.',
    tags: ['gt-cli', 'cdn', 'publish', 'files', 'json', 'mdx', 'yaml', 'i18n'],
  },
  {
    slug: 'gt-next_v6_14_0',
    title: 'gt-next@6.14.0',
    date: '2026-03-18',
    authors: ['Jackie Chen'],
    summary: 'A new useVersionId hook and getVersionId helper function are now available across all GT JavaScript packages.',
    tags: ['gt-next', 'gt-i18n', 'gt-node', 'gt-tanstack-start', 'version-id', 'hook', 'i18n'],
  },
  {
    slug: 'gt-react_v10_13_0',
    title: 'gt-react@10.13.0',
    date: '2026-03-18',
    authors: ['Ernest McCarter'],
    summary: 'As part of our continued experimentation with moving away from React context, gt-react now supports using t as a tagged template literal:',
    tags: ['gt-react', 'macro', 'tagged-template', 'developer-experience', 'i18n'],
  },
  {
    slug: 'gt-react_v10_15_0',
    title: 'gt-react@10.15.0',
    date: '2026-03-18',
    authors: ['Ernest McCarter'],
    summary: 'This release is the first to ship with the new derive() name.',
    tags: ['gt-react', 'derive', 'tagged-template', 'i18n'],
  },
  {
    slug: 'gt-react_v10_12_0',
    title: 'gt-react@10.12.0',
    date: '2026-03-16',
    authors: ['Ernest McCarter'],
    summary: 'gt-react now exports a t() function for synchronous, module-level string translation in the browser.',
    tags: ['gt-react', 'gt-i18n', 'v10.12.0', 't', 'string-translation', 'browser', 'synchronous', 'i18n'],
  },
  {
    slug: 'gtx-cli_v2_10_0',
    title: 'gtx-cli@2.10.0',
    date: '2026-03-12',
    authors: ['Fernando Aviles'],
    summary: 'gtx-cli 2.10.0 adds support for keyed metadata on JSON and YAML translation files.',
    tags: ['gtx-cli', '2.10.0', 'metadata', 'context', 'json', 'yaml', 'translation-quality'],
  },
  {
    slug: 'gt-cli_v2_8_0',
    title: 'gt-cli@2.8.0',
    date: '2026-03-10',
    authors: ['Ernest McCarter'],
    summary: 'The gt CLI now supports Python projects.',
    tags: ['gt-cli', 'v2.8.0', 'python', 'python-extractor', 'gt-flask', 'gt-fastapi', 'i18n'],
  },
  {
    slug: 'gt-cli_v2_9_0',
    title: 'gt-cli@2.9.0',
    date: '2026-03-10',
    authors: ['Ernest McCarter'],
    summary: 'The gt CLI now supports Twilio Content JSON as a file format.',
    tags: ['gt-cli', 'v2.9.0', 'twilio', 'content-templates', 'i18n', 'whatsapp', 'sms'],
  },
  {
    slug: 'gt-flask_v0_1_0',
    title: 'gt-flask@0.1.0 / gt-fastapi@0.1.0',
    date: '2026-03-10',
    authors: ['Ernest McCarter'],
    summary: 'Initial release of gt-flask and gt-fastapi.',
    tags: ['gt-flask', 'gt-fastapi', 'gt-i18n', 'v0.1.0', 'python', 'flask', 'fastapi', 'i18n'],
  },
  {
    slug: 'gt-node_v0_3_0',
    title: 'gt-node@0.3.0',
    date: '2026-03-09',
    authors: ['Ernest McCarter'],
    summary: 'gt-node now exports locale utility functions: getLocale(), getDefaultLocale(), getLocales(), and getLocaleProperties().',
    tags: ['gt-node', 'v0.3.0', 'node', 'locale', 'helpers', 'i18n'],
  },
  {
    slug: 'gt-next_v6_13_0',
    title: 'gt-next@6.13.0',
    date: '2026-02-25',
    authors: ['Ernest McCarter'],
    summary: 'msg() now accepts arrays.',
    tags: ['gt-next', 'gt-i18n', 'v6.13.0', 'msg', 'string-registration', 'arrays', 'i18n'],
  },
  {
    slug: 'gt-node_v0_2_0',
    title: 'gt-node@0.2.0',
    date: '2026-02-17',
    authors: ['Ernest McCarter'],
    summary: 'IMPORTANT This library is still experimental and may be subject to breaking changes.',
    tags: ['gt-node', 'v0.2.0', 'node', 'express', 'i18n', 'async-local-storage', 'server-side'],
  },
  {
    slug: 'gt-tanstack-start_v0_1_0',
    title: 'gt-tanstack-start@0.1.0',
    date: '2026-02-16',
    authors: ['Ernest McCarter'],
    summary: 'gt-tanstack-start is a first attempt at providing i18n support tailored for TanStack Start.',
    tags: ['gt-tanstack-start', 'v0.1.0', 'tanstack-start', 'tanstack', 'i18n', 'translation', 'vite'],
  },
  {
    slug: 'react-core-linter_v0_1_0',
    title: '@generaltranslation/react-core-linter@0.1.0',
    date: '2026-01-26',
    authors: ['Ernest McCarter'],
    summary: '@generaltranslation/react-core-linter 0.1.0 introduces ESLint rules for General Translation React Core integration.',
    tags: ['react-core-linter', '0.1.0', 'eslint', 'linting', 'static-validation'],
  },
  {
    slug: 'gt-next_v6_12_0',
    title: 'gt-next@6.12.0',
    date: '2025-12-15',
    authors: ['Ernest McCarter'],
    summary: 'In gt-next@6.8.0, we introduced the <Static> component to address sentence fragmentation and code reuse in JSX content.',
    tags: ['gt-next', 'v6.12.0', 'declareStatic', 'declareVar', 'decodeVars', 'translation', 'i18n', 'string functions', 'sentence fragmentation'],
  },
  {
    slug: 'gt-next_v6_11_0',
    title: 'gt-next@6.11.0',
    date: '2025-12-09',
    authors: ['Ernest McCarter'],
    summary: 'gt-next@6.11.0 adds $maxChars parameter support to translation functions, building on the formatCutoff() functionality introduced in generaltranslation@8.1.0.',
    tags: ['gt-next', '6.11.0', 'maxchars', 'character-limits'],
  },
  {
    slug: 'generaltranslation_v8_1_0',
    title: 'generaltranslation@8.1.0',
    date: '2025-12-06',
    authors: ['Ernest McCarter'],
    summary: 'generaltranslation@8.1.0 introduces formatCutoff(), a locale-aware text truncation function that handles character limits with appropriate terminators for different languages.',
    tags: ['generaltranslation', '8.1.0', 'formatting', 'text-truncation', 'locale-aware'],
  },
  {
    slug: 'gt-next_v6_10_0',
    title: 'gt-next@6.10.0',
    date: '2025-12-03',
    authors: ['Ernest McCarter'],
    summary: 'gt-next 6.10.0 introduces experimental support for cached components while deprecating legacy static request functions from gt-next@6.9.',
    tags: ['gt-next', 'v6.10.0', 'cached components', 'SSG', 'static site generation', 'deprecation', 'i18n'],
  },
  {
    slug: 'gt-i18n_v0_1_0',
    title: 'gt-i18n@0.1.0',
    date: '2025-11-25',
    authors: ['Ernest McCarter'],
    summary: 'While our packages have traditionally focused on web development environments, the release of gt-i18n@0.1.0 represents a foundational step toward framework-agnostic JS internationalization.',
    tags: ['gt-i18n', 'v0.1.0', 'pure-js', 'translation', 'i18n'],
  },
  {
    slug: 'gt-next_v6_9_0',
    title: 'gt-next@6.9.0',
    date: '2025-11-18',
    authors: ['Ernest McCarter'],
    summary: 'This behavior is currently deprecated, see gt-next@6.10.0 for the new behavior.',
    tags: ['gt-next', 'v6.9.0', 'static rendering', 'static site generation', 'translation', 'i18n'],
  },
  {
    slug: 'gt-react_v10_8_0',
    title: 'gt-react@10.8.0',
    date: '2025-11-14',
    authors: ['Ernest McCarter'],
    summary: 'In gt-react 10.8.0, we\'ve added feature flag support through the enableI18n field.',
    tags: ['gt-react', '10.8.0', 'feature flags', 'i18n', 'translation'],
  },
  {
    slug: 'generaltranslation_v8',
    title: 'generaltranslation v8',
    date: '2025-11-10',
    authors: ['Brian Lou'],
    summary: 'In generaltranslation v8, we\'re making significant changes to our API, and are deprecating some API functions and endpoints.',
    tags: ['generaltranslation', '8.0.0', 'api', 'translation'],
  },
  {
    slug: 'gt-next_v6_8_0',
    title: 'gt-next@6.8.0',
    date: '2025-11-10',
    authors: ['Ernest McCarter'],
    summary: 'We often find that the more mature a codebase is, the more content is fragmented.',
    tags: ['gt-react', 'gt-next', 'gtx-cli', 'v6.8.0', 'static', 'translation', 'i18n'],
  },
  {
    slug: 'generaltranslation_v7_8_0',
    title: 'generaltranslation@7.8.0',
    date: '2025-10-29',
    authors: ['Ernest McCarter'],
    summary: 'In generaltranslation@7.8.0, we\'re introducing list formatting capabilities that set the foundation for upcoming components and methods.',
    tags: ['generaltranslation', '7.8.0', 'List formatting', 'translation'],
  },
  {
    slug: 'local-edits',
    title: 'Local Edits in gtx-cli@2.4.0',
    date: '2025-10-21',
    authors: ['Fernando Aviles'],
    summary: 'In gtx-cli 2.4.0, we\'ve added a new way to save your local translation edits directly from the CLI.',
    tags: ['gtx-cli', 'save-local', 'translate'],
  },
  {
    slug: 'compiler_v1_0_0_gt-next_v6_7_0',
    title: 'compiler v1.0.0 + gt-next@6.7.0',
    date: '2025-10-10',
    authors: ['Ernest McCarter'],
    summary: 'We are very excited to announce the release of @general-translation/compiler v1.0.0.',
    tags: ['@general-translation/compiler', 'v1.0.0', 'compiler', 'translation', 'i18n'],
  },
  {
    slug: 'gt-next_v6_6_0',
    title: 'gt-next@6.6.0',
    date: '2025-09-18',
    authors: ['Ernest McCarter'],
    summary: 'In gt-next 6.6.0, we\'re taking a new direction to internationalizing "brown field" apps.',
    tags: ['gt-next', '6.6.0', 'Dictionary translation', 'translation'],
  },
  {
    slug: 'gtx-cli_v2_3_0',
    title: 'gtx-cli@2.3.0',
    date: '2025-09-12',
    authors: ['Fernando Aviles'],
    summary: 'In gtx-cli 2.3.0, we updated the behavior of the translate and upload commands and increased visibility into the translation pipeline.',
    tags: ['gtx-cli', '2.3.0', 'translate', 'upload', 'setup'],
  },
  {
    slug: 'gt-next_v6_4_0',
    title: 'gt-next@6.4.0',
    date: '2025-09-10',
    authors: ['Ernest McCarter'],
    summary: 'In gt-next 6.4.0, we\'ve introduced locale aliasing.',
    tags: ['gt-next', '6.4.0', 'Locale Aliasing', 'translation'],
  },
  {
    slug: 'gt-next_v6_3_0',
    title: 'gt-next@6.3.0',
    date: '2025-08-27',
    authors: ['Ernest McCarter'],
    summary: 'In gt-next 6.3.0, we\'re moving closer to a library that is suitable for both human developers and AI developers.',
    tags: ['gt-next', '6.3.0', 'AI Development', 'String translation'],
  },
  {
    slug: 'gt-next_v6_2_0',
    title: 'gt-next@6.2.0',
    date: '2025-08-19',
    authors: ['Ernest McCarter'],
    summary: 'In gt-next 6.2.0, we\'ve taken a big step toward moving processing from runtime to build time through an SWC plugin.',
    tags: ['gt-next', '6.2.0', 'swc', 'plugin', 'build-time', 'linting'],
  },
];

export const ESSAYS: IndexedPost[] = [FEATURED, ...ESSAY_ROWS];

const ALL_DATES = [...ESSAYS, ...RELEASES].map((post) => post.date).sort();
export const INDEX_FROM = ALL_DATES[0] ?? '';
export const INDEX_TO = ALL_DATES[ALL_DATES.length - 1] ?? '';
