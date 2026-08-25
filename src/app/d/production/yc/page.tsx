import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import YcBenefits from '../sections/YcBenefits';
import YcClose from '../sections/YcClose';
import YcContactForm from '../sections/YcContactForm';
import YcHero from '../sections/YcHero';
import YcTestimonial from '../sections/YcTestimonial';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import '../sections/partner-primitives.css';
import '../sections/yc.css';

export const metadata = {
  title: 'Y Combinator — Production — GT Redesign',
  description:
    'The shipped /yc programme page, reproduced section for section: the reference every other direction is measured against.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  /* the shipped route publishes a noindex and nothing else while it is
     switched off (see the note below); the reproduction carries it too */
  robots: { index: false, follow: false },
};

/**
 * PRODUCTION — /yc, the shipped page, not a direction.
 *
 * Reproduced from apps/landing/src/components/pages/yc/YcPage.tsx in the
 * order that file mounts its sections:
 *
 *   yc-hero          the horizon, the partner lockup, the ONE action
 *   yc-glyph         "One codebase. Every language." + the four deal terms
 *   yc-testimonial   the Cursor statement
 *   yc-close         "Go global before Demo Day." + the edge globe
 *   yc-claim         the claim record (YcContactForm, embedded)
 *
 * UPSTREAM IS SWITCHED OFF. apps/landing/src/app/[locale]/(home)/yc/page.tsx
 * calls notFound() with the YcPage import commented out, and its
 * generateMetadata publishes only `robots: { index: false, follow: false }` —
 * no canonical, no alternates, no open graph — with the note "the route is
 * temporarily disabled and the page 404s". The running app confirms it:
 * /en-US/yc answers 404 while /en-US/mintlify answers 200. So the component
 * is still in the tree and is still the source of truth for this control,
 * but the page it renders is not reachable on the live site today. The
 * noindex travels with the reproduction.
 *
 * CHROME. The shipped page sits in the (home) route group, so it wears the
 * same header and footer as the shipped landing page — which is why this
 * route takes the control's own V0Nav/V0Footer shell rather than the
 * TopNav/SiteFooter pair the singularity finals use on their subpages.
 */
export default function ProductionYcPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root yc-root' id='top'>
        <V0Nav />

        <main className='tc-rail'>
          <YcHero />
          <YcBenefits />
          <YcTestimonial />
          <YcClose />
          <YcContactForm />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
