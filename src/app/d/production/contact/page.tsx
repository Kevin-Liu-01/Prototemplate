import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import ProdFooter from '../sections/ProdFooter';
import ProdNav from '../sections/ProdNav';

import ContactForm from '../sections/ContactForm';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';

const route = seoRoute({
  path: '/d/production/contact',
  title: 'Contact',
  section: 'Shipped',
  kind: 'mirror',
  description:
    "Have a question about General Translation? We're here to help.",
});

export const metadata = route.metadata;

/**
 * PRODUCTION · CONTACT — the shipped /contact page, reproduced.
 *
 * The live route (apps/landing/src/app/[locale]/(home)/contact/page.tsx) is
 * the site header, ONE section, and the site footer. The section is the
 * shared ContactForm dressed by contact/contact.css: heading and GT figure
 * and two hairline feature rows on the left, the four-field form on the
 * right, one hairline between them. There is no hero and no closing band —
 * so there is none here either.
 *
 * Chrome: ProdNav + ProdFooter, the same pair the production landing mounts,
 * because the real page's chrome IS the site header and the redesigned site
 * footer (the (home) layout wraps every page in Header + SiteFooterMount).
 * The TopNav/SiteFooter pair the singularity subpages use belongs to a
 * different final's shell.
 */
export default function ProductionContactPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root' id='top'>
        <ProdNav />

        <main className='tc-rail'>
          <ContactForm />
          <ProdFooter />
        </main>
      </div>
      <DirectionCorner slug='production' />
    </SmoothScroll>
  );
}
