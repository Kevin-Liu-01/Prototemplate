'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { useCopied } from '@/app/d/toolchain/components/use-copied';

import { startEveryMorph } from '@/app/d/toolchain/sections/every-morph';
import { prefersReducedMotion } from '@/lib/reduced-motion';

import AuroraWash from './AuroraWash';

import './chip-consistency.css';
import './hero-every.css';
import './hero-aurora.css';

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
 * The band's visualization: one real string from the product's own translation
 * files (public/_gt/[locale].json in the gt next-ssg example), set as a type
 * specimen on the aurora wash. "Deploy now" nearly doubles in French and
 * collapses to four glyphs in Chinese — the whole layout problem of
 * localization in five lines, measured by the browser at render rather than
 * typed into the markup.
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
  const { copied, copy } = useCopied('npx gt@latest');
  const [deltas, setDeltas] = useState<string[]>([]);

  useGSAP(
    () => {
      /* Measure the cascade for real: each row's advance width against the
         English source, from the rendered DOM after the display face loads.
         The dimension bracket under each line and the delta label are both
         driven by this measurement — nothing here is typed in. */
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

      if (!prefersReducedMotion()) {
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

      let everyCleanup: (() => void) | undefined;
      if (!prefersReducedMotion()) {
        /* The headline hinge (every-morph.ts): the word after "every" cycles
           through eight scripts while the hero is on screen. */
        const em = root.current?.querySelector<HTMLElement>('[data-every]');
        const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
        everyCleanup = em && word ? startEveryMorph(em, word) : undefined;
      }

      return () => {
        window.removeEventListener('resize', measure);
        everyCleanup?.();
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's recomposition ("the aurora should fill one component
          while letting the text lines shine"): the stack is a calm paper card
          — headline, sub and CTAs as crisp ink on quiet paper — above the ONE
          framed panel the aurora completely fills, with the specimen cascade
          living inside the light; then the trust card below. */}
      <div className='tc-hero tch-card'>
        {/* The card keeps only the paper's materiality: the ambient breath and
            grain at a whisper, the curtain event OFF — the aurora belongs to
            the panel below, and the type up here owns clean paper. */}
        <AuroraWash
          className='aph-card-wash'
          preset='paper'
          darkPreset='paper-dark'
          params={{
            base: [1, 1, 1],
            curtain: 0,
            wash: 0.24,
            ambient: 0.3,
            grain: 0.013,
            breathe: 0.1,
            bias: 0,
          }}
          darkParams={{
            base: [0.051, 0.055, 0.071],
            curtain: 0,
            wash: 0.2,
            ambient: 0.28,
            grain: 0.022,
            breathe: 0.1,
            bias: 0,
          }}
          speed={0.5}
        />
        <div className='aph-card-in'>
          <Image
            className='tc-hero-mark'
            data-hero-in
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={34}
            height={34}
          />

          {/* Two authored lines; the accented word opens the hinge of the
              sentence and morphs through real languages as an instrument. */}
          <h1 data-hero-in>
            <span>Launch in</span>
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
            Wrap your JSX in <code className='tc-chip'>&lt;T&gt;</code>, run one command, and ship every
            string in 100+ languages.
          </p>

          <div className='tc-hero-acts' data-hero-in>
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
      </div>

      {/* THE PANEL: the one component the aurora fills. A framed card in the
          same mat grammar as the hero card, the wash running edge to edge at
          full richness — sheet of lit paper by day, true northern sky by
          night — with the measured specimen cascade printed inside it. */}
      <div className='aph-panel'>
        {/* The event at full exposure: the lit horizon runs just under the
            source row — the caption and 'Deploy now' sit in the quiet sky
            above it — and the rays pour down through the translations. The
            quiet window serves the panel's own type: a soft column over
            the cascade's glyphs (x≈0.42) so the lines stay the cleanest thing
            in the scene while the flanks and the spine keep the full blaze. */}
        <AuroraWash
          className='aph-panel-wash'
          preset='paper'
          darkPreset='paper-dark'
          params={{
            axisLift: 0.73,
            axisSlope: -0.05,
            axisBow: -0.08,
            rayLen: 0.9,
            bias: 0.35,
            wash: 1.05,
            fold: 1.0,
            quiet: 0.62,
            quietLo: -0.2,
            quietHi: 0.58,
            quietW: 0.26,
            quietX: 0.42,
          }}
          darkParams={{
            axisLift: 0.73,
            axisSlope: -0.05,
            axisBow: -0.08,
            rayLen: 0.95,
            bias: 0.35,
            wash: 1.15,
            fold: 1.0,
            quiet: 0.5,
            quietLo: -0.2,
            quietHi: 0.62,
            quietW: 0.3,
            quietX: 0.42,
          }}
          speed={0.6}
        />
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
              style={{ '--casc-i': i }}
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
