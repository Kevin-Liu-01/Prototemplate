'use client';

import { RssIcon } from '@heroicons/react/24/solid';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import BlogCategoryLabel from './BlogCategoryLabel';
import BlogPostCover from './BlogPostCover';
import PostAuthors from './PostAuthors';
import {
  BLOG_CATEGORIES,
  formatPostDate,
  postHref,
  type BlogCategory,
  type IndexPost,
} from './blog-index-data';

export type BlogIndexPost = IndexPost & {
  category: BlogCategory;
  /** what the card says when its cover shows the previous mark (pictureNote in src/lib/previous-mark.ts), from the server */
  markNote?: string | null;
};

type BlogPostBoardProps = {
  posts: readonly BlogIndexPost[];
};

/* One card grammar for every slot, positioned so the title's link can
   stretch over the whole card (gt-cloud card.ts after #5863); CMS-length
   titles and summaries are clamped so no string can break a row's rhythm. */
const CARD =
  'group relative flex min-w-0 flex-col overflow-hidden rounded-md no-underline transition-colors bg-[color-mix(in_srgb,var(--tc-ink)_3.5%,transparent)] hover:bg-[color-mix(in_srgb,var(--tc-ink)_6%,transparent)]';

const PILL =
  'blog-pill h-[30px] cursor-pointer rounded-full border border-(--tc-hair) bg-transparent px-[15px] text-[12.5px] font-medium text-(--tc-ink-2) transition-colors hover:text-(--tc-ink) aria-pressed:border-(--tc-ink) aria-pressed:bg-(--tc-ink) aria-pressed:text-(--tc-paper)';

/* The feed is a real route on the shipped site, so it keeps its absolute
   destination the way the docs and dashboard links do. */
const RSS_HREF = 'https://generaltranslation.com/rss.xml';

function PostBody({
  post,
  base,
  lead = false,
}: {
  post: BlogIndexPost;
  base: string;
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
      {/* the lead's larger title belongs to its two-column desktop card;
          below 1000px every card stacks alike, so every title sizes alike.
          The title's link stretches over the card (after:inset-0), so the
          whole card is one target and the author links sit above it */}
      <strong
        className={`text-[21px] leading-[1.25] font-medium tracking-[-0.025em] [text-wrap:balance] ${
          lead ? 'line-clamp-3 min-[1000px]:text-[clamp(23px,2vw,28px)]' : 'line-clamp-2'
        }`}
      >
        <a href={postHref(base, post.slug)} className='after:absolute after:inset-0'>
          {post.title}
        </a>
      </strong>
      <span className={`text-[13.5px] leading-[1.6] text-(--tc-ink-2) ${lead ? 'line-clamp-3' : 'line-clamp-2'}`}>
        {post.summary}
      </span>
      <PostAuthors authors={post.authors} variant='card' />
      {post.markNote ? <span className='text-xs text-(--tc-ink-3)'>{post.markNote}</span> : null}
    </span>
  );
}

/**
 * The essays deck: filter pills and a search box over a lead card and a
 * three-column ledger (gt-cloud BlogPostBoard.tsx at #5863 and #5847).
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

  /* the front page leads with the first post in content/blog/order.json
     order on a two-column card; a filtered or searched deck keeps the plain
     three columns */
  const featuring = activeCategory === 'all' && needle === '';
  const lead = featuring ? visiblePosts[0] : undefined;
  const rest = lead ? visiblePosts.slice(1) : visiblePosts;

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
          <label className='blog-search flex h-[30px] items-center gap-[7px] rounded-full border border-(--tc-hair) px-3 text-(--tc-ink-3) transition-colors focus-within:border-(--tc-ink-3)'>
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
            className='blog-rss grid size-[30px] place-items-center rounded-full border border-(--tc-hair) text-(--tc-ink-2) transition-colors hover:text-(--tc-ink)'
          >
            <RssIcon className='size-3.5' aria-hidden='true' />
          </a>
        </div>
      </div>

      {lead && (
        <div className='mb-2.5 px-(--tc-gut)' data-testid='blog-feature'>
          <article
            data-testid='blog-feature-lead'
            data-previous-mark={lead.markNote ? '' : undefined}
            className={`${CARD} min-[1000px]:grid min-[1000px]:grid-cols-[3fr_2fr]`}
          >
            <div className='overflow-hidden'>
              <BlogPostCover
                post={lead}
                id={lead.slug}
                className='blog-post-cover-card aspect-video'
                sizes='(min-width: 1000px) 60vw, calc(100vw - 40px)'
                priority
              />
            </div>
            <PostBody post={lead} base={base} lead />
          </article>
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

      {rest.length === 0 && !lead ? (
        <div className='px-(--tc-gut) pt-2.5 pb-10 text-[13px] text-(--tc-ink-3)'>
          No matching posts
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-2.5 px-(--tc-gut) min-[720px]:grid-cols-2 min-[1000px]:grid-cols-3'>
          {rest.map((post) => (
            <article key={post.slug} className={CARD} data-previous-mark={post.markNote ? '' : undefined}>
              {/* every card frames its cover at 16:9 (gt-cloud #5847), lazily below the fold */}
              <BlogPostCover
                post={post}
                id={`grid-${post.slug}`}
                className='blog-post-cover-card aspect-video'
                sizes='(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 100vw'
              />
              <PostBody post={post} base={base} />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
