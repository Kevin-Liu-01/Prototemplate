'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { DIRECTIONS } from '@/lib/directions';

import LazyFrame from './LazyFrame';
import RatingStars from './RatingStars';
import { setReview, useReviews } from './reviewStore';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The closing gallery — every prototype as a live preview, nothing else.
 * A card's number and stars are the only chrome; clicking a preview jumps
 * back into the viewer on that direction.
 */
export default function Scoreboard() {
  const root = useRef<HTMLElement>(null);
  const reviews = useReviews();

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.utils.toArray<HTMLElement>('.pr-gal-card').forEach((card, i) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 30,
          duration: 0.55,
          delay: (i % 3) * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 94%' },
        });
      });
    },
    { scope: root }
  );

  const jumpTo = (slug: string) => {
    window.dispatchEvent(new CustomEvent('pr:goto', { detail: slug }));
  };

  return (
    <section
      ref={root}
      id='pr-scoreboard'
      className='pr-slide pr-score'
      data-slide='scoreboard'
    >
      <h2 className='pr-score-title'>The verdict.</h2>

      <div className='pr-gallery'>
        {DIRECTIONS.map((direction) => (
          <div key={direction.slug} className='pr-gal-card'>
            <button
              type='button'
              className='pr-gal-preview'
              onClick={() => jumpTo(direction.slug)}
              aria-label={`Open ${direction.name} in the viewer`}
            >
              <LazyFrame slug={direction.slug} />
            </button>
            <div className='pr-gal-meta'>
              <span className='pr-roll-num'>{direction.label}</span>
              <RatingStars
                size='sm'
                value={reviews[direction.slug]?.rating ?? 0}
                onChange={(rating) => setReview(direction.slug, { rating })}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
