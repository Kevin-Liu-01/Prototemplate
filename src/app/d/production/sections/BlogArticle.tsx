'use client';

import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import BlogArticleCover from './BlogArticleCover';
import BlogArticleFooter from './BlogArticleFooter';
import BlogArticleSidebar from './BlogArticleSidebar';
import PostAuthors from './PostAuthors';
import {
  authorsOf,
  siblingsOf,
  type ArticlePost,
  type PostType,
} from './blog-article-data';
import {
  formatPostDate,
  formatReleaseTitle,
  getBlogCategory,
  getPostNeighbors,
  rankRelatedPosts,
} from './blog-article-model';

import type { PostHeading } from './blog-post-source';

/**
 * PRODUCTION · the blog article, section for section as the shipped page
 * mounts it (apps/landing/src/app/[locale]/blog/[slug]/page.tsx and the
 * components under apps/landing/src/components/blog):
 *
 *   header: the rail column holds the back link and a release's tags; the
 *           copy column holds the Blog / <category> crumb, the h1, the
 *           summary and the author-and-date byline; the cover (the post's
 *           image or the motif plate) and a header intro follow in the
 *           copy column above 980px
 *   grid:   the contents-and-share rail beside the prose
 *   footer: a release's previous/next pair, then Explore
 *
 * The body and the header intro arrive rendered: the page compiles the
 * post's vendored MDX on the server (BlogPostBody), as the shipped page
 * does with next-mdx-remote and shiki. Frontmatter is vendored in
 * blog-article-data.ts, straight from the content tree.
 */

type Props = {
  post: ArticlePost;
  postType: PostType;
  /** The rendered post body. */
  body: ReactNode;
  /** The rendered header intro, when the frontmatter sets headerIntro. */
  headerIntro: ReactNode;
  /** The body's h2 and h3 headings, for the contents rail. */
  headings: readonly PostHeading[];
};

export default function BlogArticle({ post, postType, body, headerIntro, headings }: Props) {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  const siblings = siblingsOf(postType);
  const related = rankRelatedPosts(post, siblings, 2);
  const { previous, next } = getPostNeighbors(post.slug, siblings);
  const authors = authorsOf(post);

  const title =
    postType === 'devlog' && post.headline
      ? `${formatReleaseTitle(post.title)}: ${post.headline}`
      : post.title;

  return (
    <>
      <header className='pba-header'>
        <div className='pba-lead'>
          {/* Header rail column: back link and release tags only. The
              contents/share rail is the sidebar in the body grid below. */}
          <div className='pba-lead-rail'>
            <a className='pba-back' href={`${base}/blog`}>
              <ArrowLeft aria-hidden='true' />
              Back
            </a>
            {postType === 'devlog' && post.tags.length > 0 ? (
              <div className='pba-lead-tags'>
                {post.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </div>

          <div className='pba-copy'>
            <div className='pba-crumb'>
              <a href={`${base}/blog`}>Blog</a>
              <span aria-hidden='true'>/</span>
              <span>
                {postType === 'blog' ? getBlogCategory(post) : 'Changelog'}
              </span>
            </div>

            <h1>{title}</h1>

            {post.summary ? (
              <p className='pba-summary'>{post.summary}</p>
            ) : null}

            <div className='pba-byline'>
              <PostAuthors authors={authors} variant='article' />
              {authors.length > 0 ? (
                <span aria-hidden='true'>&middot;</span>
              ) : null}
              <time dateTime={post.date}>
                {formatPostDate(post.date, 'article')}
              </time>
            </div>
          </div>

          {/* The cover renders in the copy column (grid-column-start: 2)
              only while the lead keeps its rail column — above 980px,
              matching the body grid's breakpoint. */}
          <div className='pba-cover'>
            <BlogArticleCover
              id={`article-${post.slug}`}
              post={post}
              priority
              sizes='(max-width: 980px) calc(100vw - 40px), 960px'
            />
          </div>
          {headerIntro ? (
            <div className='pba-header-intro'>
              <div className='pba-prose'>{headerIntro}</div>
            </div>
          ) : null}
        </div>
      </header>

      <div className='pba-grid'>
        <BlogArticleSidebar
          headings={headings}
          key={post.slug}
          postTitle={post.title}
        />

        <article className='pba-main'>
          <div className='pba-prose'>{body}</div>
        </article>
      </div>

      <BlogArticleFooter
        base={base}
        next={next}
        postType={postType}
        previous={previous}
        related={related}
      />
    </>
  );
}
