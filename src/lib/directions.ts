import type { ShellShot } from '@/lib/shell-data';

export type Tone = 'dark' | 'light' | 'alt';

export type Direction = {
  /** Original exploration number from the 20-sample round. */
  n: number;
  /**
   * The number the founder refers to this version by. Explicit rather than
   * derived from array position so retired versions can drop out of the list
   * without breaking the numbers he uses in review notes.
   *
   * Absent on the outcome: what shipped is not one of the numbered attempts,
   * and giving it a number would put it in the running against them.
   */
  label?: string;
  /** Route segment under /d. */
  slug: string;
  name: string;
  concept: string;
  tone: Tone;
  /** The one motion moment this direction is built around. */
  signature: string;
  /**
   * A full site concept rather than a single exploration page: the slug is a
   * toolchain-based home and /d/<slug>/enterprise is its enterprise page.
   * The index lists these in their own section.
   */
  site?: boolean;
  /**
   * The outcome rather than a proposal: the site that actually shipped after
   * the directions were judged. Listed in its own section, after the three,
   * because it is what they produced and not another candidate.
   */
  reference?: boolean;
};

/**
 * The curated lineup. The maximalist round-one prototypes (old 00–09 and 11)
 * were retired from review on July 30, 2026 — their pages still exist under
 * src/app/d/ and answer at /d/<slug>, they just no longer appear here.
 */
