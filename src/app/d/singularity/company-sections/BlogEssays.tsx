'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { ESSAY_ROWS, postHref } from './posts';
import { useConceptBase } from './use-concept-base';

/**
 * The Blogs column of the old page as filed evidence: one plate per essay,
 * ruled the way the dossier files its exhibits — hairline top rule carrying
 * the date, the title set in the display face, the frontmatter summary as
 * the dek, tags as code chips. Entries link to the real articles.
 */
export default function BlogEssays() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);
  const base = useConceptBase();

  return (
    <section className='tc-sec' ref={root}>
      <header className='cp-head' data-reveal>
        <span className='cp-kicker'>Essays</span>
        <h2>Guides and research, on the record.</h2>
      </header>

      <div className='cpb-ledger'>
        {ESSAY_ROWS.map((post) => (
          <a className='cpb-row' data-reveal href={postHref(base, post.slug)} key={post.slug}>
            <span className='cpb-row-date'>{post.date}</span>
            <span className='cpb-row-main'>
              <span className='cpb-row-title'>{post.title}</span>
              <span className='cpb-row-dek'>{post.summary}</span>
              <span className='cpb-row-by'>{post.authors.join(', ')}</span>
            </span>
            <span className='cpb-row-tags'>
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
