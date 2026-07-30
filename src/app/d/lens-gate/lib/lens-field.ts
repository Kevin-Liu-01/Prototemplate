/**
 * Lens field — the page's own ruled hairlines refracting through one circular
 * glass lens, rendered as a physical object rather than a drawn outline.
 * Fully analytic: horizontal rules at a fixed pitch are evaluated through a
 * barrel warp g(r) = 1 − k·(1 − r²)^{3/2}, so inside the glass the rules
 * magnify and bow while outside they snap perfectly straight (the warp is
 * continuous and exactly 1 at the rim). No noise, no fBm — the only motion is
 * the lens radius breathing 1.0→1.035 on a slow sine, which the rules answer
 * by sliding through the glass.
 *
 * The glass itself is built from six analytic layers, back to front:
 *   1. a caustic light pool cast onto the paper below-right of the disc — the
 *      light the lens concentrates past its rim — with rules washing slightly
 *      lighter inside it;
 *   2. a contact shadow just outside the lower rim, so the disc has weight;
 *   3. a radial body tint, near-zero at the core (seated cards and the mark
 *      must read) and densest against the rim, like the edge of real crown
 *      glass;
 *   4. a bright caustic ring just inside the rim where the glass concentrates
 *      the light it bends;
 *   5. the refracted rules, whose three channels sample the warp at
 *      diverging strengths toward the rim so a rule visibly separates into
 *      pigment strands (subtractive CMY — print misregistration, not glow),
 *      with the strands' ink deepened right where they split;
 *   6. a wide low-alpha specular arc in the upper-left quadrant (plus a faint
 *      counter-gleam lower-right) that veils the rules it crosses — the
 *      reflection sits OVER the transmitted image — and, at the very edge, the
 *      rim rendered as a dispersive gradient: a thin spectral band (red inside
 *      through green to violet outside, values squared toward pigment) over a
 *      whisper ink hairline for definition.
 *
 * Only the y-component of the sample point is displaced. A real barrel warp
 * displaces x too, but the content is invariant in x (the rules are
 * horizontal), so the x term would cost a divergence for zero pixels changed.
 *
 * Rule gauge is held at constant screen pixels via the screen-space derivative
 * of the ruled coordinate (the chroma-flow trick): real glass would fatten the
 * strokes with the magnification, but the rules are the PAGE's hairlines and a
 * hairline never changes gauge — magnification is carried by spacing alone.
 *
 * ARCHITECTURE — the hard lesson from this codebase: exactly ONE WebGL context
 * exists for this module for the whole session, no matter how many fields
 * mount. Per-component contexts exhausted Chrome's ~16-context budget after a
 * dozen client-side navigations and every canvas went silently black.
 * Subscribers register here; a single engine draws into one offscreen GL
 * canvas and blits into each subscriber's own 2D canvas. Never call
 * canvas.getContext('webgl*') from a component.
 */

export type LensParams = {
  /** CSS px between rule centerlines — the page's ruled pitch. */
  pitch: number;
  /** CSS px stroke width of a rule (and of the rim hairline). */
  gauge: number;
  /** Barrel coefficient k; center magnification is 1/(1−k). */
  strength: number;
  /** CSS px of maximum per-channel rule misregistration right at the rim. */
  fringe: number;
  /** Ink coverage of a rule outside the glass, 0..1. */
  ruleAlpha: number;
  /** Multiplier on ruleAlpha deep inside the glass — the focus of the lens. */
  boost: number;
  /** Ink coverage of the rim's definition hairline (under the spectral band). */
  ringAlpha: number;
  /** Mix weight of the spectral gradient band at the rim, 0..1. */
  spectral: number;
  /** CSS px half-width of the spectral rim band. */
  ringWidth: number;
  /** Peak mix weight toward bodyTint at the rim — the glass's edge density. */
  bodyAlpha: number;
  /** The glass body color — cool crown-glass gray-green, themed. */
  bodyTint: [number, number, number];
  /** Peak white-veil weight of the specular arc (it also washes the rules). */
  specAlpha: number;
  /** White-lift weight of the caustic ring just inside the rim. */
  causticAlpha: number;
  /** White-lift weight of the light pool cast below-right of the glass. */
  poolAlpha: number;
  /** Darkening weight of the contact shadow outside the lower rim. */
  shadowAlpha: number;
  /** Breathing amplitude of the radius: 0.035 → scale 1.0..1.035. */
  breathe: number;
  /** Seconds per breath. */
  period: number;
  ink: [number, number, number];
  paper: [number, number, number];
  /** Lens center in CSS px, canvas-relative, y-down. */
  center: [number, number];
  /** Lens radius in CSS px; below 2 disables the lens entirely. */
  radius: number;
};

