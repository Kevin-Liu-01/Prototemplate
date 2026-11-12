/**
 * Glyph globe: the dithered earth with glyph tiles from the launch graphics
 * and films, as one GPU engine.
 *
 * The default draws the launch look exactly: one whole-earth tone map
 * (public/media/glyph-globe/sphere.png, 2048 by 1024, equirectangular)
 * turned under an orthographic view, screened through the 8 by 8 Bayer
 * matrix of src/lib/dither.ts on square cells anchored to the canvas's top
 * left, in three blues on ink. Over the earth sits a flat grid of tiles
 * fixed to the frame: where the blurred tone under a tile is over the
 * threshold the tile is a solid square in one of two blues holding one
 * white letter from a 64-letter atlas of the world's scripts
 * (public/media/glyph-globe/atlas.png), and every letter flashes to a new
 * one on each beat. A few dark tiles hold a lone letter. Over that, the sky:
 * a rim light and a sunrise glow round the limb, a blue bloom of the lit
 * earth, and sparse stars that twinkle. The earth spins one way at one
 * speed, a whole turn per loop, so a loop joins without a jump.
 *
 * Every frame is a pure function of the loop time, so the loop is seamless
 * and a still is any time. All lengths are shares of the globe's radius, so
 * the look holds at any size; at the launch framing on a 1600 by 900 CSS
 * box at a pixel ratio of 2 every cell, tile and star lands on the device
 * pixel the launch renderer drew it on.
 *
 * Glyph modes: 'tiles' (the launch default, a grid fixed to the frame),
 * 'surface' (tiles fixed to the sphere in rows of latitude, foreshortened
 * at the limb, each rolling over as a front of change crosses the view),
 * 'grid' (larger frame-fixed tiles whose letters change every four beats
 * through a Bayer-order dissolve that sweeps east to west) and 'none'.
 *
 * ARCHITECTURE, as studio-field.ts and horizon-field.ts: at most ONE WebGL
 * context for this module, shared by every globe on the page. Each globe
 * registers here; the engine draws into one offscreen canvas and blits
 * into the globe's own 2D canvas. The context is built, and the two maps
 * fetched, only when a globe comes within NEAR of the viewport, and
 * the context is lost on purpose a second after the last globe leaves
 * (gl-release.ts).
 * A globe is created paused and plays only while it is on screen and its
 * tab is visible; under reduced motion it draws one designed still and no
 * loop ever starts. WebGL2 is required (integer hashes, explicit texture
 * levels); without it createGlyphGlobe returns null, or the canvas stays
 * blank when the context fails once the globe nears the viewport, and the
 * caller's still stays in place.
 */

import { BAYER_8 } from '@/lib/dither';
import { glRelease, loseGl } from '@/lib/gl-release';
import { prefersReducedMotion } from '@/lib/reduced-motion';

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

/** How the letters sit on the earth. */
export type GlyphGlobeMode = 'tiles' | 'surface' | 'grid' | 'none';

/** Where the globe sits in its box. */
export type GlyphGlobeFraming =
  /** the launch graphics: a 16 by 9 stage covering the box, anchored at the bottom right, the upper left of the globe in view */
  | 'launch'
  /** the whole globe, centered, its radius 0.4 of the box's shorter side */
  | 'whole'
  /** the center as shares of the box's width and height, the radius as a share of its shorter side */
  | { x: number; y: number; r: number };

export type GlyphGlobePalette = {
  /** the space and the screen's empty cells */
  ground: string;
  /** the screen's inks from the least light to the most; one to five */
  inks: readonly string[];
  /** a lit tile under the split */
  tileLow: string;
  /** a lit tile over the split */
  tileHigh: string;
  /** the letters and the lone points */
  letter: string;
  /** the rim light round the limb */
  rim: string;
  /** the sunrise glow along the limb that faces the light */
  dawn: string;
  /** the bloom's tint, multiplied into the blurred lit earth */
  bloom: string;
  /** the two star colors */
  stars: readonly [string, string];
};

export type GlyphGlobeSettings = {
  /** how the letters sit on the earth */
  glyphs: GlyphGlobeMode;
  /** the solid square behind each letter; off, each letter stands alone with a one-and-a-half pixel ink keyline */
  boxes: boolean;
  /** the letters, up to 64; empty uses the launch atlas of 64 letters */
  glyphSet: string;
  /** the share of lit tiles kept, 0 to 1 */
  density: number;
  /** the tile pitch as a share of the radius (launch 0.0401; surface and grid 0.0366) */
  tile: number;
  /** tiles only inside this share of the radius, squared (launch 0.93) */
  tileReach: number;
  /** a tile lights where the earth under it is over this tone (launch 0.42) */
  threshold: number;
  /** a lit tile takes the high color over this tone (launch 0.55) */
  split: number;
  /** each tile's own offset on the threshold and the split, as a full range (launch 0.12) */
  jitter: number;
  /** the letter's share of its tile at the threshold and at full tone (launch 0.56 and 0.9) */
  letterMin: number;
  letterMax: number;
  /** the share of dark tiles that hold a lone letter (launch 0.035) */
  lonePoints: number;
  /** seconds between letter changes (launch 0.5) */
  beatSeconds: number;
  /** the Bayer matrix order: 8 (launch), 4 or 2 */
  screen: 8 | 4 | 2;
  /** the screen cell in CSS px; 0 keeps the launch share of the radius (4 stage px, 0.00458 of the radius) */
  cell: number;
  /** the tone where the map is black, -0.5 to 1 (launch 0): above 0 lights the sea, below 0 darkens it */
  ocean: number;
  /** the tone where the map is white, 0 to 1.5 (launch 1): brightens the land */
  land: number;
  /** darkens the limb so the sphere reads round, 0 to 1 (launch 0) */
  limbDarken: number;
  /** blends the smooth ramp under the screen, 0 to 1 (launch 0) */
  soften: number;
  /** seconds for one full turn; 0 holds the earth still */
  revolutionSeconds: number;
  /** 1 turns the land west to east, -1 east to west */
  direction: 1 | -1;
  /** 'spin' turns in full revolutions; 'sway' turns swayDegrees west and back once a loop */
  motion: 'spin' | 'sway';
  swayDegrees: number;
  /** the view's latitude, longitude at t = 0, and roll, in degrees */
  latitude: number;
  longitude: number;
  roll: number;
  framing: GlyphGlobeFraming;
  /** the rim light, the sunrise glow and the bloom, each 0 to 2 (launch 1, 1, 0.42) */
  rim: number;
  dawn: number;
  bloom: number;
  /** the screen angle of the light, degrees, 0 to the right, -90 straight up (launch -96) */
  sunAngle: number;
  /** the dawn and the rim breathe once and twice a loop */
  breathe: boolean;
  /** the share of the launch stars shown, 0 to 1 */
  stars: number;
  /** the stars twinkle once to three times a loop */
  twinkle: boolean;
  palette: GlyphGlobePalette;
};

/** The launch blues on ink (the launch graphics, 2026-11-09). */
export const GLYPH_GLOBE_BLUE: GlyphGlobePalette = {
  ground: '#070707',
  inks: ['#2f5ce0', '#86a8ff', '#cfe0ff'],
  tileLow: '#2f5ce0',
  tileHigh: '#86a8ff',
  letter: '#f2f2f0',
  rim: '#5f86f1',
  dawn: '#dde7f9',
  bloom: '#8cbfff',
  stars: ['#cfe0ff', '#f2f2f0'],
};

/** One stage px of the launch frame, as a share of the globe's radius (873.76 stage px). */
const RADIUS_STAGE = 873.7588652482269;

/** The launch look: the launch video's frame-fixed tiles, the launch still's earth and sky, a full turn in 10 seconds. */
export const GLYPH_GLOBE_DEFAULTS: GlyphGlobeSettings = {
  glyphs: 'tiles',
  boxes: true,
  glyphSet: '',
  density: 1,
  tile: 35 / RADIUS_STAGE,
  tileReach: 0.93,
  threshold: 0.42,
  split: 0.55,
  jitter: 0.12,
  letterMin: 0.56,
  letterMax: 0.9,
  lonePoints: 0.035,
  beatSeconds: 0.5,
  screen: 8,
  cell: 0,
  ocean: 0,
  land: 1,
  limbDarken: 0,
  soften: 0,
  revolutionSeconds: 10,
  direction: 1,
  motion: 'spin',
  swayDegrees: 8,
  latitude: 39.81,
  longitude: -39.71,
  roll: 0.32,
  framing: 'launch',
  rim: 1,
  dawn: 1,
  bloom: 0.42,
  sunAngle: -96,
  breathe: true,
  stars: 1,
  twinkle: true,
  palette: GLYPH_GLOBE_BLUE,
};

