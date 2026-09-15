'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { prefersReducedMotion } from '@/lib/dither';

import { CLAIMS } from '../data';
import { playWhileVisible } from './motion';

/**
 * The claim as one shaped text node. The English sentence is in the
 * markup and is what a still, a thumbnail, and a no-script render show.
 * While the hero is on screen the sentence changes locale on a beat: the
 * node's text, `lang`, and `dir` are swapped together and the new
 * sentence settles up ten pixels into place. Nothing fades; the text is
 * fully visible at every frame. The node is never split into characters.
 * Under reduced motion the English sentence stands.
 */
const FIRST = CLAIMS[0] ?? { text: 'Scale to every language', lang: 'en' };

export default function Claim() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current;
      if (el === null) return;
      let cursor = 0;
      const tl = gsap.timeline({ repeat: -1, paused: true });
      tl.call(
        () => {
          cursor = (cursor + 1) % CLAIMS.length;
          const word = CLAIMS[cursor] ?? FIRST;
          el.textContent = word.text;
          el.lang = word.lang;
          el.dir = word.dir ?? 'ltr';
        },
        [],
        3.2
      )
        .set(el, { y: 10 })
        .to(el, { y: 0, duration: 0.34, ease: 'power2.out' });
      playWhileVisible(el, tl);
    },
    { scope: ref }
  );

  return (
    <span ref={ref} className='sfc-claim' lang={FIRST.lang} dir={FIRST.dir ?? 'ltr'}>
      {FIRST.text}
    </span>
  );
}
