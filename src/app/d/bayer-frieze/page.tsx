import { Jost } from 'next/font/google';

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

/* The one display face (charter C4): Jost, a geometric cut of the Futura
   decade, on h1 and h2 only. Inter is already on <html> as --font-inter and
   is never loaded again. */
const display = Jost({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--bayer-frieze-display',
  display: 'swap',
});

export const metadata = {
  title: 'bayer-frieze — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * BAYER-FRIEZE: the deco fork of dither-field. GT's complete landing system
 * is inherited whole: the ruled column and its seams, the SVG flag chips,
 * the framework code window, the bento and its SSOT diagrams, the locales
 * atlas, the nine-beat story, the review workspace, the one dark band, the
 * rate ledger and the footer. On top of it sits one documented layer: the
 * deco ornament grammar (chevron courses, sawtooth rows, Greek keys, a
 * sunrise, stepped keys) generated from a 4x4 Bayer matrix at four stepped
 * densities, 1/16, 4/16, 8/16 and 12/16, laid as friezes in the homes the
 * charter names (section heads, dividers, frames, the hero crown, the dark
 * band). Cream and ink with one jade edge; Inter, with Jost on h1 and h2.
 * The token block at the top of styles.css documents the whole system, and
 * sections/deco/bayer.ts generates every tile.
 */
export default function BayerFriezePage() {
  return (
    <>
      <div className={`bayer-frieze-root ${display.variable}`}>
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
      <DirectionCorner slug='bayer-frieze' />
    </>
  );
}
