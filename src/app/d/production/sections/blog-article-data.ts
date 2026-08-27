/**
 * PRODUCTION · the blog's own content, vendored as a typed module.
 *
 * The shipped article page reads MDX off disk — apps/landing/src/components/
 * blog/utils.ts walks content/blog/en-US and content/devlog/en-US, a git
 * submodule (generaltranslation/content) this repo does not carry — so the
 * frontmatter is transcribed here instead. Nothing is paraphrased and
 * nothing is added:
 *
 *   AUTHORS      content/authors/<slug>.mdx — `name` and `avatar`. Taylor's
 *                file declares no avatar, so hers is absent here too; the
 *                shipped byline renders the name alone in that case.
 *   BLOG_POSTS   content/blog/en-US — the tree holds exactly ONE post, so
 *                the shipped blog serves exactly one essay.
 *   DEVLOG_POSTS content/devlog/en-US — all 52 releases.
 *
 * Both lists are stored in the order getAllPosts resolves: date descending,
 * with a descending numeric-aware title tiebreak. That order is what the
 * article's previous/next pair walks, so it is stored settled rather than
 * re-derived from a locale-sensitive comparator.
 *
 * Devlog frontmatter carries a `headline` and NO `summary`; blog frontmatter
 * carries a `summary` and, here, an `images` cover. The shipped page prints
 * exactly what the frontmatter holds, which is why a release article shows
 * no summary paragraph and a release Explore card shows no dek.
 *
 * Bodies are separate: the five posts in
 * ../../singularity/company-sections/post-bodies.ts carry real article text.
 * Four of those slugs are still posts on the shipped site and render in full
 * here. The fifth (branch_vs_ternary) has since left the content tree — the
 * live site answers /blog/branch_vs_ternary with "Post not found" — so this
 * control does not file it either.
 */

export type ArticleAuthor = {
  /** content/authors/<slug>.mdx `name`. */
  name: string;
  /** content/authors/<slug>.mdx `avatar`, absent where the file omits it. */
  avatar?: string;
};

/** content/authors, keyed by the slug post frontmatter names. */
export const AUTHORS: Readonly<Record<string, ArticleAuthor>> = {
  archie: { name: 'Archie McKenzie', avatar: '/static/avatars/archie.png' },
  brian: { name: 'Brian Lou', avatar: '/static/avatars/brian.png' },
  ernest: { name: 'Ernest McCarter', avatar: '/static/avatars/ernest.png' },
  fernando: { name: 'Fernando Aviles', avatar: '/static/avatars/fernando.png' },
  jackie: { name: 'Jackie Chen', avatar: '/static/avatars/jackie.png' },
  taylor: { name: 'Taylor Fang' },
  default: { name: 'Team', avatar: '/static/avatars/logo.png' },
};

/** Which content tree a post came from — the shipped `PostType`. */
export type PostType = 'blog' | 'devlog';

export type ArticlePost = {
  slug: string;
  title: string;
  /** Devlog frontmatter `headline`: the release's one-line dek. */
  headline?: string;
  date: string;
  /** Author slugs, in frontmatter order. */
  authors: readonly string[];
  /** Frontmatter `summary` — blog only; '' on every release. */
  summary: string;
  tags: readonly string[];
  /** Frontmatter `images`: the cover the shipped page renders as a photo. */
  images?: readonly string[];
};

/** content/blog/en-US, newest first. */
export const BLOG_POSTS: readonly ArticlePost[] = [
  {
    slug: 'supporting-open-source-software',
    title: 'Supporting open-source software',
    date: '2026-08-17',
    authors: ['archie'],
    summary: 'General Translation is giving away $15,000 to developers who build and maintain open-source projects.',
    tags: ['open-source', 'grants', 'developers', 'community'],
    images: ['/static/blogs/supporting-open-source-software.png?v=8704532b'],
  },
];

