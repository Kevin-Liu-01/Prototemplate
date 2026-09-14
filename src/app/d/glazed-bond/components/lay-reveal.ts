'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The page's one entrance: bricks and medallions settle course by course
 * when their wall scrolls in. Every item is fully visible at rest; the
 * motion is transform only, a 10px rise to seat over half a second with a
 * short stagger, once. Opacity is never touched, so a no-JS render, a
 * full-page capture and the gallery thumbnail all show the laid wall. The
 * timeline is created paused and played by a ScrollTrigger at 80% of the
 * viewport. Under reduced motion nothing is set and the markup pose is the
 * still.
 */
export function useLayReveal(root: RefObject<HTMLElement | null>, selector: string) {
  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const items = gsap.utils.toArray<HTMLElement>(selector, host);
      if (items.length === 0) return;

      gsap.set(items, { y: 10 });
      const tl = gsap
        .timeline({ paused: true })
        .to(items, { y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' });

      const trigger = ScrollTrigger.create({
        trigger: host,
        start: 'top 80%',
        once: true,
        onEnter: () => tl.play(),
      });

      return () => {
        trigger.kill();
        tl.kill();
      };
    },
    { scope: root }
  );
}
