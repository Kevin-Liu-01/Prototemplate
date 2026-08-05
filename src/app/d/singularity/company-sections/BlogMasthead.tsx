'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { ESSAYS, INDEX_FROM, INDEX_TO, RELEASES } from './posts';

/**
 * The old blog page's masthead, sworn in: "Latest" / "Updates and research"
 * is the whole copy deck of the page being replaced
 * (apps/landing/src/components/pages/blog/BlogPage.tsx). The mono line
 * beneath is the index's own colophon — real counts, real date range,
 * derived from the frontmatter and nothing else.
 */
export default function BlogMasthead() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='cp-hero'>
        <span className='cp-kicker' data-reveal>
          The index
        </span>
        <h1 data-reveal>Latest</h1>
        <p data-reveal>Updates and research</p>
        <div className='cp-colophon' data-reveal>
          <span>
            {ESSAYS.length} blogs &middot; {RELEASES.length} updates
          </span>
          <span>
            {INDEX_FROM} &rarr; {INDEX_TO}
          </span>
        </div>
      </div>
    </section>
  );
}
