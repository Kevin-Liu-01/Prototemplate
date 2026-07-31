/**
 * Aurora wash — this direction's own shader material. A NEW GLSL field, not a
 * port: a polar light event on PAPER. The field has two registers layered in
 * one fragment program:
 *
 *  1. THE CURTAIN — the light event itself. A curved arc (the auroral oval)
 *     crosses the surface; a luminous spine runs along it, and ragged
 *     vertical striations hang beneath it like curtain pleats. A slow banded
 *     macro-field decides which stretches of the curtain are blazing and
 *     which are dark sky, so the axis carries real luminance range instead of
 *     uniform haze. Color is height-mapped down the rays (gold → rose →
 *     steel blue on paper; auroral green → ionized blue → violet at night),
 *     and the whole curtain leans with a travelling fold, so stills read as
 *     directional light, not noise.
 *
 *  2. THE BREATH — the original double domain-warped fbm silk, kept as an
 *     underpainting at a whisper, so the paper far from the axis still
 *     breathes and the curtain never floats in sterile emptiness.
 *
 * Film grain is baked into the fragment shader LAST so the near-paper mix can
 * sit at low chroma deviation without ever posterizing into bands. A 2D quiet
 * window (a y-band crossed with a centered x-column) pulls exposure down over
 * the hero's type while the flanks keep the full event.
 *
 * The same field runs in an ink register (preset 'ink') for the page's
 * permanently-dark panels: identical math, near-black base, the tints lifted
 * instead of sunk, so hero and band read as one material photographed twice.
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
  /** Curtain color ramp: A at the spine, B down the ray body, C at the tips
      (C also seeds the ambient breath). */
  tintA: readonly [number, number, number];
  tintB: readonly [number, number, number];
  tintC: readonly [number, number, number];
  /** Master exposure, 0..~1.2 — how far pixels move from base toward tint. */
  wash: number;
  /** Baked film-grain amplitude (0.01 ≈ ±2.5/255). */
  grain: number;
  /** Ambient field scale — smaller = larger, softer features. */
  scale: number;
  /** Field drift rate (already multiplied by subscriber speed). */
  drift: number;
  /** Breathing depth 0..1 — exposure inhales/exhales on a slow sine. */
  breathe: number;
  /** The arc: y = lift + slope*(x-0.5) + bow*(x-0.5)^2 (canvas 0..1, y-up). */
  axisSlope: number;
  axisLift: number;
  axisBow: number;
  /** Curtain strength (0 disables the event, leaving pure ambient breath). */
  curtain: number;
  /** How far the rays reach below the arc, as a fraction of height. */
  rayLen: number;
  /** Striation frequency along the arc (in aspect-corrected x units). */
  rayFreq: number;
  /** Fold amplitude — how strongly the curtain pleats and leans. */
  fold: number;
  /** Ambient breath strength (the old silk field, as underpainting). */
  ambient: number;
  /** Horizontal throw, signed: +1 gathers light to the right edge, -1 to the
      left, 0 leaves the curtain's own banding in charge. */
  bias: number;
  /** Exposure multiplier inside the quiet window (1 disables). */
  quiet: number;
  /** The window's frag.y band (y-up) — quiet INSIDE [lo, hi]. */
  quietLo: number;
  quietHi: number;
  /** Half-width of the quiet column around x=quietX; >= 8 = full width. */
  quietW: number;
  /** Center of the quiet column (frag x, 0..1). 0.5 = the page column; the
      hero panel slides it left so the quiet serves the cascade's glyphs
      while the flanks keep the full event. */
  quietX: number;
};

