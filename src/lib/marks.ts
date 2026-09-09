/**
 * The mark explorations behind /marks: nine new GT marks in three families,
 * each a single filled path in currentColor under public/marks, with the
 * designer's thesis, construction and small-size notes as data. Pure data
 * and types, no React, no DOM, so the server page can read the SVG files
 * and the client viewer can lay them out from the same list.
 *
 * The principle every mark follows (Kevin's brief, after the JET mark): the
 * picture lives in the letters. G and T carry a picture about translation
 * in their counters, joins or reflections, with no separate icon. One
 * color, geometric construction on a 256 grid, legible at 16px and at
 * 256px, on paper and on ink. The order is the judged order, best first.
 * The current doubled-line monogram is kept only as REFERENCE_MARK, the
 * memory the explorations were measured against, never as a candidate.
 */

/** The three families: where the picture sits. */
export type MarkFamily = 'bilingual' | 'counterform' | 'reflection';

export type Mark = {
  /** the file stem under public/marks; unique, and what the hash names */
  id: string;
  name: string;
  family: MarkFamily;
  /** the picture in one sentence */
  thesis: string;
  /** the geometry: grid, stroke, centers, radii, cuts */
  construction: string;
  /** how it behaves at 16px on both grounds */
  small: string;
  /** the clean mark, a public path: /marks/<id>.svg */
  file: string;
  /** the construction overlay, a public path: /marks/<id>-construction.svg */
  constructionFile: string;
};

/** The two SVG files of a mark as read from disk by the server page. */
export type MarkArt = { clean: string; construction: string };

/** One of the tests every mark has to pass; the Method section lists them as ruled rows. */
export type MarkTest = { id: string; name: string; text: string };

export const MARK_FAMILIES: readonly { id: MarkFamily; label: string; principle: string }[] = [
  {
    id: 'bilingual',
    label: 'Bilingual',
    principle: 'The Latin GT is at the same time a glyph of another script.',
  },
  {
    id: 'counterform',
    label: 'Counterform',
    principle: 'The picture sits in the counter or the aperture of the G.',
  },
  {
    id: 'reflection',
    label: 'Reflection',
    principle: 'One stroke serves both letters: a shared bar, a mirrored join.',
  },
];

/** The sizes the size rows show, in CSS pixels; 16 is the favicon, 128 the app icon on a phone. */
export const MARK_SIZES: readonly number[] = [16, 24, 32, 64, 128];

export const MARK_TESTS: readonly MarkTest[] = [
  {
    id: 'letters',
    name: 'The picture is in the letters',
    text: 'The G and the T carry the picture in their counters, joins or reflections. There is no separate icon, no badge and no container around the letters.',
  },
  {
    id: 'one-color',
    name: 'One color',
    text: 'The mark is a single filled path in currentColor, so it takes the ink of wherever it sits. No accent color, no gradient, no shadow, no second tone.',
  },
  {
    id: 'grid',
    name: 'Built on the grid',
    text: 'A 256 unit square in 16 unit modules with a 32 unit stroke. Every corner, tangent and cut lands on the grid or on a stated angle, and the construction overlay shows where.',
  },
  {
    id: 'small',
    name: 'Reads at 16px',
    text: 'At favicon size the letters carry the mark: G and T stay legible, the mouth of the G stays open and no counter closes. The picture may appear only from 32 or 48px, but the letters never depend on it.',
  },
  {
    id: 'large',
    name: 'Reads at 256px',
    text: 'At app icon size the picture reads without a caption, and no join, tangent or kink breaks the geometry.',
  },
  {
    id: 'grounds',
    name: 'Paper and ink',
    text: 'The same path positive (ink on paper) and reversed (paper on ink), with no redraw for either ground. The theme switch swaps the grounds on this page.',
  },
];

function mark(
  id: string,
  name: string,
  family: MarkFamily,
  thesis: string,
  construction: string,
  small: string
): Mark {
  return {
    id,
    name,
    family,
    thesis,
    construction,
    small,
    file: `/marks/${id}.svg`,
    constructionFile: `/marks/${id}-construction.svg`,
  };
}

