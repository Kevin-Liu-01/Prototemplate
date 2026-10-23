/* The press directions: seven ways for /atlas to open on one issue, the
   first Chinese translation of Euclid, as a single cover that fills the
   screen. The index page, the pages under /atlas/directions/<slug>, their
   heads and the switcher all read this list. `label` is the number a
   direction is reviewed by. */

export type PressDirection = {
  slug: string;
  label: string;
  name: string;
  /** The reference the direction was drawn from. */
  source: string;
  /** What to do on the page, shown in the switcher. */
  hint: string;
  /** The page's description, 50 to 160 characters. */
  description: string;
};

export const PRESS_DIRECTIONS: readonly PressDirection[] = [
  {
    slug: 'riffle',
    label: '01',
    name: 'Riffle',
    source: 'Thumb through',
    hint: 'Click to riffle, scroll to flip one',
    description: 'The Euclid issue as a thin paper magazine on the Atlas shelf. A click riffles every page past, and a scroll turns one page at a time.',
  },
  {
    slug: 'atlas',
    label: '02',
    name: 'Atlas book',
    source: 'Current site',
    hint: 'Click the book',
    description: 'The current Atlas shelf reduced to one book, with the edge furniture kept. The cover opens on Book I as it was set in 1607.',
  },
  {
    slug: 'signal',
    label: '03',
    name: 'Signal',
    source: 'GT poster',
    hint: '← → or the dots to translate',
    description: 'The Euclid issue as a GT poster: a Morse field, the first definition in five languages and the coordinates of each city.',
  },
  {
    slug: 'proof',
    label: '04',
    name: 'Proof poster',
    source: 'Bennett grid',
    hint: 'Click the page to turn',
    description: 'A printer’s proof of the Euclid issue: grey type, construction lines at the letter boundaries and a second page of definitions.',
  },
  {
    slug: 'light',
    label: '05',
    name: 'Light poster',
    source: 'Visual research',
    hint: 'Click to draw it again',
    description: 'A column of light and film grain behind Book I, Proposition 1, drawn with a compass and lettered as in the 1607 edition.',
  },
  {
    slug: 'route',
    label: '06',
    name: 'Route',
    source: 'River signage',
    hint: 'Click a stop on the line',
    description: 'Wayfinding signage for Matteo Ricci’s road from Macau to Peking: guide lines, a lime block and a sign that changes at each stop.',
  },
  {
    slug: 'measure',
    label: '07',
    name: 'Measure',
    source: 'Technical drawing',
    hint: 'Click to replay the proof',
    description: 'A drafting sheet for the Euclid issue: Book I, Proposition 47 in heavy black, dimensioned 30, 40 and 50, with a title block.',
  },
];

export const directionHref = (slug: string) => `/atlas/directions/${slug}`;

export const findDirection = (slug: string) => PRESS_DIRECTIONS.find((d) => d.slug === slug);
