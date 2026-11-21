/**
 * The words and the files of /marks/loading: the finished loader first, then
 * the hover, which is the loader, the logo form for videos, how the motion is built, the checks that
 * hold it, reduced motion, the loader on /compare, the armillary and the
 * ASCII loader as explorations, and the before and after of the fix. The
 * timings come from scripts/build/logo-motion.json through the server page,
 * so the page and the component never disagree.
 */

/** The beats of the motion in milliseconds, read from scripts/build/logo-motion.json and the generated geometry by the server page. */
export type LoaderTiming = { drawBack: number; meridian: number; restAfterMeridian: number; g: number; meridianReturn: readonly [number, number]; lap: number; formReturn: readonly [number, number] };

export const lapOf = (t: LoaderTiming) => t.lap;

export const LEAD =
  'The General Translation logo while a page loads and while it is hovered, running live, and the logo form that videos play, then the work behind it: how the motion is built, the checks that hold it, two loaders kept as explorations and the fix that keeps everything but the moving line on the logo itself.';

export const LOADER_ID = 'loader';
export const LOADER_TITLE = 'The loader';
export const LOADER_LEAD =
  'The loading animation: meridian, then G, from the logo to the logo. The meridian draws back and a line runs once round it; then the G draws off and back on once round the equator, and the meridian draws on again from behind it as it returns, so every lap lands on the logo.';

/** The beats of the loader as rows of the timing table. */
export const timingRows = (t: LoaderTiming): readonly { name: string; ms: number; note: string }[] => [
  { name: 'Draw-back', ms: t.drawBack, note: 'The meridian draws back along its oval to the logo without its meridian, easing in and out at one even pace wherever it shows.' },
  { name: 'Meridian lap', ms: t.meridian, note: 'A line runs once round the meridian, over the logo without its meridian.' },
  { name: 'Rest', ms: t.restAfterMeridian, note: 'The logo without its meridian holds still.' },
  { name: 'G lap', ms: t.g, note: 'The G draws off from its tip round the equator and back on, landing on its tip again.' },
  { name: 'Meridian return', ms: t.meridianReturn[1] - t.meridianReturn[0], note: `From ${t.meridianReturn[0]} ms, a beat after the G drawing back on has reached the meridian’s join, the meridian draws on again from behind the G, gently at first and with a long settle, and lands on the logo at ${t.meridianReturn[1]} ms.` },
  { name: 'Rest', ms: t.lap - t.meridianReturn[1], note: 'The logo holds still before the next lap.' },
];

/** The loader at the sizes the site uses it, with where each one runs. */
export const LOADER_SIZES: readonly { size: number; where: string }[] = [
  { size: 56, where: 'A prototype’s frame on /present' },
  { size: 32, where: 'A pane on /compare in Both, 80 sheet pixels across' },
  { size: 16, where: 'The smallest size the plate checks' },
];

export const FORM_ID = 'logo-form';
export const FORM_TITLE = 'The logo form';
export const FORM_LEAD =
  'The logo forming, for promotional videos and anywhere else the logo appears in a film. It is the loader’s lap played once, except that the meridian waits until the G has landed and only then draws on, so the two never move at once.';

/** The beats of the logo form as rows of its timing table. */
export const formRows = (t: LoaderTiming): readonly { name: string; ms: number; note: string }[] => [
  { name: 'Draw-back', ms: t.drawBack, note: 'The meridian draws back, as in the loader.' },
  { name: 'Meridian lap', ms: t.meridian, note: 'A line runs once round the meridian.' },
  { name: 'Rest', ms: t.restAfterMeridian, note: 'The logo without its meridian holds still.' },
  { name: 'G lap', ms: t.g, note: `The G draws off and back on round the equator, landing on its tip at ${t.formReturn[0]} ms.` },
  { name: 'Meridian return', ms: t.formReturn[1] - t.formReturn[0], note: `Once the G has landed, the meridian draws on again, gently at first and with a long settle, and lands on the logo at ${t.formReturn[1]} ms.` },
];

export const FORM_LOOP: MotionLoop = {
  id: 'logo-form',
  name: 'The logo form',
  caption: 'Rendered from the film kit’s logo at 1080 pixels and 60 frames a second, still for half a second either side. motion/kit/brand/render-logo-form.mjs writes both themes from the frames a film draws.',
  shipped: true,
};

