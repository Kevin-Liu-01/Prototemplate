'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import { SCRIPTS, createGlyphField, POOL } from './hero/glyphField';

gsap.registerPlugin(useGSAP);

/**
 * The hero is one composition: set type on the left, and on the right the
 * same idea written by the field — ~1,800 glyphs from eight scripts drifting
 * in depth, condensing into the word "language" in one script after another.
 * The swarm is the argument ("every language"), not wallpaper behind it.
 *
 * Beneath the field, the script ledger: eight ruled cells on the page's dark
 * panel, one per writing system, the active one in ink-white. It is the
 * band's dark mass, the legend for the canvas, and the one place the words
 * appear as real shaped text rather than as particles.
 */

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
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

      /* The canvas draws with the page's own faces, resolved off the DOM. */
      const h1 = rootEl.querySelector('h1');
      const field = createGlyphField({
        canvas,
        displayFamily: h1 ? getComputedStyle(h1).fontFamily : undefined,
        monoFamily: getComputedStyle(rootEl).getPropertyValue('--tc-mono') || undefined,
        onScript: setActive,
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
    <section className='tc-sec' id='top' ref={root}>
      <div className='gr-hero'>
        <div className='gr-hero-stage'>
          <canvas className='gr-hero-field' ref={stage} aria-hidden='true' />

          <div className='gr-hero-copy'>
            <h1 data-hero-in>
              <span>Launch in</span>
              <span>every language.</span>
            </h1>

            <p className='gr-hero-sub' data-hero-in>
              Wrap your JSX in <code className='tc-chip'>&lt;T&gt;</code>, run one command, and ship
              every string in 100+ languages.
            </p>

            <div className='gr-hero-acts' data-hero-in>
              <a className='tc-btn tc-btn-solid' href='#pricing'>
                Get started
              </a>
              <a className='tc-btn tc-btn-line' href='#frameworks'>
                Read the docs
              </a>
              <button className='tc-copy' type='button' onClick={copy}>
                <span>$ npx gt@latest</span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className='gr-hero-note' data-hero-in>
              {POOL.toLocaleString('en-US')} glyphs · 8 writing systems · one pipeline
            </p>
          </div>
        </div>

        {/* The script ledger: the field's legend, on the page's dark panel. */}
        <div className='gr-ledger' data-hero-in>
          {SCRIPTS.map((script, i) => (
            <span className='gr-ledger-cell' data-on={i === active} key={script.tag}>
              <span className='gr-ledger-meta'>
                <span className='gr-ledger-tag'>{script.tag}</span>
                {script.script}
              </span>
              <b lang={script.lang} dir={script.rtl ? 'rtl' : undefined}>
                {script.word}
              </b>
            </span>
          ))}
        </div>
      </div>

      <div className='tc-trust'>
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
