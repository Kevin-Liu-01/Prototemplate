import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';
import YcClaim from '../../singularity/company-sections/YcClaim';
import YcClose from '../../singularity/company-sections/YcClose';
import YcDeal from '../../singularity/company-sections/YcDeal';
import YcHero from '../../singularity/company-sections/YcHero';
import YcTestimonial from '../../singularity/company-sections/YcTestimonial';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/company-sections/company.css';
import '../../singularity/company-sections/partners.css';
import '../styles.css';

export const metadata = {
  title: 'Y Combinator — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  robots: { index: false, follow: false },
};

/**
 * Y Combinator — the programme page in the singularity grammar, wearing the
 * Dossier accent sheet. The live route at apps/landing is switched off
 * upstream (the page calls notFound() and publishes only a noindex), but
 * YcPage.tsx is still in the tree and is the source this rebuild reads:
 * masthead, deal terms, the one statement on the record, the close, and
 * the claim record on ink. The noindex travels with it.
 */
export default function SingularityDossierYcPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <YcHero />
          <YcDeal />
          <YcTestimonial />
          <YcClose />
        </div>
        <YcClaim />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
