/**
 * Ink flow-field — curl-noise streamlines drawn as doubled ribbons.
 *
 * The mathematics is the motif: in 2D, an incompressible flow's streamlines
 * are exactly the level sets of its stream function ψ. We build ψ from a
 * uniform stream deflected around an elliptical obstacle (classic potential
 * flow past a cylinder, stretched) and perturb it with drifting fBm — curl
 * noise by construction, since we differentiate ψ rather than the noise. Every
 * integer level of ψ is rendered as TWO parallel strokes at constant screen
 * gauge (stroke 1.5px, gap 3px — the brand's doubled thread, liquid), using
 * the screen-space derivative of ψ to hold the gauge regardless of how the
 * field compresses. Ribbons taper to needle points where the flow stalls —
 * endings are drawn, never alpha-faded. A restrained thin-film chroma rides
 * the ribbons in slow drifting runs, excluded from the clearing's rim so it
 * never pools into a ring around the type.
 *
 * ARCHITECTURE — the hard lesson from this codebase: exactly ONE WebGL
 * context exists for this module for the whole session, no matter how many
 * fields mount. Per-component contexts exhausted Chrome's ~16-context budget
 * after a dozen client-side navigations and every canvas went silently black.
 * Subscribers register here; a single engine draws into one offscreen GL
 * canvas and blits into each subscriber's own 2D canvas. Never call
 * canvas.getContext('webgl*') from a component.
 */

export type FlowParams = {
  /** CSS px between ribbon centerlines in the undisturbed stream. */
  spacing: number;
  /** CSS px stroke width of each thread of the pair. */
  gauge: number;
  /** CSS px gap between the two threads. */
  gap: number;
  /** Noise amplitude in ribbon-index units (how far ribbons wander). */
  amp: number;
  /** Downstream drift rate of the perturbation field. */
  drift: number;
  /** 0..1 strength of the spectral pass where the flow runs fast. */
  chroma: number;
  /** 1 = chroma excluded from the clearing's rim; 0 = allowed anywhere. */
  chromaLocal: number;
  /** Max ink coverage of a stroke core, 0..1. */
  inkAlpha: number;
  ink: [number, number, number];
  paper: [number, number, number];
  /** Void center in CSS px, canvas-relative, y-down. */
  center: [number, number];
  /** Physics ellipse radii in CSS px; below 2 disables the void entirely. */
  radii: [number, number];
  /** Half-size of the carved content box in CSS px (the hard paper cut). */
  half: [number, number];
};

