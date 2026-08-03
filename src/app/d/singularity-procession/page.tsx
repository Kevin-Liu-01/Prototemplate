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
  title: 'Procession — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity Procession home — the console hero. There is no white card:
 * the hero IS one full-bleed dark console and the page opens inside it,
 * headline set light-on-dark above the raw gt CLI transcript.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgph-root'>
        <TopNav />
        <EnterpriseNavRebase href='/d/singularity-procession/enterprise' />

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
      <DirectionDock slug='singularity-procession' />
    </SmoothScroll>
  );
}
