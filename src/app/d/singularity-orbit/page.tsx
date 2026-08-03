import DirectionDock from '@/components/shared/DirectionDock';
import EnterpriseNavRebase from '@/components/shared/EnterpriseNavRebase';
import SmoothScroll from '@/components/shared/SmoothScroll';

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

export const metadata = {
  title: 'Orbit — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity-orbit home — "the compact strip". The toolchain hero's full
 * windowed terminal collapses into two lighter artifacts: a one-line live
 * session inside the white card, and a slim dark strip carrying only the
 * translation table. Everything below the hero is the toolchain SSOT.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgoh-root'>
        <TopNav />
        <EnterpriseNavRebase href='/d/singularity-orbit/enterprise' />

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
      <DirectionDock slug='singularity-orbit' />
    </SmoothScroll>
  );
}
