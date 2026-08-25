/**
 * The real blog index's content, vendored as a typed module.
 *
 * The shipped page reads MDX frontmatter off disk
 * (apps/landing/src/components/blog/utils.ts → content/blog/en-US and
 * content/devlog/en-US, a git submodule this repo does not carry), so the
 * frontmatter is transcribed here instead. Nothing is paraphrased:
 *
 *   POSTS    — content/blog/en-US/supporting-open-source-software.mdx.
 *              The tree holds exactly one blog post, so the real index
 *              renders exactly one card.
 *   AUTHORS  — content/authors/archie.mdx (name + avatar).
 *   RELEASES — content/devlog/en-US/*.mdx, all 52 of them, in the ORDER
 *              THE REAL PAGE RENDERS THEM: getAllPosts sorts by date
 *              descending with a descending title tiebreak, and this array
 *              is that resolved order, verified cell for cell against the
 *              running app. Storing the settled order keeps the board
 *              1-1 without re-implementing a locale-sensitive comparator.
 *
 * The helpers below (categories, date format, release-title split) are the
 * shipped model.ts and UpdatesBoard rules, carried over unchanged.
 */

/** A blog post, as the index needs it — the frontmatter fields, no body. */
export type IndexPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: readonly string[];
  images?: readonly string[];
  authors: readonly IndexAuthor[];
};

/** An author record, resolved from content/authors/<slug>.mdx. */
export type IndexAuthor = {
  name: string;
  avatar: string;
  email: string;
};

/** A devlog release, as the changelog strip needs it. */
export type IndexRelease = {
  slug: string;
  /** Frontmatter title — a release identifier, `pkg@version`. */
  title: string;
  /** Frontmatter headline: the release's one-line dek. */
  headline: string;
  date: string;
};

const ARCHIE: IndexAuthor = {
  name: 'Archie McKenzie',
  avatar: '/static/avatars/archie.png',
  email: 'archie@generaltranslation.com',
};

/** content/blog/en-US — the whole tree, newest first. */
export const POSTS: readonly IndexPost[] = [
  {
    slug: 'supporting-open-source-software',
    title: 'Supporting open-source software',
    date: '2026-08-17',
    summary:
      'General Translation is giving away $15,000 to developers who build and maintain open-source projects.',
    tags: ['open-source', 'grants', 'developers', 'community'],
    images: ['/static/blogs/supporting-open-source-software.png?v=8704532b'],
    authors: [ARCHIE],
  },
];

