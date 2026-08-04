import DirectionDock from '@/components/shared/DirectionDock';
import EnterpriseNavRebase from '@/components/shared/EnterpriseNavRebase';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../toolchain/sections/SiteFooter';
import TopNav from '../toolchain/sections/TopNav';

import V0Customers from '../_v0/sections/Customers';
import V0Developer from '../_v0/sections/Developer';
import V0Deploy from '../_v0/sections/Deploy';
import V0FullStack from '../_v0/sections/FullStack';
import V0ContextSec from '../_v0/sections/ContextSec';
import V0Global from '../_v0/sections/Global';
import V0Locadex from '../_v0/sections/Locadex';

import HomeHero from './sections/HomeHero';

import '../toolchain/sections/logos-icons.css';
import '../toolchain/styles.css';
import './home.css';
import '../_v0/v0-pages.css';
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
          <V0Customers />
          <V0FullStack />
          <V0Developer />
          <V0Locadex />
          <V0ContextSec />
          <V0Global />
          <V0Deploy />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-procession' />
    </SmoothScroll>
  );
}
