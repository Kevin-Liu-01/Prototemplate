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
    slug: 'pylon-gate',
    name: 'Pylon Gate',
    concept:
      'A monumental Egyptian-revival gateway: two battered Bayer-dithered pylon masses frame a central passage, and every section is a court passed through on one axis, the passage narrowing at each lintel from forecourt to hypostyle to inner court to a lapis sanctuary to the pricing plinths.',
    tone: 'light',
    signature: 'The claim morphs between twelve locales as one shaped text node under a dithered sun disk between two pairs of gold bars, framed by two battered pylons whose stone is four stepped tiers of ordered dither.',
  },
  {
    n: 26,
    label: '18',
    slug: 'textile-block',
    name: 'Textile Block',
    concept:
      'The General Translation landing page as a Frank Lloyd Wright textile-block wall: a rigid grid of square cast-concrete modules laid in courses, most carrying Mayan-revival geometric relief in moss green, with the claim, the T proof, the four product objects, the scripts, a jade plinth and three pricing plaques set as smooth blocks into the same bond.',
    tone: 'light',
    signature: 'One monumental smooth block carries the claim while the Bayer field glows through the cruciform holes of the perforated blocks beside it, and every joint on the page is a hairline drawn once at the module pitch.',
  },
  {
    n: 27,
    label: '19',
    slug: 'stepped-fret',
    name: 'Stepped Fret',
    concept:
      'Fret strata in the Zapotec and Mixtec revival: the page is a stack of horizontal registers, each bounded by a stepped-fret meander at its own scale, the content blocks step one fret step per register, and the hero is one monumental fret rendered in ordered dither with the claim set in the step it leaves open.',
    tone: 'light',
    signature: 'The monumental hero fret is solid limestone-black at the base of its stair and thins to ordered Bayer grain by the end of its coil, with one knot of density travelling the path every twenty seconds while the claim in the open step cycles through sixteen locales.',
  },
  {
    n: 28,
    label: '20',
    slug: 'three-registers',
    name: 'Three Registers',
    concept:
      'A stele of registers: one tall black-granodiorite slab on a dark ground where every section is a three-band register read top to bottom, after the stone that carried one text in three scripts.',
    tone: 'dark',
    signature: 'The hero is the upper register itself: the claim incised in Cinzel caps under a dithered gold sun disk, the same claim as one shaped living-script node in the second band, and the served interface with its locale chip in the third, all beneath a four-step cornice and above six more registers separated by chevron strips, one of them gilded end to end.',
  },
  {
    n: 29,
    label: '21',
    slug: 'glazed-bond',
    name: 'Glazed Bond',
    concept:
      'General Translation as the Ishtar Gate\'s elevation: two battered brick towers with stepped parapets flank a corbelled arch that holds the claim, and every section below is one more course of lapis-glazed panels set into running bond, divided by gold rosette bands.',
    tone: 'light',
    signature: 'The claim morphs through sixteen locales inside the arch while a dithered sun disc turns in its crown, and each course\'s bricks and medallions are laid one by one as their wall scrolls in.',
  },
  {
    n: 30,
    label: '22',
    slug: 'papyrus-registers',
    name: 'Papyrus Registers',
    concept:
      'A General Translation landing page set as a ruled papyrus scroll in the Egyptian revival lineage of Art Deco: one column eighteen canon squares wide between two hairline rails, every section a column of the scroll opened by a rubric in red ochre with a bar-and-dot numeral in the margin, with papyrus umbels reduced to radiating bars and rendered only as gold Bayer dither.',
    tone: 'light',
    signature: 'The opening column: a gold-dithered band of nine bar fans swaying over the visible 18-square canon grid, above the claim set as the first red rubric in Julius Sans One caps that turns through sixteen locales as one shaped text node.',
  },
  {
    n: 31,
    label: '23',
    slug: 'brick-lattice',
    name: 'Brick Lattice',
    concept:
      'A Babylonian-revival landing page in which the entire surface is one running-bond brick wall, every brick an ordered-dither cell, and density alone draws the rosettes, chevrons, frets, palmettes and stepped parapets around glazed content panels cut out of the lattice.',
    tone: 'light',
    signature: 'Dot density on a continuous brick bond resolves into one enormous twelve-petal rosette behind a stepped-corner claim panel, and every later ornament, from the wall of translations to the kiln\'s crenellations and the medallion band, is the same brick counted course by course.',
  },
  {
    n: 32,
    label: '24',
    slug: 'screenfold-codex',
    name: 'Screenfold Codex',
    concept:
      'The landing page as a Maya screenfold: one strip of bark-paper cream folded into eight red-framed leaves of horizontal registers, adjacent leaves sheared opposite ways, with Bayer dither as the writing (geometric glyph blocks, stepped fold ramps, a live stepped-pyramid plate on the black leaf) and every figure printed in bar-and-dot beside its Arabic form.',
    tone: 'light',
    signature: 'While the hero is on screen, one glyph block at a time re-inks to the next Bayer density tier in the codex\'s paired-column reading order, a discrete step through the screen rather than a fade, so the band is a finished still at every frame.',
  },
  {
    n: 33,
    label: '25',
    slug: 'raking-relief',
    name: 'Raking Relief',
    concept:
      'A bas-relief wall of wide alabaster courses under a raking light from the left, where every panel is carved and shaded by Bayer dither density, geometric rosette, palmette, chevron and fret bands frame each course, and the product is inscribed text with one lapis inlay per locale.',
    tone: 'light',
    signature: 'The hero claim stands in inscriptional capitals casting a dithered shadow to the right, and cycles through sixteen locales as a chisel pass that cuts the old line away and reveals the new one from the left.',
  },
  {
    n: 34,
    label: '26',
    slug: 'calendar-rings',
    name: 'Calendar Rings',
    concept:
      'A concentric disk of Bayer-dithered rings holds the claim at its center, and every section below it is one ring unrolled into a wide arc band, so the page reads as rings peeled outward from the Sun Stone\'s geometry.',
    tone: 'light',
    signature: 'The disk\'s two notched edges turn against each other like the wheels of the calendar round while the claim at the hub cycles through the shipped locales as one shaped text node.',
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
