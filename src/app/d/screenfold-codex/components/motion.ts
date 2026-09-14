'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

import { prefersReducedMotion } from '@/lib/dither';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The codex's one entrance: every `[data-reveal]` inside the scope rises
 * 16px to rest over 0.62s with a short stagger, once, when the scope
 * reaches the lower fifth of the viewport. Under reduced motion nothing is
 * set up and the markup pose is the still.
 */
export function useQuietReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const root = scope.current;
      if (root === null) return;
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
      if (items.length === 0) return;
      gsap.set(items, { y: 16, autoAlpha: 0 });
      gsap.to(items, {
        y: 0,
        autoAlpha: 1,
        duration: 0.62,
        ease: 'power2.out',
        stagger: 0.055,
        scrollTrigger: { trigger: root, start: 'top 84%', once: true },
      });
    },
    { scope }
  );
}

/** Plays a paused timeline while its trigger is on screen and pauses it otherwise. */
export function playWhileVisible(trigger: Element, timeline: gsap.core.Timeline): ScrollTrigger {
  return ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      if (self.isActive) timeline.play();
      else timeline.pause();
    },
  });
}
