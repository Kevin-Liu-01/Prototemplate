/**
 * The real blog index, carried over verbatim from the old landing app's
 * content tree (apps/landing/content/{blog,devlog}/en-US at the last commit
 * before the tree moved to the generaltranslation/content submodule —
 * gt-cloud@82c9cac69^). Titles, dates, authors, summaries and tags are the
 * MDX frontmatter, untouched. Devlog frontmatter carries no summary field,
 * so each release's dek is compressed from that post's own opening lines —
 * no release is described with words its post doesn't contain.
 *
 * Post links used to point at the live articles on generaltranslation.com;
 * they now resolve against the CURRENT concept's own article route
 * (<base>/blog/<slug>), which renders the shell from this frontmatter and,
 * for the handful of slugs in post-bodies.ts, the real post body.
 */

export type IndexedPost = {
  slug: string;
  title: string;
  /** ISO date, exactly as the frontmatter stores it. */
  date: string;
  /** Author display names, resolved from content/authors/<slug>.mdx. */
  authors: string[];
  /** Frontmatter `summary` (blog) or a dek compressed from the post body (devlog). */
  summary: string;
  tags: string[];
};

/** Which content tree a post came from — content/blog vs content/devlog. */
export type PostKind = 'essay' | 'release';

/**
 * The concept-relative article path. `base` is the current final's own
 * prefix (`/d/<slug>`), so a section mounted by three concepts never links
 * out of the one the reader is in.
 */
export function postHref(base: string, slug: string): string {
  return `${base}/blog/${slug}`;
}

/** The newest blog post — the index's one filed feature plate. */
export const FEATURED: IndexedPost = {
  slug: 'branch_vs_ternary',
  title: 'Translating JSX - How to use Conditionals',
  date: '2025-09-26',
  authors: ['Ernest McCarter'],
  summary: 'Learn how to handle translations with better context and flexibility',
  tags: ['gt-next', 'Branch', 'ternary', 'conditional', 'translation', 'i18n'],
};

