import DirectionDock from '@/components/shared/DirectionDock';
import EnterpriseNavRebase from '@/components/shared/EnterpriseNavRebase';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Bento from '../toolchain/sections/Bento';
import DarkBand from '../toolchain/sections/DarkBand';
import Pricing from '../toolchain/sections/Pricing';
import Review from '../toolchain/sections/Review';
import SiteFooter from '../toolchain/sections/SiteFooter';
import StoryCinema from '../toolchain/sections/StoryCinema';
import TopNav from '../toolchain/sections/TopNav';

import HomeHero from './sections/HomeHero';

/* Frameworks is deliberately absent: its argument — one toolchain, every
   stack — lives inside the hero terminal's stack strip. The section normally
   carries logos-icons.css in with it, and the trust row and footer marks
   depend on those tokens, so the sheet is imported directly (the toolchain
   enterprise subpage sets this exact precedent). */
import '../toolchain/sections/logos-icons.css';
import '../toolchain/styles.css';
import './home.css';

export const metadata = {
  title: 'Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — home. The toolchain page, one section shorter:
 * the Frameworks section's "one toolchain, every stack" claim is folded
 * into the hero terminal as a stack strip under the window bar, so the
 * wizard's Detected line demonstrates the breadth instead of a separate
 * section asserting it.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root'>
        <TopNav />
        <EnterpriseNavRebase href='/d/singularity-dossier/enterprise' />

        <div className='tc-rail'>
          <HomeHero />
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
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
