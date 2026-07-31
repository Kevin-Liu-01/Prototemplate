/**
 * Prismatic light field — raw-WebGL port of the reference shader
 * ("Enter to Other Dimension", sabosugi). The GLSL is preserved verbatim; the
 * original used three.js only as a fullscreen-quad harness, which is why none
 * of it survives here.
 *
 * Anisotropic streaks of thin-film spectrum converge on a deliberate dark
 * center. Brightness accumulates where streaks bunch, so exposureScale is the
 * dimmer: raise it to push the field back under content.
 *
 * CALIBRATION: behind hero content, run exposureScale at 4200 or above. The
 * preset values below are the shader author's originals, tuned for a field
 * shown on its own; at those levels the burst floods edge to edge, the dark
 * center that frames the composition disappears, and the result reads as a
 * muddy multi-hue gradient rather than dispersed light. Preset 2 closings sit
 * lower (2400-3200) because that dome is inherently dimmer.
 *
 * ARCHITECTURE: exactly ONE WebGL context exists for the whole app, no matter
 * how many fields are mounted. Fields register with a shared engine that draws
 * into an offscreen GL canvas and blits the result into each field's own 2D
 * canvas. This is not a micro-optimisation — a context per field exhausted the
 * browser's ~16-context budget after a handful of client-side navigations
 * between directions, after which getContext returned null and every field
 * silently rendered black. One context also means the shader program, quad
 * buffer and uniform lookups are created once per session instead of per field,
 * and a single rAF loop can skip any field that is offscreen or paused.
 */

export type PrismaticParams = {
  initialDepth: number;
  safeMinimum: number;
  fieldTimeRate: number;
  forwardTravelRate: number;
  domainStrength: number;
  domainScale: number;
  domainAttenuation: number;
  cameraFocalLength: number;
  fieldSlope: number;
  fieldDetailScale: number;
  distanceBase: number;
  distanceDepthFactor: number;
  exposureScale: number;
};