/** content/devlog/en-US — every release, in the real page's own order. */
export const RELEASES: readonly IndexRelease[] = [
  {
    slug: 'gt-sanity_v4_0_0',
    title: 'gt-sanity@4.0.0',
    headline: 'Support for Sanity 6 Studios',
    date: '2026-08-14',
  },
  {
    slug: 'gt-sanity_v3_1_1',
    title: 'gt-sanity@3.1.1',
    headline: 'Safer locale configuration',
    date: '2026-07-29',
  },
  {
    slug: 'gt-react_v11_1_2',
    title: 'gt-react@11.1.2',
    headline: 'SSR fixes for Cloudflare Workers',
    date: '2026-07-29',
  },
  {
    slug: 'gt-next_v11_1_3',
    title: 'gt-next@11.1.3',
    headline: 'Native locale routing for Pages Router',
    date: '2026-07-29',
  },
  {
    slug: 'gt-sanity_v3_1_0',
    title: 'gt-sanity@3.1.0',
    headline: 'Save local edits',
    date: '2026-07-28',
  },
  {
    slug: 'gt-tanstack-start_v11_1_0',
    title: 'gt-tanstack-start@11.1.0',
    headline: 'Opt-in locale routing',
    date: '2026-07-22',
  },
  {
    slug: 'gt-sanity_v3_0_0',
    title: 'gt-sanity@3.0.0',
    headline: 'Native Sanity localization plugins',
    date: '2026-07-22',
  },
  {
    slug: 'gt-sanity_v2_1_0',
    title: 'gt-sanity@2.1.0',
    headline: 'Field-level localization',
    date: '2026-07-14',
  },
  {
    slug: 'gt-react_v11_0_0',
    title: 'gt-react@11.0.0',
    headline: 'A shared runtime across React frameworks',
    date: '2026-07-03',
  },
  {
    slug: 'gt-react-native_v10_20_0',
    title: 'gt-react-native@10.20.0',
    headline: 'Sync locale reads from the native store',
    date: '2026-06-01',
  },
  {
    slug: 'gt-i18n_v0_9_0',
    title: 'gt-i18n@0.9.0',
    headline: 'Dictionary-backed translations',
    date: '2026-05-07',
  },
  {
    slug: 'gt-react_v10_19_0',
    title: 'gt-react@10.19.0',
    headline: 'Translation hot reload for SPAs',
    date: '2026-04-16',
  },
  {
    slug: 'gt-node_v0_6_0',
    title: 'gt-node@0.6.0',
    headline: 'Runtime translation with tx()',
    date: '2026-04-14',
  },
  {
    slug: 'gt-react_v10_18_0',
    title: 'gt-react@10.18.0',
    headline: 'Derivable translation context',
    date: '2026-04-06',
  },
  {
    slug: 'compiler_v1_3_0',
    title: 'compiler@1.3.0',
    headline: 'Automatic <T> wrapping at build time',
    date: '2026-04-06',
  },
  {
    slug: 'gt-sanity_v2_0_0',
    title: 'gt-sanity@2.0.0',
    headline: 'Zero-config translate dialog',
    date: '2026-04-01',
  },
  {
    slug: 'gt-react_v10_16_0',
    title: 'gt-react@10.16.0',
    headline: 'Localized relative time strings',
    date: '2026-04-01',
  },
  {
    slug: 'gt-next_v6_15_0',
    title: 'gt-next@6.15.0',
    headline: '<RelativeTime> across all React packages',
    date: '2026-04-01',
  },
  {
    slug: 'gt_v2_13_0',
    title: 'gt@2.13.0',
    headline: 'Automatic derivation in t()',
    date: '2026-03-20',
  },
  {
    slug: 'gt-cli_v2_12_0',
    title: 'gt@2.12.0',
    headline: 'derive() supports Python dictionaries and lists',
    date: '2026-03-19',
  },
  {
    slug: 'gt-cli_v2_11_3',
    title: 'gt@2.11.3',
    headline: 'Object and array access for derive()',
    date: '2026-03-19',
  },
  {
    slug: 'gt-cli_v2_11_0',
    title: 'gt@2.11.0',
    headline: 'Publish any file type to the CDN',
    date: '2026-03-18',
  },
  {
    slug: 'gt-react_v10_15_0',
    title: 'gt-react@10.15.0',
    headline: 'derive() in tagged templates',
    date: '2026-03-18',
  },
  {
    slug: 'gt-react_v10_13_0',
    title: 'gt-react@10.13.0',
    headline: 't as a tagged template literal',
    date: '2026-03-18',
  },
  {
    slug: 'gt-next_v6_14_0',
    title: 'gt-next@6.14.0',
    headline: 'Read the translation version at runtime',
    date: '2026-03-18',
  },
  {
    slug: 'gt-react_v10_12_0',
    title: 'gt-react@10.12.0',
    headline: 'Module-level translation with t()',
    date: '2026-03-16',
  },
  {
    slug: 'gtx-cli_v2_10_0',
    title: 'gtx-cli@2.10.0',
    headline: 'Per-key translation instructions',
    date: '2026-03-12',
  },
  {
    slug: 'gt-flask_v0_1_0',
    title: 'gt-flask@0.1.0 / gt-fastapi@0.1.0',
    headline: 'Inline translation for Python web frameworks',
    date: '2026-03-10',
  },
  {
    slug: 'gt-cli_v2_9_0',
    title: 'gt-cli@2.9.0',
    headline: 'Twilio Content Template translation',
    date: '2026-03-10',
  },
  {
    slug: 'gt-cli_v2_8_0',
    title: 'gt-cli@2.8.0',
    headline: 'Python project support',
    date: '2026-03-10',
  },
  {
    slug: 'gt-node_v0_3_0',
    title: 'gt-node@0.3.0',
    headline: 'Locale utility functions',
    date: '2026-03-09',
  },
  {
    slug: 'gt-next_v6_13_0',
    title: 'gt-next@6.13.0',
    headline: 'msg() accepts arrays',
    date: '2026-02-25',
  },
  {
    slug: 'gt-node_v0_2_0',
    title: 'gt-node@0.2.0',
    headline: 'Server-side translation for Node.js',
    date: '2026-02-17',
  },
  {
    slug: 'gt-tanstack-start_v0_1_0',
    title: 'gt-tanstack-start@0.1.0',
    headline: 'i18n for TanStack Start',
    date: '2026-02-16',
  },
  {
    slug: 'react-core-linter_v0_1_0',
    title: '@generaltranslation/react-core-linter@0.1.0',
    headline: 'ESLint rules for React Core',
    date: '2026-01-26',
  },
  {
    slug: 'gt-next_v6_12_0',
    title: 'gt-next@6.12.0',
    headline: 'Static derivation for string functions',
    date: '2025-12-15',
  },
  {
    slug: 'gt-next_v6_11_0',
    title: 'gt-next@6.11.0',
    headline: 'Character limits for translations',
    date: '2025-12-09',
  },
  {
    slug: 'generaltranslation_v8_1_0',
    title: 'generaltranslation@8.1.0',
    headline: 'Locale-aware text truncation',
    date: '2025-12-06',
  },
  {
    slug: 'gt-next_v6_10_0',
    title: 'gt-next@6.10.0',
    headline: 'Experimental cached component support',
    date: '2025-12-03',
  },
  {
    slug: 'gt-i18n_v0_1_0',
    title: 'gt-i18n@0.1.0',
    headline: 'Framework-agnostic string translation',
    date: '2025-11-25',
  },
  {
    slug: 'gt-next_v6_9_0',
    title: 'gt-next@6.9.0',
    headline: 'Static rendering support',
    date: '2025-11-18',
  },
  {
    slug: 'gt-react_v10_8_0',
    title: 'gt-react@10.8.0',
    headline: 'Feature-flagged i18n',
    date: '2025-11-14',
  },
  {
    slug: 'gt-next_v6_8_0',
    title: 'gt-next@6.8.0',
    headline: 'Static function calls inside translations',
    date: '2025-11-10',
  },
  {
    slug: 'generaltranslation_v8',
    title: 'generaltranslation@8.0.0',
    headline: 'Branching and API deprecations',
    date: '2025-11-10',
  },
  {
    slug: 'generaltranslation_v7_8_0',
    title: 'generaltranslation@7.8.0',
    headline: 'Locale-aware list formatting',
    date: '2025-10-29',
  },
  {
    slug: 'local-edits',
    title: 'gtx-cli@2.4.0',
    headline: 'Save translation edits from the CLI',
    date: '2025-10-21',
  },
  {
    slug: 'compiler_v1_0_0_gt-next_v6_7_0',
    title: 'compiler@1.0.0 / gt-next@6.7.0',
    headline: 'Build-time optimizations for every React app',
    date: '2025-10-10',
  },
  {
    slug: 'gt-next_v6_6_0',
    title: 'gt-next@6.6.0',
    headline: 'Translated dictionary subtrees with t.obj()',
    date: '2025-09-18',
  },
  {
    slug: 'gtx-cli_v2_3_0',
    title: 'gtx-cli@2.3.0',
    headline: 'Faster, more reliable translate runs',
    date: '2025-09-12',
  },
  {
    slug: 'gt-next_v6_4_0',
    title: 'gt-next@6.4.0',
    headline: 'Locale aliasing',
    date: '2025-09-10',
  },
  {
    slug: 'gt-next_v6_3_0',
    title: 'gt-next@6.3.0',
    headline: 'Translate strings anywhere with msg()',
    date: '2025-08-27',
  },
  {
    slug: 'gt-next_v6_2_0',
    title: 'gt-next@6.2.0',
    headline: 'Build-time processing with SWC',
    date: '2025-08-19',
  },
];

