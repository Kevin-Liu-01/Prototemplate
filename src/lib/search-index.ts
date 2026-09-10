import type { IconName } from '@/components/viewer/icons';
import { DOCS } from '@/app/docs/registry';
import { SKILL_GROUPS, skillHref } from '@/lib/skills';
import { SITE_SURFACES } from '@/lib/surfaces';
import type { Surface, SurfaceGroup } from '@/lib/surfaces';

/**
 * The search bar's index (directive 8.3): everything the site can jump to,
 * as one flat list the palette filters client-side. Restored from the
 * palette at 430e3c7 and rebuilt on the shell's registries so the rows
 * carry the same ids as the index panel and the sidebar: pages, the skill
 * pages, documents and their headings, the sites and explorations (each
 * opening its page under /directions), the archived versions, the brand
 * sections, the library anchors, and the 85 deck slides, each linking to
 * /deck#n. Pure data, no React, no DOM.
 *
 * The site rows come straight from src/lib/surfaces.ts, so a group added
 * there (Shipped, directive 8.10) appears here without a change; `surface`
 * is that row's id and is what a result row writes to data-preview for the
 * preview layer (directive 8.6). The skill rows come from the generated
 * src/lib/skills.ts (SKILL_GROUPS: the slug, the name and the category,
 * never the descriptions, which would put the whole registry in every
 * shell page's bundle) and preview the skills index. The headings and the
 * slide titles are snapshots: the documents are read from disk on the
 * server, and the slide files live under deck/slides, neither reachable
 * from a client module. Heading ids follow src/app/docs/markdown.tsx
 * (lowercase, `&` to `and`, apostrophes dropped, runs of anything else to
 * one hyphen). Refresh both tables when a document gains an h2 or a slide
 * is renamed.
 */
export type SearchSite = 'dossier' | 'orbit' | 'signal' | 'shipped';

/** The site map groups from surfaces.ts plus the three groups only the search has. */
export type SearchGroup = SurfaceGroup | 'Skills' | 'Headings' | 'Deck slides';

export type SearchEntry = {
  /** unique across the index */
  id: string;
  title: string;
  href: string;
  group: SearchGroup;
  /** the line at the row's right: the address, or where a heading or a slide sits */
  meta: string;
  icon: IconName;
  /** extra words the filter matches; the title, the meta and the href always count */
  keywords?: string;
  /** the surfaces.ts id, written to data-preview so the preview layer can show its capture */
  surface?: string;
  /** which site a row belongs to; the row colors its icon on the site's token */
  site?: SearchSite;
  /** the lowercased words the filter matches against, built once when the index is; never set by a caller */
  hay?: string;
};

/**
 * The order groups appear in the results. Typed as strings on purpose:
 * Shipped is named here before surfaces.ts carries it (directive 8.10), and
 * a group added there later falls in after the known ones.
 */
const GROUP_ORDER: readonly string[] = [
  'Pages',
  'Knowledge',
  'Skills',
  'Shipped',
  'Documents',
  'Headings',
  'Sites',
  'Explorations',
  'Archive',
  'Brand sections',
  'Libraries',
  'Deck slides',
];

/**
 * What an empty query shows: a short map of the site that fits the card
 * without a scroll region, so the palette opens as a map and not a list to
 * wade through. Every page and every knowledge row, the shipped site's home
 * and its first two pages, every document and the three site concepts
 * (their enterprise pages are one keystroke away). The skill pages,
 * explorations, the archive, headings, libraries, brand sections and slides
 * appear as soon as a letter is typed.
 */
const EMPTY_PER_GROUP: Readonly<Partial<Record<string, number>>> = {
  Pages: 6,
  Knowledge: 3,
  Shipped: 3,
  Documents: 6,
  Sites: 3,
};

/* the Pages and Knowledge rows' icons (directive 8.5), by surface id; the
   marks take the swatch, the nearest glyph the shell's set has to a star */
const PAGE_ICON: Readonly<Record<string, IconName>> = {
  gallery: 'gallery',
  present: 'present',
  compare: 'compare',
  deck: 'deck',
  brand: 'swatch',
  docs: 'document',
  skills: 'sparkles',
  marks: 'swatch',
  archive: 'archive',
};

/* words the old palette matched that the row text does not carry */
const PAGE_KEYWORDS: Readonly<Record<string, string>> = {
  gallery: 'home index working file directions',
  brand: 'identity book basement mark color type voice directives',
  docs: 'readme build log craft libraries laws documents',
  deck: 'brand deck slideshow slides identity summary book GT',
  present: 'presenter slides scoreboard',
  compare: 'side by side synced frames',
  skills: 'agent skills SKILL.md engineering productivity general translation',
  marks: 'logo mark monogram GT explorations bilingual counterform reflection',
  archive: 'retired versions captures history',
};

