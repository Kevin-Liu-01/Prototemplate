/**
 * Studio field — house ports of the founder's glyphfield studio materials
 * (glyphfield.com/studio; the source lives in his own MIT repo, in
 * src/components/LiveMaterialCanvas.tsx and src/lib/shaderPresets.ts).
 * Two families travel here, matching the founder's strategy call:
 *
 * THE DITHER FAMILY (print — the strategy): five genuinely distinct pattern
 * geometries in the house restraint — ink and white with the blue family
 * where it reads well. They read as print on the dark plate and are kin to
 * the glyph field's own Bayer atlas:
 *   - bayer: a 4×4 ordered-dither matrix quantizing a flowing tone field
 *     into three inks at coarse print cells;
 *   - film: the same pigment flow resolved through per-cell white-noise
 *     thresholds at near-pixel scale — film-stock grain, reseeded on a
 *     slow flicker clock;
 *   - halftone: a rotated dot screen (the 14° printer's angle) whose dot
 *     gauge carries the tone, sampled per cell like a real screen;
 *   - diffusion: error-diffusion's organic read — value-noise thresholds
 *     with a serpentine row wobble, so the ink clusters into worms rather
 *     than ordered cells;
 *   - contour: topographic elevation lines pushed through the Bayer
 *     matrix — the ruled-line motif rendered as dithered ink density.
 *
 * THE LIGHT FAMILY (washes): flowing light in the house blues under white
 * crests — flanks lit, center column dark:
 *   - spectral: the studio's featured Spectral Bloom — soft currents
 *     converging into one luminous field;
 *   - mesh: two orbiting focal blues breathing over the ink;
 *   - aurora: soft curtain bands moving through a deep atmospheric field.
 * (The band's other two light slots are the house prismatic engine and the
 * packaged Paper God Rays — see HeroFieldSwitcher.)
 *
 * HOUSE TUNING — every preset grounds on near-black so the field renders
 * LIGHT ON INK: the page composites the canvas with its own mix-blend-mode,
 * the ground falls away, and the shared .tch-field mask keeps the center
 * column dark for the window that lives there. In light theme the sg*h
 * homes invert the canvas (v0-pages.css), so both families read as ink
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
  /** Broad geometry: field zoom (contour), radial reach (spectral). */
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
  | 'film'
  | 'halftone'
  | 'diffusion'
  | 'contour'
  | 'spectral'
  | 'mesh'
  | 'aurora';

export type StudioOptions = {
  preset?: StudioPreset;
  /** Device-pixel-ratio cap. The dithers are per-pixel; default caps at 2. */
  dpr?: number;
  speed?: number;
  params?: Partial<StudioParams>;
};

/* The house tones, resolved once (hex in comments — the practices linter
   keeps color literals out of TS): the ink ground, then the terminal's
   locale blues from the darkest depth to the string light. Both families
   stay inside this set — ink and white with the blue family where it
   reads well, never a free palette. */
