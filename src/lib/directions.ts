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
  /**
   * A full site concept rather than a single exploration page: the slug is a
   * toolchain-based home and /d/<slug>/enterprise is its enterprise page.
   * The index lists these in their own section.
   */
  site?: boolean;
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
      'A full site: the toolchain home with the every-stack argument folded INTO the hero terminal (one less section), and a /enterprise page that reads as an evidence file — exhibits, a certificate wall, an audit ledger under the gate.',
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
      'A full site: the toolchain home compressed — the hero terminal collapses to a one-line session and a slim table strip — and a /enterprise page that argues with gravity: dials, the customers riding a live orbit, one witness.',
    tone: 'light',
    signature: 'The hero terminal is one line and a strip — a far shorter first fold.',
  },
  {
    n: 24,
    label: '16',
    slug: 'singularity-signal',
    site: true,
    name: 'Signal',
    concept:
      'A full site: the toolchain home with the terminal split into session and output panes — cause and effect at once — and a /enterprise page as the broadcast: intercepts, a self-typing rollout log, the beam.',
    tone: 'light',
    signature: 'Session and output, side by side in one window.',
  },
];

export function getDirection(slug: string): Direction | undefined {
  return DIRECTIONS.find((d) => d.slug === slug);
}
