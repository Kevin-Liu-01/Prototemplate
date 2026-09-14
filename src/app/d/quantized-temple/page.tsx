import { Cinzel } from 'next/font/google';

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

/* The one display face: Roman capitals for h1, h2 and nothing else, at the
   single weight the sheet sets (500). Inter stays on <html> as --font-inter
   and is never re-loaded here. */
const display = Cinzel({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--quantized-temple-display',
  display: 'swap',
});

export const metadata = {
  title: 'quantized-temple — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * QUANTIZED TEMPLE: the dither family's deco direction, built on the complete
 * dither-field landing page. GT's ruled column, flag chips, code windows,
 * review workspace, locales atlas, bento, dark band, rate ledger and footer
 * are all here and recognisably themselves. The deco thesis sits on top as a
 * documented layer: stepped ziggurat forms filled with smoke that quantizes
 * into ordered dither as it rises, gold and orange on warm black. The hero
 * plate renders the ziggurat with the Bayer engine; each section head carries
 * a stepped crest one course taller than the last; the hatch dividers are
 * strata of dither tiers; the frames are gilt; and the dark band is the
 * summit, its floor a stepped horizon dissolving upward into dots.
 */
export default function QuantizedTemplePage() {
  return (
    <>
      <div className={`quantized-temple-root ${display.variable}`}>
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
      <DirectionCorner slug='quantized-temple' />
    </>
  );
}
