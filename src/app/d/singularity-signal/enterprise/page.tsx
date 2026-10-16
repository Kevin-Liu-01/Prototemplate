import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import EnterpriseContact from '../../singularity/sections/EnterpriseContact';
import EnterpriseEvidence from '../../singularity/sections/EnterpriseEvidence';
import EnterpriseFrameworks from '../../singularity/sections/EnterpriseFrameworks';
import EnterpriseTestimony from '../../singularity/sections/EnterpriseTestimony';
import Hero from '../../singularity/sections/Hero';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/sections/enterprise.css';
import '../styles.css';

const route = seoRoute({
  path: '/d/singularity-signal/enterprise',
  title: 'Enterprise, Signal',
  kind: 'direction',
  description:
    'The enterprise page of the Signal site concept: General Translation’s case to large teams, its compliance record and the ask to talk to sales.',
});

export const metadata = route.metadata;

/**
 * Singularity · Signal — the gate, then the broadcast. The shared
 * enterprise composition under the hero, in this final's control-room
 * dress: stamped mono rules, the version command inverted to a terminal,
 * the record read as intercepted transmissions.
 */
export default function SingularitySignalPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgs-root'>
        <TopNav />
        <Hero />
        <EnterpriseContact />
        <div className='tc-rail'>
          <EnterpriseEvidence />
          <EnterpriseFrameworks />
          <EnterpriseTestimony />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity-signal' />
    </SmoothScroll>
  );
}
