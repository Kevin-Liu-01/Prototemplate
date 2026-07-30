/**
 * Brushed-graphite sheen — an anisotropic machined sheet, achromatic.
 *
 * The material is built from three luminance terms and nothing else: a sheet
 * ground a step below paper (a plate is a different stock than the page it is
 * set into); horizontal micro-grain — one ~1px scratch stroke per 2–3px row,
 * broken along its length so it reads as brushing rather than ruling; and ONE
 * specular band on a fixed diagonal axis, sweeping the sheet on a long period.
 * The band answers the grain — scratch strokes catch the light harder than the
 * ground between them — which is what separates a brushed sheen from a
 * gradient. No fBm as visible texture, no chroma: every output value is the
 * paper color times a scalar.
 *
 * The headline cell is the flip: inside a DOM-measured rectangle the grain
 * runs 90° and the specular axis rotates with it, so the sweep crosses that
 * one cell at a different moment and on a different diagonal — the interaction
 * is material anisotropy, not a mask.
 *
 * ARCHITECTURE — copied deliberately from chroma-flow/lib/flow-field.ts:
 * exactly ONE WebGL context exists for this module for the whole session, no
 * matter how many fields mount. Per-component contexts exhausted Chrome's
 * ~16-context budget after a dozen client-side navigations and every canvas
 * went silently black. Subscribers register here; a single engine draws into
 * one offscreen GL canvas and blits into each subscriber's own 2D canvas.
 * Never call canvas.getContext('webgl*') from a component.
 */

export type SheenParams = {
  /** CSS px between scratch rows (the grain pitch). */
  pitch: number;
  /** CSS px stroke gauge of one scratch. */
  gauge: number;
  /** CSS px correlation length of a scratch along the grain. */
  streak: number;
  /** Luminance drop of a scratch below the sheet ground, 0..1. */
  grainDepth: number;
  /** Sheet ground as a multiple of paper luminance (a step below 1). */
  sheet: number;
  /** Specular band width as a fraction of the sheet's projected span. */
  bandWidth: number;
  /** Peak luminance lift of the band above the sheet ground. */
  bandGain: number;
  /** Seconds per full sweep of the band across the sheet. */
  period: number;
  /** Sweep axis, canvas space, y-down. Fixed — the machine has one light. */
  axis: [number, number];
  paper: [number, number, number];
  /** Grain-flip rect center in CSS px, canvas-relative, y-down. */
  flipCenter: [number, number];
  /** Grain-flip rect half-size in CSS px; below 1 disables the flip. */
  flipHalf: [number, number];
  /**
   * Multiplier on the specular lift INSIDE the flip rect, 0..1. The headline
   * sits on that rect: at full gain the band under the type clipped toward
   * white and the sweep read as a rendering fault rather than a material. The
   * grain flip and the rotated axis stay — only the lift is gated.
   */
  flipGain: number;
};

export type SheenHandle = {
  setParams: (patch: Partial<SheenParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type SheenOptions = {
  dpr?: number;
  speed?: number;
  params?: Partial<SheenParams>;
};

export const SHEEN_DEFAULTS: SheenParams = {
  /* 3.1/165/0.034: the first cut (2.6/130/0.05) read as streaky noise at
     desktop width — the ground has to be calmer than anything seated on it.
     Coarser pitch, longer correlation, shallower cut. */
  pitch: 3.1,
  gauge: 0.9,
  streak: 165,
  grainDepth: 0.034,
  /* 0.955: at 0.975 the sheet was indistinguishable from the page and the
     plate read as ruled lines on paper; at 0.92 the hero went silver-grey and
     the ink ramp lost a step of contrast under the headline. */
  sheet: 0.955,
  /* FWHM ≈ 1.03 × bandWidth × span ≈ 14% of the hero height on the default
     axis — inside the 12–20% brief. */
  bandWidth: 0.085,
  bandGain: 0.09,
  period: 16,
  axis: [0.42, 1],
  paper: [0.984, 0.984, 0.98],
  flipCenter: [0, 0],
  flipHalf: [0, 0],
  flipGain: 0.4,
};

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPitch;
uniform float uGauge;
uniform float uStreak;
uniform float uGrainDepth;
uniform float uSheet;
uniform float uBandWidth;
uniform float uBandGain;
uniform float uPeriod;
uniform vec2 uAxis;
uniform vec3 uPaper;
uniform vec2 uFlipCenter;
uniform vec2 uFlipHalf;
uniform float uFlipGain;

out vec4 outColor;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 q = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, q.x), mix(c, d, q.x), q.y);
}

