/**
 * Ray field — raw-WebGL port of the "Sci-Fi Light Rays" shader
 * (github.com/npanium/Sci-Fi-Light-Rays-Shader). Each ray is a cubic bézier
 * path; the paths themselves are invisible — traveling PULSES with trailing
 * motion blur draw them, and a soft gradient glow hangs around the curves.
 * The math is the source shader's; what changed in the port:
 *
 *   - ORIENTATION: the source pours rays top→bottom. A field-space transform
 *     (uOrient) reseats the same geometry three ways — 0 pours down, 1 rises
 *     from the floor, 2 bends in from BOTH flanks toward the center column
 *     (mirrored about x, the prismatic field's own symmetry trick). uSpan
 *     compresses the along-axis so a composition can stay low in the band,
 *     and uAxisCenter aims the bundle off the geometric middle.
 *   - PALETTE: the source randomized across pink/blue/orange. The selection
 *     mechanism survives (three center/edge pairs, hash-picked per ray,
 *     blended by uColorMix) but the pairs are pinned to the house blues
 *     (#86a8ff / #2f5ce0 ramps) under white-hot cores — light, not rainbow.
 *   - TONE: blend modes are gone. The field renders additive light on black
 *     and the page composites it with the canvas's own mix-blend-mode; an
 *     exponential shoulder (1 − e^−x·uExposure) replaces the hard clip so
 *     hot cores roll to white without banding, and the house 1/255 hash
 *     dither is added at the end.
 *
 * ARCHITECTURE — the house rule: exactly ONE WebGL context for this module
 * per session, shared by every subscriber (per-component contexts exhausted
 * the browser's ~16-context budget and went silently black). Subscribers
 * register here; the engine draws into one offscreen GL canvas and blits
 * into each subscriber's own 2D canvas. Reduced motion renders ONE static
 * frame and stops; document.hidden pauses the loop; a per-subscriber
 * ResizeObserver keeps the still crisp when the band reflows.
 */

export type RayVec3 = [number, number, number];

export type RayParams = {
  /** Number of ray paths (the shader iterates a fixed 50 and breaks). */
  rayCount: number;
  /** Core gauge of a ray, in along-normalized field units. */
  rayWidth: number;
  /** Spread of ray origins across the across-axis (source: topWidth). */
  originSpread: number;
  /** Spread of ray endings across the across-axis (source: bottomWidth). */
  terminusSpread: number;
  /** Base along-offset of control point 1 (source: verticalLength). */
  lift: number;
  /** Control point 1 — fraction of the terminus offset (across) / along. */
  cp1X: number;
  cp1Y: number;
  /** Control point 2 — fraction of the terminus offset (across) / along. */
  cp2X: number;
  cp2Y: number;
  /** Per-ray origin jitter. */
  randomness: number;
  /** Where the bundle converges on the across-axis (0.5 = centered). */
  axisCenter: number;
  /** Along-axis compression: 0.6 packs the whole composition into 60%. */
  span: number;
  /** Pulse travel rate, cycles per second before `speed`. */
  pulseSpeed: number;
  /** Travelers per ray, 1–3. */
  pulseCount: number;
  /** Gaussian width of a pulse along its path. */
  pulseWidth: number;
  /** Gain on the pulse light. */
  pulseBrightness: number;
  /** How far the drawn trail persists behind a pulse (0–0.5). */
  trailLength: number;
  /** Motion-blur accumulation inside the trail. */
  motionBlur: number;
  /** Ambient glow strength around the paths (source: bgGlow). */
  glow: number;
  /** Glow weighting toward the spread (terminus) end. */
  glowSpread: number;
  /** Glow weighting at mid-curve. */
  glowCurve: number;
  /** 1 = pulses run terminus→origin. */
  reverse: number;
  /** Exponential-shoulder gain; higher = brighter (NOT prismatic's dimmer). */
  exposure: number;
  /** 0 = pour down, 1 = rise from the floor, 2 = bend in from the flanks. */
  orient: number;
  /** 0 = every ray uses pair 1; 1 = full hash spread across the pairs. */
  colorMix: number;
  col1Center: RayVec3;
  col1Edge: RayVec3;
  col2Center: RayVec3;
  col2Edge: RayVec3;
  col3Center: RayVec3;
  col3Edge: RayVec3;
};

