'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';
import GlyphRain from '../../singularity/sections/GlyphRain';

gsap.registerPlugin(useGSAP);

/* One merge, replayed forever. Times are the pipeline's own claims —
   the same figures the rest of the family quotes. */
const LOG = [
  ['T+00:00', 'english strings merged to main'],
  ['T+00:03', '14 locales queued · context resolved'],
  ['T+00:41', 'translations returned · terminology pinned'],
  ['T+01:12', 'review pass clean · zero exceptions'],
  ['T+03:24', 'six locales live at the edge'],
  ['T+03:24', 'signal repeats on every merge'],
] as const;

/**
 * The rollout, broadcast: a dark band where one merge types itself out as
 * a transmission log — glyphs raining behind the dark, the beam running
 * along the band's foot. The loop plays the log in, holds, clears, and
 * repeats; reduced motion prints the finished log.
 */
export default function TransmissionLog() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>('[data-sgs-line]', root.current);
      if (lines.length === 0) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      tl.set(lines, { autoAlpha: 0 })
        .to(lines, { autoAlpha: 1, duration: 0.08, stagger: 0.92, ease: 'none' })
        .to({}, { duration: 3.2 })
        .to(lines, { autoAlpha: 0, duration: 0.35, ease: 'none' });

      return () => {
        tl.kill();
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-band sgs-band' aria-label='A rollout, replayed' ref={root}>
      <GlyphRain className='sgs-rain' intensity={0.5} />
      <div className='sgs-band-in'>
        <header className='sgs-band-head'>
          <h2>One merge. Every market.</h2>
          <p>
            This is the whole ceremony: your engineers merge English, and the machine does the
            rest. Context, terminology, review, delivery.
          </p>
        </header>
        <div className='sgs-log' role='log'>
          {LOG.map(([t, line], i) => (
            <div className='sgs-log-line' data-sgs-line key={i}>
              <span className='sgs-log-t'>{t}</span>
              <span className='sgs-log-msg'>{line}</span>
            </div>
          ))}
          <span className='sgs-caret' aria-hidden />
        </div>
      </div>
      <PrismaticField className='sgs-beam' preset='1' speed={0.35} params={{ exposureScale: 1500 }} />
    </section>
  );
}