export const FORM_CODE = `<script src="kit/brand/gt-logo-motion.js"></script>

const logo = GTLogoMotion.create({ ink: 'white' });
box.appendChild(logo.svg);
// on the film's clock, t in seconds from the form's start
logo.set(t);   // the logo before 0 and after GTLogoMotion.DURATION`;

export const ARMILLARY_ID = 'armillary';
export const ARMILLARY_TITLE = 'The armillary loader';
export const ARMILLARY_LEAD =
  'An exploration that no surface uses as a loading state. The logo read as an armillary sphere. The ring is the outer ring seen face on, the meridian and the latitude are rings turned about their own axes, and the stem and the bar are those rings seen edge on. Once a lap the meridian and the G draw back, both rings swing out of their hinges, a full turn and a half turn, passing over and under as the logo’s own crossings do, and the logo draws back on.';

/** The beats of the armillary as rows of its timing table, from GtLogoArmillary.geometry.ts. */
export const armillaryRows = (beats: { rest: number; open: number; swing: number; close: number }): readonly { name: string; ms: number; note: string }[] => [
  { name: 'Rest', ms: Math.round(beats.rest * 1000), note: 'The still logo, its own path.' },
  { name: 'Open', ms: Math.round(beats.open * 1000), note: 'The meridian draws back along its oval and the G back from its tip into the right node, on the loader’s own layers, to the stand: the ring, the bar and the stem.' },
  { name: 'Swing', ms: Math.round(beats.swing * 1000), note: 'Both rings grow out of their hinges, the meridian turns a full turn about the polar axis and the latitude a half turn about the node axis, easing in and out, and they shrink back. The stand holds still.' },
  { name: 'Close', ms: Math.round(beats.close * 1000), note: 'Open run backward, landing on the logo.' },
];

/** The armillary loader at the sizes it is made for; below 32 px the loader above runs instead. */
export const ARMILLARY_SIZES: readonly { size: number; where: string }[] = [
  { size: 56, where: 'A prototype’s frame' },
  { size: 32, where: 'The smallest size it is made for' },
];

export const ASCII_ID = 'ascii';
export const ASCII_TITLE = 'The ASCII loader';
export const ASCII_LEAD =
  'An exploration that no surface uses as a loading state. The logo turned on its sphere and set in a monospace grid, 45 characters by 21 lines, from - to @ by how much of each cell the lines cover and how much light reaches them. The rings turn once a lap and pass behind the globe.';

export const ASCII_NOTES: readonly string[] = [
  'The still holds for a second, then the meridian and the latitude each turn once in 2.5 seconds at 24 frames a second, and the lap lands on the still again.',
  'The frames are written ahead of time by pnpm build:logo-ascii from the same sphere as the armillary, so a frame is 21 rows of text and the still is the same rows in every place it shows.',
  'Each row is a line of monospace text with its letters spaced to the grid’s cells, so any monospace face keeps the grid. The dots are the brand’s 4 by 4 dither screen in the ring’s hole.',
];

export const HOVER_ID = 'hovers';
export const HOVER_TITLE = 'The hover';
export const HOVER_LEAD =
  'The hover is the loader. While the logo’s link is hovered or keyboard focused the loader runs, for as long as the pointer stays. On leave it runs on to the end of its lap, where it lands on the still logo, and stops. The three hovers drawn before it stay as videos.';

/** One hover or loading loop, played from its light and dark videos in /marks/graticule/motion; `poster` when the loop has its own poster, its video's first frame. */
export type MotionLoop = { id: string; name: string; caption: string; shipped: boolean; poster?: true };

export const MOTION_LOOPS: readonly MotionLoop[] = [
  {
    id: 'draw-back',
    name: 'Meridian draws back',
    caption: 'The meridian draws back along its own oval over both poles until the mark is the logo without its meridian, then it draws out again when the cursor leaves. Nothing else moves. The component shipped this one until the loader became the hover on 20 November 2026.',
    shipped: false,
    poster: true,
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
    caption: 'The loader as a video, drawn frame by frame from the component in Chrome. It plays the draw-back, three laps and the draw-back reversed, so it starts and ends on the logo. It was recorded before 20 November 2026, when the meridian began drawing on again with the G at the end of every lap. The ring and the T hold still the whole time.',
    shipped: true,
    poster: true,
  },
];