export type AuroraHandle = {
  setParams: (patch: Partial<AuroraParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type AuroraPresetName = 'paper' | 'ink' | 'paper-dark';

export type AuroraOptions = {
  preset?: AuroraPresetName;
  dpr?: number;
  speed?: number;
  params?: Partial<AuroraParams>;
};

/* The page's exact paper (#fbfbfa) and dark plate (#0c0e11), so the canvas
   fades seamlessly into the surfaces that carry it.
   R4 (the curtain rewrite): the r0–r3 field was an even watercolor haze — no
   axis, no luminance range, no direction. The presets below tune the curtain
   register instead: 'paper' hangs a gold-spined curtain with rose/steel rays;
   'paper-dark' is the same arc as a northern sky, where the green lower
   border can genuinely glow; 'ink' keeps the permanently-dark panels on a
   quieter sliver of the same event. */
export const AURORA_PRESETS: Record<AuroraPresetName, AuroraParams> = {
  paper: {
    base: [0.984, 0.984, 0.98],
    tintA: [0.98, 0.78, 0.3], // luminous gold — the spine
    tintB: [0.92, 0.6, 0.66], // rose — the ray body
    tintC: [0.55, 0.67, 0.9], // steel blue — ray tips and ambient
    wash: 0.9,
    grain: 0.016,
    scale: 2.0,
    drift: 0.05,
    breathe: 0.14,
    axisSlope: -0.2,
    axisLift: 0.84,
    axisBow: -0.42,
    curtain: 1.1,
    rayLen: 0.62,
    rayFreq: 3.0,
    fold: 0.9,
    ambient: 0.4,
    bias: 0.25,
    quiet: 1.0,
    quietLo: 0.0,
    quietHi: 0.0,
    quietW: 8.0,
    quietX: 0.5,
  },
  ink: {
    base: [0.047, 0.055, 0.067],
    tintA: [0.62, 0.9, 0.74], // pale green spine
    tintB: [0.34, 0.58, 0.84], // steel blue body
    tintC: [0.48, 0.36, 0.72], // violet tips
    wash: 1.0,
    grain: 0.024,
    scale: 1.9,
    drift: 0.045,
    breathe: 0.16,
    axisSlope: -0.1,
    axisLift: 0.86,
    axisBow: -0.2,
    curtain: 0.85,
    rayLen: 0.55,
    rayFreq: 2.6,
    fold: 0.85,
    ambient: 0.4,
    bias: 0.2,
    quiet: 1.0,
    quietLo: 0.0,
    quietHi: 0.0,
    quietW: 8.0,
    quietX: 0.5,
  },
  'paper-dark': {
    base: [0.039, 0.043, 0.059], // the dark theme's paper, #0a0b0f
    tintA: [0.45, 0.94, 0.68], // auroral emerald — the bright border
    tintB: [0.28, 0.6, 0.86], // ionized blue
    tintC: [0.52, 0.4, 0.82], // violet tips
    wash: 1.1,
    grain: 0.028,
    scale: 1.9,
    drift: 0.05,
    breathe: 0.16,
    axisSlope: -0.2,
    axisLift: 0.84,
    axisBow: -0.42,
    curtain: 1.2,
    rayLen: 0.66,
    rayFreq: 3.0,
    fold: 0.95,
    ambient: 0.4,
    bias: 0.25,
    quiet: 1.0,
    quietLo: 0.0,
    quietHi: 0.0,
    quietW: 8.0,
    quietX: 0.5,
  },
};

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/*
 * Construction, bottom to top:
 *  1. the ambient breath — a domain-warped fbm field (two warp passes), the
 *     silky large-scale structure the old wash was made of, kept at a whisper;
 *  2. the curtain — an arc y = lift + slope*x' + bow*x'^2 with a luminous
 *     spine, ridged-noise striations hanging below it (two pitches sliding at
 *     different speeds), ragged per-ray reach, a banded macro-field gating
 *     which stretches are lit, and a travelling fold that pleats and leans
 *     the whole event;
 *  3. exposure shaping — breathing, horizontal throw, and the 2D quiet
 *     window over the type column;
 *  4. per-pixel two-tap film grain, re-seeded every frame, added LAST so the
 *     near-paper mix can never band.
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
uniform float uAxisBow;
uniform float uCurtain;
uniform float uRayLen;
uniform float uRayFreq;
uniform float uFold;
uniform float uAmbient;
uniform float uBias;
uniform float uQuiet;
uniform float uQuietLo;
uniform float uQuietHi;
uniform float uQuietW;
uniform float uQuietX;

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
  vec2 uv = gl_FragCoord.xy / max(uResolution, vec2(1.0));
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uDrift;

  /* ---- 1. ambient breath: the double-warped silk, as underpainting ---- */
  vec2 p = vec2(uv.x * aspect, uv.y) * uScale;
  vec2 q = vec2(
    fbm(p + vec2(0.0, t * 0.7)),
    fbm(p + vec2(5.2, 1.3) - vec2(t * 0.55, 0.0))
  );
  vec2 w = vec2(
    fbm(p * 1.35 + 2.6 * q + vec2(1.7, 9.2) + vec2(t * 0.4, 0.0)),
    fbm(p * 1.35 + 2.6 * q + vec2(8.3, 2.8) - vec2(0.0, t * 0.35))
  );
  float silk = fbm(p * 1.15 + 2.2 * w);
  float ambAmt = uAmbient * smoothstep(0.3, 0.72, silk);

  /* ---- 2. the curtain ---- */
  float xc = uv.x - 0.5;
  float arcY = uAxisLift + uAxisSlope * xc + uAxisBow * xc * xc;
  float below = arcY - uv.y; // > 0 under the arc, where the rays hang

  // along-arc coordinate, pleated by a slow travelling fold
  float s = uv.x * aspect;
  float foldN = fbm(vec2(s * 1.5 - t * 0.55, t * 0.2 + 2.0));
  float sw = s + uFold * (foldN - 0.5);
  // the rays lean with the fold as they fall
  float swR = sw + below * uFold * 0.7 * (foldN - 0.5);

  // macro bands: which stretches of the curtain are blazing vs dark sky —
  // this is where the axis gets real luminance range
  float bandN = fbm(vec2(sw * 0.85 + t * 0.3, 7.3));
  float bands = 0.12 + 0.88 * smoothstep(0.34, 0.8, bandN);

  // striations: two ridged pitches sliding along the arc at different speeds
  float r1 = 1.0 - abs(2.0 * vnoise(vec2(swR * uRayFreq - t * 0.9, 3.0)) - 1.0);
  float r2 = 1.0 - abs(2.0 * vnoise(vec2(swR * uRayFreq * 2.6 + t * 0.6, 41.0)) - 1.0);
  float rays = pow(clamp(r1 * 0.62 + r2 * 0.55, 0.0, 1.0), 2.6);

  // ragged reach: each pleat's rays fall a different distance
  float reach = uRayLen * (0.45 + 0.85 * vnoise(vec2(sw * 2.6, t * 0.26 + 21.0)));
  float down = below / max(reach, 1e-3);

  float rayFall = exp(-max(down, 0.0) * 2.3) * step(0.0, below);
  float aboveGlow = exp(-below * below * 120.0); // soft bloom around the arc
  float spine = exp(-below * below * 1200.0);    // the luminous edge itself

  float curtain = uCurtain * bands * (
    rays * (rayFall * 0.85 + aboveGlow * 0.25)
    + spine * (0.35 + 0.65 * rays)
  );

  // height-mapped curtain color: spine -> body -> tips
  float h = clamp(down, 0.0, 1.0);
  vec3 tint = mix(uTintA, uTintB, smoothstep(0.02, 0.5, h));
  tint = mix(tint, uTintC, smoothstep(0.42, 1.0, h));

  // the ambient breath wears the body/tip hues, chosen by its own folds
  vec3 ambTint = mix(uTintB, uTintC, smoothstep(0.25, 0.8, q.x));
  ambTint = mix(ambTint, uTintA, smoothstep(0.55, 0.95, w.y) * 0.35);

  /* ---- 3. exposure shaping ---- */
  float breathe = 1.0 - uBreathe * (0.5 + 0.5 * sin(uTime * 0.42 + 1.1));

  // horizontal throw (signed): gather the event toward one flank
  float xg = mix(1.0, 0.34 + 0.66 * smoothstep(0.02, 0.78, uv.x), clamp(uBias, 0.0, 1.0));
  xg *= mix(1.0, 0.34 + 0.66 * smoothstep(0.98, 0.22, uv.x), clamp(-uBias, 0.0, 1.0));

  // the 2D quiet window: a y-band crossed with an x-column at uQuietX — the
  // type keeps quiet paper while the flanks keep the full event
  float qwin = smoothstep(uQuietLo - 0.1, uQuietLo + 0.08, uv.y)
    * (1.0 - smoothstep(uQuietHi - 0.08, uQuietHi + 0.1, uv.y));
  qwin *= 1.0 - smoothstep(uQuietW, uQuietW + 0.14, abs(uv.x - uQuietX));

  float exposure = uWash * breathe * xg * mix(1.0, uQuiet, qwin);

  float aAmb = clamp(ambAmt * exposure, 0.0, 1.0);
  float aCur = clamp(curtain * exposure, 0.0, 1.0);

  vec3 col = mix(uBase, ambTint, aAmb);
  col = mix(col, tint, aCur);

  /* ---- 4. baked film grain: two taps, re-seeded per frame ---- */
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
  'axisBow',
  'curtain',
  'rayLen',
  'rayFreq',
  'fold',
  'ambient',
  'bias',
  'quiet',
  'quietLo',
  'quietHi',
  'quietW',
  'quietX',
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
    scalarLocs.set(key, ctx.getUniformLocation(program, `u${key.charAt(0).toUpperCase()}${key.slice(1)}`));
  });
  const vec3Locs = new Map<Vec3Key, WebGLUniformLocation | null>();
  VEC3_KEYS.forEach((key) => {
    vec3Locs.set(key, ctx.getUniformLocation(program, `u${key.charAt(0).toUpperCase()}${key.slice(1)}`));
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
