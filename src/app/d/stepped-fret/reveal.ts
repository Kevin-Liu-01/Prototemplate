'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** True when the reader has asked the OS to reduce motion. */
export function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The page's one entrance: every `[data-rise]` descendant settles from 16px
 * below to rest over 0.62s, staggered by 0.055s, once, when the register
 * reaches 85 percent of the viewport. The motion is transform only: content
 * is fully visible at rest, before any script runs and in a still capture,
 * and the tween adds the settle on top of that visible pose. Under reduced
 * motion the markup pose is the still and nothing is scheduled.
 */
export function useRise(root: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = root.current;
      if (!el || reducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>('[data-rise]', el);
      if (items.length === 0) return;
      gsap.from(items, {
        y: 16,
        duration: 0.62,
        ease: 'power2.out',
        stagger: 0.055,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    },
    { scope: root }
  );
}
