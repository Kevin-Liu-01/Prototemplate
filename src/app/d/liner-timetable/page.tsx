import { Forum } from 'next/font/google';

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

/* The one display face (charter C4): Forum, an engraved roman whose
   letterforms belong to the 1930s timetable. Read by h1, h2 and the hero
   crown only. Inter is already on <html> as --font-inter and is never
   loaded again. */
const display = Forum({
  subsets: ['latin'],
  weight: '400',
  variable: '--liner-timetable-display',
  display: 'swap',
});

export const metadata = {
  title: 'liner-timetable — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * LINER TIMETABLE, the deco fork of dither-field. The ruled column, the
 * Bayer fields, the flag chips, the windowed demo, the review workspace,
 * the atlas, the bento, the one dark band, the rate ledger and the footer
 * are all inherited and kept in the charter's order. The thesis is a
 * documented layer on top: 1930s ocean-liner and railway timetable
 * graphics. Deep green and burgundy ink on warm cream, gold rules, engraved
 * double borders drawn as the brand's doubled line, numbered plates in the
 * section heads, the code window and capability marquee restyled as a
 * departures and arrivals board, the locale chips as luggage labels, the
 * pricing ledger as a fare table, and the dark band as the green-black
 * board with gold seams. Every token the layer needs is declared once at
 * the top of styles.css.
 */
export default function LinerTimetablePage() {
  return (
    <>
      <div className={`liner-timetable-root ${display.variable}`}>
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
      <DirectionCorner slug='liner-timetable' />
    </>
  );
}
