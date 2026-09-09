import { LIBRARIES } from '@/app/craft/libraries';
import { DOCS } from '@/app/docs/registry';
import { ARCHIVE, archiveDesc } from '@/lib/archive';
import { DIRECTIONS } from '@/lib/directions';
import type { ShellShot } from '@/lib/shell-data';

/**
 * The one registry behind the index panel. Two sets: `site` is every place
 * on this site, assembled from the same registries the pages render from;
 * `public` is every public place the brand is live, carried over from the
 * deck's surfaces panel as data. Pure data; the panel filters it client-side
 * and navigates internal hrefs with the router, external ones in a new tab.
 *
 * Thumbnails: `shot` and `shotDark` are public paths, and this registry is
 * the preview layer's only image source (directive 8.6), so every path here
 * is a thumbnail: direction, shipped page and archive rows point at the
 * 640x360 cuts scripts/build-thumbs.mjs writes under /shots/thumb/<id>.jpg
 * and <id>-dark.jpg (archive-<slug>.jpg for the archive), document and
 * brand rows at the route captures in the same folder. The 1440 exhibit
 * captures under /shots/light, /shots/dark and /shots/archive stay for the
 * exhibit sheet and the grid, which read the routes' own ShellItem.shot.
 * Public rows point into /shots/deck, the deck's own thumbnails, which
 * scripts/build-deck.mjs copies from deck/shots/thumb; the three page rows
 * with no route capture of their own (the gallery, the deck, the compare
 * rig) borrow the deck's captures of those pages from the same folder, so
 * every row that has a picture anywhere resolves one. A row without a shot
 * renders the blank plate with its initial. surfaceShot(id) is what the
 * preview layer reads.
 *
 * The site groups run in the one sidebar order every route keeps (Pages,
 * Shipped, Documents, Sites, Explorations, Archive); Libraries and Brand
 * sections follow as panel-only groups. Shipped (directive 8.10) holds the
 * direction that shipped and its pages: /d/production and every concrete
 * page.tsx under src/app/d/production, then the live surfaces of the
 * shipped site as external rows. Sites holds the three full site concepts
 * only. A row that belongs to one of the four sites names it in `site`, so
 * a list can color its icon on the matching --pt-site-* token.
 */
export type SurfaceSet = 'site' | 'public';

export const SITE_GROUPS = [
  'Pages',
  'Shipped',
  'Documents',
  'Sites',
  'Explorations',
  'Archive',
  'Libraries',
  'Brand sections',
] as const;

export const PUBLIC_GROUPS = [
  'Live product',
  'Editorial',
  'Social and community',
  'Prototemplate',
  'Glyphfield',
  'Assets',
] as const;

export type SiteGroup = (typeof SITE_GROUPS)[number];
export type PublicGroup = (typeof PUBLIC_GROUPS)[number];
export type SurfaceGroup = SiteGroup | PublicGroup;

/** The four sites a row can belong to; each has a color token in tokens.css (--pt-site-<site>). */
export type SurfaceSite = 'dossier' | 'orbit' | 'signal' | 'shipped';

export type Surface = {
  /** unique across both sets; also the thumbnail file stem */
  id: string;
  name: string;
  href: string;
  /** the address shown under the name: host and path for external surfaces, the path for internal routes */
  host: string;
  desc: string;
  shot?: string;
  shotDark?: string;
  group: SurfaceGroup;
  set: SurfaceSet;
  /** the site a row belongs to, when it does: the three site concepts, and every Shipped row */
  site?: SurfaceSite;
};

