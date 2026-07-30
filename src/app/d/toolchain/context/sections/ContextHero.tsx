'use client';

import { useRef } from 'react';

import LocaleTag from '../../components/LocaleTag';
import CodeBlock from '../../sections/code';
import { useQuietReveal } from '../../sections/reveal';

/**
 * The page's thesis in one artifact: the same four lines of JSX, with and
 * without a context tag, and the German that ships flipping between the two
 * senses of "Save". Every string in the toast is already vetted on this page
 * family ("Payment received" → "Zahlung erhalten" is the hero terminal's own
 * row); the speichern/sparen glosses are the main page's ContextResolve
 * captions, verbatim.
 */

const BEFORE = `<T>
  <p>Payment received</p>
  <button>Save</button>
</T>`;

const AFTER = `<T context="checkout toast">
  <p>Payment received</p>
  <button>Save</button>
</T>`;

export default function ContextHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='context' ref={root}>
      <div className='ctx-hero'>
        <h1 data-reveal>
          Translation is a <em>context</em> problem.
        </h1>
        <p data-reveal>
          One English word can ship two different German translations. What decides between them is
          context &mdash; and GT assembles it from your code, your files, and the rules your team pins,
          then spends it on every translation.
        </p>
      </div>

      <div className='tc-row is-even ctx-pair'>
        {/* ---- without context: the plausible, wrong sense ---- */}
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <span className='ctx-tag'>without context</span>
            <div className='ctx-hero-code'>
              <CodeBlock file='app/checkout/Toast.tsx' code={BEFORE} />
            </div>
            <div className='ctx-render'>
              <div className='ctx-toast' lang='de'>
                <p>Zahlung erhalten</p>
                <button type='button' className='ctx-toast-btn is-wrong'>
                  Sparen
                </button>
              </div>
              <div className='ctx-out'>
                <LocaleTag code='de' className='ctx-loc' />
                <s>Sparen</s>
                <span className='ctx-out-gloss'>&mdash; spend less money</span>
              </div>
            </div>
            <p className='ctx-verdict'>
              In a checkout, &ldquo;Save&rdquo; reads as the discount sense &mdash; plausible, and wrong
              for a toast that stores a receipt.
            </p>
          </div>
        </div>

        {/* ---- with context: three words settle the sense ---- */}
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <span className='ctx-tag'>
              with <code>context=&quot;checkout toast&quot;</code>
            </span>
            <div className='ctx-hero-code'>
              <CodeBlock file='app/checkout/Toast.tsx' code={AFTER} />
            </div>
            <div className='ctx-render'>
              <div className='ctx-toast' lang='de'>
                <p>Zahlung erhalten</p>
                <button type='button' className='ctx-toast-btn'>
                  Speichern
                </button>
              </div>
              <div className='ctx-out'>
                <LocaleTag code='de' className='ctx-loc' />
                <b>Speichern</b>
                <span className='ctx-out-gloss'>&mdash; write it to disk</span>
              </div>
            </div>
            <p className='ctx-verdict'>
              One attribute settles the sense: the toast stores, it doesn&rsquo;t discount.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
