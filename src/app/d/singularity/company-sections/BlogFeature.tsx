'use client';

import { useRef } from 'react';

import CodeBlock from '../sections/code';
import { useQuietReveal } from '../sections/reveal';
import { FEATURED, postHref } from './posts';

/**
 * The newest essay, filed like a dossier exhibit: a ruled plate carrying the
 * entry on the left and, on the right, the essay's own argument as the page's
 * dark artifact — line for line from the post body
 * (content/blog/en-US/branch_vs_ternary.mdx): the split-ternary shape it
 * opens on, and the <Branch> rewrite it lands on. The verdict under the
 * first panel is the author's sentence, quoted, not paraphrased.
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

export default function BlogFeature() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='cpb-feat'>
        <div className='cp-rule' data-reveal>
          <span>Newest filing</span>
          <span className='cp-rule-num'>{FEATURED.date}</span>
        </div>

        <div className='cpb-feat-body'>
          <div className='cpb-feat-meta' data-reveal>
            <h2>
              <a href={postHref(FEATURED.slug)}>{FEATURED.title}</a>
            </h2>
            <p className='cpb-feat-dek'>{FEATURED.summary}</p>
            <p className='cpb-feat-by'>{FEATURED.authors.join(', ')}</p>
            <div className='cpb-tags'>
              {FEATURED.tags.map((tag) => (
                <code className='tc-chip' key={tag}>
                  {tag}
                </code>
              ))}
            </div>
            <div className='cpb-feat-act'>
              <a className='tc-btn tc-btn-line tc-btn-sm' href={postHref(FEATURED.slug)}>
                Read the post
              </a>
            </div>
          </div>

          <div className='cpb-feat-art' data-reveal>
            <span className='cpb-art-tag'>the split ternary the essay opens on</span>
            <CodeBlock file='components/DarkModeRow.tsx' code={MISTAKE} />
            <p className='cpb-verdict'>
              &ldquo;This is not at all how the library was designed to be used.&rdquo;
            </p>
            <span className='cpb-art-tag'>
              the rewrite &mdash; one <code>&lt;T&gt;</code>, one <code>&lt;Branch&gt;</code>
            </span>
            <CodeBlock file='components/DarkModeRow.tsx' code={FIX} />
          </div>
        </div>
      </div>
    </section>
  );
}
