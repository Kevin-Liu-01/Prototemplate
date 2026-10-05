'use client';

import { XCircleIcon } from '@heroicons/react/24/solid';
import type { ComponentProps } from 'react';

import { T } from '@/components/plate/shims/gt-next';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';
import InvalidConsentState from './InvalidConsentState';
import OAuthConsent from './OAuthConsent';

type ConsentPageProps = {
  /**
   * The verified authorization request, or null when it cannot be shown
   * (an invalid signature, an unknown client, scopes the client may not
   * hold).
   */
  request: ComponentProps<typeof OAuthConsent> | null;
  /** The session's network is not allowed in. */
  blocked?: boolean;
};

/**
 * The consent page (the dashboard's signin/consent/page.tsx). There a
 * server component verifies the signed query, looks the client up and
 * redirects a signed-out browser to the OAuth sign-in; here the outcome of
 * that work arrives as props and the page picks the face. The gallery's
 * frame supplies the field (scene 1, the Rosetta Stone picture), the mark and
 * the foot.
 */
export default function ConsentPage({
  request,
  blocked = false,
}: ConsentPageProps) {
  if (blocked) {
    return (
      <AuthFrame
        testId='oauth-ip-blocked'
        title={
          <span className='flex items-center gap-2'>
            <XCircleIcon
              aria-hidden='true'
              className='text-destructive size-6 shrink-0'
            />
            <T>Network access restricted</T>
          </span>
        }
        lede={
          <T>
            Your organization restricts dashboard access to trusted network
            locations. Connect from an allowed network and reload this page to
            continue authorization.
          </T>
        }
      />
    );
  }

  if (!request) return <InvalidConsentState />;

  return <OAuthConsent key={request.oauthQuery} {...request} />;
}
