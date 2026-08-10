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

        <main className='tc-rail' suppressHydrationWarning>
          {/* THE PRE-BOOT ARM, from the server boundary: stamped on the
              rail BEFORE ANY veiled section enters the parse stream —
              the hero's locale belt (translate-window.css hides
              .js-arm … .v0-tw-belt-track:not(.is-seated)) streams first,
              so the stamp must precede it, and the stack section's veil
              (.js-arm … :not(.is-live)) rides the same class further
              down. A no-JS visit never arms, keeping the markup's
              standing poses; a client-side navigation mounts with live
              JS and needs no veil (React never executes scripts it
              renders, which is also why this tag lives in a SERVER
              component). suppressHydrationWarning: the script adds
              js-arm before hydration, so the client tree never matches
              the armed DOM — React leaves the attribute alone either
              way; only the warning is suppressed. */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.currentScript.parentElement.classList.add('js-arm')}catch(e){}",
            }}
          />
          <HomeHero />
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
        </main>
      </div>
      <DirectionDock slug='singularity-orbit' />
    </SmoothScroll>
  );
}
