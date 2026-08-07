'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';

import { createGlyphField } from '@/lib/glyph-field';

import '@/app/d/toolchain/sections/chip-consistency.css';
import '@/app/d/toolchain/sections/hero-terminal.css';

gsap.registerPlugin(useGSAP);

/**
 * The hero, to the founder's "landing non-terminal v0": one composition on
 * the tch ground. The copy block stands LEFT — static headline, sub, the
 * rainbow CTA beside the npx pill — and the house glyph field bleeds across
 * the whole stage behind it: glyphs from eight scripts drifting in depth,
 * condensing into the word "language" in one script after another. The old
 * compact terminal strip is retired; a windowed demo joins the page later
 * as its own section.
 */

/** The trust card repeats the wall below, so v0 pages keep it hidden. */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

export default function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      const rootEl = root.current;
      const canvas = stage.current;
      if (!rootEl || !canvas) return;

      /* The field draws with the page's own faces and ink, resolved off the
         DOM; its rAF loop, resize, theme re-inking, fonts.ready remeasure and
         reduced-motion still are all internal to the library — destroy() on
         unmount is ours. The spec's rising cloud and larger background
         glyphs ride the library's additive drift/glyphScale options. */
      const h1 = rootEl.querySelector('h1');
      const field = createGlyphField({
        drift: 'rise',
        glyphScale: 1.18,
        canvas,
        displayFamily: h1 ? getComputedStyle(h1).fontFamily : undefined,
        monoFamily: getComputedStyle(rootEl).getPropertyValue('--tc-mono').trim() || undefined,
      });

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.from('[data-hero-in]', {
          y: 14,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: 'power2.out',
        });
      }

      return () => field?.destroy();
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      <div className='sgoh-stage'>
        <canvas className='sgoh-field' ref={stage} aria-hidden='true' />

        <div className='tc-hero sgoh-copy'>
          {/* Two authored lines: the word the field keeps writing opens
              line two. Static type — the glyph field is the language story. */}
          <h1 data-hero-in>
            <span>Launch in every</span>
            <span>language.</span>
          </h1>

          <p className='tc-hero-sub' data-hero-in>
            <img alt='General Translation' className='tch-sub-mark is-light' src='/brand/no-bg-gt-logo-light-96.png' width={96} height={96} /><img alt='' aria-hidden className='tch-sub-mark is-dark' src='/brand/no-bg-gt-logo-dark-96.png' width={96} height={96} /> builds full-stack infrastructure for localizing apps, docs, and websites.
          </p>

          <div className='tc-hero-acts' data-hero-in>
            <span className='tch-cta'>
              <a className='tc-btn tc-btn-solid' href='#deploy'>
                Get started
                <ArrowRight aria-hidden size={15} strokeWidth={2} />
              </a>
            </span>
            <button className='tc-copy' type='button' onClick={copy}>
              <span>$ npx gt@latest</span>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className='tc-trust tch-trustcard'>
        <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
