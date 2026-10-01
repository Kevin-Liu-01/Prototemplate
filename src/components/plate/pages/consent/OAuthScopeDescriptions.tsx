import { T, useGT } from '@/components/plate/shims/gt-next';
import type { OAuthScope } from '@/components/plate/lib/oauthProviderConfig';
import { OAUTH_SCOPE_LABELS } from '@/components/plate/lib/oauthScopeLabels';
import DisclosureSummary from './DisclosureSummary';

type OAuthScopeDescriptionsProps = {
  scopes: OAuthScope[];
};

/**
 * "What these allow": a closed disclosure under a permission grid that
 * opens inline to one line per scope, its name then its description.
 * Scopes without a description (`gt:*`) are left out; renders nothing
 * when no scope has one. Each description carries the id
 * `oauth-scope-description-<scope>`, so a checkbox in the grid can name
 * it through aria-describedby. The dashboard reads the labels through
 * gt-next's useMessages; the shim's useGT returns the same strings.
 */
export default function OAuthScopeDescriptions({
  scopes,
}: OAuthScopeDescriptionsProps) {
  const m = useGT();
  const described = scopes.filter(
    (scope) => OAUTH_SCOPE_LABELS[scope].description
  );
  if (described.length === 0) return null;

  return (
    <details className='group' data-testid='oauth-scope-descriptions'>
      <DisclosureSummary>
        <T>What these allow</T>
      </DisclosureSummary>
      <dl className='flex flex-col gap-1 pt-2 text-[13px] leading-[1.45]'>
        {described.map((scope) => {
          const scopeLabel = OAUTH_SCOPE_LABELS[scope];
          return (
            <div key={scope}>
              <dt className='text-foreground inline font-medium'>
                {m(scopeLabel.label)}
              </dt>{' '}
              <dd
                id={`oauth-scope-description-${scope}`}
                className='text-muted-foreground inline'
              >
                {m(scopeLabel.description ?? '')}
              </dd>
            </div>
          );
        })}
      </dl>
    </details>
  );
}
