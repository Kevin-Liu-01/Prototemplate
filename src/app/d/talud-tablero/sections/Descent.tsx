'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { prefersReducedMotion } from '@/lib/reduced-motion';

gsap.registerPlugin(useGSAP);

/** The tread pitch of every stair, matching TREAD in Terrace.tsx. */
const TREAD = 9;

/**
 * The stair descent, the page's one scroll motion. Every talud carries a jade
 * tread marker at the top of its stair, visible at rest. When a talud's top
 * reaches 82 percent of the viewport, or the reader is past it, the marker
 * steps down the treads to the foot of the band, one tread per step, and
 * stays there. Transform only; nothing is hidden first, and under reduced
 * motion the marker simply rests on the top tread.
 */
export default function Descent() {
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const marks = gsap.utils.toArray<SVGRectElement>('.talud-tablero-root .tt-stair-mark');
    const descend = new Map<Element, () => void>();
    for (const mark of marks) {
      const talud = mark.closest<HTMLElement>('.tt-talud');
      if (!talud) continue;
      const height = talud.getBoundingClientRect().height;
      const steps = Math.max(1, Math.floor(height / TREAD) - 1);
      descend.set(talud, () => {
        gsap.to(mark, {
          attr: { y: steps * TREAD },
          duration: Math.min(1.2, 0.07 * steps),
          ease: `steps(${steps})`,
        });
      });
    }
    /* the root reaches far above the viewport, so a talud the reader jumped past still counts as reached */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          descend.get(entry.target)?.();
        }
      },
      { root: document, rootMargin: '100000px 0px -18% 0px' }
    );
    for (const talud of descend.keys()) io.observe(talud);
    return () => io.disconnect();
  });

  return null;
}
