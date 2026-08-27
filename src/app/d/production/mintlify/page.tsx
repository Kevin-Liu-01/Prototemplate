import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import MintlifyClose from '../sections/MintlifyClose';
import MintlifyContent from '../sections/MintlifyContent';
import MintlifyFaq from '../sections/MintlifyFaq';
import MintlifyFlow from '../sections/MintlifyFlow';
import MintlifyHero from '../sections/MintlifyHero';
import MintlifyLanguageBand from '../sections/MintlifyLanguageBand';
import MintlifySetup from '../sections/MintlifySetup';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import '../sections/partner-primitives.css';
import '../sections/mintlify.css';

export const metadata = {
  title: 'Translate Mintlify Docs — Automated Documentation Translation',
  description:
    'Automatically translate your Mintlify documentation into multiple languages. Locadex handles i18n routing, MDX translation, and continuous updates via GitHub — set up in 5 minutes.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION — /mintlify, the shipped page, not a direction.
 *
 * Reproduced from apps/landing/src/components/pages/mintlify/
 * MintlifyPage.tsx in the order that file mounts its sections:
 *
 *   mintlify-hero           lockup, display line, two actions, PR diagram
 *   mintlify-language-band  the 25-chip marquee
 *   mintlify-flow           "How it works" — three steps
 *   mintlify-content        "Translate Markdown and MDX" — MDX exhibit + six rows
 *   mintlify-setup          "Set up Mintlify translations in 5 minutes" — four steps
 *   mintlify-faq            seven questions
 *   mintlify-close          "Translate with a click" + the glyph rain
 *
 * The title and description are the strings the shipped route's
 * generateMetadata builds (apps/landing/src/app/[locale]/(home)/mintlify/
 * page.tsx). /en-US/mintlify is live and answers 200 today.
 *
 * CHROME. The shipped page sits in the (home) route group, so it wears the
 * same header and footer as the shipped landing page — which is why this
 * route takes the control's own V0Nav/V0Footer shell rather than the
 * TopNav/SiteFooter pair the singularity finals use on their subpages.
 * SmoothScroll is on the shipped page too (it wraps MintlifyPage's main);
 * in this repo the wrapper is a pass-through kept for shell structure.
 */
export default function ProductionMintlifyPage() {
  return (
    <SmoothScroll>
      <div
        className='toolchain-root sgdh-root prod-root mintlify-root'
        id='top'
      >
        <V0Nav />

        <main className='tc-rail'>
          <MintlifyHero />
          <MintlifyLanguageBand />
          <MintlifyFlow />
          <MintlifyContent />
          <MintlifySetup />
          <MintlifyFaq />
          <MintlifyClose />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
