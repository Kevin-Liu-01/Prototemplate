import localFont from 'next/font/local';

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
const display = localFont({
  src: [
    { path: '../../../../public/fonts/google/aboreto-400.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--stepped-fret-display',
  display: 'swap',
});

export const metadata = {
  title: 'stepped-fret — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * STEPPED-FRET. The page is a sequence of horizontal registers in the
 * Zapotec and Mixtec revival of Art Deco. Five distinct Mitla frets (the
 * stepped fret with its coil, the hooked step, the stepped chevron, the
 * stepped diamond, and the opposed pair) are drawn at three scales and
 * assigned by register: every boundary on the cream page is one fret at
 * the band scale, the pilasters and cornices are frets at the fine scale,
 * and the dark band opens with the Mitla facade at all three. The content
 * block of each register steps right by one fret step and back again down
 * the page, and the gutter each step leaves is filled with a graded Bayer
 * tier, so the grid itself is a stair of cut stone. The hero is one
 * monumental fret in ordered dither with the claim set in the step it
 * leaves open; the proof of the T component is a stair of translations with
 * the flag chips on the risers and the coil as its terminal; the languages
 * are pockets of one crenellated meander; the customer marks stand between
 * fret pilasters; the platform is the hero's stair inverted, cream plates on
 * black; the pricing file is three stepped plinths under setback caps.
 * Limestone cream, ochre, red oxide and black; Inter with Aboreto for the
 * display slots.
 */
export default function SteppedFretPage() {
  return (
    <>
      <div className={`stepped-fret-root ${display.variable}`}>
        <Nav />
        <main className='sf-rail'>
          <Hero />
          <FretBand fret='spiral' scale='band' tone='ink' />
          <Trust />
          <FretBand fret='zigzag' scale='band' tone='ornament' />
          <Proof />
          <FretBand fret='hook' scale='band' tone='ink' />
          <Surfaces />
          <FretBand fret='lozenge' scale='band' tone='ornament' />
          <Material />
          <FretBand fret='zigzag' scale='band' tone='ink' />
          <Review />
        </main>

        <Dark />

        <div className='sf-rail'>
          <Pricing />
          <FretBand fret='hook' scale='fine' tone='ink' />
          <Footer />
        </div>
      </div>
      <DirectionCorner slug='stepped-fret' />
    </>
  );
}
