'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import { prefersReducedMotion } from '@/lib/dither';

import { CLAIMS } from '../data';
import { playWhileVisible } from './motion';

/**
 * The claim as one shaped text node. The sentence holds for a beat, drops
 * out, and returns in the next locale with its own `lang` and `dir`; the
 * node is never split into characters. The loop is created paused and
 * played only while the hero is on screen. Under reduced motion the
 * English sentence stands.
 */
export default function Claim() {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current;
      if (el === null) return;
      let cursor = 0;
      const tl = gsap.timeline({ repeat: -1, paused: true });
      tl.to(el, { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, 3.1)
        .call(() => {
          cursor = (cursor + 1) % CLAIMS.length;
          setIndex(cursor);
        })
        .to(el, { autoAlpha: 1, duration: 0.26, ease: 'power1.out' });
      playWhileVisible(el, tl);
    },
    { scope: ref }
  );

  const word = CLAIMS[index] ?? CLAIMS[0];
  if (word === undefined) return null;
  return (
    <span ref={ref} className='sfc-claim' lang={word.lang} dir={word.dir ?? 'ltr'}>
      {word.text}
    </span>
  );
}
