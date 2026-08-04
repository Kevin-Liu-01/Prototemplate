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

export const metadata = directionMetadata('singularity-observatory');

/**
 * Singularity · Observatory home — the staged pipeline. The hero terminal
 * presents the product as three stages you can walk: 01 install, 02
 * translate, 03 serve. Everything below the hero is the toolchain SSOT.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgbh-root'>
        <TopNav />
        <EnterpriseNavRebase href='/d/singularity-observatory/enterprise' />

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
      <DirectionDock slug='singularity-observatory' />
    </SmoothScroll>
  );
}
