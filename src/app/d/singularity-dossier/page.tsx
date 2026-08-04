import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../toolchain/sections/SiteFooter';
import V0Nav from '../_v0/V0Nav';

import V0Customers from '../_v0/sections/Customers';
import V0Developer from '../_v0/sections/Developer';
import V0Deploy from '../_v0/sections/Deploy';
import V0FullStack from '../_v0/sections/FullStack';
import V0ContextSec from '../_v0/sections/ContextSec';
import V0Global from '../_v0/sections/Global';
import V0Locadex from '../_v0/sections/Locadex';

import HomeHero from './sections/HomeHero';

/* Frameworks is deliberately absent: its argument — one toolchain, every
   stack — lives inside the hero terminal's stack strip. The section normally
   carries logos-icons.css in with it, and the trust row and footer marks
   depend on those tokens, so the sheet is imported directly (the toolchain
   enterprise subpage sets this exact precedent). */
import '../toolchain/sections/logos-icons.css';
import '../toolchain/styles.css';
import './home.css';
import '../_v0/v0-pages.css';
import '@/components/shared/home-terminal-colors.css';

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
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
