import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import ContextCTA from './sections/ContextCTA';
import ContextHero from './sections/ContextHero';
import Controls from './sections/Controls';
import GroupBand from './sections/GroupBand';
import Signals from './sections/Signals';

import '../styles.css';
import './context.css';

export const metadata = {
  title: 'Context — Toolchain — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The Context product page — the toolchain direction's deep page for the
 * `context=` attribute, glossaries, directives, code signals, and Context
 * Groups. Same ruled column, same one full-bleed dark band; the band here
 * is the group accumulator: sources in, translations out, on the brand's
 * doubled thread.
 */
export default function ToolchainContextPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <ContextHero />
          <Signals />
        </div>

        <GroupBand />

        <div className='tc-rail'>
          <Controls />
          <ContextCTA />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
