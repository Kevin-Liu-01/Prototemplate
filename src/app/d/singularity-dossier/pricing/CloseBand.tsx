'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import Link from 'next/link';

import { createGlyphField } from './glyphField';

/**
 * The close — the shared "Deploy today." band: the copy block stands
 * LEFT, and the RIGHT side is the glyph condensation field — glyphs
 * from eight scripts drifting in depth, condensing into the word
 * "language" in one script after another (createGlyphField with the
 * rising drift). ONE canvas spans the rail column: the engine's own
 * dithered copy-clearing keeps the left zone quiet for the type, so
 * no mask and no second ambient field ever fight it. The CTAs are
 * plain anchors — the ringed solid and the outline pair.
 */
export default function CloseBand() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      const canvas = stage.current;
      if (!rootEl || !canvas) return;

      const h2 = rootEl.querySelector('h2');
      /* the narrow fold's quiet zone anchors to the copy block's REAL
         bottom (offset metrics — the same box the canvas fills), so a
         deep-wrapping fold can never push the CTAs into the rain */
      const copyEl = rootEl.querySelector<HTMLElement>('.pricing-close-copy');
      const field = createGlyphField({
        canvas,
        drift: 'rise',
        displayFamily: h2 ? getComputedStyle(h2).fontFamily : undefined,
        monoFamily:
          getComputedStyle(rootEl).getPropertyValue('--tc-mono').trim() ||
          undefined,
        copyBottom: copyEl
          ? () => copyEl.offsetTop + copyEl.offsetHeight
          : undefined,
      });

      return () => field?.destroy();
    },
    { scope: root }
  );

  return (
    <section className='tc-sec pricing-close' ref={root}>
      {/* the rail column carried through the full-bleed band — the
          canvas mounts INSIDE it, so the formed word is never struck
          by a rail hairline */}
      <div className='pricing-close-in'>
        <canvas
          className='pricing-close-canvas'
          ref={stage}
          aria-hidden='true'
        />
        <div className='pricing-close-copy'>
          <h2>Deploy today.</h2>
          <p className='pricing-close-sub'>
            Join the world&rsquo;s best developer teams on General Translation
          </p>
          <div className='pricing-close-acts'>
            <span className='pricing-close-cta'>
              <Link
                className='pricing-close-btn is-solid'
                href='/d/singularity-dossier'
              >
                Get Started
              </Link>
            </span>
            <Link
              className='pricing-close-btn'
              href='/d/singularity-dossier/contact'
            >
              Get a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
