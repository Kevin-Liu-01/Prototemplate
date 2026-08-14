import type { IndexedPost } from '../../singularity/company-sections/posts';

/**
 * The landing app's category and date grammar, ported with the page:
 * every post files under one of four desks, derived from its own
 * frontmatter terms; dates render "7 May" the way the index cards do.
 */

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

function matchesAnyTerm(post: IndexedPost, terms: string[]) {
  const searchable = [post.title, ...post.tags].join(' ').toLowerCase();
  return terms.some((term) => searchable.includes(term));
}

export function getBlogCategory(post: IndexedPost): BlogCategory {
  if (matchesAnyTerm(post, COMMUNITY_TERMS)) return 'Community';
  if (matchesAnyTerm(post, NEWS_TERMS)) return 'News';
  if (matchesAnyTerm(post, CRAFT_TERMS)) return 'Craft';
  return 'Engineering';
}

/** "2025-05-07" → "7 May" (the index format). */
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
