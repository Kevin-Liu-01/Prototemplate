import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import Customers from '../sections/Customers';
import CareersClose from '../sections/CareersClose';
import CareersHero from '../sections/CareersHero';
import CareersMission from '../sections/CareersMission';
import CareersOpenings from '../sections/CareersOpenings';

import { getJobPostings } from './careers-data';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../home.css';
import '../../_v0/v0-pages.css';
import '../sections/careers.css';

export const metadata = {
  title: 'Careers — Production — GT Redesign',
  description:
    'The shipped careers page, reproduced section for section: hero, customers, mission, open roles, close.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION · CAREERS — the shipped page, not a direction.
 *
 * Reproduces generaltranslation.com/careers in the order
 * apps/landing/src/components/pages/careers/CareersPage.tsx mounts it:
 *
 *   1. the hero — the lensed hole, one headline, ONE button
 *   2. the customers wall, under its own h2 (the careers lead, not the
 *      home page's)
 *   3. MISSION — the page's largest block: h2, six paragraphs, a
 *      three-item list, the office print
 *   4. OPEN ROLES — the live Ashby ledger at #positions
 *   5. the close — the question and the address, against the glyph field
 *
 * Chrome follows the shipped page too: on the real site careers sits in
 * the same (home) route group as the landing page, so it wears the same
 * header and the same footer. Here that means V0Nav and V0Footer — the
 * shipped chrome's counterparts, the pair /d/production's landing page
 * already mounts — rather than the singularity TopNav/SiteFooter the
 * proposals' subpages use.
 *
 * Root classes match the shipped page's `toolchain-root sgdh-root
 * careers-root` with this concept's own two markers added, so the v0
 * sheet's square surfaces and registration crosses land here exactly as
 * they land on the landing page.
 */
export default async function ProductionCareersPage() {
  const positions = await getJobPostings();

  return (
    <SmoothScroll>
      <div
        className='toolchain-root sgdh-root prod-root prc-root'
        id='top'
      >
        <V0Nav />

        <main className='tc-rail'>
          <CareersHero />
          {/* the shipped page passes the careers lead to the SAME customers
              wall the home page mounts — six marks, Sierra among them */}
          <Customers heading="Join the team building language infra for the world's best companies" />
          <CareersMission />
          <CareersOpenings positions={positions} />
          <CareersClose />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