/** The tile pitch the surface and grid laws used: 32 stage px. */
export const GLYPH_GLOBE_FINE_TILE = 32 / RADIUS_STAGE;

/** The launch atlas's letters, in atlas order (public/media/glyph-globe/atlas.png). */
export const GLYPH_GLOBE_LETTERS =
  'AgßΩλЖЯعشبאשकहमঅதกฒაԱሀកಕഴઘગඞཀᐃꕉద한글말あカのネ字世界語文语译éñÇΨДحॐষணซღՖጀឃරᑕꔀઝ';

/* ------------------------------------------------------------------ */
/* Stars: the launch sky's 160, as the launch renderer seeded them      */
/* (seeds 20261105 and 20261106 on a 1600 by 900 stage):                */
/* x and y in stage px, size in stage px, color index, alpha (0..255),  */
/* twinkle share, twinkles a loop, phase.                               */
/* ------------------------------------------------------------------ */

type Star = readonly [number, number, number, number, number, number, number, number];

const STARS: readonly Star[] = [
  /* STARS-BEGIN */
  [1219, 26, 1, 0, 243, 0.28014, 2, 1.54773],
  [1535, 689, 1, 0, 141, 0.46108, 2, 4.85594],
  [1504, 157, 1, 0, 159, 0.44125, 3, 4.45213],
  [866, 450, 1, 0, 176, 0.45931, 1, 3.93261],
  [958, 279, 1, 0, 165, 0.43414, 2, 0.11231],
  [291, 832, 1, 1, 96, 0.44381, 2, 4.98876],
  [84, 655, 2, 1, 227, 0.49115, 1, 3.64752],
  [368, 515, 1, 0, 99, 0.578, 1, 4.00687],
  [1178, 795, 1, 0, 89, 0.54963, 3, 2.10993],
  [1365, 653, 1, 0, 249, 0.51683, 3, 1.95845],
  [658, 396, 1, 0, 180, 0.26872, 2, 2.30261],
  [1362, 70, 2, 1, 93, 0.50569, 1, 4.24812],
  [835, 61, 2, 1, 130, 0.5421, 3, 0.4122],
  [951, 137, 2, 1, 221, 0.37269, 1, 3.31157],
  [581, 39, 1, 1, 168, 0.47566, 2, 4.94776],
  [538, 40, 1, 1, 96, 0.29331, 1, 0.85797],
  [612, 229, 1, 1, 217, 0.56058, 3, 1.08474],
  [407, 401, 1, 0, 94, 0.57715, 2, 3.22314],
  [1006, 54, 1, 0, 150, 0.38851, 3, 0.48661],
  [1319, 236, 2, 1, 237, 0.51166, 1, 6.2098],
  [1380, 584, 2, 1, 96, 0.59999, 3, 3.96927],
  [1367, 41, 1, 0, 91, 0.4831, 2, 4.8827],
  [36, 226, 1, 0, 161, 0.41288, 1, 1.28462],
  [779, 650, 1, 1, 98, 0.41281, 3, 6.23791],
  [1123, 100, 1, 0, 170, 0.52115, 1, 1.75105],
  [18, 606, 1, 0, 101, 0.46591, 3, 2.5995],
  [1454, 402, 1, 1, 102, 0.27117, 3, 0.66654],
  [175, 108, 1, 0, 188, 0.57833, 1, 6.10608],
  [633, 156, 1, 0, 110, 0.51648, 1, 1.72109],
  [462, 565, 1, 0, 239, 0.54663, 3, 3.06831],
  [212, 348, 1, 1, 169, 0.50842, 3, 2.35235],
  [1160, 804, 1, 0, 92, 0.58577, 1, 3.23078],
  [716, 765, 1, 1, 94, 0.44506, 1, 5.21387],
  [669, 721, 2, 1, 96, 0.56092, 3, 4.75261],
  [325, 202, 1, 0, 155, 0.38474, 3, 5.19688],
  [1389, 834, 1, 0, 152, 0.49709, 1, 5.41757],
  [660, 269, 2, 1, 193, 0.32816, 1, 3.83595],
  [593, 768, 1, 0, 135, 0.54081, 1, 1.82431],
  [1036, 515, 1, 0, 182, 0.37391, 3, 4.44689],
  [1538, 55, 2, 1, 100, 0.49399, 3, 6.11954],
  [332, 648, 1, 0, 114, 0.30228, 2, 0.11272],
  [324, 460, 1, 0, 123, 0.28751, 3, 1.36251],
  [1291, 675, 1, 1, 106, 0.27895, 3, 2.65031],
  [1371, 865, 1, 0, 107, 0.55361, 3, 3.38928],
  [145, 261, 1, 0, 197, 0.43889, 3, 1.97443],
  [1230, 241, 1, 0, 230, 0.51266, 1, 5.40374],
  [1559, 0, 1, 0, 203, 0.35805, 2, 2.61373],
  [980, 213, 1, 1, 220, 0.33499, 2, 5.0767],
  [126, 148, 1, 0, 97, 0.30947, 2, 1.62687],
  [954, 486, 1, 0, 175, 0.28494, 2, 5.15342],
  [1218, 173, 1, 0, 120, 0.3274, 3, 2.88003],
  [799, 172, 1, 0, 107, 0.30846, 3, 1.82785],
  [349, 851, 1, 0, 143, 0.42447, 1, 1.13978],
  [74, 265, 1, 0, 223, 0.3447, 2, 2.51801],
  [1006, 360, 1, 0, 223, 0.38907, 2, 1.88113],
  [553, 281, 2, 1, 198, 0.46063, 3, 5.12644],
  [534, 613, 1, 0, 91, 0.33424, 2, 1.36999],
  [1539, 419, 1, 1, 146, 0.4202, 1, 5.21611],
  [701, 107, 1, 0, 158, 0.51644, 1, 4.97334],
  [528, 710, 1, 0, 186, 0.41786, 2, 2.44926],
  [334, 84, 1, 1, 93, 0.28373, 2, 4.59331],
  [1311, 238, 2, 1, 199, 0.44864, 3, 5.57607],
  [904, 855, 1, 1, 189, 0.41448, 1, 4.99199],
  [551, 379, 1, 1, 196, 0.50663, 2, 4.71485],
  [860, 866, 1, 1, 192, 0.37402, 2, 3.31042],
  [375, 852, 2, 1, 183, 0.42351, 3, 2.67472],
  [7, 516, 1, 0, 105, 0.27285, 1, 2.33628],
  [1406, 42, 1, 0, 245, 0.42806, 1, 0.283],
  [13, 889, 1, 0, 174, 0.38765, 1, 1.9987],
  [506, 277, 2, 1, 104, 0.37859, 2, 5.17872],
  [373, 506, 1, 0, 90, 0.42706, 1, 0.82531],
  [767, 699, 1, 1, 134, 0.47921, 1, 5.22069],
  [1057, 416, 1, 1, 119, 0.28277, 3, 1.83842],
  [715, 898, 1, 0, 197, 0.55121, 3, 1.02142],
  [316, 446, 1, 0, 112, 0.44391, 2, 2.32974],
  [1253, 108, 2, 1, 174, 0.59461, 2, 5.08778],
  [568, 94, 2, 1, 128, 0.32279, 1, 3.02325],
  [1123, 376, 1, 0, 189, 0.59476, 1, 4.06014],
  [1374, 598, 2, 1, 93, 0.27569, 2, 2.26116],
  [782, 96, 1, 0, 129, 0.58386, 1, 1.17452],
  [966, 369, 1, 0, 107, 0.55381, 3, 3.22588],
  [252, 306, 1, 0, 89, 0.58359, 2, 2.68855],
  [1343, 893, 1, 0, 137, 0.28306, 1, 3.37467],
  [1149, 81, 1, 1, 102, 0.5799, 3, 4.07204],
  [208, 841, 1, 0, 106, 0.26201, 1, 6.20051],
  [1506, 46, 2, 1, 89, 0.28052, 1, 3.69307],
  [162, 363, 2, 1, 185, 0.56676, 3, 2.06526],
  [1015, 334, 1, 0, 200, 0.58789, 3, 0.63611],
  [1433, 872, 2, 1, 133, 0.42776, 1, 5.98921],
  [583, 247, 1, 0, 164, 0.27589, 2, 0.8424],
  [872, 218, 1, 0, 160, 0.57945, 2, 6.24687],
  [7, 809, 1, 0, 110, 0.3945, 2, 4.77117],
  [1595, 231, 1, 0, 94, 0.26654, 1, 0.69308],
  [557, 111, 1, 0, 145, 0.52149, 2, 0.7768],
  [1212, 420, 1, 1, 243, 0.25292, 1, 3.1811],
  [1534, 601, 1, 0, 104, 0.58278, 2, 1.51052],
  [1503, 606, 1, 0, 251, 0.52858, 1, 0.89529],
  [1256, 373, 1, 0, 100, 0.30076, 1, 2.78169],
  [1426, 830, 1, 0, 101, 0.39319, 1, 3.03491],
  [28, 563, 2, 1, 97, 0.405, 2, 4.61327],
  [743, 653, 1, 1, 156, 0.304, 2, 2.79325],
  [796, 120, 1, 0, 122, 0.41151, 2, 6.18676],
  [813, 462, 2, 1, 89, 0.56775, 3, 2.5684],
  [852, 849, 1, 0, 175, 0.26838, 3, 3.80486],
  [1386, 881, 1, 0, 150, 0.52829, 2, 3.58069],
  [156, 852, 1, 0, 204, 0.31456, 1, 5.49647],
  [1530, 740, 1, 0, 210, 0.3734, 2, 1.24846],
  [1059, 296, 2, 1, 243, 0.34308, 2, 4.26778],
  [1100, 783, 1, 0, 139, 0.32309, 2, 2.36595],
  [378, 252, 1, 1, 107, 0.34683, 1, 5.29184],
  [1396, 63, 1, 0, 101, 0.29768, 1, 5.50264],
  [252, 681, 1, 0, 171, 0.58829, 2, 5.56542],
  [180, 594, 1, 1, 94, 0.55865, 2, 3.21158],
  [1253, 610, 2, 1, 189, 0.39348, 1, 1.17153],
  [312, 246, 1, 1, 173, 0.56446, 1, 3.05632],
  [222, 754, 1, 1, 100, 0.57343, 1, 1.48728],
  [888, 873, 1, 0, 120, 0.56549, 1, 0.20344],
  [1564, 424, 2, 1, 97, 0.53461, 3, 3.00343],
  [1462, 211, 1, 1, 244, 0.30223, 2, 3.28945],
  [1464, 88, 1, 0, 201, 0.35545, 3, 2.93708],
  [1155, 1, 1, 0, 210, 0.28006, 3, 4.00299],
  [431, 217, 1, 0, 104, 0.38996, 2, 2.9631],
  [1119, 729, 1, 0, 124, 0.5738, 2, 2.68741],
  [1157, 445, 1, 0, 137, 0.26122, 1, 5.02578],
  [241, 415, 1, 0, 185, 0.3672, 1, 2.01246],
  [110, 222, 1, 1, 103, 0.41491, 1, 1.21748],
  [312, 89, 1, 0, 115, 0.38825, 1, 2.98186],
  [1519, 431, 1, 0, 223, 0.37696, 1, 0.39978],
  [403, 766, 1, 0, 100, 0.55631, 1, 5.79026],
  [723, 63, 1, 0, 100, 0.35347, 1, 1.20462],
  [937, 268, 1, 0, 89, 0.58458, 2, 4.5188],
  [205, 252, 1, 0, 148, 0.48362, 2, 5.12302],
  [778, 561, 1, 0, 108, 0.29162, 1, 3.02612],
  [1395, 830, 1, 0, 157, 0.51312, 3, 0.27606],
  [1444, 1, 1, 0, 96, 0.40744, 3, 2.60352],
  [1489, 82, 1, 0, 95, 0.57379, 1, 6.23459],
  [1413, 443, 1, 0, 207, 0.25527, 2, 5.80915],
  [1452, 577, 1, 0, 201, 0.33032, 1, 3.81712],
  [1020, 642, 1, 0, 96, 0.32075, 3, 4.38383],
  [1116, 673, 2, 1, 94, 0.41431, 2, 1.63308],
  [479, 248, 2, 1, 237, 0.3615, 1, 4.28754],
  [1246, 279, 1, 0, 211, 0.3782, 2, 4.79074],
  [1541, 605, 1, 0, 156, 0.45577, 2, 3.64737],
  [949, 405, 1, 0, 90, 0.59212, 2, 0.89337],
  [825, 444, 1, 0, 196, 0.46835, 3, 1.5842],
  [663, 159, 1, 1, 110, 0.55595, 3, 1.93396],
  [1394, 113, 1, 0, 91, 0.51601, 3, 1.07905],
  [81, 710, 1, 0, 187, 0.58311, 2, 0.87455],
  [797, 645, 1, 0, 153, 0.39804, 3, 3.23824],
  [1231, 465, 1, 0, 89, 0.29132, 1, 3.13789],
  [973, 369, 1, 0, 98, 0.30552, 3, 3.01652],
  [1233, 351, 1, 1, 111, 0.41196, 3, 2.73094],
  [89, 883, 1, 1, 97, 0.40285, 1, 2.1351],
  [822, 500, 1, 0, 97, 0.49482, 3, 0.65662],
  [1497, 289, 2, 1, 139, 0.29164, 2, 2.25019],
  [59, 563, 1, 0, 92, 0.49429, 3, 3.67432],
  [849, 15, 1, 0, 217, 0.5214, 2, 4.07887],
  [729, 755, 1, 0, 118, 0.45456, 1, 5.38442],
  [977, 84, 1, 0, 139, 0.57228, 3, 4.27498],
  [1240, 612, 1, 0, 182, 0.53322, 2, 3.95668],
  /* STARS-END */
];

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const B8_LIST = BAYER_8.flat()
  .map((v) => v.toFixed(1))
  .join(',');

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/* The earth, the tiles and the sky. uPass 0 draws the frame; uPass 1 draws
   the bloom's source: the lit earth averaged over 8 stage px blocks. */
