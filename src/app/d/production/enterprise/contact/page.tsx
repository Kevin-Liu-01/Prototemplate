import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContactDesk from '../../../singularity/sections/EnterpriseContactDesk';
import EnterpriseContactHero from '../../../singularity/sections/EnterpriseContactHero';
import SiteFooter from '../../../singularity/sections/SiteFooter';
import TopNav from '../../../singularity/sections/TopNav';
import {
  ENTERPRISE_CONTACT_DEK,
  ENTERPRISE_CONTACT_TITLE,
} from '../../../singularity/sections/enterprise-contact-data';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../../singularity/sections/logos-icons.css';
import '../../../singularity/styles.css';
import '../../../singularity/sections/enterprise.css';
import '../../../singularity/sections/enterprise-contact.css';
import '../../styles.css';

export const metadata = {
  title: 'Enterprise Contact — Production — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Enterprise contact — the sheet behind the enterprise page's "Talk to
 * Sales". The masthead files the route, then the desk band carries the
 * live form: the four deployment commitments and the Cursor quote on the
 * left, the form on the right. Nothing submits; the desk says so.
 */
export default function SingularityProductionEnterpriseContactPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root prod-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <EnterpriseContactHero
            back={{ label: 'Enterprise', path: '/enterprise' }}
            dek={ENTERPRISE_CONTACT_DEK}
            kicker='Enterprise · Contact'
            title={ENTERPRISE_CONTACT_TITLE}
          />
        </div>
        <EnterpriseContactDesk />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
