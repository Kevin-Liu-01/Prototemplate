'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { prefersReducedMotion } from '@/lib/dither';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The tread pitch of every stair, matching TREAD in Terrace.tsx. */
const TREAD = 9;

/**
 * The stair descent, the page's one scroll motion. Every talud carries a
 * jade tread marker at the top of its stair, visible at rest. When a talud
 * enters view the marker steps down the treads to the foot of the band, one
 * tread per step, and stays there. Transform only; nothing is hidden first,
 * and under reduced motion the marker simply rests on the top tread.
 */
export default function Descent() {
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const marks = gsap.utils.toArray<SVGRectElement>('.talud-tablero-root .tt-stair-mark');
    const triggers = marks.map((mark) => {
      const talud = mark.closest<HTMLElement>('.tt-talud');
      if (!talud) return null;
      const height = talud.getBoundingClientRect().height;
      const steps = Math.max(1, Math.floor(height / TREAD) - 1);
      return ScrollTrigger.create({
        trigger: talud,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(mark, {
            attr: { y: steps * TREAD },
            duration: Math.min(1.2, 0.07 * steps),
            ease: `steps(${steps})`,
          });
        },
      });
    });
    return () => {
      triggers.forEach((trigger) => trigger?.kill());
    };
  });

  return null;
}
