import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import ContactBody from './sections/ContactBody';
import ContactHero from './sections/ContactHero';

import '../styles.css';
import './contact.css';

export const metadata = {
  title: 'Contact — Toolchain — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The contact page, re-clothed in the toolchain grammar. Everything on it is
 * lifted from the live landing app: the form is field-for-field the one
 * `ContactForm.tsx` renders at /contact (labels, placeholders, terms line,
 * error copy), the channel ledger is the union of the channels the site's
 * footer, nav and docs actions publish today, and the wire trace below the
 * split is `/api/contact/route.ts` read out loud — its endpoint, its gates,
 * its limits, and the exact copy each rejection shows. The one honest
 * difference: this prototype assembles the request and shows it; it never
 * sends it.
 */
export default function ToolchainContactPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <ContactHero />
          <ContactBody />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
