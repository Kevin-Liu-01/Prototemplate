'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { prefersReducedMotion } from '@/lib/reduced-motion';

import { blankLine, flipUp } from './flap';
import { FlapChars } from './FlapText';

gsap.registerPlugin(useGSAP);

export type FlapPhraseProps = {
  text: string;
  /** Flash the settling glyphs accent-blue (the board's phosphor). */
  flash?: boolean;
};

/**
 * A phrase that lands on the board: it clacks over once as it scrolls
 * into view — fast enough that it has always settled by the time a
 * reader reaches it. SSR renders the real characters; reduced motion
 * never blanks them. An IntersectionObserver fires the flip once, when the
 * line's top passes 88% of the viewport's height, so the blog index loads
 * no ScrollTrigger for it.
 *
 * Ported from apps/landing/src/components/blog/FlapPhrase.tsx.
 */
export default function FlapPhrase({ text, flash = true }: FlapPhraseProps) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const line = root.current;
      if (!line || !contextSafe) return;
      if (prefersReducedMotion()) return;

      const flip = contextSafe(() => {
        blankLine(line);
        flipUp(line, { per: 0.013, cycles: 2, flash });
      });
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          io.disconnect();
          flip();
        },
        { rootMargin: '0px 0px -12% 0px' }
      );
      io.observe(line);
      return () => io.disconnect();
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
