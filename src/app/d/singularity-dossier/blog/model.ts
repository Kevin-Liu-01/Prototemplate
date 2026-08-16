import type { IndexedPost } from '../../singularity/company-sections/posts';

/**
 * The landing app's post-page model, ported with the article mirror:
 * category terms match as whole words only, article dates carry the
 * year, related posts rank by shared category then shared tags, and
 * devlog neighbors read newest-first.
 */

export const BLOG_CATEGORIES = [
  'Engineering',
  'Craft',
  'Community',
  'News',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type PostSummary = Pick<IndexedPost, 'slug' | 'title' | 'date' | 'tags'>;

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

function matchesAnyTerm(
  post: Pick<PostSummary, 'title' | 'tags'>,
  matcher: RegExp
) {
  return matcher.test([post.title, ...post.tags].join(' '));
}

export function getBlogCategory(
  post: Pick<PostSummary, 'title' | 'tags'>
): BlogCategory {
  if (matchesAnyTerm(post, COMMUNITY_MATCHER)) return 'Community';
  if (matchesAnyTerm(post, NEWS_MATCHER)) return 'News';
  if (matchesAnyTerm(post, CRAFT_MATCHER)) return 'Craft';
  return 'Engineering';
}

/** "2026-05-07" → "7 May" (index) or "7 May 2026" (article header). */
export function formatPostDate(
  sourceDate: string,
  locale: string,
  format: 'index' | 'article'
): string {
  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(sourceDate)
    ? `${sourceDate}T00:00:00Z`
    : sourceDate;
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) return sourceDate;

  const dateParts = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: format === 'index' ? 'long' : 'short',
    ...(format === 'article' ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((datePart) => datePart.type === type)?.value;
  const values = [part('day'), part('month')];

  if (format === 'article') values.push(part('year'));

  return values.filter(Boolean).join(' ');
}

export function rankRelatedPosts<T extends PostSummary>(
  currentPost: T,
  candidates: T[],
  limit: number
): T[] {
  const currentTags = new Set(
    currentPost.tags.map((tag) => tag.trim().toLowerCase())
  );
  const currentCategory = getBlogCategory(currentPost);

  return candidates
    .filter((candidate) => candidate.slug !== currentPost.slug)
    .map((candidate) => {
      const sharedTags = candidate.tags.reduce(
        (count, tag) =>
          count + (currentTags.has(tag.trim().toLowerCase()) ? 1 : 0),
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

export function getPostNeighbors<T extends PostSummary>(
  currentSlug: string,
  posts: T[]
): { previous: T | undefined; next: T | undefined } {
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: posts[currentIndex + 1],
    next: posts[currentIndex - 1],
  };
}
