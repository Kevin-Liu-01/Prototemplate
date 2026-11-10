/**
 * True when a request names this site as its origin: its Origin header
 * equals the origin of the address it was sent to. A browser sets Origin on
 * every POST and DELETE, so a page on another site fails, and so does a
 * request with no Origin header. A client that writes its own headers can
 * forge it, so this is a filter and never the only limit on a route.
 */
export function sameOrigin(request: { headers: { get(name: string): string | null }; nextUrl: { origin: string } }): boolean {
  return request.headers.get('origin') === request.nextUrl.origin;
}
