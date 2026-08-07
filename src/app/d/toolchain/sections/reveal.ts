'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The only entrance this direction uses: elements marked `data-reveal` rise a
 * few pixels and resolve. No scale, no blur, no stagger longer than a beat —
 * restraint is the thesis, and the page has to read the same in a screenshot.
 */
export function useQuietReveal(scope: RefObject<HTMLElement | null>, enabled = true) {
  useGSAP(
    () => {
      /* hosts that must never shift layout on load (the v0 product mounts)
         opt out — the resting DOM is the still */
      if (!enabled) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current), {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            /* The compositor hint lives only as long as the tween. A standing
               will-change (or a leftover 0px transform) turns every revealed
               cell into a stacking context that paints OVER the bento rows'
               1px seam rules — the founder's "border flickering out", and the
               same paint-over styles.css already patches for .tc-hatch. */
            { y: 16, autoAlpha: 0, willChange: 'transform, opacity' },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.62,
              stagger: 0.055,
              ease: 'power2.out',
              overwrite: true,
              /* land clean: strip exactly what the tween set, on exactly the
                 elements it batched, so no stacking context outlives the
                 entrance — the resting state is the stylesheet's, visually
                 identical to the tween's end frame */
              onComplete: () => {
                gsap.set(batch, {
                  clearProps: 'transform,opacity,visibility,willChange',
                });
              },
            }
          ),
      });
    },
    { scope }
  );
}
