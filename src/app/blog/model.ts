import { BLOG_POSTS, BLOG_RELEASES } from '@/lib/blog-posts';
import type { BlogPostMeta, BlogRelease } from '@/lib/blog-posts';
import { formatDay } from '@/lib/dates';
import type { ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

/**
 * The shapes the blog routes share: the index (/blog, BlogViewer) and a
 * post (/blog/[slug], PostViewer) list the same posts in the same order,
 * number them the same way and feed the shell the same run. Pure data on
 * top of the generated src/lib/blog-posts.ts, so both client viewers and
 * the server pages import one set of names.
 */

/** The changelog's one row in the sidebar, and the anchor of its section on the index. */
export const CHANGELOG_ID = 'changelog';

/** A post with its place in the list, newest first, and its number padded to two digits. */
export type NumberedPost = { post: BlogPostMeta; n: string };

/** A release with its place in the changelog, newest first. */
export type NumberedRelease = { release: BlogRelease; n: string };

export const POSTS: readonly NumberedPost[] = BLOG_POSTS.map((post, i) => ({ post, n: pad2(i + 1) }));

export const RELEASES: readonly NumberedRelease[] = BLOG_RELEASES.map((release, i) => ({ release, n: pad2(i + 1) }));

/** The distinct authors of the posts. */
export const AUTHOR_COUNT = new Set(BLOG_POSTS.flatMap((post) => post.authors.map((author) => author.slug))).size;

/** The page of one post. */
export function postHref(slug: string): string {
  return `/blog/${slug}`;
}

/** A release's page: the production mirror renders the changelog as generaltranslation.com does. */
export function releaseHref(slug: string): string {
  return `/d/production/blog/${slug}`;
}

/** One post by slug. */
export function findPost(slug: string): NumberedPost | undefined {
  return POSTS.find((row) => row.post.slug === slug);
}

/** `Kevin Liu and Taylor Fang`, `Archie McKenzie`. */
export function authorNames(post: BlogPostMeta): string {
  const names = post.authors.map((author) => author.name);
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** The sidebar names of the titles that run past two lines in the 208px run; the title stays the grid caption and the hover title. */
const SHORT: Readonly<Record<string, string>> = {
  'daniel-white': 'Daniel White',
  'fuma-nama': 'Fuma Nama',
};

/**
 * The run under the Knowledge group's Blog row (`under`): every post
 * numbered 01 onward, newest first, each a link to its page and previewed
 * by its cover, then the changelog as one row that opens its section on the
 * index. The description carries the date and the authors first, so the
 * sidebar filter matches a post by either.
 */
export const SECTIONS: readonly ShellSection[] = [
  {
    id: 'posts',
    label: 'Posts',
    under: 'blog',
    items: POSTS.map(({ post, n }) => ({
      id: post.slug,
      n,
      title: post.title,
      short: SHORT[post.slug],
      href: postHref(post.slug),
      desc: `${formatDay(post.date)}. ${authorNames(post)}. ${post.summary}`,
      ...(post.image ? { shot: post.imageLight ? { light: post.imageLight, dark: post.image } : { light: post.image } } : {}),
    })),
  },
  {
    id: CHANGELOG_ID,
    label: 'Changelog',
    under: 'blog',
    paged: false,
    items: [
      {
        id: CHANGELOG_ID,
        n: '',
        title: 'Changelog',
        href: `/blog#${CHANGELOG_ID}`,
        desc: `${BLOG_RELEASES.length} releases of the General Translation libraries, newest first.`,
      },
    ],
  },
];
