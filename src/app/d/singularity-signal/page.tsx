import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../_v0/V0Footer';
import V0Nav from '../_v0/V0Nav';

import V0Customers from '../_v0/sections/Customers';
import V0Deploy from '../_v0/sections/Deploy';
import V0Global from '../_v0/sections/Global';

import Review from '../toolchain/sections/Review';
import StoryCinema from '../toolchain/sections/StoryCinema';

import Assurance from './sections/Assurance';
import HomeHero from './sections/HomeHero';
import TransmissionLog from './sections/TransmissionLog';

import '../toolchain/sections/logos-icons.css';
import '../toolchain/styles.css';
import './home.css';
import '../_v0/v0-pages.css';
import '@/components/shared/home-terminal-colors.css';

export const metadata = {
  title: 'Signal — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Signal home — the input/output split hero over the
 * exploration roster. The dossier home is the final direction; signal
 * keeps its own hero (one terminal window, two panes: cause on the
 * left, effect on the right) and carries the previous-generation
 * sections the final retired, so the drop is reviewable side by side.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgsh-root'>
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
          {/* The exploration roster: the dossier is the final direction,
              so this page carries the previous generation it retired.
              The pinned scroll story and the review workspace come from
              toolchain; Assurance and TransmissionLog are signal's own
              sections, built for this home and mounted nowhere else. */}
          <V0Customers />
          <div aria-hidden className='v0-hatch' />
          <StoryCinema />
          <div aria-hidden className='v0-hatch' />
          <Review />
          <div aria-hidden className='v0-hatch' />
          <Assurance />
          <div aria-hidden className='v0-hatch' />
          <TransmissionLog />
          <div aria-hidden className='v0-hatch' />
          <V0Global />
          <div aria-hidden className='v0-hatch' />
          <V0Deploy />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='singularity-signal' />
    </SmoothScroll>
  );
}
