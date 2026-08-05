import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../_v0/V0Footer';
import V0Nav from '../_v0/V0Nav';

import V0Customers from '../_v0/sections/Customers';
import V0Developer from '../_v0/sections/Developer';
import V0DevWindow from '../_v0/sections/DevWindow';
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
        <V0Nav />

        <div className='tc-rail'>
          <HomeHero />
          <div aria-hidden className='v0-hatch' />
          <V0Customers heading='Trusted by companies around the globe.' />
          <div aria-hidden className='v0-hatch' />
          <V0DevWindow />
          <div aria-hidden className='v0-hatch' />
          <V0FullStack />
          <div aria-hidden className='v0-hatch' />
          <V0Developer
            heading='Localization is complex.'
          />
          <div aria-hidden className='v0-hatch' />
          <V0Locadex />
          <div aria-hidden className='v0-hatch' />
          <V0ContextSec />
          <div aria-hidden className='v0-hatch' />
          <V0Global />
          <div aria-hidden className='v0-hatch' />
          <V0Deploy />
          <V0Footer />
        </div>
      </div>
      <DirectionDock slug='singularity-orbit' />
    </SmoothScroll>
  );
}
