import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import NotFound from '../../singularity/sections/NotFound';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/sections/not-found.css';
import '../styles.css';

/* a not-found page: noindex and no canonical, like the framework's own 404 */
const route = seoRoute({
  path: '/d/singularity-dossier/not-found',
  title: 'Not found, Dossier',
  kind: 'error',
  description: 'No page of the Dossier site concept answers this address; the band links back to its home and its blog.',
});

export const metadata = route.metadata;

/**
 * 404 — the catch-all under the dossier. Any address beneath
 * /d/singularity-dossier/ that no route claims lands here, so a bad URL
 * inside the concept shows the designed horizon band instead of the
 * framework's default page. The band is built once under
 * ../../singularity/sections; this wrapper only sets the root and the
 * shell around it.
 */
export default function SingularityDossierNotFoundPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <NotFound />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity-dossier' />
    </SmoothScroll>
  );
}
