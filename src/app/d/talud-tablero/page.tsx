import localFont from 'next/font/local';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import Descent from './sections/Descent';
import Footer from './sections/Footer';
import Hero from './sections/Hero';
import Material from './sections/Material';
import Nav from './sections/Nav';
import Plaza from './sections/Plaza';
import Pricing from './sections/Pricing';
import Proof from './sections/Proof';
import Review from './sections/Review';
import Surfaces from './sections/Surfaces';
import Trust from './sections/Trust';

import './styles.css';

/** The one display face: geometric deco caps for h1 and h2. Inter stays the body. */
const display = localFont({
  src: [
    { path: '../../../../public/fonts/google/federo-400.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--talud-tablero-display',
  display: 'swap',
});

export const metadata = {
  title: 'talud-tablero — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * TALUD-TABLERO. The page is a stepped platform in the Teotihuacan profile:
 * every section is one terrace, a framed tablero panel (the content) over a
 * sloped talud band (the ornament, the stair, or a load of chips and cells),
 * and each terrace is one step wider than the one above it, so the page
 * silhouette is a talud-tablero pyramid in elevation with the claim on the
 * top platform and a stair axis descending through every band to the dark
 * plaza at its foot. The lower platform beyond the plaza holds the pricing
 * file as three tableros of increasing frame depth and the footer as the
 * base course. Volcanic stone grey, red oxide, cream stucco and jade; Inter
 * with Federo in the display slots.
 */
export default function TaludTableroPage() {
  return (
    <>
      <div className={`talud-tablero-root ${display.variable}`} id='top'>
        <Nav />
        <main className='tt-platform'>
          <Hero />
          <Trust />
          <Proof />
          <Surfaces />
          <Material />
          <Review />
        </main>

        <Plaza />

        <div className='tt-platform is-lower'>
          <Pricing />
          <Footer />
        </div>
        <Descent />
      </div>
      <DirectionCorner slug='talud-tablero' />
    </>
  );
}
