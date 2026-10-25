'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { RefObject } from 'react';

import { prefersReducedMotion } from '@/lib/reduced-motion';

gsap.registerPlugin(useGSAP);

/**
 * The page's one entrance: every `[data-rise]` descendant settles from 16px
 * below to rest over 0.62s, staggered by 0.055s, once, when the register's
 * top reaches 85 percent of the viewport or the reader is past it. The motion
 * is transform only and never touches opacity: content is fully visible at
 * rest, before any script runs and in a still capture, and the tween adds the
 * settle on top of that visible pose. Under reduced motion the markup pose is
 * the still and nothing is scheduled.
 */
export function useRise(root: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>('[data-rise]', el);
      if (items.length === 0) return;
      gsap.set(items, { y: 16 });
      const rise = gsap.to(items, { y: 0, duration: 0.62, ease: 'power2.out', stagger: 0.055, paused: true });
      /* the root reaches far above the viewport, so a register the reader jumped past still counts as reached */
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          io.disconnect();
          rise.play();
        },
        { root: document, rootMargin: '100000px 0px -15% 0px' }
      );
      io.observe(el);
      return () => io.disconnect();
    },
    { scope: root }
  );
}
