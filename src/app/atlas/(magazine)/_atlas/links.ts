/** A path on this site, as opposed to a full URL or a protocol-relative one (//host/...). */
export function isLocalPath(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}