void main() {
  /* y-down pixel coords so DOM measurements map directly. */
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);

  /* The grain-flip cell. A hard step, not a feather: the rect is measured off
     a real bento cell, so its edge sits under the cell's own hairline and the
     change of grain reads as two machined parts meeting, not as a mask. */
  float flip = 0.0;
  if (uFlipHalf.x > 1.0 && uFlipHalf.y > 1.0) {
    vec2 fq = abs(px - uFlipCenter) - uFlipHalf;
    flip = step(max(fq.x, fq.y), 0.0);
  }

  /* Grain coordinates: horizontal scratches by default, rotated 90° inside
     the flip cell by swapping the axes. */
  vec2 gpx = mix(px, px.yx, flip);

  /* One scratch stroke per pitch-row, broken along its length. The break gate
     is sampled per row (rows jump whole noise cells) so neighbouring rows
     never share segment boundaries — aligned breaks read as a woven texture,
     which is a different material. */
  float row = floor(gpx.y / uPitch);
  float rowSeed = hash11(row + 13.7);
  float along = (gpx.x + rowSeed * 251.0) / uStreak;
  float gate = smoothstep(0.34, 0.62, vnoise(vec2(along, row * 7.13)));
  float centre = abs(fract(gpx.y / uPitch) - 0.5) * uPitch;
  float strokeMask = 1.0 - smoothstep(uGauge * 0.5 - 0.35, uGauge * 0.5 + 0.6, centre);
  /* Narrow depth range: at 0.55+0.45 neighbouring rows differed enough to
     read as banding once the specular band lit them. */
  float depthVar = 0.72 + 0.28 * hash11(row * 3.31 + 1.7);
  float scratch = strokeMask * gate * depthVar;

  /* No low-frequency smudge term: an earlier build shaded the sheet with a
     broad vnoise pass and even at ±1% luminance it read as cloudy, dirty
     glass inside the plate's lifted cells. The ground is the scratch rows
     and the band, nothing else — machined, not weathered. */
  float lum = uSheet - scratch * uGrainDepth;

  /* ONE specular band on a fixed diagonal axis. Inside the flip cell the
     axis rotates with the grain, so the band crosses that cell at a different
     moment, on a different diagonal — anisotropy doing the interaction. */
  vec2 axis = normalize(uAxis);
  vec2 ax = mix(axis, vec2(axis.y, -axis.x), flip);
  float span = dot(uResolution, abs(ax));
  float minProj = min(ax.x, 0.0) * uResolution.x + min(ax.y, 0.0) * uResolution.y;
  float s01 = (dot(px, ax) - minProj) / max(span, 1.0);
  float c = mix(-uBandWidth * 1.7, 1.0 + uBandWidth * 1.7, fract(uTime / uPeriod));
  float d = (s01 - c) / max(uBandWidth, 1e-4);
  float band = exp(-2.6 * d * d);

  /* The scratches answer the light harder than the ground between them —
     without this the band is a gradient, not a sheen. Inside the flip cell
     the lift is gated (uFlipGain): the headline sits there, and type must
     never drop below comfortable contrast when the band crosses it. */
  float response = 0.52 + 0.48 * gate * depthVar;
  float lift = uBandGain * mix(1.0, clamp(uFlipGain, 0.0, 1.0), flip);
  lum += lift * band * response * (1.0 + strokeMask * 0.5);

  outColor = vec4(clamp(uPaper * lum, 0.0, 1.0), 1.0);
}
`;

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  draw: (width: number, height: number, time: number, params: SheenParams, dpr: number) => HTMLCanvasElement;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  params: SheenParams;
  dpr: number;
  speed: number;
  running: boolean;
  visible: boolean;
  startTime: number;
  observer?: IntersectionObserver;
};

/* Static frame time: fract(7/16) puts the band across the upper middle of the
   sheet — a reduced-motion still has to show the sweep mid-plate, not a bare
   grey sheet. */
const STATIC_TIME = 7;

let engine: Engine | null = null;
let engineFailed = false;
const subscribers = new Set<Subscriber>();
let frameId = 0;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('graphite-sheen: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`graphite-sheen compile: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

