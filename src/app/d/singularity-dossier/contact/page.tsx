import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import ContactForm from './ContactForm';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';
import './contact.css';
import './port-compat.css';

export const metadata = {
  title: 'Contact — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Contact — the standalone enterprise contact sheet, mirrored from the
 * gt-cloud /enterprise/contact page (EnterpriseContactPage): one stretched
 * grid filling the viewport under the nav, the framed form panel running
 * its rules off every edge, the four-feature ledger and the Cursor quote
 * centered in the intro column.
 */
export default function SingularityDossierContactPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root sgdc-root' id='top'>
        <TopNav />
        <main className='tc-rail'>
          <ContactForm />
          <SiteFooter />
        </main>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
