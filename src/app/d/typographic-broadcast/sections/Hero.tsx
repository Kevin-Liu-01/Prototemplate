'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { useRef, useState } from 'react';

import LanguageWheel from '@/components/shared/LanguageWheel';
import PrismaticField from '@/components/shared/PrismaticField';

import RayStream from '../components/RayStream';
import { useMarquee } from '../components/useMarquee';
import { FLAGS, HERO_ROTATION, STATS, TRUSTED_BY, WHEEL_GLYPHS } from '../data';

gsap.registerPlugin(useGSAP, SplitText, ScrambleTextPlugin);

function FlagSegment({ hidden }: { hidden?: boolean }) {
  return (
    <div style={{ display: 'flex' }} aria-hidden={hidden || undefined}>
      {FLAGS.map(([flag, name]) => (
        <span className='tb-flagchip' key={name}>
          <i>{flag}</i>
          {name}
        </span>
      ))}
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const flagTrack = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  useMarquee(flagTrack, { speed: 52, dir: 1, boost: 4 });

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      /* Only the solid line is split. The foil line paints one chrome gradient
         clipped to its own text, and per-character wrappers would each want
         their own paint box — so it rises as a single word-mark instead. */
      SplitText.create('.tb-h1-a', {
        type: 'chars',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.chars, {
            yPercent: 46,
            autoAlpha: 0,
            duration: 0.95,
            ease: 'expo.out',
            stagger: { each: 0.024 },
            delay: 0.15,
          });
        },
      });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.9 } });
      tl.from('.tb-h1-b', { yPercent: 26, autoAlpha: 0, duration: 1.05, ease: 'expo.out' }, 0.42)
        .from('.tb-hero-sub', { y: 20, autoAlpha: 0 }, 0.8)
        .from('.tb-ctas', { y: 16, autoAlpha: 0 }, 0.92)
        .from('.tb-cmd', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.02)
        .from('.tb-stat', { y: 14, autoAlpha: 0, stagger: 0.06 }, 1.1)
        .from('.tb-trust-row span', { autoAlpha: 0, y: 10, stagger: 0.05 }, 1.25);

      const rotate = (i: number) => {
        gsap.to('#tb-rot', {
          duration: 0.9,
          scrambleText: { text: HERO_ROTATION[i % HERO_ROTATION.length] ?? '', chars: 'lowerCase', speed: 0.4 },
          onComplete: () => gsap.delayedCall(2.2, () => rotate(i + 1)),
        });
      };
      const kick = gsap.delayedCall(2.4, () => rotate(1));

      return () => kick.kill();
    },
    { scope: root }
  );

  const copy = () => {
    if (copied) return;
    navigator.clipboard?.writeText('npx gt@latest').catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className='tb-hero' id='tb-top' ref={root}>
      <PrismaticField className='tb-hero-field' params={{ exposureScale: 4600 }} speed={0.55} />
      <div className='tb-hero-vig' aria-hidden />

      <div className='tb-stage'>
        <RayStream />
        <LanguageWheel className='tb-wheel' glyphs={WHEEL_GLYPHS} arcSweep={14} priority />
      </div>

      <div className='tb-hero-copy'>
        <h1 className='tb-h1'>
          <span className='tb-h1-a'>Launch in</span>
          <span className='tb-h1-b tb-foil'>Every language</span>
        </h1>
        <p className='tb-hero-sub'>
          General Translation helps developers localize apps into <span className='tb-rot' id='tb-rot'>Spanish</span>
        </p>
        <div className='tb-ctas'>
          <a className='tb-btn tb-btn--solid' href='#tb-pricing'>
            Get Started <span aria-hidden>→</span>
          </a>
          <a className='tb-btn tb-btn--line' href='#tb-features'>
            Docs
          </a>
        </div>
        {/* The install command sits under the buttons, not over the headline:
            nothing stacks above a header on this page any more. */}
        <button className='tb-cmd' type='button' onClick={copy} aria-label='Copy install command'>
          <span style={{ color: 'var(--w40)' }}>$</span>
          <span>{copied ? 'copied ✓' : 'npx gt@latest'}</span>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' width='12' height='12' opacity='0.55'>
            <rect x='9' y='9' width='12' height='12' rx='2' />
            <path d='M5 15V5a2 2 0 0 1 2-2h10' />
          </svg>
        </button>
      </div>

      <div className='tb-stats'>
        {STATS.map(([value, label]) => (
          <div className='tb-stat' key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className='tb-langs'>
        <div className='tb-flagband'>
          <div className='tb-flagtrack' ref={flagTrack}>
            <FlagSegment />
            <FlagSegment hidden />
          </div>
        </div>
        <div className='tb-trust'>
          <p>Trusted by the world&apos;s best companies</p>
          <div className='tb-trust-row'>
            {TRUSTED_BY.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
