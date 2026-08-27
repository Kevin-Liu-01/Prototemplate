'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { blankLine, flipUp } from './flap';
import { FlapChars } from './FlapText';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type FlapPhraseProps = {
  text: string;
  /** Flash the settling glyphs accent-blue (the board's phosphor). */
  flash?: boolean;
};

/**
 * A phrase that lands on the board: it clacks over once as it scrolls
 * into view — fast enough that it has always settled by the time a
 * reader reaches it. SSR renders the real characters; reduced motion
 * never blanks them.
 *
 * Ported from apps/landing/src/components/blog/FlapPhrase.tsx.
 */
export default function FlapPhrase({ text, flash = true }: FlapPhraseProps) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const line = root.current;
      if (!line) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: line,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          blankLine(line);
          flipUp(line, { per: 0.013, cycles: 2, flash });
        },
      });
      return () => trigger.kill();
    },
    { scope: root }
  );

  return (
    <>
      <span ref={root} data-tb-line aria-hidden>
        <FlapChars text={text} />
      </span>
      <span className='tb-sr'>{text}</span>
    </>
  );
}