export type FlowFieldHandle = {
  setParams: (patch: Partial<FlowParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type FlowOptions = {
  dpr?: number;
  speed?: number;
  params?: Partial<FlowParams>;
};

export const FLOW_DEFAULTS: FlowParams = {
  spacing: 26,
  gauge: 1.5,
  gap: 3,
  amp: 1.5,
  drift: 0.5,
  chroma: 0.6,
  chromaLocal: 1,
  inkAlpha: 0.66,
  ink: [0.059, 0.067, 0.075],
  paper: [0.984, 0.984, 0.98],
  center: [0, 0],
  radii: [0, 0],
  half: [0, 0],
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
uniform vec2 uCenter;
uniform vec2 uRadii;
uniform vec2 uHalf;
uniform float uSpacing;
uniform float uGauge;
uniform float uGap;
uniform float uAmp;
uniform float uDrift;
uniform float uChroma;
uniform float uChromaLocal;
uniform float uInkAlpha;
uniform vec3 uInk;
uniform vec3 uPaper;

out vec4 outColor;

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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(11.7, 5.1);
    a *= 0.5;
  }
  return v;
}

/* Signed distance to a rounded rectangle centered at the origin. */
float roundRect(vec2 p, vec2 half_, float r) {
  vec2 q = abs(p) - half_ + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  /* y-down pixel coords so DOM measurements map directly. */
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);

  bool voidOn = uRadii.x > 2.0 && uRadii.y > 2.0;
  vec2 uv = voidOn ? (px - uCenter) / uRadii : vec2(0.0);
  float r2 = voidOn ? dot(uv, uv) : 1e6;

  /* Stream function, in ribbon-index units: far from the obstacle the
     spacing between integer levels is exactly uSpacing pixels. */
  float psi;
  if (voidOn) {
    float safe = max(r2, 0.32);
    psi = uv.y * (1.0 - 1.0 / safe) * (uRadii.y / uSpacing);
  } else {
    psi = (px.y - uCenter.y) / uSpacing;
  }

  /* Drifting fBm perturbation — damped near the void so the type stays calm,
     but only just: the envelope closes right past the rim so the curl
     character survives at every viewport (the r2 mobile still degenerated to
     smooth rings because the damping radius covered the whole canvas).
     The small-scale layer is deliberately weak — at 0.85 it scribbled and
     pinched neighbouring ribbons into three-line collisions mid-field. */
  float env = voidOn ? smoothstep(1.0, 2.0, r2) : 1.0;
  vec2 np = px / (uSpacing * vec2(6.5, 3.6));
  np.x -= uTime * uDrift;
  vec2 np2 = px / (uSpacing * vec2(14.0, 8.0));
  np2.x -= uTime * uDrift * 0.55;
  float n = fbm(np) - 0.5;
  float n2 = fbm(np2 + vec2(7.31, 2.17)) - 0.5;
  psi += (n * 0.45 + n2 * 2.25) * uAmp * env;

  /* Screen-space distance to the nearest streamline, in pixels. */
  float s = psi;
  float gpx = max(length(vec2(dFdx(s), dFdy(s))), 1e-6);
  float dpx = abs(s - (floor(s + 0.5))) / gpx;

  /* Presence follows flow speed: ribbons end only at genuine stagnation and
     where they would compress below legible spacing. */
  float spacingPx = 1.0 / gpx;
  float rel = uSpacing / max(spacingPx, 1e-3);
  float presence = smoothstep(0.16, 0.34, rel);
  float minPx = (uGauge * 2.0 + uGap) * 1.9;
  presence *= smoothstep(minPx * 0.6, minPx, spacingPx);

  /* A dying ribbon ends as a NEEDLE, not a smear: the gauge thins to a floor
     that stays above one physical pixel, the pair tightens slightly, and a
     short hard gate cuts the line while its ink is still full-strength. (The
     r2 build tapered the gauge to a quarter-pixel over a long alpha ramp and
     every ending dissolved into a grey single-stroke tail.) */
  float gaugePx = uGauge * mix(0.55, 1.0, presence);
  float off = (uGap + uGauge) * 0.5 * mix(0.78, 1.0, presence);
  float t = abs(dpx - off);
  float aa = 0.7;
  float cover = 1.0 - smoothstep(gaugePx * 0.5 - aa * 0.5, gaugePx * 0.5 + aa, t);
  cover *= smoothstep(0.30, 0.40, presence);

  if (voidOn) {
    /* Hide the dipole interior plus the boundary layer. The cut is NARROW and
       sits just past the compressed zone — boundary streamlines are clipped
       tangentially where they meet the clearing, so the calm reads as the
       flow's own doing rather than an erased hole. Kept tight: at 1.28–1.42
       the clearing swallowed half the hero viewport. */
    cover *= smoothstep(1.04, 1.14, r2);
    float sd = roundRect(px - uCenter, uHalf + vec2(20.0, 14.0), 36.0);
    cover *= smoothstep(2.0, 12.0, sd);
  }

  /* One restrained chroma pass, distributed ALONG the ribbons: slow drifting
     fbm runs pick up a thin-film sheen mid-field. Keyed to flow speed it
     pooled into a rainbow ring hugging the clearing — banned territory — so
     with uChromaLocal=1 the tint is excluded from the clearing's rim instead.
     The rim exclusion is a step, not a blanket: at 1.4–3.0 radii it muted the
     entire visible field and the light hero came out achromatic. */
  /* NOTE: "patch" is a reserved word in GLSL ES 3.00 — hence "sheen". */
  vec2 cp = px / (uSpacing * vec2(16.0, 7.0));
  cp.x -= uTime * uDrift * 0.4;
  float sheen = fbm(cp + vec2(3.7, 9.2));
  float c = uChroma * smoothstep(0.44, 0.68, sheen);
  if (voidOn) {
    c *= mix(1.0, smoothstep(1.15, 1.9, r2), uChromaLocal);
  }
  /* Jewel-tone ink, not rainbow light: the spectral pass keeps the ribbon a
     drawn line — saturated, capped well below paper — so the color reads as
     pigment in the ink rather than a glow on the page. */
  vec3 spec = 0.5 + 0.5 * cos(6.28318 * (s * 0.045 + uTime * 0.01 + vec3(0.0, 0.345, 0.665)));
  spec = mix(vec3(dot(spec, vec3(0.299, 0.587, 0.114))), spec, 0.95);
  vec3 lineCol = mix(uInk, spec * 0.7 + uInk * 0.1, clamp(c, 0.0, 1.0));

  float aOut = clamp(cover * uInkAlpha, 0.0, 1.0);
  outColor = vec4(mix(uPaper, lineCol, aOut), 1.0);
}
`;

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  draw: (width: number, height: number, time: number, params: FlowParams, dpr: number) => HTMLCanvasElement;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  params: FlowParams;
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

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('flow-field: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`flow-field compile: ${gl.getShaderInfoLog(shader)}`);
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
      powerPreference: 'high-performance',
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
  const uCenter = loc('uCenter');
  const uRadii = loc('uRadii');
  const uHalf = loc('uHalf');
  const uSpacing = loc('uSpacing');
  const uGauge = loc('uGauge');
  const uGap = loc('uGap');
  const uAmp = loc('uAmp');
  const uDrift = loc('uDrift');
  const uChroma = loc('uChroma');
  const uChromaLocal = loc('uChromaLocal');
  const uInkAlpha = loc('uInkAlpha');
  const uInk = loc('uInk');
  const uPaper = loc('uPaper');

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
      ctx.uniform2f(uCenter, params.center[0] * dpr, params.center[1] * dpr);
      ctx.uniform2f(uRadii, params.radii[0] * dpr, params.radii[1] * dpr);
      ctx.uniform2f(uHalf, params.half[0] * dpr, params.half[1] * dpr);
      ctx.uniform1f(uSpacing, params.spacing * dpr);
      ctx.uniform1f(uGauge, params.gauge * dpr);
      ctx.uniform1f(uGap, params.gap * dpr);
      ctx.uniform1f(uAmp, params.amp);
      ctx.uniform1f(uDrift, params.drift);
      ctx.uniform1f(uChroma, params.chroma);
      ctx.uniform1f(uChromaLocal, params.chromaLocal);
      ctx.uniform1f(uInkAlpha, params.inkAlpha);
      ctx.uniform3f(uInk, params.ink[0], params.ink[1], params.ink[2]);
      ctx.uniform3f(uPaper, params.paper[0], params.paper[1], params.paper[2]);
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
 * Registers a field. Returns null only when WebGL2 is unavailable, in which
 * case the caller's canvas is left untouched and the parent's own paper shows.
 */
export function createFlowField(
  canvas: HTMLCanvasElement,
  options: FlowOptions = {}
): FlowFieldHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...FLOW_DEFAULTS, ...options.params },
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

  if (reduced) renderSubscriber(sub, 8);
  else schedule();

  return {
    setParams(patch) {
      Object.assign(sub.params, patch);
      if (!sub.running) renderSubscriber(sub, 8);
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
    renderStatic(time = 8) {
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
