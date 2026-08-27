import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import ContactForm from '../sections/ContactForm';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';

export const metadata = {
  title: 'Contact — Shipped — GT Redesign',
  description:
    "Have a question about General Translation? We're here to help.",
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

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
 * Chrome: V0Nav + V0Footer, the same pair the production landing mounts,
 * because the real page's chrome IS the site header and the redesigned site
 * footer (the (home) layout wraps every page in Header + SiteFooterMount).
 * The TopNav/SiteFooter pair the singularity subpages use belongs to a
 * different final's shell.
 */
export default function ProductionContactPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root' id='top'>
        <V0Nav />

        <main className='tc-rail'>
          <ContactForm />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
