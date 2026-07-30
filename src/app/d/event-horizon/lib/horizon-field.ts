/**
 * Horizon field — a purpose-built event-horizon shader: gravitational light
 * bending around a circular horizon, rendered in ONE canvas that covers the
 * dark disc plus a generous annulus of the surrounding paper.
 *
 * The optics are a stylised point-mass lens with the Einstein radius pinned to
 * the rim. Every pixel at image radius r (in rim units) samples the source
 * plane at rs = r − w(r)/r: at the rim rs → 0, so light from the whole
 * accretion field piles onto a thin brilliant photon ring; just outside, the
 * tangential magnification r/|rs| stretches the streak field into arcs that
 * visibly WRAP the horizon; just inside, rs goes negative and the flipped
 * secondary image forms a fainter ghost band before the core swallows
 * everything. w(r) is 1 inside and decays smoothly to 0 by uDeflEnd, so the
 * warp has compact support and the canvas composites seamlessly with the flat
 * paper around it.
 *
 * Layers, back to front:
 *   1. the PAGE, bent — the hero's ruled hairlines are re-rendered here at the
 *      lensed coordinate, so the paper's own structure bows and finally wraps
 *      into arcs against the rim (a CSS mask on the hero's rule layer opens a
 *      feathered hole under this canvas; shader rules fade back in over the
 *      same band, where the deflection is already ~0, so the handoff is
 *      invisible). Where lensing compresses many rules together the coverage
 *      collapses to a low ink wash instead of a false solid;
 *   2. the hero's three concentric guide rings, sampled through the same lens
 *      so they shift outward and crowd toward the ring;
 *   3. the dark core — genuinely dark, holding the white center stack;
 *   4. the accretion streak field: thin-film cosine palette (the house trace
 *      palette), tone-mapped with the prismatic tanh curve, doppler-weighted so
 *      one flank runs marginally brighter and warmer;
 *   5. the photon ring itself: a near-white hairline over a warm spectral glow
 *      whose bleed carries the rim light onto the paper.
 *
 * Everything is analytic — no noise textures, no marching. Output is
 * premultiplied alpha: the canvas is transparent wherever there is nothing to
 * draw, so the conveyor grids stay visible right up to their own extinction.
 *
 * ARCHITECTURE — the house rule: exactly ONE WebGL context for this module per
 * session, shared by every subscriber (per-component contexts exhausted the
 * browser's ~16-context budget and went silently black). Subscribers register
 * here; the engine draws into one offscreen GL canvas and blits into each
 * subscriber's own 2D canvas.
 */

export type HorizonParams = {
  /** Disc center in CSS px, canvas-relative, y-down. */
  center: [number, number];
  /** Horizon (rim) radius in CSS px; below 2 the shader draws nothing. */
  radius: number;
  /** Hero-space CSS-px position of this canvas's top-left corner. */
  worldOrigin: [number, number];
  /** CSS px between the page's ruled hairlines (must match the CSS layer). */
  pitch: number;
  /** CSS px stroke gauge for rules, rings and the ring hairline. */
  gauge: number;
  /** Ink coverage of a ruled hairline (matched to the CSS rule layer). */
  ruleAlpha: number;
  /** Where shader-drawn rules start fading out to the CSS layer, in rim units. */
  ruleFadeIn: number;
  /** Where shader-drawn rules are fully handed to the CSS layer. */
  ruleFadeOut: number;
  /** The hero's concentric guide-ring radii, in rim units. */
  ringRadii: [number, number, number];
  /** Ink coverage of each guide ring. */
  ringAlpha: [number, number, number];
  /** Deflection support ends here (rim units); beyond it the paper is flat. */
  deflEnd: number;
  /** Frame-drag twist of the streak field near the ring. */
  swirl: number;
  /** HDR gain on the accretion field before tone mapping. */
  lightGain: number;
  /** Tone-map knee — higher pushes the field back under content. */
  exposure: number;
  /** Doppler beaming weight: 0 symmetric, ~0.5 one flank brighter/warmer. */
  doppler: number;
  /** Direction of the approaching (bright) flank, radians, y-down screen. */
  dopplerAngle: number;
  /** Rim-radius breathe amplitude (fraction) and period (seconds). */
  breathe: number;
  period: number;
  core: [number, number, number];
  ink: [number, number, number];
};

