import { LIBRARIES } from '@/app/craft/libraries';
import { DOCS } from '@/app/docs/registry';
import { DIRECTIONS } from '@/lib/directions';

/**
 * The one registry behind the index panel. Two sets: `site` is every place
 * on this site, assembled from the same registries the pages render from;
 * `public` is every public place the brand is live, carried over from the
 * deck's surfaces panel as data. Pure data; the panel filters it client-side
 * and navigates internal hrefs with the router, external ones in a new tab.
 *
 * Thumbnails: `shot` and `shotDark` are public paths. Site rows use the
 * direction captures under /shots/light and /shots/dark where they exist;
 * page, document and brand rows take /shots/thumb/<id>.jpg once captured
 * (192x108, shown at 96x54). Public rows point into /deck/shots/thumb,
 * which scripts/build-deck.mjs emits from the deck source. A row without a
 * shot renders the blank plate with its initial.
 */
export type SurfaceSet = 'site' | 'public';

export const SITE_GROUPS = [
  'Pages',
  'Documents',
  'Sites',
  'Explorations',
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

const PAGES: readonly Surface[] = [
  internal('index', 'Index', '/', `The gallery of ${DIRECTIONS.length} directions.`, 'Pages'),
  internal('brand', 'Brand', '/brand', 'The identity canon in ten sections.', 'Pages'),
  internal('docs', 'Docs', '/docs', 'The repository documents, read in the browser.', 'Pages'),
  internal('deck', 'Deck', '/deck', 'The GT brand deck, 52 slides.', 'Pages'),
  internal('present', 'Present', '/present', 'The presenter: intro, prototypes and scoreboard.', 'Pages'),
  internal('compare', 'Compare', '/compare', 'Two directions side by side in synced frames.', 'Pages'),
];

const DOCUMENTS: readonly Surface[] = [
  internal('docs-readme', 'Readme', '/docs', 'The repository readme.', 'Documents'),
  ...DOCS.map((doc) =>
    internal(`docs-${doc.slug}`, doc.title, `/docs/${doc.slug}`, doc.blurb, 'Documents')
  ),
];

const SITE_DIRECTIONS = DIRECTIONS.filter((d) => d.site);
const EXPLORATION_DIRECTIONS = DIRECTIONS.filter((d) => !d.site);

const SITES: readonly Surface[] = SITE_DIRECTIONS.flatMap((d) => [
  internal(d.slug, d.name, `/d/${d.slug}`, d.concept, 'Sites', {
    shot: `/shots/light/${d.slug}.jpg`,
    shotDark: `/shots/dark/${d.slug}.jpg`,
  }),
  internal(
    `${d.slug}-enterprise`,
    `${d.name} enterprise`,
    `/d/${d.slug}/enterprise`,
    `The enterprise page of ${d.name}.`,
    'Sites',
    {
      shot: `/shots/light/${d.slug}-enterprise.jpg`,
      shotDark: `/shots/dark/${d.slug}-enterprise.jpg`,
    }
  ),
]);

const EXPLORATIONS: readonly Surface[] = EXPLORATION_DIRECTIONS.map((d) =>
  internal(d.slug, d.name, `/d/${d.slug}`, d.concept, 'Explorations', {
    shot: `/shots/light/${d.slug}.jpg`,
    shotDark: `/shots/dark/${d.slug}.jpg`,
  })
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
  internal(`brand-${anchor}`, name, `/brand#${anchor}`, desc, 'Brand sections')
);

export const SITE_SURFACES: readonly Surface[] = [
  ...PAGES,
  ...DOCUMENTS,
  ...SITES,
  ...EXPLORATIONS,
  ...LIBRARY_ROWS,
  ...BRAND_SECTIONS,
];

const DECK_THUMBS = '/deck/shots/thumb';

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
