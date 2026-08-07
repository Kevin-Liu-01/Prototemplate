'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

/**
 * The brand opener's specimen: the monogram set giant in dotted outline,
 * measured by its own layout guides — dashed rules seated exactly on the
 * glyph box's cap, baseline, and side bearings, extending to the figure's
 * edges. The nameplate hero's crop-frame grammar, worn by the mark: the
 * guides are re-seated from the text's live bounding box (fonts included),
 * so they always fit its length and width; on mount they draw outward and
 * the outline's dots march slowly while the figure is on screen. Reduced
 * motion holds the settled sheet.
 */
const VIEW_W = 600;
const VIEW_H = 440;

export default function BrandMarkFigure() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;
      const text = rootEl.querySelector<SVGTextElement>('[data-bm-text]');
      const cap = rootEl.querySelector<HTMLElement>('[data-bm-cap]');
      const base = rootEl.querySelector<HTMLElement>('[data-bm-base]');
      const boundL = rootEl.querySelector<HTMLElement>('[data-bm-l]');
      const boundR = rootEl.querySelector<HTMLElement>('[data-bm-r]');
      if (!text || !cap || !base || !boundL || !boundR) return;

      /* the guides sit ON the glyph box — measured, never guessed, and
         re-measured when the face arrives */
      const seat = () => {
        const box = text.getBBox();
        gsap.set(cap, { top: `${(box.y / VIEW_H) * 100}%` });
        gsap.set(base, { top: `${((box.y + box.height) / VIEW_H) * 100}%` });
        gsap.set(boundL, { left: `${(box.x / VIEW_W) * 100}%` });
        gsap.set(boundR, { left: `${((box.x + box.width) / VIEW_W) * 100}%` });
      };
      seat();
      void document.fonts.ready.then(seat);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.from([cap, base], {
        scaleX: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.15,
      });
      gsap.from([boundL, boundR], {
        scaleY: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.25,
      });
      gsap.from(text, { opacity: 0, duration: 1.1, ease: 'power2.out', delay: 0.3 });

      /* the dots march — one dash period at a time, only while watched */
      const march = gsap.to(text, {
        strokeDashoffset: -70,
        duration: 16,
        ease: 'none',
        repeat: -1,
        paused: true,
      });
      const io = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) march.play();
        else march.pause();
      });
      io.observe(rootEl);
      return () => {
        io.disconnect();
        march.kill();
      };
    },
    { scope: root }
  );

  return (
    <figure
      aria-label='The GT monogram set giant in dotted outline, measured by dashed layout guides seated on its own width and height.'
      className='ptb-hero-fig'
      ref={root}
      role='img'
    >
      <i aria-hidden className='ptb-fig-line is-h' data-bm-cap />
      <i aria-hidden className='ptb-fig-line is-h' data-bm-base />
      <i aria-hidden className='ptb-fig-line is-v' data-bm-l />
      <i aria-hidden className='ptb-fig-line is-v' data-bm-r />
      <span aria-hidden className='ptb-fig-spec'>
        the mark · outline
      </span>
      <svg aria-hidden viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <text
          className='ptb-fig-gt'
          data-bm-text
          lengthAdjust='spacingAndGlyphs'
          textAnchor='middle'
          textLength={480}
          x={VIEW_W / 2}
          y={352}
        >
          GT
        </text>
      </svg>
    </figure>
  );
}