const FRAG = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform int uPass;
uniform vec2 uRes;
uniform vec3 uDisc;
uniform float uCell;
uniform int uOrder;
uniform vec3 uView;
uniform sampler2D uSphere;
uniform sampler2D uSphereBlur;
uniform sampler2D uAtlas;
uniform float uGlyphCount;
uniform float uTime;
uniform float uLoop;
uniform int uMode;
uniform bool uBoxes;
uniform float uTile, uReach, uThr, uSplit, uJit, uLone, uBeat, uDensity;
uniform vec2 uLetter;
uniform vec2 uTone;
uniform float uLimb, uSoften;
uniform vec3 uGround;
uniform vec3 uInks[5];
uniform int uLevels;
uniform vec3 uTileLo, uTileHi, uLetterC;
uniform sampler2D uBloomTex;
uniform vec2 uBloomRes;
uniform float uBloom;
uniform vec3 uBloomTint;
uniform vec3 uRimC, uDawnC;
uniform float uRimK, uDawnK, uSun;
out vec4 outColor;

const float B8[64] = float[64](${B8_LIST});
const float D2R = 0.017453292519943295;
const float PI = 3.141592653589793;
const float RS = ${RADIUS_STAGE.toFixed(6)};

/* the launch renderer's lattice hash, in 32-bit unsigned arithmetic */
float hash01(int ix, int iy, int seed) {
  uint h = uint(ix) * 374761393u + uint(iy) * 668265263u + uint(seed) * 1442695041u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  h = h ^ (h >> 16u);
  return float(h) / 4294967296.0;
}

/* the threshold of a cell for the n by n matrix; the 4 and 2 orders are BAYER_8's corners divided down */
float thrN(ivec2 c, int n) {
  int x = c.x % n, y = c.y % n;
  int div = 64 / (n * n);
  float m = floor(B8[y * 8 + x] / float(div));
  return (m + 0.5) / float(n * n);
}

