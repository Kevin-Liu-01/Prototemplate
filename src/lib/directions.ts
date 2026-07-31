export type Tone = 'dark' | 'light' | 'alt';

export type Direction = {
  /** Original exploration number from the 20-sample round. */
  n: number;
  /**
   * The number the founder refers to this version by. Explicit rather than
   * derived from array position so retired versions can drop out of the list
   * without breaking the numbers he uses in review notes.
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
    concept: 'Toolchain fork: curl-noise flow-field shader hero, pipeline-led product sections.',
    tone: 'light',
    signature: 'A double-line ribbon of flowing chroma carries the hero.',
  },
  {
    n: 22,
    label: '03',
    slug: 'dither-field',
    name: 'Dither Field',
    concept: 'Toolchain fork: animated 1-bit Bayer hero, data-led product sections.',
    tone: 'light',
    signature: 'The hero is an ordered-dither field breathing at 1 bit.',
  },
  {
    n: 22,
    label: '04',
    slug: 'aurora-paper',
    name: 'Aurora Paper',
    concept: 'Toolchain fork: grainy aurora wash on paper, workspace-led product sections.',
    tone: 'light',
    signature: 'A Resend-grade light wash behind a paper page.',
  },
  {
    n: 22,
    label: '05',
    slug: 'glyph-rain',
    name: 'Glyph Rain',
    concept: 'Toolchain fork: multilingual glyph particle hero, script-led product sections.',
    tone: 'light',
    signature: 'Characters from eight scripts condense into the headline.',
  },
  {
    n: 22,
    label: '06',
    slug: 'prism-light',
    name: 'Prism Light',
    concept: 'Toolchain fork: the prismatic engine re-tuned for a light hero, delivery-led sections.',
    tone: 'light',
    signature: 'The burst re-exposed for paper, masked into the thread.',
  },
  {
    n: 2,
    label: '07',
    slug: 'lens-gate',
    name: 'Lens Gate',
    concept:
      "Toolchain fork: the origin's lens gate on ruled paper — hairline rules refract through one breathing glass and components exit translated.",
    tone: 'light',
    signature: "The page's own rules bend through the lens and snap straight at the rim.",
  },
  {
    n: 6,
    label: '08',
    slug: 'paper-foundry',
    name: 'Paper Foundry',
    concept:
      "Toolchain fork: the foundry's bento machined into paper — hairline cells set into a brushed-graphite sheet.",
    tone: 'light',
    signature: 'One anisotropic sheen sweep over a reading-order cell cascade.',
  },
  {
    n: 19,
    label: '09',
    slug: 'terminus-board',
    name: 'Terminus Board',
    concept:
      'Toolchain fork: the departure hall on paper — a split-flap headline over a flip-wave cell grid, locales as departures.',
    tone: 'light',
    signature: 'The headline riffles through world scripts, settles into English, and cools through amber.',
  },
  {
    n: 21,
    label: '10',
    slug: 'wide-rule',
    name: 'Wide Rule',
    concept:
      'Toolchain fork: the wide field on paper — one analytic interference band crossing enormous quiet space.',
    tone: 'light',
    signature: 'A film still — fringes dissolve into the null that holds the gate and the headline.',
  },
  {
    n: 23,
    label: '11',
    slug: 'event-horizon',
    name: 'Event Horizon',
    concept:
      "Kevin's sketch: component walls dive with curved perspective into a black-hole gate; English falls in, translations emerge; flags orbit the horizon.",
    tone: 'light',
    signature: 'Collinear pairs cross the horizon — in as English, out translated.',
  },
  {
    n: 23,
    label: '12',
    slug: 'hourglass',
    name: 'Hourglass',
    concept:
      "Kevin's sketch: dark corridor walls of UI cards sweep concavely into a vanishing point, pinching an hourglass waist that holds the mark, flags, and CTAs.",
    tone: 'dark',
    signature: 'The English wall flows into the waist; the translated wall flows out.',
  },
];

export function getDirection(slug: string): Direction | undefined {
  return DIRECTIONS.find((d) => d.slug === slug);
}
