/**
 * apadana-grid: the General Translation landing page as the floor plan of a
 * hypostyle hall seen from above.
 *
 * The page is a sequence of columned halls in plan. Each section is a strict
 * square field of column bases, circles with fluted rings on every
 * intersection, and the bays between the columns hold the content. The
 * portico (6 by 2 columns) holds the claim between its two rows; a 4 by 4
 * bay hall proves the T component with the source at the center and eight
 * locale builds around it; the great hall (6 by 6) sets one locale per bay
 * around the halftone globe; the throne hall at night is the dark moment
 * with the four product surfaces as rooms; the treasury frames the plans in
 * three bays under the rate ledger; the rear portico is the footer. The
 * lineage is the Achaemenid revival inside 1920s Art Deco, geometry only:
 * Persepolis in plan, the double volute as arcs, the twelve-petal rosette.
 * Material palette: limestone, lapis, gold, black basalt.
 */
import localFont from 'next/font/local';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';

import { Footer } from './sections/Footer';
import { GreatHall } from './sections/GreatHall';
import { Nav } from './sections/Nav';
import { Portico } from './sections/Portico';
import { Proof } from './sections/Proof';
import { ThroneHall } from './sections/ThroneHall';
import { Treasury } from './sections/Treasury';

import './styles.css';

/* the one display face: geometric deco capitals for the h1 and the h2 only */
const display = localFont({
  src: [
    { path: '../../../../public/fonts/google/julius-sans-one-400.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--apadana-grid-display',
  display: 'swap',
});

export const metadata = {
  title: 'apadana-grid — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

export default function ApadanaGridPage() {
  return (
    <>
      <div className={`apadana-grid-root ${display.variable}`}>
        <div className='apg-rail'>
          <Nav />
          <Portico />
          <Proof />
          <GreatHall />
        </div>
        <ThroneHall />
        <div className='apg-rail is-lower'>
          <Treasury />
          <Footer />
        </div>
      </div>
      <DirectionCorner slug='apadana-grid' />
    </>
  );
}
