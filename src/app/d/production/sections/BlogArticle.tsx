'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

import BlogArticleCover from './BlogArticleCover';
import BlogArticleFooter from './BlogArticleFooter';
import BlogArticleSidebar from './BlogArticleSidebar';
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

import CodeBlock from '../../toolchain/sections/code';
import {
  bodyFor,
  headingsOf,
  type BodyBlock,
} from '../../singularity/company-sections/post-bodies';

/**
 * PRODUCTION · the blog article, section for section as the shipped page
 * mounts it (apps/landing/src/app/[locale]/blog/[slug]/page.tsx and the
 * components under apps/landing/src/components/blog):
 *
 *   header  — rail column: the back link, and a release's tags
 *             copy column: the Blog / <category> crumb, the h1, the
 *             summary, the author-and-date byline
 *             cover: the post's image, or the motif plate; in the copy
 *             column above 980px
 *   grid    — the contents-and-share rail beside the prose
 *   footer  — a release's previous/next pair, then Explore
 *
 * The shipped page reads MDX out of the content submodule through
 * next-mdx-remote and highlights it with shiki. This control has neither,
 * so the body is the vendored block list in post-bodies.ts walked by hand,
 * and fenced samples ride the toolchain CodeBlock panel. Frontmatter is
 * vendored in blog-article-data.ts, straight from the content tree.
 */

/* Inline markup the vendored bodies use: `code`, **strong**, *em*. */
const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;

function inline(text: string, keyBase: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = `${keyBase}-${(index += 1)}`;
    if (match[1] !== undefined) out.push(<code key={key}>{match[1]}</code>);
    else if (match[2] !== undefined)
      out.push(<strong key={key}>{match[2]}</strong>);
    else out.push(<em key={key}>{match[3]}</em>);
    last = at + match[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out.length === 1 ? out[0] : out;
}

function ProseBlock({
  block,
  id,
  index,
}: {
  block: BodyBlock;
  id?: string;
  index: number;
}) {
  const key = `b${index}`;

  if (block.kind === 'h2') return <h2 id={id}>{inline(block.text, key)}</h2>;
  if (block.kind === 'h3') return <h3 id={id}>{inline(block.text, key)}</h3>;
  if (block.kind === 'p') return <p>{inline(block.text, key)}</p>;
  if (block.kind === 'list') {
    return (
      <ul>
        {block.items.map((item, i) => (
          <li key={`${key}-${i}`}>{inline(item, `${key}-${i}`)}</li>
        ))}
      </ul>
    );
  }
  if (block.kind === 'code') {
    return <CodeBlock code={block.code} file={block.lang} numbers={false} />;
  }
  return <hr />;
}

type Props = {
  post: ArticlePost;
  postType: PostType;
};

export default function BlogArticle({ post, postType }: Props) {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  const body = bodyFor(post.slug);
  const headings = headingsOf(body);
  const siblings = siblingsOf(postType);
  const related = rankRelatedPosts(post, siblings, 2);
  const { previous, next } = getPostNeighbors(post.slug, siblings);
  const authors = authorsOf(post);

  /* headingsOf and the prose walk the same block list in the same order,
     so the nth heading block takes the nth derived id. */
  let headingAt = -1;

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
              {authors.map((author, index) => (
                <span key={author.name || index}>
                  {author.avatar ? (
                    <Image
                      alt=''
                      className='pba-avatar'
                      height={26}
                      src={author.avatar}
                      width={26}
                    />
                  ) : null}
                  {author.name}
                </span>
              ))}
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
        </div>
      </header>

      <div className='pba-grid'>
        <BlogArticleSidebar
          headings={headings}
          key={post.slug}
          postTitle={post.title}
        />

        <article className='pba-main'>
          <div className='pba-prose'>
            {body ? (
              body.blocks.map((block, index) => {
                const isHeading = block.kind === 'h2' || block.kind === 'h3';
                if (isHeading) headingAt += 1;
                return (
                  <Fragment key={`${post.slug}-${index}`}>
                    <ProseBlock
                      block={block}
                      id={isHeading ? headings[headingAt]?.id : undefined}
                      index={index}
                    />
                  </Fragment>
                );
              })
            ) : (
              /* The header already carries what frontmatter there is;
                 repeating it as the lede printed it twice. A post whose
                 body is not vendored here says so plainly instead. */
              <p className='pba-stub'>
                This control carries the full text of the four posts whose
                bodies are vendored with it. This one is filed from its
                frontmatter alone, so the article shell is real and the body
                is not.
              </p>
            )}
          </div>
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
