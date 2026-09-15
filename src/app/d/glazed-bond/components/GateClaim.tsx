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
 * One shaped text node carries the sentence with its `lang` and `dir`. A
 * paused timeline wipes the glaze off the text with a clip-path from left
 * to right, rewrites text, lang and dir together while nothing is showing,
 * then wipes the new sentence on from the left and rests. Opacity is never
 * touched: at rest the clip is the full box and the text is simply there,
 * so a no-JS render, a capture and a thumbnail all read the claim. A
 * ScrollTrigger plays the loop only while the arch is on screen. Under
 * reduced motion nothing is scheduled and the English source stands as
 * the still. The display face covers Latin; the other scripts fall back to
 * Inter through the sheet's font stack.
 */
const FIRST = CLAIMS[0] ?? { text: 'Scale to every language', lang: 'en' };

const REST = 'inset(0 0 0 0)';
const WIPED_OFF = 'inset(0 0 0 100%)';
const WIPE_ON_START = 'inset(0 100% 0 0)';

export default function GateClaim() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      let index = 0;
      gsap.set(el, { clipPath: REST });
      const tl = gsap.timeline({ paused: true, repeat: -1 });
      tl.to({}, { duration: 2.4 })
        .to(el, { clipPath: WIPED_OFF, duration: 0.3, ease: 'power2.in' })
        .call(() => {
          index = (index + 1) % CLAIMS.length;
          const next = CLAIMS[index] ?? FIRST;
          el.textContent = next.text;
          el.lang = next.lang;
          el.dir = next.dir ?? 'ltr';
        })
        .set(el, { clipPath: WIPE_ON_START })
        .to(el, { clipPath: REST, duration: 0.38, ease: 'power2.out' });

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
        gsap.set(el, { clearProps: 'clipPath' });
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
