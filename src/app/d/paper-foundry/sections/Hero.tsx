'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

import { useCopied } from '@/app/d/toolchain/components/use-copied';

import { startEveryMorph } from '@/app/d/toolchain/sections/every-morph';

import SheenField from './SheenField';
import { usePlateCascade } from './cascade';
import { useFoundryLoops } from './loops';

import './chip-consistency.css';
import './hero-every.css';

gsap.registerPlugin(useGSAP);

/**
 * The machined stack. The hero adopts the founder stack — white card
 * (mark, two authored headline lines, sub, acts), a full-width visual band,
 * then the trust card, three surfaces on the shell-grey ground with 1px
 * seams and the ground filling the radius-12 corner notches — and the band
 * is this fork's signature material: one brushed-graphite sheet (the shader)
 * carrying a hairline bento plate of six real product parts. Parts rise in
 * reading order with a one-shot gloss sweep apiece (the plate cascade); the
 * first part is the sheet's grain flip — its brushing runs 90° to the
 * sheet's, so the specular sweep crosses it on a different diagonal at a
 * different moment. After the cascade the plate keeps working: useFoundryLoops
 * advances one cell at a time — locales cycling through the button chip
 * (width re-measured live), the fan emitting new locale files, plural
 * grammars rotating, the toast re-translating, the greeting card flipping
 * LTR→RTL when Arabic lands.
 *
 * The headline hinge is toolchain's measuring instrument: bound guides
 * appear around the accented word, the word dissolves to multilingual dust,
 * the bounds tween to the next word's measured width, the dust assembles the
 * incoming letterforms (canvas-sampled), characters fill in. Under 720px a
 * measured crossfade tells the same story; reduced motion shows the finished
 * still.
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
  const flipCell = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopied('npx gt@latest');

  usePlateCascade(root);
  useFoundryLoops(root);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });

      /* The headline hinge (every-morph.ts): the word after "every" cycles
         through eight scripts while the hero is on screen. */
      const em = root.current?.querySelector<HTMLElement>('[data-every]');
      const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
      return em && word ? startEveryMorph(em, word) : undefined;
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      {/* The founder stack, card one: a genuine white card — radius 12, on the
          section's shell-grey ground — carrying mark, two authored headline
          lines with the morphing hinge, sub, and acts. */}
      <div className='tc-hero'>
        <Image
          className='tc-hero-mark tc-logo-light'
          data-hero-in
          src='/brand/no-bg-gt-logo-light.png'
          alt='General Translation'
          width={34}
          height={34}
        />
        <Image
          className='tc-hero-mark tc-logo-dark'
          data-hero-in
          src='/brand/no-bg-gt-logo-dark.png'
          alt=''
          width={34}
          height={34}
        />

        <h1 data-hero-in>
          <span>Your product speaks</span>
          <span>
            every{' '}
            <em data-every>
              <span data-every-word lang='en' dir='ltr'>
                language
              </span>
            </em>
            .
          </span>
        </h1>

        <p className='tc-hero-sub' data-hero-in>
          General Translation builds full-stack infrastructure for localizing apps, docs, and
          websites.
        </p>

        <div className='tc-hero-acts' data-hero-in>
          <a className='tc-btn tc-btn-solid' href='#pricing'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href='#frameworks'>
            Docs
          </a>
          <button className='tc-copy' type='button' onClick={copy}>
            <span>$ npx gt@latest</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* The band: SQUARE, full rail width, this fork's material — the
          brushed-graphite sheet with the machined parts plate set into it.
          Each part is a real artifact with its real translation — the tag
          names the translated leg only. Never the hero's own CTA copy: a
          part reading "Get started" an inch from the live button would
          read as a rendering fault. */}
      <div className='tc-hero-cell pf-hero'>
        <SheenField className='pf-hero-field' flipRef={flipCell} />

        <div className='pf-plate'>
          {/* The lead part is also the sheet's grain-flip rect: its brushing
              runs 90° to the sheet's, so the sweep crosses it on its own
              diagonal — two machined parts meeting, not a mask. */}
          <div className='pf-cell is-part is-flip' data-plate ref={flipCell}>
            <div className='pf-cell-label'>
              <span>components/Button.tsx</span>
              <span data-loop='chip-label'>ja — 日本語</span>
            </div>
            <div className='pf-pair'>
              <span className='pf-ui'>Continue</span>
              <span className='pf-arr' aria-hidden='true'>
                →
              </span>
              {/* The translated leg re-measures per locale; the dimension
                  line under it is the caliper, read live off the box. */}
              <span className='pf-measure'>
                <span className='pf-ui' lang='ja' data-loop='chip'>
                  <span data-loop='chip-text'>続ける</span>
                </span>
                <span className='pf-dim' aria-hidden='true'>
                  <i />
                  <b data-loop='chip-dim' />
                  <i />
                </span>
              </span>
            </div>
          </div>

          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>public/_gt/[locale].json</span>
              <span>over the air</span>
            </div>
            <svg
              className='pf-fan'
              viewBox='0 0 300 136'
              role='img'
              aria-label='app/page.tsx fanned into es.json, ja.json, de.json and further locales'
            >
              <text className='pf-fan-src' x='0' y='68'>
                app/page.tsx
              </text>
              <path d='M104 68 C 142 68, 152 20, 192 20' />
              <path d='M104 68 C 142 68, 152 52, 192 52' />
              <path d='M104 68 C 142 68, 152 84, 192 84' />
              {/* the emitting slot: this stroke redraws and its label swaps
                  as the plate mints one more locale over the air */}
              <path d='M104 68 C 142 68, 152 116, 192 116' pathLength={1} data-loop='fan-path' />
              <text className='pf-fan-dst' x='200' y='20'>
                es.json
              </text>
              <text className='pf-fan-dst' x='200' y='52'>
                ja.json
              </text>
              <text className='pf-fan-dst' x='200' y='84'>
                de.json
              </text>
              <text className='pf-fan-dst' x='200' y='116' data-loop='fan-text'>
                pl.json
              </text>
            </svg>
          </div>

          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>platform</span>
            </div>
            <div className='pf-stats'>
              <span>
                <b>118</b>
                <i>locales</i>
              </span>
              <span>
                <b>6</b>
                <i>SDKs</i>
              </span>
              <span>
                <b>$0</b>
                <i>to start</i>
              </span>
            </div>
          </div>

          {/* Three counts through three grammars — the category column is the
              CLDR plural machinery made visible; Polish's 'few'/'many' is the
              proof it is real. */}
          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>ui/FileCount.tsx</span>
              <span data-loop='plu-label'>en — 2 forms</span>
            </div>
            <div className='pf-plu' lang='en' data-loop='plu'>
              <span className='pf-plu-row'>
                <i>n=1</i>
                <span data-loop='plu-val'>1 file</span>
                <em data-loop='plu-cat'>one</em>
              </span>
              <span className='pf-plu-row'>
                <i>n=2</i>
                <span data-loop='plu-val'>2 files</span>
                <em data-loop='plu-cat'>other</em>
              </span>
              <span className='pf-plu-row'>
                <i>n=5</i>
                <span data-loop='plu-val'>5 files</span>
                <em data-loop='plu-cat'>other</em>
              </span>
            </div>
          </div>

          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>ui/Toast.tsx</span>
              <span data-loop='toast-label'>fr — français</span>
            </div>
            <div className='pf-toasts'>
              <span className='pf-toast'>
                <i aria-hidden='true' />
                Payment received
              </span>
              <span className='pf-toast' lang='fr' data-loop='toast'>
                <i aria-hidden='true' />
                <span data-loop='toast-text'>Paiement reçu</span>
              </span>
            </div>
          </div>

          <div className='pf-cell is-part' data-plate>
            <div className='pf-cell-label'>
              <span>app/greeting.tsx</span>
              <span data-loop='bidi-label'>ar — العربية</span>
            </div>
            <div className='pf-bidi'>
              <span>Welcome back, Sarah</span>
              <span dir='rtl' lang='ar' data-loop='bidi-row'>
                مرحبًا بعودتك يا سارة
              </span>
            </div>
          </div>
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
