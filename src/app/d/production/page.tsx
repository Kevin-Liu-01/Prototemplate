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
  title: 'Production — GT Redesign',
  description:
    'The shipped landing page, reproduced section for section: the reference every other direction is measured against.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION — the shipped site, not a direction.
 *
 * Every other final in this file is a proposal: it takes the real page's
 * subject and argues for a different treatment. This one argues for nothing.
 * It reproduces generaltranslation.com section for section, in the order the
 * real page mounts them, carrying the real page's own copy — so a reviewer
 * can put a proposal beside the thing it proposes to replace and see exactly
 * what is being traded away.
 *
 * The composition below mirrors HomePage.tsx in gt-cloud
 * (apps/landing/src/components/pages/home/HomePage.tsx): hero, customers,
 * full stack, developers, locadex, context, global, deploy — hatch rules
 * between them, and the three fragment aliases published links point at.
 *
 * It follows that page rather than improving on it. Where a section here
 * still reads differently, that is drift to be closed, not a decision.
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