/** A loop's video in one theme, and its poster: the logo every loop starts and ends on, from the loop's own first frame where it has one. */
export const motionVideo = (id: string, theme: 'light' | 'dark') => `/marks/graticule/motion/${id}-${theme}.mp4`;
export const motionPoster = (loop: MotionLoop, theme: 'light' | 'dark') => `/marks/graticule/motion/${loop.poster ? loop.id : 'rest'}-${theme}.png`;

export const BUILD_ID = 'built';
export const BUILD_TITLE = 'How it is built';
export const BUILD_LEAD = 'GtLogoMotion draws with SVG and CSS alone: no video, no canvas and no script per frame.';

/** The parts of the build, each a term and what it does. */
export const BUILD_PARTS: readonly { term: string; body: string }[] = [
  {
    term: 'The numbers',
    body: 'scripts/build/logo-motion.json holds the logo’s measures and, for each beat, a table of where each moving end stands at 240 samples a second. They are the numbers the published videos were rendered from. The meridian’s draw-back no longer follows its table, which raced through both poles: it eases in and out over the meridian’s visible length, crossing the stretches the ring covers in time to the share that shows.',
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
    body: 'The hover runs the loader’s own animations. On the host’s enter the component sets data-play to loop; after a leave it waits for the rest at the end of the lap, where the frame is the logo, and clears it. A leave during the draw-back sets data-play to settle, which runs the draw-back backward to the logo. --gt-logo-from carries where the lap stands, read from the running animations, so a leave or a return during the draw-back runs on from the frame on screen.',
  },
  {
    term: 'Only the moving line moves',
    body: 'The still layer is the logo’s own path. The motion layer paints that same path and a mask takes it away only where a line has been undrawn, where the logo without that line shows instead. The layers add with plus-lighter in an isolated group under masks that partition the frame, so wherever nothing is undrawn the frame is the logo pixel for pixel.',
  },
  {
    term: 'The ring and the meridian',
    body: 'No mask reaches the ring except beside a line’s ink in its hole, within 0.8 units or 1.5 CSS pixels of it, whichever is more, so the ring is the logo’s own path in every frame and none of its pixels holds a line’s ink. The meridian is only drawn and undrawn along its own ellipse at the logo’s width, and its cut faces stay where the logo’s are until the draw-back reaches them.',
  },
  {
    term: 'Dash lengths',
    body: 'The dashes run on their paths’ own lengths, with no pathLength. Chrome scaled a pathLength dash by a coarser measure of the path than it dashes by, which put a dash’s end up to half a unit short of its numbers, the G’s landing among them.',
  },
  {
    term: 'Browsers',
    body: 'The motion needs @property and plus-lighter: Chrome 113, Safari 17.2 and Firefox 128 or later.',
  },
  {
    term: 'The armillary reading',
    body: 'The meridian oval is a ring of radius 96.26 turned 57.81 degrees about the polar axis, and the latitude oval a ring of radius 96.25 turned 57.93 degrees about the node axis. Seen edge on, the two rings lie within 0.3 units of the stem and the bar.',
  },
  {
    term: 'Over and under',
    body: 'The meridian passes over everything wherever it faces the viewer and under everything wherever it faces away, and the latitude passes over the bar and the stem and under the meridian’s near half. The line underneath is cut by the line on top widened by 5.75 units each side, the mean of the logo’s gaps. The ring is never cut.',
  },
  {
    term: 'Seams',
    body: 'Every seam of the armillary’s lap is the logo, the stand, or a ring 0 long at its hinge, so no hand-off moves a pixel: Open and Close move the loader’s own layers, and the rings start and end inside the stand.',
  },
  {
    term: 'Script',
    body: 'The armillary and the ASCII loader draw with script on one shared animation clock. Before it runs they show their still, they write only what changes, and they stop out of view and under reduced motion.',
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
  'pnpm test:marks runs scripts/lint/logo-motion.test.mjs, which draws the component in Chrome at 4x, seeks it to every 60 fps frame of the hover’s enter and settle, the draw-back and one whole lap, and measures each frame against the logo.';

export const CHECKS: readonly { term: string; body: string }[] = [
  { term: 'Hand-off', body: 'At the start of the hover and of the loader, at the end of the settle and at every seam of the lap, the motion layer is the still logo with no pixel different. The settle starts on the draw-back’s end pose, and a leave or a return during the draw-back starts on the frame it left.' },
  { term: 'Still', body: 'In every frame, every pixel is the logo where the meridian is drawn and the logo without its meridian where it has been undrawn, except within two pixels of the end that moves.' },
  { term: 'Ring', body: 'In every frame the ring’s core and outer edge are the logo’s own pixels, and its inner edge, all the way round, is the logo’s where the meridian is drawn and the ring drawn alone where it has been undrawn.' },
  { term: 'End pose', body: 'The draw-back ends on the logo without its meridian, and on the ring it is exactly the ring drawn alone.' },
  { term: 'Tip', body: 'Through the whole loop the G’s tip is the logo’s, except while the G’s own lap runs over it.' },
  { term: 'Meridian', body: 'Wherever the meridian shows, every pixel it adds lies on the logo’s meridian ellipse at the logo’s width, and each cut face stands where the logo’s does within 0.05 units until the undrawn stretch reaches it.' },
  { term: 'Steps', body: 'No move starts or lands with a pop, and no step inside a move holds a frame.' },
  { term: 'Course', body: 'Every dash stands where the generator’s course puts it at that time, within 0.05 units, and no dash end jumps or stalls where the course does not.' },
];

export const ENGINES_CAPTION =
  'The loader at 0.3, 1.25 and 2.55 seconds in Chrome, Firefox and WebKit, on paper and on ink. Only Chrome is held to the pixel. Firefox and WebKit round masks and blends by a level here and there, so the test draws them on request with LOGO_MOTION_BROWSERS.';

export const REDUCED_ID = 'reduced';
export const REDUCED_TITLE = 'Reduced motion';
export const REDUCED_LEAD = 'Under reduced motion the hover does nothing and the loader is the still logo with its label.';

export const REDUCED_NOTES: readonly string[] = [
  'The armillary and the ASCII loader show their still, the logo and the turned logo in ASCII, with their labels, and start no clock.',
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
export const FIX_LEAD =
  'Four fixes brought the loader to this state. The first keeps the logo the logo outside the moving line, the second makes the hover run in Safari, the third keeps the ring off every mask, holds the meridian to its own ellipse and measures each dash on its path’s own length, and the fourth takes the last of the meridian’s ink off the ring’s inner edge.';

export const RING_CAPTION = {
  points:
    'The ring’s inner edge at 8x in light, at the four points 23.1 degrees either side of each pole where the meridian’s ink leaves the ring, in the end pose, a rest and a G lap. Old is main at 8e91d034, and red marks each pixel that differs from the ring drawn alone by more than 32 levels. The band no mask reaches was cut most of a degree short of where the meridian’s ink leaves the ring, so a tick of the meridian showed there once it was undrawn. The band is now drawn from the lines themselves, and no tick is left.',
  webkit:
    'The north pole’s merge at 8x in WebKit, the logo at 96 px on a 2x screen, in the end pose. WebKit draws a mask in CSS pixels, so at this size a reach of 0.8 units left the meridian’s ink on the ring’s inner edge as a grey fringe. The reach is now 0.8 units or 1.5 CSS pixels, whichever is more, and the fringe is gone.',
};

export const FIX_SHEET_CAPTION =
  'Frames of the hover and the loader from the first loader and from main at 8e91d034, the third fix, before the ring fix below. In the columns against the logo, grey is ink in both the frame and the logo, blue is ink only in the logo and red is ink only in the frame. Before, red edged every still part, because the motion layer drew them a little heavier than the logo, so the G’s top arc moved and the meridian’s C shrank. After, red is left only on the line that is moving and where the C closes behind the undrawn meridian. The G end at 4x: before, it stopped short of the logo’s tip, and after, it lands on it. The last row is the meridian’s bottom cut face at 8x: in the first hover it had moved 4.86 units by 1.083 seconds, and after the fix it has not moved.';

export const SAFARI_CAPTION = {
  before:
    'Before: the hover in Safari, 0 to 0.6 seconds after the cursor enters. In each pair the top row is the published video and the bottom row the live component, on paper and on ink. The live mark jumped to the end of the draw-back at once.',
  after: 'After: the same frames once the transitions moved onto the dashes. The live mark follows the video.',
};

export const sectionsIn = (n: number) => `${n} ${n === 1 ? 'section' : 'sections'}`;
