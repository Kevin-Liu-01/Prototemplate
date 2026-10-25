import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import ContactBody from './sections/ContactBody';
import ContactHero from './sections/ContactHero';

/* no Frameworks on this route — the footer's marks need the sheet directly */
import '../sections/logos-icons.css';
import '../styles.css';
import './contact.css';

const route = seoRoute({
  path: '/d/toolchain/contact',
  title: 'Contact, Toolchain',
  kind: 'direction',
  description:
    'The contact page of the Toolchain direction: General Translation’s contact bay rebuilt in the concept’s type and color.',
});

export const metadata = route.metadata;

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
      <DirectionCorner slug='toolchain' />
    </SmoothScroll>
  );
}
