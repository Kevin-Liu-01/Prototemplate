import type { MarkId } from '@/lib/graticule/geometry';
import type { LineAnimationId } from '@/lib/graticule/line-loop';
import { graticuleMarks } from '@/lib/marks';

/** Every graticule mark in the page's order (src/lib/marks.ts). */
export const GRATICULE_MARKS = graticuleMarks();

/** The head's lead. */
export const LEAD = 'Every graticule mark is cut from one wireframe globe, whose ring, latitudes, meridians and equator draw its letters.';

/** The section of the marks; its divider is the h2 alone. */
export const MARKS_ID = 'marks';
export const MARKS_TITLE = 'Marks';

/** The section of the line globe animations; its divider is the h2 and the lead. */
export const ANIMATIONS_ID = 'animations';
export const ANIMATIONS_TITLE = 'Animations';
export const ANIMATIONS_LEAD = 'Each plays on Graticule GT, heavy, then on Graticule jaw, thicker.';

/** The marks every animation plays on, heavy first, each with the catalog id that gives its name and its drawn box. */
export const ANIMATED_MARKS: readonly { mark: MarkId; id: string }[] = [
  { mark: 'heavy', id: 'graticule-gt-heavy' },
  { mark: 'jaw', id: 'graticule-jaw-thicker' },
];

/** One animation: its id in src/lib/graticule/line-loop.ts, which holds its name, and what moves in it. */
export type Animation = { id: LineAnimationId; caption: string };

/** The animations in the order they were chosen. Each starts and ends on the exact mark. */
export const ANIMATIONS: readonly Animation[] = [
  {
    id: 'language-turn',
    caption: 'The ring, the bar and the latitude hold still while the meridians turn across the face, and the G and the T open each time the globe stops.',
  },
  {
    id: 'globe-lean',
    caption: 'Each line keeps both ends on the still ring and only its bow changes, so the globe leans and looks round while the G and the T stay whole.',
  },
  {
    id: 'mark-to-globe',
    caption: 'The cuts close, the oval straightens into two parallels and the meridians turn, then the lines fold back into the G and the T.',
  },
];

/** The section of the variations; its divider is the h2 and the lead. */
export const VARIATIONS_ID = 'variations';
export const VARIATIONS_TITLE = 'Variations';

/** The catalog mark whose drawn box every variation shares: each variation's file keeps its 256 unit square and draws its ring at the same centre and outer diameter. */
export const VARIATIONS_BOX_OF = 'graticule-jaw-thicker';

/** One variation: its name, what it draws or changes, and its public file in currentColor. */
export type Variation = { id: string; name: string; caption: string; file: string };

/** A variation before its file is added. */
type VariationEntry = Omit<Variation, 'file'>;

