import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import ContextGroups from './sections/ContextGroups';
import DarkBand from './sections/DarkBand';
import Editor from './sections/Editor';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Platform from './sections/Platform';
import Pricing from './sections/Pricing';
import Proof from './sections/Proof';
import ReviewFlow from './sections/ReviewFlow';
import SiteFooter from './sections/SiteFooter';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = {
  title: 'aurora-paper — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * AURORA PAPER — the toolchain frame with a new identity. The material is a
 * soft aurora on paper (lib/aurora-wash.ts): barely-there chroma breathing
 * behind the hero's measured type cascade, the same field turned to ink for
 * the one dark band. The sections are workspace-led: the editor grid, the
 * review flow, the dashboard ledger, and context groups.
 */
export default function AuroraPaperPage() {
  return (
    <SmoothScroll>
      <div className='aurorapaper-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Frameworks />
          <Editor />
          <ReviewFlow />
          <Platform />
          <ContextGroups />
          <Proof />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='aurora-paper' />
    </SmoothScroll>
  );
}
