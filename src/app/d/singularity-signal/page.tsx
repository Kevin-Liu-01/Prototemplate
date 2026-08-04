import DirectionDock from '@/components/shared/DirectionDock';
import EnterpriseNavRebase from '@/components/shared/EnterpriseNavRebase';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionMetadata } from '@/lib/directions';

import Bento from '../toolchain/sections/Bento';
import DarkBand from '../toolchain/sections/DarkBand';
import Frameworks from '../toolchain/sections/Frameworks';
import Pricing from '../toolchain/sections/Pricing';
import Review from '../toolchain/sections/Review';
import SiteFooter from '../toolchain/sections/SiteFooter';
import StoryCinema from '../toolchain/sections/StoryCinema';
import TopNav from '../toolchain/sections/TopNav';

import HomeHero from './sections/HomeHero';

import '../toolchain/styles.css';
import './home.css';
import '@/components/shared/home-terminal-colors.css';

export const metadata = directionMetadata('singularity-signal');

/**
 * Singularity · Signal home — the input/output split. Cause and effect are
 * visible at once: one terminal window, two panes. What you type on the
 * left, what the machine does on the right. No toggle, no preview face.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgsh-root'>
        <TopNav />
        <EnterpriseNavRebase href='/d/singularity-signal/enterprise' />

        <div className='tc-rail'>
          <HomeHero />
          <Frameworks />
          <Bento />
          <StoryCinema />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-signal' />
    </SmoothScroll>
  );
}
