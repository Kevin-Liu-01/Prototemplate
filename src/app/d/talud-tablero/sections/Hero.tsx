'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { GtMark } from '@/components/viewer/GtMark';
import { prefersReducedMotion } from '@/lib/dither';

import { EVERY, HERO_SUB, INSTALL_COMMAND, LINKS } from '../data';
import { platformDawn, useDitherField } from '../fields';
import { CopyButton } from './CopyButton';
import { BarDot } from './deco/BarDot';
import { Tablero, Talud, Terrace } from './deco/Terrace';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FIRST = EVERY[0] ?? { text: 'language', lang: 'en' };

/**
 * The top platform. The claim sits inside the largest tablero: the crown
 * (a bar-and-dot 118, the locale count) over the h1, the sub with the mark
 * inline, the two acts and the install command, beside the dither plate
 * (a stepped platform in front of a shaded disc). Under it the chevron
 * talud, with the stair axis that descends through every band below.
 *
 * The one word of the claim swaps script in place: one shaped text node
 * with lang and dir, stepped down one tread and back as the text changes.
 * It reads "language" at rest and every frame is a complete headline.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const plate = useDitherField(platformDawn({ aspect: 0.8 }), { scale: 3, fps: 24 });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = word.current;
      if (!el) return;
      let idx = 0;
      const tl = gsap.timeline({ repeat: -1, paused: true });
      tl.to(el, { y: 5, duration: 0.18, ease: 'steps(2)' })
        .call(() => {
          idx = (idx + 1) % EVERY.length;
          const next = EVERY[idx] ?? FIRST;
          el.textContent = next.text;
          el.lang = next.lang;
          el.dir = next.rtl ? 'rtl' : 'ltr';
        })
        .to(el, { y: 0, duration: 0.18, ease: 'steps(2)' })
        .to({}, { duration: 2.3 });
      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: 'top 90%',
        end: 'bottom 10%',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
      return () => {
        trigger.kill();
        tl.kill();
      };
    },
    { scope: root }
  );

  return (
    <Terrace tier={6} className='tt-hero' id='hero'>
      <Tablero depth={3} className='tt-hero-tablero'>
        <div className='tt-hero-grid' ref={root}>
          <div className='tt-hero-copy'>
            <div className='tt-crown'>
              <BarDot value={118} unit={6} label='118' className='tt-crown-numeral' />
              <span className='tt-crown-cap'>118 locales, ready today</span>
            </div>
            <h1 className='tt-h1'>
              Your product speaks every{' '}
              <span className='tt-every' ref={word} lang={FIRST.lang} dir='ltr'>
                {FIRST.text}
              </span>
              .
            </h1>
            <p className='tt-hero-sub'>
              <span className='tt-wordmark'>
                <GtMark width={25} height={16} />
                <span className='tt-vh'>General Translation</span>
              </span>{' '}
              {HERO_SUB}
            </p>
            <div className='tt-acts'>
              <a className='tt-btn tt-btn-solid' href={LINKS.getStarted}>
                Get Started
              </a>
              <a className='tt-btn tt-btn-line' href={LINKS.docs}>
                Docs
              </a>
            </div>
            <div className='tt-cmd'>
              <code>
                <span className='tt-cmd-prompt' aria-hidden='true'>
                  $
                </span>{' '}
                {INSTALL_COMMAND}
              </code>
              <CopyButton text={INSTALL_COMMAND} />
            </div>
          </div>
          <div className='tt-plate'>
            <canvas
              ref={plate}
              className='tt-plate-canvas'
              role='img'
              aria-label='A stepped platform in talud-tablero profile in front of a shaded disc, drawn in ordered dither'
            />
            <span className='tt-plate-cap'>Talud, tablero, stair · ordered dither</span>
          </div>
        </div>
      </Tablero>
      <Talud relief='chevron' className='is-hero' />
    </Terrace>
  );
}
