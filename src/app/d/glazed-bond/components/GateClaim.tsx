'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { CLAIMS } from '../data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Deco home: the arch. The claim inscribed in the opening.
 *
 * One shaped text node carries the sentence with its `lang` and `dir`; a
 * paused timeline fades it out, rewrites text, lang and dir together, and
 * fades it back, then rests. A ScrollTrigger plays the loop only while the
 * arch is on screen. Under reduced motion nothing is scheduled and the
 * English source stands as the still. The display face covers Latin; the
 * other scripts fall back to Inter through the sheet's font stack.
 */
const FIRST = CLAIMS[0] ?? { text: 'Scale to every language', lang: 'en' };

export default function GateClaim() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      let index = 0;
      const tl = gsap.timeline({ paused: true, repeat: -1 });
      tl.to({}, { duration: 2.4 })
        .to(el, { autoAlpha: 0, y: -6, duration: 0.26, ease: 'power2.in' })
        .call(() => {
          index = (index + 1) % CLAIMS.length;
          const next = CLAIMS[index] ?? FIRST;
          el.textContent = next.text;
          el.lang = next.lang;
          el.dir = next.dir ?? 'ltr';
        })
        .to(el, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' });

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });

      return () => {
        trigger.kill();
        tl.kill();
      };
    },
    { scope: ref }
  );

  return (
    <h1 className='gb-claim' id='gb-claim'>
      <span ref={ref} lang={FIRST.lang} dir={FIRST.dir ?? 'ltr'}>
        {FIRST.text}
      </span>
    </h1>
  );
}
