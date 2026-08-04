import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Bento from './sections/Bento';
import DarkBand from './sections/DarkBand';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Locales from './sections/Locales';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = {
  title: 'dither-field — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * DITHER-FIELD — the HALFTONE fork of toolchain. The ruled column and the
 * flush surfaces are inherited; the identity is new: a breathing 1-bit
 * radial-burst hero, glyph-masked trust marks, a halftone locales atlas,
 * the published rate ledger, and a paper-on-ink ground burst in the one
 * dark band. The Bayer engine is the page's only texture.
 */
export default function DitherFieldPage() {
  return (
    <SmoothScroll>
      <div className='ditherfield-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Frameworks />
          <Bento />
          <Locales />
          <Story />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='dither-field' />
    </SmoothScroll>
  );
}
