'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { flipTo, setBoard } from './flapEngine';
import { SplitFlapLine } from './SplitFlapBoard';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type FlapPhraseProps = {
  /** Uppercase phrase set in tiles. Rendered server-side as real characters. */
  text: string;
  className?: string;
};

/**
 * The half of a headline that lands on the board.
 *
 * Every section headline in this direction ends in split-flap tiles: the
 * sentence is set in display type and its last phrase clacks over when the
 * section arrives. The tiles are `aria-hidden`; a text twin carries the meaning.
 */
export default function FlapPhrase({ text, className }: FlapPhraseProps) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const line = root.current?.querySelector<HTMLElement>('[data-flap-line]');
      if (!line) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          setBoard(line, ' '.repeat(Array.from(text).length));
          // Short enough that the phrase has always settled by the time a
          // reader (or a screenshot) arrives at the heading.
          flipTo(line, text, { per: 0.013, cycles: 2 });
        },
      });
      return () => trigger.kill();
    },
    { scope: root, dependencies: [text] }
  );

  return (
    <>
      <span className={className ? `ft-flapphrase ${className}` : 'ft-flapphrase'} ref={root} aria-hidden>
        <SplitFlapLine text={text} />
      </span>
      <span className='ft-sr'>{text}</span>
    </>
  );
}
