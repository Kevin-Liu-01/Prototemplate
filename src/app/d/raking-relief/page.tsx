import type { Metadata } from 'next';
import { Cinzel } from 'next/font/google';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';

import Footer from './sections/Footer';
import Hero from './sections/Hero';
import Nav from './sections/Nav';
import { ChevronBand, FretBand, GuillocheBand, PalmetteBand } from './sections/deco/Ornament';
import Proof from './sections/Proof';
import Recess from './sections/Recess';
import Rosettes from './sections/Rosettes';
import Surfaces from './sections/Surfaces';
import Tablets from './sections/Tablets';

import './styles.css';

/**
 * raking-relief: a bas-relief stone wall under a raking light from the
 * left. The page is a stack of wide courses, and every form on it is
 * carved. A raised tablet catches a lit edge on its left and top and casts
 * a stepped Bayer-tier shadow to its right and below; a sunk register
 * holds the rim's shadow inside its left and top edges and a lit inner
 * wall on its right and bottom; carved letters cast a dithered shadow and
 * incised letters show the lit lip of their cut. Geometric relief bands
 * (rosette, palmette, chevron, guilloche, stepped fret) run between the
 * courses and frame every raised tablet. The content is inscription: the
 * claim in inscriptional capitals under a sun-disk crown, the same claim
 * incised in sixteen locales, the source raised and its translations cut
 * beside it, the locales as a rosette band with the word for "language"
 * in nine scripts, the agent in a shadowed recess with a stepped niche
 * head, the rates on three tablets under ziggurat caps. Alabaster, warm
 * shadow, one lapis inlay.
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
            <GuillocheBand id='rr-guil-a' />
          </div>
          <Recess />
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
