import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import DarkBand from './sections/DarkBand';
import Departures from './sections/Departures';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = {
  title: 'Terminus Board — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Direction 19 — Terminus Board. The toolchain shell carrying a split-flap
 * departure board: a flip-wave cell field and a script-riffling headline in
 * the hero, a Departures locales section right after it, and one warm amber
 * phosphor as the page's only hue.
 */
export default function TerminusBoardPage() {
  return (
    <SmoothScroll>
      <div className='terminusboard-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Departures />
          <Frameworks />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='terminus-board' />
    </SmoothScroll>
  );
}