/* the sites' icons and colors (directive 8.5), by direction slug */
const SITE_OF: Readonly<Record<string, SearchSite>> = {
  'singularity-dossier': 'dossier',
  'singularity-orbit': 'orbit',
  'singularity-signal': 'signal',
  production: 'shipped',
};

const SITE_ICON: Readonly<Record<SearchSite, IconName>> = {
  dossier: 'folder',
  orbit: 'globe',
  signal: 'signal',
  shipped: 'check-badge',
};

/** `singularity-dossier-enterprise` belongs to Dossier; `production` to Shipped. */
function siteOf(row: Surface): SearchSite | undefined {
  const group: string = row.group;
  if (group === 'Shipped') return 'shipped';
  const slug = Object.keys(SITE_OF).find((key) => row.id === key || row.id.startsWith(`${key}-`));
  return slug ? SITE_OF[slug] : undefined;
}

/* the icon for a site map group when the row itself does not decide */
const GROUP_ICON: Readonly<Partial<Record<SurfaceGroup, IconName>>> = {
  Documents: 'document',
  Explorations: 'sparkles',
  Archive: 'archive',
  Libraries: 'cube',
  'Brand sections': 'swatch',
};

function iconOf(row: Surface, site: SearchSite | undefined): IconName {
  if (row.group === 'Pages' || row.group === 'Knowledge') return PAGE_ICON[row.id] ?? 'pages';
  if (site) return SITE_ICON[site];
  return GROUP_ICON[row.group] ?? 'pages';
}

function fromSurface(row: Surface): SearchEntry {
  const site = siteOf(row);
  return {
    id: row.id,
    title: row.name,
    href: row.href,
    group: row.group,
    meta: row.host,
    icon: iconOf(row, site),
    keywords: [row.desc, PAGE_KEYWORDS[row.id]].filter(Boolean).join(' '),
    surface: row.id,
    site,
  };
}

/**
 * One row per skill page, in the categories' order: the name, the category
 * as the meta line, the sparkles glyph the Skills row carries, and the
 * skills index as the preview, since a skill page has no capture of its own.
 */
const SKILL_ROWS: readonly SearchEntry[] = SKILL_GROUPS.flatMap((group) =>
  group.skills.map(
    (skill): SearchEntry => ({
      id: `skill-${skill.slug}`,
      title: skill.name,
      href: skillHref(skill.slug),
      group: 'Skills',
      meta: `Skills / ${group.label}`,
      icon: 'sparkles',
      keywords: `skill SKILL.md agent ${group.label}`,
      surface: 'skills',
    })
  )
);

/** `/docs` for the readme, `/docs/<slug>` otherwise (src/app/docs/model.ts). */
function docHref(slug: string): string {
  return slug === 'readme' ? '/docs' : `/docs/${slug}`;
}

