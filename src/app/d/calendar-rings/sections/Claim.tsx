'use client';

/**
 * calendar-rings: the claim at the disk's center.
 *
 * One shaped text node carries the headline and cycles through the
 * shipped roster of locales: the node's text, `lang` and `dir` change
 * together, never per character. The timeline is created paused and
 * played only while the hub is on screen; under reduced motion the
 * English still is all there is.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { prefersReducedMotion } from '@/lib/dither';

import { CLAIM_WORDS } from '../data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FIRST = CLAIM_WORDS[0] ?? { text: 'Scale to every language', lang: 'en', dir: 'ltr' as const };

export function Claim() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current;
      if (!el) return;
      let idx = 0;
      const tl = gsap.timeline({ paused: true, repeat: -1 });
      tl.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 3.2)
        .call(() => {
          idx = (idx + 1) % CLAIM_WORDS.length;
          const word = CLAIM_WORDS[idx] ?? FIRST;
          el.textContent = word.text;
          el.lang = word.lang;
          el.dir = word.dir;
        })
        .to(el, { autoAlpha: 1, duration: 0.42, ease: 'power1.out' });
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
    <h1 className='cr-claim'>
      <span ref={ref} lang={FIRST.lang} dir={FIRST.dir}>
        {FIRST.text}
      </span>
    </h1>
  );
}