export type RayFieldHandle = {
  setParams: (patch: Partial<RayParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type RayPreset = 'converge' | 'shafts' | 'horizon';

export type RayOptions = {
  preset?: RayPreset;
  dpr?: number;
  speed?: number;
  params?: Partial<RayParams>;
};

/* The house ramp: ray BODIES stay blue-dominant (the terminal's own locale
   blues — #9db9ff chips, #cfe0ff strings, #2f5ce0/#274ec4 depths); the
   white-hot cores come from the tone map's luma snap where pulses stack, not
   from pale body colors (pale bodies read as silver, not light). The three
   pairs are all family — hash selection varies the ray, never the hue. */
const HOUSE_COLORS: Pick<
  RayParams,
  'col1Center' | 'col1Edge' | 'col2Center' | 'col2Edge' | 'col3Center' | 'col3Edge' | 'colorMix'
> = {
  col1Center: [0.616, 0.725, 1.0], // #9db9ff
  col1Edge: [0.184, 0.361, 0.878], // #2f5ce0
  col2Center: [0.525, 0.659, 1.0], // #86a8ff
  col2Edge: [0.153, 0.306, 0.769], // #274ec4
  col3Center: [0.812, 0.878, 1.0], // #cfe0ff
  col3Edge: [0.373, 0.525, 0.949], // #5f86f2
  colorMix: 0.85,
};

export const RAY_PRESETS: Record<RayPreset, RayParams> = {
  /* Data converging into the product: rays enter from BOTH flanks, spread
     across the band's height, and bend into a bundle just shy of the center
     column — the terminus sits at ~span, so the middle stays dark for the
     window that lives there. */
  converge: {
    rayCount: 20,
    rayWidth: 0.008,
    originSpread: 1.25,
    terminusSpread: 0.3,
    lift: 0.1,
    cp1X: 0.3,
    cp1Y: 0.25,
    cp2X: 0.15,
    cp2Y: 0.6,
    randomness: 0.05,
    axisCenter: 0.56,
    span: 0.95,
    pulseSpeed: 0.3,
    pulseCount: 3,
    pulseWidth: 0.045,
    pulseBrightness: 2.4,
    trailLength: 0.42,
    motionBlur: 0.35,
    glow: 1.1,
    glowSpread: 0.25,
    glowCurve: 0.45,
    reverse: 0,
    exposure: 1.6,
    orient: 2,
    ...HOUSE_COLORS,
  },
  /* Server-hall uplink: near-vertical shafts standing across the whole band,
     unevenly spaced, with slow pulses rising through them. */
  shafts: {
    rayCount: 26,
    rayWidth: 0.0055,
    originSpread: 1.55,
    terminusSpread: 1.45,
    lift: 0.15,
    cp1X: 0.95,
    cp1Y: 0.25,
    cp2X: 0.98,
    cp2Y: 0.6,
    randomness: 0.2,
    axisCenter: 0.5,
    span: 1.0,
    pulseSpeed: 0.16,
    pulseCount: 2,
    pulseWidth: 0.08,
    pulseBrightness: 3.0,
    trailLength: 0.5,
    motionBlur: 0.45,
    glow: 0.9,
    glowSpread: 0.3,
    glowCurve: 0.15,
    reverse: 0,
    exposure: 1.55,
    orient: 1,
    ...HOUSE_COLORS,
  },
  /* The edge-network horizon: a wide, quiet fan lifting off the band's floor
     line — a tight bundle at the floor opening far past the flanks, kept low
     by the span so the upper band stays calm. */
  horizon: {
    rayCount: 26,
    rayWidth: 0.006,
    originSpread: 0.7,
    terminusSpread: 3.2,
    lift: 0.0,
    cp1X: 0.4,
    cp1Y: 0.3,
    cp2X: 0.75,
    cp2Y: 0.65,
    randomness: 0.08,
    axisCenter: 0.5,
    span: 0.62,
    pulseSpeed: 0.12,
    pulseCount: 2,
    pulseWidth: 0.06,
    pulseBrightness: 1.8,
    trailLength: 0.5,
    motionBlur: 0.4,
    glow: 1.2,
    glowSpread: 0.5,
    glowCurve: 0.3,
    reverse: 0,
    exposure: 1.35,
    orient: 1,
    ...HOUSE_COLORS,
  },
};

/* An instant where every preset has pulses mid-flight with trails drawn —
   the reduced-motion still and any pre-measure frame use this. */
const STATIC_TIME = 9.4;

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/* SHADER NOTES — narration hoisted out of the GLSL string (comments inside
   template literals ship to every visitor; minifiers cannot strip them):
   - Field space: P.x is ACROSS the bundle, P.y is ALONG it (0 = origin,
     1 = terminus). uOrient seats that frame on the screen: 0 origin-top,
     1 origin-floor, 2 origin-flanks with terminus at the center column
     (mirrored |2x−1|, so both flanks carve identically — the house
     symmetric-pair read). uSpan divides P.y so the whole composition can
     land inside a fraction of the band.
   - Each ray is a cubic bézier: p0 on the origin line spread by
     uOriginSpread, p3 on the terminus line spread by uTerminusSpread,
     p1/p2 steered by the cp uniforms as fractions of the terminus offset —
     the source shader's exact construction, with uAxisCenter replacing the
     hardcoded 0.5.
   - distanceToBezier is the source's sampled search: 40 coarse samples,
     then 8 refinements around the winner. closestT doubles as "position
     along the path" for the pulses.
   - Rays are NOT drawn — pulses reveal them: a gaussian bump at pulsePos
     with a fading trail behind it and 5 motion-blur taps inside the trail;
     pulses fade in near the origin and out near the terminus so nothing
     pops at either line.
   - The ambient glow is distance-based with two positional weights: one
     toward the spread end (uGlowSpread), one gaussian at mid-curve
     (uGlowCurve) — the source's "glow position/strength" knobs.
   - Output: exponential shoulder 1−e^(−x·uExposure) instead of a clip,
     then the prismatic field's own luma snap (hot spots roll toward pure
     white — absolute light, never a saturated hue), mild source vignette in
     SCREEN space, and the house 1/255 hash dither against banding. Black
     background — the page's mix-blend-mode does the compositing. */
const FRAG = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uRayCount;
uniform float uRayWidth;
uniform float uOriginSpread;
uniform float uTerminusSpread;
uniform float uLift;
uniform float uCp1X;
uniform float uCp1Y;
uniform float uCp2X;
uniform float uCp2Y;
uniform float uRandomness;
uniform float uAxisCenter;
uniform float uSpan;
uniform float uPulseSpeed;
uniform float uPulseCount;
uniform float uPulseWidth;
uniform float uPulseBrightness;
uniform float uTrailLength;
uniform float uMotionBlur;
uniform float uGlow;
uniform float uGlowSpread;
uniform float uGlowCurve;
uniform float uReverse;
uniform float uExposure;
uniform float uOrient;
uniform float uColorMix;
uniform vec3 uCol1Center;
uniform vec3 uCol1Edge;
uniform vec3 uCol2Center;
uniform vec3 uCol2Edge;
uniform vec3 uCol3Center;
uniform vec3 uCol3Edge;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

vec2 cubicBezier(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t) {
  float s = 1.0 - t;
  return s*s*s * p0 + 3.0*s*s*t * p1 + 3.0*s*t*t * p2 + t*t*t * p3;
}

float distanceToBezier(vec2 point, vec2 p0, vec2 p1, vec2 p2, vec2 p3, out float closestT) {
  float minDist = 1e10;
  closestT = 0.0;
  const int samples = 40;
  for (int i = 0; i <= samples; i++) {
    float t = float(i) / float(samples);
    vec2 curvePoint = cubicBezier(p0, p1, p2, p3, t);
    float dist = distance(point, curvePoint);
    if (dist < minDist) {
      minDist = dist;
      closestT = t;
    }
  }
  float refinement = 0.025;
  float tMin = max(0.0, closestT - refinement);
  float tMax = min(1.0, closestT + refinement);
  for (int i = 0; i <= 8; i++) {
    float t = tMin + (tMax - tMin) * float(i) / 8.0;
    vec2 curvePoint = cubicBezier(p0, p1, p2, p3, t);
    float dist = distance(point, curvePoint);
    if (dist < minDist) {
      minDist = dist;
      closestT = t;
    }
  }
  return minDist;
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(uResolution.xy, vec2(1.0));
  vec2 P;
  if (uOrient < 0.5) {
    P = vec2(uv.x, 1.0 - uv.y);
  } else if (uOrient < 1.5) {
    P = vec2(uv.x, uv.y);
  } else {
    P = vec2(1.0 - uv.y, 1.0 - abs(2.0 * uv.x - 1.0));
  }
  P.y /= max(uSpan, 0.05);

  vec3 totalPulseColor = vec3(0.0);
  vec3 backgroundGlow = vec3(0.0);

  for (float i = 0.0; i < 50.0; i += 1.0) {
    if (i >= uRayCount) break;

    float rayIndex = i / max(uRayCount - 1.0, 1.0);
    float randomOffset = (hash(i) - 0.5) * uRandomness;
    float xStart = uAxisCenter + (rayIndex - 0.5) * uOriginSpread + randomOffset;

    float colorHash = hash(i * 3.7);
    vec3 rayColorCenter;
    vec3 rayColorEdge;
    if (uColorMix < 0.01) {
      rayColorCenter = uCol1Center;
      rayColorEdge = uCol1Edge;
    } else {
      vec3 selectedCenter;
      vec3 selectedEdge;
      if (colorHash < 0.33) {
        selectedCenter = uCol1Center;
        selectedEdge = uCol1Edge;
      } else if (colorHash < 0.66) {
        selectedCenter = uCol2Center;
        selectedEdge = uCol2Edge;
      } else {
        selectedCenter = uCol3Center;
        selectedEdge = uCol3Edge;
      }
      rayColorCenter = mix(uCol1Center, selectedCenter, uColorMix);
      rayColorEdge = mix(uCol1Edge, selectedEdge, uColorMix);
    }

    vec2 p0 = vec2(xStart, 0.0);
    float centerOffset = rayIndex - 0.5;
    vec2 p3 = vec2(uAxisCenter + centerOffset * uTerminusSpread, 1.0);
    float targetOffset = centerOffset * uTerminusSpread;
    vec2 p1 = vec2(uAxisCenter + targetOffset * uCp1X, uLift + uCp1Y);
    vec2 p2 = vec2(uAxisCenter + targetOffset * uCp2X, uCp2Y);

    float closestT;
    float dist = distanceToBezier(P, p0, p1, p2, p3, closestT);

    float widthAtT = mix(uOriginSpread, uTerminusSpread, closestT);
    float widthScale = widthAtT / max(uOriginSpread, uTerminusSpread);
    float scaledRayWidth = uRayWidth * widthScale;

    float rayGlow = exp(-dist / max(scaledRayWidth, 1e-5));
    rayGlow = smoothstep(0.0, 0.1, rayGlow) * rayGlow;

    vec3 rayColor = mix(rayColorCenter, rayColorEdge, clamp(P.y, 0.0, 1.0));

    for (float p = 0.0; p < 3.0; p += 1.0) {
      if (p >= uPulseCount) break;
      float pulseTime = uTime * uPulseSpeed + i * 0.2 + p * 0.7;
      float pulsePos = fract(pulseTime);
      if (uReverse > 0.5) {
        pulsePos = 1.0 - pulsePos;
      }
      float pulseDist = abs(closestT - pulsePos);
      float pulseWidthAtT = mix(uOriginSpread, uTerminusSpread, pulsePos);
      float pulseWidthScale = pulseWidthAtT / max(uOriginSpread, uTerminusSpread);
      float scaledPulseWidth = max(uPulseWidth * pulseWidthScale, 1e-5);
      float pulse = exp(-pulseDist / scaledPulseWidth) * rayGlow;

      float trailFade = 0.0;
      if (uReverse > 0.5) {
        float trailDist = closestT - pulsePos;
        if (trailDist > 0.0 && trailDist < uTrailLength) {
          trailFade = (1.0 - trailDist / uTrailLength) * 0.3;
          pulse += trailFade * rayGlow;
          for (int b = 0; b < 5; b++) {
            float blurOffset = trailDist * float(b) / 5.0;
            float blurFade = exp(-blurOffset / (uTrailLength * 0.5)) * uMotionBlur;
            pulse += blurFade * rayGlow * 0.2;
          }
        }
        pulse *= smoothstep(0.0, 0.2, pulsePos);
      } else {
        float trailDist = pulsePos - closestT;
        if (trailDist > 0.0 && trailDist < uTrailLength) {
          trailFade = (1.0 - trailDist / uTrailLength) * 0.3;
          pulse += trailFade * rayGlow;
          for (int b = 0; b < 5; b++) {
            float blurOffset = trailDist * float(b) / 5.0;
            float blurFade = exp(-blurOffset / (uTrailLength * 0.5)) * uMotionBlur;
            pulse += blurFade * rayGlow * 0.2;
          }
        }
        pulse *= smoothstep(1.0, 0.8, pulsePos);
      }

      totalPulseColor += rayColor * pulse;
    }

    float bgGlowDist = dist / max(uRayWidth * 10.0, 1e-5);
    float baseGlowIntensity = exp(-bgGlowDist) * uGlow * 0.15;
    float spreadWeight = smoothstep(0.3, 1.0, closestT) * uGlowSpread;
    float curveWeight = exp(-pow((closestT - 0.5) * 3.0, 2.0)) * uGlowCurve;
    float glowWeight = spreadWeight + curveWeight;
    backgroundGlow += rayColor * baseGlowIntensity * glowWeight;
  }

  float yFade = smoothstep(0.0, 0.15, P.y);
  vec3 finalColor = totalPulseColor * uPulseBrightness * yFade;
  finalColor += backgroundGlow;

  float vignette = 1.0 - smoothstep(0.7, 1.2, length(uv - vec2(0.5)));
  finalColor *= vignette * 0.3 + 0.7;

  finalColor = vec3(1.0) - exp(-max(finalColor, vec3(0.0)) * uExposure);

  float luma = dot(finalColor, vec3(0.2126, 0.7152, 0.0722));
  finalColor = mix(finalColor, vec3(1.0), pow(clamp(luma, 0.0, 1.0), 4.0) * 0.6);

  float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  finalColor += vec3((dn - 0.5) / 255.0);

  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;

const FLOAT_KEYS = [
  'rayCount',
  'rayWidth',
  'originSpread',
  'terminusSpread',
  'lift',
  'cp1X',
  'cp1Y',
  'cp2X',
  'cp2Y',
  'randomness',
  'axisCenter',
  'span',
  'pulseSpeed',
  'pulseCount',
  'pulseWidth',
  'pulseBrightness',
  'trailLength',
  'motionBlur',
  'glow',
  'glowSpread',
  'glowCurve',
  'reverse',
  'exposure',
  'orient',
  'colorMix',
] as const;

const VEC3_KEYS = ['col1Center', 'col1Edge', 'col2Center', 'col2Edge', 'col3Center', 'col3Edge'] as const;

type FloatKey = (typeof FLOAT_KEYS)[number];
type Vec3Key = (typeof VEC3_KEYS)[number];

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  draw: (width: number, height: number, time: number, params: RayParams) => HTMLCanvasElement;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  params: RayParams;
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
  if (!shader) throw new Error('ray-field: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`ray-field compile: ${gl.getShaderInfoLog(shader)}`);
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

  const uName = (key: string) => `u${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  const resolutionLoc = ctx.getUniformLocation(program, 'uResolution');
  const timeLoc = ctx.getUniformLocation(program, 'uTime');
  const floatLocs = new Map<FloatKey, WebGLUniformLocation | null>();
  FLOAT_KEYS.forEach((key) => floatLocs.set(key, ctx.getUniformLocation(program, uName(key))));
  const vec3Locs = new Map<Vec3Key, WebGLUniformLocation | null>();
  VEC3_KEYS.forEach((key) => vec3Locs.set(key, ctx.getUniformLocation(program, uName(key))));

  // Contexts are lost on GPU resets and tab recovery; rebuild on restore
  // rather than leaving every field black.
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    engine = null;
  });

  engine = {
    canvas,
    gl: ctx,
    draw(width, height, time, params) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.viewport(0, 0, width, height);
      ctx.uniform2f(resolutionLoc, width, height);
      ctx.uniform1f(timeLoc, time);
      FLOAT_KEYS.forEach((key) => ctx.uniform1f(floatLocs.get(key) ?? null, params[key]));
      VEC3_KEYS.forEach((key) => {
        const v = params[key];
        ctx.uniform3f(vec3Locs.get(key) ?? null, v[0], v[1], v[2]);
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
export function createRayField(canvas: HTMLCanvasElement, options: RayOptions = {}): RayFieldHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...RAY_PRESETS[options.preset ?? 'converge'], ...options.params },
    dpr: options.dpr ?? Math.min(window.devicePixelRatio || 1, 1),
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
