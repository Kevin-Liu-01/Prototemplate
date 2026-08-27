/**
 * PRODUCTION · the blog's model rules, ported from the shipped page's own.
 *
 * Two shipped modules, carried over unchanged in behaviour:
 *
 *   apps/landing/src/components/blog/model.ts — the category matcher, the
 *   release-title rewrite, the date formats, the related-post ranking and
 *   the previous/next walk.
 *
 *   apps/landing/src/lib/slug-suggest.ts — the flat half of it. A missing
 *   slug on the shipped route never dead-ends on a generic 404: a confident
 *   match redirects, and anything else renders the closest posts under the
 *   blog's own not-found shell. Only `normalizeSlug` and `suggestSlug` (with
 *   the helpers they need) are ported; `resolveDocsPath`, the tree-aware
 *   resolver in the same file, belongs to the docs and has no route here.
 *
 * The one deliberate change is the date format: the shipped model formats
 * through Intl with the request locale, and this control renders the English
 * strings from the ISO parts instead. Same output for en-US, and the article
 * shell is a client component — a timezone-shifted day would hydrate
 * mismatched.
 */

import type { ArticlePost } from './blog-article-data';

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

/* Terms match only as whole words or phrases, case-insensitive; a term never
   matches inside a larger word (e.g. 'event' must not match 'prevent'). */
function buildTermMatcher(terms: readonly string[]): RegExp {
  return new RegExp(`\\b(?:${terms.map(escapeRegExp).join('|')})\\b`, 'i');
}

const COMMUNITY_MATCHER = buildTermMatcher(COMMUNITY_TERMS);
const NEWS_MATCHER = buildTermMatcher(NEWS_TERMS);
const CRAFT_MATCHER = buildTermMatcher(CRAFT_TERMS);

type Categorizable = Pick<ArticlePost, 'title' | 'tags'>;

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

/* The shipped formatter asks Intl for `month: 'long'` on an index card and
   `month: 'short'` plus the year in an article byline. Two lists, same
   split — index cards read "18 November", bylines read "15 Dec 2025". */
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

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

/** `2025-12-15` → `15 Dec 2025` (article) or `15 December` (index). */
export function formatPostDate(
  sourceDate: string,
  format: 'index' | 'article'
): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sourceDate);
  if (!parts) return sourceDate;
  const [, year, month, day] = parts;
  const index = Number(month) - 1;
  const monthName =
    format === 'article' ? MONTHS_SHORT[index] : MONTHS_LONG[index];
  if (!monthName) return sourceDate;
  const stem = `${Number(day)} ${monthName}`;
  return format === 'article' ? `${stem} ${year}` : stem;
}

