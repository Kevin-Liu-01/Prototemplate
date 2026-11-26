/**
 * /ideas: the one registry behind the ideas page. Each group is one
 * General Translation surface; its rows are the references it took from,
 * then what was made from them, with the version Kevin chose or shipped
 * marked. Pure data; the viewer renders it and the shell's list reads
 * the same rows.
 *
 * The readiness artwork and the brand references are web copies in
 * public/media/ideas; every other picture is a capture this site already
 * serves (/shots/atlas, /shots/pages, /shots/light). Outside work is named
 * and linked, never captured.
 */

/** One version of a made thing: a capture at its own size. */
export type IdeaCut = { key: string; label: string; src: string; w: number; h: number };

/** One picture in a reference grid, with its caption. */
export type IdeaPicture = { src: string; w: number; h: number; label: string; alt: string };

export type IdeaLink = { href: string; label: string };

export type IdeaRow = {
  id: string;
  /** the position in the whole page, padded (`07`) */
  n: string;
  /** a reference the surface took from, or a thing made from those references */
  kind: 'source' | 'made';
  title: string;
  /** the sidebar's name when the title runs long */
  short?: string;
  body: string;
  /** the mark on the version Kevin picked: `Chosen` for a pick, `Shipped` once it is live */
  pick?: 'Chosen' | 'Shipped';
  links?: readonly IdeaLink[];
  /** a path in a Prototemplate checkout, shown as code */
  path?: string;
  cuts?: readonly IdeaCut[];
  pictures?: readonly IdeaPicture[];
  /** the credit under a reference grid */
  credit?: string;
};

export type IdeaGroup = {
  id: string;
  label: string;
  lead: string;
  rows: readonly IdeaRow[];
};

const M = '/media/ideas';
const PAGES = '/shots/pages';

const cut = (key: string, label: string, src: string, w: number, h: number): IdeaCut => ({ key, label, src, w, h });

/** A readiness artwork: the sample score in light and the high score in dark at 1440 wide, the sample on a phone. */
const artwork = (name: string, h1440: number, h390: number): readonly IdeaCut[] => [
  cut('sample', 'Sample score, light', `${M}/${name}-sample-light.webp`, 2204, h1440),
  cut('high', 'High score, dark', `${M}/${name}-high-dark.webp`, 2204, h1440),
  cut('phone', 'Phone, light', `${M}/${name}-phone-light.webp`, 776, h390),
];

/** A page capture at 1440 by 900 in both themes. */
const themes = (id: string): readonly IdeaCut[] => [
  cut('light', 'Light', `${PAGES}/${id}-light.jpg`, 1440, 900),
  cut('dark', 'Dark', `${PAGES}/${id}-dark.jpg`, 1440, 900),
];

const ref = (name: string, w: number, h: number, label: string, alt: string): IdeaPicture => ({
  src: `${M}/ref-${name}.webp`,
  w,
  h,
  label,
  alt,
});

type RowInput = Omit<IdeaRow, 'n'>;
type GroupInput = Omit<IdeaGroup, 'rows'> & { rows: readonly RowInput[] };

