/**
 * Studio field — THE BAYER FAMILY. The rig started as a survey (five dither
 * geometries, five light washes, ported from the founder's glyphfield studio
 * — glyphfield.com/studio, his own MIT repo); the founder picked 01 bayer
 * dither and asked for "a bunch of options based off of this instead", so
 * the module is now ten Bayer materials: the original flow untouched, and
 * nine variations that move along real axes rather than nudging knobs —
 * matrix order (2×2 / 4×4 / 8×8), cell scale (poster chunks ↔ near-grain),
 * the tone field under the matrix (flow-clouds, contour bands, off-center
 * radials, diagonal sweeps, interference waves, a breathing field), motion
 * (laminar drift vs churn, slow vs pulsing), and palette balance
 * (ink-dominant print, blue-forward, white-hot crests):
 *   - bayer: THE PICK, byte-identical — the studio's 4×4 ordered matrix
 *     quantizing a flowing tone field into three inks at print cells;
 *   - bayer8: the same flow read through an 8×8 matrix at near-grain
 *     cells — the coarse steps resolve into smooth dithered gradients;
 *   - bayerContour: quantized elevation bands drifting downslope — the
 *     topographic motif as terraced ink, not ruled lines;
 *   - bayerRadial: two radial glows breathing at the FLANKS, centered off
 *     the window column — the center stays ink; blue-forward;
 *   - bayerSweep: long diagonal light bands crossing laminar, broken up
 *     by a slow pigment churn — the pressroom read;
 *   - bayerWaves: two circular wave systems from opposite corners
 *     interfering — crests meet as chips, troughs sink to ink;
 *   - bayerChunk: the 2×2 matrix at coarse poster cells — four thresholds,
 *     chunky mosaic, the loudest print;
 *   - bayerPulse: the flow field inhaling and exhaling on a ~16s clock —
 *     near-ink at rest, full bloom at the crest;
 *   - bayerInk: the flow biased hard toward ground — sparse blue on ink,
 *     the quietest print, no bright chip in the palette;
 *   - bayerHot: wandering heat cores lift the crests to pure white through
 *     an 8×8 screen — the one variant allowed white;
 *   - bayerSphere: the /try globe's material — a lit sphere under an
 *     upper-left key light, pigment drifting in longitude/latitude so the
 *     motion reads as the ball slowly turning, quantized through the 8×8
 *     screen; the dither density describes the form, not a flat wash.
 *
 * HOUSE TUNING — every preset grounds on near-black so the field renders
 * LIGHT ON INK: the page composites the canvas with its own mix-blend-mode,
 * the ground falls away, and the shared .tch-field mask keeps the center
 * column dark for the window that lives there. In light theme the sg*h
 * homes invert the canvas (v0-pages.css), so the family reads as ink
 * print on paper — tuned to survive both.
 *
 * ARCHITECTURE — the house rule: exactly ONE WebGL context for this module
 * per session, shared by every subscriber (per-component contexts exhausted
 * the browser's ~16-context budget and went silently black). One program
 * per study, compiled lazily in the shared context; the engine draws into
 * one offscreen GL canvas and blits into each subscriber's own 2D canvas.
 * Reduced motion renders ONE static frame and stops; document.hidden pauses
 * the loop; a per-subscriber ResizeObserver keeps stills crisp on reflow.
 */

export type StudioVec3 = [number, number, number];

export type StudioParams = {
  /** Ground ink — near-black so the blend-mode composite drops it out. */
  colorA: StudioVec3;
  /** Body tone — the working blue. */
  colorB: StudioVec3;
  /** Crest tone — the light the material peaks into. */
  colorC: StudioVec3;
  /** Study-specific gain: tone push, warp depth, bloom heat. */
  strength: number;
  /** Noise/fbm scale — how fine the organic movement is. */
  detail: number;
  /** Repetition rate: flow frequency, band count. */
  frequency: number;
  /** Studio grain scale 0–100: dither cell size, finish sparkle. */
  grain: number;
  /** Broad geometry: field zoom (contour), ring rate (radial). */
  amplitude: number;
  /** Reserved by the studio grammar; unused by the ported studies. */
  density: number;
  /** Output gain applied in the finish. */
  brightness: number;
  /** Frame rotation in degrees. */
  rotation: number;
};

