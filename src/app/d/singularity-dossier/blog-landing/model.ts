import type { IndexedPost } from '../../singularity/company-sections/posts';

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

function matchesAnyTerm(
  post: Pick<IndexedPost, 'title' | 'tags'>,
  matcher: RegExp
) {
  return matcher.test([post.title, ...post.tags].join(' '));
}

export function getBlogCategory(
  post: Pick<IndexedPost, 'title' | 'tags'>
): BlogCategory {
  if (matchesAnyTerm(post, COMMUNITY_MATCHER)) return 'Community';
  if (matchesAnyTerm(post, NEWS_MATCHER)) return 'News';
  if (matchesAnyTerm(post, CRAFT_MATCHER)) return 'Craft';
  return 'Engineering';
}

/** "2025-05-07" → "7 May" (the index date format, en-US fixed — this
    mirror renders one locale). */
export function formatDay(sourceDate: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(sourceDate)
    ? `${sourceDate}T00:00:00Z`
    : sourceDate;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return sourceDate;
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
    .formatToParts(date)
    .filter((part) => part.type === 'day' || part.type === 'month')
    .sort((a) => (a.type === 'day' ? -1 : 1))
    .map((part) => part.value)
    .join(' ');
}
