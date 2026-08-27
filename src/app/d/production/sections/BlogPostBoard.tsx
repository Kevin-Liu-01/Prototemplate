'use client';

import { Rss, Search } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import BlogCategoryLabel from './BlogCategoryLabel';
import BlogPostCover from './BlogPostCover';
import {
  BLOG_CATEGORIES,
  formatPostDate,
  postHref,
  type BlogCategory,
  type IndexAuthor,
  type IndexPost,
} from './blog-index-data';

export type BlogIndexPost = IndexPost & {
  category: BlogCategory;
};

type BlogPostBoardProps = {
  posts: readonly BlogIndexPost[];
};

/* One card grammar for every slot; CMS-length titles and summaries are
   clamped so no string can break a row's rhythm. */
const CARD =
  'group flex min-w-0 flex-col overflow-hidden rounded-md no-underline transition-colors bg-[color-mix(in_srgb,var(--tc-ink)_3.5%,transparent)] hover:bg-[color-mix(in_srgb,var(--tc-ink)_6%,transparent)]';

const PILL =
  'h-[30px] cursor-pointer rounded-full border border-(--tc-hair) bg-transparent px-[15px] text-[12.5px] font-medium text-(--tc-ink-2) transition-colors hover:text-(--tc-ink) aria-pressed:border-(--tc-ink) aria-pressed:bg-(--tc-ink) aria-pressed:text-(--tc-paper)';

/* The feed is a real route on the shipped site, so it keeps its absolute
   destination the way the docs and dashboard links do. */
const RSS_HREF = 'https://generaltranslation.com/rss.xml';

function AuthorList({ authors }: { authors: readonly IndexAuthor[] }) {
  if (authors.length === 0) return null;

  return (
    <span className='mt-auto flex flex-wrap gap-3 pt-4 text-[12.5px] text-(--tc-ink-3)'>
      {authors.map((author, index) => (
        <span
          key={author.email || index}
          className='inline-flex items-center gap-2'
        >
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt=''
              width={20}
              height={20}
              className='rounded-full'
            />
          ) : null}
          {author.name}
        </span>
      ))}
    </span>
  );
}

function PostBody({
  post,
  lead = false,
}: {
  post: BlogIndexPost;
  lead?: boolean;
}) {
  return (
    <span className='flex min-h-0 flex-1 flex-col gap-[11px] px-6 pt-[22px] pb-[26px]'>
      <span className='flex gap-3.5 text-xs text-(--tc-ink-3)'>
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        <span>
          <BlogCategoryLabel category={post.category} />
        </span>
      </span>
      <strong
        className={`line-clamp-2 leading-[1.25] font-medium tracking-[-0.025em] [text-wrap:balance] ${
          lead ? 'text-[clamp(23px,2vw,28px)]' : 'text-[21px]'
        }`}
      >
        {post.title}
      </strong>
      <span className='line-clamp-2 text-[13.5px] leading-[1.6] text-(--tc-ink-2)'>
        {post.summary}
      </span>
      <AuthorList authors={post.authors} />
    </span>
  );
}

/**
 * The essays deck: filter pills and a search box over a feature grid and
 * a three-column ledger.
 *
 * Ported from apps/landing/src/components/blog/BlogPostBoard.tsx. Post
 * links resolve against this concept's own base rather than the shipped
 * locale-prefixed /blog/<slug>, and the copy that the shipped board runs
 * through gt()/<T> is rendered as its English string.
 */
