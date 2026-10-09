/**
 * The site paths next.config.ts rewrites to a static document outside the
 * app router: /deck serves public/brand-deck.html. A router navigation or
 * prefetch there fetches the whole document as a page payload, finds HTML
 * and loads it again, so a link to one of these paths loads it as a plain
 * document and nothing prefetches it.
 */
const DOCUMENT_PATHS: readonly string[] = ['/deck'];

/** True for an href whose path is a static document; a hash or a query may follow (/deck#12). */
export function isDocumentHref(href: string): boolean {
  return DOCUMENT_PATHS.includes(href.split(/[?#]/, 1)[0]);
}

/** Opens a site href: a static document as a page load, any other route through the app router. */
export function openSiteHref(router: { push: (href: string) => void }, href: string): void {
  if (isDocumentHref(href)) window.location.assign(href);
  else router.push(href);
}
