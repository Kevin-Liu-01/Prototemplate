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
/* the desk pointer in the contact band draws this sheet's sgec- rules */
import '../../singularity/sections/enterprise-contact.css';
import '../styles.css';

const route = seoRoute({
  path: '/d/singularity-dossier/enterprise',
  title: 'Enterprise, Dossier',
  kind: 'direction',
  description:
    'The enterprise page of the Dossier site concept: General Translation’s case to large teams, its compliance record and the ask to talk to sales.',
});

export const metadata = route.metadata;

/**
 * Singularity · Dossier — the gate, then the file. The shared enterprise
 * composition under the hero: the contact bay (the ruled form beside the
 * condensing glyph rain), the evidence cells procurement actually reads,
 * and the record — set in this final's dossier dress: dashed certificate
 * frames, filed control numbers, everything measured and signed.
 */
export default function SingularityDossierPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root'>
        <TopNav />
        <Hero />
        <EnterpriseContact deskPath='/enterprise/contact' />
        <div className='tc-rail'>
          <EnterpriseEvidence />
          <EnterpriseFrameworks />
          <EnterpriseTestimony />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity-dossier' />
    </SmoothScroll>
  );
}