export type StudioFieldHandle = {
  setParams: (patch: Partial<StudioParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type StudioPreset =
  | 'bayer'
  | 'bayer8'
  | 'bayerContour'
  | 'bayerRadial'
  | 'bayerSweep'
  | 'bayerWaves'
  | 'bayerChunk'
  | 'bayerPulse'
  | 'bayerInk'
  | 'bayerHot'
  | 'bayerSphere';

/** One entry of the codified Bayer family roster. */
export type BayerVariant = {
  id: string;
  name: string;
  preset: StudioPreset;
};

/**
 * THE BAYER FAMILY, codified — the authentic roster, in the review rig's
 * own order. Slot 01 is the founder's first-survey pick untouched; 02–10
 * move along real axes: matrix order (2×2/4×4/8×8), cell scale (poster ↔
 * near-grain), the tone field under the matrix (flow, contours, flank
 * radials, sweeps, interference, breath), motion, and palette balance
 * (ink-dominant, blue-forward, white-hot). Anything that shows or switches
 * the family maps over this list — the hero rig, the craft plate.
 */
export const BAYER_PRESETS: readonly BayerVariant[] = [
  // THE PICK, byte-identical: the 4×4 ordered matrix over flow-clouds
  // at coarse print cells — the glyph field's own atlas grammar.
  { id: '01', name: 'bayer-flow', preset: 'bayer' },
  // Matrix-order twin: the same flow through an 8×8 matrix at
  // near-grain cells — smooth dithered gradients where 01 steps.
  { id: '02', name: 'bayer-8x8', preset: 'bayer8' },
  // Quantized elevation bands drifting downslope — the topographic
  // motif as terraced ink.
  { id: '03', name: 'bayer-contour', preset: 'bayerContour' },
  // Two radial glows breathing at the FLANKS, centered off the window
  // column; blue-forward palette. The center stays ink by construction.
  { id: '04', name: 'bayer-radial', preset: 'bayerRadial' },
  // Long diagonal beams crossing laminar, broken by a slow pigment
  // churn — the pressroom read, frame counter-rotated from 01.
  { id: '05', name: 'bayer-sweep', preset: 'bayerSweep' },
  // Two circular wave systems interfering — crests meet as chips,
  // troughs sink to ink; the slowest clock in the family.
  { id: '06', name: 'bayer-waves', preset: 'bayerWaves' },
  // The 2×2 matrix at coarse poster cells — four thresholds, chunky
  // mosaic, the loudest print.
  { id: '07', name: 'bayer-chunk', preset: 'bayerChunk' },
  // The flow field inhaling and exhaling on a ~16s clock — near-ink at
  // rest, full bloom at the crest.
  { id: '08', name: 'bayer-pulse', preset: 'bayerPulse' },
  // Ink-dominant print: tone biased hard toward ground, sparse blue,
  // no bright chip in the palette — the quietest variant.
  { id: '09', name: 'bayer-ink', preset: 'bayerInk' },
  // Wandering heat cores lift the crests to pure white through the
  // fine 8×8 screen — the one variant allowed white.
  { id: '10', name: 'bayer-hot', preset: 'bayerHot' },
];

/** The rigs' shared default — 02 bayer-8x8, the founder pick. */
export const BAYER_DEFAULT_ID = '02';

export type StudioOptions = {
  preset?: StudioPreset;
  /** Device-pixel-ratio cap. The dithers are per-pixel; default caps at 2. */
  dpr?: number;
  speed?: number;
  params?: Partial<StudioParams>;
};

/* The house tones, resolved once (hex in comments — the practices linter
   keeps color literals out of TS): the ink ground, then the terminal's
   locale blues from the darkest depth to the string light, and the one
   white the hot variant is allowed to crest into. The family stays inside
   this set — ink and white with the blue family — never a free palette. */
const INK_BLUE: StudioVec3 = [0.016, 0.024, 0.04]; // #04060a
const BLUE: StudioVec3 = [0.184, 0.361, 0.878]; // #2f5ce0
const BLUE_MID: StudioVec3 = [0.373, 0.525, 0.949]; // #5f86f2
const BLUE_CHIP: StudioVec3 = [0.616, 0.725, 1.0]; // #9db9ff
const BLUE_STRING: StudioVec3 = [0.812, 0.878, 1.0]; // #cfe0ff
const WHITE: StudioVec3 = [1.0, 1.0, 1.0]; // #ffffff

const BASE_PARAMS: Omit<StudioParams, 'colorA' | 'colorB' | 'colorC'> = {
  strength: 0.3,
  detail: 3.2,
  frequency: 5.5,
  grain: 32,
  amplitude: 3.2,
  density: 0.8,
  brightness: 1.0,
  rotation: 0,
};

export const STUDIO_PRESETS: Record<StudioPreset, StudioParams> = {
  /* the pick — byte-identical to the material the founder chose */
  bayer: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.62,
    detail: 3.6,
    frequency: 5.8,
    grain: 48,
    rotation: 18,
  },
  /* matrix-order twin: same flow, 8×8 screen at near-grain cells */
  bayer8: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.62,
    detail: 3.6,
    frequency: 5.8,
    grain: 45,
    rotation: 18,
  },
  /* terraced elevation bands, laminar downslope drift */
  bayerContour: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.5,
    detail: 3.0,
    frequency: 3.2,
    grain: 40,
    amplitude: 3.2,
  },
  /* flank glows off the window column; blue-forward palette */
  bayerRadial: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE_MID,
    colorC: BLUE_STRING,
    strength: 0.45,
    detail: 3.0,
    frequency: 4.5,
    grain: 44,
    amplitude: 3.4,
  },
  /* long diagonal beams, laminar; the frame counter-rotated from 01 */
  bayerSweep: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.55,
    detail: 2.6,
    frequency: 2.3,
    grain: 52,
    rotation: -24,
  },
  /* two-source interference, the slowest motion in the family */
  bayerWaves: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.4,
    detail: 2.8,
    frequency: 4.0,
    grain: 36,
  },
  /* 2×2 matrix at poster cells — the coarse end of the scale axis */
  bayerChunk: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.6,
    detail: 3.0,
    frequency: 4.6,
    grain: 60,
    rotation: 18,
  },
  /* the flow field breathing on a slow clock */
  bayerPulse: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.6,
    detail: 3.4,
    frequency: 5.2,
    grain: 48,
  },
  /* ink-dominant print: tone biased to ground, crest capped at mid blue */
  bayerInk: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_MID,
    strength: 0.62,
    detail: 3.6,
    frequency: 5.4,
    grain: 46,
    brightness: 0.92,
    rotation: 18,
  },
  /* white-hot crests through the fine screen — the loudest highlight */
  bayerHot: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: WHITE,
    strength: 0.58,
    detail: 3.4,
    frequency: 5.0,
    grain: 40,
    rotation: 10,
  },
  /* the lit sphere — shading first, drift second; callers reink per theme */
  bayerSphere: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.5,
    detail: 3.0,
    frequency: 5.0,
    grain: 42,
  },
};

