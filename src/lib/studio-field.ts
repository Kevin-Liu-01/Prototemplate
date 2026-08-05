/**
 * Studio field — house ports of the founder's glyphfield studio materials
 * (glyphfield.com/studio; the source lives in his own MIT repo, in
 * src/components/LiveMaterialCanvas.tsx and src/lib/shaderPresets.ts).
 * Five studies travel here: the line field (ruled lines — the house motif
 * itself), the ordered-dither gradient (print dither, kin to the glyph
 * field's Bayer atlas), the grain gradient (ink pigment on paper), the
 * topographic contour map (the cartography of a global network), and the
 * radiant void (the singularity family). Each is a single-pass fragment
 * shader over the studio's shared vocabulary — hash/noise/fbm, an
 * aspect-corrected rotated frame, a three-stop color ramp, a grain finish.
 *
 * HOUSE TUNING — the studio mixes free palettes; the band does not. Every
 * preset here grounds on near-black ink and lights in the terminal's own
 * locale blues (#2f5ce0 depths, #9db9ff chips, #cfe0ff strings) so the
 * field renders LIGHT ON INK: the page composites the canvas with its own
 * mix-blend-mode, the ink ground falls away, and the shared .tch-field
 * mask keeps the center column dark for the window that lives there. In
 * light theme the sg*h homes invert the canvas (v0-pages.css), so the same
 * frame reads as blue ink lines on paper — tuned to survive both.
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
  /** Body color — the working blue. */
  colorB: StudioVec3;
  /** Crest color — the light the material peaks into. */
  colorC: StudioVec3;
  /** Study-specific gain: warp depth, dither push, ray heat. */
  strength: number;
  /** Noise/fbm scale — how fine the organic movement is. */
  detail: number;
  /** Repetition rate: line count, flow frequency, ray count. */
  frequency: number;
  /** Studio grain scale 0–100: finish sparkle, dither cell size. */
  grain: number;
  /** Broad geometry: field zoom (topo), ring width (void). */
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

export type StudioPreset = 'lines' | 'dither' | 'grain' | 'topo' | 'void' | 'mesh';

export type StudioOptions = {
  preset?: StudioPreset;
  /** Device-pixel-ratio cap. Dither/grain are per-pixel; default caps at 2. */
  dpr?: number;
  speed?: number;
  params?: Partial<StudioParams>;
};

/* The house inks, resolved once (hex in comments — the practices linter
   keeps color literals out of TS): ink ground, then the terminal's locale
   blues from the darkest depth to the string light. */
