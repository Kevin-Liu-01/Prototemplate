'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The only entrance this direction uses: elements marked `data-reveal` rise a
 * few pixels and resolve. No scale, no blur, no stagger longer than a beat —
 * restraint is the thesis, and the page has to read the same in a screenshot.
 */
export function useQuietReveal(scope: RefObject<HTMLElement | null>, enabled = true) {
  useGSAP(
    () => {
      /* hosts that must never shift layout on load (the v0 product mounts)
         opt out — the resting DOM is the still */
      if (!enabled) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current), {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.62, stagger: 0.055, ease: 'power2.out', overwrite: true }
          ),
      });
    },
    { scope }
  );
}
