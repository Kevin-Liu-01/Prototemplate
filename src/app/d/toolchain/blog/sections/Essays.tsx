'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';
import { ESSAY_ROWS, postHref } from '../posts';

/**
 * The Blogs column of the old page as a ruled index ledger: one hairline per
 * entry, date in mono, title in the display face, the frontmatter summary as
 * a one-line dek, tags as mono chips. The header rule is the brand's doubled
 * thread at constant gauge — the ledger's only ornament.
 */
export default function Essays() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='tc-head blg-head' data-reveal>
        <h2>Blogs</h2>
        <p>Guides and research from the team, newest first &mdash; the newest entry sits framed above.</p>
      </div>

      <div className='blg-ledger'>
        <div className='blg-cols tc-mono blg-thread' data-reveal>
          <span className='blg-c-date'>date</span>
          <span className='blg-c-main'>title / summary</span>
          <span className='blg-c-tags'>tags</span>
        </div>

        {ESSAY_ROWS.map((post) => (
          <a className='blg-row' href={postHref(post.slug)} key={post.slug} data-reveal>
            <span className='blg-c-date tc-mono'>{post.date}</span>
            <span className='blg-c-main'>
              <span className='blg-row-title'>{post.title}</span>
              <span className='blg-row-dek'>{post.summary}</span>
              <span className='blg-row-by tc-mono'>{post.authors.join(', ')}</span>
            </span>
            <span className='blg-c-tags'>
              {post.tags.slice(0, 4).map((tag) => (
                <code className='tc-chip' key={tag}>
                  {tag}
                </code>
              ))}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
