/**
 * The words and the files of /marks/loading: the finished loader first, then
 * the hovers, how the motion is built, the checks that hold it, reduced
 * motion, the loader on /compare, and the before and after of the fix. The
 * timings come from scripts/build/logo-motion.json through the server page,
 * so the page and the component never disagree.
 */

/** The beats of the motion in milliseconds, read from scripts/build/logo-motion.json by the server page. */
export type LoaderTiming = { drawBack: number; meridian: number; restAfterMeridian: number; g: number; restAfterG: number };

export const lapOf = (t: LoaderTiming) => t.meridian + t.restAfterMeridian + t.g + t.restAfterG;

export const LEAD =
  'The General Translation logo while a page loads, running live, then the work behind it: the hovers, how the motion is built, the checks that hold it and the fix that keeps everything but the moving line on the logo itself.';

export const LOADER_ID = 'loader';
export const LOADER_TITLE = 'The loader';
export const LOADER_LEAD =
  'Meridian, then G. The meridian draws back once, then a line runs once round the meridian and the G draws off and back on once round the equator, for as long as the page loads.';

/** The beats of the loader as rows of the timing table. */
export const timingRows = (t: LoaderTiming): readonly { name: string; ms: number; note: string }[] => [
  { name: 'Draw-back', ms: t.drawBack, note: 'Once, when the loader mounts: the meridian draws back along its oval to the logo without its meridian.' },
  { name: 'Meridian lap', ms: t.meridian, note: 'A line runs once round the meridian, over the logo without its meridian.' },
  { name: 'Rest', ms: t.restAfterMeridian, note: 'The logo without its meridian holds still.' },
  { name: 'G lap', ms: t.g, note: 'The G draws off from its tip round the equator and back on, landing on its tip again.' },
  { name: 'Rest', ms: t.restAfterG, note: 'The logo without its meridian holds still before the next lap.' },
];

/** The loader at the sizes the site uses it, with where each one runs. */
export const LOADER_SIZES: readonly { size: number; where: string }[] = [
  { size: 56, where: 'A prototype’s frame on /present' },
  { size: 32, where: 'A pane on /compare in Both, 80 sheet pixels across' },
  { size: 16, where: 'The smallest size the plate checks' },
];

export const HOVER_ID = 'hovers';
export const HOVER_TITLE = 'The hovers';
export const HOVER_LEAD =
  'Three hovers were drawn on the logo. Meridian draws back is the one the component ships, and the other two stay as videos.';

/** One hover or loading loop, played from its light and dark videos in /marks/graticule/motion. */
export type MotionLoop = { id: string; name: string; caption: string; shipped: boolean };

export const MOTION_LOOPS: readonly MotionLoop[] = [
  {
    id: 'draw-back',
    name: 'Meridian draws back',
    caption: 'The meridian draws back along its own oval over both poles and the logo settles without it, then the meridian draws out again when the cursor leaves. The component ships this one.',
    shipped: true,
  },
  {
    id: 'into-the-poles',
    name: 'Meridians draw into the poles',
    caption: 'The meridian opens at the bar and its four ends draw back into the two poles together, then they draw out again when the cursor leaves.',
    shipped: false,
  },
  {
    id: 'fold-into-the-bar',
    name: 'Meridians fold into the bar',
    caption: 'The meridian opens at both poles and its left half folds down into the bar, and the move runs back when the cursor leaves.',
    shipped: false,
  },
  {
    id: 'meridian-then-g',
    name: 'Meridian, then G',
    caption: 'The loader as a video, drawn frame by frame from the component in Chrome. It plays the draw-back, three laps and the draw-back reversed, so it starts and ends on the logo.',
    shipped: true,
  },
];

/** A loop's video in one theme, and the logo every loop starts and ends on, as its poster and its still under reduced motion. */
export const motionVideo = (id: string, theme: 'light' | 'dark') => `/marks/graticule/motion/${id}-${theme}.mp4`;
export const motionRest = (theme: 'light' | 'dark') => `/marks/graticule/motion/rest-${theme}.png`;

export const BUILD_ID = 'built';
export const BUILD_TITLE = 'How it is built';
export const BUILD_LEAD = 'GtLogoMotion draws with SVG and CSS alone: no video, no canvas and no script per frame.';

