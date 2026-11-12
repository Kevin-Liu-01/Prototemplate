import type { MarkId } from '@/lib/graticule/geometry';
import type { LineAnimationId } from '@/lib/graticule/line-loop';
import type { CatalogMark } from '@/lib/marks';
import { catalogMark, graticuleMarks } from '@/lib/marks';

import type { VariationEntry } from './variations';
import { ARC_ENDS, AXIS_BEHIND, GLOBES, LOCKUPS, REDRAWS, TRACED } from './variations';

/** Every graticule mark in the page's order (src/lib/marks.ts). */
export const GRATICULE_MARKS = graticuleMarks();

/** The head's lead. */
export const LEAD = 'Every graticule mark is cut from one wireframe globe, whose ring, latitudes, meridians and equator draw its letters. The logo, Refined globe, is one of them.';

/** The section of the marks; its divider is the h2 alone. */
export const MARKS_ID = 'marks';
export const MARKS_TITLE = 'Marks';

/** The section of the line globe animations; its divider is the h2 and the lead. */
export const ANIMATIONS_ID = 'animations';
export const ANIMATIONS_TITLE = 'Animations';
export const ANIMATIONS_LEAD = 'Each animation starts and ends on the exact mark, and the newest come first.';

/** The marks every animation plays on, heavy first, each with the catalog id that gives its name and its drawn box. */
export const ANIMATED_MARKS: readonly { mark: MarkId; id: string }[] = [
  { mark: 'heavy', id: 'graticule-gt-heavy' },
  { mark: 'jaw', id: 'graticule-jaw-thicker' },
];

/** One animation: its id in src/lib/graticule/line-loop.ts, which holds its name, and what moves in it. */
export type Animation = { id: LineAnimationId; caption: string };

/** One hover or loading loop of the static mark, played from its light and dark videos in /marks/graticule/motion; `poster` when the loop has its own poster, its video's first frame. */
export type MotionLoop = { id: string; name: string; caption: string; poster?: true };

/** The static mark and the state its hovers settle into, by variation id. */
export const STATIC_MARK = 'refined-1112';
export const STATE_MARK = 'oval-axis-behind';

/** The hovers and the loader on the static mark, in the order they were chosen. Each video starts and ends on the static mark. */
export const MOTION_LOOPS: readonly MotionLoop[] = [
  {
    id: 'draw-back',
    name: 'Meridian draws back',
    caption: 'On hover the meridian draws back along its own oval over both poles until the mark is the logo without its meridian, then the meridian draws out again when the cursor leaves. Nothing else moves.',
    poster: true,
  },
  {
    id: 'into-the-poles',
    name: 'Meridians draw into the poles',
    caption: 'On hover the meridian opens at the bar and its four ends draw back into the two poles together, then they draw out again when the cursor leaves.',
  },
  {
    id: 'fold-into-the-bar',
    name: 'Meridians fold into the bar',
    caption: 'On hover the meridian opens at both poles and its left half folds down into the bar, and the move runs back when the cursor leaves.',
  },
  {
    id: 'meridian-then-g',
    name: 'Meridian, then G',
    caption: 'While a page loads, the meridian draws back once, then a line runs once round its oval and the G runs once round the equator: its stroke draws off from one end and back on until it rests as the G again. The ring and the T hold still the whole time.',
    poster: true,
  },
];

/** A loop's video in one theme, and its poster: the rest mark every loop starts and ends on, from the loop's own first frame where it has one. */
export const motionVideo = (id: string, theme: 'light' | 'dark') => `/marks/graticule/motion/${id}-${theme}.mp4`;
export const motionPoster = (loop: MotionLoop, theme: 'light' | 'dark') => `/marks/graticule/motion/${loop.poster ? loop.id : 'rest'}-${theme}.png`;

