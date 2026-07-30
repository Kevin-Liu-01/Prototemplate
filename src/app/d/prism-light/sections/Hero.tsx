'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

gsap.registerPlugin(useGSAP);

/**
 * THE EDGE HORIZON — this fork's hero.
 *
 * The prismatic burst never touches the paper. Every canvas here runs behind a
 * `mix-blend-mode: lighten` group over pure ink geometry, so anything white
 * stays white and the dispersed light exists only *inside* the black shapes:
 * the two-line display headline, the prism specimen at the top right, the
 * doubled thread ribbons, and the horizon band. At arm's length the page is
 * ink on paper; up close the ink is full of light.
 *
 * R3 exposure law: every letter-mask field carries a drawn shade floor —
 * a minimum ink density over the whole fill — so no streak ever approaches
 * paper luminance and the headline reads as one near-black material with
 * light inside it, both lines the same. (The r2 fill had no floor and the
 * tops of 'u/a/g' dissolved against the paper.)
 *
 * The composition reads top-left to bottom-right along the light's own axis
 * (AESTHETIC_ADDENDUM 2b): a French reader's request leaves the headline,
 * rides the two threads — source and translation, constant gauge — into the
 * horizon band at the `fra` point of presence, and the response annotation
 * comes back off the band's top rule at 12 ms. The upper-right quadrant is
 * counterweighted by the prism specimen: one `en` beam entering a bounded ink
 * plate and leaving as a fan of locales — the product's whole argument as a
 * physical object.
 */

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/** Points of presence on the horizon band, each with its measured p50. `fra`
    is the one serving this reader. */
const POPS: readonly { code: string; ms: number; x: string; hit?: boolean }[] = [
  { code: 'sfo', ms: 17, x: '12%' },
  { code: 'iad', ms: 21, x: '31%' },
  { code: 'fra', ms: 12, x: '52%', hit: true },
  { code: 'sin', ms: 41, x: '72%' },
  { code: 'gru', ms: 29, x: '88%' },
];

