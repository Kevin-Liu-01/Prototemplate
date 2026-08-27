import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../_v0/V0Footer';
import V0Nav from '../_v0/V0Nav';

import ContextSec from './sections/ContextSec';
import Customers from './sections/Customers';
import Deploy from './sections/Deploy';
import Developer from './sections/Developer';
import FullStack from './sections/FullStack';
import Global from './sections/Global';
import HomeHero from './sections/HomeHero';
import Locadex from './sections/Locadex';

import '../toolchain/sections/logos-icons.css';
import '../toolchain/styles.css';
import './home.css';
import '../_v0/v0-pages.css';
import '@/components/shared/home-terminal-colors.css';

export const metadata = {
  title: 'Shipped — GT Redesign',
  description:
    'What the redesign produced: the landing page now live at generaltranslation.com, reproduced section for section.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION — what shipped.
 *
 * The other finals here are proposals: each takes the site's subject and
 * argues for a treatment. This one is the outcome. The directions were built,
 * judged and narrowed to three, and what came out the far side is the site now
 * live at generaltranslation.com — most of it Dossier, the rest whatever
 * survived contact with a real codebase. It is reproduced here page for page
 * so the result can be read in the same room as the arguments that produced
 * it.
 *
 * The composition below mirrors HomePage.tsx in gt-cloud
 * (apps/landing/src/components/pages/home/HomePage.tsx): hero, customers,
 * full stack, developers, locadex, context, global, deploy — hatch rules
 * between them, and the three fragment aliases published links point at.
 *
 * It follows the shipped page rather than improving on it. Where a section
 * here still reads differently, that is drift to be closed, not a decision.
 */
export default function ProductionPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root' id='top'>
        <V0Nav />

        <main className='tc-rail'>
          <HomeHero />
          <Customers />
          <div aria-hidden className='v0-hatch' />
          <FullStack />
          <div aria-hidden className='v0-hatch' />
          {/* fragment aliases: published external links target these anchor
              ids, so each lands on the section carrying its content */}
          <span aria-hidden className='block h-0' id='code-libraries' />
          <Developer />
          <div aria-hidden className='v0-hatch' />
          <span aria-hidden className='block h-0' id='translation-agents' />
          <Locadex />
          <div aria-hidden className='v0-hatch' />
          <span aria-hidden className='block h-0' id='context-platform' />
          <ContextSec />
          <div aria-hidden className='v0-hatch' />
          <Global />
          <div aria-hidden className='v0-hatch' />
          <Deploy />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
