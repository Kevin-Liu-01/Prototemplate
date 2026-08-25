import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import NotFound from '../../singularity/sections/NotFound';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/sections/not-found.css';
import '../styles.css';

export const metadata = {
  title: '404 — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  robots: { index: false, follow: false },
};

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
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
