'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';

/** Quiet close: the claim, the two doors, and the thread under the one word. */
export default function ContextCTA() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='cta' ref={root}>
      <div className='ctx-cta'>
        <h2 data-reveal>
          Define it <em>once</em>.
        </h2>
        <p data-reveal>
          Terminology and tone, set at the organization and obeyed by every translation &mdash; at build
          time, at runtime, and in every Locadex pull request.
        </p>
        <div className='ctx-cta-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href='#top'>
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}
