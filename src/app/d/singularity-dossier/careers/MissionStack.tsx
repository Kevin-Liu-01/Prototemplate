'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

/* One plate of the stack, drawn in the house 2:1 iso projection
   (x' = (x−y)·0.866, y' = (x+y)·0.5 − z), 170-unit square, 22 thick,
   centered on x=0 at the given y offset. */
function Plate({ offset, accent }: { offset: number; accent?: boolean }) {
  const top = `M 0 ${offset - 22} L 147.2 ${offset + 63} L 0 ${offset + 148} L -147.2 ${offset + 63} Z`;
  const right = `M 147.2 ${offset + 63} L 0 ${offset + 148} L 0 ${offset + 170} L 147.2 ${offset + 85} Z`;
  const left = `M -147.2 ${offset + 63} L 0 ${offset + 148} L 0 ${offset + 170} L -147.2 ${offset + 85} Z`;
  return (
    <g className='cm-plate'>
      <path className='cm-face-left' d={left} vectorEffect='non-scaling-stroke' />
      <path className='cm-face-right' d={right} vectorEffect='non-scaling-stroke' />
      <path
        className={accent ? 'cm-face-top is-accent' : 'cm-face-top'}
        d={top}
        vectorEffect='non-scaling-stroke'
      />
    </g>
  );
}

/* A measured doubled thread from a plate's right vertex out to its
   label column — the StackThreads wiring grammar at instrument scale. */
function Thread({ y }: { y: number }) {
  return (
    <g className='cm-thread'>
      <line x1='153' y1={y - 1.5} x2='202' y2={y - 1.5} vectorEffect='non-scaling-stroke' />
      <line x1='153' y1={y + 1.5} x2='202' y2={y + 1.5} vectorEffect='non-scaling-stroke' />
    </g>
  );
}

/**
 * The mission's instrument: the full stack as three iso plates
 * threaded on one spine — open-source SDKs at the base, the platform
 * and API above them, Locadex on top — each wired out to a measured
 * label. Builds in bottom-up the first time it scrolls into view; a
 * quiet accent pulse then rides the spine. Reduced motion (and no-JS)
 * gets the finished still: the markup's default state IS the final
 * pose, the timeline only animates from.
 */
export default function MissionStack() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return;

      let pulseTween: gsap.core.Tween | null = null;
      const build = gsap.timeline({ paused: true });
      build
        .from('.cm-spine', {
          scaleY: 0,
          transformOrigin: '50% 0%',
          duration: 0.7,
          ease: 'power2.out',
        })
        .from(
          '.cm-plate',
          {
            y: 26,
            opacity: 0,
            duration: 0.55,
            ease: 'power3.out',
            /* bottom plate first: DOM paints top plate last, so walk
               the selection back to front */
            stagger: { each: 0.14, from: 'end' },
          },
          0.15
        )
        .from(
          '.cm-thread line',
          {
            scaleX: 0,
            transformOrigin: '0% 50%',
            duration: 0.4,
            ease: 'power2.out',
            stagger: 0.06,
          },
          0.55
        )
        .from(
          '.cm-label',
          { x: 8, opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.1 },
          0.7
        )
        .from('.cm-ground', { opacity: 0, duration: 0.5 }, 0.8)
        .call(() => {
          /* the idle life: one pulse riding the spine, visible in the
             gaps between plates */
          pulseTween = gsap.fromTo(
            '.cm-pulse',
            { attr: { y1: -244, y2: -222 }, opacity: 0 },
            {
              attr: { y1: 174, y2: 196 },
              opacity: 0.9,
              duration: 3.6,
              ease: 'none',
              repeat: -1,
              repeatDelay: 1.6,
              yoyo: false,
            }
          );
        });

      const seen = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            build.play();
            seen.disconnect();
          }
        },
        { threshold: 0.35 }
      );
      seen.observe(host);

      return () => {
        seen.disconnect();
        build.kill();
        pulseTween?.kill();
      };
    },
    { scope: root }
  );

  return (
    <div className='careers-mission-scene' ref={root} aria-hidden='true'>
      <svg
        className='careers-mission-svg'
        viewBox='-200 -260 585 480'
        xmlns='http://www.w3.org/2000/svg'
      >
        {/* the spine, threaded UNDER the plates so it reads in the gaps */}
        <g className='cm-spine'>
          <line x1='-1.5' y1='-252' x2='-1.5' y2='196' vectorEffect='non-scaling-stroke' />
          <line x1='1.5' y1='-252' x2='1.5' y2='196' vectorEffect='non-scaling-stroke' />
        </g>
        <line className='cm-pulse' x1='0' y1='-244' x2='0' y2='-222' />

        <Plate offset={0} />
        <Plate offset={-96} />
        <Plate offset={-192} accent />

        <Thread y={-129} />
        <Thread y={-33} />
        <Thread y={63} />

        <g className='cm-label'>
            <text className='cm-label-name' x='210' y='-131'>
              Locadex
            </text>
            <text className='cm-label-sub' x='210' y='-114'>
              AI translation agent
            </text>
        </g>
        <g className='cm-label'>
            <text className='cm-label-name' x='210' y='-35'>
              Platform &amp; API
            </text>
            <text className='cm-label-sub' x='210' y='-18'>
              AI-native translation
            </text>
        </g>
        <g className='cm-label'>
            <text className='cm-label-name' x='210' y='61'>
              i18n libraries
            </text>
            <text className='cm-label-sub' x='210' y='78'>
              open source
            </text>
        </g>

        {/* the ground rail with its registration crosses */}
        <g className='cm-ground'>
          <line x1='-170' y1='214' x2='170' y2='214' vectorEffect='non-scaling-stroke' />
          <path d='M -170 209 V 219 M -175 214 H -165' vectorEffect='non-scaling-stroke' />
          <path d='M 170 209 V 219 M 165 214 H 175' vectorEffect='non-scaling-stroke' />
        </g>
      </svg>
    </div>
  );
}