vec2 latLon(vec2 uv, float rr) {
  float r = -uView.z * D2R;
  float cr = cos(r), sr = sin(r);
  float a = cr * uv.x - sr * uv.y, b = sr * uv.x + cr * uv.y;
  float w = sqrt(max(0.0, 1.0 - rr));
  float l0 = uView.x * D2R;
  float lat = asin(clamp(w * sin(l0) + b * cos(l0), -1.0, 1.0)) / D2R;
  float lon = uView.y + atan(a, w * cos(l0) - b * sin(l0)) / D2R;
  return vec2(lat, lon);
}

vec3 viewXYZ(float lat, float lon) {
  float la = lat * D2R, lo = (lon - uView.y) * D2R, l0 = uView.x * D2R;
  float x = cos(la) * sin(lo);
  float y = cos(l0) * sin(la) - sin(l0) * cos(la) * cos(lo);
  float z = sin(l0) * sin(la) + cos(l0) * cos(la) * cos(lo);
  float c = cos(uView.z * D2R), s = sin(uView.z * D2R);
  return vec3(c * x - s * y, s * x + c * y, z);
}

float toneAt(sampler2D map, vec2 ll) {
  vec2 st = vec2(fract((ll.y + 180.0) / 360.0), (90.0 - ll.x) / 180.0);
  return mix(uTone.x, uTone.y, textureLod(map, st, 0.0).r);
}

vec3 inkAt(int l) { return l <= 0 ? uGround : uInks[min(l, 5) - 1]; }

vec3 earthAt(vec2 p) {
  vec2 cell = floor(p / uCell);
  vec2 cc = (cell + 0.5) * uCell;
  vec2 uv = vec2(cc.x - uDisc.x, uDisc.y - cc.y) / uDisc.z;
  float rr = dot(uv, uv);
  float t = 0.0;
  if (rr <= 1.0) {
    t = toneAt(uSphere, latLon(uv, rr));
    if (uLimb > 0.0) t *= mix(1.0, smoothstep(0.0, 0.12, sqrt(1.0 - rr)), uLimb);
  }
  float n = float(uLevels);
  float vv = clamp(t, 0.0, 1.0) * n;
  float i = min(floor(vv), n);
  int lev = int(i) + ((vv - i) > thrN(ivec2(cell), uOrder) && i < n ? 1 : 0);
  vec3 col = inkAt(min(lev, uLevels));
  if (uSoften > 0.0) {
    float j = floor(min(vv, n - 0.001));
    col = mix(col, mix(inkAt(int(j)), inkAt(int(j) + 1), clamp(vv - j, 0.0, 1.0)), uSoften);
  }
  return col;
}

/* one letter of the atlas at a point of its box (0..1 square, y down), drawn size px across */
float letterAt(float g, vec2 l, float size) {
  vec2 lc = clamp(l, 0.0, 1.0);
  vec2 uv = (vec2(mod(g, 8.0), floor(g / 8.0)) + lc) / 8.0;
  float lod = max(0.0, log2(128.0 / size) - 0.5);
  float cov = textureLod(uAtlas, uv, lod).r;
  return (l.x < 0.0 || l.y < 0.0 || l.x > 1.0 || l.y > 1.0) ? 0.0 : cov;
}

/* a letter without its square: the letter over a dark keyline round it */
vec4 bare(float g, vec2 l, float size, float alpha) {
  float cov = letterAt(g, l, size);
  float k = 1.5 / size;
  float ring = 0.0;
  for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) ring = max(ring, letterAt(g, l + vec2(float(i), float(j)) * k, size));
  float a = max(cov, ring);
  return vec4(mix(uGround, uLetterC, a > 0.0 ? cov / a : 0.0), a * alpha);
}

int beatStep() {
  int steps = max(1, int(floor(uLoop / uBeat + 0.5)));
  return int(floor(uTime / uBeat + 1e-4)) % steps;
}

float glyphOf(float g) { return mod(mod(g, 64.0), uGlyphCount); }

/* the launch tiles: a grid fixed to the frame, its tone from the blurred map */
vec4 tilesB(vec2 p) {
  float P = uTile;
  float c = floor(p.x / P), r = floor(p.y / P);
  if (p.x < floor(c * P + 0.5)) c -= 1.0; else if (p.x >= floor((c + 1.0) * P + 0.5)) c += 1.0;
  if (p.y < floor(r * P + 0.5)) r -= 1.0; else if (p.y >= floor((r + 1.0) * P + 0.5)) r += 1.0;
  float x0 = floor(c * P + 0.5), x1 = min(floor((c + 1.0) * P + 0.5), uRes.x);
  float y0 = floor(r * P + 0.5);
  vec2 ctr = (vec2(c, r) + 0.5) * P;
  vec2 uv = vec2(ctr.x - uDisc.x, uDisc.y - ctr.y) / uDisc.z;
  float rr = dot(uv, uv);
  if (rr > uReach) return vec4(0.0);
  int ic = int(c), ir = int(r);
  if (uDensity < 1.0 && hash01(ic, ir, 6301) >= uDensity) return vec4(0.0);
  float tc = toneAt(uSphereBlur, latLon(uv, rr));
  float jit = (hash01(ic, ir, 6101) - 0.5) * uJit;
  bool lit = tc > uThr + jit;
  bool pt = !lit && tc >= 0.1 && hash01(ic, ir, 6203) <= uLone;
  if (!lit && !pt) return vec4(0.0);
  int stp = beatStep();
  float g = glyphOf(floor(hash01(ic * 7 + 3, ir * 11 + 5, 7310 + 977 * stp) * 64.0));
  float side = x1 - x0;
  float k = clamp((tc - uThr) / (1.0 - uThr), 0.0, 1.0);
  float frac = lit ? uLetter.x + (uLetter.y - uLetter.x) * pow(k, 0.6) : 0.62;
  float size = max(1.0, floor(side * frac + 0.5));
  vec2 o = vec2(x0, y0) + floor((side - size) / 2.0);
  vec2 l = (p + 0.5 - o) / size;
  if (lit && uBoxes) return vec4(mix(tc > uSplit + jit ? uTileHi : uTileLo, uLetterC, letterAt(g, l, size)), 1.0);
  if (lit) return bare(g, l, size, 1.0);
  return vec4(uLetterC, letterAt(g, l, size));
}

/* tiles fixed to the sphere in rows of latitude */
vec4 tilesSurface(vec2 p) {
  vec2 pc = p + 0.5;
  vec2 uv = vec2(pc.x - uDisc.x, uDisc.y - pc.y) / uDisc.z;
  float rr = dot(uv, uv);
  if (rr >= 1.0) return vec4(0.0);
  vec2 ll = latLon(uv, rr);
  float d = uTile / uDisc.z / D2R;
  float nlat = max(2.0, floor(180.0 / d + 0.5));
  float dlat = 180.0 / nlat;
  float j = clamp(floor((ll.x + 90.0) / dlat), 0.0, nlat - 1.0);
  float la = -90.0 + (j + 0.5) * dlat;
  float n = max(1.0, floor(360.0 * cos(la * D2R) / dlat + 0.5));
  float dlon = 360.0 / n;
  float lw = mod(ll.y + 180.0, 360.0);
  float i = min(floor(lw / dlon), n - 1.0);
  float lo = -180.0 + (i + 0.5) * dlon;
  vec2 f = vec2((lw - (i + 0.5) * dlon) / dlon, (ll.x - la) / dlat);
  vec3 xyz = viewXYZ(la, lo);
  if (xyz.z <= 0.2) return vec4(0.0);
  int ii = int(i), jj = int(j);
  if (uDensity < 1.0 && hash01(ii, jj, 6301) >= uDensity) return vec4(0.0);
  float tone = 0.0;
  for (int b = -1; b <= 1; b++)
    for (int a = -1; a <= 1; a++) tone += toneAt(uSphere, vec2(la + float(b) * dlat / 3.0, lo + float(a) * dlon / 3.0));
  tone /= 9.0;
  float jit = (hash01(ii, jj, 4507) - 0.5) * uJit;
  if (tone <= uThr + jit) return vec4(0.0);
  float C = floor(uTile + 0.5);
  float k = clamp((tone - uThr) / (1.0 - uThr), 0.0, 1.0);
  float size = floor(C * (uLetter.x + (uLetter.y - uLetter.x) * pow(k, 0.6)) + 0.5);
  vec2 sc = vec2(uDisc.x + uDisc.z * xyz.x, uDisc.y - uDisc.z * xyz.y);
  float delay = clamp(0.62 * sc.y / uRes.y + 0.38 * sc.x / uRes.x, 0.0, 1.0) * 0.75 * uBeat;
  float tau = uTime - delay;
  float stp = floor(tau / uBeat + 1e-6);
  float ph = tau - stp * uBeat;
  float flip = 0.6 * uBeat;
  float q = 1.0, st = stp;
  if (ph < flip) {
    float u = ph / flip;
    q = floor(abs(cos(PI * u)) * 12.0 + 0.5) / 12.0;
    st = u < 0.5 ? stp - 1.0 : stp;
  }
  float steps = max(1.0, floor(uLoop / uBeat + 0.5));
  st = mod(st, steps);
  float g = mod(7.0 * i + 11.0 * j + 13.0 * st, uGlyphCount);
  vec2 tp = vec2((f.x + 0.5) * C, (0.5 - f.y) * C);
  float hq = max(1.0, floor(size * q + 0.5));
  vec2 l = vec2((tp.x - floor((C - size) / 2.0)) / size, (tp.y - floor((C - hq) / 2.0)) / hq);
  float fade = smoothstep(0.2, 0.34, xyz.z);
  if (!uBoxes) return bare(g, l, size, fade);
  return vec4(mix(tone > uSplit + jit ? uTileHi : uTileLo, uLetterC, letterAt(g, l, size)), fade);
}