/** Same-category-first, then shared tags, then recency. */
export function rankRelatedPosts(
  currentPost: ArticlePost,
  candidates: readonly ArticlePost[],
  limit: number
): ArticlePost[] {
  const currentTags = new Set(
    currentPost.tags.map((tag) => tag.trim().toLowerCase())
  );
  const currentCategory = getBlogCategory(currentPost);

  return candidates
    .filter((candidate) => candidate.slug !== currentPost.slug)
    .map((candidate) => {
      const sharedTags = candidate.tags.reduce(
        (count, tag) => count + (currentTags.has(tag.trim().toLowerCase()) ? 1 : 0),
        0
      );
      const categoryScore =
        getBlogCategory(candidate) === currentCategory ? 5 : 0;
      return { candidate, score: categoryScore + sharedTags * 2 };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const dateDifference =
        new Date(b.candidate.date).getTime() -
        new Date(a.candidate.date).getTime();
      if (dateDifference !== 0) return dateDifference;
      return a.candidate.title.localeCompare(b.candidate.title, undefined, {
        numeric: true,
      });
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

/** Newest-first lists, so the NEXT post is the one above. */
export function getPostNeighbors(
  currentSlug: string,
  posts: readonly ArticlePost[]
): { previous: ArticlePost | undefined; next: ArticlePost | undefined } {
  const at = posts.findIndex((post) => post.slug === currentSlug);
  if (at === -1) return { previous: undefined, next: undefined };
  return { previous: posts[at + 1], next: posts[at - 1] };
}

/* ------------------------------------------------------------------
   The missing-slug ladder (lib/slug-suggest.ts, the flat primitive)
   ------------------------------------------------------------------ */

/** Max edit distance a fuzzy (non-exact) match may have to auto-redirect. */
const FUZZY_REDIRECT_MAX = 2;
/** A fuzzy best match must beat the runner-up by at least this much. */
const FUZZY_REDIRECT_LEAD = 2;
/** Normalized slugs shorter than this never fuzzy-redirect. */
const FUZZY_REDIRECT_MIN_LENGTH = 4;
/** Candidates beyond this edit distance are dropped from suggestions. */
const SUGGESTION_BOUND = 5;
/** Containment matches only count when both sides are at least this long. */
const CONTAINMENT_MIN_LENGTH = 3;
/** A wanted segment must be at least this long to complete as a prefix. */
const PREFIX_MIN_LENGTH = 3;
const SUGGESTION_COUNT = 5;

/**
 * Canonical comparison form of a slug: lowercased, whitespace and stray
 * dashes trimmed, and one trailing plural `s` stripped.
 */
export function normalizeSlug(slug: string): string {
  let normalized = slug.toLowerCase().trim();
  normalized = normalized.replace(/^-+/, '').replace(/-+$/, '');
  if (normalized.length > 1 && normalized.endsWith('s')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/**
 * True when `inner` sits inside `outer` on segment boundaries. Bare
 * substring containment is not enough: it matches mid-word, so any page
 * whose name is spelled inside a longer word scored as a near-miss.
 */
function embedsSegment(outer: string, inner: string): boolean {
  if (
    inner.length < CONTAINMENT_MIN_LENGTH ||
    outer.length < CONTAINMENT_MIN_LENGTH
  ) {
    return false;
  }
  for (
    let at = outer.indexOf(inner);
    at !== -1;
    at = outer.indexOf(inner, at + 1)
  ) {
    const end = at + inner.length;
    const opensOnBoundary = at === 0 || outer[at - 1] === '-';
    const closesOnBoundary = end === outer.length || outer[end] === '-';
    if (opensOnBoundary && closesOnBoundary) return true;
  }
  return false;
}

/** A segment-boundary embedding either way, or one slug completing the
    other as a prefix. */
function relatedByShape(candidateNorm: string, wantedNorm: string): boolean {
  if (
    embedsSegment(candidateNorm, wantedNorm) ||
    embedsSegment(wantedNorm, candidateNorm)
  ) {
    return true;
  }
  if (
    wantedNorm.length >= PREFIX_MIN_LENGTH &&
    candidateNorm.startsWith(wantedNorm)
  ) {
    return true;
  }
  return (
    candidateNorm.length >= PREFIX_MIN_LENGTH &&
    wantedNorm.startsWith(candidateNorm)
  );
}

/** Levenshtein distance, abandoned early once it provably exceeds `bound`. */
export function boundedLevenshtein(
  a: string,
  b: string,
  bound: number
): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > bound) return Infinity;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous: number[] = [];
  for (let j = 0; j <= b.length; j++) previous.push(j);

  for (let i = 1; i <= a.length; i++) {
    const current: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const substitution =
        (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      const deletion = (previous[j] ?? 0) + 1;
      const insertion = (current[j - 1] ?? 0) + 1;
      const value = Math.min(substitution, deletion, insertion);
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > bound) return Infinity;
    previous = current;
  }

  const distance = previous[b.length] ?? Infinity;
  return distance <= bound ? distance : Infinity;
}

/**
 * Two slugs that differ only in their numbers are different versions of the
 * same thing, never a typo for one another: `gt-next_v6_12_0` and
 * `gt-next_v6_13_0` sit one edit apart, and correcting between them would
 * serve a reader the wrong release's notes.
 */
function differsOnlyInNumbers(a: string, b: string): boolean {
  if (a === b) return false;
  const shape = (value: string) => value.replace(/\d+/g, '#');
  return shape(a) === shape(b);
}

export type SlugSuggestResult = {
  /** Present only for a confident match; always one of `candidates`. */
  redirect?: string;
  /** Closest candidates (best first), capped at five. */
  suggestions: string[];
};

export function suggestSlug(
  wanted: string,
  candidates: readonly string[]
): SlugSuggestResult {
  const wantedNorm = normalizeSlug(wanted);
  if (!wantedNorm) return { suggestions: [] };

  const seen = new Set<string>();
  const scored: { candidate: string; score: number }[] = [];
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    const candidateNorm = normalizeSlug(candidate);
    if (!candidateNorm) continue;

    let score: number;
    if (candidateNorm === wantedNorm) {
      score = 0;
    } else if (relatedByShape(candidateNorm, wantedNorm)) {
      score = 1;
    } else {
      score = boundedLevenshtein(wantedNorm, candidateNorm, SUGGESTION_BOUND);
    }
    if (Number.isFinite(score)) scored.push({ candidate, score });
  }

  scored.sort(
    (x, y) => x.score - y.score || x.candidate.localeCompare(y.candidate)
  );
  const suggestions = scored
    .slice(0, SUGGESTION_COUNT)
    .map((entry) => entry.candidate);

  const best = scored[0];
  const runnerUp = scored[1];
  if (!best) return { suggestions };
  if (differsOnlyInNumbers(wantedNorm, normalizeSlug(best.candidate))) {
    return { suggestions };
  }

  if (best.score === 0) {
    if (!runnerUp || runnerUp.score > 0) {
      return { redirect: best.candidate, suggestions };
    }
    return { suggestions };
  }

  if (
    best.score <= FUZZY_REDIRECT_MAX &&
    wantedNorm.length >= FUZZY_REDIRECT_MIN_LENGTH &&
    (!runnerUp || runnerUp.score - best.score >= FUZZY_REDIRECT_LEAD)
  ) {
    return { redirect: best.candidate, suggestions };
  }

  return { suggestions };
}
