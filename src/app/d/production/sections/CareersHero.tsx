'use client';

import CareersHorizon from './CareersHorizon';

/**
 * The careers hero, reproduced from the shipped page
 * (apps/landing/src/components/pages/careers/CareersPage.tsx, section
 * `.careers-hero`): the lensed hole fills the band, and the copy sits
 * INSIDE the hole — one headline whose second half carries the emphasis
 * color, and ONE control.
 *
 * No eyebrow, no kicker, no second button, no board readout: the shipped
 * hero is a headline and a single "Explore Open Roles" button that scrolls
 * the page to the openings ledger below (the shipped
 * ScrollToPositionsButton, minus its PostHog capture — this concept ships
 * no analytics). The button honours prefers-reduced-motion by jumping
 * instead of smooth-scrolling, exactly as the shipped control does.
 */
export default function CareersHero() {
  const scrollToPositions = () => {
    document.getElementById('positions')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  };

  return (
    <section className='tc-sec prc-hero'>
      <CareersHorizon />

      <div className='prc-hero-copy prc-hole-copy'>
        <h1>
          Bring the world&rsquo;s best products to the{' '}
          <span>whole world</span>
        </h1>

        <div className='prc-actions'>
          <button
            className='tc-btn tc-btn-onink tc-btn-lg'
            onClick={scrollToPositions}
            type='button'
          >
            Explore Open Roles
          </button>
        </div>
      </div>
    </section>
  );
}
