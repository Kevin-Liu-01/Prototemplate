'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

import { ACCRETION_GLYPHS } from '../content';

/**
 * M2 — the gravity well at hero centre.
 *
 * Four things genuinely distort here rather than fake it with a vignette:
 * 1. three concentric `backdrop-filter` shells re-sample everything passing
 *    behind the glass — blur, contrast and hue rotation escalating inward, so
 *    a component crossing the disc visibly refracts;
 * 2. a counter-rotating conic spectrum bends light around the core;
 * 3. the accretion glyphs run through a real `feDisplacementMap`;
 * 4. the ray components bend and stretch tangentially at the rim (Hero.tsx).
 *
 * The core is the actual GT mark, never a redraw of it.
 */
export default function LensGate() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      gsap.to('[data-lens-arc]', {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 4.2,
        ease: 'none',
        repeat: -1,
      });
      gsap.to('[data-lens-swirl]', {
        rotation: -360,
        transformOrigin: '50% 50%',
        duration: 34,
        ease: 'none',
        repeat: -1,
      });
      gsap.to('[data-lens-rim]', {
        scale: 1.035,
        duration: 3.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // accretion disc: glyphs spiral in and are consumed at the rim
      const glyphs = gsap.utils.toArray<HTMLElement>('[data-accretion] i');
      glyphs.forEach((glyph, i) => {
        const state = { t: 0 };
        const a0 = (i / glyphs.length) * Math.PI * 2;
        const dir = i % 2 === 0 ? 1 : -1;
        const tilt = 0.5 + ((i * 7) % 5) * 0.07;
        const draw = () => {
          const t = state.t;
          const size = root.current?.clientWidth ?? 240;
          const radius = size * (0.86 - 0.46 * t);
          const angle = a0 + dir * t * 2.1;
          gsap.set(glyph, {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius * tilt,
            scale: 1 - 0.45 * t,
            opacity: Math.sin(Math.PI * Math.min(1, t * 1.12)) * 0.75,
          });
        };
        gsap.to(state, {
          t: 1,
          duration: 7 + (i % 5),
          ease: 'power1.in',
          repeat: -1,
          onUpdate: draw,
        });
      });
    },
    { scope: root }
  );

  return (
    <div className='cm-lens' ref={root}>
      <div className='cm-lens-shell s1' />
      <div className='cm-lens-swirl' data-lens-swirl />
      <div className='cm-lens-shell s2' />
      <div className='cm-lens-shell s3' />
      <div className='cm-lens-rim' data-lens-rim />

      <svg className='cm-lens-ring' viewBox='0 0 200 200' aria-hidden>
        <circle className='track' cx='100' cy='100' r='86' />
        <circle className='arc' data-lens-arc cx='100' cy='100' r='74' />
      </svg>

      <div className='cm-accretion' data-accretion aria-hidden>
        {ACCRETION_GLYPHS.map((glyph, i) => (
          <i key={`${glyph}-${i}`}>{glyph}</i>
        ))}
      </div>

      <div className='cm-lens-core'>
        <Image
          src='/brand/no-bg-gt-logo-dark.png'
          alt='General Translation'
          width={220}
          height={220}
          priority
        />
      </div>

      <span className='cm-gate-num' style={{ top: '-16px', left: '14%' }}>
        1
      </span>
      <span className='cm-gate-num' style={{ bottom: '-14px', right: '10%' }}>
        8
      </span>
      <span className='cm-gate-num' style={{ top: '46%', right: '-22px' }}>
        9
      </span>
    </div>
  );
}
