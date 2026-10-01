'use client';

import { Fragment, useState, type ComponentProps } from 'react';

import { T, Var, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { Checkbox } from '@/components/plate/ui/checkbox';
import { cn } from '@/components/plate/lib/utils';
import { oauth2Consent } from '@/components/plate/lib/actions';
import type { OAuthScope } from '@/components/plate/lib/oauthProviderConfig';
import { OAUTH_SCOPE_LABELS } from '@/components/plate/lib/oauthScopeLabels';
import AuthorizationShell from './AuthorizationShell';
import type OAuthClientDetails from './OAuthClientDetails';
import OAuthDetailRow from './OAuthDetailRow';
import OAuthScopeDescriptions from './OAuthScopeDescriptions';
import OAuthScopeList from './OAuthScopeList';

type OAuthConsentProps = Omit<
  ComponentProps<typeof OAuthClientDetails>,
  'children'
> & {
  clientDetails: NonNullable<
    ComponentProps<typeof OAuthClientDetails>['clientDetails']
  >;
  scopes: OAuthScope[];
  requestedClaims?: string[];
  oauthQuery: string;
  navigate?: (url: string) => void;
};

// The dashboard follows the consent response's url to the client's
// callback, leaving this page. The gallery has nowhere to go, so by default
// the page stays and the pending face is the whole outcome.
const stay = () => {};

/**
 * Redirect-flow consent: the user may narrow the requested scopes (fixed for
 * trusted clients), then `oauth2.consent` returns the URL to follow. The
 * requested identity claims render as one ledger row; the scopes render as
 * a two-column grid of names with their descriptions in a disclosure. The
 * dashboard reads the scope labels through gt-next's useMessages; the
 * shim's useGT returns the same strings.
 */
export default function OAuthConsent({
  clientName,
  clientDetails,
  accountEmail,
  trusted = false,
  scopes,
  requestedClaims = [],
  oauthQuery,
  navigate = stay,
}: OAuthConsentProps) {
  const gt = useGT();
  const m = useGT();
  const claimLabels: Record<string, string> = {
    sub: gt('Account ID'),
    name: gt('Full name'),
    picture: gt('Profile picture'),
    given_name: gt('Given name'),
    family_name: gt('Family name'),
    email: gt('Email address'),
    email_verified: gt('Email verification status'),
    acr: gt('Authentication assurance level'),
    auth_time: gt('Time of authentication'),
  };
  const [selectedScopes, setSelectedScopes] = useState(scopes);
  const [processing, setProcessing] = useState<'approve' | 'deny' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasBroadAccess = scopes.some(
    (scope) => scope.startsWith('project:') || scope.startsWith('org:')
  );

  async function respond(accept: boolean) {
    if (accept && selectedScopes.length === 0) return;
    setProcessing(accept ? 'approve' : 'deny');
    setError(null);

    try {
      const result = await oauth2Consent({
        accept,
        scope: (accept
          ? scopes.filter((scope) => selectedScopes.includes(scope))
          : scopes
        ).join(' '),
        oauth_query: oauthQuery,
      });

      if (result.error) {
        setError(gt('This authorization request could not be completed.'));
        return;
      }

      // The real response always carries the callback url; the stub may
      // not, and the gallery reads a missing url as "stay".
      const url = result.data?.url;
      if (url) navigate(url);
    } catch {
      setError(gt('This authorization request could not be completed.'));
    } finally {
      setProcessing(null);
    }
  }

  return (
    <AuthorizationShell
      clientName={clientName}
      clientDetails={clientDetails}
      accountEmail={accountEmail}
      trusted={trusted}
      title={
        <T>
          Authorize{' '}
          <bdi>
            <Var>{clientName}</Var>
          </bdi>
        </T>
      }
      lede={
        trusted ? (
          <T>
            Sign in to this application with your General Translation account.
          </T>
        ) : hasBroadAccess ? (
          <T>
            Choose what this application can do with your account. Approved
            access is not limited to a single project.
          </T>
        ) : (
          <T>Choose what this application can do with your account.</T>
        )
      }
      footnote={
        trusted ? (
          <T>
            Only approve if you started this sign-in yourself, for example by
            running a command in your terminal.
          </T>
        ) : (
          <T>
            Only approve applications you recognize and trust. Features that
            need permissions you leave unchecked will be unavailable.
          </T>
        )
      }
      detailRows={
        <>
          {requestedClaims.length > 0 && (
            <OAuthDetailRow
              label={<T>Identity</T>}
              data-testid='oauth-requested-claims'
            >
              <span className='text-foreground font-medium'>
                {requestedClaims.map((claim, index) => (
                  <Fragment key={claim}>
                    {index > 0 && ', '}
                    {Object.hasOwn(claimLabels, claim)
                      ? claimLabels[claim]
                      : claim}
                  </Fragment>
                ))}
              </span>
            </OAuthDetailRow>
          )}
          <OAuthDetailRow label={<T>Permissions</T>}>
            {trusted ? (
              <OAuthScopeList scopes={scopes} data-testid='oauth-scopes' />
            ) : (
              <div className='flex flex-col gap-2'>
                <ul className='flex flex-col gap-1' data-testid='oauth-scopes'>
                  {scopes.map((scope) => {
                    const scopeLabel = OAUTH_SCOPE_LABELS[scope];
                    const required = scope === 'openid';
                    const disabled = required || processing !== null;
                    return (
                      <li key={scope}>
                        {/* The label is the tap target; under md it is 44px
                            tall with the box centred on its line. */}
                        <label
                          htmlFor={`oauth-scope-${scope}`}
                          className={cn(
                            'flex items-start gap-1.5 max-md:min-h-11 max-md:items-center',
                            disabled ? 'cursor-default' : 'cursor-pointer'
                          )}
                        >
                          <Checkbox
                            id={`oauth-scope-${scope}`}
                            data-testid={`oauth-scope-${scope}`}
                            aria-describedby={
                              scopeLabel.description
                                ? `oauth-scope-description-${scope}`
                                : undefined
                            }
                            className='mt-0.5 max-md:mt-0'
                            checked={selectedScopes.includes(scope)}
                            disabled={disabled}
                            onCheckedChange={(checked) =>
                              setSelectedScopes((selected) =>
                                checked === true
                                  ? [...selected, scope]
                                  : selected.filter((item) => item !== scope)
                              )
                            }
                          />
                          <span className='text-foreground text-sm font-medium'>
                            {m(scopeLabel.label)}
                            {required && (
                              <span className='text-muted-foreground font-normal'>
                                {' '}
                                ({gt('Required')})
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <OAuthScopeDescriptions scopes={scopes} />
              </div>
            )}
          </OAuthDetailRow>
        </>
      }
    >
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
              data-testid='deny-oauth-consent'
            >
              Deny
            </Button>
            <Button
              type='button'
              className='h-11 flex-1'
              onClick={() => respond(true)}
              loading={processing === 'approve'}
              disabled={processing !== null || selectedScopes.length === 0}
              data-testid='approve-oauth-consent'
            >
              Approve
            </Button>
          </T>
        </div>
      </div>
    </AuthorizationShell>
  );
}
