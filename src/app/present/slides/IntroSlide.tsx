'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Opening slide — the prismatic burst sets the mood under the title card. */
export default function IntroSlide() {
  const root = useRef<HTMLElement>(null);
  const [logoField, setLogoField] = useState(0);

  // The logo box alternates between two shader moods.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setLogoField((f) => (f + 1) % 2), 3400);
    return () => window.clearInterval(id);
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(
        '.pr-intro-field',
        { opacity: 0 },
        { opacity: 1, duration: 2, ease: 'power2.inOut' }
      )
        .from(
          '.pr-title-piece',
          { yPercent: 118, stagger: 0.14, duration: 1.05 },
          0.45
        )
        .from('.pr-intro-sub', { autoAlpha: 0, y: 16, duration: 0.9 }, 1.2)
        .from('.pr-intro-cue', { autoAlpha: 0, duration: 0.8 }, 1.6);

      // The mouse wheel dot drips downward on a loop.
      // The liquid glass slowly undulates: the displacement field breathes.
      gsap.to('#pr-liquid-turb', {
        attr: { baseFrequency: '0.014 0.02' },
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.fromTo(
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
        <p className='pr-intro-sub'>
          The case for a new site, told through twenty living prototypes.
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
