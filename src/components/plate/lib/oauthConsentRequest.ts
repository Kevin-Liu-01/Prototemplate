// Copied from the dashboard's src/lib/oauthConsentRequest.ts. The Prisma
// row it read (OauthClient) is the local type below; the consent details
// function is unchanged, and the request parsers no page calls are left out.

/** The two columns of the OAuth client row the consent details read. */
type OAuthClientRecord = {
  clientId: string;
  clientDiscoveryId: string | null;
};

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
