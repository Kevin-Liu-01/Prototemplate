// Copied from the dashboard's src/lib/oauthConsentRequest.ts. The Prisma
// types it read (the OauthClient row and Prisma.JsonValue) are the two local
// types below; the functions are unchanged.

/** The two columns of the OAuth client row the consent details read. */
type OAuthClientRecord = {
  clientId: string;
  clientDiscoveryId: string | null;
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function getOAuthConsentDetails(
  client: OAuthClientRecord,
  redirectUri: string
) {
  if (!URL.canParse(redirectUri)) return null;
  const callback = new URL(redirectUri);
  if (callback.username || callback.password || callback.hash) return null;
  const isWeb = callback.protocol === 'http:' || callback.protocol === 'https:';
  const isLoopback =
    isWeb && ['localhost', '127.0.0.1', '[::1]'].includes(callback.hostname);
  const metadataUrl =
    client.clientDiscoveryId === 'cimd' && URL.canParse(client.clientId)
      ? new URL(client.clientId)
      : null;

  return {
    metadataHostname:
      metadataUrl?.protocol === 'https:' ? metadataUrl.hostname : null,
    callbackHostname: callback.hostname || callback.protocol,
    callbackType: isLoopback
      ? ('local' as const)
      : isWeb
        ? ('web' as const)
        : ('app' as const),
    redirectUri,
  };
}

export function toOAuthSearchParams(
  parameters: Record<string, string | string[] | undefined>
): URLSearchParams {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    for (const item of Array.isArray(value)
      ? value
      : value !== undefined
        ? [value]
        : []) {
      query.append(key, item);
    }
  }
  return query;
}

export function getRequestedOAuthClaims(
  value: string | undefined
): string[] | null {
  if (value === undefined) return [];
  let claims: JsonValue;
  try {
    claims = JSON.parse(value);
  } catch {
    return null;
  }
  if (!claims || typeof claims !== 'object' || Array.isArray(claims))
    return null;
  const names = new Set<string>();
  for (const section of ['userinfo', 'id_token'] as const) {
    const requested = claims[section];
    if (requested === undefined) continue;
    if (!requested || typeof requested !== 'object' || Array.isArray(requested))
      return null;
    for (const name of Object.keys(requested)) names.add(name);
  }
  return [...names];
}