/* An instant where every study is mid-motion with structure visible — the
   reduced-motion still and any pre-measure frame use this. */
const STATIC_TIME = 8.0;

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/* SHADER NOTES — narration hoisted out of the GLSL strings (comments inside
   template literals ship to every visitor; minifiers cannot strip them):
   - The preamble is the studio's shared vocabulary, ported from the
     glyphfield repo (MIT): value-noise fbm over a rotating 2×2 basis;
     studioUv() is the aspect-corrected frame (±1 tall, ±aspect wide)
     rotated by uRotation degrees; colorRamp/finishColor/toneField are the
     studio grammar the family inherits; inks() quantizes a 3-level tone to
     the three colors — every variant ends in it.
   - Every family member is the SAME skeleton as the pick: a tone field
     quantized to three inks through an ordered-dither threshold at
     uGrain-scaled cells (floor(clamp(tone + 0.5 - threshold) * 2) / 2 —
     the crest ink only wins where the matrix cell is low, so lit areas
     render as a woven checker of body and crest, never a flat fill).
     What varies is the MATRIX, the CELL, the FIELD, and the CLOCK:
     bayer = the studio's explicit 4×4 matrix over flow-clouds (uTime*.36,
     cells 2–10px) — untouched;
     bayer8 = the recursive 8×8 matrix (bayer2 stacked three octaves:
     b2(p/4)/16 + b2(p/2)/4 + b2(p), 64 thresholds) over the same flow
     at 1–4px cells — smooth gradients where 01 steps;
     bayerContour = fbm+sine elevation, fract() sawtooth bands drifting
     downslope (time*.45 phase), higher ground lit brighter;
     bayerRadial = two exp-falloff glows at ±.74·aspect with slow orbiting
     centers plus expanding rings off the nearer focus — flanks lit,
     column ink by construction;
     bayerSweep = sin along a fixed diagonal axis, crests sharpened by
     pow 1.7, constant phase velocity (laminar), fbm only as breakup;
     bayerWaves = sin(distance) ripples from two off-corner sources,
     summed — interference fringes crawling at the family's slowest clock;
     bayerChunk = the 2×2 matrix (four thresholds) at 8–22px poster cells
     over a slowed flow;
     bayerPulse = the flow with a ~16s breath: cloud scale, phase and the
     whole field's level inhale together (.35 floor to full bloom);
     bayerInk = the flow pushed through pow 2.4 and capped at .9, printed
     against a lowered bias (+.4) — coverage stays sparse;
     bayerHot = the flow plus a second wandering fbm whose top lobes gate
     heat; heat lifts the tone to the white crest through the 8×8 screen;
     bayerSphere = a Lambert sphere (radius .96 of the half-frame, key
     light upper-left, a tight pow-5 core near the light that overshoots
     the crest threshold so the hot core prints crest-dominant, tone
     eased to ink at the limb) with pigment sampled in longitude/latitude
     off the sphere's own normal — the longitude carries the clock, so
     the drift compresses at the limbs exactly like a turning ball —
     through the 8×8 screen at near-grain cells.
   - Ternary chains (level < .25 ? A : level < .75 ? B : C) are the
     studio's own idiom and valid ES 1.00. */