/** The new drawings of the globe, in the order chosen. Each caption says what the whole drawing does. */
const DRAWINGS: readonly VariationEntry[] = [
  {
    id: 'graticule-thin-curved-bar',
    name: 'Thin curved bar',
    caption:
      "Thin lines draw the whole globe, the G's top arc meets the right meridian in a point and the two halves of the bar curve down side by side into the T's stem.",
  },
  {
    id: 'graticule-heavy-curved-bar',
    name: 'Heavy curved bar',
    caption:
      'Heavy lines draw the globe with no meridians, and the bar runs from ring to ring and curves into a stem that stops a gap above the lower latitude, with a second stem below it.',
  },
  {
    id: 'graticule-heavy-open-bar',
    name: 'Heavy open bar',
    caption:
      'Heavy lines draw the globe with no meridians, the bar runs from a free end inside the G to the ring, and the stem hangs from it through two fillets and stops a gap above the lower latitude, with a second stem below it.',
  },
  {
    id: 'graticule-rounded-t',
    name: 'Rounded T',
    caption:
      "One oval draws the G from the bar round the left to an open end, and the T's stem meets the bar through two round fillets, every line at the ring's weight.",
  },
  {
    id: 'graticule-thin-crossing-bar',
    name: 'Thin crossing bar',
    caption:
      "Thin lines draw the whole globe, the G's top arc meets the right meridian in a point and a straight bar crosses the left meridian and drops a stem to the ring.",
  },
  {
    id: 'graticule-heavy-joined-stem',
    name: 'Heavy joined stem',
    caption:
      'Heavy lines draw the globe with no meridians, the bar runs from a free end inside the G to the ring, and the stem hangs from it through two fillets and runs into the lower latitude, with a second stem a gap below it.',
  },
  {
    id: 'graticule-star-crossing',
    name: 'Star crossing',
    caption:
      "The stem and the equator meet in a four-point star, the latitudes stop short of the left meridian on its outer side, and the G's top arc runs past the right meridian to an open end.",
  },
  {
    id: 'graticule-star-hook',
    name: 'Star hook',
    caption:
      "The stem and the equator meet in a four-point star, the G's top arc bends down at its end into a point on the right meridian, and a short piece of the equator runs from the ring to just outside the left meridian.",
  },
  {
    id: 'graticule-medium-short-stem',
    name: 'Medium short stem',
    caption:
      "Every break is half a line's width wide, the G's top arc ends square past the right meridian and the bar curves into a stem that ends on the lower latitude.",
  },
  {
    id: 'graticule-medium-long-stem',
    name: 'Medium long stem',
    caption:
      "Every break is half a line's width wide, the G's top arc ends square past the right meridian and the bar curves into a stem that runs through the lower latitude to the ring.",
  },
];

/**
 * The redraws of an earlier build of Graticule jaw, thicker, best first. That
 * build's stub in the G's opening is a sliver. The lead says so once, so a
 * caption names the stub only where its redraw changes it.
 */
