'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import FlowField from './FlowField';

gsap.registerPlugin(useGSAP);

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/** The journey the rest of the page walks, stated once at the hero's baseline. */
const STAGES = ['extract', 'translate', 'review', 'ship', 'update'] as const;

/**
 * The hero IS the flow field. Curl-noise streamlines — every one a doubled
 * thread, source and translation at constant gauge — stream left to right
 * through the first viewport, and the headline sits in the calm the flow
 * leaves around it: the type is the obstacle the field solves for (the shader
 * measures the real headline box and parts around it). Where the current
 * squeezes past the flanks it picks up the page's one chroma pass. At the
 * bottom edge, the five stations of the string's journey sit on the rule the
 * flow runs over — the page below walks them in order.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const core = useRef<HTMLDivElement>(null);
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
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });

      gsap.from('[data-hero-stage]', {
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'none',
        delay: 0.7,
      });
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='cf-hero'>
        <FlowField
          className='cf-hero-field'
          carveRef={core}
          speed={1}
          params={{
            spacing: 24,
            amp: 1.05,
            drift: 0.5,
            chroma: 0.85,
            chromaLocal: 1,
            inkAlpha: 0.66,
          }}
          narrowParams={{
            spacing: 20,
            amp: 1.5,
            drift: 0.55,
          }}
        />

        <div className='cf-hero-in'>
          {/* The measured obstacle: everything inside this box stays paper. */}
          <div className='cf-hero-core' ref={core}>
            <Image
              className='cf-hero-mark'
              data-hero-in
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={34}
              height={34}
            />

            <h1 data-hero-in>
              <span>Launch in</span>
              <span>
                <em>every</em> language.
              </span>
            </h1>

            <p className='cf-hero-sub' data-hero-in>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites.
            </p>

            <div className='cf-hero-acts' data-hero-in>
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
        </div>

        {/* The journey's five stations, seated on the hero's bottom rule. */}
        <div className='cf-hero-run' aria-label='The pipeline: extract, translate, review, ship, update'>
          {STAGES.map((stage) => (
            <span className='cf-hero-stage' data-hero-stage key={stage}>
              {stage}
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
