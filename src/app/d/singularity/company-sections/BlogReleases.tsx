'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { postHref, RELEASES } from './posts';
import { useConceptBase } from './use-concept-base';

/**
 * The Updates column of the old page, promoted to what it always was: the
 * release record, held on the page's dark band the way the dossier files
 * its controls. Eighteen real rows from content/devlog/en-US, newest
 * first — date in mono, the package@version title in white, a one-line dek
 * from the post's own opening.
 */
export default function BlogReleases() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);
  const base = useConceptBase();

  return (
    <section className='tc-band cp-band' ref={root} aria-label='Release notes'>
      <div className='cp-band-in'>
        <header className='cp-band-head' data-reveal>
          <h2>Every release, on the record.</h2>
          <p>
            Release notes for every package in the toolchain &mdash; what shipped, and the line
            of reasoning behind it.
          </p>
        </header>

        <div className='cpb-rel'>
          {RELEASES.map((post) => (
            <a className='cpb-relrow' data-reveal href={postHref(base, post.slug)} key={post.slug}>
              <span className='cpb-relrow-date'>{post.date}</span>
              <span className='cpb-relrow-main'>
                <span className='cpb-relrow-title'>{post.title}</span>
                <span className='cpb-relrow-dek'>{post.summary}</span>
              </span>
              <span className='cpb-relrow-tags'>
                {post.tags.slice(0, 2).map((tag) => (
                  <code key={tag}>{tag}</code>
                ))}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