/** The nine marks in the judged order, best first. */
export const MARKS: readonly Mark[] = [
  mark(
    'bilingual-3',
    'Ding hook',
    'bilingual',
    'The CJK glyph 丁 is a T that ends in a leftward hook. Here that hook is the bar of the G, so one stroke is at once the foot of 丁 and the bar of the Latin G, and the mouth of the G opens under the arm of the T.',
    '256 grid, 32 unit monoline. Crossbar y 16 to 48, x 96 to 256 (arms of 64 and 64). Stem x 160 to 192 from y 16 down to y 176, where it turns left into the hook: bar y 144 to 176, x 80 to 192, the outer corner of the hook being the right edge of the stem. The G is a circle centered (80, 160), outer R 80, inner r 48 (x 0 to 160, y 80 to 240); the ring runs from the bar level round the bottom, the left and the top to a vertical cut at x 112, leaving a 48 unit mouth toward the stem. The ring is tangent to the left edge of the stem at the bar.',
    'The clearest of the nine at 16px: a round G with a visible 3px mouth and a bar, and a T whose stem drops onto that bar. The T sits high right and the G low left, so the pair reads left to right as GT, and the 丁 silhouette survives on both grounds.'
  ),
  mark(
    'bilingual-2',
    'Kufic loop',
    'bilingual',
    'The G is the flat loop and the T is the tall stroke rising from the right end of the loop, which is the structure of Arabic ط (ṭāʾ), the emphatic T. The shared stroke is the floor: the bottom of the G runs under the stem of the T, so the T stands on the G.',
    '256 grid, 32 unit monoline, square Kufic with two rounded corners. Loop outer x 0 to 208 (the floor), y 80 to 240; left outer corners R 48 with inner r 16 (centers (48, 128) and (48, 192)); the top arm ends at x 96 so the mouth is 48 wide; bar y 144 to 176, x 80 to 144, with a spur x 112 to 144 down to the floor. Stem x 176 to 208, y 16 to 208, standing on the floor at its right end; crossbar y 16 to 48, x 128 to 256 (arms of 48 and 48, centered on the stem). 32 units of clearance between the crossbar and the loop.',
    'At 16px: a boxy G with a round left edge and a 3px mouth, a 2px stem rising from its floor and a 2px crossbar above; both counters survive as 2px slots. Reads GT cleanly on paper and ink, and the loop plus stem silhouette is the ط.'
  ),
  mark(
    'counterform-3',
    'Page G',
    'counterform',
    'The counter of the G is a sheet of paper: a 72 by 96 page with its top right corner folded down, the flap being the end of the top arm of the G, and the bar as a line of text. The mouth sits under the fold, exactly where a plain G opens.',
    'Squared G, outer x 24 to 160, y 48 to 208 with corner R 24, stroke 32, counter x 56 to 128, y 80 to 176 with square corners (page ratio 0.75). Flap of 24: the fold line runs from (104, 80) to (128, 104), and the right edge of the flap faces the mouth. Bar y 120 to 152 from x 88 flush to the outer edge of the stem. Mouth of 40 at the outer edge (y 80 to 120), 16 at the counter wall. T: crossbar x 176 to 240, y 48 to 80; stem x 192 to 224, y 48 to 208; a 16 unit gap to the G.',
    'The best small read of the counterform family: an unmistakable squared GT on paper and ink at 16px. The flap merges into the arm and the mouth reads as a 2.5px slot; from 32px the cut corner already reads as a document.'
  ),
  mark(
    'counterform-1',
    'Balloon G',
    'counterform',
    'The G is the outline of a speech balloon. Its top arc ends in a pointed tail that leaves the ring at two o\'clock and points into the left bay of the T, so the G is speaking to the T.',
    '16 unit grid with 8 unit half steps, stroke 32 throughout. G: ring centered (88, 128), outer R 80, inner R 48; bar y 120 to 152 from the center x 88 to the outer circle; the terminal is a flat cut at y 96 (mouth of 24 at the outer edge and at the counter wall). The upper edge of the tail leaves the outer circle at minus 50 degrees (139.4, 66.7) and runs to the tip (192, 104) with a 5 degree kink off the tangent of the circle; the underside runs from the outer corner of the terminal (161.3, 96) to the tip at 15 degrees below horizontal. T: crossbar x 184 to 248, y 48 to 80; stem x 200 to 232, y 48 to 208. The tip stops 8 units short of the stem and 24 units under the crossbar.',
    'Reads GT cleanly at 16px on paper and ink. The tail collapses to a one pixel spur on the terminal of the G and the mouth stays a 1.5px gap, so the letters carry it and the balloon appears from about 48px.'
  ),
  mark(
    'reflection-3',
    'Still water',
    'reflection',
    'A bridge and its reflection in still water. The crossbar of the T is the deck resting on the crown of the G, the stem of the T is the pier, the bar of the G is the waterline running out through the aperture to the pier, and the ring of the G is the arch above the water with its mirror image below.',
    '16 unit grid, stroke 32. Ring centered (88, 144), outer radius 88, inner 56; terminal cut radially at minus 40 degrees; the spur rises to y 128 (the top of the bar). Deck x 88 to 256, y 32 to 64, sunk 8 units into the crown so the join is solid; stem x 200 to 232 from the deck to y 232, 24 clear of the ring; bar y 128 to 160 from the center of the ring at x 88 to the stem. The right arm of the T is 24 units.',
    'Reads GT cleanly at 16px on paper and on ink: the ring, the bar and the crossbar of the T with its stem stay separate pixels. The bridge needs the thesis; the letters do not.'
  ),
  mark(
    'reflection-1',
    'Two-way',
    'reflection',
    'The bar of the G and the crossbar of the T are one stroke, a two-way arrow that starts inside the counter of the G, leaves through the aperture, carries the stem of the T and ends past it. The exchange between two languages is the stroke both letters hang from.',
    '16 unit grid, stroke 32 (2 units). G ring centered (80, 80), outer radius 80, inner 48; terminal cut radially at minus 50 degrees; the spur rises to y 96 where it meets the shaft. Shaft y 64 to 96 from x 72 to 224; triangular heads 32 long and 64 tall, with apexes at (40, 80) inside the counter and (256, 80) past the stem. Stem x 176 to 208 from the shaft down to y 256. The letters are staggered: the G occupies the top left 160 square and the T hangs from the arrow into the bottom right.',
    'At 16px the heads flatten to a 2px bar with pointed ends; the ring, the bar and the long stem still read as G and T on both grounds. The arrow itself appears from about 48px.'
  ),
  mark(
    'bilingual-1',
    'Shirorekha',
    'bilingual',
    'The crossbar of the T runs across the whole lockup as a Devanagari headline and the G hangs below it with its bowl closed against the stem of the T. The pair sits in the posture of a Devanagari letter, the bowl against stem structure of त that is visually nearest ब, while the Latin G keeps an open mouth toward the T.',
    '256 grid in 16 unit modules, 32 unit monoline. Headline y 16 to 48 across x 0 to 256. Stem x 160 to 192, y 16 to 240 (right arm of 64). The G is a circle centered (80, 160), outer R 80, inner r 48 (x 0 to 160, y 80 to 240); the ring is cut vertically at x 96 so the mouth is 64 wide toward the stem. Bar y 144 to 176 from x 96 into the stem; a floor run y 208 to 240 from x 80 into the stem closes the bowl the way a Devanagari bowl closes. 32 units of clearance (2px at 16px) between the headline and the G, so the mouth opens upward into daylight.',
    'At 16px: a 2px rule, a 2px gap, then a C with a bar tucked into a stem. It reads as GT under a rule and, to a Devanagari reader, as one hanging letter. The 4px mouth at the upper right keeps the G from collapsing into a box.'
  ),
  mark(
    'counterform-2',
    'Globe G',
    'counterform',
    'The counter of the G is a globe drawn by the T standing inside it. The stem of the T is the central meridian running to the south pole, its crossbar spans the disc as a parallel and closes a polar cap, and the bar of the G is the equator from the meridian out through the ring.',
    'Ring centered (128, 128), outer R 120, inner R 88, stroke 32: a monogram filling the square from 16 to 240. Crossbar y 64 to 96 as a chord from wall to wall, leaving a 24 unit cap above it; stem x 112 to 144 from y 64 down into the inner bottom of the ring; bar y 128 to 160 from the stem to the outer circle. The terminal is the underside of the crossbar extended through the ring at y 96, so the mouth is a 32 unit slot between the crossbar and the bar. One evenodd path: an outer loop plus three holes (the cap, the left counter, the lower right quadrant).',
    'At 16px it reads as a T inside a G ring with a 2px mouth tucked under the crossbar; the cap vanishes, so it is a monogram at small sizes and a globe from 32px up. The weakest letter read of the counterform family: the G depends on the mouth, and the arms of the T merge into the ring.'
  ),
  mark(
    'reflection-2',
    'Meridian',
    'reflection',
    'The stem of the T drops through the center of the G as a meridian, and the bar of the G runs in from the aperture to meet it as a half equator, so the ring reads as a globe with the T as its axis.',
    '16 unit grid with half steps, stroke 40. Ring centered (128, 148), outer radius 108, inner 68, tangent to the underside of the crossbar at y 40; terminal cut radially at minus 50 degrees; the spur rises to y 128 (the top of the bar). Bar y 128 to 168 from the right edge of the stem at x 148 to the inner wall. Crossbar x 24 to 232, y 0 to 40. Stem x 108 to 148, full height, merging with the ring at the top and the bottom.',
    'At 16px it is a T set in a ring with a short bar to the right: the T reads outright, the G reads as ring plus aperture plus bar rather than as a separate letter. Distinct as a favicon, but the weakest of the reflection family for spelling GT small.'
  ),
];

