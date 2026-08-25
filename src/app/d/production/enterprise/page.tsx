import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import EnterpriseContact from '../sections/EnterpriseContact';
import EnterpriseGrade from '../sections/EnterpriseGrade';
import EnterpriseHero from '../sections/EnterpriseHero';
import EnterpriseTestimonial from '../sections/EnterpriseTestimonial';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import '../sections/enterprise.css';

export const metadata = {
  title: 'Enterprise — Production — GT Redesign',
  description:
    'Full-stack localization for enterprises, with white-glove delivery by forward-deployed engineers — the shipped enterprise page, reproduced section for section.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION · ENTERPRISE — the shipped page, not a direction.
 *
 * The real /enterprise is four sections. It mounts exactly these, in this
 * order (apps/landing/src/components/pages/enterprise/ServicesLandingPage.tsx):
 *
 *   EnterpriseHero            the two-line headline, both sub-paragraphs,
 *                             one ring-backed "Talk to Us", the three
 *                             certification shields — and, framed in the
 *                             right cell over the rising ink field, the
 *                             customer proof ledger: five rows, one per
 *                             customer, each carrying that customer's
 *                             locale count and the surfaces it covers.
 *   TestimonialSection        the Lee Robinson line on the ink plate.
 *   EnterpriseContactSection  the two-column ask: heading, four pillars,
 *                             the Andrew Milich quote, the four-field form.
 *   EnterpriseGradeSection    "Frameworks and Integrations" over the
 *                             coverage stage — fourteen marks, rain above
 *                             and below.
 *
 * Three sections are commented OUT in the shipped file and are therefore
 * absent here too: FullStackLocalization, GovernedExplorer, and Security.
 * Nothing else belongs on this page. An earlier study of this route grew an
 * Evidence section, a plan ledger, a permission matrix and a machine-surface
 * ledger, swapped ClickHouse in for Sierra, and dropped the proof ledger,
 * the shields and both sub-paragraphs. None of that is the real page, so
 * none of it is here.
 *
 * Chrome: V0Nav and V0Footer, the pair the concept's landing and pricing
 * pages mount. The shipped site serves one nav and one footer from the
 * (home) layout on every route in the group — Header plus SiteFooterMount —
 * so this subpage inherits the home page's chrome rather than the
 * singularity finals' TopNav/SiteFooter.
 *
 * The root carries `enterprise-root pricing-root` beside the shell classes
 * exactly as the shipped page's does
 * (`toolchain-root sgdh-root enterprise-root pricing-root`); pricing-root
 * is inert on this route in the shipped app too, since /enterprise never
 * loads the pricing sheet. `id='top'` sits on the hero section, which is
 * where the shipped page puts it.
 */
export default function ProductionEnterprisePage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root enterprise-root pricing-root'>
        <V0Nav />

        <main className='tc-rail'>
          <EnterpriseHero />
          <EnterpriseTestimonial />
          <EnterpriseContact />
          <EnterpriseGrade />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