const PREAMBLE = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uStrength;
uniform float uDetail;
uniform float uFrequency;
uniform float uGrain;
uniform float uAmplitude;
uniform float uDensity;
uniform float uBrightness;
uniform float uRotation;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.52;
  for (int index = 0; index < 5; index++) {
    value += amplitude * noise(p);
    p = mat2(1.62, 1.18, -1.18, 1.62) * p + 0.17;
    amplitude *= 0.5;
  }
  return value;
}

vec2 rot2(vec2 v, float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a)) * v;
}

vec2 studioUv() {
  vec2 uv = gl_FragCoord.xy / max(uResolution.xy, vec2(1.0));
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;
  return rot2(p, radians(uRotation));
}

vec3 colorRamp(float t) {
  return t < 0.5 ? mix(uColorA, uColorB, t * 2.0) : mix(uColorB, uColorC, (t - 0.5) * 2.0);
}

vec3 inks(float level) {
  return level < 0.25 ? uColorA : level < 0.75 ? uColorB : uColorC;
}

float toneField(vec2 p, float time) {
  float pigment = fbm(p * max(0.72, uDetail * 0.38) + vec2(time, -time * 0.72));
  pigment += sin((p.x * 0.7 + p.y) * uFrequency + time) * 0.13 * uStrength;
  return smoothstep(0.08, 0.92, pigment);
}