const INK_BLUE: StudioVec3 = [0.016, 0.024, 0.04]; // #04060a
const BLUE: StudioVec3 = [0.184, 0.361, 0.878]; // #2f5ce0
const BLUE_MID: StudioVec3 = [0.373, 0.525, 0.949]; // #5f86f2
const BLUE_CHIP: StudioVec3 = [0.616, 0.725, 1.0]; // #9db9ff
const BLUE_STRING: StudioVec3 = [0.812, 0.878, 1.0]; // #cfe0ff

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
  /* — the dither family: print in the house inks — */
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
  film: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_STRING,
    strength: 0.4,
    detail: 3.0,
    frequency: 3.6,
    grain: 22,
  },
  halftone: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE_MID,
    colorC: BLUE_STRING,
    strength: 0.5,
    detail: 2.8,
    frequency: 4.2,
    grain: 40,
  },
  diffusion: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.46,
    detail: 3.0,
    frequency: 4.0,
    grain: 30,
  },
  contour: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE_MID,
    colorC: BLUE_STRING,
    strength: 0.5,
    detail: 2.8,
    amplitude: 3.2,
    grain: 36,
  },
  /* — the light family: house blues under white crests. The band's mask
     dims the center and shows the FLANKS, and the plate then composites
     through opacity and blend — smooth washes need the extra gain that the
     hard-celled dithers never do. — */
  spectral: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.9,
    detail: 3.2,
    frequency: 4.2,
    grain: 12,
    amplitude: 3.8,
    brightness: 1.9,
  },
  mesh: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.35,
    detail: 2.2,
    frequency: 2.6,
    grain: 14,
    brightness: 2.1,
  },
  aurora: {
    ...BASE_PARAMS,
    colorA: INK_BLUE,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.5,
    detail: 3.0,
    frequency: 4.0,
    grain: 14,
    brightness: 1.85,
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
     rotated by uRotation degrees; colorRamp runs A→B→C; finishColor adds
     the animated grain sparkle scaled by uGrain/100 and applies
     uBrightness; inks() quantizes a 3-level tone to the three colors —
     every dither ends in it.
   - The dithers share one skeleton: a slow TONE FIELD (fbm pigment plus a
     sine current under uFrequency/uStrength) quantized to three inks
     through a THRESHOLD — and the threshold is the whole identity:
     bayer = the studio's 4×4 ordered matrix at uGrain-scaled cells;
     film = white-noise per cell, reseeded on a slow flicker clock;
     halftone = no threshold at all — a rotated dot screen samples the
     tone at each cell center and carries it as dot gauge (tone under
     sqrt so gauge tracks perceived coverage);
     diffusion = value-noise thresholds stretched along serpentine rows
     (alternate rows wobble opposite ways), clustering ink into the
     wormy runs error diffusion leaves;
     contour = the topographic elevation study's line field used AS the
     tone, then Bayer-quantized — ruled lines as ink density.
   - spectral: the studio's Spectral Bloom, ported intact — two warped
     current systems plus a radial pulse, their convergence lifted into
     a bloom, the crest tinted toward white; the far field falls off so
     the flanks stay quiet.
   - mesh: two orbiting exponential foci mixed through the ramp with an
     fbm warp — the quietest of the set.
   - aurora: the studio's aurora preset — two crossed wave systems whose
     product gates a veil between the deep field and the lit bands.
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
  film: `
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.3;
  float tone = toneField(p, time);
  float cell = mix(1.0, 4.0, uGrain / 100.0);
  vec2 g = floor(gl_FragCoord.xy / cell);
  float flicker = floor(time * 8.0);
  float rnd = hash(g + vec2(flicker * 13.0, flicker * 7.0));
  float level = clamp(floor(tone * 2.0 + rnd), 0.0, 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  halftone: `
vec2 screenToStudio(vec2 px) {
  vec2 uv = px / max(uResolution.xy, vec2(1.0));
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;
  return rot2(p, radians(uRotation));
}

void main() {
  float screenAngle = radians(14.0);
  float cellPx = mix(7.0, 18.0, uGrain / 100.0);
  vec2 s = rot2(gl_FragCoord.xy, screenAngle) / cellPx;
  vec2 cellId = floor(s) + 0.5;
  vec2 samplePx = rot2(cellId * cellPx, -screenAngle);
  vec2 p = screenToStudio(samplePx);
  float time = uTime * 0.3;
  float field = fbm(p * max(0.6, uDetail * 0.36) + vec2(time, -time * 0.6));
  field += sin((p.x + p.y * 0.5) * uFrequency * 0.5 - time) * 0.2 * uStrength;
  float tone = smoothstep(0.12, 0.94, field);
  float radius = sqrt(clamp(tone, 0.0, 1.0)) * 0.66;
  float aa = 1.6 / cellPx;
  float dist = length(s - cellId);
  float dotMask = 1.0 - smoothstep(radius - aa, radius + aa, dist);
  vec3 color = mix(uColorA, uColorB, dotMask);
  color = mix(color, uColorC, dotMask * smoothstep(0.68, 0.96, tone));
  gl_FragColor = vec4(max(vec3(0.0), color * uBrightness), 1.0);
}
`,
  diffusion: `
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.24;
  float tone = toneField(p, time);
  float cell = mix(1.5, 5.0, uGrain / 100.0);
  vec2 g = floor(gl_FragCoord.xy / cell);
  float serp = mod(g.y, 2.0) * 2.0 - 1.0;
  float wobble = noise(g * vec2(0.11, 0.37));
  float xw = g.x * 0.53 + serp * wobble * 7.0;
  float threshold = noise(vec2(xw, g.y * 0.61) + floor(time * 3.0));
  float level = clamp(floor(tone * 2.0 + threshold), 0.0, 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  contour: `${BAYER4}
void main() {
  vec2 p = studioUv() * (0.4 + uAmplitude * 0.14);
  float time = uTime * 0.3;
  float elevation = sin(p.x * 3.2 + time) + cos(p.y * 4.0 - time * 0.8);
  elevation += sin((p.x + p.y) * 5.0 + time * 0.57) * 0.45;
  elevation += (fbm(p * max(0.6, uDetail * 0.28) + time * 0.15) - 0.5) * uStrength * 1.6;
  float contours = 1.0 - smoothstep(0.05, 0.2, abs(fract(elevation * 1.35) - 0.5));
  float fine = 1.0 - smoothstep(0.02, 0.1, abs(fract(elevation * 4.0) - 0.5));
  vec2 uv = gl_FragCoord.xy / max(uResolution.xy, vec2(1.0));
  float tone = uv.y * 0.12 + contours * 0.85 + fine * 0.3;
  float cellSize = mix(2.0, 8.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(tone + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  gl_FragColor = vec4(max(vec3(0.0), inks(level) * uBrightness), 1.0);
}
`,
  spectral: `
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.72;
  float strength = clamp(uStrength, 0.0, 1.5);
  float frequency = 1.25 + uFrequency * 0.22;

  vec2 flow = p;
  flow.x *= 0.55;
  flow += vec2(
    sin(p.y * (1.35 + uDetail * 0.12) + time * 0.62),
    cos(p.x * (1.15 + uDetail * 0.1) - time * 0.48)
  ) * (0.1 + strength * 0.075);

  float radius = length(flow);
  float currentA = 0.5 + 0.5 * sin(
    (flow.x * 0.72 + flow.y) * frequency
    + radius * (1.4 + uAmplitude * 0.34)
    - time
  );
  float currentB = 0.5 + 0.5 * sin(
    (flow.x * 1.08 - flow.y * 0.58) * (frequency * 0.86)
    - radius * (1.8 + uDetail * 0.18)
    + time * 0.74
  );
  float pulse = 0.5 + 0.5 * sin(radius * (2.2 + uDetail * 0.24) - time * 0.56);
  float convergence = 1.0 - abs(currentA - currentB);
  float energy = currentA * 0.42 + currentB * 0.3 + pulse * 0.16 + convergence * 0.12;
  energy = smoothstep(0.08, 0.94, energy);

  float core = 1.0 - smoothstep(0.04, 1.6, radius);
  float bloom = smoothstep(0.12, 0.92, energy + core * 0.16);
  float crest = smoothstep(0.56, 1.08, energy + currentA * 0.14 + core * 0.08);
  vec3 color = mix(uColorA, uColorB, 0.1 + bloom * 0.74);
  color = mix(color, uColorC, crest * (0.42 + strength * 0.22));
  color += mix(uColorB, uColorC, 0.5) * bloom * core * 0.08;

  float falloff = 1.0 - smoothstep(0.72, 1.78, length(vec2(p.x * 0.55, p.y)));
  color *= mix(0.52, 1.0, falloff);
  gl_FragColor = vec4(finishColor(color), 1.0);
}
`,
  mesh: `
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.24;
  float ax = uResolution.x / max(uResolution.y, 1.0);
  vec2 focusA = vec2((-0.52 + sin(time) * 0.18) * ax * 0.7, -0.36 + cos(time * 0.7) * 0.16);
  vec2 focusB = vec2((0.48 + cos(time * 0.8) * 0.2) * ax * 0.7, 0.4 + sin(time * 0.6) * 0.18);
  float fieldA = exp(-length((p - focusA) * vec2(0.7, 1.0)) * (1.5 + uFrequency * 0.12));
  float fieldB = exp(-length((p - focusB) * vec2(0.7, 1.0)) * (1.3 + uFrequency * 0.1));
  float warp = fbm(p * max(0.65, uDetail * 0.42) + time) * uStrength;
  vec3 color = mix(uColorA, uColorB, clamp(fieldA + warp * 0.22, 0.0, 1.0));
  color = mix(color, uColorC, clamp(fieldB + warp * 0.16, 0.0, 1.0));
  gl_FragColor = vec4(finishColor(color), 1.0);
}
`,
  aurora: `
float wave(vec2 p, float offset) {
  return sin(p.x * 3.2 + sin(p.y * 2.0 + uTime * 0.45) + offset) * 0.5 + 0.5;
}

void main() {
  vec2 p = studioUv();
  vec2 uv = gl_FragCoord.xy / max(uResolution.xy, vec2(1.0));
  float a = wave(p, 0.0);
  float b = wave(p.yx * 1.35, 2.4);
  float veil = smoothstep(0.18, 0.9, a * b + 0.18 * sin(uTime + p.y * 4.0));
  vec3 base = mix(uColorA * 0.16, uColorB * 0.5, uv.y);
  vec3 color = mix(base, mix(uColorB, uColorC, a * 0.6), veil * 0.82);
  gl_FragColor = vec4(finishColor(color), 1.0);
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
