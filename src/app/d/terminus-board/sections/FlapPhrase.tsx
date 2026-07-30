'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { blankLine, flipUp } from '../lib/flap';
import { FlapChars } from './FlapText';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type FlapPhraseProps = { text: string };

/**
 * The half of a headline that lands on the board: every section headline in
 * this direction ends in flap cells, and the last phrase clacks over once as
 * the section arrives — fast enough that it has always settled by the time a
 * reader (or a screenshot) reaches the heading. SSR renders the real
 * characters; reduced motion never blanks them.
 */
export default function FlapPhrase({ text }: FlapPhraseProps) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const line = root.current;
      if (!line) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const trigger = ScrollTrigger.create({
        trigger: line,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          blankLine(line);
          flipUp(line, { per: 0.013, cycles: 2 });
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
