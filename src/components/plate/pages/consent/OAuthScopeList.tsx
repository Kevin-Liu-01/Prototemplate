import { CheckCircleIcon } from '@heroicons/react/16/solid';

import { useGT } from '@/components/plate/shims/gt-next';
import {
  THIRD_PARTY_OAUTH_PERMISSION_KEYS,
  WILDCARD_TOKEN_SCOPE,
  type OAuthScope,
} from '@/components/plate/lib/oauthProviderConfig';
import { OAUTH_SCOPE_LABELS } from '@/components/plate/lib/oauthScopeLabels';
import OAuthScopeDescriptions from './OAuthScopeDescriptions';

type OAuthScopeListProps = {
  scopes: OAuthScope[];
  'data-testid'?: string;
};

const permissionScopes = new Set<string>(THIRD_PARTY_OAUTH_PERMISSION_KEYS);

/**
 * Read-only permission list for grants whose scopes cannot be narrowed: one
 * line per scope name, each led by a small check in the success hue, then
 * the descriptions disclosure. When the list carries `gt:*`, the permission
 * scopes it satisfies (tokenHasScope) stay out of the visible lines and
 * appear only in the disclosure; openid, profile and offline_access are not
 * permissions and stay visible. The dashboard reads the labels through
 * gt-next's useMessages; the shim's useGT returns the same strings.
 */
export default function OAuthScopeList({
  scopes,
  'data-testid': testId,
}: OAuthScopeListProps) {
  const m = useGT();
  const visible = scopes.includes(WILDCARD_TOKEN_SCOPE)
    ? scopes.filter((scope) => !permissionScopes.has(scope))
    : scopes;

  return (
    <div className='flex flex-col gap-2'>
      <ul className='flex flex-col gap-1' data-testid={testId}>
        {visible.map((scope) => (
          <li key={scope} className='flex items-start gap-1.5'>
            <CheckCircleIcon
              aria-hidden='true'
              className='text-status-success mt-0.5 size-4 shrink-0'
            />
            <span className='text-foreground text-sm font-medium'>
              {m(OAUTH_SCOPE_LABELS[scope].label)}
            </span>
          </li>
        ))}
      </ul>
      <OAuthScopeDescriptions scopes={scopes} />
    </div>
  );
}
