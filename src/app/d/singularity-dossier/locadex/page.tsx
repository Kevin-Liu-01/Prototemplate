import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import LocadexBand from '../../singularity/product-sections/LocadexBand';
import LocadexHero from '../../singularity/product-sections/LocadexHero';
import LocadexRun from '../../singularity/product-sections/LocadexRun';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/product-sections/product.css';
import '../styles.css';

const route = seoRoute({
  path: '/d/singularity-dossier/locadex',
  title: 'Locadex, Dossier',
  kind: 'direction',
  description:
    'The Locadex product page of the Dossier site concept: one agent run filed as its exhibits, from transcript to pull request, then the bill.',
});

export const metadata = route.metadata;

/**
 * Singularity · Dossier — the Locadex product page.
 * One agent run filed as its exhibits — transcript, scan, inference,
 * diff, pull request — then the itemised bill on the dark band.
 * A thin wrapper: shared product sections between the shared TopNav and
 * footer, exactly the way this final's enterprise page composes.
 */
export default function DossierLocadexPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root'>
        <TopNav />
        <div className='tc-rail'>
          <LocadexHero />
          <LocadexRun />
        </div>
        <LocadexBand />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity-dossier' />
    </SmoothScroll>
  );
}