export type PrismaticFieldHandle = {
  setParams: (patch: Partial<PrismaticParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type PrismaticOptions = {
  preset?: '1' | '2';
  dpr?: number;
  speed?: number;
  params?: Partial<PrismaticParams>;
};

export const PRISMATIC_PRESETS: Record<'1' | '2', PrismaticParams> = {
  '1': {
    initialDepth: 1.46,
    safeMinimum: 0.0001,
    fieldTimeRate: 0.1,
    forwardTravelRate: 0.23,
    domainStrength: 1.69,
    domainScale: 3.84,
    domainAttenuation: 3.86,
    cameraFocalLength: 0.22,
    fieldSlope: -0.1,
    fieldDetailScale: 4.6,
    distanceBase: 2.6,
    distanceDepthFactor: 0.45,
    exposureScale: 2000.0,
  },
  '2': {
    initialDepth: 3.044,
    safeMinimum: 0.000001,
    fieldTimeRate: 0.1,
    forwardTravelRate: 0.351,
    domainStrength: 2.652,
    domainScale: 3.362,
    domainAttenuation: 3.194,
    cameraFocalLength: 0.321,
    fieldSlope: -0.459,
    fieldDetailScale: 2.276,
    distanceBase: 2.322,
    distanceDepthFactor: 0.515,
    exposureScale: 1673.0,
  },
};

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform float uTime;
uniform float uInitialDepth;
uniform float uSafeMinimum;
uniform float uFieldTimeRate;
uniform float uForwardTravelRate;
uniform float uDomainStrength;
uniform float uDomainScale;
uniform float uDomainAttenuation;
uniform float uCameraFocalLength;
uniform float uFieldSlope;
uniform float uFieldDetailScale;
uniform float uDistanceBase;
uniform float uDistanceDepthFactor;
uniform float uExposureScale;

const int TRACE_STEP_COUNT = 50;
const int TRACE_START_INDEX = 30;
const int DOMAIN_LAYER_COUNT = 3;

vec2 getScreenCoordinates(vec2 fragCoord) {
  vec2 viewport = max(uResolution, vec2(1.0));
  return (2.0 * fragCoord - viewport) / viewport.y;
}

vec3 getViewRay(vec2 screenPosition) {
  return normalize(vec3(screenPosition, uCameraFocalLength));
}

vec3 deformDomain(vec3 samplePosition, float depth, float timeValue, float tracePhase) {
  vec3 warpedPosition = samplePosition;
  for (int layerIndex = 0; layerIndex < DOMAIN_LAYER_COUNT; ++layerIndex) {
    float octave = float(layerIndex + 2);
    float frequency = octave * uDomainScale;
    float attenuation = octave + uDomainAttenuation;
    vec3 phase = warpedPosition.yzx * frequency - depth + timeValue + tracePhase;
    warpedPosition += sin(phase) * (uDomainStrength / attenuation);
  }
  return warpedPosition;
}

float evaluateFieldDistance(vec3 warpedPosition, float localDepth, float rayDepth) {
  float primaryShape = abs(warpedPosition.y + localDepth * uFieldSlope);
  vec3 secondaryShape = sin(warpedPosition - rayDepth) / uFieldDetailScale;
  vec4 fieldVector = vec4(primaryShape, secondaryShape);
  float depthNormalization = uDistanceBase + rayDepth * rayDepth * uDistanceDepthFactor;
  return max(length(fieldVector) / depthNormalization, uSafeMinimum);
}

vec3 getTracePalette(float tracePhase) {
  return 0.9 + sin(tracePhase * 1.3 - vec3(4.8, -0.4, 1.2));
}

vec3 accumulateLight(vec3 palette, float fieldDistance, float rayDepth) {
  float safeDepth = max(rayDepth, uInitialDepth);
  float densityDenominator = max(fieldDistance * fieldDistance * safeDepth, uSafeMinimum);
  vec3 concentratedLight = palette / densityDenominator;
  vec3 depthGlow = fieldDistance * rayDepth / vec3(1.000, 0.812, 0.600);
  return concentratedLight + depthGlow;
}

/*
 * Beam carving. The raymarch produces a continuous streak field; this
 * collects that light into discrete radial beams that sweep slowly around
 * the dark center — three angular harmonics drifting against each other so
 * the pattern never repeats readably. Each channel samples the profile at
 * a slightly rotated angle (dispersion grows with radius), which fringes
 * every beam edge with spectrum while the cores stay coherent.
 */
float beamProfile(float angle, float t) {
  float sweep = pow(0.5 + 0.5 * cos(angle * 7.0 + t * 1.4 + 1.8 * sin(angle * 3.0 - t * 0.6)), 3.0);
  float needle = pow(0.5 + 0.5 * cos(angle * 15.0 - t * 2.1 + 1.7), 6.0);
  float broad = pow(0.5 + 0.5 * cos(angle * 3.0 + t * 0.8), 2.0);
  return sweep * 0.85 + needle * 0.65 + broad * 0.5;
}

vec3 applyBeams(vec3 hdrColor, vec2 screenPosition) {
  float radius = length(screenPosition);
  // Mirrored angle: the left and right lobes carve IDENTICALLY, so the two
  // bursts read as one symmetric pair of prisms.
  float angle = atan(screenPosition.y, abs(screenPosition.x));
  float t = uTime * 0.12;
  float dispersion = 0.035 + 0.05 * radius;
  vec3 beams = vec3(
    beamProfile(angle + dispersion, t),
    beamProfile(angle, t),
    beamProfile(angle - dispersion, t)
  );
  // The rays stream from the SIDES: the carve fades to nothing toward
  // vertical, so no beam ever points down from the top or up from the
  // bottom — those regions keep only the base field's calm.
  float horizontality = pow(max(cos(angle), 0.0), 2.4);
  // The center keeps its calm; the beams own everything outward of it.
  float radial = smoothstep(0.05, 0.6, radius) * horizontality;
  vec3 gain = mix(vec3(1.0), 0.22 + beams * 1.55, radial);
  vec3 carved = hdrColor * gain;
  // Absolute-light cores: where all three channels agree a beam is hot,
  // pour desaturated (white) energy back down the ray so the core reads
  // as light itself rather than a saturated hue.
  float core = beams.r * beams.g * beams.b;
  float luma = dot(hdrColor, vec3(0.2126, 0.7152, 0.0722));
  carved += vec3(luma) * core * 1.35 * radial;
  return carved;
}

vec3 applyToneMapping(vec3 hdrColor) {
  vec3 value = clamp(hdrColor / uExposureScale, vec3(-10.0), vec3(10.0));
  vec3 exponentialValue = exp(2.0 * value);
  vec3 mappedColor = (exponentialValue - 1.0) / max(exponentialValue + 1.0, vec3(uSafeMinimum));
  // Absolute light: hot cores snap toward pure white instead of saturating
  // into a hue, so the brightest beam reads as light itself.
  float luma = dot(mappedColor, vec3(0.2126, 0.7152, 0.0722));
  mappedColor = mix(mappedColor, vec3(1.0), pow(clamp(luma, 0.0, 1.0), 4.0) * 0.6);
  return clamp(mappedColor, 0.0, 1.0);
}

void main() {
  vec2 screenPosition = getScreenCoordinates(gl_FragCoord.xy);
  vec3 rayDirection = getViewRay(screenPosition);
  float fieldTime = uTime * uFieldTimeRate;
  float cameraTravel = uTime * uForwardTravelRate;
  float rayDepth = uInitialDepth;
  vec3 accumulatedColor = vec3(0.0);

  for (int traceIndex = TRACE_START_INDEX; traceIndex < TRACE_STEP_COUNT; ++traceIndex) {
    float tracePhase = float(traceIndex) + 13.0;
    vec3 rayPosition = rayDirection * rayDepth;
    vec3 travelingPosition = rayPosition;
    travelingPosition.z += cameraTravel;
    vec3 warpedPosition = deformDomain(travelingPosition, rayDepth, fieldTime, tracePhase);
    float localDepth = warpedPosition.z - cameraTravel;
    float fieldDistance = evaluateFieldDistance(warpedPosition, localDepth, rayDepth);
    vec3 palette = getTracePalette(tracePhase);
    accumulatedColor += accumulateLight(palette, fieldDistance, rayDepth);
    rayDepth += fieldDistance;
  }

  accumulatedColor = applyBeams(accumulatedColor, screenPosition);
  gl_FragColor = vec4(applyToneMapping(accumulatedColor), 1.0);
}
`;

const UNIFORM_KEYS: (keyof PrismaticParams)[] = [
  'initialDepth',
  'safeMinimum',
  'fieldTimeRate',
  'forwardTravelRate',
  'domainStrength',
  'domainScale',
  'domainAttenuation',
  'cameraFocalLength',
  'fieldSlope',
  'fieldDetailScale',
  'distanceBase',
  'distanceDepthFactor',
  'exposureScale',
];

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  resolutionLoc: WebGLUniformLocation | null;
  timeLoc: WebGLUniformLocation | null;
  paramLocs: Map<keyof PrismaticParams, WebGLUniformLocation | null>;
  /** Draws one frame at the given size and returns the GL canvas to blit from. */
  draw: (width: number, height: number, time: number, params: PrismaticParams) => HTMLCanvasElement;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  params: PrismaticParams;
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
  if (!shader) throw new Error('prismatic-field: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`prismatic-field compile: ${gl.getShaderInfoLog(shader)}`);
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
      // The engine canvas is read back via drawImage in the same task as the
      // draw call; without this the buffer may already be cleared.
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
  const paramLocs = new Map<keyof PrismaticParams, WebGLUniformLocation | null>();
  UNIFORM_KEYS.forEach((key) => {
    paramLocs.set(key, ctx.getUniformLocation(program, `u${key.charAt(0).toUpperCase()}${key.slice(1)}`));
  });

  // Contexts are lost on GPU resets and on tab recovery; rebuild on restore
  // rather than leaving every field black.
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    engine = null;
  });

  engine = {
    canvas,
    gl: ctx,
    resolutionLoc,
    timeLoc,
    paramLocs,
    draw(width, height, time, params) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.viewport(0, 0, width, height);
      ctx.uniform2f(resolutionLoc, width, height);
      ctx.uniform1f(timeLoc, time);
      UNIFORM_KEYS.forEach((key) => ctx.uniform1f(paramLocs.get(key) ?? null, params[key]));
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
  // Skip everything the viewer cannot see: a paused field, one scrolled out of
  // view, or a backgrounded tab. Most pages mount two fields and show one.
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
 * Registers a field. Returns null only when WebGL is unavailable, in which case
 * the caller's canvas is left untouched and the parent's own background shows.
 */
export function createPrismaticField(
  canvas: HTMLCanvasElement,
  options: PrismaticOptions = {}
): PrismaticFieldHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...PRISMATIC_PRESETS[options.preset ?? '1'], ...options.params },
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

  if (reduced) renderSubscriber(sub, 10);
  else schedule();

  return {
    setParams(patch) {
      Object.assign(sub.params, patch);
      if (!sub.running) renderSubscriber(sub, 10);
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
    renderStatic(time = 10) {
      renderSubscriber(sub, time);
    },
    destroy() {
      sub.observer?.disconnect();
      subscribers.delete(sub);
      // The engine context is deliberately kept for the session: it is a single
      // context, and tearing it down per unmount is what made repeated
      // navigation exhaust the browser's context budget.
    },
  };
}
