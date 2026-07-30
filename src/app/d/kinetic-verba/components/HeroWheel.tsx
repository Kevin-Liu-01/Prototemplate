'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LanguageWheel from '@/components/shared/LanguageWheel';

import { ACCRETION_GLYPHS, lensPulse } from '../lib/hero-stream';

gsap.registerPlugin(useGSAP);

const GLYPHS = ACCRETION_GLYPHS.join('');

/**
 * The canonical `LanguageWheel`, mounted on the burst's dark centre.
 *
 * Everything specific to this direction lives on the wrapper: the dial sits on
 * the point every lane radiates from, and each pair it emits charges
 * `lensPulse`, which this wrapper bleeds off through the core's own edge
 * light rather than a halo — the mark has to read as the burst's void, not as
 * a lamp sitting on top of it. The dial itself — bezel, arc, orbit, mark — is
 * the shared component, unforked.
 */
export default function HeroWheel() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const breathe = gsap.to(host, {
        '--kv-swell': 1.03,
        duration: 3.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      const tick = (_time: number, deltaMs: number) => {
        if (lensPulse.charge <= 0.001) return;
        const dt = Math.min(deltaMs, 60) / 1000;
        lensPulse.charge *= 1 - Math.min(1, dt * 2.6);
        host.style.setProperty('--kv-charge', lensPulse.charge.toFixed(3));
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        breathe.kill();
      };
    },
    { scope: root }
  );

  return (
    <div className='kv-wheel' ref={root} aria-hidden>
      <span className='kv-wheel-void' />
      <LanguageWheel glyphs={GLYPHS} arcDuration={3.4} arcSweep={15} priority />
    </div>
  );
}