export const DIRECTIONS: Direction[] = [
  {
    n: 22,
    label: '01',
    slug: 'toolchain',
    name: 'Toolchain',
    concept:
      'The minimalist evolution of the current site: one ruled column, bento rows whose shells never repeat, and a family of isometric line-art diagrams.',
    tone: 'light',
    signature: 'Structure from hairlines alone — no backgrounds, no ornament.',
  },
  {
    n: 22,
    label: '02',
    slug: 'chroma-flow',
    name: 'Chroma Flow',
    concept:
      'A curl-noise flow field pulls streaming color through the nameplate, and the product story reads as one continuous pipeline beneath it.',
    tone: 'light',
    signature: 'A double-line ribbon of flowing chroma carries the hero.',
  },
  {
    n: 22,
    label: '03',
    slug: 'dither-field',
    name: 'Dither Field',
    concept:
      'Hellos in eight scripts resolve out of Bayer noise and dissolve back, pixel by pixel, above data-led product rows.',
    tone: 'light',
    signature: 'The hero is an ordered-dither field breathing at 1 bit.',
  },
  {
    n: 22,
    label: '04',
    slug: 'aurora-paper',
    name: 'Aurora Paper',
    concept:
      'A grainy aurora drifts behind an otherwise disciplined paper page, and the product story is told as one working workspace.',
    tone: 'light',
    signature: 'A Resend-grade light wash behind a paper page.',
  },
  {
    n: 22,
    label: '05',
    slug: 'glyph-rain',
    name: 'Glyph Rain',
    concept:
      'A particle rain of world-script glyphs gathers into each word of the headline, holds, and re-scatters, above script-led product sections.',
    tone: 'light',
    signature: 'Characters from eight scripts condense into the headline.',
  },
  {
    n: 22,
    label: '06',
    slug: 'prism-light',
    name: 'Prism Light',
    concept:
      'One white beam splits through a glass prism and the translations ride the dispersion fan out, above delivery-led sections.',
    tone: 'light',
    signature: 'The burst re-exposed for paper, masked into the thread.',
  },
  {
    n: 2,
    label: '07',
    slug: 'lens-gate',
    name: 'Lens Gate',
    concept:
      'The ruled paper itself passes through one breathing glass — components enter in English, refract, and exit translated on the far side.',
    tone: 'light',
    signature: "The page's own rules bend through the lens and snap straight at the rim.",
  },
  {
    n: 6,
    label: '08',
    slug: 'paper-foundry',
    name: 'Paper Foundry',
    concept:
      'The bento machined into paper — hairline cells set into a brushed-graphite sheet, finished in strict reading order.',
    tone: 'light',
    signature: 'One anisotropic sheen sweep over a reading-order cell cascade.',
  },
  {
    n: 19,
    label: '09',
    slug: 'terminus-board',
    name: 'Terminus Board',
    concept:
      'A departure hall for locales — a split-flap headline over a flip-wave cell grid that lists languages the way a terminus lists trains.',
    tone: 'light',
    signature: 'The headline riffles through world scripts, settles into English, and cools through amber.',
  },
  {
    n: 21,
    label: '10',
    slug: 'wide-rule',
    name: 'Wide Rule',
    concept:
      'One analytic interference band crosses enormous quiet space, and the whole product story is set in the calm around it.',
    tone: 'light',
    signature: 'A film still — fringes dissolve into the null that holds the gate and the headline.',
  },
  {
    n: 23,
    label: '11',
    slug: 'event-horizon',
    name: 'Event Horizon',
    concept:
      'Component walls dive with curved perspective into a black-hole gate — English falls in, translations emerge, and flags orbit the horizon.',
    tone: 'light',
    signature: 'Collinear pairs cross the horizon — in as English, out translated.',
  },
  {
    n: 23,
    label: '12',
    slug: 'hourglass',
    name: 'Hourglass',
    concept:
      'Dark corridor walls of UI cards sweep concavely into a vanishing point, pinching at an hourglass waist that holds the mark, the flags, and the CTAs.',
    tone: 'dark',
    signature: 'The English wall flows into the waist; the translated wall flows out.',
  },
  {
    n: 23,
    label: '13',
    slug: 'singularity',
    name: 'Singularity',
    concept:
      'The enterprise gate: the lensing horizon alone on open paper, customers riding the locale belt, and a contact bay beneath it where glyphs rain through the dark.',
    tone: 'light',
    signature: 'Nothing competes with the mass: customers and locales orbit it.',
  },
  {
    n: 24,
    label: '14',
    slug: 'singularity-dossier',
    site: true,
    name: 'Dossier',
    concept:
      'The completed direction: a full site whose home folds the every-stack argument into the hero terminal (one less section), over an /enterprise page that reads as an evidence file, with exhibits, a certificate wall, and an audit ledger under the gate.',
    tone: 'light',
    signature: 'The every-stack section lives inside the hero terminal.',
  },
  {
    n: 24,
    label: '15',
    slug: 'singularity-orbit',
    site: true,
    name: 'Orbit',
    concept:
      'A showcase of the previous generation: orbit keeps its one-line hero and carries the system pieces the dossier retired, the windowed translation demo, the toolchain bento, the gravity well and instrument dials, the dark band, and the pricing file.',
    tone: 'light',
    signature: 'The hero terminal is one line and a strip, a far shorter first fold.',
  },
  {
    n: 24,
    label: '16',
    slug: 'singularity-signal',
    site: true,
    name: 'Signal',
    concept:
      'A showcase of the previous generation: signal keeps its split-pane hero and carries the sections the dossier retired, the pinned story cinema, the review workspace, the assurance strip, and the self-typing transmission log.',
    tone: 'light',
    signature: 'Session and output, side by side in one window.',
  },
  {
    n: 26,
    label: '18',
    slug: 'textile-block',
    name: 'Textile Block',
    concept:
      'The General Translation landing page as a Frank Lloyd Wright textile-block relief wall in horizontal courses. One square cast module is the grid; content sits on smooth cast faces, ornament is a library of six geometric reliefs (the Ennis cruciform, the Millard chevron, the Storer bar-and-slots, the Freeman stepped pyramid, the Aztec Hotel greca band, the running bond), and every course of the page is keyed to one relief. Light behind the perforated Ennis and Storer blocks is a live Bayer dither field; the shade the upper wall casts across the dark jade course is a static ramp of nested Bayer tiers. Every line on the page is a joint drawn once; every label on the wall is a header brick flush in a block\'s corner. A materials legend near the base names the six reliefs and the five materials from the same records that draw them.',
    tone: 'light',
    signature: 'The relief library used as a system: a named Wright block per course (Ennis, Millard, Storer, Freeman), perforated variants lit by Bayer dither, section heads cast as plaques carrying their course\'s relief swatch, header-brick locale chips, and hover that inverts any relief, ground and moss swapping.',
  },
  {
    n: 27,
    label: '19',
    slug: 'stepped-fret',
    name: 'Stepped Fret',
    concept:
      'Mitla fret strata: the page is a stack of horizontal registers bounded by five distinct Zapotec frets (stepped fret with coil, hooked step, stepped chevron, stepped diamond, opposed pair) drawn at three scales and assigned by register; each register\'s content block steps one fret step right and back down the page with the gutter it leaves filled with graded Bayer stone, so the grid itself is a stair. The hero is one monumental fret in ordered dither with the claim set in the step it leaves open, and the dark band is the same figure inverted: the Mitla facade in cream on black, and the hero\'s stair returning as six solid cream plates carrying the platform tiers.',
    tone: 'light',
    signature: 'The register stagger made material as a stair of graded Bayer stone descending the left margin, and the hero\'s monumental dither fret returning inverted in the dark band as a stair of cream plates under a three-course cream facade.',
  },
  {
    n: 29,
    label: '21',
    slug: 'glazed-bond',
    name: 'Glazed Bond',
    concept:
      'General Translation as an Ishtar Gate elevation in the Babylonian revival of Art Deco. Two battered towers with stepped, turquoise-capped parapets flank a corbelled arch that holds the claim; every section below is one more course of the elevation, its content set as glazed panels into running-bond brick, with gold rosette bands on lapis crossing the towers between courses. The T proof is laid as Flemish bond with glazed headers: a lapis header brick (the flag chip) beside every cream stretcher (the translation), the source string as the one gold brick. Languages are three courses of rosette medallions with the endonym at each center. The four product surfaces sit as tablets in a lapis inner court under its own two-step crenellation. The story is a three-tier ziggurat. Pricing is a gate in miniature: two towers carrying the plans as gold plaques, the rate ledger as the lapis opening. Every glazed surface catches light as ordered Bayer dither from one shared set of tiles; no gradient anywhere. Geometry only.',
    tone: 'light',
    signature: 'Flemish bond with glazed lapis headers as the T proof, the source as a gold brick, and a Bayer-dither glaze sheen at the arris of every glazed surface, all set on a crenellated gate elevation.',
  },
  {
    n: 31,
    label: '23',
    slug: 'brick-lattice',
    name: 'Brick Lattice',
    concept:
      'The whole page is one glazed-brick wall in running bond, and every brick is an ordered-dither cell. Density on the Bayer screen draws the ornament from a six-pattern book, one pattern per section: a rosette field behind the claim, chevron courses behind the wall of translations, the inverted lattice of the kiln with ziggurat setbacks and merlons, meander registers around the medallions of the languages band, palmette fans under the glazed pricing panels, and the stepped foundation under the footer where the book itself is printed. Copy sits on smooth glazed panels with stepped parapet corners cut out of the lattice; every named panel carries a glazed header course the way the wall\'s bricks do. The T proof is one source brick lighting its neighbours, in the DOM bricks and in the lattice behind them at once. Everything is complete at rest; hover and motion only add.',
    tone: 'light',
    signature: 'One source brick fires and its neighbours light course by course through four Bayer tiers to solid lapis, while the same ring of density runs out through the chevron lattice behind the wall; at rest the wall stands fired and the source lit.',
  },
  {
    n: 32,
    label: '24',
    slug: 'screenfold-codex',
    name: 'Screenfold Codex',
    concept:
      'The landing page as a Maya screenfold: one strip of bark-paper cream folded into ten leaves, each a red-oxide-framed page cut into horizontal registers by red rules. Every leaf is a parallelogram whose side edges run a fixed 40px across from top to bottom, adjacent leaves running opposite ways, so every crease lines up exactly and the strip\'s silhouette zigzags down the page like an accordion pleat seen off its axis. The folds between leaves are stepped Bayer troughs (inked at a valley with a solid crease hairline, red oxide at a mountain with a bare-paper ridge). Dither is the writing: twelve geometric signs carved through dithered squares form a documented vocabulary, each standing for one product concept (strings, build, runtime, CLI, dashboard, review, locale, languages, routing, edge, context, tokens) and printed wherever that concept appears, with the key on the back board. Bar and dot is the counting: every figure prints in the Maya numeral beside its Arabic form, with the key on leaf one. The living material is the real product: the shipped Next.js sample, both TranslateWindow belt strings in five locales, the component outputs, the review rows, the 120-row locale roster, the published rate ledger, the shipped feature grid.',
    tone: 'light',
    signature: 'Parallelogram leaves with a fixed lean that alternates per panel so every crease aligns; stepped-trough dither hinges seated on the crease span; a twelve-sign glyph-square vocabulary keyed on the back board; bar-and-dot numerals beside every count, price, ordinal, rate, and yes/no cell; the fold map, the whole strip in miniature as the hero\'s table of contents.',
  },
  {
    n: 33,
    label: '25',
    slug: 'raking-relief',
    name: 'Raking Relief',
    concept:
      'A bas-relief alabaster wall under a raking light from the left, made monumental. Every form on the page is carved by one consistent light: raised tablets catch a lit edge on their left and top and cast a stepped Bayer-tier shadow to their right and below (dense beside the tablet, thinning outward, one exact ramp mask per strip); sunk registers hold the rim\'s shadow inside their left and top edges and a lit inner wall on their right and bottom; carved headings cast a dithered shadow and incised strings show the lit lip of their cut. Geometric relief bands from the Ishtar Gate, the Guardian Building and Mitla (rosette, palmette, chevron, guilloche, stepped fret) run between the courses and frame every raised tablet. The content is inscription: the claim in Cinzel capitals under a sun-disk crown, the same claim incised in its sixteen shipped locales, the Next.js source raised beside its eight translations cut into the wall with lapis locale inlays, the locales as a rosette band with the word for language in nine scripts, the agent on a stele inside a shadowed recess with a stepped niche head, the published rates on three tablets under ziggurat caps with the shipped compare ledger sunk beneath. Alabaster and warm shadow, one lapis inlay.',
    tone: 'light',
    signature: 'Stepped Bayer-ramp shadows that make every tablet, register, button, heading and string read as carved under the same left-hand light, framed by geometric relief bands.',
  },
  {
    n: 34,
    label: '26',
    slug: 'calendar-rings',
    name: 'Calendar Rings',
    concept:
      'A General Translation landing page as one concentric disk that works as an instrument. Ground and dither rings alternate outward from the source at the center and every ring reads something real: the claim in the hub inside the jade source circle, the name inscribed on ring one, the four product surfaces labelled along ring two, the seven usage rates as bar-and-dot numerals knocked out of ring three, the twenty locales of the outer ring as flag chips on ring four, and a rim notched once per locale. A stepped plinth carries the sub, the CTAs and a six-cell key that says how to read the disk. Every later section unrolls one ring into a wide arc band with radial cells, notch ticks and numerals seated on the arc: the customers, the T component as a half disk around its source window, the stack and the nine-beat pipeline in the negative ring floored by the disk itself inverted, the languages in two bands of ten in the disk\'s own order with a variants register, and the pricing file as seven rate segments plus two plan segments. Lineage is the Aztec and Maya revival of 1920s deco, geometry only (Sun Stone, Dresden Codex numerals, Aztec Hotel registers); palette is obsidian, fired clay, jade and gold.',
    tone: 'light',
    signature: 'The disk as a readable instrument: four surface labels on arc paths, seven knocked-out numerals, twenty flag chips on the outer ring, two notched edges turning against each other; then the same disk inverted, rising cut from the floor of the dark band.',
  },
  {
    n: 35,
    label: '27',
    slug: 'talud-tablero',
    name: 'Talud-Tablero',
    concept:
      'The General Translation landing page as a stepped platform in the Teotihuacan talud-tablero profile. Every section is one terrace module: a framed tablero (the rectangular content panel with a red oxide projecting frame and a hairline molding each side) over a sloped talud (a clip-path trapezoid of Bayer-tiled volcanic stone that carries the ornament, the stair, or a load of chips and cells). Each terrace is one step wider than the one above it (data-tier 6 down to 0), so the page silhouette is a pyramid in elevation: the claim on the top platform, a stair axis with treads and two red alfardas descending through every talud, a full-bleed volcanic-stone plaza at the foot (the dark moment), and a lower platform beyond it carrying the pricing file as three tableros of increasing frame depth and the footer as the base course. Language as the oldest technology, carried on a platform built in registers.',
    tone: 'light',
    signature: 'Stepped-pyramid page silhouette: red-framed cream tableros widening down the page, connected by sloped dotted stone bands, with one central stair of treads and red alfardas running through every band into a dark plaza. Hero plate is a Bayer-dithered talud-tablero platform in front of a shaded disc; the hero crown is a bar-and-dot 118.',
  },
  {
    n: 36,
    label: '28',
    slug: 'apadana-grid',
    name: 'Apadana Grid',
    concept:
      'The General Translation landing page as the floor plan of a hypostyle hall seen from above. Every section is a hall in plan: a strict square grid of column bases (three concentric rings, the middle one dashed so each dash is one flute) on every axis intersection, with the bays between the columns holding the content. The halls follow one another down the page with different column counts and the pitch is derived from each: the portico (6 by 2, pitch 200) holds the claim between its two rows with two sun-disk dither plates in the outer bays and double-volute capitals over the front row and mirrored under the back row; a 4 by 4 bay hall proves the T component with the source code window at the center and eight locale builds of "Scale to every language" in the surrounding bays, each flag chip seated beside its column base as a nameplate; the great hall (6 by 6, twenty-five bays) sets one locale per bay around the halftone globe, zh-Hans and zh-Hant flanking the center, with the four-row variants register beneath; the throne hall at night is the dark moment, a full-bleed black-basalt band with a gold-hairline 3 by 3 field whose four rooms are the product surfaces (six-stack code window, the gt translate terminal, the review workspace, the Locadex trace) over a dithered lamplight floor; the treasury sets the seven-row rate ledger and then frames Starter, the footnotes with the compare link, and Enterprise in three bays; the rear portico is the footer\'s four link columns. The page\'s rails are drawn as walls with thickness (two faces ten pixels apart with a hairline hatch between, the draughtsman\'s poché). Language is the oldest technology; the hall that received every embassy is the frame.',
    tone: 'light',
    signature: 'A page of circles on a square grid: column bases with fluted rings on every intersection, content in the bays between them, six halls of different column counts stacked down the page, the portico\'s double-volute capitals as pure arcs over the claim, and a black-basalt throne hall in gold hairline.',
  },
  {
    n: 37,
    label: '29',
    slug: 'clay-tablet',
    name: 'Clay Tablet',
    concept:
      'The page is a museum case of clay tablets. Every section is one tablet: a fired-clay slab with 12px pillow corners, ruled into registers and columns, sitting on a dark wet-clay case ground between hairline shelf lines, each with a museum label (catalogue numeral, name, one line of fact) under it. The signature device is the wedge dither: the cuneiform wedge (a triangular head with a tail, geometry only, never a sign) is the cell of an ordered Bayer dither. Every grid cell reads a scalar field and compares it against the 8x8 Bayer threshold from src/lib/dither.ts; a lit cell takes a vertical wedge, and above half tone a second pass against the transposed matrix lays a horizontal wedge across it, so tone is impression density and never a gradient. The hero is the largest tablet: the claim "Scale to every language" in Forum as one shaped text node with lang and dir, re-impressed through the sixteen shipped locales by a clip-path stylus wipe; a rosette frieze (five lobed disks, the Assyrian border repeat) in wedge dither below it, rendered server-side as SVG so it is complete before any script runs; a lapis seal at the corner (a disk ringed by eighteen radial wedges carrying the GT monogram in slip); and the colophon with the six customer marks masked into the page ink. The T component proof follows the Behistun inscription: the shipped gt-next sample in the first column, then one column per locale (es, ja, de, fr, zh) under its flag-chip seal, the three outputs of the sample (h1, DateTime, Num) impressed in each, the columns divided by doubled threads, the translate run as the bottom register. The one dark moment is a black-stone stele among the clay that stays black in both themes, with the stack in seven registers, the gt cli terminal with five LocaleTag chips, the closing acts, and the wedge dither in motion on a canvas at its foot. Pricing is three small tablets on one shelf: the seven-row rate ledger with both footnotes, Starter $0, Enterprise Custom. Palette: fired clay #cfa87b (tablet face), wet clay dark #2a1a10 (ink and case), cream slip #efe4d0 (code and workspace panels), one lapis #2447a3 (seals, the active column edge, the zh-Hans/zh-Hant tell ring). Dark mode turns the tablets to wet clay, the ink to slip, the case to #070707.',
    tone: 'light',
    signature: 'The wedge dither: a cuneiform wedge as the Bayer dither cell, with a second crossed-wedge pass above half tone. Seen in the hero\'s five-rosette frieze, the wedge rule under every tablet head, the wedge rules between the twenty script cells, the ramp band at the foot of the languages tablet, and the stele\'s rising canvas field. Secondary signatures: the lapis seal with the GT monogram, the doubled-thread column rules, and the slip museum labels under each tablet.',
  },
  {
    n: 23,
    slug: 'production',
    name: 'Shipped',
    concept:
      'What the directions produced: the site now live at generaltranslation.com, rebuilt here page for page.',
    tone: 'light',
    signature: 'The one that shipped — the three below, resolved into a real codebase.',
    site: true,
    reference: true,
  },
];

