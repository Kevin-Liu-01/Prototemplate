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

import './styles.css';

export const metadata = {
  title: 'screenfold-codex — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/** The one display face: geometric deco caps for h1, h2, and the folio figures. */
const display = Aboreto({
  weight: '400',
  subsets: ['latin'],
  variable: '--screenfold-codex-display',
  display: 'swap',
});

/**
 * Screenfold Codex. The landing page as a Maya screenfold: one strip of
 * bark paper folded into eight leaves, each a page with a red oxide frame
 * and horizontal registers, adjacent leaves sheared the opposite way so
 * the strip reads as an accordion seen off its axis. Dither is the
 * language: glyph blocks are geometric squares filled from one Bayer
 * screen, the folds between leaves are stepped ramps of the same screen,
 * and the dark leaf's plate is the CPU engine drawing a stepped pyramid.
 * Every figure prints in bar and dot beside its Arabic form. The living
 * material is the real product: the shipped code sample, the belt's
 * translations, the review rows, the locale roster, the rate ledger.
 */
export default function ScreenfoldCodexPage() {
  return (
    <>
      <div className={`screenfold-codex-root ${display.variable}`} id='top'>
        <BayerDefs />
        <Nav />
        <main className='sfc-strip'>
          <HeroPanel />
          <FoldHinge fold='valley' />
          <ProofPanel />
          <FoldHinge fold='mountain' />
          <SurfacesPanel />
          <FoldHinge fold='valley' />
          <LanguagesPanel />
          <FoldHinge fold='mountain' />
          <NightPanel />
          <FoldHinge fold='valley' />
          <PricingPanels />
        </main>
        <Colophon />
      </div>
      <DirectionCorner slug='screenfold-codex' />
    </>
  );
}