export type LensFieldHandle = {
  setParams: (patch: Partial<LensParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type LensOptions = {
  dpr?: number;
  speed?: number;
  params?: Partial<LensParams>;
};

export const LENS_DEFAULTS: LensParams = {
  pitch: 28,
  gauge: 1,
  /* 0.19 puts the max displacement at ≈ 15px for R=250 and center
     magnification at 1.23 — unmistakably physical without tipping into the
     fisheye-photo read that 0.26 produced. */
  strength: 0.19,
  fringe: 2.4,
  ruleAlpha: 0.13,
  boost: 1.55,
  ringAlpha: 0.3,
  spectral: 0.65,
  ringWidth: 3,
  bodyAlpha: 0.05,
  bodyTint: [0.62, 0.67, 0.66],
  specAlpha: 0.38,
  causticAlpha: 0.8,
  poolAlpha: 0.85,
  shadowAlpha: 0.07,
  breathe: 0.035,
  period: 3.4,
  ink: [0.059, 0.067, 0.075],
  paper: [0.984, 0.984, 0.98],
  center: [0, 0],
  radius: 0,
};

/* Mid-breath instant (sin term = 0) so the reduced-motion still and any
   pre-measure frame show the lens at its resting scale. */
const STATIC_TIME = 5.1;

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
uniform float uPitch;
uniform float uGauge;
uniform float uStrength;
uniform float uFringe;
uniform float uRuleAlpha;
uniform float uBoost;
uniform float uRingAlpha;
uniform float uSpectral;
uniform float uRingWidth;
uniform float uBodyAlpha;
uniform vec3 uBodyTint;
uniform float uSpecAlpha;
uniform float uCausticAlpha;
uniform float uPoolAlpha;
uniform float uShadowAlpha;
uniform float uBreathe;
uniform float uPeriod;
uniform vec3 uInk;
uniform vec3 uPaper;

out vec4 outColor;

/* Coverage of a 1D ruled grid at coordinate rho, holding the stroke at
   gaugePx screen pixels via the screen-space derivative gpx. */
float ruleCover(float rho, float gpx, float gaugePx) {
  float dpx = abs(rho - floor(rho + 0.5)) / max(gpx, 1e-6);
  return 1.0 - smoothstep(gaugePx * 0.5 - 0.35, gaugePx * 0.5 + 0.8, dpx);
}

float ringCover(float distPx, float gaugePx) {
  return 1.0 - smoothstep(gaugePx * 0.5 - 0.35, gaugePx * 0.5 + 0.9, distPx);
}

void main() {
  /* y-down pixel coords so DOM measurements map directly. */
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);

  float lensOn = step(2.0, uRadius);
  float R = max(uRadius, 1.0) * (1.0 + uBreathe * (0.5 + 0.5 * sin(uTime * 6.2831853 / uPeriod)));
  vec2 d = px - uCenter;
  float rc = length(d);
  /* rr >= 1 everywhere when the lens is off — the warp collapses to identity
     branchlessly, which keeps the derivative-based gauge well-defined. */
  float rr = mix(1e3, rc / R, lensOn);
  vec2 nd = d / max(rc, 1e-4);

  /* Barrel warp: g = 1 − k·(1 − rr²)^{3/2}; identically 1 outside the rim. */
  float q = max(1.0 - rr * rr, 0.0);
  float g = 1.0 - uStrength * q * sqrt(q);

  /* Dispersion: the per-channel warp split widens toward the rim on a
     squared ramp gated to the outer band, so the core stays an achromatic
     doublet and the rules comb into pigment strands only against the glass
     edge. delta is in warp units — the screen offset |d.y|·delta tops out at
     uFringe px right at the rim. */
  float rim = smoothstep(0.72, 1.0, rr);
  rim = rim * rim * (1.0 - smoothstep(0.995, 1.02, rr));
  float delta = (uFringe / R) * rim;

  float rhoG = (uCenter.y + d.y * g) / uPitch;
  float rhoR = (uCenter.y + d.y * (g - delta)) / uPitch;
  float rhoB = (uCenter.y + d.y * (g + delta)) / uPitch;
  float gpx = max(length(vec2(dFdx(rhoG), dFdy(rhoG))), 1e-6);

  /* The glass focuses: rules gain a step of ink deep inside, easing back to
     page strength at the rim so the boundary carries no tonal seam — and the
     split strands take extra pigment right where they separate, so the
     dispersion reads as saturated print misregistration rather than haze. */
  float inside = 1.0 - smoothstep(0.9, 1.0, rr);
  float split = rim * (1.0 - smoothstep(0.985, 1.005, rr));
  float alpha = uRuleAlpha * mix(1.0, uBoost, inside * lensOn) * (1.0 + split * 2.4);

  /* Specular arc, upper-left: a gleam near the rim — an angular window
     against a thin radial band — plus a faint counter-gleam opposite.
     Computed before the rules because the reflection both veils them
     (applied after compositing) and washes their transmitted ink (applied to
     coverage). Kept tight: a broad wash here read as porcelain, not glass. */
  float arcMain = smoothstep(0.45, 0.97, dot(nd, vec2(-0.573, -0.819)));
  float radMain = smoothstep(0.66, 0.9, rr) * (1.0 - smoothstep(0.93, 0.99, rr));
  float arcBack = smoothstep(0.55, 0.97, dot(nd, vec2(0.573, 0.819)));
  float radBack = smoothstep(0.88, 0.95, rr) * (1.0 - smoothstep(0.95, 0.99, rr));
  float spec = (arcMain * radMain + arcBack * radBack * 0.35) * lensOn;

  /* Caustic: a tight bright line hugging the inside of the rim — where the
     glass concentrates the light it bends — and the pool that light casts
     onto the paper below-right of the disc: a feathered ellipse, gated to
     outside the glass. */
  float caust = smoothstep(0.94, 0.975, rr) * (1.0 - smoothstep(0.975, 0.998, rr)) * lensOn;
  vec2 pd = (d - R * vec2(0.38, 0.88)) / (R * vec2(0.9, 0.42));
  float pool = (1.0 - smoothstep(0.2, 1.0, length(pd))) * smoothstep(1.002, 1.05, rr) * lensOn;

  /* Contact shadow: a feathered band outside the rim, weighted hard to the
     lower hemisphere, so the disc has weight on the page. */
  float below = clamp(nd.y * 0.85 + 0.15, 0.0, 1.0);
  float shade = smoothstep(0.997, 1.008, rr) * (1.0 - smoothstep(1.01, 1.14, rr));
  shade *= below * below * lensOn;

  /* Body density: near-zero through the core, gathering only against the
     rim — the edge of real crown glass. Dies exactly at the rim so the paper
     outside is untouched. */
  float body = smoothstep(0.55, 1.0, rr);
  body = pow(body, 2.8) * (1.0 - smoothstep(0.998, 1.015, rr)) * lensOn;

  float cR = ruleCover(rhoR, gpx, uGauge) * alpha;
  float cG = ruleCover(rhoG, gpx, uGauge) * alpha;
  float cB = ruleCover(rhoB, gpx, uGauge) * alpha;
  /* Concentrated light washes the transmitted ink: rules ghost — never
     vanish — under the specular glare, inside the caustic ring, and across
     the cast pool. */
  vec3 cov = vec3(cR, cG, cB) * (1.0 - spec * 0.45) * (1.0 - caust * 0.2) * (1.0 - pool * 0.28);

  /* Composite, back to front. */
  vec3 col = uPaper;
  col = mix(col, vec3(1.0), pool * uPoolAlpha);
  col = mix(col, vec3(0.04, 0.045, 0.05), shade * uShadowAlpha);
  col = mix(col, uBodyTint, body * uBodyAlpha);
  col = mix(col, vec3(1.0), caust * uCausticAlpha);
  col = mix(col, uInk, cov);
  col = mix(col, vec3(1.0), spec * uSpecAlpha);

  /* The rim as a dispersive edge: a dark glass spine — the disc seen edge-on
     — with the grazing light fanned into two pigment fringes hugging it,
     warm inside, violet-blue outside. The fringes are one continuous
     spectral ramp whose middle (the green that read as marker stroke) is
     suppressed under the spine, so what shows is the split, not a rainbow. */
  float rn = (rc - R) / max(uRingWidth, 0.5);
  float band = exp(-rn * rn * 2.0) * smoothstep(0.3, 0.8, abs(rn)) * lensOn;
  float tS = clamp(rn * 0.5 + 0.5, 0.0, 1.0);
  vec3 spectrum = 0.5 + 0.5 * cos(6.2831853 * (tS * 0.72 + vec3(0.0, 0.67, 0.33)));
  spectrum *= spectrum;
  col = mix(col, uInk, ringCover(abs(rc - R), uGauge * 1.1) * uRingAlpha * lensOn);
  col = mix(col, spectrum, band * uSpectral);

  /* 1/255-amplitude gradient dither — rendering hygiene against banding in
     the feathered lifts, invisible as texture. */
  float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  outColor = vec4(col + vec3((dn - 0.5) / 255.0), 1.0);
}
`;

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  draw: (width: number, height: number, time: number, params: LensParams, dpr: number) => HTMLCanvasElement;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  params: LensParams;
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
  if (!shader) throw new Error('lens-field: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`lens-field compile: ${gl.getShaderInfoLog(shader)}`);
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
  const uRadius = loc('uRadius');
  const uPitch = loc('uPitch');
  const uGauge = loc('uGauge');
  const uStrength = loc('uStrength');
  const uFringe = loc('uFringe');
  const uRuleAlpha = loc('uRuleAlpha');
  const uBoost = loc('uBoost');
  const uRingAlpha = loc('uRingAlpha');
  const uSpectral = loc('uSpectral');
  const uRingWidth = loc('uRingWidth');
  const uBodyAlpha = loc('uBodyAlpha');
  const uBodyTint = loc('uBodyTint');
  const uSpecAlpha = loc('uSpecAlpha');
  const uCausticAlpha = loc('uCausticAlpha');
  const uPoolAlpha = loc('uPoolAlpha');
  const uShadowAlpha = loc('uShadowAlpha');
  const uBreathe = loc('uBreathe');
  const uPeriod = loc('uPeriod');
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
      ctx.uniform1f(uRadius, params.radius * dpr);
      ctx.uniform1f(uPitch, params.pitch * dpr);
      ctx.uniform1f(uGauge, params.gauge * dpr);
      ctx.uniform1f(uStrength, params.strength);
      ctx.uniform1f(uFringe, params.fringe * dpr);
      ctx.uniform1f(uRuleAlpha, params.ruleAlpha);
      ctx.uniform1f(uBoost, params.boost);
      ctx.uniform1f(uRingAlpha, params.ringAlpha);
      ctx.uniform1f(uSpectral, params.spectral);
      ctx.uniform1f(uRingWidth, params.ringWidth * dpr);
      ctx.uniform1f(uBodyAlpha, params.bodyAlpha);
      ctx.uniform3f(uBodyTint, params.bodyTint[0], params.bodyTint[1], params.bodyTint[2]);
      ctx.uniform1f(uSpecAlpha, params.specAlpha);
      ctx.uniform1f(uCausticAlpha, params.causticAlpha);
      ctx.uniform1f(uPoolAlpha, params.poolAlpha);
      ctx.uniform1f(uShadowAlpha, params.shadowAlpha);
      ctx.uniform1f(uBreathe, params.breathe);
      ctx.uniform1f(uPeriod, params.period);
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
export function createLensField(
  canvas: HTMLCanvasElement,
  options: LensOptions = {}
): LensFieldHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...LENS_DEFAULTS, ...options.params },
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
