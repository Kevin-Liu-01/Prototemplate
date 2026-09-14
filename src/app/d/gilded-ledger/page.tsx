import { Bodoni_Moda } from 'next/font/google';

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
import MarbleBand from './sections/deco/MarbleBand';

import './styles.css';

/* The one display face, loaded once (charter B3): Bodoni Moda for h1 and h2.
   Inter is already on <html> as --font-inter and is never re-loaded. */
const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--gilded-ledger-display',
  display: 'swap',
});

export const metadata = {
  title: 'gilded-ledger — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * GILDED LEDGER, the bound-report fork of dither-field. The ruled column,
 * the framed cells, the Bayer plate, the review workspace, the locales
 * atlas, the bento, the dark band, the rate ledger and the footer are all
 * GT's own. The deco layer sits on top as print craft: ivory paper and warm
 * ink, gold-leaf rules wherever the system draws a frame, combed-marble
 * endpaper bands where the page turns from one section to the next, a
 * monogram cartouche crowning the title, Bodoni for the two heading slots,
 * and the pricing file laid out as a two-leaf ledger spread bound by a
 * doubled gold rule. Everything else keeps Inter and GT's copy.
 */
export default function GildedLedgerPage() {
  return (
    <>
      <div className={`gilded-ledger-root ${display.variable}`}>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <MarbleBand />
          <Frameworks />
          <Bento />
          <Locales />
          <Story />
          <Review />
          <MarbleBand />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <MarbleBand />
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='gilded-ledger' />
    </>
  );
}
