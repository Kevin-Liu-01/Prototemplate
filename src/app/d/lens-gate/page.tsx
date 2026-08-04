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
import Transit from './sections/Transit';

import './styles.css';

export const metadata = directionMetadata('lens-gate');

/**
 * Lens Gate — the toolchain shell with the Concrete Origin identity refracted
 * into it: the hero's ruled hairlines pass through one breathing glass lens,
 * and a slim transit strip carries the EN→locale narrative across a seam.
 */
export default function LensGatePage() {
  return (
    <SmoothScroll>
      <div className='lensgate-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Transit />
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
      <DirectionDock slug='lens-gate' />
    </SmoothScroll>
  );
}
