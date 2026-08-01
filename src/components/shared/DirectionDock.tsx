'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

/**
 * The direction pages' one piece of floating chrome: a back button in the
 * top-left corner, home to the index. The index links straight to
 * /d/<slug> so each prototype can be read on its own; this is the way out.
 * Hidden under ?chrome=0 (the presenter's iframes and every screenshot
 * pass), so captures stay clean. The old per-page switcher this component
 * used to be lives on in the presenter's unified dock.
 */
function BackButton() {
  const params = useSearchParams();
  if (params.get('chrome') === '0') return null;
  return (
    <Link className='dd-back' href='/' aria-label='Back to the index'>
      <svg viewBox='0 0 16 16' aria-hidden>
        <path d='M9.8 3.2 5 8l4.8 4.8' />
      </svg>
    </Link>
  );
}

export default function DirectionDock(_props: { slug: string }) {
  return (
    <Suspense fallback={null}>
      <BackButton />
    </Suspense>
  );
}
