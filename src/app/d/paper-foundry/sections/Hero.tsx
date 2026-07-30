'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import SheenField from './SheenField';
import { usePlateCascade } from './cascade';
import { useFoundryLoops } from './loops';

/**
 * The machined plate. The hero is one brushed-graphite sheet (the shader) with
 * a hairline bento plate set into it: seven cells, each holding a real product
 * artifact, rising in reading order with a one-shot gloss sweep apiece. The
 * headline cell is the grain flip — its brushing runs 90° to the sheet's, so
 * the shader's specular sweep crosses it on a different diagonal at a
 * different moment. Every cell edge carries the parts read: a bright top
 * hairline and a soft under-shadow. After the cascade the plate keeps
 * working: useFoundryLoops advances one cell at a time — locales cycling
 * through the button chip (width re-measured live), the fan emitting new
 * locale files, plural grammars rotating, the toast re-translating, the
 * greeting card flipping LTR→RTL when Arabic lands.
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
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  usePlateCascade(root);
  useFoundryLoops(root);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='pf-hero'>
        <SheenField className='pf-hero-field' flipRef={flipCell} />

        <div className='pf-plate'>
          {/* The headline cell — also the shader's grain-flip rect. */}
          <div className='pf-cell is-head' data-plate ref={flipCell}>
            <Image
              className='pf-mark'
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={30}
              height={30}
            />
            <h1>
              <span>Launch in</span>
              <span>
                <em>every</em> language.
              </span>
            </h1>
            <p className='pf-sub'>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites.
            </p>
            <div className='pf-acts'>
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

          {/* Each part is a real artifact with its real translation — the tag
              names the translated leg only. Never the hero's own CTA copy: a
              part reading "Get started" an inch from the live button would
              read as a rendering fault. */}
          <div className='pf-cell is-part' data-plate>
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
