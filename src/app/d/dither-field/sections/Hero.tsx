'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import DitherWordmark, { type WordmarkSpec } from '../diagrams/DitherWordmark';
import { heroBroadcast, useDitherField } from '../fields';

gsap.registerPlugin(useGSAP);

/**
 * THE BROADCAST HERO.
 *
 * One composition, not a layout over a texture: a breathing 1-bit radial
 * burst — pure ink cells on paper, rendered by the Bayer engine at a cell
 * size chunky enough to read as print texture — converging on a deliberate
 * paper core, and the type block sits exactly inside that core. Two hairline
 * crosshair rules pass through the convergence point, so the alignment is
 * explicit: the headline, the burst and the rules share one center.
 *
 * The trust band beneath runs the same material through a glyph mask: all
 * six customer wordmarks rasterised to 1-bit fields (M03's HALFTONE form),
 * so the first viewport is one process applied twice — to energy and to
 * letterforms — with no grey anywhere.
 */

/* One weight for the whole wall. At 1-bit the cell budget is the type design:
   light cuts shed strokes and heavy cuts flood counters, so every mark runs
   at the same middleweight and keeps only its own tracking/case. */
const CUSTOMERS: readonly { name: string; spec: WordmarkSpec }[] = [
  { name: 'Cursor', spec: { text: 'Cursor', weight: 600, tracking: -0.02 } },
  { name: 'Ramp', spec: { text: 'Ramp', weight: 600, tracking: -0.01 } },
  { name: 'Mintlify', spec: { text: 'Mintlify', weight: 600 } },
  { name: 'Profound', spec: { text: 'Profound', weight: 600, tracking: 0.1, uppercase: true } },
  { name: 'Partiful', spec: { text: 'Partiful', weight: 600, tracking: -0.02 } },
  { name: 'ClickHouse', spec: { text: 'ClickHouse', weight: 600 } },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const canvasRef = useDitherField(heroBroadcast, {
    scale: 4,
    ink: '#0f1113',
    paper: 'transparent',
    fps: 24,
    reducedMotionTime: 3,
  });

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
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.1,
      });
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='df-hero'>
        {/* The crosshairs sit under the field, the type over it. */}
        <span className='df-hero-axis is-x' aria-hidden />
        <span className='df-hero-axis is-y' aria-hidden />
        <canvas className='df-hero-field' ref={canvasRef} aria-hidden />

        <div className='df-hero-core'>
          {/* The current site's own dev-first device: the command before the
              headline. Real command, copyable. */}
          <button className='tc-copy df-hero-cmd' data-hero-in type='button' onClick={copy}>
            <span>$ npx gt@latest</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <h1 data-hero-in>
            <span>Launch in</span>
            <span>
              <em>every</em> language.
            </span>
          </h1>

          <p className='df-hero-sub' data-hero-in>
            General Translation builds full-stack infrastructure for localizing apps, docs, and
            websites.
          </p>

          <div className='df-hero-acts' data-hero-in>
            <a className='tc-btn tc-btn-solid' href='#pricing'>
              Get started
            </a>
            <a className='tc-btn tc-btn-line' href='#frameworks'>
              Docs
            </a>
          </div>
        </div>
      </div>

      {/* M03 — six wordmarks through the same 1-bit process as the field
          above. The claim is the heading; the restraint is the diagram. */}
      <div className='df-trust'>
        <div className='df-trust-claim'>
          <h2>Cursor, Ramp and Profound ship in over thirty languages</h2>
        </div>
        <div className='df-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='df-trust-cell' key={customer.name}>
              <DitherWordmark spec={customer.spec} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