/** Builds the one shared context, or returns null once we know it cannot work. */
function getEngine(): Engine | null {
  if (engine) return engine;
  if (engineFailed) return null;

  const canvas = document.createElement('canvas');
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
      // Read back via drawImage in the same task as the draw call; without
      // this the buffer may already be cleared.
      preserveDrawingBuffer: true,
    }) as WebGL2RenderingContext | null;
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

  const loc = (name: string) => ctx.getUniformLocation(program, name);
  const uResolution = loc('uResolution');
  const uTime = loc('uTime');
  const uPitch = loc('uPitch');
  const uGauge = loc('uGauge');
  const uStreak = loc('uStreak');
  const uGrainDepth = loc('uGrainDepth');
  const uSheet = loc('uSheet');
  const uBandWidth = loc('uBandWidth');
  const uBandGain = loc('uBandGain');
  const uPeriod = loc('uPeriod');
  const uAxis = loc('uAxis');
  const uPaper = loc('uPaper');
  const uFlipCenter = loc('uFlipCenter');
  const uFlipHalf = loc('uFlipHalf');
  const uFlipGain = loc('uFlipGain');

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    engine = null;
  });

  engine = {
    canvas,
    gl: ctx,
    draw(width, height, time, params, dpr) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.viewport(0, 0, width, height);
      ctx.uniform2f(uResolution, width, height);
      ctx.uniform1f(uTime, time);
      ctx.uniform1f(uPitch, params.pitch * dpr);
      ctx.uniform1f(uGauge, params.gauge * dpr);
      ctx.uniform1f(uStreak, params.streak * dpr);
      ctx.uniform1f(uGrainDepth, params.grainDepth);
      ctx.uniform1f(uSheet, params.sheet);
      ctx.uniform1f(uBandWidth, params.bandWidth);
      ctx.uniform1f(uBandGain, params.bandGain);
      ctx.uniform1f(uPeriod, params.period);
      ctx.uniform2f(uAxis, params.axis[0], params.axis[1]);
      ctx.uniform3f(uPaper, params.paper[0], params.paper[1], params.paper[2]);
      ctx.uniform2f(uFlipCenter, params.flipCenter[0] * dpr, params.flipCenter[1] * dpr);
      ctx.uniform2f(uFlipHalf, params.flipHalf[0] * dpr, params.flipHalf[1] * dpr);
      ctx.uniform1f(uFlipGain, params.flipGain);
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
  const source = active.draw(width, height, time, sub.params, sub.dpr);
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
 * Registers a sheet. Returns null only when WebGL2 is unavailable, in which
 * case the caller's canvas is left untouched and the parent's own paper shows.
 */
export function createGraphiteSheen(
  canvas: HTMLCanvasElement,
  options: SheenOptions = {}
): SheenHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...SHEEN_DEFAULTS, ...options.params },
    dpr: options.dpr ?? Math.min(window.devicePixelRatio || 1, 2),
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
      if (reduced || sub.running) return;
      sub.running = true;
      sub.startTime = performance.now();
      schedule();
    },
    renderStatic(time = STATIC_TIME) {
      renderSubscriber(sub, time);
    },
    destroy() {
      sub.observer?.disconnect();
      subscribers.delete(sub);
      // The engine context is deliberately kept for the session — tearing it
      // down per unmount is what exhausted the browser's context budget.
    },
  };
}
