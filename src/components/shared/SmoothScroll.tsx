'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The lenis package ships its own loose `Window.lenis` global declaration, so
 * redeclaring it with the instance type collides. Publish through a cast
 * instead (consumers read it back the same way, see app/present/lenis.ts).
 */
type LenisWindow = { lenis?: Lenis };

/**
 * Lenis smooth scroll wired to ScrollTrigger.
 *
 * The instance is published on `window.lenis` because the screenshot harness
 * drives scroll position through it; without that handle it can only move the
 * native scrollport, which Lenis immediately overrides.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      // Lenis drives its own rAF rather than riding gsap.ticker: a hydration
      // recovery (or Fast Refresh) can interleave mount/cleanup so the ticker
      // callback of the surviving instance gets removed, leaving a Lenis that
      // never ticks and a page that won't scroll.
      const lenis = new Lenis({ autoRaf: true, duration: 1.1 });
      const shared = window as unknown as LenisWindow;
      shared.lenis = lenis;

      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);

      return () => {
        lenis.destroy();
        // Another instance may already have replaced the handle mid-remount.
        if (shared.lenis === lenis) delete shared.lenis;
      };
    },
    { scope: container }
  );

  return <div ref={container}>{children}</div>;
}
