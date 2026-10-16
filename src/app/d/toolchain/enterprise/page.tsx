import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

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

const route = seoRoute({
  path: '/d/toolchain/enterprise',
  title: 'Enterprise, Toolchain',
  kind: 'direction',
  description:
    'The enterprise page of the Toolchain direction: General Translation’s case to large teams, its compliance record and the ask to talk to sales.',
});

export const metadata = route.metadata;

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
      <DirectionCorner slug='toolchain' />
    </SmoothScroll>
  );
}