export function getDirection(slug: string): Direction | undefined {
  return DIRECTIONS.find((d) => d.slug === slug);
}

/**
 * Where a direction's own page on the viewer shell is: /directions/<slug>
 * for the three sites and the thirteen explorations. The shipped reference
 * has no page of its own beyond its prototype, so it answers /d/production,
 * and a caller never branches on the reference flag.
 */
export function directionPageHref(slug: string): string {
  const direction = getDirection(slug);
  return direction?.reference ? `/d/${direction.slug}` : `/directions/${slug}`;
}

/**
 * The 1440 by 900 captures of a direction, or of one of its pages
 * (`singularity-dossier-enterprise`), in both themes: public/shots/light
 * and public/shots/dark hold one file per stem.
 */
export function directionShots(stem: string): ShellShot {
  return { light: `/shots/light/${stem}.jpg`, dark: `/shots/dark/${stem}.jpg` };
}

/** One page of a direction: its home, or a site's enterprise page. The id is the surfaces.ts id, so a preview resolves. */
export type DirectionPage = { id: string; name: string; href: string; shot: ShellShot };

/** The pages a direction answers: the home for every direction, and the enterprise page for a site. */
export function directionPages(d: Direction): readonly DirectionPage[] {
  const home: DirectionPage = { id: d.slug, name: 'Home', href: `/d/${d.slug}`, shot: directionShots(d.slug) };
  if (!d.site) return [home];
  return [
    home,
    {
      id: `${d.slug}-enterprise`,
      name: 'Enterprise',
      href: `/d/${d.slug}/enterprise`,
      shot: directionShots(`${d.slug}-enterprise`),
    },
  ];
}

/** Every slug with a page at /directions/<slug>: the lineup without the shipped reference. */
export const DIRECTION_PAGE_SLUGS: readonly string[] = DIRECTIONS.filter((d) => !d.reference).map((d) => d.slug);
