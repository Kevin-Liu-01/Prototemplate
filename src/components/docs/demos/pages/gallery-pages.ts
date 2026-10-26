/**
 * The pages the page gallery lists, grouped by kind. The production mirror
 * comes first: every static page under src/app/d/production, the routes
 * siteRoutes() in scripts/lib/site-pages.mjs walks and the Shipped rows of
 * src/lib/surfaces.ts hold, plus a post, a release, two legal documents and
 * the two pages the mirror renders for an address it does not hold. The
 * hub's own pages follow in the sidebar's order. A page with `still` has
 * the 640 by 360 capture pair scripts/build/thumbs.mjs cuts under
 * /shots/thumb (`<id>.webp`, `<id>-dark.webp`); a page without one shows
 * its path on a blank tile. A sign-in or onboarding page names the dev
 * state it opens on (src/components/plate/gallery/devStates.ts), and the
 * gallery's State control opens any other.
 */

export type GalleryPage = {
  /** unique in the list; the still's stem under /shots/thumb when `still` is set */
  id: string;
  name: string;
  /** the route, without a query */
  path: string;
  still?: boolean;
  /** the dev state the page opens on, for the five sign-in and onboarding pages */
  state?: string;
};

export type GalleryKind = {
  id: string;
  label: string;
  pages: readonly GalleryPage[];
};

const P = '/d/production';

export const GALLERY: readonly GalleryKind[] = [
  {
    id: 'home',
    label: 'Home',
    pages: [{ id: 'production', name: 'Home', path: P, still: true }],
  },
  {
    id: 'product',
    label: 'Product',
    pages: [
      { id: 'production-report-card', name: 'Report card', path: `${P}/report-card`, still: true },
      { id: 'production-supported-locales', name: 'Supported locales', path: `${P}/supported-locales`, still: true },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing',
    pages: [
      { id: 'production-pricing', name: 'Pricing', path: `${P}/pricing`, still: true },
      { id: 'production-pricing-usage', name: 'Usage rates', path: `${P}/pricing/usage`, still: true },
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    pages: [
      { id: 'production-enterprise', name: 'Enterprise', path: `${P}/enterprise`, still: true },
      { id: 'production-enterprise-contact', name: 'Enterprise contact', path: `${P}/enterprise/contact`, still: true },
      { id: 'production-enterprise-contact-yc', name: 'YC credits', path: `${P}/enterprise/contact/yc`, still: true },
      { id: 'production-enterprise-contact-mercury', name: 'Mercury credits', path: `${P}/enterprise/contact/mercury`, still: true },
      { id: 'production-enterprise-contact-slash', name: 'Slash credits', path: `${P}/enterprise/contact/slash`, still: true },
      { id: 'production-enterprise-contact-speedrun', name: 'Speedrun credits', path: `${P}/enterprise/contact/speedrun`, still: true },
      { id: 'production-enterprise-contact-a16z', name: 'a16z credits', path: `${P}/enterprise/contact/a16z`, still: true },
      { id: 'production-enterprise-contact-residency', name: 'Residency credits', path: `${P}/enterprise/contact/residency`, still: true },
      { id: 'production-enterprise-contact-rho', name: 'Rho credits', path: `${P}/enterprise/contact/rho`, still: true },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    pages: [
      { id: 'production-careers', name: 'Careers', path: `${P}/careers`, still: true },
      { id: 'production-contact', name: 'Contact', path: `${P}/contact`, still: true },
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    pages: [
      { id: 'production-blog', name: 'Blog', path: `${P}/blog`, still: true },
      { id: 'production-blog-post', name: 'Post', path: `${P}/blog/designing-docs-for-humans` },
      { id: 'production-blog-release', name: 'Release', path: `${P}/blog/gt-vue_v0_1_0` },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    pages: [
      { id: 'production-legal', name: 'Legal', path: `${P}/legal`, still: true },
      { id: 'production-legal-terms', name: 'Terms', path: `${P}/legal/terms` },
      { id: 'production-legal-privacy', name: 'Privacy policy', path: `${P}/legal/privacy-policy` },
    ],
  },
  {
    id: 'auth',
    label: 'Sign-in and onboarding',
    pages: [
      { id: 'production-signin', name: 'Sign in', path: `${P}/signin`, still: true, state: 'signin' },
      { id: 'production-onboarding', name: 'Onboarding', path: `${P}/onboarding`, still: true, state: 'survey' },
      { id: 'production-consent', name: 'Consent', path: `${P}/consent`, still: true, state: 'consent-trusted' },
      { id: 'production-device', name: 'Device code', path: `${P}/device`, still: true, state: 'device-code' },
      { id: 'production-cli', name: 'CLI', path: `${P}/cli`, still: true, state: 'cli-wizard' },
    ],
  },
  {
    id: 'errors',
    label: 'Errors',
    pages: [
      { id: 'production-404', name: 'Not found', path: `${P}/this-page-does-not-exist` },
      { id: 'production-blog-missing', name: 'Missing post', path: `${P}/blog/no-such-post` },
    ],
  },
  {
    id: 'hub',
    label: 'Hub',
    pages: [
      { id: 'gallery', name: 'Gallery', path: '/', still: true },
      { id: 'brand', name: 'Brand', path: '/brand', still: true },
      { id: 'docs', name: 'Docs', path: '/docs', still: true },
      { id: 'deck', name: 'Deck', path: '/deck', still: true },
      { id: 'press', name: 'Atlas', path: '/atlas', still: true },
      { id: 'present', name: 'Present', path: '/present', still: true },
      { id: 'compare', name: 'Compare', path: '/compare', still: true },
      { id: 'skills', name: 'Skills', path: '/skills', still: true },
      { id: 'handbook', name: 'Handbook', path: '/docs/handbook', still: true },
      { id: 'marks', name: 'Marks', path: '/marks', still: true },
      { id: 'blog', name: 'Blog', path: '/blog', still: true },
      { id: 'atlas', name: 'Atlas notes', path: '/atlas/notes', still: true },
      { id: 'graphics', name: 'Graphics', path: '/graphics', still: true },
      { id: 'motion', name: 'Motion', path: '/motion', still: true },
      { id: 'transcreate', name: 'Transcreate', path: '/transcreate', still: true },
    ],
  },
];

export const GALLERY_PAGES: readonly GalleryPage[] = GALLERY.flatMap((kind) => kind.pages);

/** The page with `id`, or the first page. */
export function galleryPage(id: string): GalleryPage {
  return GALLERY_PAGES.find((page) => page.id === id) ?? GALLERY_PAGES[0]!;
}

/** A production mirror page: its frame hides the direction corner with ?chrome=0. */
export function isMirror(page: GalleryPage): boolean {
  return page.path === P || page.path.startsWith(`${P}/`);
}

/** The light or dark still of a page, or null when it has none. */
export function stillOf(page: GalleryPage, theme: 'light' | 'dark'): string | null {
  return page.still ? `/shots/thumb/${page.id}${theme === 'dark' ? '-dark' : ''}.webp` : null;
}

/** The address the frame loads: the state for a sign-in page, and ?chrome=0 on a mirror page. */
export function frameAddress(page: GalleryPage, state: string | null): string {
  const query = new URLSearchParams();
  if (state) query.set('state', state);
  if (isMirror(page)) query.set('chrome', '0');
  const text = query.toString();
  return text ? `${page.path}?${text}` : page.path;
}

/** The address the Open Page link takes: the page with its state, and its corner. */
export function openAddress(page: GalleryPage, state: string | null): string {
  return state ? `${page.path}?state=${encodeURIComponent(state)}` : page.path;
}
