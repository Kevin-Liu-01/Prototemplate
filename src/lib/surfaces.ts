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
 * is a thumbnail: direction, page, shipped page and archive rows point at
 * the 640x360 cuts scripts/build-thumbs.mjs writes under
 * /shots/thumb/<id>.jpg and <id>-dark.jpg (archive-<slug>.jpg for the
 * archive), document and brand section rows at the route captures in the
 * same folder. The page and shipped page cuts come from
 * scripts/capture-pages.mjs, which shoots every static page under
 * src/app/d/production and every route of the Pages group in both themes
 * into /shots/pages; the 1440 exhibit captures under /shots/light,
 * /shots/dark and /shots/archive stay for the exhibit sheet and the grid,
 * which read the routes' own ShellItem.shot. The live surfaces of the
 * shipped site point at the captures scripts/capture-pages.mjs --live
 * takes of generaltranslation.com in both themes, cut into /shots/thumb as
 * live-<id>.jpg and live-<id>-dark.jpg; public rows point into /shots/deck,
 * the deck's own thumbnails, which scripts/build-deck.mjs copies from
 * deck/shots/thumb. So every site row that names a page resolves a picture
 * in both themes; a row without a shot (a library, the asset folder)
 * renders the blank plate with its initial. surfaceShot(id) is what the
 * preview layer reads.
 *
 * The site groups run in the one sidebar order every route keeps (Pages,
 * Knowledge, Shipped, Documents, Sites, Explorations, Archive); Libraries
 * and Brand sections follow as panel-only groups. Pages holds the three
 * working views of the lab: the gallery, the presenter and the compare rig.
 * Knowledge holds what the site keeps as the General Translation knowledge
 * base: the brand book (/deck), the brand directives (/brand), the
 * repository documents (/docs), the agent skills (/skills), the mark
 * explorations (/marks) and the archive of retired versions. Shipped
 * (directive 8.10) holds the direction that shipped and its pages:
 * /d/production and the pages Kevin built under src/app/d/production, then
 * the pages of the live site as external rows (the sidebar folds those
 * under a `Live site` child). Sites holds
 * the three full site concepts only. A row that belongs to one of the four
 * sites names it in `site`, so a list can color its icon on the matching
 * --pt-site-* token.
 */
export type SurfaceSet = 'site' | 'public';