vec3 finishColor(vec3 color) {
  float sparkle = (hash(gl_FragCoord.xy + uTime * 23.0) - 0.5) * (uGrain / 100.0) * 0.26;
  return max(vec3(0.0), color * uBrightness + sparkle);
}
`;

const BAYER4 = `
float bayer4(vec2 position) {
  vec2 cell = mod(floor(position), 4.0);
  float index = cell.x + cell.y * 4.0;
  if (index < 0.5) return 0.0 / 16.0;
  if (index < 1.5) return 8.0 / 16.0;
  if (index < 2.5) return 2.0 / 16.0;
  if (index < 3.5) return 10.0 / 16.0;
  if (index < 4.5) return 12.0 / 16.0;
  if (index < 5.5) return 4.0 / 16.0;
  if (index < 6.5) return 14.0 / 16.0;
  if (index < 7.5) return 6.0 / 16.0;
  if (index < 8.5) return 3.0 / 16.0;
  if (index < 9.5) return 11.0 / 16.0;
  if (index < 10.5) return 1.0 / 16.0;
  if (index < 11.5) return 9.0 / 16.0;
  if (index < 12.5) return 15.0 / 16.0;
  if (index < 13.5) return 7.0 / 16.0;
  if (index < 14.5) return 13.0 / 16.0;
  return 5.0 / 16.0;
}
`;

const BAYER2 = `
float bayer2(vec2 position) {
  vec2 cell = mod(floor(position), 2.0);
  return fract(cell.x * 0.5 + cell.y * 0.75);
}
`;

const BAYER8 = `${BAYER2}
float bayer8(vec2 position) {
  return bayer2(position * 0.25) * 0.0625 + bayer2(position * 0.5) * 0.25 + bayer2(position);
}
`;

const BODIES: Record<StudioPreset, string> = {
  bayer: `${BAYER4}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.36;
  float flow = 0.5 + 0.5 * sin((p.x + p.y * 0.38 + fbm(p * max(0.8, uDetail) + time) * uStrength) * uFrequency);
  float cellSize = mix(2.0, 10.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(flow + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayer8: `${BAYER8}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.36;
  float flow = 0.5 + 0.5 * sin((p.x + p.y * 0.38 + fbm(p * max(0.8, uDetail) + time) * uStrength) * uFrequency);
  float cellSize = mix(1.0, 4.0, uGrain / 100.0);
  float threshold = bayer8(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(flow + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerContour: `${BAYER4}
void main() {
  vec2 p = studioUv() * (0.42 + uAmplitude * 0.14);
  float time = uTime * 0.3;
  float elevation = fbm(p * max(0.6, uDetail * 0.34) + vec2(time * 0.5, -time * 0.3));
  elevation += sin(p.x * 2.1 + time * 0.8) * 0.22 + cos(p.y * 2.6 - time * 0.6) * 0.18;
  float bands = fract(elevation * uFrequency - time * 0.45);
  float tone = smoothstep(0.06, 0.92, bands) * (0.5 + 0.5 * smoothstep(0.15, 0.85, elevation));
  float cellSize = mix(2.0, 8.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerRadial: `${BAYER4}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.3;
  float ax = uResolution.x / max(uResolution.y, 1.0);
  vec2 focusL = vec2(-ax * 0.74, 0.12 + sin(time * 0.7) * 0.14);
  vec2 focusR = vec2(ax * 0.74, -0.16 + cos(time * 0.56) * 0.14);
  float distL = length(p - focusL);
  float distR = length(p - focusR);
  float glow = exp(-distL * (0.6 + uFrequency * 0.09)) + exp(-distR * (0.55 + uFrequency * 0.08));
  float rings = 0.5 + 0.5 * sin(min(distL, distR) * (1.8 + uAmplitude * 0.5) - time * 1.3);
  float tone = smoothstep(0.06, 0.9, glow * (0.62 + rings * 0.5));
  tone += (fbm(p * max(0.7, uDetail * 0.4) + time * 0.4) - 0.5) * uStrength * 0.5;
  float cellSize = mix(2.0, 10.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerSweep: `${BAYER4}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.3;
  float axis = p.x * 0.86 + p.y * 0.5;
  float sweep = 0.5 + 0.5 * sin(axis * uFrequency - time * 1.7);
  sweep = pow(sweep, 1.7);
  float breakup = (fbm(p * max(0.7, uDetail * 0.3) + vec2(time * 0.22, -time * 0.13)) - 0.5) * uStrength;
  float tone = clamp(sweep + breakup, 0.0, 1.0);
  float cellSize = mix(2.0, 10.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerWaves: `${BAYER4}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.22;
  float ax = uResolution.x / max(uResolution.y, 1.0);
  vec2 sourceA = vec2(-ax * 0.66, 0.6);
  vec2 sourceB = vec2(ax * 0.62, -0.55);
  float waveA = sin(length(p - sourceA) * (2.6 + uFrequency * 0.4) - time * 2.1);
  float waveB = sin(length(p - sourceB) * (2.2 + uFrequency * 0.34) - time * 1.7);
  float tone = smoothstep(-1.4, 1.5, waveA + waveB);
  tone += (fbm(p * max(0.6, uDetail * 0.3) + time * 0.5) - 0.5) * uStrength;
  tone = clamp(tone, 0.0, 1.0);
  float cellSize = mix(2.0, 10.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerChunk: `${BAYER2}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.26;
  float flow = 0.5 + 0.5 * sin((p.x * 0.9 + p.y * 0.5 + fbm(p * max(0.7, uDetail * 0.5) + time) * uStrength) * uFrequency);
  float cellSize = mix(8.0, 22.0, uGrain / 100.0);
  float threshold = bayer2(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(flow + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerPulse: `${BAYER4}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.3;
  float breath = 0.5 + 0.5 * sin(uTime * 0.4);
  float clouds = fbm(p * max(0.8, uDetail * (0.72 + breath * 0.4)) + vec2(time * 0.4, -time * 0.26));
  float flow = 0.5 + 0.5 * sin((p.x + p.y * 0.38 + clouds * uStrength) * uFrequency + breath * 1.6);
  float tone = flow * (0.35 + 0.75 * breath);
  float cellSize = mix(2.0, 10.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerInk: `${BAYER4}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.3;
  float flow = 0.5 + 0.5 * sin((p.x + p.y * 0.38 + fbm(p * max(0.8, uDetail) + time) * uStrength) * uFrequency);
  float tone = pow(flow, 2.4) * 0.9;
  float cellSize = mix(2.0, 10.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.4 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerHot: `${BAYER8}
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.32;
  float flow = 0.5 + 0.5 * sin((p.x + p.y * 0.38 + fbm(p * max(0.8, uDetail) + time) * uStrength) * uFrequency);
  float cores = fbm(p * max(0.5, uDetail * 0.5) - vec2(time * 0.5, time * 0.3));
  float heat = smoothstep(0.58, 0.86, cores) * smoothstep(0.45, 0.9, flow);
  float tone = clamp(flow * 0.72 + heat * 0.7, 0.0, 1.0);
  float cellSize = mix(1.5, 6.0, uGrain / 100.0);
  float threshold = bayer8(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  bayerSphere: `${BAYER8}
void main() {
  vec2 p = studioUv();
  vec2 q = p / 0.96;
  float z = sqrt(max(1.0 - dot(q, q), 0.0));
  vec3 normal = normalize(vec3(q, max(z, 0.001)));
  vec3 light = normalize(vec3(-0.5, 0.55, 0.62));
  float lit = clamp(dot(normal, light), 0.0, 1.0);
  float lon = atan(q.x, max(z, 0.02));
  float lat = asin(clamp(q.y, -1.0, 1.0));
  float turn = uTime * 0.055;
  float pigment = fbm(vec2(lon + turn, lat * 1.25) * max(0.8, uDetail * 0.42)) - 0.5;
  float tone = 0.14 + pow(lit, 1.15) * 1.05 + pow(lit, 5.0) * 0.45 + pigment * uStrength;
  tone *= mix(0.42, 1.0, smoothstep(0.0, 0.4, z));
  tone = clamp(tone, 0.0, 1.45);
  float cellSize = mix(1.0, 4.0, uGrain / 100.0);
  float threshold = bayer8(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
};

const FLOAT_KEYS = [
  'strength',
  'detail',
  'frequency',
  'grain',
  'amplitude',
  'density',
  'brightness',
  'rotation',
] as const;

const VEC3_KEYS = ['colorA', 'colorB', 'colorC'] as const;

type FloatKey = (typeof FLOAT_KEYS)[number];
type Vec3Key = (typeof VEC3_KEYS)[number];

type ProgramInfo = {
  program: WebGLProgram;
  resolutionLoc: WebGLUniformLocation | null;
  timeLoc: WebGLUniformLocation | null;
  floatLocs: Map<FloatKey, WebGLUniformLocation | null>;
  vec3Locs: Map<Vec3Key, WebGLUniformLocation | null>;
};

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  draw: (
    preset: StudioPreset,
    width: number,
    height: number,
    time: number,
    params: StudioParams
  ) => HTMLCanvasElement | null;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  preset: StudioPreset;
  params: StudioParams;
  dpr: number;
  speed: number;
  running: boolean;
  visible: boolean;
  reduced: boolean;
  startTime: number;
  observer?: IntersectionObserver;
  resize?: ResizeObserver;
};

let engine: Engine | null = null;
let engineFailed = false;
const subscribers = new Set<Subscriber>();
let frameId = 0;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('studio-field: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`studio-field compile: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

/** Builds the one shared context, or returns null once we know it cannot work. */
function getEngine(): Engine | null {
  if (engine) return engine;
  if (engineFailed) return null;

  const canvas = document.createElement('canvas');
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      // Read back via drawImage in the same task as the draw call; without
      // this the buffer may already be cleared.
      preserveDrawingBuffer: true,
    }) as WebGLRenderingContext | null;
  } catch {
    engineFailed = true;
    return null;
  }
  if (!gl) {
    engineFailed = true;
    return null;
  }
  const ctx = gl;

  let vert: WebGLShader;
  try {
    vert = compile(ctx, ctx.VERTEX_SHADER, VERT);
  } catch {
    engineFailed = true;
    return null;
  }

  const buffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);

  /* One program per study, compiled on first use. A study whose shader
     fails stays failed for the session; the others keep working. */
  const programs = new Map<StudioPreset, ProgramInfo | 'failed'>();
  const uName = (key: string) => `u${key.charAt(0).toUpperCase()}${key.slice(1)}`;

  const getProgram = (preset: StudioPreset): ProgramInfo | null => {
    const cached = programs.get(preset);
    if (cached === 'failed') return null;
    if (cached) return cached;
    try {
      const program = ctx.createProgram();
      if (!program) {
        programs.set(preset, 'failed');
        return null;
      }
      ctx.attachShader(program, vert);
      ctx.attachShader(program, compile(ctx, ctx.FRAGMENT_SHADER, `${PREAMBLE}${BODIES[preset]}`));
      ctx.linkProgram(program);
      if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
        programs.set(preset, 'failed');
        return null;
      }
      ctx.useProgram(program);
      const posLoc = ctx.getAttribLocation(program, 'position');
      ctx.enableVertexAttribArray(posLoc);
      ctx.vertexAttribPointer(posLoc, 2, ctx.FLOAT, false, 0, 0);
      const floatLocs = new Map<FloatKey, WebGLUniformLocation | null>();
      FLOAT_KEYS.forEach((key) => floatLocs.set(key, ctx.getUniformLocation(program, uName(key))));
      const vec3Locs = new Map<Vec3Key, WebGLUniformLocation | null>();
      VEC3_KEYS.forEach((key) => vec3Locs.set(key, ctx.getUniformLocation(program, uName(key))));
      const info: ProgramInfo = {
        program,
        resolutionLoc: ctx.getUniformLocation(program, 'uResolution'),
        timeLoc: ctx.getUniformLocation(program, 'uTime'),
        floatLocs,
        vec3Locs,
      };
      programs.set(preset, info);
      return info;
    } catch {
      programs.set(preset, 'failed');
      return null;
    }
  };

  // Contexts are lost on GPU resets and tab recovery; rebuild on restore
  // rather than leaving every field black.
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    engine = null;
  });

  engine = {
    canvas,
    gl: ctx,
    draw(preset, width, height, time, params) {
      const info = getProgram(preset);
      if (!info) return null;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.useProgram(info.program);
      ctx.viewport(0, 0, width, height);
      ctx.uniform2f(info.resolutionLoc, width, height);
      ctx.uniform1f(info.timeLoc, time);
      FLOAT_KEYS.forEach((key) => ctx.uniform1f(info.floatLocs.get(key) ?? null, params[key]));
      VEC3_KEYS.forEach((key) => {
        const v = params[key];
        ctx.uniform3f(info.vec3Locs.get(key) ?? null, v[0], v[1], v[2]);
      });
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
      return canvas;
    },
  };
  return engine;
}

function sizeOf(sub: Subscriber): { width: number; height: number } {
  const width = Math.max(1, Math.floor((sub.target.clientWidth || 1) * sub.dpr));
  const height = Math.max(1, Math.floor((sub.target.clientHeight || 1) * sub.dpr));
  return { width, height };
}

function renderSubscriber(sub: Subscriber, time: number) {
  const active = getEngine();
  if (!active) return;
  const { width, height } = sizeOf(sub);
  if (sub.target.width !== width || sub.target.height !== height) {
    sub.target.width = width;
    sub.target.height = height;
  }
  const source = active.draw(sub.preset, width, height, time, sub.params);
  if (!source) return;
  sub.blit.drawImage(source, 0, 0);
}

function tick(now: number) {
  frameId = 0;
  // Skip everything the viewer cannot see: a paused field, one scrolled out
  // of view, or a backgrounded tab.
  const hidden = typeof document !== 'undefined' && document.hidden;
  if (!hidden) {
    for (const sub of subscribers) {
      if (!sub.running || !sub.visible) continue;
      renderSubscriber(sub, ((now - sub.startTime) / 1000) * sub.speed);
    }
  }
  schedule();
}

function schedule() {
  if (frameId) return;
  let anyActive = false;
  for (const sub of subscribers) {
    if (sub.running && sub.visible) {
      anyActive = true;
      break;
    }
  }
  // With nothing to draw the loop stops entirely rather than spinning.
  if (anyActive) frameId = requestAnimationFrame(tick);
}

/**
 * Registers a field. Returns null only when WebGL is unavailable, in which
 * case the caller's canvas is left untouched and the parent's own dark plate
 * shows instead.
 */
export function createStudioField(
  canvas: HTMLCanvasElement,
  options: StudioOptions = {}
): StudioFieldHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const preset = options.preset ?? 'bayer';
  const sub: Subscriber = {
    target: canvas,
    blit,
    preset,
    params: { ...STUDIO_PRESETS[preset], ...options.params },
    // The dithers are per-device-pixel materials — cap at 2 so the cells
    // stay crisp (a soft dpr-1 upscale would mush them).
    dpr: options.dpr ?? Math.min(window.devicePixelRatio || 1, 2),
    speed: options.speed ?? 1,
    running: !reduced,
    visible: true,
    reduced,
    startTime: performance.now(),
  };
  subscribers.add(sub);

  if (typeof IntersectionObserver !== 'undefined') {
    sub.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        sub.visible = entry.isIntersecting;
        schedule();
      },
      { rootMargin: '120px' }
    );
    sub.observer.observe(canvas);
  }

  // DPR-aware resize: the running loop re-measures per frame; a stilled field
  // (reduced motion or paused) re-renders its one frame at the new size.
  if (typeof ResizeObserver !== 'undefined') {
    sub.resize = new ResizeObserver(() => {
      if (!sub.running) renderSubscriber(sub, STATIC_TIME);
    });
    sub.resize.observe(canvas);
  }

  if (reduced) renderSubscriber(sub, STATIC_TIME);
  else schedule();

  return {
    setParams(patch) {
      Object.assign(sub.params, patch);
      if (!sub.running) renderSubscriber(sub, STATIC_TIME);
    },
    pause() {
      sub.running = false;
    },
    resume() {
      if (sub.reduced || sub.running) return;
      sub.running = true;
      sub.startTime = performance.now();
      schedule();
    },
    renderStatic(time = STATIC_TIME) {
      renderSubscriber(sub, time);
    },
    destroy() {
      sub.observer?.disconnect();
      sub.resize?.disconnect();
      subscribers.delete(sub);
      // The engine context is deliberately kept for the session — tearing it
      // down per unmount is what exhausted the browser's context budget.
    },
  };
}
