import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../_v0/V0Footer';
import V0Nav from '../_v0/V0Nav';

import NotFound from './sections/NotFound';

import '../toolchain/sections/logos-icons.css';
import '../toolchain/styles.css';
import '../_v0/v0-pages.css';
import './sections/not-found.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Shipped — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  robots: { index: false, follow: false },
};

/**
 * 404 — the shipped site's own not-found page, reproduced.
 *
 * This is Next's not-found convention, not a route: the real site is built
 * the same way — apps/landing/src/app/[locale]/[...missing]/page.tsx calls
 * notFound() and apps/landing/src/app/[locale]/not-found.tsx renders the
 * band — so a bad address under /d/production answers with HTTP 404, the
 * way the real one does, instead of a 200 that merely looks like a 404.
 *
 * The chrome matches the real file: the site header, the band, the site
 * footer. The real not-found.tsx mounts `<Header footer={false}>` +
 * NotFoundPage + SiteFooterMount — the same header and footer the home page
 * carries — and V0Nav / V0Footer are this control's reproductions of exactly
 * those two, so the concept's landing shell is reused rather than the
 * subpage TopNav/SiteFooter pair.
 *
 * The band is NOT railed: the real page's main is a bare
 * `.toolchain-root .not-found-root` with the horizon full-bleed inside it,
 * and only the footer sits in the ruled column (SiteFooterMount's own
 * `.tc-rail`). That split is reproduced here.
 */
export default function ProductionNotFound() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root' id='top'>
        <V0Nav />
        <NotFound />
        <div className='tc-rail'>
          <V0Footer />
        </div>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
