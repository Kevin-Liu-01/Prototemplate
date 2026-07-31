'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';
import { ESSAYS, INDEX_FROM, INDEX_TO, RELEASES } from '../posts';

/**
 * The old blog page's masthead, verbatim words in the ledger's voice:
 * "Latest" / "Updates and research" is the whole copy deck of the page being
 * replaced (apps/landing/src/components/pages/blog/BlogPage.tsx). The mono
 * line beneath is the index's own colophon — real counts, real date range,
 * both derived from the frontmatter and nothing else.
 */
export default function BlogHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='blg-hero'>
        <h1 data-reveal>
          <em>Latest</em>
        </h1>
        <p data-reveal>Updates and research</p>
        <div className='blg-colophon tc-mono' data-reveal>
          <span>
            index &middot; {ESSAYS.length} blogs &middot; {RELEASES.length} updates
          </span>
          <span className='blg-colophon-range'>
            {INDEX_FROM} &rarr; {INDEX_TO}
          </span>
        </div>
      </div>
    </section>
  );
}
