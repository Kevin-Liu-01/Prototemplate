import localFont from 'next/font/local';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import BayerTiers from './diagrams/BayerTiers';
import Hero from './sections/Hero';
import Kiln from './sections/Kiln';
import LanguagesBand from './sections/LanguagesBand';
import Pricing from './sections/Pricing';
import SiteFooter from './sections/SiteFooter';
import TopNav from './sections/TopNav';
import WallProof from './sections/WallProof';

import './styles.css';

export const metadata = {
  title: 'brick-lattice — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/* the one display face: inscriptional capitals for h1 and h2 only; Inter stays the body */
const display = localFont({
  src: [
    { path: '../../../../public/fonts/google/cinzel-400.woff2', weight: '400', style: 'normal' },
    { path: '../../../../public/fonts/google/cinzel-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--brick-lattice-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

/**
 * brick-lattice · Babylonian revival, dither as the design language.
 *
 * The entire page is one running-bond brick wall in which every brick is
 * an ordered-dither cell. Density, quantised on the Bayer screen, draws the
 * ornament, and each section has its own pattern from one book: a rosette
 * field behind the hero's claim, chevron courses behind the wall of
 * translations (which the source brick lights, in the DOM and in the
 * lattice at once), the inverted lattice of the kiln with its ziggurat
 * setbacks and merlons, meander frets around the medallions of the
 * languages band, palmette fans under the glazed panels of the pricing
 * file, and the stepped foundation under the footer, where the book itself
 * is printed. There is no empty ground; copy sits on smooth glazed panels
 * with stepped parapet corners cut out of the lattice, and hovering any
 * brick or panel lights it with the accent ring, additively. Everything is
 * visible at rest. Flat, continuous, woven: an elevation of glazed brick,
 * not a gate.
 */
export default function BrickLatticePage() {
  return (
    <>
      <div className={`brick-lattice-root ${display.variable}`}>
        <BayerTiers />
        <TopNav />
        <main>
          <Hero />
          <WallProof />
          <Kiln />
          <LanguagesBand />
          <Pricing />
        </main>
        <SiteFooter />
      </div>
      <DirectionCorner slug='brick-lattice' />
    </>
  );
}