/** content/devlog/en-US, newest first. */
export const DEVLOG_POSTS: readonly ArticlePost[] = [
  {
    slug: 'gt-sanity_v4_0_0',
    title: 'gt-sanity@4.0.0',
    headline: 'Support for Sanity 6 Studios',
    date: '2026-08-14',
    authors: ['fernando'],
    summary: '',
    tags: ['gt-sanity', 'v4.0.0', 'sanity', 'cms', 'translation', 'major'],
  },
  {
    slug: 'gt-sanity_v3_1_1',
    title: 'gt-sanity@3.1.1',
    headline: 'Safer locale configuration',
    date: '2026-07-29',
    authors: ['fernando'],
    summary: '',
    tags: ['gt-sanity', 'v3.1.1', 'sanity', 'cms', 'locales', 'bug-fix'],
  },
  {
    slug: 'gt-react_v11_1_2',
    title: 'gt-react@11.1.2',
    headline: 'SSR fixes for Cloudflare Workers',
    date: '2026-07-29',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'gt-next', 'gt-tanstack-start', 'v11.1.2', 'cloudflare-workers', 'ssr'],
  },
  {
    slug: 'gt-next_v11_1_3',
    title: 'gt-next@11.1.3',
    headline: 'Native locale routing for Pages Router',
    date: '2026-07-29',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', 'v11.1.3', 'nextjs', 'pages-router', 'i18n', 'locale-routing'],
  },
  {
    slug: 'gt-sanity_v3_1_0',
    title: 'gt-sanity@3.1.0',
    headline: 'Save local edits',
    date: '2026-07-28',
    authors: ['fernando'],
    summary: '',
    tags: ['gt-sanity', 'v3.1.0', 'sanity', 'cms', 'translation', 'minor'],
  },
  {
    slug: 'gt-tanstack-start_v11_1_0',
    title: 'gt-tanstack-start@11.1.0',
    headline: 'Opt-in locale routing',
    date: '2026-07-22',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-tanstack-start', 'v11.1.0', 'tanstack-start', 'i18n', 'locale-routing'],
  },
  {
    slug: 'gt-sanity_v3_0_0',
    title: 'gt-sanity@3.0.0',
    headline: 'Native Sanity localization plugins',
    date: '2026-07-22',
    authors: ['brian'],
    summary: '',
    tags: ['gt-sanity', 'v3.0.0', 'sanity', 'cms', 'translation', 'major'],
  },
  {
    slug: 'gt-sanity_v2_1_0',
    title: 'gt-sanity@2.1.0',
    headline: 'Field-level localization',
    date: '2026-07-14',
    authors: ['brian'],
    summary: '',
    tags: ['gt-sanity', 'v2.1.0', 'sanity', 'cms', 'translation', 'minor'],
  },
  {
    slug: 'gt-react_v11_0_0',
    title: 'gt-react@11.0.0',
    headline: 'A shared runtime across React frameworks',
    date: '2026-07-03',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'gt-next', 'gt-react-native', 'gt-tanstack-start', 'i18n', 'performance'],
  },
  {
    slug: 'gt-react-native_v10_20_0',
    title: 'gt-react-native@10.20.0',
    headline: 'Sync locale reads from the native store',
    date: '2026-06-01',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react-native', 'locale', 'native-store'],
  },
  {
    slug: 'gt-i18n_v0_9_0',
    title: 'gt-i18n@0.9.0',
    headline: 'Dictionary-backed translations',
    date: '2026-05-07',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-i18n', 'gt-node', 'dictionaries', 'getTranslations', 'i18n'],
  },
  {
    slug: 'gt-react_v10_19_0',
    title: 'gt-react@10.19.0',
    headline: 'Translation hot reload for SPAs',
    date: '2026-04-16',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'browser', 'hot-reload', 'dev-experience', 'i18n'],
  },
  {
    slug: 'gt-node_v0_6_0',
    title: 'gt-node@0.6.0',
    headline: 'Runtime translation with tx()',
    date: '2026-04-14',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-node', 'runtime-translation', 'tx'],
  },
  {
    slug: 'gt-react_v10_18_0',
    title: 'gt-react@10.18.0',
    headline: 'Derivable translation context',
    date: '2026-04-06',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'derive', 'context', 'i18n'],
  },
  {
    slug: 'compiler_v1_3_0',
    title: 'compiler@1.3.0',
    headline: 'Automatic <T> wrapping at build time',
    date: '2026-04-06',
    authors: ['ernest'],
    summary: '',
    tags: ['compiler', 'auto-jsx-injection', 'gt-react', 'i18n'],
  },
  {
    slug: 'gt-sanity_v2_0_0',
    title: 'gt-sanity@2.0.0',
    headline: 'Zero-config translate dialog',
    date: '2026-04-01',
    authors: ['brian'],
    summary: '',
    tags: ['gt-sanity', 'v2.0.0', 'sanity', 'cms', 'translation', 'major'],
  },
  {
    slug: 'gt-react_v10_16_0',
    title: 'gt-react@10.16.0',
    headline: 'Localized relative time strings',
    date: '2026-04-01',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'relative-time', 'intl', 'variables'],
  },
  {
    slug: 'gt-next_v6_15_0',
    title: 'gt-next@6.15.0',
    headline: '<RelativeTime> across all React packages',
    date: '2026-04-01',
    authors: ['archie'],
    summary: '',
    tags: ['gt-next', 'gt-react', 'gt-tanstack-start', 'relative-time', 'components'],
  },
  {
    slug: 'gt_v2_13_0',
    title: 'gt@2.13.0',
    headline: 'Automatic derivation in t()',
    date: '2026-03-20',
    authors: ['ernest'],
    summary: '',
    tags: ['gt', 'derive', 't-function', 'dx'],
  },
  {
    slug: 'gt-cli_v2_12_0',
    title: 'gt@2.12.0',
    headline: 'derive() supports Python dictionaries and lists',
    date: '2026-03-19',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-cli', 'derive', 'object', 'array', 'dictionary', 'python', 'i18n'],
  },
  {
    slug: 'gt-cli_v2_11_3',
    title: 'gt@2.11.3',
    headline: 'Object and array access for derive()',
    date: '2026-03-19',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-cli', 'derive', 'objects', 'arrays'],
  },
  {
    slug: 'gt-cli_v2_11_0',
    title: 'gt@2.11.0',
    headline: 'Publish any file type to the CDN',
    date: '2026-03-18',
    authors: ['fernando'],
    summary: '',
    tags: ['gt-cli', 'cdn', 'publish', 'files', 'json', 'mdx', 'yaml', 'i18n'],
  },
  {
    slug: 'gt-react_v10_15_0',
    title: 'gt-react@10.15.0',
    headline: 'derive() in tagged templates',
    date: '2026-03-18',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'derive', 'tagged-template', 'i18n'],
  },
  {
    slug: 'gt-react_v10_13_0',
    title: 'gt-react@10.13.0',
    headline: 't as a tagged template literal',
    date: '2026-03-18',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'macro', 'tagged-template', 'developer-experience', 'i18n'],
  },
  {
    slug: 'gt-next_v6_14_0',
    title: 'gt-next@6.14.0',
    headline: 'Read the translation version at runtime',
    date: '2026-03-18',
    authors: ['jackie'],
    summary: '',
    tags: ['gt-next', 'gt-i18n', 'gt-node', 'gt-tanstack-start', 'version-id', 'hook', 'i18n'],
  },
  {
    slug: 'gt-react_v10_12_0',
    title: 'gt-react@10.12.0',
    headline: 'Module-level translation with t()',
    date: '2026-03-16',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'gt-i18n', 'v10.12.0', 't', 'string-translation', 'browser', 'synchronous', 'i18n'],
  },
  {
    slug: 'gtx-cli_v2_10_0',
    title: 'gtx-cli@2.10.0',
    headline: 'Per-key translation instructions',
    date: '2026-03-12',
    authors: ['fernando'],
    summary: '',
    tags: ['gtx-cli', '2.10.0', 'metadata', 'context', 'json', 'yaml', 'translation-quality'],
  },
  {
    slug: 'gt-flask_v0_1_0',
    title: 'gt-flask@0.1.0 / gt-fastapi@0.1.0',
    headline: 'Inline translation for Python web frameworks',
    date: '2026-03-10',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-flask', 'gt-fastapi', 'gt-i18n', 'v0.1.0', 'python', 'flask', 'fastapi', 'i18n'],
  },
  {
    slug: 'gt-cli_v2_9_0',
    title: 'gt-cli@2.9.0',
    headline: 'Twilio Content Template translation',
    date: '2026-03-10',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-cli', 'v2.9.0', 'twilio', 'content-templates', 'i18n', 'whatsapp', 'sms'],
  },
  {
    slug: 'gt-cli_v2_8_0',
    title: 'gt-cli@2.8.0',
    headline: 'Python project support',
    date: '2026-03-10',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-cli', 'v2.8.0', 'python', 'python-extractor', 'gt-flask', 'gt-fastapi', 'i18n'],
  },
  {
    slug: 'gt-node_v0_3_0',
    title: 'gt-node@0.3.0',
    headline: 'Locale utility functions',
    date: '2026-03-09',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-node', 'v0.3.0', 'node', 'locale', 'helpers', 'i18n'],
  },
  {
    slug: 'gt-next_v6_13_0',
    title: 'gt-next@6.13.0',
    headline: 'msg() accepts arrays',
    date: '2026-02-25',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', 'gt-i18n', 'v6.13.0', 'msg', 'string-registration', 'arrays', 'i18n'],
  },
  {
    slug: 'gt-node_v0_2_0',
    title: 'gt-node@0.2.0',
    headline: 'Server-side translation for Node.js',
    date: '2026-02-17',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-node', 'v0.2.0', 'node', 'express', 'i18n', 'async-local-storage', 'server-side'],
  },
  {
    slug: 'gt-tanstack-start_v0_1_0',
    title: 'gt-tanstack-start@0.1.0',
    headline: 'i18n for TanStack Start',
    date: '2026-02-16',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-tanstack-start', 'v0.1.0', 'tanstack-start', 'tanstack', 'i18n', 'translation', 'vite'],
  },
  {
    slug: 'react-core-linter_v0_1_0',
    title: '@generaltranslation/react-core-linter@0.1.0',
    headline: 'ESLint rules for React Core',
    date: '2026-01-26',
    authors: ['ernest'],
    summary: '',
    tags: ['react-core-linter', '0.1.0', 'eslint', 'linting', 'static-validation'],
  },
  {
    slug: 'gt-next_v6_12_0',
    title: 'gt-next@6.12.0',
    headline: 'Static derivation for string functions',
    date: '2025-12-15',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', 'v6.12.0', 'declareStatic', 'declareVar', 'decodeVars', 'translation', 'i18n', 'string functions', 'sentence fragmentation'],
  },
  {
    slug: 'gt-next_v6_11_0',
    title: 'gt-next@6.11.0',
    headline: 'Character limits for translations',
    date: '2025-12-09',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', '6.11.0', 'maxchars', 'character-limits'],
  },
  {
    slug: 'generaltranslation_v8_1_0',
    title: 'generaltranslation@8.1.0',
    headline: 'Locale-aware text truncation',
    date: '2025-12-06',
    authors: ['ernest'],
    summary: '',
    tags: ['generaltranslation', '8.1.0', 'formatting', 'text-truncation', 'locale-aware'],
  },
  {
    slug: 'gt-next_v6_10_0',
    title: 'gt-next@6.10.0',
    headline: 'Experimental cached component support',
    date: '2025-12-03',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', 'v6.10.0', 'cached components', 'SSG', 'static site generation', 'deprecation', 'i18n'],
  },
  {
    slug: 'gt-i18n_v0_1_0',
    title: 'gt-i18n@0.1.0',
    headline: 'Framework-agnostic string translation',
    date: '2025-11-25',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-i18n', 'v0.1.0', 'pure-js', 'translation', 'i18n'],
  },
  {
    slug: 'gt-next_v6_9_0',
    title: 'gt-next@6.9.0',
    headline: 'Static rendering support',
    date: '2025-11-18',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', 'v6.9.0', 'static rendering', 'static site generation', 'translation', 'i18n'],
  },
  {
    slug: 'gt-react_v10_8_0',
    title: 'gt-react@10.8.0',
    headline: 'Feature-flagged i18n',
    date: '2025-11-14',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', '10.8.0', 'feature flags', 'i18n', 'translation'],
  },
  {
    slug: 'gt-next_v6_8_0',
    title: 'gt-next@6.8.0',
    headline: 'Static function calls inside translations',
    date: '2025-11-10',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-react', 'gt-next', 'gtx-cli', 'v6.8.0', 'static', 'translation', 'i18n'],
  },
  {
    slug: 'generaltranslation_v8',
    title: 'generaltranslation@8.0.0',
    headline: 'Branching and API deprecations',
    date: '2025-11-10',
    authors: ['brian'],
    summary: '',
    tags: ['generaltranslation', '8.0.0', 'api', 'translation'],
  },
  {
    slug: 'generaltranslation_v7_8_0',
    title: 'generaltranslation@7.8.0',
    headline: 'Locale-aware list formatting',
    date: '2025-10-29',
    authors: ['ernest'],
    summary: '',
    tags: ['generaltranslation', '7.8.0', 'List formatting', 'translation'],
  },
  {
    slug: 'local-edits',
    title: 'gtx-cli@2.4.0',
    headline: 'Save translation edits from the CLI',
    date: '2025-10-21',
    authors: ['fernando'],
    summary: '',
    tags: ['gtx-cli', 'save-local', 'translate'],
  },
  {
    slug: 'compiler_v1_0_0_gt-next_v6_7_0',
    title: 'compiler@1.0.0 / gt-next@6.7.0',
    headline: 'Build-time optimizations for every React app',
    date: '2025-10-10',
    authors: ['ernest'],
    summary: '',
    tags: ['@general-translation/compiler', 'v1.0.0', 'compiler', 'translation', 'i18n'],
  },
  {
    slug: 'gt-next_v6_6_0',
    title: 'gt-next@6.6.0',
    headline: 'Translated dictionary subtrees with t.obj()',
    date: '2025-09-18',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', '6.6.0', 'Dictionary translation', 'translation'],
  },
  {
    slug: 'gtx-cli_v2_3_0',
    title: 'gtx-cli@2.3.0',
    headline: 'Faster, more reliable translate runs',
    date: '2025-09-12',
    authors: ['fernando'],
    summary: '',
    tags: ['gtx-cli', '2.3.0', 'translate', 'upload', 'setup'],
  },
  {
    slug: 'gt-next_v6_4_0',
    title: 'gt-next@6.4.0',
    headline: 'Locale aliasing',
    date: '2025-09-10',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', '6.4.0', 'Locale Aliasing', 'translation'],
  },
  {
    slug: 'gt-next_v6_3_0',
    title: 'gt-next@6.3.0',
    headline: 'Translate strings anywhere with msg()',
    date: '2025-08-27',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', '6.3.0', 'AI Development', 'String translation'],
  },
  {
    slug: 'gt-next_v6_2_0',
    title: 'gt-next@6.2.0',
    headline: 'Build-time processing with SWC',
    date: '2025-08-19',
    authors: ['ernest'],
    summary: '',
    tags: ['gt-next', '6.2.0', 'swc', 'plugin', 'build-time', 'linting'],
  },
];

/** Every filed post — the slugs this route serves. */
export const ALL_POSTS: readonly ArticlePost[] = [
  ...BLOG_POSTS,
  ...DEVLOG_POSTS,
];

/** The tree a post belongs to, or undefined when no post owns the slug. */
export function postTypeOf(slug: string): PostType | undefined {
  if (BLOG_POSTS.some((post) => post.slug === slug)) return 'blog';
  if (DEVLOG_POSTS.some((post) => post.slug === slug)) return 'devlog';
  return undefined;
}

export function findPost(slug: string): ArticlePost | undefined {
  return ALL_POSTS.find((post) => post.slug === slug);
}

/** The sibling list a post is read inside — its own content tree. */
export function siblingsOf(postType: PostType): readonly ArticlePost[] {
  return postType === 'blog' ? BLOG_POSTS : DEVLOG_POSTS;
}

/** The author records a post's frontmatter names, in order. */
export function authorsOf(post: ArticlePost): readonly ArticleAuthor[] {
  return post.authors.map((slug) => AUTHORS[slug] ?? { name: slug });
}