/** The family record for a mark. */
export function markFamily(mark: Mark): { id: MarkFamily; label: string; principle: string } {
  return MARK_FAMILIES.find((family) => family.id === mark.family) ?? MARK_FAMILIES[0];
}

/**
 * The current mark, the doubled-line GT monogram, as the deck draws it
 * (deck/parts/head.html, the #gt-mark symbol): the reference the
 * explorations were measured against, shown once at the end of /marks and
 * never as a candidate. One evenodd path in currentColor.
 */
export const REFERENCE_MARK = {
  name: 'The current mark',
  viewBox: '-8 214 1213 771',
  d: 'M363 222.5L1197 222.5L1196.5 283L834 283.5L832.5 976L773 975.5L772.5 398L359.5 398L341.5 401L301.5 414L271.5 430L249.5 446L231 463.5L214 484.5L190 529.5L180 567.5L178 613.5L185 653.5L196 682.5L217 717.5L242.5 746L270.5 768L314.5 790L342.5 798L372.5 802L399.5 802L430.5 798L475.5 783L502.5 768L524 751.5L523.5 747L415.5 748L414.5 684L583 684.5L583 923.5L580.5 926L516.5 955L476.5 967L439.5 974L403.5 977L355.5 976L326.5 973L287.5 965L252.5 954L221.5 941L187.5 923L155.5 902L121.5 874L97 849.5L77 825.5L55 793.5L33 752.5L15 705.5L4 656.5L0 613.5L2 556.5L10 511.5L23 469.5L44 423.5L66 387.5L99 346.5L129.5 317L170.5 286L225.5 256L275.5 237L325.5 226L363 222.5Z M386.5 282L322.5 288L275.5 301L220.5 327L167.5 365L123 413.5L103 443.5L87 474.5L71 518.5L61 578.5L63 641.5L68 669.5L78 703.5L107 762.5L143 810.5L171.5 838L194.5 856L248.5 887L305.5 907L366.5 916L403.5 916L442.5 912L490.5 900L523.5 887L524 826.5L479.5 847L440.5 858L399.5 863L344.5 860L291.5 846L254.5 829L214.5 802L186 775.5L165 749.5L141 708.5L125 664.5L118 624.5L118 573.5L126 530.5L139 494.5L165 449.5L201.5 408L238.5 379L292.5 352L341.5 339L373.5 336L773 336.5L772.5 283L386.5 282Z M888 337.5L1197 337.5L1196.5 398L949 398.5L948.5 976L888 975.5L888 337.5Z M415 571.5L692 572.5L692 830.5L668 858.5L633.5 890L631 890.5L631 635.5L414.5 635L415 571.5Z',
} as const;
