'use client';

import { useState } from 'react';
import { Rss, Search } from 'lucide-react';

import {
  BLOG_URL,
  ESSAYS,
  postHref,
  type IndexedPost,
} from '../../singularity/company-sections/posts';
import BlogFeatureDither, { motifFor } from './BlogFeatureDither';
import {
  BLOG_CATEGORIES,
  formatDay,
  getBlogCategory,
  type BlogCategory,
} from './model';

/* One card grammar for every slot; CMS-length titles and summaries are
   clamped so no string can break a row's rhythm. */
const CARD =
  'group flex min-w-0 flex-col overflow-hidden rounded-md no-underline transition-colors bg-[color-mix(in_srgb,var(--tc-ink)_3.5%,transparent)] hover:bg-[color-mix(in_srgb,var(--tc-ink)_6%,transparent)]';

const PILL =
  'h-[30px] cursor-pointer rounded-full border border-(--tc-hair) bg-transparent px-[15px] text-[12.5px] font-medium text-(--tc-ink-2) transition-colors hover:text-(--tc-ink) aria-pressed:border-(--tc-ink) aria-pressed:bg-(--tc-ink) aria-pressed:text-(--tc-paper)';

function PostBody({ post, lead = false }: { post: IndexedPost; lead?: boolean }) {
  return (
    <span className='flex min-h-0 flex-1 flex-col gap-[11px] px-6 pt-[22px] pb-[26px]'>
      <span className='flex gap-3.5 text-xs text-(--tc-ink-3)'>
        <time dateTime={post.date}>{formatDay(post.date)}</time>
        <span>{getBlogCategory(post)}</span>
      </span>
      <strong
        className={`line-clamp-2 font-medium leading-[1.25] tracking-[-0.025em] [text-wrap:balance] ${
          lead ? 'text-[clamp(23px,2vw,28px)]' : 'text-[21px]'
        }`}
      >
        {post.title}
      </strong>
      <span className='line-clamp-2 text-[13.5px] leading-[1.6] text-(--tc-ink-2)'>
        {post.summary}
      </span>
      {post.authors.length > 0 && (
        <span className='mt-auto flex flex-wrap gap-3 pt-4 text-[12.5px] text-(--tc-ink-3)'>
          {post.authors.map((author) => (
            <span key={author}>{author}</span>
          ))}
        </span>
      )}
    </span>
  );
}

/**
 * The essays board from the landing redesign: rounded filter pills, a
 * post search, the feed, and the three newest posts leading full-size
 * under slug-derived blue Bayer motif covers — the lead on subgrid so
 * its cover seam is the grid's own row seam.
 */
export default function EssaysBoard() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>(
    'all'
  );
  const [query, setQuery] = useState('');
  const availableCategories = BLOG_CATEGORIES.filter((category) =>
    ESSAYS.some((post) => getBlogCategory(post) === category)
  );
  const needle = query.trim().toLowerCase();
  const visiblePosts = ESSAYS.filter((post) => {
    if (activeCategory !== 'all' && getBlogCategory(post) !== activeCategory) {
      return false;
    }
    if (!needle) return true;
    return `${post.title} ${post.summary}`.toLowerCase().includes(needle);
  });

  /* the front page leads with its three newest posts full-size; a
     filter or a search collapses everything to the plain ledger */
  const featuring = activeCategory === 'all' && needle === '';
  const featured = featuring ? visiblePosts.slice(0, 3) : [];
  const rest = featuring ? visiblePosts.slice(3) : visiblePosts;

  return (
    <section className='tc-sec blog-essays'>
      <div className='flex flex-wrap items-center justify-between gap-x-5 gap-y-3 px-(--tc-gut) pt-[18px] pb-[20px]'>
        <div className='flex flex-wrap gap-2' aria-label='Filter blog posts'>
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
              {category}
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
            href={`${BLOG_URL.replace(/\/blog$/, '')}/rss.xml`}
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
        <div className='mb-2.5 grid grid-cols-1 gap-2.5 px-(--tc-gut) min-[1000px]:grid-cols-3 min-[1000px]:grid-rows-[1fr_1fr]'>
          {featured.map((post, index) => {
            const lead = index === 0;
            return (
              <a
                key={post.slug}
                href={postHref(post.slug)}
                className={`${CARD} ${
                  lead
                    ? 'min-[1000px]:col-span-2 min-[1000px]:row-span-2 min-[1000px]:grid min-[1000px]:grid-rows-subgrid'
                    : ''
                }`}
              >
                <BlogFeatureDither
                  motif={motifFor(post.slug)}
                  id={post.slug}
                  className={
                    lead
                      ? 'aspect-[16/7] min-[1000px]:aspect-auto min-[1000px]:h-full'
                      : 'aspect-[16/7] min-[1000px]:aspect-auto min-[1000px]:min-h-[120px] min-[1000px]:flex-1'
                  }
                />
                <PostBody post={post} lead={lead} />
              </a>
            );
          })}
        </div>
      )}

      {rest.length === 0 && featured.length === 0 ? (
        <div
          className='px-(--tc-gut) pt-2.5 pb-10 text-[13px] text-(--tc-ink-3)'
          role='status'
        >
          No matching posts
        </div>
      ) : (
        <div
          className='grid grid-cols-1 gap-2.5 px-(--tc-gut) min-[720px]:grid-cols-2 min-[1000px]:grid-cols-3'
          aria-live='polite'
        >
          {rest.map((post) => (
            <a key={post.slug} href={postHref(post.slug)} className={CARD}>
              <PostBody post={post} />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
