import { Cinzel } from 'next/font/google';

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
const display = Cinzel({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--brick-lattice-display',
});

/**
 * brick-lattice · Babylonian revival, dither as the design language.
 *
 * The entire page is one running-bond brick wall in which every brick is
 * an ordered-dither cell. Density, quantised on the Bayer screen, draws the
 * ornament: a twelve-petal rosette behind the hero's claim, chevron courses
 * behind the wall of translations, a crenellated parapet over the kiln,
 * meander frets around the languages band, palmette fans under the pricing
 * file, and a stepped foundation under the footer. There is no empty
 * ground; copy sits on smooth glazed panels with stepped parapet corners
 * cut out of the lattice. Flat, continuous, woven: an elevation of glazed
 * brick, not a gate.
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
