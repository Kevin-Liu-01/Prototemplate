'use client';

import { useRef, useState, type CSSProperties } from 'react';

import { useLayoutWork } from '../hooks';

const DIGITS = '0123456789';

/* Text that changes like a split-flap board: when the value changes, each
   digit that differs runs through the figures and settles, left to right,
   one flap after another. Letters, signs and spaces change at once. Under
   reduced motion the new value shows at once. `pace` slows the board: at 2
   everything takes twice as long. */
export default function FlipText({ value, className, pace = 1 }: { value: string; className?: string; pace?: number }) {
  const [shown, setShown] = useState(value);
  const last = useRef(value);

  useLayoutWork(
    () => {
      const from = last.current;
      last.current = value;
      if (from === value) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setShown(value);
        return;
      }
      const start = performance.now();
      let frame = 0;
      const tick = (now: number) => {
        const t = now - start;
        let done = true;
        let out = '';
        for (let i = 0; i < value.length; i++) {
          const to = value[i]!;
          // each flap settles a little after the one before it
          if (to === from[i] || !DIGITS.includes(to) || t > (160 + i * 26) * pace) {
            out += to;
            continue;
          }
          done = false;
          out += DIGITS[(Math.floor(t / (55 * pace)) + i * 3) % 10];
        }
        setShown(out);
        if (!done) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    },
    { dependencies: [value], revertOnUpdate: true }
  );

  return (
    <span className={['gtp-flip', className].filter(Boolean).join(' ')} style={pace === 1 ? undefined : ({ '--flap': `${0.2 * pace}s` } as CSSProperties)} aria-label={value}>
      {Array.from(shown).map((ch, i) => (
        // the key holds the character, so a changed flap mounts again and falls
        <span key={`${i}${ch}`} className='gtp-flip-ch' aria-hidden='true'>
          {ch}
        </span>
      ))}
    </span>
  );
}