/** The two groups of animations, each with its sub-head and lead. */
export const MOTION_GROUP = {
  id: 'animations-hover',
  title: 'Hover and loading',
  lead: `These ${MOTION_LOOPS.length} were recorded on Axis and meridian behind, the logo before Refined globe. The first hover and the loader are the live logo's own, which now plays them on Refined globe, where only the line being drawn moves; the other two hovers settle it into Oval globe, axis behind.`,
};

/** The animations in the order they were chosen. Each starts and ends on the exact mark. */
export const ANIMATIONS: readonly Animation[] = [
  {
    id: 'language-turn',
    caption: 'The ring, the bar and the latitude hold still while the meridians turn across the face, and the G and the T open each time the globe stops.',
  },
  {
    id: 'mark-to-globe',
    caption: 'The cuts close, the oval straightens into two parallels and the meridians turn, then the lines fold back into the G and the T.',
  },
];

export const LINE_GROUP = {
  id: 'animations-line',
  title: 'Line globe',
  lead: `These ${ANIMATIONS.length} play on Graticule GT, heavy, then on Graticule jaw, thicker.`,
};

/** The section of the best marks; its divider is the h2 and the lead. */
export const BEST_ID = 'best';
export const BEST_TITLE = 'Best';

/** The best marks in order, each by its catalog id or its variation id: the static mark first, then its hover state. */
const BEST_IDS: readonly string[] = [
  'refined-1112',
  'oval-axis-behind',
  'axis-and-meridian-behind',
  'meridian-axis-behind',
  'meridian-wide-axis-gap',
  'oval-wide-axis-gap',
  'meridian-globe',
  'oval-globe',
  'graticule-heavy-open-bar',
  'graticule-gt',
  'graticule-short-arc-slant-stem-behind',
  'graticule-heavy-curved-bar',
  'graticule-rounded-t-heavy-plumb-end',
  'graticule-jaw-thicker',
  'equator-in-front',
];

/** The section of the variations; its divider is the h2 and the lead. */
export const VARIATIONS_ID = 'variations';
export const VARIATIONS_TITLE = 'Variations';

/** The catalog mark whose drawn box a variation shares unless its entry names another: each variation's file keeps its 256 unit square and draws its ring at the same centre and outer diameter. */
export const VARIATIONS_BOX_OF = 'graticule-jaw-thicker';

/** One variation as the page draws it: its entry and its public file in currentColor. */
export type Variation = VariationEntry & { file: string };

/** One study: its anchor, its sub-head, its one-sentence lead and its variations. */
export type Study = { id: string; title: string; lead: string; variations: readonly Variation[] };

/** A study from its entries; its lead counts them. */
const study = (id: string, title: string, entries: readonly VariationEntry[], lead: (n: number) => string): Study => ({
  id: `variations-${id}`,
  title,
  lead: lead(entries.length),
  variations: entries.map((entry) => ({ ...entry, file: `/marks/graticule/variations/${entry.id}.svg` })),
});

/** The studies in the order they were made, newest first. They are drawn on this page alone and are not catalog rows (src/lib/marks.ts). */
export const STUDIES: readonly Study[] = [
  study(
    'globes',
    'Meridian and oval globes',
    GLOBES,
    (n) => `These ${n} marks draw the globe at the weight of the name's stems, with a meridian oval or without one, and most of them change where one line passes behind another or how a line ends.`
  ),
  study(
    'axis-behind',
    'Axis behind the equator',
    AXIS_BEHIND,
    (n) => `These ${n} marks break the T's stem of an earlier mark where it passes behind the front of the equator, and some also break the meridians there or widen the break to a full stroke.`
  ),
  study(
    'lockups',
    'Lockup drawings',
    LOCKUPS,
    (n) => `These ${n} marks share one oval G and a T whose stem meets the bar through two round fillets, and they differ in where the G's top arc ends and how its end and the bar's free end are cut.`
  ),
  study(
    'arc-ends',
    "Ends of the G's top arc",
    ARC_ENDS,
    (n) => `These ${n} marks give the G's top arc a different end on Heavy rounded T, Heavy open bar and Heavy curved bar, cut plumb, level or square or along a line of the globe.`
  ),
  study('traced', 'Traced drawings', TRACED, (n) => `These ${n} marks are traced from hand drawings of the globe in thin, medium and heavy lines.`),
  study(
    'redraws',
    'Jaw redraws',
    REDRAWS,
    (n) => `These ${n} marks redraw an earlier build of Graticule jaw, thicker, whose stub in the G's opening is a sliver that each redraw cuts away or changes.`
  ),
];

