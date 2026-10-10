import type { IconName } from '@/components/viewer/icons';
import { docHref } from '@/app/docs/model';
import { DOCS } from '@/app/docs/registry';
import { HANDBOOK, HANDBOOK_README } from '@/app/handbook/registry';
import { MOTION_FILMS, MOTION_SCRIPT_WORDS, MOTION_SECTIONS, MOTION_STATUS_LABEL, motionHref } from '@/lib/motion';
import { SKILL_AREAS, SKILLS, skillHref } from '@/lib/skills';
import { SITE_SURFACES } from '@/lib/surfaces';
import type { Surface, SurfaceGroup } from '@/lib/surfaces';

/**
 * The search bar's index (directive 8.3): everything the site can jump to,
 * as one flat list the palette filters client-side. Restored from the
 * palette at 430e3c7 and rebuilt on the shell's registries so the rows
 * carry the same ids as the index panel and the sidebar: pages, the skill
 * pages, the handbook's documents, the films on the motion roster with the
 * sections of each research package and the contact sheet and script of
 * each published cut, documents and their headings, the sites and explorations (each
 * opening its page under /directions), the archived versions, the brand
 * sections, the library anchors, and the 93 deck slides, each linking to
 * /deck#n. Pure data, no React, no DOM.
 *
 * The site rows come straight from src/lib/surfaces.ts, so a group added
 * there (Shipped, directive 8.10) appears here without a change; `surface`
 * is that row's id and is what a result row writes to data-preview for the
 * preview layer (directive 8.6). The skill rows come from the generated
 * src/lib/skills.ts (SKILLS: the slug, the title, the areas and the
 * description, about 13 KB for the curated set, which every shell page's
 * bundle carries) and preview the skills index. The headings and the
 * slide titles are snapshots: the documents are read from disk on the
 * server, and the slide files live under deck/slides, neither reachable
 * from a client module. Heading ids follow src/app/docs/markdown.tsx
 * (lowercase, `&` to `and`, apostrophes dropped, runs of anything else to
 * one hyphen). Refresh both tables when a document gains an h2 or a slide
 * is renamed.
 */
export type SearchSite = 'dossier' | 'orbit' | 'signal' | 'shipped';

/** The site map groups from surfaces.ts plus the five groups only the search has. */
export type SearchGroup = SurfaceGroup | 'Skills' | 'Handbook' | 'Motion' | 'Headings' | 'Deck slides';

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
  'Handbook',
  'Motion',
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
  skills: 'skill',
  handbook: 'book',
  marks: 'swatch',
  blog: 'document',
  graphics: 'gallery',
  motion: 'film',
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
  skills:
    'agent skills SKILL.md install voice humanizer website landing brand Inter aesthetic deck lints gates PR motion films video graphics dither diagrams isometric components Prototemplate',
  handbook:
    'wiki how kevin works operating principles quality bar done multi-session playbook lanes sessions forks product map glossary terms decisions rulings agents',
  blog: 'posts articles docs redesign rewriting fuma nama designing docs for humans carousel',
  graphics: 'illustrations visuals covers carousel slides glyphfield exports pipeline manifest',
  motion:
    'films videos hyperframes roster trailers translation series jihe yuanben euclid ricci journey to the west monkey waley hebrew ben-yehuda',
  marks: 'logo mark monogram wordmark lockup GT speed race bars cut plate livery ascii dither',
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
  Explorations: 'explore',
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
 * One row per skill page, in the set's order: the title, the area the
 * skill is filed under as the meta line, the skill glyph the Skills row
 * carries, and the skills index as the preview, since a skill page has no
 * capture of its own. The keywords hold the slug, every area and the
 * description, so a search for an area or a word of the description finds
 * the skill.
 */
const SKILL_ROWS: readonly SearchEntry[] = SKILLS.map((skill): SearchEntry => {
  const areas = skill.areas.map((area) => SKILL_AREAS.find((entry) => entry.id === area)?.label ?? area);
  return {
    id: `skill-${skill.id}`,
    title: skill.title,
    href: skillHref(skill.id),
    group: 'Skills',
    meta: `Skills / ${areas[0] ?? ''}`,
    icon: 'skill',
    keywords: `skill SKILL.md agent ${skill.id} ${areas.join(' ')} ${skill.description}`,
    surface: 'skills',
  };
});

/**
 * One row per handbook document, the readme first, in the book's order:
 * the title, `Handbook` and the document's number as the meta line, the
 * Handbook row's glyph, and the Handbook row as the preview. The keywords
 * hold the blurb, so a search for a word of what a document holds finds
 * it.
 */
