import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Bento from './sections/Bento';
import DarkBand from './sections/DarkBand';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import StoryCinema from './sections/StoryCinema';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = {
  title: 'Event Horizon — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Event Horizon — the toolchain shell whose hero is Kevin's sketch: component
 * sheets fill the screen from both edges — five row courses locked across
 * every column — and DRAPE over a real event horizon like a net sagging under
 * the mass's weight: a rubber-sheet height-field pulls the courses, the ruled
 * hairlines and the guide rings toward and under the hole, while a purpose-
 * built shader wraps accretion light around a photon ring at its rim. English
 * source UI drifts in on the left and slips under the ring's glow; the same
 * components emerge on the right translated and locale-stamped — passage
 * through the hole IS the translation. The dark core holds the mark, headline
 * and CTAs light-on-dark, and the locale flag chips orbit the horizon on a
 * dashed rail.
 */
export default function EventHorizonPage() {
  return (
    <SmoothScroll>
      <div className='eventhorizon-root'>
        <TopNav />

        {/* The hero escapes the 1170px rail — the grids run full-bleed from
            both screen edges into the horizon, like the dark band below. */}
        <Hero />

        <div className='tc-rail'>
          <Frameworks />
          <Bento />
          <Story />
          <StoryCinema />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='event-horizon' />
    </SmoothScroll>
  );
}
