'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import { readTheme, toggleTheme } from '@/components/viewer/ThemeButton';
import type { Theme } from '@/components/viewer/ThemeButton';
import { useMountEffect } from '@/lib/use-mount-effect';

import { PRESENT_DIRECTIONS as DIRECTIONS } from '../directions';

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
  const [theme, setTheme] = useState<Theme>('dark');

  // The switch reads the one theme state, <html data-theme>, which the boot
  // script stamps before first paint (dark when nothing is saved), and follows
  // it while another control (the D key, a frame's own toggle) changes it.
  // toggleTheme() from ThemeButton writes the attribute, the gt-theme key and
  // a message to every frame, and each same-origin preview applies both the
  // storage event and the message through the boot script, so no frame is
  // stamped by hand here and the label, the page, storage and the previews
  // agree from the first paint.
  useMountEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  });

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
      <header className='pr-score-head'>
        <h2 className='pr-score-title'>The verdict.</h2>
        <button
          type='button'
          className='pr-score-theme'
          onClick={() => {
            toggleTheme();
          }}
          aria-label={
            theme === 'light'
              ? 'View previews in dark mode'
              : 'View previews in light mode'
          }
        >
          <i>{theme === 'light' ? '◐' : '◑'}</i>
          {theme === 'light' ? 'Light' : 'Dark'}
        </button>
      </header>

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
