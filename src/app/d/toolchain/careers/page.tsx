import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import { getJobPostings } from './lib';
import CareersCTA from './sections/CareersCTA';
import CareersHero from './sections/CareersHero';
import OpeningsLedger from './sections/OpeningsLedger';

import '../styles.css';
import '../sections/logos-icons.css';
import './careers.css';

export const metadata = {
  title: 'Careers — Toolchain — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The careers page, mutated into the toolchain grammar. All content is the
 * old landing careers page's own (apps/landing .../careers/CareersPage.tsx):
 * the same headline, mission line, trust roster, live Ashby job board, empty
 * state, and mailto — re-clothed as a ruled openings ledger, a nested-frame
 * posting record, and a quiet close on the same ruled column as /d/toolchain.
 */
export default async function ToolchainCareersPage() {
  const positions = await getJobPostings();

  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <CareersHero positions={positions} />
          <OpeningsLedger positions={positions} />
          <CareersCTA />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
