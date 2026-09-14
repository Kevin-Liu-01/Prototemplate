import { Bebas_Neue } from 'next/font/google';

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

/* The one display face: a condensed geometric grotesque in the family of the
   lettering on Cassandre's Normandie and Étoile du Nord posters. It is spent
   on h1, h2 and the hero crown only; Inter (already on <html>) is every other
   voice on the page. */
const display = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--cassandre-poster-display',
  display: 'swap',
});

export const metadata = {
  title: 'cassandre-poster — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * CASSANDRE POSTER. GT's complete landing-page system (the ruled column, the
 * flag chips, the windowed demo, the review workspace, the locales atlas, the
 * bento, the dark band, the rate ledger, the footer) carried on the Cassandre
 * poster palette: cream ground, midnight ink, vermilion spent as the one
 * edge. Two sections are poster panels: the hero plate and the dark band each
 * hold one monumental geometric form (the T component as a stepped monument;
 * a fan of rays rendered by the Bayer engine) with small precise captions in
 * the corners. Everything between them stays GT rail, chips, demos and
 * pricing, so the two posters read as moments within a system.
 */
export default function CassandrePosterPage() {
  return (
    <>
      <div className={`cassandre-poster-root ${display.variable}`}>
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
      <DirectionCorner slug='cassandre-poster' />
    </>
  );
}
