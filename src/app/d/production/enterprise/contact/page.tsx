import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import EnterpriseContact from '../../sections/EnterpriseContact';
import ProdFooter from '../../sections/ProdFooter';
import ProdNav from '../../sections/ProdNav';

import '../../../toolchain/sections/logos-icons.css';
import '../../../toolchain/styles.css';
import '../../../_v0/v0-pages.css';
import '../../sections/enterprise.css';

const route = seoRoute({
  path: '/d/production/enterprise/contact',
  title: 'Enterprise contact',
  section: 'Shipped',
  kind: 'mirror',
  description:
    'See how General Translation can deliver full-stack localization for your project with dedicated engineering support.',
});

export const metadata = route.metadata;

/**
 * PRODUCTION · ENTERPRISE CONTACT: generaltranslation.com/enterprise/contact.
 *
 * The live page (apps/landing/src/components/pages/enterprise/
 * EnterpriseContactPage.tsx) is the enterprise contact form alone on the
 * rail: `toolchain-root sgdh-root enterprise-root`, then main.tc-rail >
 * .tce-contact-wrap > the form with no column divider. The enterprise
 * page's section mounts the same form with an h2; this page keeps the
 * shared form's default h1. The (home) layout supplies the header and the
 * footer, which here are ProdNav and ProdFooter. The form is a stub that
 * sends nothing.
 */
export default function ProductionEnterpriseContactPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root enterprise-root'>
        <ProdNav />

        <main className='tc-rail'>
          <EnterpriseContact headingLevel='h1' />
          <ProdFooter />
        </main>
      </div>
      <DirectionCorner slug='production' />
    </SmoothScroll>
  );
}
