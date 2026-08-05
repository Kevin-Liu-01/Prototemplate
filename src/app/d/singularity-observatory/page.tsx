import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../_v0/V0Footer';
import V0Nav from '../_v0/V0Nav';

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
  title: 'Observatory — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Observatory home — the staged pipeline. The hero terminal
 * presents the product as three stages you can walk: 01 install, 02
 * translate, 03 serve. Everything below the hero is the toolchain SSOT.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgbh-root'>
        <V0Nav />

        <div className='tc-rail'>
          <HomeHero />
          <V0Customers />
          <V0FullStack />
          <V0Developer />
          <V0Locadex />
          <V0ContextSec />
          <V0Global />
          <V0Deploy />
          <V0Footer />
        </div>
      </div>
      <DirectionDock slug='singularity-observatory' />
    </SmoothScroll>
  );
}
