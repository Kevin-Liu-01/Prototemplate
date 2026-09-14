'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The page's one entrance: elements marked `data-reveal` inside `scope` rise
 * fourteen pixels and resolve as they enter, once. Under reduced motion the
 * hook returns before touching the DOM, so the markup pose is the still.
 */
export function useCourtReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const root = scope.current;
      if (root === null) return;
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
      if (targets.length === 0) return;
      gsap.set(targets, { y: 14, autoAlpha: 0 });
      ScrollTrigger.batch(targets, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out', overwrite: true }),
      });
    },
    { scope }
  );
}