/** The h2 rows of each document, in reading order: [id, title]. The readme ends with the build log's six sections. */
const DOC_HEADINGS: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  readme: [
    ['run-it', 'Run it'],
    ['read-first', 'Read first'],
    ['the-one-paragraph-tour', 'The one-paragraph tour'],
    ['the-system-under-the-system', 'The system under the system'],
    ['the-line-law-and-the-auditors-that-hold-it', 'The line law, and the auditors that hold it'],
    ['rails-grounds-and-seams', 'Rails, grounds, and seams'],
    ['corners-spacers-and-the-second-surface', 'Corners, spacers, and the second surface'],
    ['the-libraries', 'The libraries'],
    ['the-moving-type', 'The moving type'],
  ],
  brand: [
    ['1-the-name', '1. The name'],
    ['2-the-idea', '2. The idea'],
    ['3-the-character', '3. The character'],
    ['4-the-mark', '4. The mark'],
    ['5-color', '5. Color'],
    ['6-type', '6. Type'],
    ['7-language-as-material', '7. Language as material'],
    ['8-the-completed-reference', '8. The completed reference'],
    ['9-context-for-partners', '9. Context for partners'],
  ],
  design: [
    ['1-the-four-color-system', '1. The four-color system'],
    ['2-the-line-law', '2. The line law'],
    ['3-the-rails', '3. The rails'],
    ['4-typography-and-voices', '4. Typography and voices'],
    ['5-the-doubled-line-thread-grammar', '5. The doubled line (thread grammar)'],
    ['6-the-isometric-family', '6. The isometric family'],
    ['7-the-1-bit-language-bayer-dither', '7. The 1-bit language (Bayer dither)'],
    ['8-the-moving-type-law', '8. The moving type law'],
    ['9-motion-discipline', '9. Motion discipline'],
    ['10-the-seam-slide-to-reveal', '10. The seam (slide-to-reveal)'],
    ['11-engine-lifecycle', '11. Engine lifecycle'],
    ['12-the-mobile-type-ladder', '12. The mobile type ladder'],
    ['13-the-svh-dvh-law', '13. The svh/dvh law'],
    ['14-the-two-read-lines', '14. The two read lines'],
  ],
  architecture: [
    ['the-shape-of-the-app', 'The shape of the app'],
    ['the-direction-registry', 'The direction registry'],
    ['the-ssot-rule', 'The SSOT rule'],
    ['componentized-instruments', 'Componentized instruments'],
    ['the-gallery-pipeline', 'The gallery pipeline'],
    ['skills-and-docs', 'Skills and docs'],
    ['the-mirror', 'The mirror'],
  ],
  'ship-loop': [
    ['0-ground-rules', '0. Ground rules'],
    ['1-the-line-audit', '1. The line audit'],
    ['2-the-practices-ratchet', '2. The practices ratchet'],
    ['3-types', '3. Types'],
    ['4-film-it', '4. Film it'],
    ['5-commit-and-back-up', '5. Commit and back up'],
    ['6-the-mirror', '6. The mirror'],
  ],
};

const DOC_TITLE: Readonly<Record<string, string>> = {
  readme: 'Readme',
  ...Object.fromEntries(DOCS.map((doc) => [doc.slug, doc.title])),
};

const HEADINGS: readonly SearchEntry[] = Object.entries(DOC_HEADINGS).flatMap(([slug, rows]) =>
  rows.map(
    ([id, title]): SearchEntry => ({
      id: `heading-${slug}-${id}`,
      title,
      href: `${docHref(slug)}#${id}`,
      group: 'Headings',
      meta: `In ${DOC_TITLE[slug] ?? slug}`,
      icon: 'document',
      keywords: `${DOC_TITLE[slug] ?? ''} heading section`,
      surface: `docs-${slug}`,
    })
  )
);

/** The 85 slide titles, in order: the first h1, h2 or .big of each deck/slides/NN-*.html; the nine mood slides carry no heading and are listed by their image. */
const DECK_SLIDES: readonly string[] = [
  'Brand',
  'General Translation',
  'Every product in every language',
  'Reputation',
  'Why the redesign',
  'The Blue Marble',
  'Open source and platform',
  'Audience',
  'Values',
  'The Rosetta Stone',
  'Brand personality',
  'Writing style',
  'Visual references',
  'The name',
  'The mark',
  'Design system',
  'Small sizes',
  'Color',
  'Typography',
  'Scripts',
  'Type scale',
  'Line rules',
  'The doubled line',
  'Karahisari\'s calligraphy',
  'Diagrams',
  'Dither',
  'Isometric illustration',
  'Animated text',
  'Motion rules',
  'Anti-patterns',
  'Website',
  'Public surfaces',
  'The production site',
  'Dark mode',
  'Pricing and enterprise',
  'Contact and report card',
  'Louisbourg lighthouse',
  'Details',
  'Three close-ups',
  'Layout measurements',
  'The horizon field',
  'Documentation',
  'The docs',
  'Nearest-page routing',
  'The Compact Oxford English Dictionary',
  'Markdown twins',
  'Blog and content',
  'Blog index',
  'Generated covers',
  'A Devanagari manuscript',
  'Designed covers',
  'Blog content',
  'The copy test',
  'Site copy and founder posts',
  'Brand assets outside the site',
  'Developer experience',
  'Translation as a build step',
  'The Eastern Telegraph cable chart',
  'The CLI',
  'Prototemplate and Glyphfield',
  'Prototemplate',
  'The knowledge base',
  'Skills and marks',
  'The viewer shell',
  'The shell in use',
  'The line law in chrome',
  'Compare and the presenter',
  'The Dossier',
  'Directions',
  'The Great Wave off Kanagawa',
  'The archive',
  'Shared engines',
  'The build log',
  'Glyphfield',
  'Fifteen tools',
  'Books and templates',
  '134 live materials',
  'The agent API',
  'Status and plan',
  'Current status',
  'Bowen\'s compass rose',
  'The identity project',
  'Fixed points',
  'Success criteria',
  'Every product in every language',
];

