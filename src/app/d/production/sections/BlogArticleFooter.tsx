'use client';

import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';

import BlogArticleCover from './BlogArticleCover';
import type { ArticlePost, PostType } from './blog-article-data';
import { formatPostDate, getBlogCategory } from './blog-article-model';

/**
 * PRODUCTION · the article's foot — a port of the shipped PostFooter
 * (apps/landing/src/components/blog/PostFooter.tsx): the previous/next
 * pair, which the shipped page shows for releases only, over the Explore
 * pair, each card carrying the same cover the header runs.
 *
 * Both the neighbour links and the Explore cards print the frontmatter
 * title raw, exactly as the shipped page does — no release-title rewriting
 * outside the h1 — and a release card's dek is the empty summary its
 * frontmatter holds.
 */

type Props = {
  base: string;
  postType: PostType;
  previous?: ArticlePost;
  next?: ArticlePost;
  related: readonly ArticlePost[];
};

export default function BlogArticleFooter({
  base,
  postType,
  previous,
  next,
  related,
}: Props) {
  const showNavigation = postType === 'devlog' && Boolean(previous ?? next);

  return (
    <footer className='pba-foot'>
      {showNavigation ? (
        <nav className='pba-foot-nav'>
          {previous ? (
            <a
              className='pba-foot-link'
              href={`${base}/blog/${previous.slug}`}
            >
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
              className='pba-foot-link is-next'
              href={`${base}/blog/${next.slug}`}
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

      {related.length > 0 ? (
        <section className='pba-explore'>
          <h2 className='pba-explore-head'>
            <Compass aria-hidden='true' size={16} />
            Explore
          </h2>
          <div className='pba-explore-grid'>
            {related.map((post) => (
              <a
                className='pba-card'
                href={`${base}/blog/${post.slug}`}
                key={post.slug}
              >
                <BlogArticleCover
                  className='is-card'
                  id={`explore-${post.slug}`}
                  post={post}
                  scale={0.6}
                  sizes='(min-width: 720px) 50vw, 100vw'
                />
                <span className='pba-card-body'>
                  <span className='pba-card-meta'>
                    <time dateTime={post.date}>
                      {formatPostDate(post.date, 'index')}
                    </time>
                    <span>
                      {postType === 'blog'
                        ? getBlogCategory(post)
                        : 'Changelog'}
                    </span>
                  </span>
                  <strong>{post.title}</strong>
                  <span className='pba-card-dek'>{post.summary}</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </footer>
  );
}