/** The locales fanning out of the prism specimen's right edge. */
const SPEC_OUT: readonly string[] = ['fr', 'es', 'de', 'ja', 'zh', '+113'];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
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

      /* clearProps: a leftover inline transform on any ancestor of the light
         wrappers would create a stacking context and break their blend group,
         so every entrance tween cleans up after itself. The headline block and
         the prism specimen are never animated for the same reason. */
      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
      });

      /* The threads draw themselves once, headline to horizon. Not a loop —
         the page's restraint budget is spent on the light itself. */
      const paths = gsap.utils.toArray<SVGPathElement>('.plh-thread', root.current);
      for (const path of paths) {
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: 0.5 }
        );
      }

      gsap.from('.plh-pop', {
        autoAlpha: 0,
        y: 6,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 1.1,
      });
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='plh'>
        <div className='plh-top'>
          <button className='tc-copy plh-chip' type='button' onClick={copy} data-hero-in>
            <span>$ npx gt@latest</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* One material for the whole headline: both lines sit inside a
              single lighten group, so 'Launch in' and 'every language.' carry
              the same prism-filled ink instead of splitting into two weights.
              Not animated: an entrance transform would isolate the blend
              group and flood the paper. */}
          <h1 className='plh-h1'>
            <span className='plh-block'>
              <span className='plh-block-light' aria-hidden>
                {/* The reference anatomy, made deterministic: two lobes of
                    streaked light converging on a dark eye. The field's one
                    reliably bright lobe is clipped to each half of the block
                    and mirrored about its center, and the shade layer above
                    caps exposure everywhere — floor first, then the eye. */}
                <span className='plh-block-half is-l'>
                  <PrismaticField
                    className='plh-field-word'
                    preset='1'
                    speed={0.35}
                    params={{ exposureScale: 2200 }}
                  />
                </span>
                <span className='plh-block-half is-r'>
                  <PrismaticField
                    className='plh-field-word'
                    preset='1'
                    speed={0.35}
                    params={{ exposureScale: 2200 }}
                  />
                </span>
                <span className='plh-block-shade' />
              </span>
              <span className='plh-line'>Launch in</span>
              <span className='plh-line'>every language.</span>
            </span>
          </h1>

          <div className='plh-lede' data-hero-in>
            <p className='plh-sub'>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites — translated at build, served from the edge.
            </p>
            <div className='plh-acts'>
              <a className='tc-btn tc-btn-solid' href='#pricing'>
                Get started
              </a>
              <a className='tc-btn tc-btn-line' href='#frameworks'>
                Read the docs
              </a>
            </div>
          </div>

          {/* The counterweight object (resend puts a machined cube here; this
              fork puts the product): a bounded ink plate, one white `en` beam
              entering on the left, the burst dispersing inside the ink, and a
              fan of locale ticks leaving the right edge. */}
          <figure
            className='plh-spec'
            role='img'
            aria-label='A prism drawn as a dark plate: one English source beam enters on the left, disperses into spectral light inside, and leaves as ticks labelled fr, es, de, ja, zh and 113 more'
          >
            <div className='plh-spec-box' aria-hidden>
              <div className='plh-spec-light'>
                <PrismaticField
                  className='plh-spec-field'
                  preset='1'
                  speed={0.45}
                  params={{ exposureScale: 1700 }}
                />
                <span className='plh-spec-shade' />
              </div>
              <span className='plh-spec-beam' />
              <span className='plh-spec-en'>en · source</span>
              <div className='plh-spec-outs'>
                {SPEC_OUT.map((code) => (
                  <span key={code}>
                    {code}
                    <i />
                  </span>
                ))}
              </div>
            </div>
            <figcaption className='plh-spec-cap'>
              <span>one build in · 118 locales out</span>
              <span>v214</span>
            </figcaption>
          </figure>
        </div>

        <div className='plh-horizon'>
          {/* Ink geometry first; the light is layered over all of it. */}
          <svg className='plh-threads' viewBox='0 0 1170 320' preserveAspectRatio='none' aria-hidden>
            {/* the two threads: source and translation, never merging */}
            <path
              className='plh-thread'
              d='M 150 64 C 340 110, 500 148, 600 208'
              fill='none'
              stroke='#0c0e11'
              strokeWidth='3'
            />
            <path
              className='plh-thread'
              d='M 150 76 C 340 122, 504 160, 614 222'
              fill='none'
              stroke='#0c0e11'
              strokeWidth='3'
            />
            <line x1='614' y1='192' x2='626' y2='192' stroke='rgba(15,17,19,0.6)' strokeWidth='1.5' />
          </svg>

          {/* The response leader: an elbow rising off fra's own tick, drawn in
              HTML with percent anchors so it survives every viewport — the
              200 is visibly the answer coming back from the POP the threads
              just landed on, on mobile too. */}
          <span className='plh-leader' aria-hidden />

          {/* The light inside the threads: a second field clipped to the exact
              ribbon geometry above, its bright axis rotated to run along the
              dive — dispersed spectrum living inside the ink strokes. */}
          <div className='plh-t-light' aria-hidden>
            <PrismaticField
              className='plh-field-thread'
              preset='1'
              speed={0.55}
              params={{ exposureScale: 1500 }}
            />
            {/* Ink at the request end, spectrum gathering toward the edge. */}
            <span className='plh-t-shade' />
          </div>

          <div className='plh-req' data-hero-in>
            <b>GET example.com/fr/a-propos</b>
            <span>accept-language: fr-FR</span>
          </div>

          <div className='plh-res' data-hero-in>
            <b>200 · served from fra</b>
            <span>12 ms · no origin hit</span>
          </div>

          <div className='plh-band'>
            <div className='plh-band-row'>
              <span>translation edge</span>
              <span>anycast · versioned per locale · v214 live</span>
            </div>
            <div className='plh-pops'>
              {POPS.map((pop) => (
                <span className='plh-pop' data-hit={pop.hit || undefined} style={{ left: pop.x }} key={pop.code}>
                  <i />
                  <span className='plh-pop-l'>
                    {pop.code}
                    <b> · {pop.ms} ms</b>
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* The burst, masked into the ink: its dark convergence point sits on
              the band at `fra`, light streaming outward along the horizon. */}
          <div className='plh-h-light' aria-hidden>
            <PrismaticField
              className='plh-field-fill'
              preset='1'
              speed={0.5}
              params={{ exposureScale: 2200 }}
            />
            {/* Two quiet strips of shade — one under the POP labels at the top
                rule, one under the caption row at the floor — so the band's
                type is never asked to outshine the streaks. */}
            <span className='plh-h-shade' />
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
