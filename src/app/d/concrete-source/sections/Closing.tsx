'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { createPrismaticField } from '@/lib/prismatic-field';

import { STEP } from '../components/motion';
import { CLOSING_ROTATIONS } from '../content';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Closing CTA. Preset 2 of the prismatic field (arc/dome over a dark core) is
 * the one spectral accent reprise, and the headline's second half hard-cuts
 * through the locale list.
 */
export default function Closing() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;

      const canvas = host.querySelector<HTMLCanvasElement>('#field2');
      const closeField = canvas
        ? createPrismaticField(canvas, { preset: '2', dpr: 1, speed: 0.45, params: { exposureScale: 2400 } })
        : null;
      if (!closeField) host.classList.add('no-webgl');

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        return () => closeField?.destroy();
      }

      /* The original gated this field with
         `closeField.pause()` + ScrollTrigger(top bottom / bottom top) toggling
         resume/pause. In the vendor script `resume()` restores the ORIGINAL
         creation timestamp (`start = now - (now - start)`), so pausing only
         stopped drawing — the shader's uTime always tracked time since page
         load. The shared lib's `resume()` instead resets its clock to zero, so
         the beam replayed its opening frames every time the section scrolled
         into view: at the closing beat it rendered t≈1.4 instead of t≈9, which
         measured as a top-right quadrant ~30 luma brighter than the source.
         Leaving the field running reproduces the authored clock exactly; the
         gating was a paint-cost optimisation with no visual consequence. */

      const rot2 = host.querySelector<HTMLElement>('#rot2');
      let ci = 0;
      const cycleClose = () => {
        gsap.delayedCall(2.6, () => {
          if (!rot2) return;
          ci = (ci + 1) % CLOSING_ROTATIONS.length;
          rot2.textContent = CLOSING_ROTATIONS[ci];
          gsap.fromTo(rot2, { opacity: 0.35 }, { opacity: 1, duration: 0.28, ease: STEP(2) });
          cycleClose();
        });
      };
      cycleClose();

      return () => closeField?.destroy();
    },
    { scope: root }
  );

  return (
    <section className='closing' id='closing' ref={root}>
      <canvas id='field2' aria-hidden='true' />
      <span className='sec-idx'>[07] REACH EVERY USER //</span>
      <h2 className='slab' data-stamp>
        DEPLOY TODAY IN
        <br />
        <span className='chrome' id='rot2'>
          EVERY LANGUAGE
        </span>
      </h2>
      <p className='sec-sub' data-stamp>
        Talk to an engineer about implementation or get started for free.
      </p>
      <div className='hero-ctas' data-stamp>
        <a className='primary' href='#demo'>
          Get a Demo
        </a>
        <a className='ghost' href='#signin'>
          Sign Up
        </a>
      </div>
    </section>
  );
}