const SLIDES: readonly SearchEntry[] = DECK_SLIDES.map(
  (title, i): SearchEntry => ({
    id: `deck-slide-${i + 1}`,
    title,
    href: `/deck#${i + 1}`,
    group: 'Deck slides',
    meta: `Slide ${i + 1} of ${DECK_SLIDES.length}`,
    icon: 'slide',
    keywords: `deck slide ${i + 1}`,
  })
);

/** The words a row is matched on, lowercased once. */
function hayOf(entry: SearchEntry): string {
  return `${entry.title} ${entry.meta} ${entry.keywords ?? ''} ${entry.href} ${entry.group}`.toLowerCase();
}

/** Every site map row, then the skill pages, the headings and the slides, each with its haystack built: the panel groups and orders them. */
export const SEARCH_INDEX: readonly SearchEntry[] = [
  ...SITE_SURFACES.map(fromSurface),
  ...SKILL_ROWS,
  ...HEADINGS,
  ...SLIDES,
].map((entry) => ({ ...entry, hay: hayOf(entry) }));

/** Every term of the query, in order, has to appear somewhere in the row's words. */
export function searchMatches(entry: SearchEntry, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = entry.hay ?? hayOf(entry);
  return terms.every((term) => hay.includes(term));
}

/** True for a row the empty query shows: within its group's allowance, and for Sites the three homes alone. */
function emptyRows(): SearchEntry[] {
  const left = new Map(Object.entries(EMPTY_PER_GROUP));
  const out: SearchEntry[] = [];
  for (const entry of SEARCH_INDEX) {
    const room = left.get(entry.group);
    if (!room) continue;
    if (entry.group === 'Sites' && entry.id.endsWith('-enterprise')) continue;
    out.push(entry);
    left.set(entry.group, room - 1);
  }
  return out;
}

export type SearchGroupRows = { group: SearchGroup; rows: readonly SearchEntry[] };

function groupRank(group: string): number {
  const at = GROUP_ORDER.indexOf(group);
  return at < 0 ? GROUP_ORDER.length : at;
}

/**
 * How close a row's title is to the query: 0 for the title itself, 1 for a
 * title that starts with it, 2 for one that contains it, 3 for a match
 * elsewhere in the row's words (the address, the keywords, the group). The
 * query is already trimmed and lowercased.
 */
function titleScore(entry: SearchEntry, q: string): number {
  const title = entry.title.toLowerCase();
  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  return 3;
}

/**
 * The rows for a query, grouped and capped at `limit` rows in all. Inside a
 * group the rows run by title score (titleScore) and index order within a
 * score; the groups run by their best row first and the fixed order
 * (GROUP_ORDER) second, so Enter on `Toolchain` opens the exploration named
 * Toolchain, not a document whose keywords mention it, and `Dossier` opens
 * the site. An empty query shows the short map (EMPTY_PER_GROUP) in the
 * fixed order, so the palette opens as a map of the site, not a blank field.
 */
export function searchGroups(query: string, limit = 60): readonly SearchGroupRows[] {
  const q = query.trim().toLowerCase();
  const hits = q ? SEARCH_INDEX.filter((entry) => searchMatches(entry, q)) : emptyRows();
  const scores = new Map<SearchEntry, number>(hits.map((entry) => [entry, q ? titleScore(entry, q) : 3]));
  const scoreOf = (entry: SearchEntry): number => scores.get(entry) ?? 3;
  const groups = new Map<SearchGroup, SearchEntry[]>();
  for (const entry of hits) {
    const rows = groups.get(entry.group);
    if (rows) rows.push(entry);
    else groups.set(entry.group, [entry]);
  }
  const ordered = [...groups.entries()]
    .map(([group, rows]) => ({
      group,
      rows: rows.sort((a, b) => scoreOf(a) - scoreOf(b)),
      best: Math.min(...rows.map(scoreOf)),
    }))
    .sort((a, b) => a.best - b.best || groupRank(a.group) - groupRank(b.group));
  const out: SearchGroupRows[] = [];
  let left = limit;
  for (const { group, rows } of ordered) {
    if (left <= 0) break;
    const take = rows.slice(0, left);
    left -= take.length;
    out.push({ group, rows: take });
  }
  return out;
}

/** `12 results`, `1 result`. */
export function searchCount(n: number): string {
  return `${n} ${n === 1 ? 'result' : 'results'}`;
}
