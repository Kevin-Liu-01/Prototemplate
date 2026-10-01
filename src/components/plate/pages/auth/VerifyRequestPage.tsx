'use client';

import { T } from '@/components/plate/shims/gt-next';
import { useFlow } from '@/components/plate/gallery/flow';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';

/**
 * Shown after a magic link is sent: the same ground and plate as the other
 * auth screens, the instruction as the lede, and a text link back to sign
 * in for a mistyped address. The dashboard's link is a route link to
 * /signin; the gallery has no such route, so the same words are a button
 * in the link's dress that returns to the sign-in state.
 */
export default function VerifyRequestPage() {
  const flow = useFlow();
  return (
    <AuthFrame
      testId='verify-request'
      title={<T>Check your email</T>}
      lede={
        <T>
          We sent a sign-in link to your email address. Open it to finish
          signing in. The link works once and expires in 15 minutes.
        </T>
      }
      footnote={
        <T>
          Wrong address, or no email after a minute?{' '}
          <button
            type='button'
            onClick={() => flow.go('signin')}
            className='text-foreground cursor-pointer underline underline-offset-4 max-md:inline-flex max-md:min-h-11 max-md:items-center'
          >
            Try again
          </button>
          .
        </T>
      }
    />
  );
}