/* larger tiles fixed to the frame; letters change every four beats through a Bayer-order dissolve */
vec4 tilesGrid(vec2 p) {
  float C = floor(uTile + 0.5);
  vec2 cr = floor(p / C);
  vec2 ctr = (cr + 0.5) * C;
  vec2 uv = vec2(ctr.x - uDisc.x, uDisc.y - ctr.y) / uDisc.z;
  float rr = dot(uv, uv);
  if (rr > uReach) return vec4(0.0);
  int ic = int(cr.x), ir = int(cr.y);
  if (uDensity < 1.0 && hash01(ic, ir, 6301) >= uDensity) return vec4(0.0);
  float tc = toneAt(uSphere, latLon(uv, rr));
  float jit = (thrN(ivec2(cr), 8) - 0.5) * uJit;
  if (tc <= uThr + jit) return vec4(0.0);
  float k = clamp((tc - uThr) / (1.0 - uThr), 0.0, 1.0);
  float size = floor(C * (uLetter.x + (uLetter.y - uLetter.x) * pow(k, 0.6)) + 0.5);
  float hold = 4.0 * uBeat;
  float holds = max(1.0, floor(uLoop / hold + 0.5));
  float h = floor(uTime / hold);
  float s = uTime - h * hold;
  float ease = 1.2 * uBeat, sweepS = 0.8 * uBeat;
  float tt = s - (0.5 * hold - 0.5 * (ease + sweepS));
  float west = uDisc.x - uDisc.z;
  float sweep = clamp((uRes.x - p.x) / max(1.0, uRes.x - west), 0.0, 1.0);
  float pr = smoothstep(0.0, 1.0, (tt - sweepS * sweep) / ease);
  float field = mod(h + (thrN(ivec2(floor(p / uCell)), 8) < pr ? 1.0 : 0.0), holds);
  float g = glyphOf(floor(hash01(ic, ir, 1988 + 7919 * int(field)) * 64.0));
  vec2 o = cr * C + floor((C - size) / 2.0);
  vec2 l = (p + 0.5 - o) / size;
  if (!uBoxes) return bare(g, l, size, 1.0);
  return vec4(mix(tc > uSplit + jit ? uTileHi : uTileLo, uLetterC, letterAt(g, l, size)), 1.0);
}

vec3 pictureAt(vec2 p) {
  vec3 col = earthAt(p);
  vec4 gl = uMode == 1 ? tilesB(p) : uMode == 2 ? tilesSurface(p) : uMode == 3 ? tilesGrid(p) : vec4(0.0);
  return mix(col, gl.rgb, gl.a);
}

/* the launch sky: the rim light and the sunrise glow, in stage px of the launch radius */
vec3 lightAt(vec2 p) {
  vec2 d = p - uDisc.xy;
  float rho = length(d) / uDisc.z;
  float sun = pow(0.5 + 0.5 * cos(atan(d.y, d.x) - uSun), 3.0);
  float o = max(rho - 1.0, 0.0) * RS, inn = max(1.0 - rho, 0.0) * RS;
  bool outside = rho > 1.0;
  float rim = (outside ? 0.75 * exp(-o / 7.0) + 0.26 * exp(-o / 40.0) : 0.32 * exp(-inn / 14.0)) * (0.3 + 0.7 * sun);
  float dawn = (outside ? 1.1 * exp(-o / 9.0) + 0.5 * exp(-o / 38.0) : 0.9 * exp(-inn / 10.0) + 0.25 * exp(-inn / 60.0)) * sun * sun;
  return rim * uRimC * uRimK + dawn * uDawnC * uDawnK;
}

void main() {
  if (uPass == 1) {
    vec2 tex = vec2(floor(gl_FragCoord.x), uBloomRes.y - 1.0 - floor(gl_FragCoord.y));
    vec2 blk = uRes / uBloomRes;
    vec3 acc = vec3(0.0);
    for (int j = 0; j < 4; j++)
      for (int i = 0; i < 4; i++) {
        vec2 p = floor(tex * blk + (vec2(float(i), float(j)) + 0.5) * blk / 4.0);
        acc += max(pictureAt(p) - uGround, 0.0);
      }
    outColor = vec4(acc / 16.0, 1.0);
    return;
  }
  vec2 p = vec2(floor(gl_FragCoord.x), uRes.y - 1.0 - floor(gl_FragCoord.y));
  vec3 col = pictureAt(p);
  if (uBloom > 0.0) {
    vec2 buv = vec2((p.x + 0.5) / uRes.x, 1.0 - (p.y + 0.5) / uRes.y);
    col += uBloom * textureLod(uBloomTex, buv, 0.0).rgb * uBloomTint;
  }
  col += lightAt(p);
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

/* A separable blur: a box of 2r+1 taps (the sphere's blur) or a gaussian of sigma uSigma (the bloom). */
const BLUR = `#version 300 es
precision highp float;
uniform sampler2D uSrc;
uniform vec2 uSize;
uniform vec2 uDir;
uniform int uRadius;
uniform float uSigma;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  vec3 acc = vec3(0.0);
  float wsum = 0.0;
  for (int k = -16; k <= 16; k++) {
    if (k < -uRadius || k > uRadius) continue;
    float fk = float(k);
    float w = uSigma > 0.0 ? exp(-0.5 * fk * fk / (uSigma * uSigma)) : 1.0;
    acc += w * texture(uSrc, uv + uDir * fk / uSize).rgb;
    wsum += w;
  }
  outColor = vec4(acc / wsum, 1.0);
}`;

const STAR_VERT = `#version 300 es
in vec2 aAt;
in float aSize;
in vec4 aColor;
uniform vec2 uRes;
out vec4 vColor;
void main() {
  gl_Position = vec4(aAt.x / uRes.x * 2.0 - 1.0, 1.0 - aAt.y / uRes.y * 2.0, 0.0, 1.0);
  gl_PointSize = aSize;
  vColor = aColor;
}`;

const STAR_FRAG = `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 outColor;
void main() { outColor = vColor; }`;

/* ------------------------------------------------------------------ */
/* Resolving settings for one frame                                    */
/* ------------------------------------------------------------------ */

type Rgb = [number, number, number];

function rgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = Number.parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** The disc in device px (center x, center y, radius) and device px per stage px. */
export function glyphGlobeDisc(framing: GlyphGlobeFraming, width: number, height: number) {
  if (framing === 'launch') {
    const s = Math.max(width / 1600, height / 900);
    const ox = width - 1600 * s;
    const oy = height - 900 * s;
    return { cx: ox + 1718.3112223612848 * s, cy: oy + 1129.7797246558196 * s, r: RADIUS_STAGE * s, stage: s, ox, oy };
  }
  const short = Math.min(width, height);
  const spec = framing === 'whole' ? { x: 0.5, y: 0.5, r: 0.4 } : framing;
  const r = spec.r * short;
  const s = r / RADIUS_STAGE;
  /* the stars' stage covers the box, centered */
  const ss = Math.max(width / 1600, height / 900);
  return { cx: spec.x * width, cy: spec.y * height, r, stage: s, ox: (width - 1600 * ss) / 2, oy: (height - 900 * ss) / 2, starStage: ss };
}

/** The loop's length in seconds: the turn, or 10 when the earth holds still. */
function loopOf(s: GlyphGlobeSettings): number {
  return s.revolutionSeconds > 0 ? s.revolutionSeconds : 10;
}

/** The view's longitude at loop time t. */
function longitudeAt(s: GlyphGlobeSettings, t: number): number {
  if (s.revolutionSeconds <= 0) return s.longitude;
  const u = t / s.revolutionSeconds;
  if (s.motion === 'sway') return s.longitude + s.direction * s.swayDegrees * (1 - Math.cos(2 * Math.PI * u)) * 0.5;
  return s.longitude - s.direction * 360 * u;
}

/* ------------------------------------------------------------------ */
/* Assets                                                              */
/* ------------------------------------------------------------------ */

const SPHERE_URL = '/media/glyph-globe/sphere.png';
const ATLAS_URL = '/media/glyph-globe/atlas.png';

type Bitmaps = { sphere: ImageBitmap; atlas: ImageBitmap };
let bitmaps: Promise<Bitmaps> | null = null;

async function bitmapOf(url: string): Promise<ImageBitmap> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`glyph-globe: ${url} answered ${res.status}`);
  const blob = await res.blob();
  return createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
}

