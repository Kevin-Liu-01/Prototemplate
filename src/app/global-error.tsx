'use client';

import { fontVariables } from '@/lib/fonts';

import './globals.css';
import './inter-subsets.css';
import '@/components/viewer/tokens.css';
import './error.css';

type ErrorProps = { error: Error & { digest?: string }; reset: () => void };

/**
 * The root layout itself failed, so this page brings its own html and body
 * and its own stylesheets: the same line and reload as error.tsx, on the
 * dark ground the site opens on.
 */
export default function GlobalError(_props: ErrorProps) {
  return (
    <html lang='en' className={fontVariables} data-theme='dark'>
      <body>
        <main className='pt-error'>
          <h1>This page did not load</h1>
          <div className='pt-error-acts'>
            <button type='button' className='pt-ib' onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
