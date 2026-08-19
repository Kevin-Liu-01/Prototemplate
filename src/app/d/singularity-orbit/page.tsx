import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../_v0/V0Footer';
import V0Nav from '../_v0/V0Nav';

import V0Customers from '../_v0/sections/Customers';
import V0DevWindow from '../_v0/sections/DevWindow';
import V0Deploy from '../_v0/sections/Deploy';

import Bento from '../toolchain/sections/Bento';
import DarkBand from '../toolchain/sections/DarkBand';
import Pricing from '../toolchain/sections/Pricing';

import GravityWell from './sections/GravityWell';
import HomeHero from './sections/HomeHero';
import Instruments from './sections/Instruments';

import '../toolchain/sections/logos-icons.css';
import '../toolchain/styles.css';
import './styles.css';
import './home.css';
import '../_v0/v0-pages.css';
import '@/components/shared/home-terminal-colors.css';

export const metadata = {
  title: 'Orbit — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity-orbit home, the exploration showcase. The hero and the two
 * distinctive mounts (the Customers wall's globe heading, the windowed
 * DevWindow demo) stay orbit's own; below them the page carries the
 * previous-generation system pieces the final (dossier) does not: the
 * toolchain bento and its dark band and pricing file, plus orbit's own
 * gravity well and instrument dials. Seam grammar is the dossier's hatch
 * rhythm; the section sheets ride in with their components.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgoh-root singularity-root'>
        <V0Nav />

        <main className='tc-rail' suppressHydrationWarning>
          {/* THE PRE-BOOT ARM, from the server boundary: stamped on the
              rail BEFORE ANY veiled section enters the parse stream.
              The DevWindow's locale belt (translate-window.css hides
              .js-arm … .v0-tw-belt-track:not(.is-seated)) streams below,
              so the stamp must precede it. A no-JS visit never arms,
              keeping the markup's standing poses; a client-side
              navigation mounts with live JS and needs no veil (React
              never executes scripts it renders, which is also why this
              tag lives in a SERVER component). suppressHydrationWarning:
              the script adds js-arm before hydration, so the client tree
              never matches the armed DOM; React leaves the attribute
              alone either way, only the warning is suppressed. */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.currentScript.parentElement.classList.add('js-arm')}catch(e){}",
            }}
          />
          <HomeHero />

          {/* The roster: orbit carries the earlier system pieces the
              final superseded. */}
          <V0Customers heading='Trusted by companies around the globe.' />
          <div aria-hidden className='v0-hatch' />
          <V0DevWindow />
          <div aria-hidden className='v0-hatch' />
          <Bento />
          <div aria-hidden className='v0-hatch' />
          <GravityWell />
          <div aria-hidden className='v0-hatch' />
          <Instruments />
          <div aria-hidden className='v0-hatch' />
          <DarkBand />
          <div aria-hidden className='v0-hatch' />
          <Pricing />
          <div aria-hidden className='v0-hatch' />
          <V0Deploy />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='singularity-orbit' />
    </SmoothScroll>
  );
}