function loadBitmaps(): Promise<Bitmaps> {
  if (!bitmaps) {
    bitmaps = Promise.all([bitmapOf(SPHERE_URL), bitmapOf(ATLAS_URL)]).then(([sphere, atlas]) => ({ sphere, atlas }));
    bitmaps.catch(() => {
      bitmaps = null;
    });
  }
  return bitmaps;
}

/**
 * A 1024 px atlas of up to 64 letters in 128 px cells, drawn with the
 * page's own face and scaled so each letter's ink fills 124 px, as the
 * launch atlas was cut.
 */
function drawAtlas(letters: readonly string[], font: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  letters.slice(0, 64).forEach((letter, i) => {
    ctx.font = `500 100px ${font}`;
    const m = ctx.measureText(letter);
    const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    if (w <= 0 || h <= 0) return;
    const k = 124 / Math.max(w, h);
    ctx.save();
    ctx.translate((i % 8) * 128 + 64, Math.floor(i / 8) * 128 + 64);
    ctx.scale(k, k);
    /* the ink's box centered on the cell */
    ctx.fillText(
      letter,
      (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2,
      (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
    );
    ctx.restore();
  });
  return canvas;
}

/** Splits a glyph set into letters by grapheme where the browser can, so a combining mark stays with its base. */
export function glyphLetters(set: string): string[] {
  const clean = set.replace(/\s+/g, '');
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(seg.segment(clean), (s) => s.segment).slice(0, 64);
  }
  return Array.from(clean).slice(0, 64);
}

/* ------------------------------------------------------------------ */
/* The engine                                                          */
/* ------------------------------------------------------------------ */

type Program = { program: WebGLProgram; locs: Map<string, WebGLUniformLocation | null> };

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  ready: boolean;
  draw: (sub: Subscriber, width: number, height: number, time: number) => HTMLCanvasElement | null;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  settings: GlyphGlobeSettings;
  dpr: number;
  autoplay: boolean;
  running: boolean;
  /** within NEAR of the viewport once: the engine may start and draw it */
  near: boolean;
  visible: boolean;
  reduced: boolean;
  stillTime: number;
  /** seconds of loop time played so far, held across pauses */
  elapsed: number;
  last: number;
  font: string;
  observer?: IntersectionObserver;
  nearObserver?: IntersectionObserver;
  resize?: ResizeObserver;
  onFrame?: (ms: number) => void;
};

let engine: Engine | null = null;
let engineFailed = false;
const subscribers = new Set<Subscriber>();
let frameId = 0;

const release = glRelease(
  () => {
    const gone = engine;
    engine = null;
    if (gone) loseGl(gone.gl);
  },
  () => subscribers.size > 0
);

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('glyph-globe: could not create a shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`glyph-globe compile: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vert: string, frag: string): Program {
  const program = gl.createProgram();
  if (!program) throw new Error('glyph-globe: could not create a program');
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`glyph-globe link: ${gl.getProgramInfoLog(program)}`);
  }
  return { program, locs: new Map() };
}

function loc(gl: WebGL2RenderingContext, p: Program, name: string): WebGLUniformLocation | null {
  if (!p.locs.has(name)) p.locs.set(name, gl.getUniformLocation(p.program, name));
  return p.locs.get(name) ?? null;
}

/* every sample of a render target falls on a texel center or is meant to blend, so linear filtering serves both */
function texture(gl: WebGL2RenderingContext, w: number, h: number, wrapS: number): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error('glyph-globe: could not create a texture');
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

function target(gl: WebGL2RenderingContext, w: number, h: number, wrapS: number): Target {
  const tex = texture(gl, w, h, wrapS);
  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error('glyph-globe: could not create a framebuffer');
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { tex, fbo, w, h };
}

function upload(gl: WebGL2RenderingContext, source: TexImageSource, wrapS: number, mip: boolean): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error('glyph-globe: could not create a texture');
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, source);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  if (mip) gl.generateMipmap(gl.TEXTURE_2D);
  return tex;
}

