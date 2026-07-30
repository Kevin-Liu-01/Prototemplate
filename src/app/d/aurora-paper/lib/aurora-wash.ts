/**
 * Aurora wash — this direction's own shader material. A NEW GLSL field, not a
 * port: an enormous, slow, silky chroma wash in the Resend register, but on
 * PAPER — the base color is the page's own #fbfbfa and the "light" is a
 * barely-there thin-film tint (steel blue / rose / pale gold) breathing through
 * it on a ~15s cycle. Film grain is baked into the fragment shader so the wash
 * can sit at 2–6% chroma deviation without ever posterizing into bands.
 *
 * The same field runs in an ink register (preset 'ink') for the page's one
 * dark band: identical math, near-black base, the tints lifted instead of
 * sunk, so hero and band read as one material photographed twice.
 *
 * ARCHITECTURE — copied deliberately from src/lib/prismatic-field.ts, which
 * learned this the hard way: exactly ONE WebGL context exists for this shader
 * module no matter how many washes are mounted. Per-component contexts
 * exhausted Chrome's ~16-context budget after a dozen client-side navigations
 * and every canvas went silently black. Subscribers register with a shared
 * engine that draws into one offscreen GL canvas and blits the frame into each
 * subscriber's own 2D canvas; a single rAF loop skips anything offscreen,
 * paused, or in a hidden tab.
 */

export type AuroraParams = {
  /** Base surface color (linear-ish sRGB triplet, 0..1). */
  base: readonly [number, number, number];
  /** The three thin-film tints the wash drifts between. */
  tintA: readonly [number, number, number];
  tintB: readonly [number, number, number];
  tintC: readonly [number, number, number];
  /** Overall wash strength, 0..1 — how far pixels move from base toward tint. */
  wash: number;
  /** Baked film-grain amplitude (0.01 ≈ ±2.5/255). */
  grain: number;
  /** Field scale — smaller = larger, softer features. */
  scale: number;
  /** Field drift rate (already multiplied by subscriber speed). */
  drift: number;
  /** Breathing depth 0..1 — chroma inhales/exhales on a slow sine. */
  breathe: number;
  /** Diagonal light axis: y = slope*x + lift (canvas coords, 0..1, y-up). */
  axisSlope: number;
  axisLift: number;
  /** Gaussian width of the axis envelope; >= 8 effectively disables it. */
  envelope: number;
  /** Exposure multiplier applied above the keep-zone (1 disables). */
  quiet: number;
  /** frag.y band over which full exposure eases into `quiet` (y-up). */
  quietLo: number;
  quietHi: number;
};

