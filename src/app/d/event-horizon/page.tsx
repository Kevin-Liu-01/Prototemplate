import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionMetadata } from '@/lib/directions';

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

export const metadata = directionMetadata('event-horizon');

/**
 * Event Horizon — the toolchain shell whose hero is Kevin's sketch: dense
 * component sheets fill the screen from both edges — row courses locked
 * across every column — and warp into a real event horizon, a purpose-built
 * lensing shader that wraps accretion light around a photon ring and bends
 * the page's own ruled structure into the hole. English source UI drifts in
 * on the left and slips under the ring's glow; the same components emerge on
 * the right translated and locale-stamped — passage through the hole IS the
 * translation. The dark core holds the mark, headline and CTAs light-on-dark,
 * and the locale flag chips orbit the horizon on a dashed rail.
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
