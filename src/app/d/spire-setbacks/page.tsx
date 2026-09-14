import { Raleway } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import Bento from './sections/Bento';
import DarkBand from './sections/DarkBand';
import ElevatorRail from './sections/ElevatorRail';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Locales from './sections/Locales';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import TopNav from './sections/TopNav';

import './styles.css';

/* The one display face (C4): Raleway, read by styles.css for h1 and h2 only.
   Inter stays on <html> as --font-inter and is never loaded again here. */
const display = Raleway({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--spire-setbacks-display',
  display: 'swap',
});

export const metadata = {
  title: 'spire-setbacks — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * SPIRE SETBACKS. GT's complete landing-page system (the dither-field fork:
 * ruled column, Bayer engine, LocaleTag chips, the code window, the review
 * workspace, the locales atlas, the bento, the one dark band, the rate
 * ledger, the footer) carrying a real Art Deco thesis as a documented layer:
 * the page is a 1930 tower elevation drawn on cream limestone in ink
 * linework with jade and brass inlay. The tc-rail hairline system is the
 * drafting grid the elevation is drawn on. Section heads are doubled string
 * courses that step one setback narrower down the page; a fixed elevator
 * rail beside the column tracks the floor in view; the locales atlas sits in
 * a brass frame like a lobby directory; the hero crown is a stepped sunburst
 * over the mark; the dark band carries the stepped frieze. Ornament lives
 * only in the charter's homes; the token block at the top of styles.css
 * documents the system. The elevator rail is a functional section index in
 * GT's own hairline grammar (sections/ElevatorRail.tsx), not ornament.
 * Native scroll throughout; no scroll wrapper.
 */
export default function SpireSetbacksPage() {
  return (
    <>
      <div className={`spire-setbacks-root ${display.variable}`}>
        <TopNav />

        <div className='tc-rail' data-rail='upper'>
          <Hero />
          <Frameworks />
          <Bento />
          <Locales />
          <Story />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail' data-rail='lower'>
          <Pricing />
          <SiteFooter />
        </div>

        <ElevatorRail />
      </div>
      <DirectionCorner slug='spire-setbacks' />
    </>
  );
}
