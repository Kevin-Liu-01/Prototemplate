import { Aboreto } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import Dark from './sections/Dark';
import FretBand from './sections/deco/FretBand';
import Footer from './sections/Footer';
import Hero from './sections/Hero';
import Material from './sections/Material';
import Nav from './sections/Nav';
import Pricing from './sections/Pricing';
import Proof from './sections/Proof';
import Review from './sections/Review';
import Surfaces from './sections/Surfaces';
import Trust from './sections/Trust';

import './styles.css';

/** The one display face: geometric deco caps for h1, h2 and the crown. Inter stays the body. */
const display = Aboreto({
  weight: '400',
  subsets: ['latin'],
  variable: '--stepped-fret-display',
  display: 'swap',
});

export const metadata = {
  title: 'stepped-fret — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * STEPPED-FRET. The page is a sequence of horizontal registers in the
 * Zapotec and Mixtec revival of Art Deco: each register is bounded above and
 * below by a stepped-fret meander at its own scale, and the content block of
 * each register steps right by one fret step and back again down the page,
 * so the grid itself is the stair. The hero is one monumental fret rendered
 * in ordered dither, with the claim set in the step it leaves open. The
 * proof of the T component is a stair of translations, the languages are
 * the cells of a long meander, the platform is a ziggurat on black stone,
 * and the pricing file is three stepped plinths. Limestone cream, ochre,
 * red oxide and black; Inter with Aboreto for the display slots.
 */
export default function SteppedFretPage() {
  return (
    <>
      <div className={`stepped-fret-root ${display.variable}`}>
        <Nav />
        <main className='sf-rail'>
          <Hero />
          <FretBand cell={4} tone='ink' />
          <Trust />
          <FretBand cell={6} tone='ornament' />
          <Proof />
          <FretBand cell={5} tone='ink' />
          <Surfaces />
          <FretBand cell={7} tone='ornament' />
          <Material />
          <FretBand cell={4} tone='ink' />
          <Review />
        </main>

        <Dark />

        <div className='sf-rail'>
          <Pricing />
          <FretBand cell={3} tone='ornament' />
          <Footer />
        </div>
      </div>
      <DirectionCorner slug='stepped-fret' />
    </>
  );
}
