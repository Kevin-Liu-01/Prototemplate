import { Limelight } from 'next/font/google';

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

/* The one display face: Limelight, the poster face of the picture-palace
   marquee. Read by styles.css for h1, h2 and the crown name only. */
const display = Limelight({
  weight: '400',
  subsets: ['latin'],
  variable: '--bulb-marquee-display',
  display: 'swap',
});

export const metadata = {
  title: 'bulb-marquee — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * BULB MARQUEE. A theatre marquee in dots on GT's rail. The complete
 * dither-field system is kept: the ruled column and its seams, the Bayer
 * transmission in the hero, the flag chips, the framework code window, the
 * bento of SSOT diagrams, the locales atlas and halftone globe, the story,
 * the review workspace, the dark band, the rate ledger and the footer. On
 * top of it sits one documented deco layer: warm white and amber on
 * charcoal, one vermilion live mark, bulb rows built from radial-gradient
 * dots on the edges the charter allows (section heads, the hatch dividers,
 * the window bars, the hero crown and the board's edge, the dark band), and
 * the h1 and h2 set in Limelight seen through a round dot screen. The hero
 * board is the show now playing: the engine prints the greetings as they
 * light, and the bulb rows chase around it where motion is allowed. Under
 * prefers-reduced-motion every bulb is lit and every field is one still.
 */
export default function BulbMarqueePage() {
  return (
    <>
      <div className={`bulb-marquee-root ${display.variable}`}>
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
      <DirectionCorner slug='bulb-marquee' />
    </>
  );
}