/** content/blog/en-US — the remaining essays, newest first. */
export const ESSAY_ROWS: IndexedPost[] = [
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
    title: 'Pluralization 101 in React',
    date: '2025-02-17',
    authors: ['Archie McKenzie'],
    summary: 'Best practices for rendering plurals in a React web app',
    tags: ['guide', 'plurals', 'internationalization', 'react', 'nextjs'],
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

/** content/devlog/en-US — every release note, newest first. */
export const RELEASES: IndexedPost[] = [
  {
    slug: 'gt-next_v6_12_0',
    title: 'gt-next@6.12.0',
    date: '2025-12-15',
    authors: ['Ernest McCarter'],
    summary:
      'declareStatic() — the string equivalent of <Static> — plus declareVar() and decodeVars(), for content scattered across services and utilities',
    tags: ['gt-next', 'declareStatic', 'declareVar'],
  },
  {
    slug: 'gt-next_v6_11_0',
    title: 'gt-next@6.11.0',
    date: '2025-12-09',
    authors: ['Ernest McCarter'],
    summary:
      'Adds $maxChars support to translation functions, building on formatCutoff() from generaltranslation@8.1.0',
    tags: ['gt-next', 'maxchars', 'character-limits'],
  },
  {
    slug: 'generaltranslation_v8_1_0',
    title: 'generaltranslation@8.1.0',
    date: '2025-12-06',
    authors: ['Ernest McCarter'],
    summary:
      'formatCutoff(): locale-aware text truncation that handles character limits with appropriate terminators per language',
    tags: ['generaltranslation', 'formatting', 'text-truncation'],
  },
  {
    slug: 'gt-next_v6_10_0',
    title: 'gt-next@6.10.0',
    date: '2025-12-03',
    authors: ['Ernest McCarter'],
    summary:
      'Experimental cached component support via experimentalLocaleResolution; legacy static request functions deprecated',
    tags: ['gt-next', 'cached components', 'SSG'],
  },
  {
    slug: 'gt-i18n_v0_1_0',
    title: 'gt-i18n@0.1.0',
    date: '2025-11-25',
    authors: ['Ernest McCarter'],
    summary:
      'A foundational step toward framework-agnostic JS internationalization: pure-JS logic split from framework-specific logic',
    tags: ['gt-i18n', 'pure-js', 'i18n'],
  },
  {
    slug: 'gt-next_v6_9_0',
    title: 'gt-next@6.9.0',
    date: '2025-11-18',
    authors: ['Ernest McCarter'],
    summary:
      'Static rendering: pre-rendered pages at build time. This behavior is deprecated — see gt-next@6.10.0 for the new behavior',
    tags: ['gt-next', 'static rendering', 'SSG'],
  },
  {
    slug: 'gt-react_v10_8_0',
    title: 'gt-react@10.8.0',
    date: '2025-11-14',
    authors: ['Ernest McCarter'],
    summary:
      'Feature flags through the enableI18n field — conditionally disable i18n, with sync and async loading patterns',
    tags: ['gt-react', 'feature flags', 'i18n'],
  },
  {
    slug: 'generaltranslation_v8',
    title: 'generaltranslation v8',
    date: '2025-11-10',
    authors: ['Brian Lou'],
    summary:
      'Significant API changes: branching introduced; unused endpoints deprecated. Older versions of the API are no longer supported',
    tags: ['generaltranslation', '8.0.0', 'api'],
  },
  {
    slug: 'gt-next_v6_8_0',
    title: 'gt-next@6.8.0',
    date: '2025-11-10',
    authors: ['Ernest McCarter'],
    summary:
      'The <Static> component: static function calls directly inside translations, preserving agreement, conjugation and word order',
    tags: ['gt-next', 'gt-react', 'static'],
  },
  {
    slug: 'generaltranslation_v7_8_0',
    title: 'generaltranslation@7.8.0',
    date: '2025-10-29',
    authors: ['Ernest McCarter'],
    summary:
      'formatListToParts() on the GT class and standalone: join arbitrary items, not just strings, into locale-aware lists',
    tags: ['generaltranslation', 'List formatting'],
  },
  {
    slug: 'local-edits',
    title: 'Local Edits in gtx-cli@2.4.0',
    date: '2025-10-21',
    authors: ['Fernando Aviles'],
    summary:
      'Save local translation edits directly from the CLI and keep everything in sync without touching the dashboard',
    tags: ['gtx-cli', 'save-local', 'translate'],
  },
  {
    slug: 'compiler_v1_0_0_gt-next_v6_7_0',
    title: 'compiler v1.0.0 + gt-next@6.7.0',
    date: '2025-10-10',
    authors: ['Ernest McCarter'],
    summary:
      '@general-translation/compiler v1.0.0 — build-time processing grown past the SWC plugin’s Next.js-only scope',
    tags: ['compiler', 'v1.0.0', 'i18n'],
  },
  {
    slug: 'gt-next_v6_6_0',
    title: 'gt-next@6.6.0',
    date: '2025-09-18',
    authors: ['Ernest McCarter'],
    summary:
      'A new direction for brown-field apps: t.obj() returns translated dictionary structures',
    tags: ['gt-next', 'Dictionary translation'],
  },
  {
    slug: 'gtx-cli_v2_3_0',
    title: 'gtx-cli@2.3.0',
    date: '2025-09-12',
    authors: ['Fernando Aviles'],
    summary:
      'Updated translate and upload behavior, with more visibility into the translation pipeline',
    tags: ['gtx-cli', 'translate', 'upload'],
  },
  {
    slug: 'gt-next_v6_4_0',
    title: 'gt-next@6.4.0',
    date: '2025-09-10',
    authors: ['Ernest McCarter'],
    summary:
      'Locale aliasing: overwrite any canonical locale with an alias via the customMapping configuration',
    tags: ['gt-next', 'Locale Aliasing'],
  },
  {
    slug: 'gt-next_v6_3_0',
    title: 'gt-next@6.3.0',
    date: '2025-08-27',
    authors: ['Ernest McCarter'],
    summary:
      'msg() translates strings anywhere in your codebase — wrap once, pass through m() at render time',
    tags: ['gt-next', 'AI Development', 'String translation'],
  },
  {
    slug: 'gt-next_v6_2_0',
    title: 'gt-next@6.2.0',
    date: '2025-08-19',
    authors: ['Ernest McCarter'],
    summary:
      'Runtime work moves to build time via an SWC plugin: compile-time hashing, pre-rendered translations, stricter validation',
    tags: ['gt-next', 'swc', 'build-time'],
  },
  {
    slug: 'react-core-linter_v0_1_0',
    title: '@generaltranslation/react-core-linter@0.1.0',
    date: '2025-01-26',
    authors: ['Ernest McCarter'],
    summary:
      'ESLint rules for React Core integration, catching common implementation errors seen in the wild',
    tags: ['react-core-linter', 'eslint', 'linting'],
  },
];

/** Every essay, newest first — the feature plate included. */
export const ESSAYS: IndexedPost[] = [FEATURED, ...ESSAY_ROWS];

/* The colophon's real range, derived from the frontmatter rather than
   restated (ISO dates sort lexicographically). */
const ALL_DATES = [...ESSAYS, ...RELEASES].map((post) => post.date).sort();
export const INDEX_FROM = ALL_DATES[0] ?? '';
export const INDEX_TO = ALL_DATES[ALL_DATES.length - 1] ?? '';

/* ============================================================
   THE ARTICLE MODEL — the index, read one entry at a time.
   Ported from apps/landing/src/components/blog/model.ts, minus the
   locale plumbing this single-locale study has no use for.
   ============================================================ */

/** Every filed post, essays first, each still newest-first inside its tree. */
export const ALL_POSTS: readonly IndexedPost[] = [...ESSAYS, ...RELEASES];

export function findPost(slug: string): IndexedPost | undefined {
  return ALL_POSTS.find((post) => post.slug === slug);
}

export function postKind(slug: string): PostKind {
  return RELEASES.some((post) => post.slug === slug) ? 'release' : 'essay';
}

/** The sibling list a post is read inside — its own content tree. */
export function siblingsOf(kind: PostKind): readonly IndexedPost[] {
  return kind === 'release' ? RELEASES : ESSAYS;
}

export const BLOG_CATEGORIES = ['Engineering', 'Craft', 'Community', 'News'] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

const COMMUNITY_TERMS = ['community', 'customer', 'event', 'open-source', 'open source'];
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

/* Terms match only as whole words or phrases, case-insensitive; a term never
   matches inside a larger word (e.g. 'event' must not match 'prevent'). */
function buildTermMatcher(terms: readonly string[]): RegExp {
  return new RegExp(`\\b(?:${terms.map(escapeRegExp).join('|')})\\b`, 'i');
}

const COMMUNITY_MATCHER = buildTermMatcher(COMMUNITY_TERMS);
const NEWS_MATCHER = buildTermMatcher(NEWS_TERMS);
const CRAFT_MATCHER = buildTermMatcher(CRAFT_TERMS);

type Categorizable = Pick<IndexedPost, 'title' | 'tags'>;

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
 * Rewrites a release title's `pkg@version` segments as `pkg version`.
 * Segments split on ' / ' WITH spaces (a bare '/' would shear scoped
 * names); a segment without a version separator passes through as-is.
 */
export function formatReleaseTitle(title: string): string {
  return title
    .split(/\s+\/\s+/)
    .map((segment) => {
      const at = segment.lastIndexOf('@');
      if (at <= 0) return segment;
      return `${segment.slice(0, at)} ${segment.slice(at + 1)}`;
    })
    .join(' / ');
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * `2025-09-26` → `26 Sep 2025` (article) or `26 Sep` (index). Spelled out
 * from the ISO parts rather than through Intl so the server and the client
 * render the same string byte for byte — the article shell is a client
 * component, and a timezone-shifted day would hydrate mismatched.
 */
export function formatPostDate(sourceDate: string, format: 'index' | 'article'): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sourceDate);
  if (!parts) return sourceDate;
  const [, year, month, day] = parts;
  const monthName = MONTHS_SHORT[Number(month) - 1];
  if (!monthName) return sourceDate;
  const stem = `${Number(day)} ${monthName}`;
  return format === 'article' ? `${stem} ${year}` : stem;
}

