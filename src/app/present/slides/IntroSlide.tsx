'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { introSettled } from '../after-intro';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Opening slide — the prismatic burst sets the mood under the title card. */
export default function IntroSlide() {
  const root = useRef<HTMLElement>(null);
  const [logoField, setLogoField] = useState(0);

  useGSAP(
    () => {
      // The entrance itself is CSS keyframes (presenter.css), so it runs on
      // the compositor from the first paint. Deferred presenter work
      // (after-intro.ts) waits until it has played.
      const entrance = root.current?.getAnimations({ subtree: true }) ?? [];
      Promise.all(entrance.map((animation) => animation.finished)).then(
        introSettled,
        introSettled
      );

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // The liquid glass slowly undulates: the displacement field breathes.
      const breathe = gsap.to('#pr-liquid-turb', {
        attr: { baseFrequency: '0.014 0.02' },
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // The mouse wheel dot drips downward on a loop.
      const drip = gsap.fromTo(
        '.pr-cue-wheel',
        { y: 0, autoAlpha: 1 },
        {
          y: 5,
          autoAlpha: 0,
          duration: 1.15,
          repeat: -1,
          repeatDelay: 0.35,
          ease: 'power1.in',
        }
      );

      // The logo box alternates between two shader moods.
      let onScreen = true;
      const swap = window.setInterval(() => {
        if (onScreen) setLogoField((f) => (f + 1) % 2);
      }, 3400);

      // The loops and the swap stop once the intro has scrolled away.
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          onScreen = self.isActive;
          for (const loop of [breathe, drip]) loop.paused(!onScreen);
        },
      });

      // The whole card sinks and dims as the deck scrolls on.
      gsap.to('.pr-intro-inner', {
        yPercent: -14,
        autoAlpha: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      return () => window.clearInterval(swap);
    },
    { scope: root }
  );

  return (
    <section ref={root} className='pr-slide pr-intro' data-slide='intro'>
      {/* Backdrop displacement for the liquid glass logo window. */}
      <svg width='0' height='0' aria-hidden style={{ position: 'absolute' }}>
        <filter id='pr-liquid'>
          <feTurbulence
            id='pr-liquid-turb'
            type='fractalNoise'
            baseFrequency='0.008 0.012'
            numOctaves='2'
            seed='7'
            result='noise'
          />
          <feGaussianBlur in='noise' stdDeviation='2.2' result='soft' />
          <feDisplacementMap
            in='SourceGraphic'
            in2='soft'
            scale='72'
            xChannelSelector='R'
            yChannelSelector='G'
          />
        </filter>
      </svg>
      <PrismaticField
        className='pr-intro-field'
        preset='1'
        dpr={1.4}
        speed={0.4}
        params={{ exposureScale: 4200 }}
      />
      <div className='pr-intro-core' aria-hidden />
      <div className='pr-intro-inner'>
        <h1 className='pr-intro-title'>
          <span className='pr-title-mask'>
            <span className='pr-title-piece pr-title-the'>The</span>
          </span>
          <span className='pr-title-mask'>
            <span className='pr-title-piece pr-title-logo-box'>
              <PrismaticField
                className={`pr-logo-field${logoField === 0 ? ' is-on' : ''}`}
                preset='1'
                dpr={1}
                speed={0.55}
                params={{ exposureScale: 5200 }}
              />
              <PrismaticField
                className={`pr-logo-field${logoField === 1 ? ' is-on' : ''}`}
                preset='2'
                dpr={1}
                speed={0.6}
                params={{ exposureScale: 4600 }}
              />
              <img src='/brand/no-bg-gt-logo-dark.png' alt='General Translation' />
            </span>
          </span>
          <span className='pr-title-mask'>
            <span className='pr-title-piece pr-title-website'>website</span>
          </span>
          <span className='pr-title-mask'>
            <span className='pr-title-piece pr-title-redesign'>Redesign</span>
          </span>
        </h1>
        <p className='pr-intro-sub pr-intro-byline'>
          <img src='https://github.com/Kevin-Liu-01.png' alt='' />
          Presented by Kevin Liu
        </p>
      </div>
      <div className='pr-intro-cue' aria-hidden>
        <svg
          viewBox='0 0 24 24'
          width='24'
          height='24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <rect x='6' y='3' width='12' height='18' rx='6' />
          <line className='pr-cue-wheel' x1='12' y1='7' x2='12' y2='10' />
        </svg>
      </div>
    </section>
  );
}
