/**
 * calendar-rings: a General Translation landing page as a concentric disk.
 *
 * The hero is one disk of nested rings, dither density stepping outward,
 * with the claim at its center and radial rules dividing the outer ring
 * into cells. Every section after it is one ring unrolled into a wide arc
 * band, so the page reads as rings peeled outward: the customers, the T
 * component, the negative ring with the stack, the languages, the pricing
 * file, and the flat base register of the footer. The lineage is the
 * Aztec and Maya revival of the 1920s, geometry only: rings, notches,
 * cells, radial rules, stepped registers and bar-and-dot numerals.
 * Material palette: obsidian, terracotta, jade, gold.
 */
import { Cinzel } from 'next/font/google';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';

import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { Languages } from './sections/Languages';
import { Nav } from './sections/Nav';
import { Pricing } from './sections/Pricing';
import { Proof } from './sections/Proof';
import { Surfaces } from './sections/Surfaces';
import { Trust } from './sections/Trust';

import './styles.css';

/* the one display face: inscriptional capitals for h1, h2 and the crown */
const display = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--calendar-rings-display',
  display: 'swap',
});

export const metadata = {
  title: 'calendar-rings — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

export default function CalendarRingsPage() {
  return (
    <>
      <div className={`calendar-rings-root ${display.variable}`}>
        <Nav />
        <main>
          <Hero />
          <Trust />
          <Proof />
          <Surfaces />
          <Languages />
          <Pricing />
        </main>
        <Footer />
      </div>
      <DirectionCorner slug='calendar-rings' />
    </>
  );
}
