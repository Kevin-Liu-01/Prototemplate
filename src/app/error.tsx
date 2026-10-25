'use client';

import './error.css';

type ErrorProps = { error: Error & { digest?: string }; reset: () => void };

/**
 * A route that failed while it rendered, under the root layout: the line
 * that says so, a reload (a chunk that failed after a deploy needs the new
 * document, which reset() would not fetch) and the way back to the gallery.
 */
export default function RouteError(_props: ErrorProps) {
  return (
    <main className='pt-error'>
      <h1>This page did not load</h1>
      <div className='pt-error-acts'>
        <button type='button' className='pt-ib' onClick={() => window.location.reload()}>
          Reload
        </button>
        <a className='pt-ib' href='/'>
          Back to the gallery
        </a>
      </div>
    </main>
  );
}
