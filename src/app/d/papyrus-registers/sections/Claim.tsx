'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import { prefersReducedMotion } from '@/lib/dither';

import { CLAIMS } from '../data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The first rubric: the claim as one shaped text node that turns through
 * sixteen locales. The node carries its own lang and dir, so Devanagari
 * matras, Arabic joining and CJK line breaking are shaped by the browser,
 * never by per-character spans. One paused timeline holds the whole cycle
 * (dwell, fade, swap, fade) and a ScrollTrigger plays it only while the
 * heading is on screen. Under reduced motion the English claim stands.
 */
const DWELL = 2.6;
const OUT = 0.22;
const IN = 0.3;

export default function Claim() {
  const heading = useRef<HTMLHeadingElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const cursor = useRef(0);
  const [index, setIndex] = useState(0);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = word.current;
      if (!el || !heading.current) return;

      const tl = gsap.timeline({ paused: true, repeat: -1 });
      tl.to(el, { autoAlpha: 0, duration: OUT, ease: 'power1.in' }, DWELL)
        .call(() => {
          cursor.current = (cursor.current + 1) % CLAIMS.length;
          setIndex(cursor.current);
        })
        .to(el, { autoAlpha: 1, duration: IN, ease: 'power1.out' });

      ScrollTrigger.create({
        trigger: heading.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
    },
    { scope: heading }
  );

  const claim = CLAIMS[index % CLAIMS.length];

  return (
    <h1 className='pr-claim' id='pr-claim' ref={heading}>
      <span className='pr-claim-word' ref={word} lang={claim.lang} dir={claim.dir}>
        {claim.text}
      </span>
    </h1>
  );
}
