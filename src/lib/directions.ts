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
      'Real art deco in black and champagne gold: the Chrysler Building crown becomes the design system, and the world-scripts section sets twelve real greetings on the rays of one shared sunburst so languages literally radiate from a single source component.',
    tone: 'dark',
    signature: 'A Chrysler-crown hero of five stacked gold arc bands with alternating filled and hollow triangular ray windows, with the GT monogram seated in a slowly rotating chrome roundel at the fan\'s origin.',
  },
  {
    n: 26,
    label: '18',
    slug: 'spire-setbacks',
    name: 'Spire Setbacks',
    concept:
      'The page is a 1930 tower drawn in elevation on cream limestone: every section is a double-ruled setback that steps 84px narrower as you descend, the nav is the entrance canopy, a fixed elevator panel tracks your floor, the locales section is a brass floor directory with each language as a floor line in its own script, and the elevation terminates in a stepped finial and mast.',
    tone: 'light',
    signature: 'The stepped-setback page silhouette itself: seven double-ruled sections each 84px narrower than the last, seamed by engraved floor-plate cartouches, so scrolling down the page reads as riding the tower up to the finial.',
  },
  {
    n: 27,
    label: '19',
    slug: 'liner-timetable',
    name: 'Liner Timetable',
    concept:
      '1930s ocean-liner timetable graphics, deep green and burgundy on warm cream with gold rules and engraved double borders, restating localization as scheduled passage between languages: a departure/arrival proof of the T component, a departures board dashboard, and luggage-label locale chips in twelve real scripts.',
    tone: 'light',
    signature: 'A code-drawn Art Deco liner poster inside the hero\'s engraved double frame, whose departure pane (real gt-next source) and arrival pane (the same card cycling through EN, ES, JA, and RTL AR) are joined by a gold route line with a rotated-diamond T badge.',
  },
  {
    n: 28,
    label: '20',
    slug: 'cassandre-poster',
    name: 'Cassandre Poster',
    concept:
      'The A.M. Cassandre poster school as a landing page: each section is a full-bleed midnight-vermilion-cream poster panel with one enormous geometric form and small precise caption type, and the T component is the monumental subject.',
    tone: 'dark',
    signature: 'The hero draws the T component as a head-on Normandie liner prow in inline SVG, with a vermilion boot-top waterline, cream bow waves, and a drifting sea band of twelve real world-script greetings beneath it.',
  },
  {
    n: 29,
    label: '21',
    slug: 'gilded-ledger',
    name: 'Gilded Ledger',
    concept:
      'A 1928 annual report as a website: ivory paper, warm ink, gold-leaf rules, marbled endpaper bands, and double-rule frames turn GT\'s precision into fine bookmaking, with the T component as an engraved plate, the locales as a colophon of scripts, and pricing as a two-page ledger spread.',
    tone: 'light',
    signature: 'The pricing section is a bound two-page ledger spread inside one double-rule gold frame, with a spine-gutter shadow, dotted-leader rate rows, and a gold double-rule footnote block.',
  },
  {
    n: 30,
    label: '22',
    slug: 'dithered-sunrise',
    name: 'Dithered Sunrise',
    concept:
      'Art deco sunrise where every light ramp is ordered Bayer dither, gold cells on near-black, with a live quantized sun as the hero and dithered dawn arcs opening every section.',
    tone: 'dark',
    signature: 'A full-viewport hero sun rendered live as 8x8 Bayer dither on canvas, solid gold metal at the disc resolving to sparse 3px dots at the ray tips, with concentric dawn arcs drifting slowly outward.',
  },
  {
    n: 31,
    label: '23',
    slug: 'bulb-marquee',
    name: 'Bulb Marquee',
    concept:
      'A theatre marquee built entirely from dots: chasing bulb rows frame the sign, the headline is dot-matrix Limelight lettering, and the T component demo is the show now playing in twelve languages with each hello lit in sequence.',
    tone: 'dark',
    signature: 'The hero headline is rendered as a grid of glowing amber bulbs clipped to Limelight glyphs (a radial-gradient dot field with background-clip: text over a faint solid underlay), so the type itself reads as a lit marquee sign.',
  },
  {
    n: 32,
    label: '24',
    slug: 'bayer-frieze',
    name: 'Bayer Frieze',
    concept:
      'The entire art deco ornament grammar (Greek-key meander, chevrons, stepped keys, sunrise fans, stripe borders) is generated from one Bayer 4x4 dither matrix at four stepped densities on cream and ink with a single jade accent.',
    tone: 'light',
    signature: 'A full-width dithered Greek-key meander band that closes the hero and crawls one 48px unit at a time, inverted to cream-on-ink at the footer.',
  },
  {
    n: 33,
    label: '25',
    slug: 'quantized-temple',
    name: 'Quantized Temple',
    concept:
      'Dither-focused art deco: stepped ziggurat tiers of silk orange-and-gold gradients that quantize into ordered-dither dots as they rise, with greetings in twelve scripts hung in the drapery folds.',
    tone: 'dark',
    signature: 'A CSS-stepped ziggurat monument engraved with the <T> glyph whose crown dissolves into a live Bayer-dithered smoke canvas of ember-to-gold squares.',
  },
  {
    n: 34,
    label: '26',
    slug: 'glyph-mosaic',
    name: 'Glyph Mosaic',
    concept:
      'Dither-focused art deco: the GT monogram set as a Chrysler-lobby floor mosaic whose tesserae are real glyphs from eight writing systems, on warm sand with terracotta, ink, and gold, with a legend that names each script by color.',
    tone: 'light',
    signature: 'A single hero canvas that dithers roughly three thousand glyph tesserae from eight scripts into the GT monogram over a 24-wedge sunburst, gold border course, and elliptical medallion ring, revealed outward from the center.',
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
