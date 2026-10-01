'use client';

import { useRef, useState } from 'react';

import { useFlow } from '@/components/plate/gallery/flow';
import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import { STUB_LATENCY_MS } from '@/components/plate/lib/actions';
import { T, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';

type PlateSignOutProps = {
  /** The signed-in account, named in the control's title and accessible name. */
  accountEmail?: string | null;
};

/**
 * The dashboard's OnboardingSignOut on the gallery: the same quiet text
 * control in the caption ink that names the account on hover. The
 * dashboard signs out and loads the sign-in page; here the button shows
 * its pending face for the stubs' latency and then turns the gallery to
 * the sign-in state through the flow.
 */
export default function PlateSignOut({ accountEmail }: PlateSignOutProps) {
  const gt = useGT();
  const { go } = useFlow();
  const [signingOut, setSigningOut] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    timer.current = window.setTimeout(() => {
      setSigningOut(false);
      go('signin');
    }, STUB_LATENCY_MS);
  }

  const account = accountEmail
    ? gt('Signed in as {email}', { email: accountEmail })
    : undefined;

  return (
    <Button
      type='button'
      variant='link'
      className='hover:text-foreground h-auto p-0 text-[13px] font-normal text-(--titanium) no-underline underline-offset-4 hover:underline'
      loading={signingOut}
      onClick={handleSignOut}
      title={account}
      aria-label={
        accountEmail
          ? gt('Sign out of {email}', { email: accountEmail })
          : undefined
      }
    >
      <T>Sign out</T>
    </Button>
  );
}