export default function BlogPostBoard({ posts }: BlogPostBoardProps) {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>(
    'all'
  );
  const [query, setQuery] = useState('');
  // a tag only shows when it has posts behind it
  const availableCategories = BLOG_CATEGORIES.filter((category) =>
    posts.some((post) => post.category === category)
  );
  const needle = query.trim().toLowerCase();
  const visiblePosts = posts.filter((post) => {
    if (activeCategory !== 'all' && post.category !== activeCategory) {
      return false;
    }
    if (!needle) return true;
    return `${post.title} ${post.summary}`.toLowerCase().includes(needle);
  });

  /* the front page leads with its three newest posts full-size; a
     filtered or searched deck keeps the plain three columns, its top
     three cards carrying their covers */
  const featuring = activeCategory === 'all' && needle === '';
  const featured = featuring ? visiblePosts.slice(0, 3) : [];
  const rest = featuring ? visiblePosts.slice(3) : visiblePosts;

  return (
    <>
      <div className='flex flex-wrap items-center justify-between gap-x-5 gap-y-3 px-(--tc-gut) pt-[18px] pb-[20px]'>
        <div
          className='flex flex-wrap gap-2'
          role='group'
          aria-label='Filter blog posts'
        >
          <button
            type='button'
            className={PILL}
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {availableCategories.map((category) => (
            <button
              key={category}
              type='button'
              className={PILL}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              <BlogCategoryLabel category={category} />
            </button>
          ))}
        </div>
        <div className='flex items-center gap-2'>
          <label className='flex h-[30px] items-center gap-[7px] rounded-full border border-(--tc-hair) px-3 text-(--tc-ink-3) transition-colors focus-within:border-(--tc-ink-3)'>
            <Search size={13} aria-hidden='true' />
            <input
              type='search'
              value={query}
              placeholder='Search posts'
              aria-label='Search posts'
              className='w-[148px] border-0 bg-transparent text-[12.5px] text-(--tc-ink) outline-none placeholder:text-(--tc-ink-3)'
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <a
            href={RSS_HREF}
            aria-label='RSS feed'
            className='grid size-[30px] place-items-center rounded-full border border-(--tc-hair) text-(--tc-ink-2) transition-colors hover:text-(--tc-ink)'
          >
            <Rss size={14} aria-hidden='true' />
          </a>
        </div>
      </div>

      {featured.length > 0 && (
        // the same three columns as the ledger below — the lead spans
        // two of them, so every vertical seam is shared
        <div
          className='mb-2.5 grid grid-cols-1 gap-2.5 px-(--tc-gut) min-[1000px]:grid-cols-3 min-[1000px]:grid-rows-[1fr_1fr]'
          data-testid='blog-feature'
        >
          {featured.map((post, index) => {
            const lead = index === 0;
            return (
              <a
                key={post.slug}
                href={postHref(base, post.slug)}
                data-testid={lead ? 'blog-feature-lead' : 'blog-feature-side'}
                /* the lead adopts the grid's row tracks (subgrid): its
                   cover fills row one exactly, its seams are the grid's */
                className={`${CARD} ${
                  lead
                    ? 'min-[1000px]:col-span-2 min-[1000px]:row-span-2 min-[1000px]:grid min-[1000px]:grid-rows-subgrid'
                    : ''
                }`}
              >
                <span
                  className={
                    lead
                      ? 'relative block aspect-[16/7] overflow-hidden min-[1000px]:aspect-auto'
                      : 'relative block aspect-[16/7] overflow-hidden min-[1000px]:aspect-auto min-[1000px]:min-h-[120px] min-[1000px]:flex-1'
                  }
                >
                  <BlogPostCover
                    post={post}
                    id={post.slug}
                    className='h-full w-full'
                    sizes={
                      lead
                        ? '(min-width: 1000px) 60vw, calc(100vw - 40px)'
                        : '(min-width: 1000px) 30vw, calc(100vw - 40px)'
                    }
                    priority={lead}
                  />
                </span>
                <PostBody post={post} lead={lead} />
              </a>
            );
          })}
        </div>
      )}

      {/* one persistent status line announces the deck's changes; the
          card grid itself is not a live region (announcing every added
          card in full is noise, and removals never announce) */}
      <p role='status' className='sr-only'>
        {visiblePosts.length === 0
          ? 'No matching posts'
          : visiblePosts.length === 1
            ? '1 post shown'
            : `${visiblePosts.length} posts shown`}
      </p>

      {rest.length === 0 && featured.length === 0 ? (
        <div className='px-(--tc-gut) pt-2.5 pb-10 text-[13px] text-(--tc-ink-3)'>
          No matching posts
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-2.5 px-(--tc-gut) min-[720px]:grid-cols-2 min-[1000px]:grid-cols-3'>
          {rest.map((post, index) => (
            <a
              key={post.slug}
              href={postHref(base, post.slug)}
              className={CARD}
            >
              {!featuring && index < 3 && (
                <BlogPostCover
                  post={post}
                  id={`grid-${post.slug}`}
                  className='aspect-[16/7]'
                  sizes='(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 100vw'
                />
              )}
              <PostBody post={post} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}
