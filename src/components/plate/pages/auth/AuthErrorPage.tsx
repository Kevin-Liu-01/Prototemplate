'use client';

import { T } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { useFlow } from '@/components/plate/gallery/flow';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';

/**
 * The auth provider's error return (an expired or reused magic link, a
 * failed OAuth exchange): the auth plate with one way forward. The
 * dashboard's button is a route link to /signin; here it returns the
 * gallery to the sign-in state.
 */
export default function AuthErrorPage() {
  const flow = useFlow();
  return (
    <AuthFrame
      testId='auth-error'
      title={<T>Something went wrong</T>}
      lede={
        <T>
          We could not sign you in. The link may have expired or already been
          used. Start again and we will send a new one.
        </T>
      }
    >
      <Button
        type='button'
        className='w-full'
        onClick={() => flow.go('signin')}
      >
        <T>Back to Sign In</T>
      </Button>
    </AuthFrame>
  );
}
