import { graticuleMarks } from '@/lib/marks';

/** Every graticule mark in the page's order (src/lib/marks.ts). */
export const GRATICULE_MARKS = graticuleMarks();

/** The head's lead. */
export const LEAD = 'Every graticule mark is cut from one wireframe globe, whose ring, latitudes, meridians and equator draw its letters.';

/** The section of the marks; its divider is the h2 alone. */
export const MARKS_ID = 'marks';
export const MARKS_TITLE = 'Marks';

/** The section of the variations of Graticule jaw, thicker; its divider is the h2 and the lead. */
export const VARIATIONS_ID = 'variations';
export const VARIATIONS_TITLE = 'Variations';
export const VARIATIONS_LEAD = 'Each variation redraws Graticule jaw at the line weight of Graticule GT, heavy, with one change.';

/** The catalog mark the variations redraw; each variation's file keeps its 256 unit square and its ring, so they share its drawn box. */
export const VARIATIONS_OF = 'graticule-jaw-thicker';

/** One variation: its name, what it changes, and its public file in currentColor. */
export type Variation = { id: string; name: string; caption: string; file: string };

/** The variations, best first. They are drawn on this page alone and are not catalog rows (src/lib/marks.ts). */
export const VARIATIONS: readonly Variation[] = [
  {
    id: 'graticule-jaw-no-stub',
    name: 'No stub',
    caption: "The stub in the G's opening is gone, so the opening is clear and every other cut stays as it was.",
  },
  {
    id: 'graticule-jaw-joined-left-arcs',
    name: 'Joined left arcs',
    caption:
      "The stub in the G's opening is gone and the meridian's left arcs join both latitudes, so cuts remain only above the G's top arc, beside the T's stem and at the jaw's foot.",
  },
  {
    id: 'graticule-jaw-heavy-crossings',
    name: 'Heavy crossings',
    caption:
      "Every crossing follows Graticule GT, heavy, with half-stroke gaps, a whole left meridian and the stem through the lower latitude, but the jaw stays and the stub in the G's opening is gone.",
  },
  {
    id: 'graticule-jaw-stem-cross',
    name: 'Stem cross',
    caption:
      "The stub in the G's opening is gone and the lower latitude runs through the T's stem, so the stem makes a cross as in Graticule GT, heavy.",
  },
  {
    id: 'graticule-jaw-no-top-arcs',
    name: 'No top arcs',
    caption: "The meridian's two arcs above the G's top arc and the stub in the G's opening are gone, so the cap of the globe is empty.",
  },
  {
    id: 'graticule-jaw-three-quarter-gaps',
    name: 'Three-quarter gaps',
    caption:
      "Every gap is three quarters of the line's width, so most cuts narrow a little and the stub in the G's opening stays a short piece.",
  },
  {
    id: 'graticule-jaw-half-stroke-gaps',
    name: 'Half-stroke gaps',
    caption: "Every gap is half the line's width, so the cuts become crisp slits and the stub in the G's opening grows longer.",
  },
  {
    id: 'graticule-jaw-narrow-stub-gaps',
    name: 'Narrow stub gaps',
    caption:
      "The gap above the G's top arc and both gaps around the stub in the G's opening narrow to half the line's width, so the stub grows into a longer piece.",
  },
  {
    id: 'graticule-jaw-narrow-arc-gaps',
    name: 'Narrow arc gaps',
    caption:
      "The gaps at the top left arc, the lower left arc and the jaw's foot narrow to half the line's width, and the stub in the G's opening shrinks to a sliver.",
  },
  {
    id: 'graticule-jaw-stub-on-bar',
    name: 'Stub on the bar',
    caption:
      "The stub in the G's opening rises from the bar with no gap, in line with the jaw below, so the two make a cross inside the opening.",
  },
  {
    id: 'graticule-jaw-hanging-stub',
    name: 'Hanging stub',
    caption: "The stub in the G's opening hangs from the G's top arc with no gap, as a branch near the arc's end.",
  },
  {
    id: 'graticule-jaw-full-stroke-gaps',
    name: 'Full-stroke gaps',
    caption: "Every gap is the line's full width, so the stub in the G's opening shrinks to a speck and the top arcs get shorter.",
  },
  {
    id: 'graticule-jaw-meridian-into-opening',
    name: 'Meridian into the opening',
    caption: "The meridian's top right arc runs on through the G's top arc into the opening and stops a gap above the bar.",
  },
  {
    id: 'graticule-jaw-no-lower-arcs',
    name: 'No lower arcs',
    caption:
      "The meridian's two arcs below the lower latitude are gone, so only the T's stem reaches the ring at the bottom, and the stub in the G's opening shrinks to a sliver.",
  },
  {
    id: 'graticule-jaw-joined-lower-crossings',
    name: 'Joined lower crossings',
    caption:
      "The lower left arc and the jaw both run into the lower latitude, so the jaw no longer hangs free, and the stub in the G's opening shrinks to a sliver.",
  },
  {
    id: 'graticule-jaw-joined-jaw',
    name: 'Joined jaw',
    caption:
      "The jaw runs into the lower latitude, so the right meridian is whole from the bar to the ring, and the stub in the G's opening shrinks to a sliver.",
  },
  {
    id: 'graticule-jaw-flipped-breaks',
    name: 'Flipped breaks',
    caption:
      "Each one-sided break moves to the other side of its crossing, so the jaw joins the lower latitude, and the stub in the G's opening shrinks to a sliver.",
  },
  {
    id: 'graticule-jaw-two-sided-breaks',
    name: 'Two-sided breaks',
    caption:
      "The meridian breaks on both sides of each latitude it passes under, so the left meridian between the latitudes hangs from the equator alone, and the stub in the G's opening shrinks to a sliver.",
  },
  {
    id: 'graticule-jaw-wide-gaps',
    name: 'Wide gaps',
    caption:
      "Every gap is one and a half times the line's width, so the stub in the G's opening disappears, the top arcs shrink to wedges and the jaw to a short piece.",
  },
  {
    id: 'graticule-jaw-meridian-below-bar',
    name: 'Meridian below the bar',
    caption: "The meridian is gone above the bar, with its top arcs and the stub in the G's opening, so the globe reads as a bowl.",
  },
  {
    id: 'graticule-jaw-woven-crossings',
    name: 'Woven crossings',
    caption:
      "The meridian and the latitudes alternate over and under around the ring, which adds cuts and leaves a loose dash between the T's stem and the jaw, and the stub in the G's opening shrinks to a sliver.",
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
      "At every crossing the latitude breaks and the meridian runs whole, so the G's top arc hooks into the right meridian and its end is left as a loose piece in the G's opening.",
  },
].map((variation) => ({ ...variation, file: `/marks/graticule/variations/${variation.id}.svg` }));

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
export const variationsIn = (n: number) => `${n} ${n === 1 ? 'variation' : 'variations'}`;
