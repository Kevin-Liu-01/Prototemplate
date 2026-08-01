import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Bento from './sections/Bento';
import DarkBand from './sections/DarkBand';
import EnterpriseContact from './sections/EnterpriseContact';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import StoryCinema from './sections/StoryCinema';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = {
  title: 'Singularity — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity — the event-horizon fork with the component walls removed.
 * The hero is the gate alone: the lensing shader wraps accretion light
 * around a photon ring and bends the page's own ruled structure into the
 * hole, over otherwise empty paper. The dark core holds the mark, headline
 * and CTAs light-on-dark, and the locale flag chips orbit the horizon on a
 * dashed rail — nothing else competes with the mass.
 */
export default function SingularityPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root'>
        <TopNav />

        {/* The hero escapes the 1170px rail — the horizon and its orbit sit
            on full-bleed paper, and the contact bay lands directly under
            the gate: the CTAs' destination before anything else. */}
        <Hero />
        <EnterpriseContact />

        <div className='tc-rail'>
          <Frameworks />
          <Bento />
          <Story />
          <StoryCinema />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity' />
    </SmoothScroll>
  );
}
