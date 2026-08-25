'use client';

import { ArrowLeft } from 'lucide-react';
import { Fragment, useRef, type ReactNode } from 'react';

import CodeBlock from '../sections/code';
import { useQuietReveal } from '../sections/reveal';
import BlogArticleRail from './BlogArticleRail';
import BlogPostCover from './BlogPostCover';
import BlogPostFooter from './BlogPostFooter';
import { bodyFor, headingsOf, type BodyBlock } from './post-bodies';
import {
  formatPostDate,
  formatReleaseTitle,
  getBlogCategory,
  getPostNeighbors,
  postKind,
  rankRelatedPosts,
  siblingsOf,
  type IndexedPost,
} from './posts';
import { useConceptBase } from './use-concept-base';

/**
 * The article, ported from apps/landing/src/app/[locale]/blog/[slug]/page.tsx
 * and the components it renders. Same anatomy, top to bottom: the rail
 * column carrying the back link and the contents list, the Blog/<category>
 * eyebrow, the title, the summary, the author-and-date row, the motif
 * cover, the prose column, and the post footer.
 *
 * The original reads MDX through next-mdx-remote and highlights with shiki.
 * This study has neither, so the body is a vendored block list (post-bodies.ts)
 * walked by hand, and code samples ride the direction's own CodeBlock panel.
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
    else if (match[2] !== undefined) out.push(<strong key={key}>{match[2]}</strong>);
    else out.push(<em key={key}>{match[3]}</em>);
    last = at + match[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out.length === 1 ? out[0] : out;
}

function ProseBlock({ block, id, index }: { block: BodyBlock; id?: string; index: number }) {
  const key = `b${index}`;

  if (block.kind === 'h2') {
    return <h2 id={id}>{inline(block.text, key)}</h2>;
  }
  if (block.kind === 'h3') {
    return <h3 id={id}>{inline(block.text, key)}</h3>;
  }
  if (block.kind === 'p') {
    return <p>{inline(block.text, key)}</p>;
  }
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
  post: IndexedPost;
};

export default function BlogArticle({ post }: Props) {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);
  const base = useConceptBase();

  const kind = postKind(post.slug);
  const body = bodyFor(post.slug);
  const headings = headingsOf(body);
  const siblings = siblingsOf(kind);
  const related = rankRelatedPosts(post, siblings, 2);
  const { previous, next } = getPostNeighbors(post.slug, siblings);

  /* headingsOf and the prose walk the same block list in the same order,
     so the nth heading block takes the nth derived id. */
  let headingAt = -1;

  const title =
    kind === 'release' && body?.headline
      ? `${formatReleaseTitle(post.title)}: ${body.headline}`
      : post.title;

  return (
    <section className='tc-sec cpa' ref={root}>
      <header className='cpa-header'>
        <div className='cpa-lead'>
          <div className='cpa-lead-rail' data-reveal>
            <a className='cpa-back' href={`${base}/blog`}>
              <ArrowLeft aria-hidden='true' />
              Back
            </a>
            {kind === 'release' && post.tags.length > 0 ? (
              <div className='cpa-lead-tags'>
                {post.tags.slice(0, 4).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </div>

          <div className='cpa-copy'>
            <div className='cpa-crumb' data-reveal>
              <a href={`${base}/blog`}>Blog</a>
              <span aria-hidden='true'>/</span>
              <span>{kind === 'release' ? 'Changelog' : getBlogCategory(post)}</span>
            </div>
            <h1 data-reveal>{title}</h1>
            {post.summary ? (
              <p className='cpa-summary' data-reveal>
                {post.summary}
              </p>
            ) : null}
            <div className='cpa-byline' data-reveal>
              {post.authors.map((author) => (
                <span key={author}>{author}</span>
              ))}
              {post.authors.length > 0 ? <span aria-hidden='true'>&middot;</span> : null}
              <time dateTime={post.date}>{formatPostDate(post.date, 'article')}</time>
            </div>
          </div>

          <div className='cpa-cover' data-reveal>
            <BlogPostCover id={`article-${post.slug}`} post={post} />
          </div>
        </div>
      </header>

      <div className='cpa-grid'>
        <BlogArticleRail headings={headings} key={post.slug} />

        <article className='cpa-main'>
          <div className='cpa-prose'>
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
              /* The header already carries the summary; repeating it as the
                 lede printed it twice. A post whose body is not vendored here
                 says so plainly instead. */
              <p className='cpa-stub'>
                This design study carries the full text of five posts. This one is
                filed from its frontmatter alone, so the article shell is real and
                the body is not.
              </p>
            )}
          </div>
        </article>
      </div>

      <BlogPostFooter
        base={base}
        kind={kind}
        next={next}
        previous={previous}
        related={related}
      />
    </section>
  );
}
