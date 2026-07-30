export type Tone = 'dark' | 'light' | 'alt';

export type Direction = {
  /** Original exploration number from the 20-sample round. */
  n: number;
  /**
   * The number the founder refers to this version by. Explicit rather than
   * derived from array position so version 0 can lead the list without
   * renumbering everything after it.
   */
  label: string;
  /** Route segment under /d. */
  slug: string;
  name: string;
  concept: string;
  tone: Tone;
  /** The one motion moment this direction is built around. */
  signature: string;
};

export const DIRECTIONS: Direction[] = [
  {
    n: 2,
    label: '00',
    slug: 'concrete-origin',
    name: 'Concrete Origin',
    concept:
      'Version 1 as it stood before the rework: the lens gate and ray-cast component cards, kept intact as a reference point.',
    tone: 'dark',
    signature: 'The gravitational lens gate, with components arriving along light rays.',
  },
  {
    n: 2,
    label: '01',
    slug: 'concrete-mono',
    name: 'Concrete Mono',
    concept: 'Brutalist monospace slabs on ink; elements stamp in with hard cuts.',
    tone: 'dark',
    signature: 'Hard-cut stamp reveals with zero easing softness.',
  },
  {
    n: 6,
    label: '02',
    slug: 'bento-foundry',
    name: 'Bento Foundry',
    concept: 'Machined clean bento grid; muted cards, each holding a mini product mockup.',
    tone: 'dark',
    signature: 'One-shot cell cascade with metallic sheen sweeps.',
  },
  {
    n: 7,
    label: '03',
    slug: 'kinetic-verba',
    name: 'Kinetic Verba',
    concept: 'Kinetic variable-font typography; characters flex weight and width with scroll velocity.',
    tone: 'dark',
    signature: 'Char-level weight/width flex bound to scroll velocity.',
  },
  {
    n: 8,
    label: '04',
    slug: 'white-gallery',
    name: 'White Gallery',
    concept: 'Museum minimal on paper; the story reads as a curated exhibition walk.',
    tone: 'light',
    signature: 'Pinned horizontal gallery walk past framed exhibits.',
  },
  {
    n: 9,
    label: '05',
    slug: 'blueprint-atlas',
    name: 'Blueprint Atlas',
    concept: 'Engineering schematic; the localization pipeline draws itself as a technical diagram.',
    tone: 'dark',
    signature: 'DrawSVG pipeline self-draws, then a signal pulse runs the line.',
  },
  {
    n: 15,
    label: '06',
    slug: 'field-magnet',
    name: 'Field Magnet',
    concept: 'Magnetic cursor world; an iron-filing field orients to the pointer.',
    tone: 'dark',
    signature: 'Canvas filing field bends toward the cursor; magnetic UI.',
  },
  {
    n: 19,
    label: '07',
    slug: 'flipboard-terminus',
    name: 'Flipboard Terminus',
    concept: 'Split-flap departure board; languages are destinations on the board.',
    tone: 'dark',
    signature: 'Stepped split-flap cascades resolving into translated strings.',
  },
  {
    n: 20,
    label: '08',
    slug: 'typographic-broadcast',
    name: 'Typographic Broadcast',
    concept: 'Chrome ticker bands; the page reads as a broadcast graphics package.',
    tone: 'dark',
    signature: 'Marquee timeScale bound to scroll velocity.',
  },
  {
    n: 21,
    label: '09',
    slug: 'archive-press',
    name: 'Wide Field',
    concept:
      "Version 1 held at its sparser, cinematic state: a thin GT gate, components scattered wide across a full-width burst, headline anchored low-left.",
    tone: 'dark',
    signature: 'A film still — enormous quiet space around a horizontal band of light.',
  },
  {
    n: 2,
    label: '11',
    slug: 'concrete-source',
    name: 'Concrete Source',
    concept:
      'The original concrete-mono exploration, ported verbatim: thin ring gate, sparsely scattered component pairs, headline low-left under a full-width burst.',
    tone: 'dark',
    signature: 'The source state — preserved exactly as it was drawn.',
  },
  {
    n: 22,
    label: '10',
    slug: 'toolchain',
    name: 'Toolchain',
    concept:
      'The minimalist evolution of the current site: one ruled column, bento rows whose shells never repeat, and a family of isometric line-art diagrams.',
    tone: 'light',
    signature: 'Structure from hairlines alone — no backgrounds, no ornament.',
  },
  {
    n: 22,
    label: '12',
    slug: 'chroma-flow',
    name: 'Chroma Flow',
    concept: 'Toolchain fork: curl-noise flow-field shader hero, pipeline-led product sections.',
    tone: 'light',
    signature: 'A double-line ribbon of flowing chroma carries the hero.',
  },
  {
    n: 22,
    label: '13',
    slug: 'dither-field',
    name: 'Dither Field',
    concept: 'Toolchain fork: animated 1-bit Bayer hero, data-led product sections.',
    tone: 'light',
    signature: 'The hero is an ordered-dither field breathing at 1 bit.',
  },
  {
    n: 22,
    label: '14',
    slug: 'aurora-paper',
    name: 'Aurora Paper',
    concept: 'Toolchain fork: grainy aurora wash on paper, workspace-led product sections.',
    tone: 'light',
    signature: 'A Resend-grade light wash behind a paper page.',
  },
  {
    n: 22,
    label: '15',
    slug: 'glyph-rain',
    name: 'Glyph Rain',
    concept: 'Toolchain fork: multilingual glyph particle hero, script-led product sections.',
    tone: 'light',
    signature: 'Characters from eight scripts condense into the headline.',
  },
  {
    n: 22,
    label: '16',
    slug: 'prism-light',
    name: 'Prism Light',
    concept: 'Toolchain fork: the prismatic engine re-tuned for a light hero, delivery-led sections.',
    tone: 'light',
    signature: 'The burst re-exposed for paper, masked into the thread.',
  },
  {
    n: 2,
    label: '17',
    slug: 'lens-gate',
    name: 'Lens Gate',
    concept:
      "Toolchain fork: the origin's lens gate on ruled paper — hairline rules refract through one breathing glass and components exit translated.",
    tone: 'light',
    signature: "The page's own rules bend through the lens and snap straight at the rim.",
  },
  {
    n: 6,
    label: '18',
    slug: 'paper-foundry',
    name: 'Paper Foundry',
    concept:
      "Toolchain fork: the foundry's bento machined into paper — hairline cells set into a brushed-graphite sheet.",
    tone: 'light',
    signature: 'One anisotropic sheen sweep over a reading-order cell cascade.',
  },
  {
    n: 19,
    label: '19',
    slug: 'terminus-board',
    name: 'Terminus Board',
    concept:
      'Toolchain fork: the departure hall on paper — a split-flap headline over a flip-wave cell grid, locales as departures.',
    tone: 'light',
    signature: 'The headline riffles through world scripts, settles into English, and cools through amber.',
  },
  {
    n: 21,
    label: '20',
    slug: 'wide-rule',
    name: 'Wide Rule',
    concept:
      'Toolchain fork: the wide field on paper — one analytic interference band crossing enormous quiet space.',
    tone: 'light',
    signature: 'A film still — fringes dissolve into the null that holds the gate and the headline.',
  },
  {
    n: 23,
    label: '21',
    slug: 'event-horizon',
    name: 'Event Horizon',
    concept:
      "Kevin's sketch: component galleries warp with one-point perspective into a black-hole gate; English falls in, translations emerge; flags rotate beneath.",
    tone: 'light',
    signature: 'Collinear pairs cross the horizon — in as English, out translated.',
  },
  {
    n: 23,
    label: '22',
    slug: 'hourglass',
    name: 'Hourglass',
    concept:
      "Kevin's sketch: dark corridor walls of UI cards recede to a vanishing point, pinching an hourglass waist that holds the mark, flags, and CTAs.",
    tone: 'dark',
    signature: 'The English wall flows into the waist; the translated wall flows out.',
  },
];

export function getDirection(slug: string): Direction | undefined {
  return DIRECTIONS.find((d) => d.slug === slug);
}
