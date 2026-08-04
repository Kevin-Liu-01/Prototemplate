import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionMetadata } from '@/lib/directions';

import DarkBand from './sections/DarkBand';
import Delivery from './sections/Delivery';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = directionMetadata('prism-light');

/**
 * Version 10 — the minimalist option. One ruled column carries the whole page;
 * the only full-bleed break in it is the single dark band before pricing.
 */
export default function ToolchainPage() {
  return (
    <SmoothScroll>
      <div className='prismlight-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Frameworks />
          <Delivery />
          <Story />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='prism-light' />
    </SmoothScroll>
  );
}
