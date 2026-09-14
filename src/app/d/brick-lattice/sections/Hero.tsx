'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { GtMark } from '@/components/viewer/GtMark';

import BrickField from '../diagrams/BrickField';
import { LINKS, SOURCE_WORD, WORDS } from '../data';
import CopyCommand from './CopyCommand';
import TrustCourse from './TrustCourse';

gsap.registerPlugin(useGSAP);

/**
 * brick-lattice · the hero.
 *
 * Home: the first section. The whole viewport is lattice, and the lattice
 * resolves into one twelve-petal rosette whose core sits behind the claim
 * panel: a glazed plate with stepped parapet corners, cut out of the wall.
 * The headline is one shaped text node that swaps whole between the
 * sixteen locales of the shipped roster, carrying lang and dir with it
 * (DESIGN.md section 8: never per-character spans). The swap is a short
 * fade on one paused timeline that an IntersectionObserver plays while the
 * panel is on screen; under reduced motion the English claim stands.
 */
const HOLD = 2.4;
const OUT = 0.26;
const IN = 0.42;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const claim = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const h1 = claim.current;
      if (!h1) return;

      const tl = gsap.timeline({ paused: true, repeat: -1, delay: 1.8 });
      for (let i = 0; i < WORDS.length; i++) {
        const next = WORDS[(i + 1) % WORDS.length]!;
        tl.to(h1, { autoAlpha: 0, duration: OUT, ease: 'power1.in' }, `+=${HOLD}`);
        tl.call(() => {
          h1.textContent = next.text;
          h1.setAttribute('lang', next.lang);
          h1.setAttribute('dir', next.dir);
          h1.dataset.locale = next.code;
        });
        tl.to(h1, { autoAlpha: 1, duration: IN, ease: 'power1.out' });
      }

      const io = new IntersectionObserver((entries) => {
        const on = entries.some((e) => e.isIntersecting);
        if (on && !document.hidden) tl.play();
        else tl.pause();
      });
      io.observe(h1);
      const onVisibility = () => {
        if (document.hidden) tl.pause();
      };
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
      };
    },
    { scope: root }
  );

  return (
    <section className='bl-sec bl-hero' id='top' ref={root}>
      <BrickField field='hero' animate anchor='.bl-claim' fps={12} />
      <div className='bl-in bl-hero-in'>
        <div className='bl-claim bl-panel'>
          <h1 className='bl-h1' ref={claim} lang={SOURCE_WORD.lang} dir={SOURCE_WORD.dir} data-locale={SOURCE_WORD.code}>
            {SOURCE_WORD.text}
          </h1>
          <p className='bl-sub'>
            <span className='bl-wordmark'>
              <GtMark width={22} height={14} />
              <span>General Translation</span>
            </span>{' '}
            builds full-stack infrastructure for localizing apps, docs, and websites.
          </p>
          <div className='bl-acts'>
            <a className='bl-btn bl-btn-solid' href={LINKS.getStarted}>
              Get Started
            </a>
            <a className='bl-btn bl-btn-line' href={LINKS.docs}>
              Docs
            </a>
            <CopyCommand command='npx gt@latest' className='bl-hero-cmd' />
          </div>
        </div>
        <TrustCourse />
      </div>
    </section>
  );
}
