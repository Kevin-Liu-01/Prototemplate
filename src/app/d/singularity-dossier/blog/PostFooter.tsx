import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';

import {
  postHref,
  type IndexedPost,
} from '../../singularity/company-sections/posts';
import BlogFeatureDither, { motifFor } from './BlogFeatureDither';
import { formatPostDate, getBlogCategory } from './model';

export type PostType = 'blog' | 'devlog';

type PostFooterProps = {
  locale: string;
  next?: IndexedPost;
  postType: PostType;
  previous?: IndexedPost;
  relatedPosts: IndexedPost[];
  showPostNavigation: boolean;
};

/**
 * The article's tail: devlogs get prev/next release navigation, every
 * post gets two related cards. The related-card label is postType-
 * aware — essays file under their category, devlog cards say
 * Changelog. Cards link to the real articles on generaltranslation.com
 * (the index convention).
 */
export default function PostFooter({
  locale,
  next,
  postType,
  previous,
  relatedPosts,
  showPostNavigation,
}: PostFooterProps) {
  return (
    <footer className='blog-post-footer'>
      {showPostNavigation && (previous || next) ? (
        <nav className='blog-post-navigation'>
          {previous ? (
            <a href={postHref(previous.slug)} className='blog-post-nav-link'>
              <span>
                <ArrowLeft aria-hidden='true' />
                Previous Post
              </span>
              <strong>{previous.title}</strong>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a
              href={postHref(next.slug)}
              className='blog-post-nav-link is-next'
            >
              <span>
                Next Post
                <ArrowRight aria-hidden='true' />
              </span>
              <strong>{next.title}</strong>
            </a>
          ) : null}
        </nav>
      ) : null}

      {relatedPosts.length > 0 ? (
        <section className='border-t border-(--tc-hair) px-[clamp(28px,5vw,64px)] py-[clamp(40px,5vw,64px)]'>
          <h2 className='blog-explore-head'>
            <Compass size={16} aria-hidden='true' />
            Explore
          </h2>
          <div className='grid gap-2.5 min-[720px]:grid-cols-2'>
            {relatedPosts.map((post) => (
              <a
                key={post.slug}
                href={postHref(post.slug)}
                className='group flex min-w-0 flex-col overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--tc-ink)_3.5%,transparent)] no-underline transition-colors hover:bg-[color-mix(in_srgb,var(--tc-ink)_6%,transparent)]'
              >
                <BlogFeatureDither
                  motif={motifFor(post)}
                  id={`explore-${post.slug}`}
                  className='aspect-[16/6]'
                  scale={0.6}
                />
                <span className='flex flex-1 flex-col gap-[11px] px-6 pt-[22px] pb-[26px]'>
                  <span className='flex gap-3.5 text-xs text-(--tc-ink-3)'>
                    <time dateTime={post.date}>
                      {formatPostDate(post.date, locale, 'index')}
                    </time>
                    <span>
                      {postType === 'blog'
                        ? getBlogCategory(post)
                        : 'Changelog'}
                    </span>
                  </span>
                  <strong className='line-clamp-2 text-[21px] leading-[1.25] font-medium tracking-[-0.025em] [text-wrap:balance]'>
                    {post.title}
                  </strong>
                  <span className='line-clamp-2 text-[13.5px] leading-[1.6] text-(--tc-ink-2)'>
                    {post.summary}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </footer>
  );
}
