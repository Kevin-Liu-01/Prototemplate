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

/* Frameworks is deliberately absent: its argument — one toolchain, every
   stack — lives inside the hero terminal's stack strip. The section normally
   carries logos-icons.css in with it, and the hero terminal's code ramp
   (--tc-tok-*) depends on those tokens, so the sheet is imported directly
   (the toolchain enterprise subpage sets this exact precedent). */
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
          <V0Customers />
          <div aria-hidden className='v0-hatch' />
          <V0FullStack />
          <div aria-hidden className='v0-hatch' />
          <V0Developer />
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
    </SmoothScroll>
  );
}
