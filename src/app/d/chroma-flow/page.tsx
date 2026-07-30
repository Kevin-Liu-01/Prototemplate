import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Delivery from './sections/Delivery';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import LocadexBand from './sections/LocadexBand';
import PipelineRail from './sections/PipelineRail';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = {
  title: 'chroma-flow — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * CHROMA-FLOW — the toolchain frame carrying a new identity. The hero is a
 * curl-noise flow field: every streamline a doubled ink thread at constant
 * gauge, parting around the headline, with one chroma pass where the current
 * runs fast. The sections walk the string's journey in order — the six-station
 * rail (M05), write (frameworks), the Locadex PR dark band (M08), review, and
 * delivery at the edge (M11).
 */
export default function ChromaFlowPage() {
  return (
    <SmoothScroll>
      <div className='chromaflow-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <PipelineRail />
          <Frameworks />
        </div>

        <LocadexBand />

        <div className='tc-rail'>
          <Review />
          <Delivery />
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='chroma-flow' />
    </SmoothScroll>
  );
}
