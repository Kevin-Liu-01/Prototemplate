import { Aboreto } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import BayerDefs from './components/BayerDefs';
import FoldHinge from './components/FoldHinge';
import Colophon from './sections/Colophon';
import HeroPanel from './sections/HeroPanel';
import LanguagesPanel from './sections/LanguagesPanel';
import Nav from './sections/Nav';
import NightPanel from './sections/NightPanel';
import PricingPanels from './sections/PricingPanels';
import ProofPanel from './sections/ProofPanel';
import SurfacesPanel from './sections/SurfacesPanel';
import TrustPanel from './sections/TrustPanel';

import './styles.css';

export const metadata = {
  title: 'screenfold-codex — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/** The one display face: geometric deco caps for h1, h2, and the hero crown figure. */
const display = Aboreto({
  weight: '400',
  subsets: ['latin'],
  variable: '--screenfold-codex-display',
  display: 'swap',
});

/**
 * Screenfold Codex. The landing page as a Maya screenfold: one strip of
 * bark paper folded into ten leaves, each a page with a red oxide frame
 * and horizontal registers. Every leaf is a parallelogram whose side
 * edges run a fixed distance across from top to bottom, adjacent leaves
 * running opposite ways, so every crease lines up and the strip's
 * silhouette zigzags down the page like an accordion pleat seen a little
 * off its axis. The folds between leaves are stepped troughs of one
 * Bayer screen, inked at a valley, red at a mountain.
 *
 * Dither is the writing: twelve geometric signs carved through dithered
 * squares are the page's vocabulary, each standing for one product
 * concept and printed wherever that concept appears, with the key on the
 * back board. Bar and dot is the counting: every figure prints in the
 * Maya numeral beside its Arabic form, with the key on leaf one. The
 * living material is the real product: the shipped code sample, both
 * belt strings in five locales, the component outputs, the review rows,
 * the locale roster, the rate ledger, the feature grid.
 *
 * Leaves: 1 the claim, 2 the T component, 3 the surfaces, 4 the
 * languages, 5 the review, 6 the story (the dark leaf), 7 the rates,
 * 8 and 9 the plans as an open spread, 10 the comparison, then the back
 * board.
 */
export default function ScreenfoldCodexPage() {
  return (
    <>
      <div className={`screenfold-codex-root ${display.variable}`} id='top'>
        <BayerDefs />
        <Nav />
        <main className='sfc-strip'>
          <HeroPanel />
          <FoldHinge fold='valley' seat='east' />
          <ProofPanel />
          <FoldHinge fold='mountain' seat='west' />
          <SurfacesPanel />
          <FoldHinge fold='valley' seat='east' />
          <LanguagesPanel />
          <FoldHinge fold='mountain' seat='west' />
          <TrustPanel />
          <FoldHinge fold='valley' seat='east' />
          <NightPanel />
          <FoldHinge fold='mountain' seat='west' />
          <PricingPanels />
          <FoldHinge fold='valley' seat='west' />
        </main>
        <Colophon />
      </div>
      <DirectionCorner slug='screenfold-codex' />
    </>
  );
}
