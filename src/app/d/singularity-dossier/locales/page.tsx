import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import LocalesCatalog from './LocalesCatalog';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';
import './locales.css';

export const metadata = {
  title: 'Supported Locales — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Supported Locales — the production catalog from gt-cloud
 * (components/pages/supported-locales), on the dossier sheet: centered
 * head, contained rounded search, and every locale as a flag card. All
 * 120 rows come from the exact data path the live page reads at runtime
 * (see ./locales-data.ts); nothing on this page is invented.
 */
export default function SingularityDossierLocalesPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root toolchain-root sgd-root locales-root' id='top'>
        <V0Nav />
        <div className='tc-rail'>
          <LocalesCatalog />
          <V0Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}