/** Every variation, study by study. */
export const VARIATIONS: readonly Variation[] = STUDIES.flatMap((s) => s.variations);

/** The section's lead, which counts every variation. */
export const VARIATIONS_LEAD = `These ${VARIATIONS.length} variations are grouped by the study that drew them, newest first.`;

/** One best mark: a catalog mark, which links to its card on /marks, or a variation. */
export type Best = { kind: 'mark'; mark: CatalogMark } | { kind: 'variation'; variation: Variation };

const VARIATION_BY_ID = new Map(VARIATIONS.map((variation) => [variation.id, variation]));

/** A mark by its catalog id or its variation id: the catalog row first, so a mark that has a card on /marks links to it; an id that names neither fails the build. */
function resolveBest(id: string): Best {
  const mark = catalogMark(id);
  if (mark) return { kind: 'mark', mark };
  const variation = VARIATION_BY_ID.get(id);
  if (!variation) throw new Error(`No graticule mark or variation has the id ${id}`);
  return { kind: 'variation', variation };
}

/** The best marks in order, each resolved to its catalog row or its variation. */
export const BEST: readonly Best[] = BEST_IDS.map(resolveBest);

/** The section of the logo's progression; its divider is the h2 and the lead. */
export const PROGRESSION_ID = 'progression';
export const PROGRESSION_TITLE = 'Progression';
export const PROGRESSION_LEAD = 'The marks that led to the logo and to its state, oldest first, each with what changed from the mark before it.';

/** One step of a progression: a mark by its catalog id or its variation id, and what changed from the step before it. */
type StepEntry = { id: string; caption: string };

/** One step as the page draws it: its mark or variation and its caption. */
export type Step = { best: Best; caption: string };

/** One line of the progression: its anchor, its sub-head, its lead and its steps. */
export type ProgressionLine = { id: string; title: string; lead: string; steps: readonly Step[] };

/** A step resolved to its catalog row or its variation, as the best marks are; an id that names neither fails the build. */
const step = ({ id, caption }: StepEntry): Step => ({ best: resolveBest(id), caption });

const LOGO_STEPS: readonly StepEntry[] = [
  {
    id: 'graticule-gt',
    caption: 'In a monoline wireframe globe the flat latitude opens at its upper right as the G, and the equator is both the G\'s bar and the T\'s crossbar.',
  },
  {
    id: 'graticule-gt-heavy',
    caption: 'The lines turn heavy, the second, small T at the G\'s opening goes, and the T\'s stem meets the bar through two round fillets.',
  },
  {
    id: 'meridian-globe',
    caption: 'The lines thicken again to the weight of the name\'s stems, the weight it takes beside the stacked name.',
  },
  {
    id: 'meridian-axis-behind',
    caption: 'The T\'s stem, the polar axis, breaks where it passes behind the latitude\'s lower arc, the front of the equator.',
  },
  {
    id: 'axis-and-meridian-behind',
    caption: 'The back meridian breaks behind the equator as well, while the front meridian still meets it.',
  },
  {
    id: 'refined-1112',
    caption: 'Each oval takes its own centre and radii, the lines lighten to 13.2 units and the gaps narrow. This is the logo.',
  },
];

