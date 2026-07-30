import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The foundry entrance, once per element marked `data-plate`: parts rise in
 * reading order (0.55s power3.out, 0.045s stagger) and a one-shot gloss band
 * sweeps each on arrival — plates seated on the bench, then a light raked
 * across them. The sheen span is created here rather than in JSX so every
 * section opts in with an attribute, the same way `data-reveal` works; CSS
 * parks it at translateX(-130%) so a cell whose sweep never runs (reduced
 * motion, WebGL page still fine) shows nothing.
 *
 * Timing is per batch, not per page: cells below the fold get their own
 * reading-order cascade when they arrive, instead of appearing at stagger
 * positions left over from cells the reader already saw.
 */
export function usePlateCascade(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const cells = gsap.utils.toArray<HTMLElement>('[data-plate]', scope.current);
      if (!cells.length) return;

      for (const cell of cells) {
        const sheen = document.createElement('span');
        sheen.className = 'pf-sheen';
        sheen.setAttribute('aria-hidden', 'true');
        cell.appendChild(sheen);
      }

      ScrollTrigger.batch(cells, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => {
          for (const [i, el] of (batch as HTMLElement[]).entries()) {
            const tl = gsap.timeline({ delay: i * 0.045 });
            tl.fromTo(
              el,
              { autoAlpha: 0, y: 42, scale: 0.97 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', overwrite: true }
            );
            const sheen = el.querySelector<HTMLElement>('.pf-sheen');
            if (sheen) {
              /* x must be pinned to 0: GSAP parses the CSS parking transform
                 translateX(-130%) into its px-based `x` channel, and a tween
                 that only drives xPercent leaves that -130%-worth of pixels in
                 place — the "swept-out" gloss then ends up net-centred over
                 the cell as a permanent smudge. */
              tl.fromTo(
                sheen,
                { x: 0, xPercent: -130 },
                { x: 0, xPercent: 130, duration: 0.85, ease: 'power2.inOut' },
                0.1
              );
            }
          }
        },
      });
    },
    { scope }
  );
}
