'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';
import { startFieldWorker } from '@/lib/prismatic-offthread';

import { entrancePlayed, holdSetup, whenDeckReady } from '../deck-setup';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The intro's fields draw in a worker; starting it now lets it boot while
// the page hydrates, so the field's first frame does not wait for mount.
if (typeof window !== 'undefined') startFieldWorker();

/** Opening slide — the prismatic burst sets the mood under the title card. */
export default function IntroSlide() {
  const root = useRef<HTMLElement>(null);
  const [logoField, setLogoField] = useState(0);
  const fieldDrawn = useRef(() => {});

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // The field draws in a worker, so it starts a moment after mount.
      // Its 2 s power2.inOut fade holds at zero until the first frame, and
      // the deck's setups wait for that frame too (deck-setup.ts). Like the
      // CSS entrance (presenter.css), the fade runs on the compositor.
      const fade = reduced
        ? undefined
        : root.current
            ?.querySelector('.pr-intro-field')
            ?.animate(
              { opacity: [0, 1] },
              { duration: 2000, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' }
            );
      fade?.pause();
      let fadeAt = 0;
      const release = holdSetup();
      const start = () => {
        if (fadeAt) return;
        fadeAt = performance.now();
        fade?.play();
        release();
      };
      fieldDrawn.current = start;
      // A field that cannot draw must not hold the deck.
      const fallback = window.setTimeout(start, 1500);

      // The title, byline and cue hold paused (presenter.css) while the
      // deck sets up, so no setup runs during their motion. They then play
      // with their stagger intact, the title rising 0.45 s after the fade
      // began or at once if the setup took longer.
      const held = (root.current?.getAnimations({ subtree: true }) ?? []).filter(
        (animation) => animation instanceof CSSAnimation
      );
      const stopWaiting = whenDeckReady(() => {
        const lead = Math.min(performance.now() - fadeAt, 450);
        for (const animation of held) {
          animation.currentTime = lead;
          animation.play();
        }
        // Work that waits for the entrance runs once it has played.
        const entrance = fade ? [fade, ...held] : held;
        Promise.all(entrance.map((animation) => animation.finished)).then(
          entrancePlayed,
          entrancePlayed
        );
      });

      const stop = () => {
        window.clearTimeout(fallback);
        release();
        stopWaiting();
      };
      if (reduced) return stop;

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

      return () => {
        stop();
        window.clearInterval(swap);
      };
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
        offThread
        onDrawn={() => fieldDrawn.current()}
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
                offThread
                params={{ exposureScale: 5200 }}
              />
              <PrismaticField
                className={`pr-logo-field${logoField === 1 ? ' is-on' : ''}`}
                preset='2'
                dpr={1}
                speed={0.6}
                offThread
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