/** The parts of the build, each a term and what it does. */
export const BUILD_PARTS: readonly { term: string; body: string }[] = [
  {
    term: 'The numbers',
    body: 'scripts/build/logo-motion.json holds the logo’s measures and, for each beat, a table of where each moving end stands at 240 samples a second. They are the numbers the published videos were rendered from.',
  },
  {
    term: 'The generator',
    body: 'pnpm build:logo-motion runs scripts/build/logo-motion.mjs, which writes GtLogoMotion.geometry.ts and GtLogoMotion.css. Neither file is edited by hand, and --check fails when either differs from what the script would write.',
  },
  {
    term: 'The loader',
    body: 'The loader animates custom properties registered with @property, a dash’s length and its start along its path for each moving line. The keyframes keep only the samples that a straight line between their neighbours misses.',
  },
  {
    term: 'The hover',
    body: 'The hover transitions each dash’s own stroke-dasharray and stroke-dashoffset, with the beat’s course written as a CSS linear() easing. A leave halfway runs back from where it is.',
  },
  {
    term: 'The WebKit rule',
    body: 'Transitions sit on each dash’s own properties, never on a registered custom property. Safari runs a transition of a registered custom property but paints the var() that reads it at the end value, so there the hover jumped to its end.',
  },
  {
    term: 'Only the moving line moves',
    body: 'The still layer is the logo’s own path. The motion layer paints that same path and a mask takes it away only where a line has been undrawn, where the logo without that line shows instead. The layers add with plus-lighter in an isolated group under masks that partition the frame, so wherever nothing is undrawn the frame is the logo pixel for pixel.',
  },
  {
    term: 'Browsers',
    body: 'The motion needs @property, linear() easing and plus-lighter: Chrome 113, Safari 17.2 and Firefox 128 or later.',
  },
];

export const BUILD_CODE = `import GtLogoMotion from '@/components/brand/GtLogoMotion';

<Link href='/'>
  <GtLogoMotion mode='hover' size={18} />
</Link>;
<GtLogoMotion mode='loader' size={56} label='Loading the prototype' />;`;

export const CHECKS_ID = 'checks';
export const CHECKS_TITLE = 'The checks';
export const CHECKS_LEAD =
  'pnpm test:marks runs scripts/lint/logo-motion.test.mjs, which draws the component frame by frame in Chrome at 4x and compares each frame with the still logo pixel by pixel.';

export const CHECKS: readonly { term: string; body: string }[] = [
  { term: 'Hand-off', body: 'At the start of the hover and of the loader, at the end of the leave and at every seam of the lap, the motion layer is the still logo with no pixel different.' },
  { term: 'Still', body: 'In every frame, every pixel outside the lines that move is the logo’s.' },
  { term: 'End pose', body: 'The draw-back ends on the logo without its meridian, within a level of antialiasing.' },
  { term: 'Tip', body: 'Through the whole loop the G’s tip is the logo’s, except while the G’s own lap runs over it.' },
  { term: 'Steps', body: 'The first and last step of each move change no more pixels than the step beside it, so nothing pops in one frame as a move starts or lands.' },
];

export const ENGINES_CAPTION =
  'The loader at 0.3, 1.25 and 2.55 seconds in Chrome, Firefox and WebKit, on paper and on ink. Only Chrome is held to the pixel. Firefox and WebKit round masks and blends by a level here and there, so the test draws them on request with LOGO_MOTION_BROWSERS.';

export const REDUCED_ID = 'reduced';
export const REDUCED_TITLE = 'Reduced motion';
export const REDUCED_LEAD = 'Under reduced motion the hover does nothing and the loader is the still logo with its label.';

export const REDUCED_NOTES: readonly string[] = [
  'Every rule that moves or swaps a layer sits inside prefers-reduced-motion: no-preference, so a reader who asks for less motion sees the logo and nothing else.',
  'The loader keeps its live region and its label, so assistive technology still hears that the page is loading.',
  'The videos on this page play only while their figure is in view and motion is allowed. Their poster is the still logo.',
];

export const COMPARE_ID = 'compare';
export const COMPARE_TITLE = 'On /compare';
export const COMPARE_LEAD = 'A pane whose page has not loaded shows the loader on the paper, 80 sheet pixels across, which is about 32 on screen in Both.';

export const COMPARE_NOTES: readonly string[] = [
  'The loader is drawn only from mount on and only over a pane still loading, so it never stands over a page that is already there.',
  'It leaves on the frame’s load event. A failed load can fire no load event at all, as Safari and Firefox did for a dropped connection, so each loader also leaves after 15 seconds and the pane shows whatever the browser drew.',
];

export const COMPARE_CAPTION = 'Both panes of /compare while their pages load, in Chrome, on paper and on ink.';

export const FIX_ID = 'before-and-after';
export const FIX_TITLE = 'Before and after';
export const FIX_LEAD = 'Two fixes brought the loader to this state: the logo stays the logo outside the moving line, and the hover runs in Safari.';

export const FIX_SHEET_CAPTION =
  'Frames of the hover and the loader before and after the first fix. In the columns against the logo, grey is ink in both the frame and the logo, blue is ink only in the logo and red is ink only in the frame. Before, red edged every still part, because the motion layer drew them a little heavier than the logo. After, red is left only on the line that is moving and where the C closes behind the undrawn meridian. The last two columns show the G’s end at 4x: before, it stopped short of the logo’s tip, and after, it lands on it.';

export const SAFARI_CAPTION = {
  before:
    'Before: the hover in Safari, 0 to 0.6 seconds after the cursor enters. In each pair the top row is the published video and the bottom row the live component, on paper and on ink. The live mark jumped to the end of the draw-back at once.',
  after: 'After: the same frames once the transitions moved onto the dashes. The live mark follows the video.',
};

export const sectionsIn = (n: number) => `${n} ${n === 1 ? 'section' : 'sections'}`;
