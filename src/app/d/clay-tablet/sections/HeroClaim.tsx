'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { HERO_WORDS } from './content';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DWELL = 2.6;
const OUT = 0.42;
const IN = 0.5;

/**
 * The claim, impressed in the hero tablet's top register: one shaped text
 * node with lang and dir that is re-impressed locale by locale. The stylus
 * pass is a clip-path wipe, left to right, on one timeline created paused
 * and played only while the tablet is on screen. At rest the node shows the
 * English claim complete; under reduced motion that rest is the whole story.
 */
export default function HeroClaim() {
  const heading = useRef<HTMLHeadingElement>(null);
  const word = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = word.current;
      const trigger = heading.current;
      if (!el || !trigger) return;

      let index = 0;
      const first = HERO_WORDS[0];
      const swap = () => {
        index = (index + 1) % HERO_WORDS.length;
        const next = HERO_WORDS[index] ?? first;
        el.textContent = next.text;
        el.lang = next.lang;
        el.dir = next.dir;
      };

      const tl = gsap.timeline({ paused: true, repeat: -1 });
      tl.set(el, { clipPath: 'inset(0% 0% 0% 0%)' })
        .to({}, { duration: DWELL })
        .to(el, { clipPath: 'inset(0% 0% 0% 100%)', duration: OUT, ease: 'power2.in' })
        .call(swap)
        .set(el, { clipPath: 'inset(0% 100% 0% 0%)' })
        .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: IN, ease: 'power2.out' });

      const st = ScrollTrigger.create({
        trigger,
        start: 'top 92%',
        end: 'bottom 8%',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
      if (st.isActive) tl.play();
    },
    { scope: heading }
  );

  return (
    <h1 className='ct-claim' ref={heading}>
      <span className='ct-claim-word' ref={word} lang='en' dir='ltr'>
        Scale to every language
      </span>
    </h1>
  );
}
