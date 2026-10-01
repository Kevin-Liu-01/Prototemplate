// Copied from the dashboard's src/lib/oauthProviderConfig.ts. The constants
// it imported from @generaltranslation/node are declared here with the same
// values, so the consent and device pages read the same scope list. The
// provider options builder (getOAuthProviderOptions) is left out: it
// configures the auth server and no page calls it.

/** The first-party scope that stands for the account's whole dashboard access. */
export const WILDCARD_TOKEN_SCOPE = 'gt:*';

/** The client id of the gt CLI, the one trusted client. */
export const GT_CLI_OAUTH_CLIENT_ID = 'gt-cli';

/** The permissions a third-party client may ask for, in the order shown. */
export const THIRD_PARTY_OAUTH_PERMISSION_KEYS = [
  'org:projects:create',
  'project:api_keys:write',
  'project:write',
  'project:context:read',
  'project:context:write',
  'project:files:read',
  'project:files:write',
  'project:translations:generate',
  'project:translations:enqueue',
] as const;

/**
 * Scopes a dynamically registered client may hold. Excludes `gt:*`: only the
 * seeded first-party client rows carry it.
 */
const dynamicClientScopes = [
  'openid',
  'profile',
  'offline_access',
  ...THIRD_PARTY_OAUTH_PERMISSION_KEYS,
] as const;

export const oauthScopes = [
  ...dynamicClientScopes,
  WILDCARD_TOKEN_SCOPE,
] as const;

export type OAuthScope = (typeof oauthScopes)[number];

/**
 * Clients General Translation ships. Cached by the provider and immutable
 * through the client CRUD endpoints; the consent page shows them as verified
 * with a fixed permission set instead of the third-party warning.
 */
export const trustedOAuthClientIds = new Set([GT_CLI_OAUTH_CLIENT_ID]);

const oauthScopeSet = new Set<string>(oauthScopes);

export function parseOAuthScopes(scope: string): OAuthScope[] | null {
  const requestedScopes = scope.split(' ').filter(Boolean);
  if (
    requestedScopes.length === 0 ||
    requestedScopes.some((requestedScope) => !oauthScopeSet.has(requestedScope))
  ) {
    return null;
  }

  return requestedScopes as OAuthScope[];
}
