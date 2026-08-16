import { ArrowLeft } from 'lucide-react';

import {
  ESSAYS,
  RELEASES,
  type IndexedPost,
} from '../../singularity/company-sections/posts';
import BlogFeatureDither, { motifFor } from './BlogFeatureDither';
import PostFooter, { type PostType } from './PostFooter';
import SideBar from './SideBar';
import {
  formatPostDate,
  getBlogCategory,
  getPostNeighbors,
  rankRelatedPosts,
} from './model';

import type { Heading } from './TableOfContents';
import type { ReactNode } from 'react';

const BLOG_INDEX_HREF = '/d/singularity-dossier/blog';
const LOCALE = 'en-US';

type ArticleProps = {
  post: IndexedPost;
  postType: PostType;
  /** The header dek. The real devlog frontmatter carries no summary
      (the index derives one from the body), so devlog pages omit it. */
  dek?: string;
  /** Precomputed github-slugger anchors for the inlined prose. */
  headings: Heading[];
  children: ReactNode;
};

/**
 * The landing app's blog article page, mirrored around inlined static
 * prose: the header's back-link rail beside the copy column (the rail
 * drops with the body grid below 981px so title, cover and prose share
 * one edge), the cover on the copy column, the contents/share sidebar
 * on the body grid, and the postType-aware footer. Related posts and
 * devlog neighbors compute from the static index the landing computes
 * from at build time.
 */
export default function Article({
  post,
  postType,
  dek,
  headings,
  children,
}: ArticleProps) {
  const siblingPosts = postType === 'blog' ? ESSAYS : RELEASES;
  const relatedPosts = rankRelatedPosts(post, siblingPosts, 2);
  const { previous, next } = getPostNeighbors(post.slug, siblingPosts);

  return (
    <main className='blog-article'>
      <header className='blog-article-header'>
        <div className='blog-article-lead'>
          {/* Header rail column: back link and devlog tags only. The
              contents/share rail is SideBar in the body grid below. */}
          <div className='flex flex-col items-start gap-4'>
            <a href={BLOG_INDEX_HREF} className='blog-back-link'>
              <ArrowLeft aria-hidden='true' />
              Back
            </a>
            {postType === 'devlog' && post.tags.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full border border-(--tc-hair) px-2.5 py-1 text-[11.5px] text-(--tc-ink-2)'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className='blog-article-copy'>
            <div className='mb-3 flex items-center gap-1.5 text-[13.5px] text-(--tc-ink-3)'>
              <a
                href={BLOG_INDEX_HREF}
                className='transition-colors hover:text-(--tc-ink)'
              >
                Blog
              </a>
              <span aria-hidden='true'>/</span>
              <span>
                {postType === 'blog' ? getBlogCategory(post) : 'Changelog'}
              </span>
            </div>

            <h1>{post.title}</h1>

            {dek ? <p className='blog-article-summary'>{dek}</p> : null}

            <div className='mt-7 flex flex-wrap items-center gap-x-2.5 gap-y-2.5 text-[13.5px] text-(--tc-ink-3)'>
              {post.authors.map((author) => (
                <span key={author} className='inline-flex items-center gap-2.5'>
                  {author}
                </span>
              ))}
              {post.authors.length > 0 && <span aria-hidden='true'>·</span>}
              <time dateTime={post.date}>
                {formatPostDate(post.date, LOCALE, 'article')}
              </time>
            </div>
          </div>

          {/* Cover renders in the copy column (col-start-2) only while
              the lead keeps its rail column (>980px, matching the body
              grid's breakpoint). Its motif must match the post's index
              card: both derive from motifFor(post). */}
          <div className='blog-article-cover min-[981px]:col-start-2'>
            <BlogFeatureDither
              motif={motifFor(post)}
              id={`article-${post.slug}`}
            />
          </div>
        </div>
      </header>

      <div className='blog-article-grid'>
        <SideBar headings={headings} postTitle={post.title} />

        <article className='blog-article-main'>
          <div className='blog-prose'>{children}</div>
        </article>
      </div>

      <PostFooter
        locale={LOCALE}
        next={next}
        postType={postType}
        previous={previous}
        relatedPosts={relatedPosts}
        showPostNavigation={postType === 'devlog'}
      />
    </main>
  );
}
