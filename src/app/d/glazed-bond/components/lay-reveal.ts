'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { RefObject } from 'react';

import { prefersReducedMotion } from '@/lib/reduced-motion';

gsap.registerPlugin(useGSAP);

/**
 * The page's one entrance: bricks and medallions settle course by course when
 * their wall scrolls in. Every item is fully visible at rest; the motion is
 * transform only, a 10px rise to seat over half a second with a short
 * stagger, once. Opacity is never touched, so a no-JS render, a full-page
 * capture and the gallery thumbnail all show the laid wall. The timeline is
 * created paused and played once the wall's top reaches 80% of the viewport,
 * or once the reader is past it. Under reduced motion nothing is set and the
 * markup pose is the still.
 */
export function useLayReveal(root: RefObject<HTMLElement | null>, selector: string) {
  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      if (prefersReducedMotion()) return;

      const items = gsap.utils.toArray<HTMLElement>(selector, host);
      if (items.length === 0) return;

      gsap.set(items, { y: 10 });
      const tl = gsap
        .timeline({ paused: true })
        .to(items, { y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' });

      /* the root reaches far above the viewport, so a wall the reader jumped past still counts as reached */
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          io.disconnect();
          tl.play();
        },
        { root: document, rootMargin: '100000px 0px -20% 0px' }
      );
      io.observe(host);

      return () => {
        io.disconnect();
        tl.kill();
      };
    },
    { scope: root }
  );
}