function getEngine(): Engine | null {
  if (engine) return engine;
  if (engineFailed || typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      /* read back by drawImage in the same task as the draw */
      preserveDrawingBuffer: true,
    });
  } catch {
    gl = null;
  }
  if (!gl) {
    engineFailed = true;
    return null;
  }
  const ctx = gl;

  let main: Program;
  let blur: Program;
  let stars: Program;
  try {
    main = link(ctx, VERT, FRAG);
    blur = link(ctx, VERT, BLUR);
    stars = link(ctx, STAR_VERT, STAR_FRAG);
  } catch (error) {
    console.error(error);
    engineFailed = true;
    return null;
  }

  const quad = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, quad);
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
  const quadVao = ctx.createVertexArray();
  ctx.bindVertexArray(quadVao);
  for (const p of [main, blur]) {
    const at = ctx.getAttribLocation(p.program, 'aPos');
    if (at >= 0) {
      ctx.enableVertexAttribArray(at);
      ctx.vertexAttribPointer(at, 2, ctx.FLOAT, false, 0, 0);
    }
  }

  const starBuf = ctx.createBuffer();
  const starVao = ctx.createVertexArray();
  ctx.bindVertexArray(starVao);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, starBuf);
  const stride = 7 * 4;
  const aAt = ctx.getAttribLocation(stars.program, 'aAt');
  const aSize = ctx.getAttribLocation(stars.program, 'aSize');
  const aColor = ctx.getAttribLocation(stars.program, 'aColor');
  ctx.enableVertexAttribArray(aAt);
  ctx.vertexAttribPointer(aAt, 2, ctx.FLOAT, false, stride, 0);
  ctx.enableVertexAttribArray(aSize);
  ctx.vertexAttribPointer(aSize, 1, ctx.FLOAT, false, stride, 8);
  ctx.enableVertexAttribArray(aColor);
  ctx.vertexAttribPointer(aColor, 4, ctx.FLOAT, false, stride, 12);
  ctx.bindVertexArray(null);
  const starData = new Float32Array(STARS.length * 7);

  let sphere: WebGLTexture | null = null;
  let sphereBlur: WebGLTexture | null = null;
  let launchAtlas: WebGLTexture | null = null;
  const atlases = new Map<string, WebGLTexture>();
  let bloomA: Target | null = null;
  let bloomB: Target | null = null;

  const runBlur = (src: WebGLTexture, dst: Target, dir: [number, number], radius: number, sigma: number) => {
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, dst.fbo);
    ctx.viewport(0, 0, dst.w, dst.h);
    ctx.useProgram(blur.program);
    /* unit 4 is the blur's own, so the frame's maps on units 0 to 3 stay bound */
    ctx.activeTexture(ctx.TEXTURE4);
    ctx.bindTexture(ctx.TEXTURE_2D, src);
    ctx.uniform1i(loc(ctx, blur, 'uSrc'), 4);
    ctx.uniform2f(loc(ctx, blur, 'uSize'), dst.w, dst.h);
    ctx.uniform2f(loc(ctx, blur, 'uDir'), dir[0], dir[1]);
    ctx.uniform1i(loc(ctx, blur, 'uRadius'), radius);
    ctx.uniform1f(loc(ctx, blur, 'uSigma'), sigma);
    ctx.bindVertexArray(quadVao);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);
  };

  const built: Engine = {
    canvas,
    gl: ctx,
    ready: false,
    draw(sub, width, height, time) {
      if (!built.ready || !sphere || !sphereBlur || !launchAtlas) return null;
      const s = sub.settings;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const disc = glyphGlobeDisc(s.framing, width, height);
      const loop = loopOf(s);
      const t = ((time % loop) + loop) % loop;
      const cell = s.cell > 0 ? Math.max(1, Math.round(s.cell * sub.dpr)) : Math.max(1, Math.round(4 * disc.stage));
      const tile = Math.max(4, s.tile * disc.r);
      const pal = s.palette;
      const inks = pal.inks.slice(0, 5);
      const levels = Math.max(1, inks.length);

      /* the atlas: the launch letters, or this globe's own set drawn once per set and face */
      let atlas = launchAtlas;
      let count = 64;
      const letters = s.glyphSet ? glyphLetters(s.glyphSet) : [];
      if (letters.length) {
        const key = `${sub.font}\u0000${letters.join('')}`;
        let own = atlases.get(key);
        if (!own) {
          own = upload(ctx, drawAtlas(letters, sub.font), ctx.CLAMP_TO_EDGE, true);
          atlases.set(key, own);
        }
        atlas = own;
        count = letters.length;
      }

      /* the bloom's low-resolution source and its two passes of blur */
      const block = 8 * disc.stage;
      const bw = Math.max(1, Math.floor(width / block));
      const bh = Math.max(1, Math.floor(height / block));
      if (!bloomA || bloomA.w !== bw || bloomA.h !== bh) {
        if (bloomA) {
          ctx.deleteFramebuffer(bloomA.fbo);
          ctx.deleteTexture(bloomA.tex);
        }
        if (bloomB) {
          ctx.deleteFramebuffer(bloomB.fbo);
          ctx.deleteTexture(bloomB.tex);
        }
        bloomA = target(ctx, bw, bh, ctx.CLAMP_TO_EDGE);
        bloomB = target(ctx, bw, bh, ctx.CLAMP_TO_EDGE);
      }

      const u = 2 * Math.PI * (t / loop);
      const rimK = s.rim * (s.breathe ? 1 + 0.1 * Math.sin(2 * u) : 1);
      const dawnK = s.dawn * (s.breathe ? 1 + 0.2 * Math.sin(u) : 1) * 0.9;

      ctx.useProgram(main.program);
      const set1f = (n: string, v: number) => ctx.uniform1f(loc(ctx, main, n), v);
      const set1i = (n: string, v: number) => ctx.uniform1i(loc(ctx, main, n), v);
      const set3 = (n: string, v: Rgb) => ctx.uniform3f(loc(ctx, main, n), v[0], v[1], v[2]);
      ctx.uniform2f(loc(ctx, main, 'uRes'), width, height);
      ctx.uniform3f(loc(ctx, main, 'uDisc'), disc.cx, disc.cy, disc.r);
      set1f('uCell', cell);
      set1i('uOrder', s.screen);
      ctx.uniform3f(loc(ctx, main, 'uView'), s.latitude, longitudeAt(s, t), s.roll);
      ctx.activeTexture(ctx.TEXTURE0);
      ctx.bindTexture(ctx.TEXTURE_2D, sphere);
      set1i('uSphere', 0);
      ctx.activeTexture(ctx.TEXTURE1);
      ctx.bindTexture(ctx.TEXTURE_2D, sphereBlur);
      set1i('uSphereBlur', 1);
      ctx.activeTexture(ctx.TEXTURE2);
      ctx.bindTexture(ctx.TEXTURE_2D, atlas);
      set1i('uAtlas', 2);
      set1f('uGlyphCount', count);
      set1f('uTime', t);
      set1f('uLoop', loop);
      set1i('uMode', s.glyphs === 'tiles' ? 1 : s.glyphs === 'surface' ? 2 : s.glyphs === 'grid' ? 3 : 0);
      set1i('uBoxes', s.boxes ? 1 : 0);
      set1f('uTile', tile);
      set1f('uReach', s.tileReach);
      set1f('uThr', s.threshold);
      set1f('uSplit', s.split);
      set1f('uJit', s.jitter);
      set1f('uLone', s.lonePoints);
      set1f('uBeat', Math.max(0.05, s.beatSeconds));
      set1f('uDensity', s.density);
      ctx.uniform2f(loc(ctx, main, 'uLetter'), s.letterMin, s.letterMax);
      ctx.uniform2f(loc(ctx, main, 'uTone'), s.ocean, s.land);
      set1f('uLimb', s.limbDarken);
      set1f('uSoften', s.soften);
      set3('uGround', rgb(pal.ground));
      const inkData = new Float32Array(15);
      for (let i = 0; i < 5; i++) inkData.set(rgb(inks[Math.min(i, inks.length - 1)] ?? pal.ground), i * 3);
      ctx.uniform3fv(loc(ctx, main, 'uInks'), inkData);
      set1i('uLevels', levels);
      set3('uTileLo', rgb(pal.tileLow));
      set3('uTileHi', rgb(pal.tileHigh));
      set3('uLetterC', rgb(pal.letter));
      set3('uRimC', rgb(pal.rim));
      set3('uDawnC', rgb(pal.dawn));
      set1f('uRimK', rimK);
      set1f('uDawnK', dawnK);
      set1f('uSun', (s.sunAngle * Math.PI) / 180);
      set3('uBloomTint', rgb(pal.bloom));
      ctx.uniform2f(loc(ctx, main, 'uBloomRes'), bw, bh);
      ctx.bindVertexArray(quadVao);

      /* no texture the pass draws into may stay bound to a sampler the program reads */
      ctx.activeTexture(ctx.TEXTURE3);
      ctx.bindTexture(ctx.TEXTURE_2D, null);
      if (s.bloom > 0 && bloomA && bloomB) {
        set1i('uPass', 1);
        set1f('uBloom', 0);
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, bloomA.fbo);
        ctx.viewport(0, 0, bw, bh);
        ctx.drawArrays(ctx.TRIANGLES, 0, 3);
        runBlur(bloomA.tex, bloomB, [1, 0], 15, 5);
        runBlur(bloomB.tex, bloomA, [0, 1], 15, 5);
        ctx.useProgram(main.program);
      }
      ctx.activeTexture(ctx.TEXTURE3);
      ctx.bindTexture(ctx.TEXTURE_2D, bloomA ? bloomA.tex : null);
      set1i('uBloomTex', 3);
      set1i('uPass', 0);
      set1f('uBloom', s.bloom);
      ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
      ctx.viewport(0, 0, width, height);
      ctx.bindVertexArray(quadVao);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);

      /* the stars: squares of one or two stage px, faded in past the limb */
      const shown = Math.round(STARS.length * Math.min(1, Math.max(0, s.stars)));
      if (shown > 0) {
        const ss = 'starStage' in disc && disc.starStage ? disc.starStage : disc.stage;
        const px = Math.max(1, Math.round(ss));
        const colors = [rgb(pal.stars[0]), rgb(pal.stars[1])];
        let n = 0;
        for (let i = 0; i < shown; i++) {
          const [x, y, size, ci, a0, amp, cyc, ph] = STARS[i];
          const x0 = Math.floor((disc.ox + x * ss) / px) * px;
          const y0 = Math.floor((disc.oy + y * ss) / px) * px;
          const sz = size * px;
          const rho = Math.hypot(x0 + sz / 2 - disc.cx, y0 + sz / 2 - disc.cy) / disc.r;
          if (rho <= 1.06) continue;
          const k = Math.min(1, Math.max(0, (rho - 1.06) / 0.14));
          const mask = k * k * (3 - 2 * k);
          const tw = s.twinkle ? 1 + amp * (Math.sin(2 * Math.PI * cyc * (t / loop) + ph) - Math.sin(ph)) : 1;
          const a = (Math.min(255, Math.max(0, Math.round(a0 * tw))) / 255) * mask;
          const c = colors[ci] ?? colors[0];
          starData.set([x0 + sz / 2, y0 + sz / 2, sz, c[0], c[1], c[2], a], n * 7);
          n++;
        }
        if (n > 0) {
          ctx.useProgram(stars.program);
          ctx.uniform2f(loc(ctx, stars, 'uRes'), width, height);
          ctx.bindVertexArray(starVao);
          ctx.bindBuffer(ctx.ARRAY_BUFFER, starBuf);
          ctx.bufferData(ctx.ARRAY_BUFFER, starData.subarray(0, n * 7), ctx.DYNAMIC_DRAW);
          ctx.enable(ctx.BLEND);
          ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
          ctx.drawArrays(ctx.POINTS, 0, n);
          ctx.disable(ctx.BLEND);
        }
      }
      ctx.bindVertexArray(null);
      return canvas;
    },
  };

  /* the maps: the sphere, the sphere blurred twice by a 9 px box (the tiles' tone), the atlas with its mip chain */
  loadBitmaps()
    .then(({ sphere: sbmp, atlas: abmp }) => {
      if (engine !== built) return;
      sphere = upload(ctx, sbmp, ctx.REPEAT, false);
      launchAtlas = upload(ctx, abmp, ctx.CLAMP_TO_EDGE, true);
      const a = target(ctx, sbmp.width, sbmp.height, ctx.REPEAT);
      const b = target(ctx, sbmp.width, sbmp.height, ctx.REPEAT);
      runBlur(sphere, a, [1, 0], 4, 0);
      runBlur(a.tex, b, [0, 1], 4, 0);
      runBlur(b.tex, a, [1, 0], 4, 0);
      runBlur(a.tex, b, [0, 1], 4, 0);
      sphereBlur = b.tex;
      ctx.deleteFramebuffer(a.fbo);
      ctx.deleteFramebuffer(b.fbo);
      ctx.deleteTexture(a.tex);
      ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
      built.ready = true;
      for (const sub of subscribers) renderSubscriber(sub, sub.elapsed);
      schedule();
    })
    .catch((error: unknown) => {
      console.error(error);
    });

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    if (engine?.canvas === canvas) engine = null;
  });

  engine = built;
  return engine;
}

