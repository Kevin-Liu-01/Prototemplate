'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState, type CSSProperties } from 'react';

import AuroraWash from './AuroraWash';

gsap.registerPlugin(useGSAP);

/**
 * Six names in one weight read as a word list, so each is set as its own
 * typographic mark — weight, case, size and tracking are the only variables,
 * and they stay inside the page's two faces.
 */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/**
 * The hero visualization: one real string from the product's own translation
 * files (public/_gt/[locale].json in the gt next-ssg example), set as a type
 * specimen. "Deploy now" nearly doubles in French and collapses to four
 * glyphs in Chinese — the whole layout problem of localization in five lines,
 * measured by the browser at render rather than typed into the markup.
 */
const CASCADE: readonly { loc: string; text: string }[] = [
  { loc: 'en', text: 'Deploy now' },
  { loc: 'fr', text: 'Déployer maintenant' },
  { loc: 'de', text: 'Jetzt bereitstellen' },
  { loc: 'ja', text: '今すぐデプロイ' },
  { loc: 'zh', text: '立即部署' },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [deltas, setDeltas] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      /* Measure the cascade for real: each row's advance width against the
         English source, from the rendered DOM after the display face loads.
         The tick under each line's end and the delta label are both driven by
         this measurement — nothing here is typed in. */
      const measure = () => {
        const rows = gsap.utils.toArray<HTMLElement>('[data-casc-row]', root.current);
        const widths = rows.map((row) => {
          const span = row.querySelector<HTMLElement>('[data-casc-text]');
          return span ? span.getBoundingClientRect().width : 0;
        });
        const base = widths[0] || 1;
        setDeltas(
          widths.map((w, i) => {
            if (i === 0) return 'source';
            const pct = Math.round((w / base - 1) * 100);
            return `${pct >= 0 ? '+' : '−'}${Math.abs(pct)}%`;
          })
        );
      };

      measure();
      void document.fonts?.ready.then(measure);
      window.addEventListener('resize', measure);

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.from('[data-hero-in]', {
          y: 14,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: 'power2.out',
        });

        gsap.from('[data-casc-row]', {
          y: 18,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.09,
          delay: 0.3,
          ease: 'power3.out',
          clearProps: 'transform',
        });
      }

      return () => window.removeEventListener('resize', measure);
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='tc-hero'>
        {/* The wash is the composition's armature: its bright axis runs
            diagonally behind the cascade, and the type fades toward the
            trust band where the canvas masks back into plain paper. */}
        <AuroraWash className='ap-wash' preset='paper' speed={0.6} />

        <div className='ap-hero-top'>
          <div className='ap-hero-copy'>
            <Image
              className='ap-hero-mark'
              data-hero-in
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={30}
              height={30}
            />
            <h1 data-hero-in>
              <span>Launch in</span>
              <span>every language.</span>
            </h1>
            <p className='ap-hero-sub' data-hero-in>
              Wrap your JSX in <code className='tc-chip'>&lt;T&gt;</code>, run one command, and ship every
              string in 100+ languages.
            </p>
            <div className='ap-hero-acts' data-hero-in>
              <a className='tc-btn tc-btn-solid' href='#editor'>
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
          </div>

          <p className='ap-hero-note' data-hero-in>
            Open source SDKs for Next.js, React, React Native, TanStack Start, Node and Python.
          </p>
        </div>

        <div className='ap-casc' data-hero-in>
          <p className='ap-casc-cap'>
            public/_gt/[locale].json — one string, five locales · widths measured at render, not typed
          </p>

          {CASCADE.map((line, i) => (
            <div
              className='ap-casc-row'
              data-casc-row
              data-src={i === 0 || undefined}
              key={line.loc}
              style={{ '--casc-i': i } as CSSProperties}
            >
              <span className='ap-casc-tag'>{line.loc}</span>
              <span className='ap-casc-text' data-casc-text lang={line.loc}>
                {line.text}
              </span>
              <span className='ap-casc-delta'>{deltas[i] ?? ''}</span>
            </div>
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
