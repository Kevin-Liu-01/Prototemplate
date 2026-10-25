'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import { ArrowRight } from 'lucide-react';

/* The horizon shader loads as its own chunk. Next lists a segment's
   not-found entry on every page of the segment, so a static import would
   ship the horizon field and gsap with every /d/production page; behind
   next/dynamic they load only when a 404 renders the band, and the server
   still renders the band's HTML. */
const NotFoundHorizon = dynamic(() => import('./NotFoundHorizon'));

/** Docs live off-concept: the real /docs route is fumadocs, so the control
    keeps the published absolute URL the rest of this shell uses. */
const DOCS = 'https://generaltranslation.com/docs';

/**
 * THE SHIPPED 404 BAND, reproduced.
 *
 * 1-1 with apps/landing/src/components/pages/not-found/NotFoundPage.tsx:
 * one fold, one object — the horizon fills the band, the apology sits inside
 * the hole, the filed code sits bottom-right. The copy is held back until the
 * shader blooms in (or the stand-in disc takes over), and the exits are the
 * engine's on-ink pair at the large gauge, re-inked by the sheet for whichever
 * ground the theme paints under them.
 *
 * The real page's own words, unchanged:
 *   h1  "Page not found"
 *   p   "This route drifted out of view. Head home or keep exploring the docs."
 *   CTA "Go Home" → /home          (the real route that serves the landing page)
 *   CTA "Read the Docs" → /docs    (fumadocs, kept as its published absolute URL)
 *
 * Destinations: "Go Home" goes to the /home alias under the current base, as
 * live's goes to /home; the mirror's /home renders the landing page.
 */
export default function NotFound() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  return (
    <main className='pnf-root'>
      <section className='pnf-hero'>
        <NotFoundHorizon />

        <div className='pnf-copy'>
          <h1>Page not found</h1>
          <p>
            This route drifted out of view. Head home or keep exploring the
            docs.
          </p>
          <div className='pnf-acts'>
            <a className='tc-btn tc-btn-onink tc-btn-lg' href={`${base}/home`}>
              Go Home
              <ArrowRight aria-hidden='true' size={16} />
            </a>
            <a
              className='tc-btn tc-btn-onink-line tc-btn-lg'
              href={DOCS}
              rel='noreferrer'
              target='_blank'
            >
              Read the Docs
            </a>
          </div>
        </div>

        <span className='pnf-code' aria-hidden='true'>
          404
        </span>
      </section>
    </main>
  );
}
