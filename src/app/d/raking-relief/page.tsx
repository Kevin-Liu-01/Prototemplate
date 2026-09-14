import type { Metadata } from 'next';
import { Cinzel } from 'next/font/google';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';

import Footer from './sections/Footer';
import Hero from './sections/Hero';
import Nav from './sections/Nav';
import { ChevronBand, FretBand, PalmetteBand } from './sections/Ornament';
import Proof from './sections/Proof';
import Rosettes from './sections/Rosettes';
import Stele from './sections/Stele';
import Surfaces from './sections/Surfaces';
import Tablets from './sections/Tablets';

import './styles.css';

/**
 * raking-relief: a bas-relief wall. The page is a stack of wide stone
 * courses under a raking light from the left. Every form is carved: raised
 * panels cast a dithered shadow to their right and catch a lit edge on
 * their left; sunk panels hold shadow inside their left edge and light on
 * their right. Geometric relief bands (rosettes, palmettes, chevrons, a
 * stepped fret) frame the courses. The content is inscribed text: the
 * claim in inscriptional capitals, the source raised and its translations
 * incised, the locales as rosettes, the agent on a black stele, the rates
 * on three tablets. Alabaster, warm shadow, one lapis inlay.
 */

const display = Cinzel({
  weight: ['400', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--raking-relief-display',
});

export const metadata: Metadata = {
  title: 'raking-relief — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

export default function RakingReliefPage() {
  return (
    <>
      <div className={`raking-relief-root ${display.variable}`}>
        <Nav />
        <main>
          <div className='rr-wall'>
            <Hero />
            <Proof />
            <PalmetteBand id='rr-palm-a' />
            <Surfaces />
            <ChevronBand id='rr-chev-a' />
            <Rosettes />
          </div>
          <Stele />
          <div className='rr-wall is-lower'>
            <Tablets />
            <FretBand id='rr-fret-a' />
            <Footer />
          </div>
        </main>
      </div>
      <DirectionCorner slug='raking-relief' />
    </>
  );
}