const HANDBOOK_ROWS: readonly SearchEntry[] = [HANDBOOK_README, ...HANDBOOK].map(
  (doc, i): SearchEntry => ({
    id: `handbook-${doc.slug}`,
    title: doc.slug === HANDBOOK_README.slug ? 'Handbook readme' : doc.title,
    href: docHref(doc.slug, 'handbook'),
    group: 'Handbook',
    meta: `Handbook / ${String(i + 1).padStart(2, '0')}`,
    icon: 'book',
    keywords: `handbook ${doc.slug} ${doc.blurb}`,
    surface: 'handbook',
  })
);

/** The film's text without its inline markup. */
function plainMarkdown(text: string): string {
  return text.replace(/`([^`]+)`/g, '$1').replace(/\*/g, '');
}

/**
 * One row per film on the motion roster (the generated src/lib/motion.ts),
 * in page order: a series film opens its package page, every other film
 * its row on /motion. The meta line names the section and the status; the
 * keywords carry the length and, for a series film, its series line and
 * section titles. All preview the Motion row.
 */
const MOTION_ROWS: readonly SearchEntry[] = MOTION_FILMS.map(
  (film): SearchEntry => ({
    id: `motion-${film.slug}`,
    title: film.title,
    href: motionHref(film),
    group: 'Motion',
    meta: `Motion / ${MOTION_SECTIONS.find((section) => section.id === film.section)?.label ?? 'Films'} / ${MOTION_STATUS_LABEL[film.status]}`,
    icon: 'film',
    keywords: [
      'film video motion',
      film.slug,
      film.length,
      film.pkg ? plainMarkdown(film.pkg.series) : '',
      film.pkg ? film.pkg.sections.map((section) => section.title).join(' ') : '',
    ]
      .filter(Boolean)
      .join(' '),
    surface: 'motion',
  })
);

/** The five sections of each research package, as heading rows that land on the section. */
const MOTION_HEADINGS: readonly SearchEntry[] = MOTION_FILMS.flatMap((film) =>
  (film.pkg?.sections ?? []).map(
    (section): SearchEntry => ({
      id: `heading-motion-${film.slug}-${section.id}`,
      title: section.title,
      href: `/motion/${film.slug}#${section.id}`,
      group: 'Headings',
      meta: `In ${film.title}`,
      icon: 'film',
      keywords: `${film.slug} research package section ${section.note}`,
      surface: 'motion',
    })
  )
);

/**
 * The published cut's records of each film as heading rows: its contact
 * sheet and its script as built, which land on their sections of the
 * film's page (or its row on /motion for a film without one). A script
 * row matches every word of the script's story and spoken lines
 * (MOTION_SCRIPT_WORDS, generated with the registry), so a line the film
 * says finds the film.
 */
const MOTION_RECORDS: readonly SearchEntry[] = MOTION_FILMS.flatMap((film): SearchEntry[] => {
  const rows: SearchEntry[] = [];
  const at = (id: string) => (film.pkg ? `/motion/${film.slug}#${id}` : `/motion#${film.id}`);
  if (film.sheet) {
    rows.push({
      id: `heading-motion-${film.slug}-contact-sheet`,
      title: 'Contact sheet',
      href: at('contact-sheet'),
      group: 'Headings',
      meta: `In ${film.title}`,
      icon: 'grid',
      keywords: `${film.slug} contact sheet frames stills ${film.sheet.frames ? `${film.sheet.frames} frames` : ''} ${film.cut?.label ?? ''}`,
      surface: 'motion',
    });
  }
  if (film.script) {
    rows.push({
      id: `heading-motion-${film.slug}-film-script`,
      title: 'Script',
      href: at('film-script'),
      group: 'Headings',
      meta: `In ${film.title}`,
      icon: 'document',
      keywords: `${film.slug} script as built narration lines ${film.script.label ?? ''} ${film.script.voices} ${MOTION_SCRIPT_WORDS[film.slug] ?? ''}`,
      surface: 'motion',
    });
  }
  return rows;
});