const INK: StudioVec3 = [0.016, 0.024, 0.04]; // #04060a
const BLUE_DEEP: StudioVec3 = [0.141, 0.251, 0.62]; // #24409e
const BLUE: StudioVec3 = [0.184, 0.361, 0.878]; // #2f5ce0
const BLUE_MID: StudioVec3 = [0.373, 0.525, 0.949]; // #5f86f2
const BLUE_CHIP: StudioVec3 = [0.616, 0.725, 1.0]; // #9db9ff
const BLUE_STRING: StudioVec3 = [0.812, 0.878, 1.0]; // #cfe0ff
const NEAR_WHITE: StudioVec3 = [0.93, 0.95, 1.0]; // #edf2ff

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
  /* study-line-field: a field of ruled lines, warped and lit — the house
     motif set in motion. Blue body, string-light crests. */
  lines: {
    ...BASE_PARAMS,
    colorA: INK,
    colorB: BLUE,
    colorC: BLUE_STRING,
    strength: 0.45,
    detail: 3.2,
    frequency: 5.0,
    grain: 24,
  },
  /* glyphfield-dither-gradient: a three-color flow resolved through a 4×4
     Bayer matrix — the glyph field's own print grammar. */
  dither: {
    ...BASE_PARAMS,
    colorA: INK,
    colorB: BLUE,
    colorC: BLUE_CHIP,
    strength: 0.62,
    detail: 3.6,
    frequency: 5.8,
    grain: 48,
    rotation: 18,
  },
  /* glyphfield-grain-gradient: slow pigment drift with paper grain — ink
     wash rising through the blues to the string light. */
  grain: {
    ...BASE_PARAMS,
    colorA: INK,
    colorB: BLUE,
    colorC: BLUE_STRING,
    strength: 0.34,
    detail: 2.8,
    frequency: 3.2,
    grain: 42,
  },
  /* shaderPresets topographic: animated contour lines with the precision
     of a technical map — index contours in blue, fine lines in light. */
  topo: {
    ...BASE_PARAMS,
    colorA: INK,
    colorB: BLUE_MID,
    colorC: BLUE_STRING,
    strength: 0.5,
    detail: 2.8,
    amplitude: 3.2,
    grain: 18,
  },
  /* study-radiant-void: a dark-centered aperture with a lit ring — the
     singularity family, in band form. */
  void: {
    ...BASE_PARAMS,
    colorA: INK,
    colorB: BLUE,
    colorC: NEAR_WHITE,
    strength: 0.3,
    frequency: 5.5,
    grain: 24,
  },
  /* glyphfield-mesh-gradient: two focal blues breathing over the ink. */
  mesh: {
    ...BASE_PARAMS,
    colorA: INK,
    colorB: BLUE_DEEP,
    colorC: BLUE_MID,
    strength: 0.28,
    detail: 2.2,
    frequency: 3.4,
    grain: 14,
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
   - The preamble is the studio's shared vocabulary, ported verbatim from
     the glyphfield repo (MIT): value-noise fbm over a rotating 2×2 basis;
     studioUv() is the aspect-corrected frame (±1 tall, ±aspect wide)
     rotated by uRotation degrees; colorRamp runs A→B→C; finishColor adds
     the animated grain sparkle scaled by uGrain/100 and applies
     uBrightness.
   - lines: a horizontal sweep field (p.y plus a sine bend plus fbm warp)
     quantized into bands; smoothstep edges cut the line core and a wider
     halo; a slow cross-flow tints the inter-line field so the rules read
     as lit, not printed.
   - dither: the studio's 4×4 Bayer matrix thresholds a sine flow into
     three levels mapped to the three colors; cell size comes from uGrain
     in DEVICE pixels, which is why this engine defaults to dpr ≤ 2 rather
     than the soft dpr-1 upscale some house engines use.
   - grain: fbm pigment plus a sine current, smoothstepped and run through
     the ramp; a coarse per-2×2-pixel paper hash adds the print tooth. It
     finishes with its own brightness multiply (no sparkle pass) — the
     tooth IS the grain.
   - topo: the shaderPresets 'topographic' study with an fbm wobble added
     under uStrength; coarse contours in colorB over a vertical wash,
     fine interval lines in colorC at low weight.
   - void: polar frame — fbm-distorted radius, a smoothstep aperture, a
     gaussian ring at r=0.62 whose width rides uAmplitude, and uFrequency
     rays modulating the ring light; the far field falls off so the band's
     flanks stay quiet.
   - mesh: two orbiting exponential foci mixed through the ramp with an
     fbm warp — the quietest of the set. */
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

vec2 studioUv() {
  vec2 uv = gl_FragCoord.xy / max(uResolution.xy, vec2(1.0));
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;
  float angle = radians(uRotation);
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p;
}

vec3 colorRamp(float t) {
  return t < 0.5 ? mix(uColorA, uColorB, t * 2.0) : mix(uColorB, uColorC, (t - 0.5) * 2.0);
}

vec3 finishColor(vec3 color) {
  float sparkle = (hash(gl_FragCoord.xy + uTime * 23.0) - 0.5) * (uGrain / 100.0) * 0.26;
  return max(vec3(0.0), color * uBrightness + sparkle);
}
`;

const BODIES: Record<StudioPreset, string> = {
  lines: `
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.42;
  float warp = fbm(p * max(0.8, uDetail * 0.55) + vec2(time * 0.35, -time * 0.2));
  float sweep = p.y + sin(p.x * (1.2 + uDetail * 0.16) + time) * (0.18 + uStrength * 0.08);
  sweep += (warp - 0.5) * (0.34 + uStrength * 0.24);
  float bands = abs(fract(sweep * (1.4 + uFrequency * 0.28)) - 0.5);
  float line = smoothstep(0.13, 0.012, bands);
  float halo = smoothstep(0.34, 0.02, bands) * (0.18 + uStrength * 0.12);
  float crossFlow = 0.5 + 0.5 * sin((p.x - p.y * 0.42 + warp) * uFrequency - time * 0.7);
  vec3 color = mix(uColorA, uColorB, crossFlow * 0.42 + halo);
  color = mix(color, uColorC, line * (0.64 + uStrength * 0.16));
  color += mix(uColorB, uColorC, 0.5) * halo * 0.18;
  gl_FragColor = vec4(finishColor(color), 1.0);
}
`,
  dither: `
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

