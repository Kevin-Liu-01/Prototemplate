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

type BlogIndexPost = IndexedPost & { category: BlogCategory };

/* One card grammar for every slot; CMS-length titles and summaries are
   clamped so no string can break a row's rhythm. */
const CARD =
  'group flex min-w-0 flex-col overflow-hidden rounded-md no-underline transition-colors bg-[color-mix(in_srgb,var(--tc-ink)_3.5%,transparent)] hover:bg-[color-mix(in_srgb,var(--tc-ink)_6%,transparent)]';

const PILL =
  'h-[30px] cursor-pointer rounded-full border border-(--tc-hair) bg-transparent px-[15px] text-[12.5px] font-medium text-(--tc-ink-2) transition-colors hover:text-(--tc-ink) aria-pressed:border-(--tc-ink) aria-pressed:bg-(--tc-ink) aria-pressed:text-(--tc-paper)';

function AuthorList({ authors }: { authors: string[] }) {
  if (authors.length === 0) return null;

  return (
    <span className='mt-auto flex flex-wrap gap-3 pt-4 text-[12.5px] text-(--tc-ink-3)'>
      {authors.map((author) => (
        <span key={author}>{author}</span>
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
        <time dateTime={post.date}>{formatDay(post.date)}</time>
        <span>{post.category}</span>
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
 * The essays board: filter pills and a post search over the deck, the
 * three newest posts leading full-size under their motif covers, the
 * rest as a plain three-column ledger.
 */
export default function EssaysBoard() {
  const posts: BlogIndexPost[] = ESSAYS.map((post) => ({
    ...post,
    category: getBlogCategory(post),
  }));
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
    <section className='tc-sec blog-essays'>
      <h2 className='sr-only'>Blog</h2>
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
        <div
          className='mb-2.5 grid grid-cols-1 gap-2.5 px-(--tc-gut) min-[1000px]:grid-cols-3 min-[1000px]:grid-rows-[1fr_1fr]'
          data-testid='blog-feature'
        >
          {featured.map((post, index) => {
            const motif = motifFor(post);
            const lead = index === 0;
            return (
              <a
                key={post.slug}
                href={postHref(post.slug)}
                data-testid={lead ? 'blog-feature-lead' : 'blog-feature-side'}
                /* the lead adopts the grid's row tracks (subgrid): its
                   cover fills row one exactly, its seams are the grid's */
                className={`${CARD} ${
                  lead
                    ? 'min-[1000px]:col-span-2 min-[1000px]:row-span-2 min-[1000px]:grid min-[1000px]:grid-rows-subgrid'
                    : ''
                }`}
              >
                {motif && (
                  <BlogFeatureDither
                    motif={motif}
                    id={post.slug}
                    className={
                      lead
                        ? 'aspect-[16/7] min-[1000px]:aspect-auto min-[1000px]:h-full'
                        : 'aspect-[16/7] min-[1000px]:aspect-auto min-[1000px]:min-h-[120px] min-[1000px]:flex-1'
                    }
                  />
                )}
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
            <a key={post.slug} href={postHref(post.slug)} className={CARD}>
              {!featuring && index < 3 && (
                <BlogFeatureDither
                  motif={motifFor(post)}
                  id={`grid-${post.slug}`}
                  className='aspect-[16/7]'
                />
              )}
              <PostBody post={post} />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
