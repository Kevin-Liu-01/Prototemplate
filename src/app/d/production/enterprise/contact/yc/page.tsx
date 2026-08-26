import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContactHero from '../../../../singularity/sections/EnterpriseContactHero';
import SiteFooter from '../../../../singularity/sections/SiteFooter';
import TopNav from '../../../../singularity/sections/TopNav';
import YcClaimDesk from '../../../../singularity/sections/YcClaimDesk';
import {
  YC_CONTACT_DEK,
  YC_CONTACT_TITLE,
} from '../../../../singularity/sections/enterprise-contact-data';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../../../singularity/sections/logos-icons.css';
import '../../../../singularity/styles.css';
import '../../../../singularity/sections/enterprise.css';
import '../../../../singularity/sections/enterprise-contact.css';
import '../../../styles.css';

export const metadata = {
  title: 'YC Deal — Shipped — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The YC claim — the enterprise contact desk's second face, filed one
 * level down exactly as the live site files it. The masthead names the
 * deal, the desk carries the founder's form: verification link, company,
 * and what it builds. Nothing is verified and nothing is sent.
 */
export default function SingularityProductionYcContactPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root prod-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <EnterpriseContactHero
            back={{ label: 'Enterprise contact', path: '/enterprise/contact' }}
            dek={YC_CONTACT_DEK}
            kicker='Enterprise · YC deal'
            title={YC_CONTACT_TITLE}
          />
        </div>
        <YcClaimDesk />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