/** The h2 rows of each document, in reading order: [id, title]. The readme ends with the build log's seven sections. */
const DOC_HEADINGS: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  graphics: [
    ['what-a-visual-is', 'What a visual is'],
    ['sizing', 'Sizing'],
    ['the-files', 'The files'],
    ['procedure', 'Procedure'],
    ['capturing', 'Capturing'],
    ['backgrounds', 'Backgrounds'],
    ['clips', 'Clips'],
    ['handing-off-to-a-post', 'Handing off to a post'],
    ['where-it-went-wrong-and-the-fix', 'Where it went wrong, and the fix'],
  ],
  readme: [
    ['what-is-here', 'What is here'],
    ['run-it', 'Run it'],
    ['read-first', 'Read first'],
    ['skills', 'Skills'],
    ['import-this-into-another-project', 'Import this into another project'],
    ['the-one-paragraph-tour', 'The one-paragraph tour'],
    ['license', 'License'],
    ['the-system-under-the-system', 'The system under the system'],
    ['the-line-law-and-the-auditors-that-hold-it', 'The line law, and the auditors that hold it'],
    ['the-dither-transitions-and-the-grid-they-run-on', 'The dither transitions, and the grid they run on'],
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
    ['8-where-it-ships', '8. Where it ships'],
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
    ['15-chrome-exceptions-kevin-asked-for', '15. Chrome exceptions Kevin asked for'],
    ['16-the-sidebars-rows', "16. The sidebar's rows"],
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
  agents: [
    ['read-in-this-order', 'Read in this order'],
    ['the-principles-in-brief', 'The principles in brief'],
    ['which-skill-to-load', 'Which skill to load'],
    ['the-handbook', 'The handbook'],
    ['house-rules', 'House rules'],
    ['working-in-this-repository', 'Working in this repository'],
    ['using-the-hub-in-another-project', 'Using the hub in another project'],
    ['ending-a-turn', 'Ending a turn'],
  ],
  'ship-loop': [
    ['0-ground-rules', '0. Ground rules'],
    ['1-the-line-audit', '1. The line audit'],
    ['2-the-page-check', '2. The page check'],
    ['3-the-practices-ratchet', '3. The practices ratchet'],
    ['4-types', '4. Types'],
    ['5-film-it', '5. Film it'],
    ['6-commit-and-back-up', '6. Commit and back up'],
    ['7-the-mirror', '7. The mirror'],
  ],
};

/** The h2 rows of each handbook document, in reading order: [id, title]. A snapshot, like DOC_HEADINGS; scripts/lint/registries.mjs reads both. */
const HANDBOOK_HEADINGS: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  readme: [
    ['the-documents', 'The documents'],
    ['how-the-handbook-relates-to-the-skills', 'How the handbook relates to the skills'],
    ['changing-the-handbook', 'Changing the handbook'],
    ['sources', 'Sources'],
  ],
  'operating-principles': [
    ['1-keep-going-until-everything-is-done', '1. Keep going until everything is done'],
    ['2-do-the-work-yourself-and-ask-once-for-what-only-kevin-can-do', '2. Do the work yourself and ask once for what only Kevin can do'],
    ['3-change-only-what-was-asked', '3. Change only what was asked'],
    ['4-keep-approved-work', '4. Keep approved work'],
    ['5-fix-the-whole-class', '5. Fix the whole class'],
    ['6-find-the-root-cause-and-guard-it', '6. Find the root cause and guard it'],
    ['7-measure-the-rendered-result', '7. Measure the rendered result'],
    ['8-show-the-result', '8. Show the result'],
    ['9-real-content-and-real-assets', '9. Real content and real assets'],
    ['10-ask-only-real-decisions-with-a-recommendation', '10. Ask only real decisions, with a recommendation'],
    ['11-correct-from-the-first-frame', '11. Correct from the first frame'],
    ['12-nothing-unnecessary-ships', '12. Nothing unnecessary ships'],
    ['13-prefer-free-and-cheap', '13. Prefer free and cheap'],
    ['14-secrets-stay-in-protected-files', '14. Secrets stay in protected files'],
    ['15-fully-means-complete', '15. "Fully" means complete'],
    ['16-codify-what-worked', '16. Codify what worked'],
    ['17-vendor-agnostic-agent-tooling', '17. Vendor-agnostic agent tooling'],
    ['18-privacy-on-public-surfaces', '18. Privacy on public surfaces'],
    ['where-the-procedures-live', 'Where the procedures live'],
    ['sources', 'Sources'],
  ],
  'quality-bar': [
    ['the-overall-bar', 'The overall bar'],
    ['reading-the-tables', 'Reading the tables'],
    ['pages', 'Pages'],
    ['motion', 'Motion'],
    ['graphics-and-diagrams', 'Graphics and diagrams'],
    ['copy', 'Copy'],
    ['pull-requests', 'Pull requests'],
    ['convergence-loops', 'Convergence loops'],
    ['performance', 'Performance'],
    ['films', 'Films'],
    ['charts', 'Charts'],
    ['repositories', 'Repositories'],
    ['done', 'Done'],
    ['sources', 'Sources'],
  ],
  'multi-session-playbook': [
    ['1-lanes', '1. Lanes'],
    ['2-forked-sessions', '2. Forked sessions'],
    ['3-one-instruction-to-several-sessions', '3. One instruction to several sessions'],
    ['4-shared-checkouts', '4. Shared checkouts'],
    ['5-collisions', '5. Collisions'],
    ['6-claude-and-codex-together', '6. Claude and Codex together'],
    ['7-relays', '7. Relays'],
    ['8-messages-across-lanes-and-repositories', '8. Messages across lanes and repositories'],
    ['9-resumption', '9. Resumption'],
    ['10-shared-resources', '10. Shared resources'],
    ['checklist', 'Checklist'],
    ['sources', 'Sources'],
  ],
  'gt-product-map': [
    ['1-positioning', '1. Positioning'],
    ['2-audience-and-the-sale', '2. Audience and the sale'],
    ['3-products', '3. Products'],
    ['4-context', '4. Context'],
    ['5-enterprise-and-plans', '5. Enterprise and plans'],
    ['6-copy-that-must-be-exact', '6. Copy that must be exact'],
    ['7-cli-and-agent-entry-points', '7. CLI and agent entry points'],
    ['8-repositories', '8. Repositories'],
    ['9-site-behaviour', '9. Site behaviour'],
    ['sources', 'Sources'],
  ],
  glossary: [
    ['company-and-products', 'Company and products'],
    ['repositories-and-places', 'Repositories and places'],
    ['design-vocabulary', 'Design vocabulary'],
    ['material-and-motion', 'Material and motion'],
    ['gates-and-tools', 'Gates and tools'],
    ['working-terms', 'Working terms'],
    ['kevins-shorthand', "Kevin's shorthand"],
    ['retired-terms', 'Retired terms'],
    ['sources', 'Sources'],
  ],
  decisions: [
    ['using-the-log', 'Using the log'],
    ['july-and-august-2026', 'July and August 2026'],
    ['september-2026', 'September 2026'],
    ['october-2026', 'October 2026'],
    ['superseded-july-practices', 'Superseded July practices'],
    ['recorded-elsewhere', 'Recorded elsewhere'],
    ['sources', 'Sources'],
  ],
};

