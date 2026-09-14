'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { prefersReducedMotion } from '@/lib/dither';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The page's one entrance. Each band's cut elements ([data-cut]) settle in
 * from 12px below over 0.55s, once, when the band reaches the lower part
 * of the viewport. The motion is transform only: nothing is ever hidden,
 * so the page reads in full before any script runs, in a full-page
 * capture, and in the gallery still. Under reduced motion nothing is set
 * up and the markup is the still.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const bands = gsap.utils.toArray<HTMLElement>('[data-band]', root.current);
      bands.forEach((band) => {
        const cuts = band.querySelectorAll<HTMLElement>('[data-cut]');
        if (cuts.length === 0) return;
        gsap.from(cuts, {
          y: 12,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.055,
          scrollTrigger: { trigger: band, start: 'top 86%', once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <div className='tr-reveal' ref={root}>
      {children}
    </div>
  );
}
