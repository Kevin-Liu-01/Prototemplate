import { Poiret_One } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

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

/* The one display face: Poiret-era geometric lettering for h1 and h2. Inter
   stays on <html> as --font-inter and is never loaded again. */
const display = Poiret_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--sunburst-atelier-display',
  display: 'swap',
});

export const metadata = {
  title: 'sunburst-atelier — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * SUNBURST ATELIER. The Chrysler crown as a design system on GT's rail: a warm
 * black ground, cream ink, champagne gold ornament. The ruled column, the flag
 * chips, the code window, the review workspace, the bento diagrams, the dark
 * band, the rate ledger and the footer are GT's, copied from dither-field. The
 * deco layer sits in the charter's homes only: a stacked-arch crown with the
 * monogram in a chrome roundel above the hero headline, a quarter sunburst in
 * every section head, cream chevron friezes where the page used to hatch, gold
 * hairline frames, and the crown again over the dark band. The locales atlas
 * sets eight locale chips on the rays of one shared sunburst around the globe.
 */
export default function SunburstAtelierPage() {
  return (
    <>
      <div className={`sunburst-atelier-root ${display.variable}`}>
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
      <DirectionCorner slug='sunburst-atelier' />
    </>
  );
}