const DOC_TITLE: Readonly<Record<string, string>> = {
  readme: 'Readme',
  ...Object.fromEntries(DOCS.map((doc) => [doc.slug, doc.title])),
};

const HANDBOOK_TITLE: Readonly<Record<string, string>> = {
  readme: 'Handbook readme',
  ...Object.fromEntries(HANDBOOK.map((doc) => [doc.slug, doc.title])),
};

const HEADINGS: readonly SearchEntry[] = [
  ...Object.entries(DOC_HEADINGS).flatMap(([slug, rows]) =>
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
  ),
  ...Object.entries(HANDBOOK_HEADINGS).flatMap(([slug, rows]) =>
    rows.map(
      ([id, title]): SearchEntry => ({
        id: `heading-handbook-${slug}-${id}`,
        title,
        href: `${docHref(slug, 'handbook')}#${id}`,
        group: 'Headings',
        meta: `In ${HANDBOOK_TITLE[slug] ?? slug}`,
        icon: 'book',
        keywords: `handbook ${HANDBOOK_TITLE[slug] ?? ''} heading section`,
        surface: 'handbook',
      })
    )
  ),
];

/** The 93 slide titles, in order: the first h1, h2 or .big of each deck/slides/NN-*.html; the ten mood slides carry no heading and are listed by their picture. Regenerate with the loop in the commit that added the mood pictures of writing when slides change. */
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
  'A proto-cuneiform tablet',
  'The name',
  'The mark',
  'The bar monogram',
  'The lockup',
  'The plate',
  'Double cut',
  'Livery stack',
  'The dithered monogram',
  'The monogram in ASCII',
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
  'Markdown twins',
  'Blog and content',
  'Blog index',
  'Generated covers',
  'A Devanagari manuscript',
  'Designed covers',
  'Blog content',
  'The copy test',
  'Site copy and founder posts',
  'A marginal gloss',
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

/** Every site map row, then the skill pages, the films, the headings and the slides, each with its haystack built: the panel groups and orders them. */
export const SEARCH_INDEX: readonly SearchEntry[] = [
  ...SITE_SURFACES.map(fromSurface),
  ...SKILL_ROWS,
  ...HANDBOOK_ROWS,
  ...MOTION_ROWS,
  ...HEADINGS,
  ...MOTION_HEADINGS,
  ...MOTION_RECORDS,
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
