import { graticuleMarks } from '@/lib/marks';

/** Every graticule mark in the page's order (src/lib/marks.ts). */
export const GRATICULE_MARKS = graticuleMarks();

/** The head's lead. */
export const LEAD = 'Each graticule mark is cut from the lines of a wireframe globe, and its ring, latitudes, meridians and equator draw the G and the T.';

/** The section of the marks. */
export const MARKS_ID = 'marks';
export const MARKS_TITLE = 'Marks';
export const MARKS_LEAD = 'Graticule GT leads the shortlist, the next four are picks, and Graticule G is a drawing the Globe family grew from.';

/** The section of the two four-globe progressions. */
export const PROGRESSIONS_ID = 'progressions';
export const PROGRESSIONS_TITLE = 'From a globe to the mark';
export const PROGRESSIONS_LEAD = 'A full wireframe globe loses its lines in four steps until only the mark remains.';

/** Each progression, a public file in currentColor, by the catalog id of the mark it ends on. */
export const PROGRESSIONS: readonly { mark: string; file: string }[] = [
  { mark: 'graticule-jaw-thicker', file: '/marks/graticule/progression-jaw.svg' },
  { mark: 'graticule-gt-heavy', file: '/marks/graticule/progression-heavy.svg' },
];

/** A count with its noun. */
export const marksIn = (n: number) => `${n} ${n === 1 ? 'mark' : 'marks'}`;