export const BLOG_CATEGORIES = [
  'Engineering',
  'Craft',
  'Community',
  'News',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

const COMMUNITY_TERMS = [
  'community',
  'customer',
  'event',
  'open-source',
  'open source',
];
const NEWS_TERMS = [
  'announce',
  'announcement',
  'company',
  'launch',
  'launching',
  'news',
  'release',
];
const CRAFT_TERMS = [
  'best-practices',
  'best practices',
  'comparison',
  'craft',
  'design',
  'developer-experience',
  'developer experience',
  'workflow',
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Terms match only as whole words or phrases, case-insensitive; a term never
// matches inside a larger word (e.g. 'event' must not match 'prevent').
function buildTermMatcher(terms: string[]): RegExp {
  return new RegExp(`\\b(?:${terms.map(escapeRegExp).join('|')})\\b`, 'i');
}

const COMMUNITY_MATCHER = buildTermMatcher(COMMUNITY_TERMS);
const NEWS_MATCHER = buildTermMatcher(NEWS_TERMS);
const CRAFT_MATCHER = buildTermMatcher(CRAFT_TERMS);

type Categorizable = { title: string; tags: readonly string[] };

function matchesAnyTerm(post: Categorizable, matcher: RegExp): boolean {
  return matcher.test([post.title, ...post.tags].join(' '));
}

export function getBlogCategory(post: Categorizable): BlogCategory {
  if (matchesAnyTerm(post, COMMUNITY_MATCHER)) return 'Community';
  if (matchesAnyTerm(post, NEWS_MATCHER)) return 'News';
  if (matchesAnyTerm(post, CRAFT_MATCHER)) return 'Craft';
  return 'Engineering';
}

/**
 * The index date line: day + long month, in UTC. The shipped model runs
 * Intl against the request locale; this control renders the en-US
 * resolution, the only locale it serves.
 */
export function formatPostDate(sourceDate: string): string {
  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(sourceDate)
    ? `${sourceDate}T00:00:00Z`
    : sourceDate;
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) return sourceDate;

  const dateParts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((datePart) => datePart.type === type)?.value;

  return [part('day'), part('month')].filter(Boolean).join(' ');
}

/**
 * Release titles are frontmatter like "pkg@2.1.0" — sometimes several
 * packages cut together, "gt-flask@0.1.0 / gt-django@0.1.0". The
 * delimiter is ' / ' WITH spaces: a bare '/' split would shear scoped
 * names like @generaltranslation/react-core-linter.
 */
export function splitRelease(title: string): {
  pkg: string;
  label: string;
  version: string;
} {
  const segments = title
    .split(/\s+\/\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const parsed = segments.map((segment) => {
    const at = segment.lastIndexOf('@');
    if (at <= 0) return { pkg: segment, version: '' };
    return { pkg: segment.slice(0, at), version: segment.slice(at + 1) };
  });
  const first = parsed[0] ?? { pkg: title, version: '' };
  return {
    pkg: first.pkg.replace(/^@[^/]+\//, ''),
    label: parsed
      .map((entry) => entry.pkg.replace(/^@[^/]+\//, ''))
      .join(' · '),
    version: first.version,
  };
}

/**
 * The concept-relative article path. `base` is the current final's own
 * prefix (`/d/<slug>`), so the index never links out of the reproduction
 * it belongs to.
 */
export function postHref(base: string, slug: string): string {
  return `${base}/blog/${slug}`;
}