const REDRAWS: readonly VariationEntry[] = [
  {
    id: 'graticule-jaw-no-stub',
    name: 'No stub',
    caption: 'The stub is gone, so the opening is clear and every other cut stays as it was.',
  },
  {
    id: 'graticule-jaw-joined-left-arcs',
    name: 'Joined left arcs',
    caption:
      "The stub is gone and the meridian's left arcs join both latitudes, so cuts remain only above the G's top arc, beside the T's stem and at the jaw's foot.",
  },
  {
    id: 'graticule-jaw-heavy-crossings',
    name: 'Heavy crossings',
    caption:
      "The gaps are half the line's width, the left meridian is whole and the stem runs through the lower latitude, as in Graticule GT, heavy. The jaw stays and the stub is gone.",
  },
  {
    id: 'graticule-jaw-stem-cross',
    name: 'Stem cross',
    caption: "The stub is gone and the lower latitude runs through the T's stem, so the stem makes a cross as in Graticule GT, heavy.",
  },
  {
    id: 'graticule-jaw-no-top-arcs',
    name: 'No top arcs',
    caption: "The meridian's two arcs above the G's top arc are gone with the stub, so the cap of the globe is empty.",
  },
  {
    id: 'graticule-jaw-three-quarter-gaps',
    name: 'Three-quarter gaps',
    caption: "Every gap is three quarters of the line's width, so most cuts narrow a little and the stub grows into a short piece.",
  },
  {
    id: 'graticule-jaw-half-stroke-gaps',
    name: 'Half-stroke gaps',
    caption: "Every gap is half the line's width, so the cuts become crisp slits and the stub grows longer.",
  },
  {
    id: 'graticule-jaw-narrow-stub-gaps',
    name: 'Narrow stub gaps',
    caption: "The gap above the G's top arc and both gaps around the stub narrow to half the line's width, so the stub grows longer.",
  },
  {
    id: 'graticule-jaw-narrow-arc-gaps',
    name: 'Narrow arc gaps',
    caption: "The gaps at the top left arc, the lower left arc and the jaw's foot narrow to half the line's width.",
  },
  {
    id: 'graticule-jaw-stub-on-bar',
    name: 'Stub on the bar',
    caption: 'The stub rises from the bar with no gap, in line with the jaw below, so the two make a cross inside the opening.',
  },
  {
    id: 'graticule-jaw-hanging-stub',
    name: 'Hanging stub',
    caption: "The stub hangs from the G's top arc with no gap, as a branch near the arc's end.",
  },
  {
    id: 'graticule-jaw-full-stroke-gaps',
    name: 'Full-stroke gaps',
    caption: "Every gap is the line's full width, so the stub shrinks to a speck and the top arcs get shorter.",
  },
  {
    id: 'graticule-jaw-meridian-into-opening',
    name: 'Meridian into the opening',
    caption: "The meridian's top right arc runs on through the G's top arc into the opening, in place of the stub, and stops a gap above the bar.",
  },
  {
    id: 'graticule-jaw-no-lower-arcs',
    name: 'No lower arcs',
    caption: "The meridian's two arcs below the lower latitude are gone, so only the T's stem reaches the ring at the bottom.",
  },
  {
    id: 'graticule-jaw-joined-lower-crossings',
    name: 'Joined lower crossings',
    caption: 'The lower left arc and the jaw both run into the lower latitude, so the jaw no longer hangs free.',
  },
  {
    id: 'graticule-jaw-joined-jaw',
    name: 'Joined jaw',
    caption: 'The jaw runs into the lower latitude, so the right meridian is whole from the bar to the ring.',
  },
  {
    id: 'graticule-jaw-flipped-breaks',
    name: 'Flipped breaks',
    caption: 'Each one-sided break moves to the other side of its crossing, so the jaw joins the lower latitude.',
  },
  {
    id: 'graticule-jaw-two-sided-breaks',
    name: 'Two-sided breaks',
    caption:
      'The meridian breaks on both sides of each latitude it passes under, so the left meridian between the latitudes hangs from the equator alone.',
  },
  {
    id: 'graticule-jaw-wide-gaps',
    name: 'Wide gaps',
    caption: "Every gap is one and a half times the line's width, so the stub disappears, the top arcs shrink to wedges and the jaw to a short piece.",
  },
  {
    id: 'graticule-jaw-meridian-below-bar',
    name: 'Meridian below the bar',
    caption: 'The meridian is gone above the bar, with its top arcs and the stub, so the globe reads as a bowl.',
  },
  {
    id: 'graticule-jaw-woven-crossings',
    name: 'Woven crossings',
    caption:
      "The meridian and the latitudes alternate over and under around the ring, which adds cuts and leaves a loose dash between the T's stem and the jaw.",
  },
  {
    id: 'graticule-jaw-no-gaps',
    name: 'No gaps',
    caption: "Every line joins every line it meets, so the only cut left is the free end of the G's top arc.",
  },
  {
    id: 'graticule-jaw-latitude-breaks',
    name: 'Latitude breaks',
    caption:
      "At every crossing the latitude breaks and the meridian runs whole, so the G's top arc hooks into the right meridian and its end is left as a loose piece in the opening.",
  },
];

/** The variations: the new drawings, then the redraws. They are drawn on this page alone and are not catalog rows (src/lib/marks.ts). */
export const VARIATIONS: readonly Variation[] = [...DRAWINGS, ...REDRAWS].map((variation) => ({ ...variation, file: `/marks/graticule/variations/${variation.id}.svg` }));

/** The section's lead, true of every variation: it counts the new drawings, which come first. */
export const VARIATIONS_LEAD = `The first ${DRAWINGS.length} are new drawings of the globe, and the rest redraw an earlier build of Graticule jaw, thicker, whose stub in the G's opening is a sliver.`;

/** A count with its noun. */
export const marksIn = (n: number) => `${n} ${n === 1 ? 'mark' : 'marks'}`;
export const animationsIn = (n: number) => `${n} ${n === 1 ? 'animation' : 'animations'}`;
export const variationsIn = (n: number) => `${n} ${n === 1 ? 'variation' : 'variations'}`;
