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
    n: 25,
    label: '17',
    slug: 'sunburst-atelier',
    name: 'Sunburst Atelier',
    concept:
      'The Chrysler crown as a design system on GT\'s rail: a warm black ground, cream ink and champagne gold, with a stacked-arch crown and a chrome roundel over the hero headline and again over the dark band, a quarter sunburst in every section head, cream stepped-chevron friezes as the dividers, gold hairline frames, and the locales atlas set on the rays of one shared sunburst around the halftone globe.',
    tone: 'dark',
    signature: 'Five gold arcs with cream triangular windows and the GT monogram in a chrome roundel on the hub, standing over the hero headline and repeated over the dark band lede.',
  },
  {
    n: 26,
    label: '18',
    slug: 'spire-setbacks',
    name: 'Spire Setbacks',
    concept:
      'A 1930 tower elevation on cream limestone: GT\'s complete ruled-column system re-toned in ink, jade and brass, with doubled string courses that step one setback narrower down the page, a brass-framed locales directory, a stepped sunburst crown over the mark, a stepped frieze on the dark band, and a fixed elevator rail tracking the floor in view.',
    tone: 'light',
    signature: 'Every section head carries a brass doubled string course that steps one setback narrower down the page, with the section\'s pictogram seated on it as a cartouche, so the whole column reads as a stepped 1930 elevation while the rows below stay on the drafting grid.',
  },
  {
    n: 27,
    label: '19',
    slug: 'liner-timetable',
    name: 'Liner Timetable',
    concept:
      'A 1930s ocean-liner and railway timetable laid over GT\'s ruled column: deep green and burgundy ink on warm cream, gold doubled rules, numbered plates, and the translation demo read as a departures and arrivals board.',
    tone: 'light',
    signature: 'Every section head carries a numbered plate, a Roman numeral inside a gold lozenge whose engraved double ring is the brand\'s DoubledLine, while the code window and the capability marquee beside it become a departures and arrivals board in cream mono on the green-black panel.',
  },
  {
    n: 28,
    label: '20',
    slug: 'cassandre-poster',
    name: 'Cassandre Poster',
    concept:
      'The Cassandre poster school layered on GT\'s complete landing system: cream ground, midnight ink, vermilion as the one edge; the hero plate and the dark band are poster panels with one monumental geometric form each (the T component as a stepped monument, a Bayer-dithered fan of rays) and small mono captions, while everything between stays GT rail, flag chips, demos, bento and pricing.',
    tone: 'light',
    signature: 'The hero plate: the T component drawn as a stepped midnight monument in the brand\'s doubled line, standing on a dither-rendered fan of cream rays, with four mono captions pinned to the corners and a vermilion band along the plate\'s bottom edge.',
  },
  {
    n: 29,
    label: '21',
    slug: 'gilded-ledger',
    name: 'Gilded Ledger',
    concept:
      'A bound 1920s annual report printed on GT\'s ruled column: ivory paper, warm ink, gold-leaf frame rings, combed-marble endpaper bands at the section seams, a monogram cartouche over a Bodoni title, and the pricing file laid out as a two-leaf ledger spread bound by a doubled gold rule.',
    tone: 'light',
    signature: 'The .tc-hatch spacers become combed-marble endpaper bands (sections/deco/MarbleBand.tsx): parallel 1px gold hairline waves in one SVG pattern, placed after the hero, inside the bento, after the review and at the top of the pricing rail, so the page turns between sections like the leaves of a bound report.',
  },
  {
    n: 30,
    label: '22',
    slug: 'dithered-sunrise',
    name: 'Dithered Sunrise',
    concept:
      'GT\'s complete rail-system landing page on a warm near-black ground, carrying the deco sunburst as one documented ornament layer rendered entirely in ordered Bayer dither: a half sun on the hero plate, a dawn crest on every section head, Bayer-lattice dividers, and a full-bleed sunburst floor in the dark band, all in one gold.',
    tone: 'dark',
    signature: 'Light is quantized twice: every radial falloff is stepped into flat deco bands before the 8x8 Bayer screen turns each band into a lattice of gold cells, so the hero\'s half sun, the section crests and the dark band\'s floor share one stair-stepped sunburst and no smooth gradient exists anywhere on the page.',
  },
  {
    n: 31,
    label: '23',
    slug: 'bulb-marquee',
    name: 'Bulb Marquee',
    concept:
      'A theatre marquee in dots on GT\'s rail: the complete dither-field landing system in warm white and amber on charcoal, with Limelight headings seen through a round dot screen and amber bulb rows seated on the section heads, dividers, window bars, hero crown, board edge and dark band.',
    tone: 'dark',
    signature: 'The hero transmission plate becomes a letter board: a warm black fascia with a live-mark bar on top, bulb rows on all four edges (the top row chasing where motion is allowed), and the Bayer engine printing the greetings inside as the show now playing.',
  },
  {
    n: 32,
    label: '24',
    slug: 'bayer-frieze',
    name: 'Bayer Frieze',
    concept:
      'GT\'s complete landing system on cream and ink, with the deco ornament grammar (chevron courses, sawtooth rows, Greek keys, a sunrise, stepped keys) generated from one 4x4 Bayer matrix at 1/16, 4/16, 8/16 and 12/16 and laid as CSS mask friezes on the rail system\'s section heads, dividers, frames, hero crown and dark band; one jade edge; Inter with Jost on h1 and h2.',
    tone: 'light',
    signature: 'Every ornament on the page is a mask of unit cells thresholded from the same 4x4 Bayer matrix, so the Greek key on the transmission plate\'s edges, the sunrise around the mark, the beaded 4/16 mats on every mount and the five-row stepped divider bands read as one screen at four exposures, and the dark remap needs no second copy of any tile.',
  },
  {
    n: 33,
    label: '25',
    slug: 'quantized-temple',
    name: 'Quantized Temple',
    concept:
      'GT\'s complete dither-field landing page recut as a stepped temple: a gold ziggurat whose smoke quantizes into ordered dither as it rises, gilt frames, stepped crests that gain a course each section, and a dark-band summit dissolving into dots, set in Cinzel capitals on warm black.',
    tone: 'dark',
    signature: 'The hero plate is a five-course ziggurat rendered by the Bayer engine in gold, its smoke printing solid at the base course and quantizing into loose dots at the summit, standing on a single orange ember line.',
  },
  {
    n: 34,
    label: '26',
    slug: 'glyph-mosaic',
    name: 'Glyph Mosaic',
    concept:
      'Deco mosaic fields whose tesserae are real glyphs from seven scripts, laid at Bayer-screened densities into a hero sunburst, section-head crests and chevron friezes on GT\'s complete ruled-column landing system, in warm sand, warm ink, terracotta and gold.',
    tone: 'light',
    signature: 'The hero plate is a sunburst mosaic whose tesserae are real glyphs from seven scripts, laid only where a radial field clears the house 8x8 Bayer screen, alternate rays in gold and one course in terracotta around the disc, with a legend on the plate\'s edge that names each script and tags it with a LocaleTag chip.',
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
