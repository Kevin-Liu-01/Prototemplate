import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Bento from './sections/Bento';
import DarkBand from './sections/DarkBand';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = {
  title: 'Hourglass — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Version 22 — Hourglass. From the founder's sketch over the dark PortalHero
 * prototype: a full-bleed dark hero where a draped sheet of product-UI cards
 * sags under the mark like a net under a mass — its courses rise from the
 * lower corners, crest just under the GT circle, and dive away behind the
 * stack — English source strings riding up the left half, locale-stamped
 * translations sliding down the right. The open dark above the hill is the
 * hourglass's upper bulb, pinched to a waist that holds the mark, headline,
 * CTAs, languages, and customer wordmarks. After the hero, the light
 * toolchain shell continues.
 */
export default function HourglassPage() {
  return (
    <SmoothScroll>
      <div className='hourglass-root'>
        <TopNav />

        <Hero />

        <div className='tc-rail'>
          <Frameworks />
          <Bento />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='hourglass' />
    </SmoothScroll>
  );
}