export const SITE_GROUPS = [
  'Pages',
  'Knowledge',
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

/** The light and dark route captures for a thumbnail stem under /shots/thumb. */
function thumb(stem: string): { shot: string; shotDark: string } {
  return { shot: `${THUMBS}/${stem}.jpg`, shotDark: `${THUMBS}/${stem}-dark.jpg` };
}

/** The Pages rows, the lab's working views; each previews its own first fold, shot by scripts/capture-pages.mjs under the row's id. */
const PAGES: readonly Surface[] = [
  internal('gallery', 'Gallery', '/', `The gallery of ${DIRECTIONS.length} directions.`, 'Pages', thumb('gallery')),
  internal('present', 'Presenter', '/present', 'The separate presentation of the redesign.', 'Pages', thumb('present')),
  internal('compare', 'Compare', '/compare', 'Two directions side by side in synced frames.', 'Pages', thumb('compare')),
];

/**
 * The Knowledge rows: what the site keeps as the General Translation
 * knowledge base. The brand book, the directives and the documents keep
 * their captures under their ids; the skills and the marks have no capture
 * yet and draw the blank plate; the archive row opens the first retired
 * version, since the archive has no index page of its own.
 */
const KNOWLEDGE: readonly Surface[] = [
  internal('deck', 'Brand book', '/deck', 'The GT brand deck: the identity in slides, its own viewer.', 'Knowledge', thumb('deck')),
  internal('brand', 'Brand directives', '/brand', 'The identity canon in ten sections.', 'Knowledge', thumb('brand')),
  internal('docs', 'Docs', '/docs', 'The repository documents, read in the browser.', 'Knowledge', thumb('docs')),
  internal('skills', 'Skills', '/skills', 'The working skills behind the design lab and the product, by name and description.', 'Knowledge'),
  internal('marks', 'Marks', '/marks', 'Nine new GT marks in three families, each one color, with its construction.', 'Knowledge'),
  internal(
    'archive',
    'Archive',
    `/archive/${ARCHIVE[0]?.slug ?? ''}`,
    `The ${ARCHIVE.length} retired versions, kept as full-page captures at their own addresses.`,
    'Knowledge'
  ),
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
 * the pages Kevin built for the live site, as [path, name, description],
 * in the order the live site's navigation reads them after Home. The
 * legal, Mintlify, usage rates, enterprise contact and YC routes are gone
 * from this prototype on Kevin's directive; the live site's usage rates
 * page appears among the live surfaces below. The dynamic segments
 * (blog/[slug], the catch-all) are not pages of their own and are left out.
 */
const SHIPPED_PAGES: readonly (readonly [string, string, string])[] = [
  ['/pricing', 'Pricing', 'Plans and the comparison table.'],
  ['/enterprise', 'Enterprise', 'The enterprise page of the shipped site.'],
  ['/careers', 'Careers', 'Open roles and the mission.'],
  ['/contact', 'Contact', 'The contact form.'],
  ['/try', 'Report card', 'The interactive localization report card.'],
  ['/supported-locales', 'Supported locales', 'The catalog of supported locales.'],
  ['/signin', 'Sign in', 'The sign in page.'],
  ['/blog', 'Blog', 'Essays, devlogs and the changelog.'],
];

/** `/supported-locales` becomes `supported-locales`; a nested path joins its segments with hyphens. */
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

/** Every shipped page previews its own first fold: scripts/capture-pages.mjs shoots each static page under its stem. */
const SHIPPED_ROUTES: readonly Surface[] = SHIPPED_PAGES.map(([path, name, desc]) => {
  const stem = `production-${pathStem(path)}`;
  return { ...internal(stem, name, `/d/production${path}`, desc, 'Shipped', directionShots(stem)), site: 'shipped' };
});

const LIVE_HOST = 'generaltranslation.com';

/**
 * A live surface of the shipped site: an external row in the site set,
 * with the light and dark captures scripts/capture-pages.mjs --live takes
 * of the live page, cut by scripts/build-thumbs.mjs into
 * /shots/thumb/live-<id>.jpg and live-<id>-dark.jpg.
 */
function live(id: string, name: string, href: string, host: string, desc: string): Surface {
  return {
    id: `live-${id}`,
    name,
    href,
    host,
    desc,
    group: 'Shipped',
    set: 'site',
    site: 'shipped',
    ...thumb(`live-${id}`),
  };
}

/** A live page of generaltranslation.com at `path`. */
function livePage(id: string, name: string, path: string, desc: string): Surface {
  const host = `${LIVE_HOST}${path}`;
  return live(id, name, `https://${host}`, host, desc);
}

/**
 * The live surfaces of the shipped site (directive 8.10): the pages Kevin
 * built on generaltranslation.com, in the order he listed them, then the
 * 404 page at an address that does not exist and the dashboard sign-in on
 * its own host. The sidebar folds these under the Shipped group's `Live
 * site` child, each with the external glyph.
 */
const SHIPPED_LIVE: readonly Surface[] = [
  livePage('home', 'Home', '', 'The live home page.'),
  livePage('pricing', 'Pricing', '/pricing', 'The live pricing page.'),
  livePage('usage', 'Usage rates', '/pricing/usage', 'The per-word rates behind the plans.'),
  livePage('enterprise', 'Enterprise', '/enterprise', 'The live enterprise page.'),
  livePage('careers', 'Careers', '/careers', 'The live careers page.'),
  livePage('contact', 'Contact', '/contact', 'The live contact form.'),
  livePage('docs', 'Docs', '/docs', 'The live documentation.'),
  livePage('blog', 'Blog', '/blog', 'The live blog and changelog.'),
  livePage('report-card', 'Report card', '/report-card', 'The live localization report card.'),
  livePage('404', '404 page', '/this-page-does-not-exist', 'The not-found page, at an address that does not exist.'),
  live(
    'dash',
    'Dashboard sign-in',
    'https://dash.generaltranslation.com',
    'dash.generaltranslation.com',
    'The sign-in page of the dashboard.'
  ),
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
  ...KNOWLEDGE,
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