export type AuroraHandle = {
  setParams: (patch: Partial<AuroraParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type AuroraOptions = {
  preset?: 'paper' | 'ink';
  dpr?: number;
  speed?: number;
  params?: Partial<AuroraParams>;
};

/* The page's exact paper (#fbfbfa) and dark plate (#0c0e11), so the canvas
   fades seamlessly into the surfaces that carry it. */
/* R2: the r1 wash measured a 14/255 max spread on the page shot — invisible at
   page scale. The tints now sit 3–5x further from paper (a fold peaks around
   55–65/255 off base) and the axis envelope is wide enough that the light owns
   the hero's right half instead of grazing its corner.
   R3: the r2 wash overshot the other way — the hero's right half peaked
   ~40/255 off paper, candy instead of breath. The `quiet` zone keeps full
   exposure behind the ladder (low frag.y) and pulls everything above it down
   25%, so the specimen stays lit and the counter-space whispers again.
   R3, ink: the r2 band's envelope (1.1) was so wide the light had no
   direction — violet smoke. The band now runs one tight aurora arc
   (envelope 0.30) descending from the top-left corner toward the upper
   right, so the headline and terminal align to a lit horizon and the body
   of the band stays true dark. */
export const AURORA_PRESETS: Record<'paper' | 'ink', AuroraParams> = {
  paper: {
    base: [0.984, 0.984, 0.98],
    tintA: [0.596, 0.718, 0.918], // steel blue
    tintB: [0.945, 0.694, 0.769], // rose
    tintC: [0.925, 0.831, 0.588], // pale gold
    wash: 1.25,
    grain: 0.018,
    scale: 2.0,
    drift: 0.05,
    breathe: 0.16,
    axisSlope: -0.34,
    axisLift: 0.84,
    envelope: 1.0,
    quiet: 0.75,
    quietLo: 0.3,
    quietHi: 0.58,
  },
  ink: {
    base: [0.047, 0.055, 0.067],
    tintA: [0.36, 0.52, 0.75], // steel blue
    tintB: [0.42, 0.33, 0.62], // violet, secondary
    tintC: [0.25, 0.55, 0.48], // aurora green
    wash: 1.35,
    grain: 0.024,
    scale: 1.9,
    drift: 0.045,
    breathe: 0.18,
    axisSlope: -0.1,
    axisLift: 0.92,
    envelope: 0.3,
    quiet: 1.0,
    quietLo: 0.0,
    quietHi: 1.0,
  },
};

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/*
 * Three-layer construction:
 *  1. a domain-warped fbm field (two warp passes) gives the silky, smoke-like
 *     large-scale structure — no radial blobs, no linear gradients;
 *  2. the warp coordinates select between three tints, so hue changes travel
 *     with the folds of the field rather than sitting in screen space;
 *  3. per-pixel two-tap film grain, re-seeded every frame, is added LAST so
 *     the near-paper mix can never band.
 */
const FRAG = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uBase;
uniform vec3 uTintA;
uniform vec3 uTintB;
uniform vec3 uTintC;
uniform float uWash;
uniform float uGrain;
uniform float uScale;
uniform float uDrift;
uniform float uBreathe;
uniform float uAxisSlope;
uniform float uAxisLift;
uniform float uEnvelope;
uniform float uQuiet;
uniform float uQuietLo;
uniform float uQuietHi;

/* Sin-free hash (Dave Hoskins hash12): the classic fract(sin(...)*43758.5)
   hash collapses under some GL implementations at large lattice coordinates,
   which silently flattened the whole field. This one is stable everywhere. */
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * vnoise(p);
    p = p * 2.03 + vec2(11.3, 7.1);
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy / max(uResolution, vec2(1.0));
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(frag.x * aspect, frag.y) * uScale;

  float t = uTime * uDrift;

  vec2 q = vec2(
    fbm(p + vec2(0.0, t * 0.7)),
    fbm(p + vec2(5.2, 1.3) - vec2(t * 0.55, 0.0))
  );
  vec2 r = vec2(
    fbm(p * 1.35 + 2.6 * q + vec2(1.7, 9.2) + vec2(t * 0.4, 0.0)),
    fbm(p * 1.35 + 2.6 * q + vec2(8.3, 2.8) - vec2(0.0, t * 0.35))
  );
  float f = fbm(p * 1.15 + 2.2 * r);

  vec3 tint = mix(uTintA, uTintB, smoothstep(0.2, 0.8, q.x));
  tint = mix(tint, uTintC, smoothstep(0.3, 0.85, r.y) * 0.72);

  // The satin sweep: one enormous soft band travelling along the field's
  // diagonal, so the wash reads as light passing rather than noise sitting.
  float sweep = 0.5 + 0.5 * sin(dot(vec2(frag.x * aspect, frag.y), vec2(0.55, 1.4)) * 2.1 - t * 1.7 + r.x * 2.4);

  float breathe = 1.0 - uBreathe * (0.5 + 0.5 * sin(uTime * 0.42 + 1.1));
  float amt = uWash * smoothstep(0.28, 0.62, f) * (0.62 + 0.38 * sweep) * breathe;

  float axisD = frag.y - (uAxisSlope * frag.x + uAxisLift);
  float env = exp(-(axisD * axisD) / max(uEnvelope * uEnvelope * 0.25, 1e-4));
  amt *= mix(env, 1.0, step(8.0, uEnvelope));

  // The light grows toward the right edge: the type column keeps quiet paper,
  // the counter-space holds the mass (AESTHETIC_ADDENDUM 2b).
  amt *= 0.42 + 0.58 * smoothstep(0.04, 0.72, frag.x);

  // The keep-zone: full exposure inside it (the hero's ladder band), pulled
  // down to uQuiet above it, so the specimen is the lit thing and the rest
  // of the field stays barely-there.
  amt *= mix(1.0, uQuiet, smoothstep(uQuietLo, uQuietHi, frag.y));

  vec3 col = mix(uBase, tint, clamp(amt, 0.0, 1.0));

  // Baked film grain: two taps at different pitches, re-seeded per frame.
  vec2 seed = gl_FragCoord.xy + vec2(fract(uTime * 61.7) * 913.0, fract(uTime * 41.3) * 719.0);
  float g1 = hash(seed) - 0.5;
  float g2 = hash(seed * 0.53 + 91.7) - 0.5;
  col += (g1 * 0.72 + g2 * 0.28) * uGrain;

  gl_FragColor = vec4(col, 1.0);
}
`;

const SCALAR_KEYS = [
  'wash',
  'grain',
  'scale',
  'drift',
  'breathe',
  'axisSlope',
  'axisLift',
  'envelope',
  'quiet',
  'quietLo',
  'quietHi',
] as const;

const VEC3_KEYS = ['base', 'tintA', 'tintB', 'tintC'] as const;

type ScalarKey = (typeof SCALAR_KEYS)[number];
type Vec3Key = (typeof VEC3_KEYS)[number];

type Engine = {
  canvas: HTMLCanvasElement;
  draw: (width: number, height: number, time: number, params: AuroraParams) => HTMLCanvasElement;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  params: AuroraParams;
  dpr: number;
  speed: number;
  running: boolean;
  visible: boolean;
  startTime: number;
  observer?: IntersectionObserver;
};

let engine: Engine | null = null;
let engineFailed = false;
const subscribers = new Set<Subscriber>();
let frameId = 0;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('aurora-wash: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`aurora-wash compile: ${gl.getShaderInfoLog(shader)}`);
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
      powerPreference: 'low-power',
      // Read back via drawImage in the same task as the draw call.
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

  let program: WebGLProgram;
  try {
    const created = ctx.createProgram();
    if (!created) {
      engineFailed = true;
      return null;
    }
    program = created;
    ctx.attachShader(program, compile(ctx, ctx.VERTEX_SHADER, VERT));
    ctx.attachShader(program, compile(ctx, ctx.FRAGMENT_SHADER, FRAG));
    ctx.linkProgram(program);
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
      engineFailed = true;
      return null;
    }
  } catch {
    engineFailed = true;
    return null;
  }
  ctx.useProgram(program);

  const buffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
  const posLoc = ctx.getAttribLocation(program, 'position');
  ctx.enableVertexAttribArray(posLoc);
  ctx.vertexAttribPointer(posLoc, 2, ctx.FLOAT, false, 0, 0);

  const resolutionLoc = ctx.getUniformLocation(program, 'uResolution');
  const timeLoc = ctx.getUniformLocation(program, 'uTime');
  const scalarLocs = new Map<ScalarKey, WebGLUniformLocation | null>();
  SCALAR_KEYS.forEach((key) => {
    scalarLocs.set(key, ctx.getUniformLocation(program, `u${key[0].toUpperCase()}${key.slice(1)}`));
  });
  const vec3Locs = new Map<Vec3Key, WebGLUniformLocation | null>();
  VEC3_KEYS.forEach((key) => {
    vec3Locs.set(key, ctx.getUniformLocation(program, `u${key[0].toUpperCase()}${key.slice(1)}`));
  });

  // Contexts are lost on GPU resets and tab recovery; rebuild on next frame.
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    engine = null;
  });

  engine = {
    canvas,
    draw(width, height, time, params) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.viewport(0, 0, width, height);
      ctx.uniform2f(resolutionLoc, width, height);
      ctx.uniform1f(timeLoc, time);
      SCALAR_KEYS.forEach((key) => ctx.uniform1f(scalarLocs.get(key) ?? null, params[key]));
      VEC3_KEYS.forEach((key) => {
        const [x, y, z] = params[key];
        ctx.uniform3f(vec3Locs.get(key) ?? null, x, y, z);
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
  const source = active.draw(width, height, time, sub.params);
  sub.blit.drawImage(source, 0, 0);
}

function tick(now: number) {
  frameId = 0;
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
  if (anyActive) frameId = requestAnimationFrame(tick);
}

/**
 * Registers a wash. Returns null only when WebGL is unavailable, in which case
 * the caller's canvas stays blank and the parent's own surface color shows.
 */
export function createAuroraWash(canvas: HTMLCanvasElement, options: AuroraOptions = {}): AuroraHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...AURORA_PRESETS[options.preset ?? 'paper'], ...options.params },
    dpr: options.dpr ?? Math.min(window.devicePixelRatio || 1, 1),
    speed: options.speed ?? 1,
    running: !reduced,
    visible: true,
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

  // Reduced motion: one legible still — the wash mid-breath, grain frozen.
  if (reduced) renderSubscriber(sub, 24);
  else schedule();

  return {
    setParams(patch) {
      Object.assign(sub.params, patch);
      if (!sub.running) renderSubscriber(sub, 24);
    },
    pause() {
      sub.running = false;
    },
    resume() {
      if (reduced || sub.running) return;
      sub.running = true;
      sub.startTime = performance.now();
      schedule();
    },
    renderStatic(time = 24) {
      renderSubscriber(sub, time);
    },
    destroy() {
      sub.observer?.disconnect();
      subscribers.delete(sub);
      // The engine context is deliberately kept for the session — tearing it
      // down per unmount is what exhausts the browser's context budget.
    },
  };
}