const GROUPS_INPUT: readonly GroupInput[] = [
  {
    id: 'readiness',
    label: 'Readiness pages',
    lead: 'Pages that score how ready a product is for other languages, out of 100, one page per industry. The artwork draws Acme, a made-up SaaS product, as General Translation would translate it, and the visitor’s score sets how much of it is translated.',
    rows: [
      {
        id: 'reflex',
        kind: 'source',
        title: 'Reflex’s AI readiness score',
        body: 'Reflex’s page “Get your factory’s AI readiness score” asks one question per screen, sets four answers in a two by two grid, waits for Continue after each pick and ends on a score out of 100. The readiness pages take the same flow.',
        links: [{ href: 'https://reflex.dev/manufacturing-survey/', label: 'reflex.dev' }],
      },
      {
        id: 'app-window',
        kind: 'made',
        title: 'App window',
        body: 'Acme’s billing page in a browser window, set in German. At a low score the strings General Translation has not translated yet stay in English with a red underline; at a high score every string, price and date is in German.',
        pick: 'Chosen',
        cuts: artwork('app-window', 1282, 1490),
      },
      {
        id: 'iso-surfaces',
        kind: 'made',
        title: 'Isometric surfaces',
        body: 'Five of Acme’s screens (the docs, an invoice, the welcome page, pricing and the release notes) stand in an isometric room around General Translation’s mark. A screen still in English is screened with a dither, and a translated screen turns solid in its own language, script and currency.',
        cuts: artwork('iso-surfaces', 1108, 780),
      },
      {
        id: 'dither-surfaces',
        kind: 'made',
        title: 'Dithered print',
        body: 'Acme’s overview, an email, an invoice, the pricing page and the docs as a 1-bit print. A surface still in English is drawn in dotted rules, and a translated one in solid rules in Japanese, German, Arabic, French or Korean.',
        cuts: artwork('dither-surfaces', 1282, 1194),
      },
    ],
  },
  {
    id: 'atlas',
    label: 'Atlas',
    lead: 'Atlas is General Translation’s magazine for long writing, served at generaltranslation.com/atlas. Its first model was Stripe Press, and the magazine took its inside pages from printed magazines.',
    rows: [
      {
        id: 'stripe-press',
        kind: 'source',
        title: 'Stripe Press',
        body: 'Stripe Press keeps its books on one shelf, each with a cover designed for it. Atlas began as that shelf, and the magazine still gives every story its own cover, art and colors.',
        links: [{ href: 'https://press.stripe.com', label: 'press.stripe.com' }],
      },
      {
        id: 'printed-magazines',
        kind: 'source',
        title: 'Printed magazines',
        body: 'The inside pages are set on a Swiss grid after a printed museum magazine: an opening spread across the gutter, two columns under a running head, and pictures placed by their shape. Beside the text, the stage changes as the reader reaches each figure, as in a New York Times feature.',
      },
      {
        id: 'atlas-shelf',
        kind: 'made',
        title: 'The shelf',
        body: 'The first take: the stories as hardcovers on one shelf, each read in a look of its own. The book under the pointer turns to face the reader.',
        links: [{ href: '/atlas/shelf', label: 'Open the shelf' }],
        cuts: [cut('shelf', 'Shelf', '/shots/atlas/shelf.webp', 1920, 1200), cut('covers', 'Covers', '/shots/atlas/covers.webp', 1920, 640)],
      },
      {
        id: 'atlas-directions',
        kind: 'made',
        title: 'Seven cover directions',
        short: 'Cover directions',
        body: 'Taylor Fang’s seven directions for opening Atlas on one issue, the first Chinese translation of Euclid. Riffle, the first, became the magazine’s form.',
        links: [{ href: '/atlas/directions', label: 'Open the directions' }],
        cuts: [cut('directions', 'All seven', '/shots/atlas/directions.webp', 1920, 2421)],
      },
      {
        id: 'atlas-magazine',
        kind: 'made',
        title: 'The magazine',
        body: 'Each story is a thin magazine printed on its own stock. Its corner lifts to a map sheet of the story’s place, and a click opens the magazine to turn its pages.',
        pick: 'Shipped',
        links: [
          { href: '/atlas', label: 'Open Atlas' },
          { href: '/atlas/notes', label: 'Read the notes' },
        ],
        cuts: [
          cut('front', 'Front page', '/shots/atlas/rack.webp', 1920, 1200),
          cut('spread', 'Spread', '/shots/atlas/spread.webp', 1920, 1200),
          cut('pages', 'Pages', '/shots/atlas/pages.webp', 1920, 1200),
          cut('phone', 'Phone', '/shots/atlas/phone.webp', 780, 1688),
        ],
      },
    ],
  },
  {
    id: 'brand',
    label: 'Brand',
    lead: 'The General Translation identity, kept in the brand book and the deck. The references come from the brand questionnaire, and the deck opens its Visual references slide with them.',
    rows: [
      {
        id: 'visual-references',
        kind: 'source',
        title: 'Visual references',
        body: 'International Style typography and grids first, Art Deco second: Swiss grids, blueprints and rectangular forms, water as a recurring theme, and an ordered dither as the only texture.',
        pictures: [
          ref('brockmann', 502, 720, 'Müller-Brockmann, 1955', 'Beethoven poster by Josef Müller-Brockmann'),
          ref('aicher', 720, 399, 'Aicher, Munich 1972', 'Otl Aicher pictograms at the Munich Olympic station'),
          ref('vignelli', 720, 484, 'Vignelli map, 1972', 'The 1972 Vignelli subway map'),
          ref('solari', 720, 480, 'Split-flap board', 'A Solari split-flap departure board'),
          ref('chart', 720, 677, 'NOAA chart', 'A NOAA chart'),
          ref('rosetta', 615, 720, 'Rosetta Stone', 'The Rosetta Stone'),
          ref('chrysler', 394, 720, 'Chrysler Building', 'The spire of the Chrysler Building'),
          ref('whole-earth', 545, 720, 'Whole Earth Catalog', 'The back cover of the Whole Earth Catalog'),
          ref('subway-sign', 720, 540, 'Transit signage', 'A New York subway sign set in Helvetica'),
          ref('rams', 487, 720, 'Braun ET66, Dieter Rams', 'The Braun ET66 calculator by Dieter Rams'),
          ref('stamp', 720, 521, 'Olympic stamp, 1964', 'A 1964 Olympic stamp'),
        ],
        credit: 'The photographs come from Wikimedia Commons and are shown in grayscale.',
      },
      {
        id: 'craft-references',
        kind: 'source',
        title: 'Craft references',
        body: 'For craft the brand looks to Vercel, Resend, Stripe Press, Linear and Cursor.',
      },
      {
        id: 'brand-book',
        kind: 'made',
        title: 'The brand book',
        body: 'The identity as rules: the name, the colors, the type, the marks, language as material and the avoid list.',
        pick: 'Shipped',
        links: [{ href: '/brand', label: 'Open the brand book' }],
        cuts: themes('brand'),
      },
      {
        id: 'brand-deck',
        kind: 'made',
        title: 'The deck',
        body: 'The brand deck: every rule of the identity on a slide, with the references, the mood pictures and the openers.',
        pick: 'Shipped',
        links: [{ href: '/deck', label: 'Open the deck' }],
        cuts: themes('deck'),
      },
    ],
  },
  {
    id: 'site',
    label: 'Site redesign',
    lead: 'The generaltranslation.com redesign, explored as running directions in the design lab before one shipped.',
    rows: [
      {
        id: 'reference-sites',
        kind: 'source',
        title: 'Reference sites',
        body: 'The research ranks the sites from the bookmarks with what to take from each: Linear for restraint and type, Vercel for the blueprint grid and one light source, Lusion for interaction, Obys for editorial pacing and Locomotive for the feel of scrolling.',
        path: 'docs/research/inspo.md',
      },
      {
        id: 'site-directions',
        kind: 'made',
        title: 'The directions',
        body: 'Each direction is a real page in the design lab. These three are among the ones explored.',
        links: [{ href: '/', label: 'Open the design lab' }],
        cuts: [
          cut('dither-field', 'Dither Field', '/shots/light/dither-field.jpg', 1440, 900),
          cut('terminus-board', 'Terminus Board', '/shots/light/terminus-board.jpg', 1440, 900),
          cut('singularity', 'Singularity', '/shots/light/singularity.jpg', 1440, 900),
        ],
      },
      {
        id: 'site-shipped',
        kind: 'made',
        title: 'The shipped site',
        body: 'The home page of generaltranslation.com as it is live.',
        pick: 'Shipped',
        links: [{ href: '/d/production', label: 'Open the production mirror' }],
        cuts: themes('live-home'),
      },
    ],
  },
  {
    id: 'docs',
    label: 'Docs',
    lead: 'The General Translation docs at generaltranslation.com/docs, rewritten for people and for agents. The post on the rewrite names its models.',
    rows: [
      {
        id: 'docs-writing',
        kind: 'source',
        title: 'Writing on docs',
        body: 'Lee Robinson on keeping the first visit simple, Fuma Nama on structure and navigation, and Devin Logan on docs that agents read.',
        links: [
          { href: 'https://leerob.com/docs', label: 'Lee Robinson' },
          { href: 'https://www.fuma-nama.dev/blog/good-docs', label: 'Fuma Nama' },
          { href: 'https://buildwithfern.com/post/agent-friendly-docs', label: 'Devin Logan' },
        ],
      },
      {
        id: 'docs-admired',
        kind: 'source',
        title: 'Docs we admire',
        body: 'Linear for clarity, Replicate for navigation, shadcn/ui for design, Next.js for developer language, Convex for visuals and Stripe for embedded functionality.',
        links: [
          { href: 'https://linear.app/docs', label: 'Linear' },
          { href: 'https://replicate.com/docs', label: 'Replicate' },
          { href: 'https://ui.shadcn.com/docs', label: 'shadcn/ui' },
          { href: 'https://nextjs.org/docs', label: 'Next.js' },
          { href: 'https://docs.convex.dev/home', label: 'Convex' },
          { href: 'https://docs.stripe.com', label: 'Stripe' },
        ],
      },
      {
        id: 'docs-shipped',
        kind: 'made',
        title: 'The docs',
        body: 'The docs as they are live, after the rewrite.',
        pick: 'Shipped',
        links: [{ href: '/blog/rewriting-our-docs', label: 'Read the post' }],
        cuts: themes('live-docs'),
      },
    ],
  },
];

export const IDEA_GROUPS: readonly IdeaGroup[] = (() => {
  let n = 0;
  return GROUPS_INPUT.map((group) => ({
    ...group,
    rows: group.rows.map((row) => {
      n += 1;
      return { ...row, n: String(n).padStart(2, '0') };
    }),
  }));
})();

const ROWS = IDEA_GROUPS.flatMap((group) => group.rows);

export const IDEA_ROW_COUNT = ROWS.length;

/** The references: every source row. */
export const IDEA_SOURCE_COUNT = ROWS.filter((row) => row.kind === 'source').length;

/** The things made from them: every made row. */
export const IDEA_MADE_COUNT = ROWS.filter((row) => row.kind === 'made').length;
