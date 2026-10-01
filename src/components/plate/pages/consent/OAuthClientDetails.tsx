import type { ReactNode } from 'react';
import { CheckBadgeIcon, CommandLineIcon } from '@heroicons/react/16/solid';

import { T, useGT } from '@/components/plate/shims/gt-next';
import type { getOAuthConsentDetails } from '@/components/plate/lib/oauthConsentRequest';
import DisclosureSummary from './DisclosureSummary';
import OAuthDetailRow from './OAuthDetailRow';

type OAuthClientDetailsProps = {
  clientName: string;
  /** Absent for the device grant, which has no redirect URI. */
  clientDetails?: NonNullable<ReturnType<typeof getOAuthConsentDetails>>;
  accountEmail: string;
  /**
   * Client shipped by General Translation (see trustedOAuthClientIds): shown
   * as published instead of unverified, with a fixed permission set because
   * a partial grant to our own CLI only surfaces as 403s later.
   */
  trusted?: boolean;
  /** Extra `OAuthDetailRow`s appended after the built-in ones. */
  children?: ReactNode;
};

/**
 * The request-details ledger: who is asking for access (our CLI led by a
 * terminal glyph, another client by its initial), which account is
 * granting it, and where the browser goes afterwards. One hairline per
 * row, one line per fact where the value allows it. The metadata-domain
 * and returns-to rows render only when `clientDetails` is present; the
 * local-callback warning renders only for clients that are not trusted,
 * because the trusted footnote already carries that instruction.
 */
export default function OAuthClientDetails({
  clientName,
  clientDetails,
  accountEmail,
  trusted = false,
  children,
}: OAuthClientDetailsProps) {
  const gt = useGT();
  const metadataHostname = clientDetails?.metadataHostname ?? null;
  const clientInitial = [...clientName.trim()][0]?.toUpperCase() ?? '?';

  return (
    <dl className='ruled border-y border-(--hair)'>
      <OAuthDetailRow label={<T>Application</T>}>
        <div className='flex flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
            <p className='text-foreground flex items-center gap-2 font-medium break-words'>
              {trusted ? (
                <CommandLineIcon
                  aria-hidden='true'
                  className='text-foreground size-5 shrink-0'
                />
              ) : (
                <span
                  aria-hidden='true'
                  className='text-foreground flex size-5 shrink-0 items-center justify-center rounded-full border border-(--hair) text-[11px] leading-none font-medium select-none'
                >
                  {clientInitial}
                </span>
              )}
              <bdi>{clientName}</bdi>
            </p>
            {trusted && (
              <p
                className='text-muted-foreground flex items-center gap-1 text-[13px]'
                data-testid='oauth-trusted-client'
              >
                <CheckBadgeIcon
                  aria-hidden='true'
                  className='text-status-success size-4 shrink-0'
                />
                {gt('Published by General Translation')}
              </p>
            )}
          </div>
          {!trusted && !metadataHostname && (
            <T>
              <p className='text-muted-foreground text-[13px]'>
                Application name supplied by the developer. General Translation
                has not verified this application.
              </p>
            </T>
          )}
        </div>
      </OAuthDetailRow>

      {metadataHostname && (
        <OAuthDetailRow
          label={<T>Metadata domain</T>}
          data-testid='oauth-metadata-domain'
        >
          <span className='text-foreground font-medium break-all'>
            <bdi>{metadataHostname}</bdi>
          </span>
        </OAuthDetailRow>
      )}

      <OAuthDetailRow label={<T>Account</T>} data-testid='oauth-account'>
        <span className='text-foreground font-medium break-all'>
          <bdi>{accountEmail}</bdi>
        </span>
      </OAuthDetailRow>

      {clientDetails && (
        <OAuthDetailRow label={<T>Returns to</T>}>
          <div className='flex flex-col gap-1'>
            {/* The callback disclosure sits on the value's line while
                closed and takes the full row once open, so the address
                has the whole column to wrap in. */}
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
              <p className='text-foreground font-medium break-all'>
                {clientDetails.callbackType === 'local' ? (
                  gt('Local application on this device')
                ) : clientDetails.callbackType === 'app' ? (
                  gt('Application callback')
                ) : (
                  <bdi>{clientDetails.callbackHostname}</bdi>
                )}
              </p>
              {clientDetails.callbackType === 'local' && (
                <p className='text-muted-foreground text-[13px] break-all'>
                  <bdi>{clientDetails.callbackHostname}</bdi>
                </p>
              )}
              <details
                className='group min-w-0 open:basis-full'
                data-testid='oauth-callback-details'
              >
                <DisclosureSummary>
                  <T>Show callback address</T>
                </DisclosureSummary>
                <p
                  className='typo-code pt-1 break-all'
                  data-testid='oauth-callback-address'
                >
                  <bdi>{clientDetails.redirectUri}</bdi>
                </p>
              </details>
            </div>
            {clientDetails.callbackType === 'local' && !trusted && (
              <T>
                <p className='text-muted-foreground text-[13px]'>
                  Continue only if you started this connection in an application
                  on this device.
                </p>
              </T>
            )}
          </div>
        </OAuthDetailRow>
      )}

      {children}
    </dl>
  );
}
