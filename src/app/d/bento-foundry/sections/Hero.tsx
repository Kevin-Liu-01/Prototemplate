'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import LanguageWheel from '@/components/shared/LanguageWheel';
import PrismaticField from '@/components/shared/PrismaticField';

import HeroStream from '../components/HeroStream';
import { FLAGS, ROTATING_LANGUAGES, STAT_ROW, TRUSTED_BY, WHEEL_GLYPHS } from '../data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.fromTo(
        '.bf-hero-copy > *',
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 1, stagger: 0.09, delay: 0.3, ease: 'power4.out' }
      );
      gsap.from('.bf-hero-foot', { autoAlpha: 0, y: 20, duration: 0.9, delay: 0.8 });

      if (reduced) return;

      const track = root.current?.querySelector<HTMLElement>('.bf-marq-track');
      if (track) {
        const marquee = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: 46 });
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? marquee.play() : marquee.pause()),
        });
      }

      const rot = root.current?.querySelector<HTMLElement>('.bf-rot');
      if (rot) {
        let i = 0;
        const next = () => {
          gsap.to(rot, {
            autoAlpha: 0,
            y: -8,
            duration: 0.28,
            ease: 'power2.in',
            onComplete: () => {
              i = (i + 1) % ROTATING_LANGUAGES.length;
              rot.textContent = ROTATING_LANGUAGES[i] ?? 'Spanish';
              gsap.fromTo(rot, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.34 });
            },
          });
          gsap.delayedCall(2.4, next);
        };
        gsap.delayedCall(2.4, next);
      }

      if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      gsap.utils.toArray<HTMLElement>('.bf-hero-ctas .bf-btn-solid').forEach((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1,0.4)' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1,0.4)' });
        let rect: DOMRect | null = null;
        el.addEventListener('mouseenter', () => {
          rect = el.getBoundingClientRect();
        });
        el.addEventListener('mousemove', (event) => {
          if (!rect) return;
          xTo((event.clientX - (rect.left + rect.width / 2)) * 0.3);
          yTo((event.clientY - (rect.top + rect.height / 2)) * 0.3);
        });
        el.addEventListener('mouseleave', () => {
          xTo(0);
          yTo(0);
        });
      });
    },
    { scope: root }
  );

  const copyNpx = () => {
    navigator.clipboard?.writeText('npx gt@latest').catch(() => {});
  };

  return (
    <header className='bf-hero' id='bf-hero' ref={root}>
      <PrismaticField
        className='bf-field'
        preset='1'
        dpr={1}
        speed={0.45}
        params={{ exposureScale: 4200 }}
      />
      <div className='bf-hero-vin' aria-hidden />

      <div
        className='bf-hero-scene'
        aria-label='English components fall into the GT dial and re-emerge translated'
      >
        <HeroStream />
        <div className='bf-gate'>
          <LanguageWheel glyphs={WHEEL_GLYPHS} arcDuration={4.2} arcSweep={15} priority />
        </div>
      </div>

      <div className='bf-hero-inner'>
        <div className='bf-hero-copy'>
          <h1 className='bf-h1'>
            Launch in <span className='bf-foil'>every language</span>
          </h1>
          <p className='bf-hero-sub'>
            General Translation helps developers localize apps into{' '}
            <span className='bf-rot'>Spanish</span>
          </p>
          <div className='bf-hero-ctas'>
            <a className='bf-btn bf-btn-solid' href='#bf-story'>
              <span className='bf-irid' aria-hidden />
              Get Started →
            </a>
            <a className='bf-btn bf-btn-line' href='#bf-features'>
              Docs
            </a>
            <button className='bf-npx' type='button' onClick={copyNpx}>
              <span className='bf-npx-d'>$</span> npx gt@latest
            </button>
          </div>
        </div>

        <div className='bf-hero-foot'>
          <div className='bf-stats'>
            {STAT_ROW.map(([value, label]) => (
              <span key={label} className='bf-stat'>
                <b>{value}</b>
                {label}
              </span>
            ))}
          </div>

          <div className='bf-marq'>
            <div className='bf-marq-track'>
              {[0, 1].map((copy) =>
                FLAGS.map(([flag, name]) => (
                  <span className='bf-fchip' key={`${copy}-${name}`}>
                    <span className={`fi fi-${flag}`} aria-hidden='true' />
                    {name}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className='bf-trusted'>
            <span className='bf-trusted-lab'>Trusted by</span>
            <div className='bf-trusted-row'>
              {TRUSTED_BY.map((name) => (
                <span className='bf-tw' key={name}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