void main() {
  vec2 p = studioUv();
  float time = uTime * 0.36;
  float flow = 0.5 + 0.5 * sin((p.x + p.y * 0.38 + fbm(p * max(0.8, uDetail) + time) * uStrength) * uFrequency);
  float cellSize = mix(2.0, 10.0, uGrain / 100.0);
  float threshold = bayer4(gl_FragCoord.xy / cellSize);
  float level = floor(clamp(flow + 0.5 - threshold, 0.0, 1.0) * 2.0) / 2.0;
  vec3 color = level < 0.25 ? uColorA : level < 0.75 ? uColorB : uColorC;
  gl_FragColor = vec4(max(vec3(0.0), color * uBrightness), 1.0);
}
`,
  grain: `
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.3;
  float pigment = fbm(p * max(0.72, uDetail * 0.38) + vec2(time, -time * 0.72));
  pigment += sin((p.x * 0.7 + p.y) * uFrequency + time) * 0.13 * uStrength;
  float tone = smoothstep(0.08, 0.92, pigment);
  vec3 color = colorRamp(tone);
  float paper = hash(floor(gl_FragCoord.xy * 0.72) + floor(time * 5.0)) - 0.5;
  color += paper * (0.025 + uGrain / 100.0 * 0.22);
  gl_FragColor = vec4(max(vec3(0.0), color * uBrightness), 1.0);
}
`,
  topo: `
void main() {
  vec2 p = studioUv() * (0.4 + uAmplitude * 0.14);
  float time = uTime * 0.3;
  float elevation = sin(p.x * 3.2 + time) + cos(p.y * 4.0 - time * 0.8);
  elevation += sin((p.x + p.y) * 5.0 + time * 0.57) * 0.45;
  elevation += (fbm(p * max(0.6, uDetail * 0.28) + time * 0.15) - 0.5) * uStrength * 1.6;
  float contours = 1.0 - smoothstep(0.04, 0.14, abs(fract(elevation * 1.35) - 0.5));
  float fine = 1.0 - smoothstep(0.015, 0.06, abs(fract(elevation * 4.0) - 0.5));
  vec2 uv = gl_FragCoord.xy / max(uResolution.xy, vec2(1.0));
  vec3 color = mix(uColorA * 0.12, uColorB * 0.34, uv.y);
  color = mix(color, uColorB, contours * 0.8);
  color = mix(color, uColorC, fine * 0.2);
  gl_FragColor = vec4(finishColor(color), 1.0);
}
`,
  void: `
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.2;
  float angle = atan(p.y, p.x);
  float distortion = fbm(p * max(0.8, uDetail * 0.5) + vec2(time, -time * 0.7));
  float radius = length(p) + (distortion - 0.5) * (0.16 + uStrength * 0.08);
  float aperture = smoothstep(0.19, 0.56, radius);
  float ring = exp(-pow((radius - 0.62) / (0.1 + uAmplitude * 0.008), 2.0));
  float rays = pow(0.5 + 0.5 * sin(angle * max(3.0, uFrequency) + time), 8.0);
  vec3 color = mix(uColorA * 0.12, uColorB, aperture * 0.48);
  color = mix(color, uColorC, ring * (0.68 + rays * 0.24));
  color += mix(uColorB, uColorC, 0.5) * ring * rays * uStrength * 0.2;
  color *= 1.0 - smoothstep(1.0, 1.8, radius) * 0.68;
  gl_FragColor = vec4(finishColor(color), 1.0);
}
`,
  mesh: `
void main() {
  vec2 p = studioUv();
  float time = uTime * 0.24;
  vec2 focusA = vec2(-0.52 + sin(time) * 0.18, -0.36 + cos(time * 0.7) * 0.16);
  vec2 focusB = vec2(0.48 + cos(time * 0.8) * 0.2, 0.4 + sin(time * 0.6) * 0.18);
  float fieldA = exp(-length(p - focusA) * (1.5 + uFrequency * 0.12));
  float fieldB = exp(-length(p - focusB) * (1.3 + uFrequency * 0.1));
  float warp = fbm(p * max(0.65, uDetail * 0.42) + time) * uStrength;
  vec3 color = mix(uColorA, uColorB, clamp(fieldA + warp * 0.22, 0.0, 1.0));
  color = mix(color, uColorC, clamp(fieldB + warp * 0.16, 0.0, 1.0));
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

  const preset = options.preset ?? 'lines';
  const sub: Subscriber = {
    target: canvas,
    blit,
    preset,
    params: { ...STUDIO_PRESETS[preset], ...options.params },
    // Dither/grain are per-device-pixel materials — cap at 2 so the Bayer
    // matrix stays crisp (a soft dpr-1 upscale would mush it).
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