/** Same-category-first, then shared tags, then recency — the index's own ranking. */
export function rankRelatedPosts(
  currentPost: IndexedPost,
  candidates: readonly IndexedPost[],
  limit: number
): IndexedPost[] {
  const currentTags = new Set(currentPost.tags.map((tag) => tag.trim().toLowerCase()));
  const currentCategory = getBlogCategory(currentPost);

  return candidates
    .filter((candidate) => candidate.slug !== currentPost.slug)
    .map((candidate) => {
      const sharedTags = candidate.tags.reduce(
        (count, tag) => count + (currentTags.has(tag.trim().toLowerCase()) ? 1 : 0),
        0
      );
      const categoryScore = getBlogCategory(candidate) === currentCategory ? 5 : 0;
      return { candidate, score: categoryScore + sharedTags * 2 };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const byDate = b.candidate.date.localeCompare(a.candidate.date);
      if (byDate !== 0) return byDate;
      return a.candidate.title.localeCompare(b.candidate.title, undefined, { numeric: true });
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

/** Newest-first lists, so the NEXT post is the one above. */
export function getPostNeighbors(
  currentSlug: string,
  posts: readonly IndexedPost[]
): { previous: IndexedPost | undefined; next: IndexedPost | undefined } {
  const at = posts.findIndex((post) => post.slug === currentSlug);
  if (at === -1) return { previous: undefined, next: undefined };
  return { previous: posts[at + 1], next: posts[at - 1] };
}
