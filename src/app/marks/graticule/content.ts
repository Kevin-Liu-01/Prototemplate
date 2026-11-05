import { graticuleMarks } from '@/lib/marks';

/** Every graticule mark in the page's order (src/lib/marks.ts). */
export const GRATICULE_MARKS = graticuleMarks();

/** The head's lead. */
export const LEAD = 'Every graticule mark is cut from one wireframe globe, whose ring, latitudes, meridians and equator draw its letters.';

/** The section of the marks; its divider is the h2 alone. */
export const MARKS_ID = 'marks';
export const MARKS_TITLE = 'Marks';

/** The section of the two four-globe progressions; its divider is the h2 alone. */
export const PROGRESSIONS_ID = 'progressions';
export const PROGRESSIONS_TITLE = 'Progressions';

/**
 * The globes in each progression's file, evenly spaced from its viewBox's
 * left edge to its right, each as tall as the viewBox and as wide as it is
 * tall.
 */
export const PROGRESSION_STEPS = 4;

/** Each progression's public file, in currentColor, by the catalog id of the mark it ends on. */
const PROGRESSION_FILES: Readonly<Record<string, string>> = {
  'graticule-gt-heavy': '/marks/graticule/progression-heavy.svg',
  'graticule-jaw-thicker': '/marks/graticule/progression-jaw.svg',
};

/** The progressions in the order the marks above them are drawn, so both sections rank the marks alike. */
export const PROGRESSIONS: readonly { mark: string; file: string }[] = GRATICULE_MARKS.flatMap((mark) => {
  const file = PROGRESSION_FILES[mark.id];
  return file ? [{ mark: mark.id, file }] : [];
});

/** A count with its noun. */
export const marksIn = (n: number) => `${n} ${n === 1 ? 'mark' : 'marks'}`;
export const progressionsIn = (n: number) => `${n} ${n === 1 ? 'progression' : 'progressions'}`;
