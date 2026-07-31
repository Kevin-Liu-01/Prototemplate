'use client';

import { useRef } from 'react';

import CodeBlock from '../../sections/code';
import { useQuietReveal } from '../../sections/reveal';
import { FEATURED, postHref } from '../posts';

/**
 * The newest essay gets the index's one framed feature cell. The artifact
 * beside the entry is the essay's own argument, line for line from the post
 * body (content/blog/en-US/branch_vs_ternary.mdx): the split-ternary shape it
 * opens on, and the <Branch> rewrite it lands on. The verdict under the first
 * panel is the author's sentence, quoted, not paraphrased.
 */

const MISTAKE = `const gt = useGT()

return (
  <>
    <span>
      <T> Dark Mode: </T>
    </span>
    <Button>{enabled ? gt('On') : gt('Off')}</Button>
  </>
)`;

const FIX = `<T>
  <span>Dark Mode:</span>
  <Button>
    <Branch branch={enabled.toString()}
      true="On" false="Off" />
  </Button>
</T>`;

export default function Feature() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='tc-row is-split blg-feat'>
        {/* ---- the entry ---- */}
        <div className='tc-cell blg-feat-meta' data-reveal>
          <div className='blg-featline tc-mono'>
            <span className='blg-featmark' aria-hidden />
            {FEATURED.date} &middot; newest
          </div>
          <h2>
            <a href={postHref(FEATURED.slug)}>{FEATURED.title}</a>
          </h2>
          <p className='blg-feat-dek'>{FEATURED.summary}</p>
          <div className='blg-byline tc-mono'>{FEATURED.authors.join(', ')}</div>
          <div className='blg-tags'>
            {FEATURED.tags.map((tag) => (
              <code className='tc-chip' key={tag}>
                {tag}
              </code>
            ))}
          </div>
          <div className='blg-feat-act'>
            <a className='tc-btn tc-btn-line tc-btn-sm' href={postHref(FEATURED.slug)}>
              Read the post
            </a>
          </div>
        </div>

        {/* ---- the essay's own argument, as the artifact ---- */}
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card blg-feat-art'>
            <span className='blg-tag tc-mono'>the split ternary the essay opens on</span>
            <CodeBlock file='components/DarkModeRow.tsx' code={MISTAKE} />
            <p className='blg-verdict'>
              &ldquo;This is not at all how the library was designed to be used.&rdquo;
            </p>
            <span className='blg-tag tc-mono'>
              the rewrite &mdash; one <code>&lt;T&gt;</code>, one <code>&lt;Branch&gt;</code>
            </span>
            <CodeBlock file='components/DarkModeRow.tsx' code={FIX} />
          </div>
        </div>
      </div>
    </section>
  );
}
