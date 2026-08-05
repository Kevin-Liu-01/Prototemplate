'use client';

import { useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import CodeBlock from '../sections/code';
import { useQuietReveal } from '../sections/reveal';

/**
 * The page's thesis in one artifact pair: the same four lines of JSX, with
 * and without a context tag, and the German that ships flipping between the
 * two senses of "Save". Every string is vetted on this page family
 * ("Payment received" → "Zahlung erhalten" is the agent transcript's own
 * row); the Speichern/Sparen glosses are the docs' own captions, verbatim.
 * Filed as Exhibits A and B under the finals' machined rule-labels.
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
    <section className='tc-sec' id='top' ref={root}>
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          Context — the platform
        </span>
        <h1 data-reveal>
          Translation is a <em className='sgx-em'>context</em> problem.
        </h1>
        <p data-reveal>
          One English word can ship two different German translations. What decides between them is
          context &mdash; and GT assembles it from your code, your files, and the rules your team
          pins, then spends it on every translation.
        </p>
      </div>

      <div className='sgx-body'>
        <div className='sgx-duo'>
          {/* ---- exhibit A: the plausible, wrong sense ---- */}
          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Exhibit A</span>
              <i>without context</i>
            </div>
            <div className='sgx-code'>
              <CodeBlock file='app/checkout/Toast.tsx' code={BEFORE} numbers={false} />
            </div>
            <div className='sgx-toast' lang='de'>
              <p>Zahlung erhalten</p>
              <button type='button' className='is-wrong'>
                Sparen
              </button>
            </div>
            <div className='sgx-out'>
              <LocaleTag code='de' />
              <s>Sparen</s>
              <span className='sgx-out-gloss'>&mdash; spend less money</span>
            </div>
            <p className='sgx-verdict'>
              In a checkout, &ldquo;Save&rdquo; reads as the discount sense &mdash; plausible, and
              wrong for a toast that stores a receipt.
            </p>
          </div>

          {/* ---- exhibit B: three words settle the sense ---- */}
          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Exhibit B</span>
              <i>context=&quot;checkout toast&quot;</i>
            </div>
            <div className='sgx-code'>
              <CodeBlock file='app/checkout/Toast.tsx' code={AFTER} numbers={false} />
            </div>
            <div className='sgx-toast' lang='de'>
              <p>Zahlung erhalten</p>
              <button type='button'>Speichern</button>
            </div>
            <div className='sgx-out'>
              <LocaleTag code='de' />
              <b>Speichern</b>
              <span className='sgx-out-gloss'>&mdash; write it to disk</span>
            </div>
            <p className='sgx-verdict'>
              One attribute settles the sense: the toast stores, it doesn&rsquo;t discount.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