export type HorizonFieldHandle = {
  setParams: (patch: Partial<HorizonParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type HorizonOptions = {
  dpr?: number;
  speed?: number;
  params?: Partial<HorizonParams>;
};

export const HORIZON_DEFAULTS: HorizonParams = {
  center: [0, 0],
  radius: 0,
  worldOrigin: [0, 0],
  pitch: 44,
  gauge: 1,
  ruleAlpha: 0.07,
  ruleFadeIn: 1.46,
  ruleFadeOut: 1.66,
  ringRadii: [1.24, 1.55, 1.94],
  ringAlpha: [0.09, 0.063, 0.037],
  deflEnd: 1.55,
  swirl: 1.15,
  lightGain: 34,
  exposure: 30,
  doppler: 0.5,
  /* Lower-left flank approaches — the Gargantua read, y-down screen angle. */
  dopplerAngle: 2.55,
  breathe: 0.006,
  period: 7.2,
  core: [0.02, 0.027, 0.043],
  ink: [0.059, 0.067, 0.075],
};

/* An instant where the streak field is mid-arc and the breathe term is near
   zero — the reduced-motion still and any pre-measure frame use this. */
const STATIC_TIME = 11.3;

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
uniform float uRadius;
uniform vec2 uWorldOrigin;
uniform float uPitch;
uniform float uGauge;
uniform float uRuleAlpha;
uniform float uRuleFadeIn;
uniform float uRuleFadeOut;
uniform vec3 uRingRadii;
uniform vec3 uRingAlpha;
uniform float uDeflEnd;
uniform float uSwirl;
uniform float uLightGain;
uniform float uExposure;
uniform float uDoppler;
uniform vec2 uDopplerDir;
uniform float uBreathe;
uniform float uPeriod;
uniform vec3 uCore;
uniform vec3 uInk;

out vec4 outColor;

const float PI = 3.14159265;
const float TAU = 6.2831853;

/* The house thin-film trace palette (prismatic-field's getTracePalette). */
vec3 pal(float phase) {
  return 0.9 + sin(phase * 1.3 - vec3(4.8, -0.4, 1.2));
}

/* The house tanh tone map (prismatic-field's applyToneMapping). */
vec3 toneMap(vec3 hdr) {
  vec3 v = clamp(hdr / uExposure, vec3(-10.0), vec3(10.0));
  vec3 e = exp(2.0 * v);
  return clamp((e - 1.0) / max(e + 1.0, vec3(1e-4)), 0.0, 1.0);
}

/* Standard OVER onto a premultiplied accumulator. */
void lay(inout vec4 acc, vec3 rgb, float a) {
  acc.rgb = rgb * a + acc.rgb * (1.0 - a);
  acc.a = a + acc.a * (1.0 - a);
}

float stroke(float distPx, float gaugePx) {
  return 1.0 - smoothstep(gaugePx * 0.5 - 0.35, gaugePx * 0.5 + 0.9, distPx);
}

void main() {
  /* y-down pixel coords so DOM measurements map directly. */
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);

  float on = step(2.0, uRadius);
  float R = max(uRadius, 1.0) * (1.0 + uBreathe * sin(uTime * TAU / uPeriod));
  vec2 d = px - uCenter;
  float rc = length(d);
  float r = rc / R;
  vec2 nd = d / max(rc, 1e-4);
  float theta = atan(d.y, d.x);

  /* Point-mass lens with the Einstein radius pinned to the rim. Outside, the
     deflection decays with compact support so the paper is exactly flat again
     before the canvas edge; inside, the full map produces the flipped
     secondary image. */
  float wOut = pow(1.0 - smoothstep(1.0, uDeflEnd, r), 1.6);
  float w = mix(wOut, 1.0, step(r, 1.0)) * on;
  float rs = r - w / max(r, 1e-3);

  /* ---- layer 1: the page's ruled hairlines, seen through the lens ---- */
  vec2 ps = nd * rs;
  float worldY = uWorldOrigin.y + uCenter.y + ps.y * R;
  float rho = (worldY - uGauge * 0.5) / uPitch;
  float gpx = max(length(vec2(dFdx(rho), dFdy(rho))), 1e-6);
  float rulePx = abs(rho - floor(rho + 0.5)) / gpx;
  float ruleCover = stroke(rulePx, uGauge);
  /* Where lensing packs many rules per pixel, resolve to their mean ink
     coverage instead of a false solid: crowd → gauge/spacing wash. */
  float density = clamp(uGauge * gpx, 0.0, 1.0);
  float crowd = smoothstep(0.3, 0.75, density);
  float ruleA = uRuleAlpha * mix(ruleCover, density, crowd);
  ruleA *= 1.0 - smoothstep(uRuleFadeIn, uRuleFadeOut, r);
  ruleA *= on;

  /* ---- layer 2: the hero's concentric guide rings, lensed the same way ---- */
  float grs = max(length(vec2(dFdx(rs), dFdy(rs))), 1e-6);
  float ringsA = 0.0;
  for (int i = 0; i < 3; i++) {
    float srcR = i == 0 ? uRingRadii.x : (i == 1 ? uRingRadii.y : uRingRadii.z);
    float aI = i == 0 ? uRingAlpha.x : (i == 1 ? uRingAlpha.y : uRingAlpha.z);
    float distPx = abs(rs - srcR) / grs;
    ringsA = max(ringsA, stroke(distPx, uGauge) * aI);
  }
  /* Same handoff as the rules: the DOM draws the flat outer arcs of these
     rings under a matching CSS mask, the shader owns the bent inner parts. */
  ringsA *= on * step(1.0, r) * (1.0 - smoothstep(uRuleFadeIn, uRuleFadeOut, r));

  /* ---- layer 4 ingredients: the accretion streak field, source plane ---- */
  float s = abs(rs);
  float thS = theta + step(rs, 0.0) * PI;
  float sw = uSwirl / (s + 0.32);
  float t = uTime;
  float band1 = sin(thS * 3.0 + sw + s * 5.0 - t * 0.52 + 1.7);
  float band2 = sin(thS * 7.0 - sw * 1.6 - s * 9.0 + t * 0.74);
  float band3 = sin(thS * 13.0 + s * 16.0 - t * 1.12 + 4.1);
  float streak = 0.5 + 0.5 * (0.56 * band1 + 0.30 * band2 + 0.14 * band3);
  streak = streak * streak * streak;
  float prof = exp(-s * s * 1.35);
  float mu = clamp(1.0 / (s + 0.05), 0.0, 13.0);
  float flank = dot(nd, uDopplerDir);
  float dop = 1.0 + uDoppler * flank;
  /* Inside: hold the core genuinely dark under the center stack; outside:
     the arcs hug the rim and die within a fraction of a radius. */
  float env = mix(exp(-(r - 1.0) * 5.2), smoothstep(0.34, 0.82, r), step(r, 1.0));
  float I = prof * (0.3 + 0.95 * streak) * mu * dop * env * on;
  vec3 hdr = pal(s * 2.6 + thS * 0.7 + streak * 2.1 + 0.35 * flank + 0.4) * I * uLightGain;

  /* ---- layer 5 ingredients: the photon ring ---- */
  float ringPx = rc - R;
  float hair = exp(-0.5 * pow(ringPx / (1.35 * uGauge), 2.0));
  float glow = exp(-abs(ringPx) / (7.5 * uGauge));
  float bleed = exp(-abs(ringPx) / (27.0 * uGauge));
  float rdop = 1.0 + 0.55 * uDoppler * flank;
  hdr += (hair * 3.4 * vec3(1.0, 0.985, 0.95) +
          glow * 1.05 * (0.62 + 0.38 * pal(0.5 * flank + 1.9)) +
          bleed * 0.22 * vec3(1.0, 0.9, 0.76)) *
         rdop * uLightGain * on;

  vec3 light = toneMap(hdr);
  float lightA = max(light.r, max(light.g, light.b));
  vec3 lightCol = light / max(lightA, 1e-4);

  /* ---- composite, back to front ---- */
  vec4 acc = vec4(0.0);
  lay(acc, uInk, ruleA);
  lay(acc, uInk, ringsA);
  float coreA = (1.0 - smoothstep(0.0, 1.6 * uGauge, ringPx)) * on;
  lay(acc, uCore, coreA);
  lay(acc, lightCol, lightA);

  /* 1/255 gradient dither — hygiene against banding in the glow falloffs. */
  float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  acc.rgb += vec3((dn - 0.5) / 255.0) * acc.a;

  outColor = acc;
}
`;

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  draw: (
    width: number,
    height: number,
    time: number,
    params: HorizonParams,
    dpr: number
  ) => HTMLCanvasElement;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  params: HorizonParams;
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
  if (!shader) throw new Error('horizon-field: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`horizon-field compile: ${gl.getShaderInfoLog(shader)}`);
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
      // The annulus must stay transparent so the conveyor grids show through.
      alpha: true,
      premultipliedAlpha: true,
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
  const uRadius = loc('uRadius');
  const uWorldOrigin = loc('uWorldOrigin');
  const uPitch = loc('uPitch');
  const uGauge = loc('uGauge');
  const uRuleAlpha = loc('uRuleAlpha');
  const uRuleFadeIn = loc('uRuleFadeIn');
  const uRuleFadeOut = loc('uRuleFadeOut');
  const uRingRadii = loc('uRingRadii');
  const uRingAlpha = loc('uRingAlpha');
  const uDeflEnd = loc('uDeflEnd');
  const uSwirl = loc('uSwirl');
  const uLightGain = loc('uLightGain');
  const uExposure = loc('uExposure');
  const uDoppler = loc('uDoppler');
  const uDopplerDir = loc('uDopplerDir');
  const uBreathe = loc('uBreathe');
  const uPeriod = loc('uPeriod');
  const uCore = loc('uCore');
  const uInk = loc('uInk');

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
      ctx.uniform1f(uRadius, params.radius * dpr);
      ctx.uniform2f(uWorldOrigin, params.worldOrigin[0] * dpr, params.worldOrigin[1] * dpr);
      ctx.uniform1f(uPitch, params.pitch * dpr);
      ctx.uniform1f(uGauge, params.gauge * dpr);
      ctx.uniform1f(uRuleAlpha, params.ruleAlpha);
      ctx.uniform1f(uRuleFadeIn, params.ruleFadeIn);
      ctx.uniform1f(uRuleFadeOut, params.ruleFadeOut);
      ctx.uniform3f(uRingRadii, params.ringRadii[0], params.ringRadii[1], params.ringRadii[2]);
      ctx.uniform3f(uRingAlpha, params.ringAlpha[0], params.ringAlpha[1], params.ringAlpha[2]);
      ctx.uniform1f(uDeflEnd, params.deflEnd);
      ctx.uniform1f(uSwirl, params.swirl);
      ctx.uniform1f(uLightGain, params.lightGain);
      ctx.uniform1f(uExposure, params.exposure);
      ctx.uniform1f(uDoppler, params.doppler);
      ctx.uniform2f(uDopplerDir, Math.cos(params.dopplerAngle), Math.sin(params.dopplerAngle));
      ctx.uniform1f(uBreathe, params.breathe);
      ctx.uniform1f(uPeriod, params.period);
      ctx.uniform3f(uCore, params.core[0], params.core[1], params.core[2]);
      ctx.uniform3f(uInk, params.ink[0], params.ink[1], params.ink[2]);
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
  // The field carries alpha; clear so last frame's glow never accumulates.
  sub.blit.clearRect(0, 0, width, height);
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
 * case the caller's canvas is left untouched (transparent) and the DOM
 * fallback — the plain dark disc and its hairline rim — shows instead.
 */
export function createHorizonField(
  canvas: HTMLCanvasElement,
  options: HorizonOptions = {}
): HorizonFieldHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...HORIZON_DEFAULTS, ...options.params },
    dpr: options.dpr ?? Math.min(window.devicePixelRatio || 1, 1.5),
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