/** `the chroma wash` becomes `The chroma wash.` */
function sentence(fragment: string): string {
  const trimmed = fragment.trim();
  const capped = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

function internal(
  id: string,
  name: string,
  href: string,
  desc: string,
  group: SiteGroup,
  shots?: { shot: string; shotDark?: string }
): Surface {
  return { id, name, href, host: href, desc, group, set: 'site', ...shots };
}

const THUMBS = '/shots/thumb';

/** The deck's own captures, copied by scripts/build-deck.mjs; the Pages rows without a route capture borrow theirs. */
const DECK_SHOTS = '/shots/deck';

/** The light and dark route captures for a thumbnail stem under /shots/thumb. */
function thumb(stem: string): { shot: string; shotDark: string } {
  return { shot: `${THUMBS}/${stem}.jpg`, shotDark: `${THUMBS}/${stem}-dark.jpg` };
}

const PAGES: readonly Surface[] = [
  internal('gallery', 'Gallery', '/', `The gallery of ${DIRECTIONS.length} directions.`, 'Pages', {
    shot: `${DECK_SHOTS}/proto-gallery.jpg`,
  }),
  internal('brand', 'Brand', '/brand', 'The identity canon in ten sections.', 'Pages', thumb('brand-the-name')),
  internal('docs', 'Docs', '/docs', 'The repository documents, read in the browser.', 'Pages', thumb('docs-readme')),
  internal('deck', 'Deck', '/deck', 'The GT brand deck, its own viewer.', 'Pages', {
    shot: `${DECK_SHOTS}/proto-deck.jpg`,
  }),
  internal('present', 'Presenter', '/present', 'The separate presentation of the redesign.', 'Pages', {
    shot: `${THUMBS}/present-intro.jpg`,
  }),
  internal('compare', 'Compare', '/compare', 'Two directions side by side in synced frames.', 'Pages', {
    shot: `${DECK_SHOTS}/proto-compare.jpg`,
  }),
];

const DOCUMENTS: readonly Surface[] = [
  internal('docs-readme', 'Readme', '/docs', 'The repository readme.', 'Documents', thumb('docs-readme')),
  ...DOCS.map((doc) =>
    internal(`docs-${doc.slug}`, doc.title, `/docs/${doc.slug}`, doc.blurb, 'Documents', thumb(`docs-${doc.slug}`))
  ),
];

/** The three full site concepts; the shipped reference has its own group. */
const SITE_DIRECTIONS = DIRECTIONS.filter((d) => d.site && !d.reference);
const SHIPPED_DIRECTION = DIRECTIONS.find((d) => d.reference);
const EXPLORATION_DIRECTIONS = DIRECTIONS.filter((d) => !d.site);

/** Which site a direction slug is: the concept's slug names its site token. */
const SITE_OF_SLUG: Readonly<Record<string, SurfaceSite>> = {
  'singularity-dossier': 'dossier',
  'singularity-orbit': 'orbit',
  'singularity-signal': 'signal',
  production: 'shipped',
};

/** The light and dark thumbnails of a direction or a shipped page, cut by scripts/build-thumbs.mjs from the 1440 captures. */
function directionShots(stem: string): { shot: string; shotDark: string } {
  return thumb(stem);
}

const SITES: readonly Surface[] = SITE_DIRECTIONS.flatMap((d) => {
  const site = SITE_OF_SLUG[d.slug];
  return [
    { ...internal(d.slug, d.name, `/d/${d.slug}`, d.concept, 'Sites', directionShots(d.slug)), site },
    {
      ...internal(
        `${d.slug}-enterprise`,
        `${d.name} enterprise`,
        `/d/${d.slug}/enterprise`,
        `The enterprise page of ${d.name}.`,
        'Sites',
        directionShots(`${d.slug}-enterprise`)
      ),
      site,
    },
  ];
});

/**
 * The pages of the shipped direction under /d/production (directive 8.10):
 * every concrete page.tsx under src/app/d/production, as [path, name,
 * description]. The dynamic segments (blog/[slug], legal/[route], the
 * catch-all) are not pages of their own and are left out. Home comes
 * first; the rest run in the order the live site's navigation reads them.
 */
const SHIPPED_PAGES: readonly (readonly [string, string, string])[] = [
  ['/enterprise', 'Enterprise', 'The enterprise page of the shipped site.'],
  ['/try', 'Report card', 'The interactive localization report card.'],
  ['/pricing', 'Pricing', 'Plans and the comparison table.'],
  ['/pricing/usage', 'Usage rates', 'The per-word rates behind the plans.'],
  ['/careers', 'Careers', 'Open roles and the mission.'],
  ['/blog', 'Blog', 'Essays, devlogs and the changelog.'],
  ['/mintlify', 'Mintlify', 'Automated translation for Mintlify documentation.'],
  ['/supported-locales', 'Supported locales', 'The catalog of supported locales.'],
  ['/contact', 'Contact', 'The contact form.'],
  ['/enterprise/contact', 'Enterprise contact', 'The enterprise contact desk.'],
  ['/enterprise/contact/yc', 'YC deal', 'The Y Combinator claim desk.'],
  ['/yc', 'Y Combinator', 'The Y Combinator offer.'],
  ['/signin', 'Sign in', 'The sign in page.'],
  ['/legal', 'Legal', 'The legal resources ledger.'],
];

/** `/enterprise/contact/yc` becomes `enterprise-contact-yc`. */
function pathStem(path: string): string {
  return path.replace(/^\//, '').replace(/\//g, '-');
}

const SHIPPED_HOME: readonly Surface[] = SHIPPED_DIRECTION
  ? [
      {
        ...internal(
          SHIPPED_DIRECTION.slug,
          'Home',
          `/d/${SHIPPED_DIRECTION.slug}`,
          `${SHIPPED_DIRECTION.concept} Live at generaltranslation.com.`,
          'Shipped',
          directionShots(SHIPPED_DIRECTION.slug)
        ),
        site: 'shipped',
      },
    ]
  : [];

const SHIPPED_ROUTES: readonly Surface[] = SHIPPED_PAGES.map(([path, name, desc]) => {
  const stem = `production-${pathStem(path)}`;
  /* only the home and the enterprise page have captures under /shots today */
  const shots = path === '/enterprise' ? directionShots(stem) : undefined;
  return { ...internal(stem, name, `/d/production${path}`, desc, 'Shipped', shots), site: 'shipped' };
});

const LIVE_HOST = 'generaltranslation.com';
const LIVE_THUMBS = '/shots/deck';

/** A live surface of the shipped site: an external row in the site set, with the deck's capture of it. */
function live(id: string, name: string, path: string, desc: string, shot?: string, shotDark?: string): Surface {
  const host = `${LIVE_HOST}${path}`;
  return {
    id,
    name,
    href: `https://${host}`,
    host,
    desc,
    group: 'Shipped',
    set: 'site',
    site: 'shipped',
    ...(shot ? { shot: `${LIVE_THUMBS}/${shot}` } : {}),
    ...(shotDark ? { shotDark: `${LIVE_THUMBS}/${shotDark}` } : {}),
  };
}

/** The live surfaces of the shipped site (directive 8.10), in the order Kevin listed them. */
const SHIPPED_LIVE: readonly Surface[] = [
  live('live-home', 'generaltranslation.com', '', 'The live site.', 'gt-home-light.jpg', 'gt-home-dark.jpg'),
  live('live-pricing', 'Pricing, live', '/pricing', 'The live pricing page.', 'gt-pricing.jpg', 'gt-pricing-dark.jpg'),
  live(
    'live-enterprise',
    'Enterprise, live',
    '/enterprise',
    'The live enterprise page.',
    'gt-enterprise.jpg',
    'gt-enterprise-dark.jpg'
  ),
  live('live-careers', 'Careers, live', '/careers', 'The live careers page.', 'gt-careers.jpg', 'gt-careers-dark.jpg'),
  live('live-docs', 'Docs, live', '/docs', 'The live documentation.', 'gt-docs.jpg', 'gt-docs-dark.jpg'),
  live('live-blog', 'Blog, live', '/blog', 'The live blog and changelog.', 'gt-blog.jpg'),
  live(
    'live-report-card',
    'Report card, live',
    '/report-card',
    'The live localization report card.',
    'gt-report-card.jpg',
    'gt-report-card-dark.jpg'
  ),
  {
    id: 'live-dash',
    name: 'Dashboard, live',
    href: 'https://dash.generaltranslation.com',
    host: 'dash.generaltranslation.com',
    desc: 'The signed-in product.',
    group: 'Shipped',
    set: 'site',
    site: 'shipped',
    shot: `${LIVE_THUMBS}/gt-dash.jpg`,
  },
];

/** The Shipped group: the home, its pages, then the live surfaces. */
const SHIPPED: readonly Surface[] = [...SHIPPED_HOME, ...SHIPPED_ROUTES, ...SHIPPED_LIVE];

const EXPLORATIONS: readonly Surface[] = EXPLORATION_DIRECTIONS.map((d) =>
  internal(d.slug, d.name, `/d/${d.slug}`, d.concept, 'Explorations', directionShots(d.slug))
);

const LIBRARY_ROWS: readonly Surface[] = LIBRARIES.map((lib) =>
  internal(`lib-${lib.name}`, lib.name, `/docs#${lib.name}`, sentence(lib.role), 'Libraries')
);

const BRAND_SECTIONS: readonly Surface[] = [
  ['the-name', 'The name', 'The company name, the GT short form, and Locadex.'],
  ['the-idea', 'The idea', 'Every product in every language: the mission and the positioning.'],
  ['the-character', 'The character', 'The personality, the voice, and the attribute scales.'],
  ['the-mark', 'The mark', 'The GT monogram: doubled-line construction, one ink, and the rules for its use.'],
  ['color', 'Color', 'Four absolute colors, alpha steps for structure, one spectral accent per page.'],
  ['type', 'Type', 'Switzer and Inter, and the multilingual requirements for headlines and UI.'],
  [
    'language-as-material',
    'Language as material',
    'Glyphs as the signature device: the reassembler, the locale chips, and the flag prints.',
  ],
  [
    'the-completed-reference',
    'The completed reference',
    'The Dossier as the finished application of the system.',
  ],
  [
    'made-with-the-system',
    'Made with the system',
    'Finished artwork produced with the toolchain and the glyphfield studio.',
  ],
  [
    'context-for-partners',
    'Context for partners',
    'The industry, the audience, and the visual references for partners.',
  ],
].map(([anchor, name, desc]) =>
  internal(`brand-${anchor}`, name, `/brand#${anchor}`, desc, 'Brand sections', thumb(`brand-${anchor}`))
);

/** The retired versions, each opening its capture at /archive/<slug>; the thumbnail is the first fold's 640x360 cut, light only. */
const ARCHIVE_ROWS: readonly Surface[] = ARCHIVE.map((item) =>
  internal(`archive-${item.slug}`, item.name, `/archive/${item.slug}`, archiveDesc(item), 'Archive', {
    shot: `${THUMBS}/archive-${item.slug}.jpg`,
  })
);

export const SITE_SURFACES: readonly Surface[] = [
  ...PAGES,
  ...SHIPPED,
  ...DOCUMENTS,
  ...SITES,
  ...EXPLORATIONS,
  ...ARCHIVE_ROWS,
  ...LIBRARY_ROWS,
  ...BRAND_SECTIONS,
];

const DECK_THUMBS = '/shots/deck';

function external(
  id: string,
  name: string,
  href: string,
  host: string,
  desc: string,
  group: PublicGroup,
  shot?: string,
  shotDark?: string
): Surface {
  return {
    id,
    name,
    href,
    host,
    desc,
    group,
    set: 'public',
    ...(shot ? { shot: `${DECK_THUMBS}/${shot}` } : {}),
    ...(shotDark ? { shotDark: `${DECK_THUMBS}/${shotDark}` } : {}),
  };
}

/** The deck's surfaces panel (parts/tail.html), as data. */
export const PUBLIC_SURFACES: readonly Surface[] = [
  external(
    'gt-home',
    'Landing',
    'https://generaltranslation.com',
    'generaltranslation.com',
    'The home page.',
    'Live product',
    'gt-home-light.jpg',
    'gt-home-dark.jpg'
  ),
  external(
    'gt-pricing',
    'Pricing',
    'https://generaltranslation.com/pricing',
    'generaltranslation.com/pricing',
    'Plans, with the per-word rates at /pricing/usage.',
    'Live product',
    'gt-pricing.jpg',
    'gt-pricing-dark.jpg'
  ),
  external(
    'gt-enterprise',
    'Enterprise',
    'https://generaltranslation.com/enterprise',
    'generaltranslation.com/enterprise',
    'The enterprise page.',
    'Live product',
    'gt-enterprise.jpg',
    'gt-enterprise-dark.jpg'
  ),
  external(
    'gt-careers',
    'Careers',
    'https://generaltranslation.com/careers',
    'generaltranslation.com/careers',
    'Open roles.',
    'Live product',
    'gt-careers.jpg',
    'gt-careers-dark.jpg'
  ),
  external(
    'gt-docs',
    'Documentation',
    'https://generaltranslation.com/docs',
    'generaltranslation.com/docs',
    '393 pages in eight sections, served in eight locales.',
    'Live product',
    'gt-docs.jpg',
    'gt-docs-dark.jpg'
  ),
  external(
    'gt-report-card',
    'Report card',
    'https://generaltranslation.com/report-card',
    'generaltranslation.com/report-card',
    'The interactive localization report card.',
    'Live product',
    'gt-report-card.jpg',
    'gt-report-card-dark.jpg'
  ),
  external(
    'gt-blog',
    'Blog and changelog',
    'https://generaltranslation.com/blog',
    'generaltranslation.com/blog',
    'Essays, devlogs, and the changelog.',
    'Live product',
    'gt-blog.jpg'
  ),
  external(
    'gt-contact',
    'Contact',
    'https://generaltranslation.com/contact',
    'generaltranslation.com/contact',
    'The contact form.',
    'Live product',
    'gt-contact.jpg'
  ),
  external(
    'gt-dash',
    'Dashboard',
    'https://dash.generaltranslation.com',
    'dash.generaltranslation.com',
    'The signed-in product.',
    'Live product',
    'gt-dash.jpg'
  ),
  external(
    'blog-open-source',
    'Supporting open-source software',
    'https://generaltranslation.com/blog/supporting-open-source-software',
    'generaltranslation.com/blog/supporting-open-source-software',
    'The grants announcement.',
    'Editorial',
    'cover-gt-open-source.jpg'
  ),
  external(
    'blog-fuma-nama',
    'Fuma Nama',
    'https://generaltranslation.com/blog/fuma-nama',
    'generaltranslation.com/blog/fuma-nama',
    'The first grantee profile.',
    'Editorial',
    'cover-fumadocs.jpg'
  ),
  external(
    'x',
    'X',
    'https://x.com/generaltxn',
    'x.com/generaltxn',
    'The main account. The banner is a dithered composition.',
    'Social and community',
    'x-banner.jpg'
  ),
  external(
    'linkedin',
    'LinkedIn',
    'https://linkedin.com/company/generaltranslation',
    'linkedin.com/company/generaltranslation',
    'The company page.',
    'Social and community',
    'linkedin.jpg'
  ),
  external(
    'github',
    'GitHub',
    'https://github.com/generaltranslation/gt',
    'github.com/generaltranslation/gt',
    'The open-source libraries.',
    'Social and community',
    'gh-gt.jpg'
  ),
  external(
    'proto-gallery',
    'Gallery',
    'https://prototemplate.com',
    'prototemplate.com',
    'The explorations side by side.',
    'Prototemplate',
    'proto-gallery.jpg'
  ),
  external(
    'proto-brand',
    'Brand directives',
    'https://prototemplate.com/brand',
    'prototemplate.com/brand',
    'The identity canon.',
    'Prototemplate',
    'proto-brand.jpg'
  ),
  external(
    'proto-production',
    'Production',
    'https://prototemplate.com/d/production',
    'prototemplate.com/d/production',
    'The final shipped direction.',
    'Prototemplate',
    'proto-production.jpg'
  ),
  external(
    'proto-dossier',
    'Singularity Dossier',
    'https://prototemplate.com/d/singularity-dossier',
    'prototemplate.com/d/singularity-dossier',
    'The last iteration before the final direction.',
    'Prototemplate',
    'proto-dossier-top.jpg'
  ),
  external(
    'proto-compare',
    'Compare and craft',
    'https://prototemplate.com/compare',
    'prototemplate.com/compare',
    'Comparisons at /compare and craft notes at /craft.',
    'Prototemplate',
    'proto-compare.jpg'
  ),
  external(
    'proto-deck',
    'Brand deck',
    'https://prototemplate.com/deck',
    'prototemplate.com/deck',
    'This deck.',
    'Prototemplate',
    'proto-deck.jpg'
  ),
  external(
    'glyph-home',
    'Glyphfield',
    'https://glyphfield.com',
    'glyphfield.com',
    'Open-source design and motion tooling. It produced the shader graphics, several videos, and the shaders on the site.',
    'Glyphfield',
    'glyph-home.jpg'
  ),
  external(
    'glyph-studio',
    'Studio',
    'https://glyphfield.com/studio',
    'glyphfield.com/studio',
    'The shader and animation studio.',
    'Glyphfield',
    'glyph-studio.jpg'
  ),
  external(
    'drive-assets',
    'Brand asset folder',
    'https://drive.google.com/drive/folders/1q4LR5d6fHGb6oTeIszFux5oHId1RuDQL',
    'drive.google.com',
    'Logos, the X banner and banner explorations, blog art, editorial graphics, and the launch film. A Google Drive folder shared for the brand audit.',
    'Assets'
  ),
];

export const SURFACES: readonly Surface[] = [...SITE_SURFACES, ...PUBLIC_SURFACES];

const SURFACE_BY_ID: ReadonlyMap<string, Surface> = new Map(SURFACES.map((row) => [row.id, row]));

/** The surface with this id across both sets, or undefined. */
export function getSurface(id: string): Surface | undefined {
  return SURFACE_BY_ID.get(id);
}

/** The light and dark captures of a surface, as the shell's ShellShot; undefined when the row has no picture. */
export function surfaceShot(id: string): ShellShot | undefined {
  const row = SURFACE_BY_ID.get(id);
  if (!row?.shot) return undefined;
  return { light: row.shot, dark: row.shotDark };
}

export function surfacesFor(set: SurfaceSet): readonly Surface[] {
  return set === 'site' ? SITE_SURFACES : PUBLIC_SURFACES;
}

export type SurfaceGroupRows = { group: SurfaceGroup; rows: readonly Surface[] };

/** The set's rows in panel order, grouped; groups with no rows are omitted. */
export function surfaceGroups(set: SurfaceSet): readonly SurfaceGroupRows[] {
  const order: readonly SurfaceGroup[] = set === 'site' ? SITE_GROUPS : PUBLIC_GROUPS;
  const rows = surfacesFor(set);
  return order
    .map((group) => ({ group, rows: rows.filter((row) => row.group === group) }))
    .filter((entry) => entry.rows.length > 0);
}

/** True when the surface leaves the site: the panel opens it in a new tab. */
export function isExternalSurface(surface: Surface): boolean {
  return /^https?:\/\//.test(surface.href);
}

/** The letter on the blank plate when a row has no shot. */
export function surfaceInitial(surface: Surface): string {
  return surface.name.charAt(0).toUpperCase();
}

/** Case-insensitive substring match on the row text and its address. */
export function surfaceMatches(surface: Surface, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = `${surface.name} ${surface.host} ${surface.desc} ${surface.href}`.toLowerCase();
  return text.includes(q);
}
