import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';
import LegalLedger from '../sections/LegalLedger';
import LegalMasthead from '../sections/LegalMasthead';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import '../sections/legal.css';

export const metadata = {
  title: 'Legal Resources — Production — GT Redesign',
  description:
    'Policies, terms, and data processing information for General Translation.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * LEGAL RESOURCES — the shipped index, reproduced.
 *
 * The live route (apps/landing/src/app/[locale]/(home)/legal/page.tsx) is two
 * sections and nothing else: the head — title, one line, the count of
 * published documents — and the ledger. No kicker, no section label above the
 * rows, no date column, and the count is the real one: the submodule at
 * apps/landing/legal/en-US publishes SEVEN documents, all seven vendored in
 * ../sections/legal-docs.ts.
 *
 * Chrome is V0Nav / V0Footer, which is what the live page wears: the legal
 * route sits inside the (home) group, whose layout wraps every page in the
 * redesigned header and mounts SiteFooterMount directly after the content.
 * (TopNav / SiteFooter is the singularity family's chrome, not this one's.)
 */
export default function ProductionLegalPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root legal-root' id='top'>
        <V0Nav />

        <main className='tc-rail'>
          <LegalMasthead />
          <LegalLedger />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
