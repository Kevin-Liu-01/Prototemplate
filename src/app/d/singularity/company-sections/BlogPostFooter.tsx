'use client';

import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';

import BlogPostCover from './BlogPostCover';
import {
  formatPostDate,
  getBlogCategory,
  postHref,
  type IndexedPost,
  type PostKind,
} from './posts';

/**
 * The article's foot, ported from the landing app's PostFooter: the
 * previous/next pair (releases only — an essay's neighbours are unrelated)
 * over the Explore pair, each card carrying the same motif cover the
 * article header runs.
 */

type Props = {
  base: string;
  kind: PostKind;
  previous?: IndexedPost;
  next?: IndexedPost;
  related: readonly IndexedPost[];
};

export default function BlogPostFooter({ base, kind, previous, next, related }: Props) {
  const showNavigation = kind === 'release' && Boolean(previous ?? next);

  return (
    <footer className='cpa-foot'>
      {showNavigation ? (
        <nav className='cpa-foot-nav'>
          {previous ? (
            <a className='cpa-foot-link' href={postHref(base, previous.slug)}>
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
            <a className='cpa-foot-link is-next' href={postHref(base, next.slug)}>
              <span>
                Next Post
                <ArrowRight aria-hidden='true' />
              </span>
              <strong>{next.title}</strong>
            </a>
          ) : null}
        </nav>
      ) : null}

      {related.length > 0 ? (
        <section className='cpa-explore'>
          <h2 className='cpa-explore-head'>
            <Compass size={16} aria-hidden='true' />
            Explore
          </h2>
          <div className='cpa-explore-grid'>
            {related.map((post) => (
              <a className='cpa-card' href={postHref(base, post.slug)} key={post.slug}>
                <BlogPostCover
                  className='is-card'
                  id={`explore-${post.slug}`}
                  post={post}
                  scale={0.6}
                />
                <span className='cpa-card-body'>
                  <span className='cpa-card-meta'>
                    <time dateTime={post.date}>{formatPostDate(post.date, 'index')}</time>
                    <span>{kind === 'release' ? 'Changelog' : getBlogCategory(post)}</span>
                  </span>
                  <strong>{post.title}</strong>
                  <span className='cpa-card-dek'>{post.summary}</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </footer>
  );
}
