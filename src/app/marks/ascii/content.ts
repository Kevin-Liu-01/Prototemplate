/**
 * The words and the files of /marks/ascii: the dot-matrix header first,
 * then the ASCII armillary, then the armillary loader as a GIF, then how
 * they are built. Every file is written by a script
 * (scripts/build/ascii-header.mjs, scripts/build/ascii-armillary.mjs and
 * scripts/build/armillary-gif.mjs) into public/marks/ascii.
 */

/** The public folder of the page's files. */
export const FILES = '/marks/ascii';

/** One file of the page, with its size in bytes, read by the server page. */
export type AsciiFile = { file: string; label: string; bytes: number };

export const LEAD =
  'The General Translation header as a terminal draws it, the globe and the name on one grid of round dots, then the armillary in characters and as the loader, each as a GIF in both themes with its files.';

export const HEADER_ID = 'header';
export const HEADER_TITLE = 'The header';
export const HEADER_LEAD =
  'The globe and the name on two lines, sampled onto one grid of round dots. The globe is the logo’s own path and the name is set in Katagami Text, so every dot comes from the brand’s drawings and the header changes only through its script.';

export const TEXT_TITLE = 'As plain text';
export const TEXT_CAPTION =
  'The same dots as ASCII for a terminal or a README, two rows of dots to a line: a colon for both, an apostrophe for the top one and a full stop for the bottom one, so the dots stay round in a terminal’s tall cells.';

/** The header's files, in the order the downloads list them. */
export const HEADER_FILES: readonly Omit<AsciiFile, 'bytes'>[] = [
  { file: 'gt-ascii-header.svg', label: 'SVG, text color' },
  { file: 'gt-ascii-header-dark.svg', label: 'SVG on ink' },
  { file: 'gt-ascii-header-light.svg', label: 'SVG on paper' },
  { file: 'gt-ascii-header-dark.png', label: 'PNG on ink' },
  { file: 'gt-ascii-header-light.png', label: 'PNG on paper' },
  { file: 'gt-ascii-header.txt', label: 'Plain text' },
];

/** The header's grid, as the script lays it out (scripts/build/ascii-header.json). */
export const GRID_ROWS: readonly { term: string; body: string }[] = [
  { term: 'Globe', body: '32 dots across, sampled from public/brand/gt-globe-logo.svg. A cell takes a dot when half its samples fall inside the logo.' },
  { term: 'Name', body: 'Katagami Text 400 with its kerning, the capitals 12 dots tall and the two baselines 16 dots apart, centred on the globe.' },
  { term: 'Strokes', body: 'Verticals take 2 dots and horizontals 1, as the reference draws them: the letters are thickened across by a quarter dot each side, and each is sampled where the fewest cells are half covered.' },
  { term: 'Spacing', body: 'Each letter sits on a whole column at its own advance, with at least one empty column before the next, and 6 empty columns lie between the globe and the name.' },
];

export const ASCII_ARMILLARY_ID = 'ascii-armillary';
export const ASCII_ARMILLARY_TITLE = 'The ASCII armillary';
export const ASCII_ARMILLARY_LEAD =
  'The sphere as three rings set in monospace characters, from : to @ by how much light reaches each one, so the rings read as solid hoops. The outer ring faces the viewer while the meridian turns a full turn and the latitude a half turn, their far halves darker, and the lap loops with no seam.';

/** The ASCII armillary's files: the reference's teal on its ground, ink on paper, and one frame as text. */
export const ASCII_ARMILLARY_FILES: readonly (Omit<AsciiFile, 'bytes'> & { ground: string })[] = [
  { file: 'gt-ascii-armillary-dark.gif', label: 'GIF on its ground', ground: 'On its ground' },
  { file: 'gt-ascii-armillary-light.gif', label: 'GIF on paper', ground: 'On paper' },
  { file: 'gt-ascii-armillary.txt', label: 'One frame as text', ground: '' },
];

export const ARMILLARY_ID = 'armillary';
export const ARMILLARY_TITLE = 'The armillary globe';
export const ARMILLARY_LEAD =
  'One lap of the armillary loader, 3.5 seconds at 20 frames a second, shot from the live component on the loading page. The meridian and the G draw back, both rings swing a turn, and the logo draws on again; the last frame runs into the first, so the GIF loops with no seam.';

/** The armillary GIFs, on ink and on paper. */
export const ARMILLARY_FILES: readonly (Omit<AsciiFile, 'bytes'> & { ground: string })[] = [
  { file: 'gt-armillary-dark.gif', label: 'GIF on ink', ground: 'On ink' },
  { file: 'gt-armillary-light.gif', label: 'GIF on paper', ground: 'On paper' },
];

export const BUILD_ID = 'build';
export const BUILD_TITLE = 'How it is built';
export const BUILD_LEAD = 'Three scripts write every file on this page, and none draws anything by hand.';

export const BUILD_PARTS: readonly { term: string; body: string }[] = [
  {
    term: 'pnpm build:ascii-header',
    body: 'Reads the globe’s path and the font, samples both onto the grid in scripts/build/ascii-header.json, and writes the three SVGs, the two PNGs and the plain text. It prints how many dots agree with the reference header: the globe agrees dot for dot.',
  },
  {
    term: 'pnpm build:ascii-armillary',
    body: 'Draws the outer ring and the two whole rings with the ASCII loader’s own renderer, sets the cuts between glyphs so they fall in the shares of the reference frame, and has Chrome set each frame in Katagami Mono for ffmpeg. It needs no server.',
  },
  {
    term: 'pnpm build:armillary-gif',
    body: 'Opens the loading page under a paused clock, steps it a twentieth of a second a frame through two laps, keeps the lap that starts on the rest, and encodes it with ffmpeg in 16 grays and no dithering. It needs the dev server running.',
  },
];

/** The toolbar's count of the page's sections. */
export const sectionsIn = (n: number) => `${n} ${n === 1 ? 'section' : 'sections'}`;

/** A file's size for a download link. */
export const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;
