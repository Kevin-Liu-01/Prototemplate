'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';
import { postHref, RELEASES } from '../posts';

/**
 * The Updates column of the old page, promoted from a sidebar to what it
 * always was: a release ledger. Eighteen real rows from content/devlog/en-US,
 * newest first — date in mono, the package@version title in the sans, a
 * one-line dek from the post's own opening, tags as mono chips.
 */
export default function Releases() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='tc-head blg-head' data-reveal>
        <h2>Updates</h2>
        <p>
          Release notes for every package in the toolchain &mdash; what shipped, and the line of
          reasoning behind it.
        </p>
      </div>

      <div className='blg-ledger is-releases' data-reveal>
        <div className='blg-cols tc-mono blg-thread'>
          <span className='blg-c-date'>date</span>
          <span className='blg-c-main'>release / change</span>
          <span className='blg-c-tags'>tags</span>
        </div>

        {RELEASES.map((post) => (
          <a className='blg-row is-release' href={postHref(post.slug)} key={post.slug}>
            <span className='blg-c-date tc-mono'>{post.date}</span>
            <span className='blg-c-main'>
              <span className='blg-row-title'>{post.title}</span>
              <span className='blg-row-dek'>{post.summary}</span>
            </span>
            <span className='blg-c-tags'>
              {post.tags.slice(0, 3).map((tag) => (
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
