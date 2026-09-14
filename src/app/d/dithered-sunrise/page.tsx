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

/**
 * The one display face (charter C4): Jost, the Futura revival, for h1 and
 * h2 only. Loaded once here and handed to the sheet as a variable; Inter
 * stays on `<html>` as the body, interface and caption face.
 */
const display = Jost({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--dithered-sunrise-display',
  display: 'swap',
});

export const metadata = {
  title: 'dithered-sunrise — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * DITHERED-SUNRISE, the deco fork of dither-field.
 *
 * GT's complete landing system is inherited: the ruled column, the framed
 * cells, the flag chips, the code window, the review workspace, the locales
 * atlas, the bento, the one dark band, the rate ledger and the footer. On
 * top of it sits one documented ornament layer with one subject: the deco
 * sunburst, rendered entirely as ordered Bayer dither in gold on a warm
 * near-black ground. The hero plate is a half sun on a horizon; every
 * section head carries a dawn crest; the dividers are Bayer lattices; the
 * dark band's floor is the fullest ray statement on the page. Light is
 * quantized everywhere, twice: stepped into flat bands, then screened into
 * cells. There is no smooth gradient on the page.
 */
export default function DitheredSunrisePage() {
  return (
    <>
      <div className={`dithered-sunrise-root ${display.variable}`}>
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
      <DirectionCorner slug='dithered-sunrise' />
    </>
  );
}
