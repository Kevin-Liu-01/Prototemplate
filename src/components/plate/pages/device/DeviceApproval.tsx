'use client';

import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

import { T, Var, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { deviceApprove, deviceDeny } from '@/components/plate/lib/actions';
import { useFlow } from '@/components/plate/gallery/flow';
import type { OAuthScope } from '@/components/plate/lib/oauthProviderConfig';
import AuthorizationShell from '@/components/plate/pages/consent/AuthorizationShell';
import OAuthDetailRow from '@/components/plate/pages/consent/OAuthDetailRow';
import OAuthScopeList from '@/components/plate/pages/consent/OAuthScopeList';

type DeviceApprovalProps = {
  userCode: string;
  clientName: string;
  accountEmail: string;
  trusted: boolean;
  scopes: OAuthScope[];
};

/**
 * Approve/deny screen for a claimed device code. Unlike the redirect consent
 * screen, the requested scopes are fixed: the device already holds the code
 * and only learns the outcome when it next polls the token endpoint. The
 * result states keep the request details so the user can check the code.
 * Under sm their glyph sits above the heading's words, the phone pattern
 * the consent page's terminal state and the blocked state share. In the
 * gallery, Approve moves to the device-processed state (the code form after
 * the code is spent, which a reload of the real page shows); Deny shows
 * the denied face in place, as the dashboard does.
 */
export default function DeviceApproval({
  userCode,
  clientName,
  accountEmail,
  trusted,
  scopes,
}: DeviceApprovalProps) {
  const gt = useGT();
  const flow = useFlow();
  const [processing, setProcessing] = useState<'approve' | 'deny' | null>(null);
  const [outcome, setOutcome] = useState<'approved' | 'denied' | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Stored codes have no separator; the terminal shows them as XXXX-XXXX.
  // A caller that already carries the dash gets one separator, never two.
  const bareCode = userCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const displayCode = `${bareCode.slice(0, 4)}-${bareCode.slice(4)}`;

  async function respond(accept: boolean) {
    setProcessing(accept ? 'approve' : 'deny');
    setError(null);
    try {
      const result = accept
        ? await deviceApprove({ userCode })
        : await deviceDeny({ userCode });
      if (result.error) throw result.error;
      if (accept) {
        flow.go('device-processed');
        return;
      }
      setOutcome('denied');
    } catch {
      setError(
        gt('This request could not be completed. Run the login command again.')
      );
    } finally {
      setProcessing(null);
    }
  }

  const codeRow = (
    <OAuthDetailRow label={<T>Code</T>}>
      <span className='text-foreground font-mono font-medium tracking-[0.12em]'>
        {displayCode}
      </span>
    </OAuthDetailRow>
  );

  if (outcome === 'approved') {
    return (
      <AuthorizationShell
        clientName={clientName}
        accountEmail={accountEmail}
        trusted={trusted}
        testId='device-approved'
        title={
          <span className='flex items-center gap-2 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
            <CheckCircleIcon
              aria-hidden='true'
              className='text-status-success size-6 shrink-0'
            />
            <T>Device connected</T>
          </span>
        }
        lede={
          <T>
            <bdi>
              <Var>{clientName}</Var>
            </bdi>{' '}
            is now signed in as <Var>{accountEmail}</Var>. You can close this
            window and return to your terminal.
          </T>
        }
        detailRows={codeRow}
      />
    );
  }

  if (outcome === 'denied') {
    return (
      <AuthorizationShell
        clientName={clientName}
        accountEmail={accountEmail}
        trusted={trusted}
        testId='device-denied'
        title={
          <span className='flex items-center gap-2 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
            <XCircleIcon
              aria-hidden='true'
              className='text-muted-foreground size-6 shrink-0'
            />
            <T>Request denied</T>
          </span>
        }
        lede={<T>The device was not connected. You can close this window.</T>}
        detailRows={codeRow}
      />
    );
  }

  return (
    <AuthorizationShell
      clientName={clientName}
      accountEmail={accountEmail}
      trusted={trusted}
      title={
        <T>
          Connect{' '}
          <bdi>
            <Var>{clientName}</Var>
          </bdi>
        </T>
      }
      lede={
        <T>
          The device showing this code wants to sign in with your General
          Translation account.
        </T>
      }
      footnote={<T>Only approve if you started this from your own terminal.</T>}
      detailRows={codeRow}
    >
      <div className='flex flex-col gap-3'>
        <T>
          <h2 className='typo-key'>Permissions</h2>
        </T>
        <OAuthScopeList scopes={scopes} data-testid='device-scopes' />
      </div>

      <div className='flex flex-col gap-3'>
        {error && (
          <p className='typo-error' aria-live='polite'>
            {error}
          </p>
        )}
        <div className='flex gap-3'>
          <T>
            <Button
              type='button'
              variant='outline'
              className='h-11 flex-1'
              onClick={() => respond(false)}
              loading={processing === 'deny'}
              disabled={processing !== null}
              data-testid='deny-device'
            >
              Deny
            </Button>
            <Button
              type='button'
              className='h-11 flex-1'
              onClick={() => respond(true)}
              loading={processing === 'approve'}
              disabled={processing !== null}
              data-testid='approve-device'
            >
              Approve
            </Button>
          </T>
        </div>
      </div>
    </AuthorizationShell>
  );
}