const STATE_STEPS: readonly StepEntry[] = [
  {
    id: 'oval-globe',
    caption: 'The globe without its meridian: a ring and a latitude oval draw the G, and the T\'s stem runs unbroken through the oval\'s lower arc.',
  },
  {
    id: 'oval-axis-behind',
    caption: 'The T\'s stem breaks behind the front of the equator, as in the logo. This is the logo\'s state on hover, on sign-in and while loading.',
  },
];

/** The two lines of the progression: the logo's, then its state's. */
export const PROGRESSION: readonly ProgressionLine[] = [
  {
    id: 'progression-logo',
    title: 'The logo',
    lead: `These ${LOGO_STEPS.length} marks run from the first wireframe globe GT to Refined globe.`,
    steps: LOGO_STEPS.map(step),
  },
  {
    id: 'progression-state',
    title: 'Its state',
    lead: `These ${STATE_STEPS.length} marks run from the globe without a meridian to Oval globe, axis behind, which each hover settles the logo into.`,
    steps: STATE_STEPS.map(step),
  },
];

/** Every step of the progression, line by line. */
export const STEPS: readonly Step[] = PROGRESSION.flatMap((line) => line.steps);

/** The best section's lead, which counts its marks. */
export const BEST_LEAD = `These ${BEST.length} marks are the best of every drawing on this page. The first is the logo, Refined globe, and the second is its state on hover, on sign-in and while loading, Oval globe, axis behind.`;

/** The section of the globe rows; its divider is the h2 and the lead. */
export const ROWS_ID = 'rows';
export const ROWS_TITLE = 'Globe rows';
export const ROWS_LEAD =
  "Each row draws two earlier globes with a whole top arc, then the oval state, the logo and the name. Beside the stacked name the globe is 2.3643 cap heights tall, centred on the name's ink.";

/** One globe row: its name, what changes along it, and its four globes left to right, each a public file in currentColor on the 256 unit square. */
export type GlobeRow = { id: string; name: string; caption: string; globes: readonly string[] };

/** The oval state and the logo that end every row. */
const LOGOS = [`/marks/graticule/variations/${STATE_MARK}.svg`, `/marks/graticule/variations/${STATIC_MARK}.svg`] as const;

export const GLOBE_ROWS: readonly GlobeRow[] = [
  {
    id: 'rows-bar',
    name: 'The bar shortens',
    caption: 'The whole oval and the whole equator with the stem joined to it, then the bar shortened into the T, then Oval globe, axis behind and Refined globe.',
    globes: ['/marks/graticule/rows/stem-joined.svg', '/marks/graticule/rows/short-bar.svg', ...LOGOS],
  },
  {
    id: 'rows-axis',
    name: 'The axis joins',
    caption: 'The whole oval, the whole equator and the whole axis, then the T, then Oval globe, axis behind and Refined globe.',
    globes: ['/marks/graticule/rows/whole-axis.svg', '/marks/graticule/rows/short-bar.svg', ...LOGOS],
  },
];

/** The name that ends every row, in Katagami Text 400 outlines at -0.05 em and currentColor (pnpm build:lockup). Its box starts at the top of a globe's drawn box and is NAME_WIDTH globes wide, so the globe beside it is centred on the name's ink, as in the stacked lockup; both numbers are rows in public/brand/gt-globe-lockup.json, and pnpm test:marks holds them to it. */
export const NAME_FILE = '/marks/graticule/rows/name.svg';
export const NAME_WIDTH = 2.557;
export const NAME_ASPECT = 2.5823;

/** A count with its noun. */
export const marksIn = (n: number) => `${n} ${n === 1 ? 'mark' : 'marks'}`;
export const animationsIn = (n: number) => `${n} ${n === 1 ? 'animation' : 'animations'}`;
export const rowsIn = (n: number) => `${n} ${n === 1 ? 'row' : 'rows'}`;
export const stepsIn = (n: number) => `${n} ${n === 1 ? 'step' : 'steps'}`;
export const variationsIn = (n: number) => `${n} ${n === 1 ? 'variation' : 'variations'}`;
