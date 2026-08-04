import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import Delivery from './Delivery';
import DemoBand from './DemoBand';
import EnterpriseHero from './EnterpriseHero';
import Governance from './Governance';
import LocadexGuard from './LocadexGuard';
import ReviewGates from './ReviewGates';
import Security from './Security';

import '../styles.css';
/* The footer's theme-paired brand marks and the shared icon sizing live with
   the base page's Frameworks section; this route has no Frameworks, so it
   imports the sheet directly (the locadex sub-page sets the precedent). */
import '../sections/logos-icons.css';
import './enterprise.css';

export const metadata = {
  title: 'Enterprise — Toolchain',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The enterprise page in the toolchain grammar: the same ruled column, the
 * same nested-frame cells and hatch spacers, but every artifact is a control
 * surface — a compliance ledger, a permission matrix, the review gate drawn
 * in the two threads, a guarded Locadex PR, and a version rail you can walk
 * back. Dense and artifact-led, the oxc way: heading + one line + one
 * artifact per cell, and exactly one dark band, which is the demo ask.
 */
export default function ToolchainEnterprisePage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <EnterpriseHero />
          <Security />
          <Governance />
          <ReviewGates />
          <LocadexGuard />
          <Delivery />
        </div>

        <DemoBand />

        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
