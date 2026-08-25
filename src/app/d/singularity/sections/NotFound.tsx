'use client';

import { usePathname } from 'next/navigation';

import { ArrowRight } from 'lucide-react';

import NotFoundHorizon from './NotFoundHorizon';

/**
 * The 404 band. One fold, one object: the horizon fills the band and the
 * apology sits inside the hole, so the page that has nothing to show shows
 * the brand's own singularity instead. The copy is held back until the
 * shader blooms in (or the stand-in disc takes over), and the pair of exits
 * is the engine's on-ink button set, re-inked by the sheet for whichever
 * ground the theme paints under them.
 *
 * Concept-agnostic: both exits resolve against the CURRENT concept's base,
 * the way TopNav does, so /d/<concept>/... never leaks across finals.
 */
export default function NotFound() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';

  return (
    <section className='tc-sec tcnf-hero'>
      <NotFoundHorizon />

      <div className='tcnf-copy'>
        <h1>Page not found.</h1>
        <p>This route drifted out of view. Head home or keep exploring the blog.</p>
        <div className='tcnf-acts'>
          <a className='tc-btn tc-btn-onink' href={base}>
            Go home
            <ArrowRight aria-hidden='true' size={16} />
          </a>
          <a className='tc-btn tc-btn-onink-line' href={`${base}/blog`}>
            Read the blog
          </a>
        </div>
      </div>

      <span className='tcnf-code' aria-hidden='true'>
        404
      </span>
    </section>
  );
}
