'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import Icon from '../icons';

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

const GUIDELINES = [
  'Off-black and off-white base, four contrast levels.',
  'Titanium accents; neon reserved for the one CTA.',
  'Square corners and hairline rules. No glass, no shadows.',
  'One shader family per visual, grain after gradient.',
  'The product is the picture: input → GT → output.',
];

const SWATCHES = [
  { name: 'Ink', hex: '#070707' },
  { name: 'Raised', hex: '#101010' },
  { name: 'Titanium', hex: '#8a8f98' },
  { name: 'Paper', hex: '#f5f5f3' },
];

const WEIGHTS = [300, 400, 500, 600, 700, 800];

const TECHNIQUES = [
  'GSAP timelines',
  'Lenis inertia',
  'ScrollTrigger pins',
  'SplitText reveals',
  'DrawSVG diagrams',
  'WebGL light fields',
  'Bayer dither',
  'Split-flap type',
];

/**
 * How the identity was built — a pinned horizontal walk through guidelines,
 * sketches, color, type, and motion, ending on the handoff to the prototypes.
 */
export default function CraftSlide() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const trackEl = track.current;
      if (!trackEl) return;

      // The pin engages at the top, but the track starts sliding as soon as
      // the section enters the viewport, so scrolling never feels inert.
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pin.current,
      });

      const scrollTween = gsap.to(trackEl, {
        x: () => -(trackEl.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // Content reveals are keyed to each plate's actual arrival in the
      // viewport (containerAnimation). They fire as the plate enters from the
      // right so nothing is still animating in while the plate is exiting.
      const plates = gsap.utils.toArray<HTMLElement>('.pr-plate', trackEl);
      const reveal = (
        index: number,
        targets: string,
        vars: gsap.TweenVars,
        start = 'left 92%'
      ) => {
        const plate = plates[index];
        if (!plate) return;
        gsap.from(plate.querySelectorAll(targets), {
          ease: 'power3.out',
          ...vars,
          scrollTrigger: {
            trigger: plate,
            containerAnimation: scrollTween,
            start,
            toggleActions: 'play none none reverse',
          },
        });
      };

      // The rules land one by one while the plate is well inside the stage,
      // late enough and spaced enough that the sequence is actually watchable.
      reveal(
        0,
        '.pr-craft-rule',
        { autoAlpha: 0, y: 18, stagger: 0.28, duration: 0.45 },
        'left 62%'
      );
      reveal(1, '[data-draw]', {
        drawSVG: '0%',
        stagger: 0.07,
        duration: 0.5,
        ease: 'power1.inOut',
      });
      reveal(2, '.pr-swatch', {
        scaleY: 0,
        transformOrigin: 'bottom center',
        stagger: 0.1,
        duration: 0.45,
      });
      reveal(2, '.pr-spectral-band', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.6,
      });
      reveal(3, '.pr-weight-row', { autoAlpha: 0, x: -28, stagger: 0.08, duration: 0.35 });
      reveal(4, '.pr-tech-chip', { autoAlpha: 0, y: 20, stagger: 0.06, duration: 0.3 });
    },
    { scope: root }
  );

  return (
    <section ref={root} className='pr-slide pr-craft' data-slide='craft'>
      <div ref={pin} className='pr-pin'>
        <div className='pr-craft-header'>
          <h2>From guidelines to prototypes.</h2>
        </div>
        <div ref={track} className='pr-craft-track'>
          <article className='pr-plate'>
            <span className='pr-plate-icon'>
              <Icon name='ruler' size={22} />
            </span>
            <h3>Rules before pixels.</h3>
            <ul className='pr-craft-rules'>
              {GUIDELINES.map((rule) => (
                <li key={rule} className='pr-craft-rule'>
                  {rule}
                </li>
              ))}
            </ul>
          </article>

          <article className='pr-plate pr-sketch'>
            <span className='pr-plate-icon'>
              <Icon name='pencil' size={22} />
            </span>
            <h3>Structure first, texture last.</h3>
            <div className='pr-sketch-stage'>
            <svg viewBox='0 0 560 340' aria-hidden>
              {/* browser frame */}
              <rect data-draw x='10' y='10' width='540' height='320' rx='6' />
              <line data-draw x1='10' y1='46' x2='550' y2='46' />
              <circle data-draw cx='28' cy='28' r='4' />
              <circle data-draw cx='44' cy='28' r='4' />
              {/* hero headline strokes */}
              <line data-draw x1='48' y1='96' x2='300' y2='96' />
              <line data-draw x1='48' y1='120' x2='236' y2='120' />
              <line data-draw x1='48' y1='156' x2='150' y2='156' />
              {/* the gate ring */}
              <circle data-draw cx='420' cy='128' r='52' />
              <circle data-draw cx='420' cy='128' r='30' />
              {/* rails through the gate */}
              <path data-draw d='M 320 122 C 370 122 380 122 420 122 C 470 122 490 122 540 122' />
              <path data-draw d='M 320 134 C 370 134 380 134 420 134 C 470 134 490 134 540 134' />
              {/* bento row */}
              <rect data-draw x='48' y='212' width='150' height='92' />
              <rect data-draw x='210' y='212' width='150' height='92' />
              <rect data-draw x='372' y='212' width='150' height='92' />
            </svg>
            </div>
          </article>

          <article className='pr-plate'>
            <span className='pr-plate-icon'>
              <Icon name='palette' size={22} />
            </span>
            <h3>Color behaves like light, not paint.</h3>
            <div className='pr-swatch-row'>
              {SWATCHES.map((swatch) => (
                <div key={swatch.name} className='pr-swatch'>
                  <i style={{ background: swatch.hex }} />
                  <strong>{swatch.name}</strong>
                  <span>{swatch.hex}</span>
                </div>
              ))}
            </div>
            <div className='pr-spectral-band' aria-hidden />
            <p className='pr-plate-note'>
              One spectral band per page: a controlled edge, never a wash.
            </p>
          </article>

          <article className='pr-plate'>
            <span className='pr-plate-icon'>
              <Icon name='type' size={22} />
            </span>
            <h3>One family, every weight: Inter carries the voice.</h3>
            <div className='pr-weights'>
              {WEIGHTS.map((weight) => (
                <div key={weight} className='pr-weight-row' style={{ fontWeight: weight }}>
                  <span>{weight}</span>General Translation
                </div>
              ))}
            </div>
          </article>

          <article className='pr-plate'>
            <span className='pr-plate-icon'>
              <Icon name='activity' size={22} />
            </span>
            <h3>Every technique answers a question.</h3>
            <p className='pr-plate-note'>
              What changed? Where did it go? What is automated? Motion is
              explanation, never ambience.
            </p>
            <div className='pr-tech-grid'>
              {TECHNIQUES.map((technique) => (
                <span key={technique} className='pr-tech-chip'>
                  {technique}
                </span>
              ))}
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}