function sizeOf(sub: Subscriber): { width: number; height: number } {
  const width = Math.max(1, Math.floor((sub.target.clientWidth || 1) * sub.dpr));
  const height = Math.max(1, Math.floor((sub.target.clientHeight || 1) * sub.dpr));
  return { width, height };
}

function renderSubscriber(sub: Subscriber, time: number) {
  if (!sub.near) return;
  const active = getEngine();
  if (!active || !active.ready) return;
  const { width, height } = sizeOf(sub);
  const start = performance.now();
  if (sub.target.width !== width || sub.target.height !== height) {
    sub.target.width = width;
    sub.target.height = height;
  }
  const source = active.draw(sub, width, height, time);
  if (!source) return;
  sub.blit.drawImage(source, 0, 0);
  sub.onFrame?.(performance.now() - start);
}

function tick(now: number) {
  frameId = 0;
  const hidden = typeof document !== 'undefined' && document.hidden;
  for (const sub of subscribers) {
    if (!sub.running || !sub.visible || hidden) {
      sub.last = 0;
      continue;
    }
    if (sub.last) sub.elapsed += Math.min(0.1, (now - sub.last) / 1000);
    sub.last = now;
    renderSubscriber(sub, sub.elapsed);
  }
  schedule();
}

function schedule() {
  if (frameId || engineFailed) return;
  const hidden = typeof document !== 'undefined' && document.hidden;
  if (hidden) return;
  for (const sub of subscribers) {
    if (sub.running && sub.visible) {
      frameId = requestAnimationFrame(tick);
      return;
    }
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => schedule());
}

export type GlyphGlobeOptions = {
  settings?: Partial<GlyphGlobeSettings>;
  /** the device pixel ratio cap; 2 by default, since the screen needs whole pixels */
  dpr?: number;
  /** spin on its own once on screen (true by default) */
  autoplay?: boolean;
  /** the loop time of the designed still drawn under reduced motion and while paused (0 by default) */
  stillTime?: number;
  /** the face a custom glyph set is drawn in; the canvas's own font family by default */
  font?: string;
  /** called after each frame with the milliseconds it took to draw and blit */
  onFrame?: (ms: number) => void;
};

export type GlyphGlobeHandle = {
  setSettings: (patch: Partial<GlyphGlobeSettings>) => void;
  /** stops the loop and holds the current frame */
  pause: () => void;
  /** plays from where it paused (never under reduced motion) */
  play: () => void;
  /** draws the frame at loop time t once */
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

/**
 * How far outside the viewport a globe starts the engine and fetches the
 * maps: a screen ahead. scrollMargin carries the margin into the scrollers
 * in between (the viewer shell's sheet), whose clip a rootMargin stops at;
 * a browser without it starts the engine when the globe comes into view.
 */
const NEAR: IntersectionObserverInit & { scrollMargin?: string } = { rootMargin: '100% 0px', scrollMargin: '100% 0px' };

/**
 * Registers a globe on a canvas. Returns null when the browser has no
 * WebGL2, so the caller's still stays in place. The engine and its maps
 * wait until the globe is within NEAR of the viewport. The globe is
 * created paused and plays while it is on screen; under reduced motion it
 * draws its still once.
 */
export function createGlyphGlobe(canvas: HTMLCanvasElement, options: GlyphGlobeOptions = {}): GlyphGlobeHandle | null {
  if (engineFailed || typeof WebGL2RenderingContext === 'undefined') return null;
  const blit = canvas.getContext('2d');
  if (!blit) return null;
  const reduced = prefersReducedMotion();
  const autoplay = options.autoplay ?? true;
  const stillTime = options.stillTime ?? 0;
  const sub: Subscriber = {
    target: canvas,
    blit,
    settings: { ...GLYPH_GLOBE_DEFAULTS, ...options.settings },
    dpr: options.dpr ?? Math.min(window.devicePixelRatio || 1, 2),
    autoplay,
    running: autoplay && !reduced,
    near: false,
    visible: false,
    reduced,
    stillTime,
    elapsed: stillTime,
    last: 0,
    font: options.font ?? (getComputedStyle(canvas).fontFamily || 'sans-serif'),
    onFrame: options.onFrame,
  };
  subscribers.add(sub);

  if (typeof IntersectionObserver !== 'undefined') {
    sub.nearObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        sub.nearObserver?.disconnect();
        sub.near = true;
        renderSubscriber(sub, sub.elapsed);
      },
      NEAR
    );
    sub.nearObserver.observe(canvas);
    sub.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        sub.visible = entry.isIntersecting;
        if (sub.visible) sub.near = true;
        if (sub.visible && !sub.running) renderSubscriber(sub, sub.elapsed);
        schedule();
      },
      { rootMargin: '120px' }
    );
    sub.observer.observe(canvas);
  } else {
    sub.near = true;
    sub.visible = true;
  }

  if (typeof ResizeObserver !== 'undefined') {
    sub.resize = new ResizeObserver(() => {
      if (!sub.running) renderSubscriber(sub, sub.elapsed);
    });
    sub.resize.observe(canvas);
  }

  renderSubscriber(sub, sub.elapsed);
  schedule();

  return {
    setSettings(patch) {
      sub.settings = { ...sub.settings, ...patch };
      if (!sub.running) renderSubscriber(sub, sub.elapsed);
    },
    pause() {
      sub.running = false;
      sub.last = 0;
    },
    play() {
      if (sub.reduced || sub.running) return;
      sub.running = true;
      sub.last = 0;
      schedule();
    },
    renderStatic(time = sub.stillTime) {
      sub.elapsed = time;
      renderSubscriber(sub, time);
    },
    destroy() {
      sub.nearObserver?.disconnect();
      sub.observer?.disconnect();
      sub.resize?.disconnect();
      subscribers.delete(sub);
      if (subscribers.size === 0) release.idle();
    },
  };
}
