import { Cinzel } from 'next/font/google';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';

import Footer from './sections/Footer';
import Forecourt from './sections/Forecourt';
import Hypostyle from './sections/Hypostyle';
import InnerCourt from './sections/InnerCourt';
import Sanctuary from './sections/Sanctuary';
import TopNav from './sections/TopNav';
import Treasury from './sections/Treasury';

import './styles.css';

/**
 * pylon-gate. A General Translation landing page built as a monumental
 * gateway in the Egyptian-revival lineage of Art Deco, geometry only. Two
 * battered pylon masses frame a central passage; every section is a court
 * passed through on one axis, the passage narrowing at each lintel: the
 * forecourt (the claim, the crown, the customer register), the hypostyle
 * (the T proof in cartouches between six pillars), the inner court
 * (languages as a register band, the review stele), the sanctuary (the
 * platform, in lapis), the treasury (pricing on three tapered plinths), and
 * the footer. Strict symmetry throughout. Materials: sandstone ground,
 * lapis ink, turquoise glaze, gold leaf.
 */
const display = Cinzel({
  weight: ['400', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--pylon-gate-display',
});

export const metadata = {
  title: 'pylon-gate — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

export default function PylonGatePage() {
  return (
    <>
      <div className={`pylon-gate-root ${display.variable}`}>
        <TopNav />
        <main>
          <Forecourt />
          <Hypostyle />
          <InnerCourt />
          <Sanctuary />
          <Treasury />
        </main>
        <Footer />
      </div>
      <DirectionCorner slug='pylon-gate' />
    </>
  );
}
