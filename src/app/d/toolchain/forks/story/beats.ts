/**
 * The nine story beats, and everything each one puts on the stage.
 *
 * The stage is a pure function of the beat index, so a beat is legible from a
 * single still and the whole story survives being screenshotted at any scroll
 * position. Nothing here is measured in pixels — the scenes are ordinary flow
 * layout, so they reflow at 390px instead of being cropped.
 */

export type Scene = 'page' | 'code';

export type Beat = {
  n: string;
  scene: Scene;
  title: string;
  body: string;
  /** One mono line under the stage: the machine's account of this beat. */
  annot: string;
  /** Index into RAIL. */
  step: number;
};

/** The pipeline, drawn once under the stage — never over the code. Lowercase:
    uppercase appears only where the artifact itself is uppercase. */
export const RAIL = ['extract', 'translate', 'review', 'scan', 'edit', 'open pr'] as const;

export const BEATS: readonly Beat[] = [
  {
    n: '01',
    scene: 'page',
    title: 'GT reads the page you already wrote.',
    body: 'Every text node is picked up where it stands — nav label, heading, body copy, button, legal line — with the markup around it as its context.',
    annot: '128 strings · 6 locales · context attached',
    step: 0,
  },
  {
    n: '02',
    scene: 'page',
    title: 'It translates in place.',
    body: 'The strings come back in Spanish and every container re-measures itself. Nothing is re-laid out by hand; the layout absorbs the new lengths.',
    annot: 'es · translated in place · re-measured',
    step: 1,
  },
  {
    n: '03',
    scene: 'page',
    title: 'Around any component.',
    body: 'The button is JSX wrapped in <T>. GT extracts the label, ships the locale build, and the button widens to hold whatever came back.',
    annot: '<T><button>Get started</button></T>',
    step: 1,
  },
  {
    n: '04',
    scene: 'page',
    title: 'In the voice you asked for.',
    body: 'A context attribute goes straight to the translation agent. Same source string, different register — and the heading lands in the tone you wrote for.',
    annot: '<T context="Playful, upbeat tone">',
    step: 1,
  },
  {
    n: '05',
    scene: 'page',
    title: 'With your review, where it matters.',
    body: 'A node marked requires review fires a webhook instead of shipping. Legal reads the Spanish, approves it, and only then does it go live.',
    annot: 'webhook → legal counsel · approved',
    step: 2,
  },
  {
    n: '06',
    scene: 'code',
    title: 'Then the code moves.',
    body: 'A commit triggers the workflow and Locadex reads the file that changed — not a diff of strings, the source that produced them.',
    annot: 'push → workflow · locadex scans app/page.tsx',
    step: 3,
  },
  {
    n: '07',
    scene: 'code',
    title: 'Locadex maps what changed.',
    body: 'Three findings land on the exact lines that need work: copy that was never wrapped, a date formatted by hand, a label with no locale build.',
    annot: 'unwrapped copy · hand-rolled date · unbuilt label',
    step: 3,
  },
  {
    n: '08',
    scene: 'code',
    title: 'It edits, then translates in context.',
    body: 'The agent wraps the tree in <T>, swaps the hand-rolled date for <DateTime>, and writes the translations against the file it just read.',
    annot: '+ <T> · + <DateTime> · − toLocaleDateString()',
    step: 4,
  },
  {
    n: '09',
    scene: 'code',
    title: 'And opens the pull request.',
    body: 'One PR, six locales, a diff you can read. Review it like any other change — merge, and the site is live in every language.',
    annot: 'PR #218 · 6 locales · merged',
    step: 5,
  },
];
