'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { getScrollVelocity, startScrollVelocity } from '../components/scroll-velocity';
import { useMarquee } from '../components/useMarquee';

gsap.registerPlugin(useGSAP);

export type MarqueeBandProps = {
  words: readonly string[];
  speed?: number;
  dir?: 1 | -1;
  label: string;
};

/**
 * The band — the direction's identity carried entirely by type and motion.
 * Words alternate solid and outlined display cuts, the track runs at a
 * scroll-bound speed, and the whole line shears with scroll velocity. No
 * separators, no glyph ornament, no channel marks.
 */
export default function MarqueeBand({ words, speed = 74, dir = 1, label }: MarqueeBandProps) {
  const track = useRef<HTMLDivElement>(null);
  useMarquee(track, { speed, dir, boost: 5 });

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      startScrollVelocity();
      const skewTo = gsap.quickTo(el, 'skewY', { duration: 0.55, ease: 'power2.out' });
      const drive = () => {
        skewTo(gsap.utils.clamp(-2.4, 2.4, getScrollVelocity() / 900));
      };
      gsap.ticker.add(drive);
      return () => gsap.ticker.remove(drive);
    },
    { scope: track }
  );

  return (
    <section className='tb-band' aria-label={label}>
      <div className='tb-band-track' ref={track}>
        {[0, 1].map((seg) => (
          <div className='tb-band-seg' key={seg} aria-hidden={seg === 1 || undefined}>
            {words.map((word, i) => (
              <span className={i % 2 === 0 ? 'tb-bword tb-foil' : 'tb-bword tb-out'} key={word}>
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
