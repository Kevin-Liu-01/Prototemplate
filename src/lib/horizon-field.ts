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
 *
 * CURSOR EFFECTS — the same system the prismatic fields ship: a field may opt
 * into per-mount cursor-reactive modes driven by five extra uniforms set at
 * that field's draw (damped-spring smoothed position, eased strength,
 * smoothed velocity). This shader IS gravity, so the modes are gravitational:
 *   - lens: the cursor is a second body — a capped-angle rotation about the
 *     cursor plus a radial pinch warps the SAMPLE coordinate before the main
 *     lens, so the accretion light, the bent rules and the photon ring itself
 *     deflect and swirl around the pointer. The warp is gated to die out
 *     BEFORE uRuleFadeIn so the shader's rules still meet the CSS layer's
 *     flat rules exactly at the handoff band.
 *   - dither: an ordered 8x8 Bayer halo (the prismatic field's own matrix)
 *     requantizes the composed field — coverage and ink alike — around the
 *     cursor; the boundary breathes with pointer velocity.
 *   - redshift: relativistic beaming re-aimed at the pointer. The bright
 *     doppler flank eases around the ring toward the cursor's bearing (CPU
 *     blends uDopplerDir), the beaming asymmetry steepens with strength and
 *     velocity, hue slides along the flank, and light passing the cursor
 *     brightens.
 * Every path is uniform-gated: a field with no cursor engaged draws exactly
 * what it always did, and prefers-reduced-motion never attaches the system.
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
  /** Spectral saturation of the arcs: 0 pure white, 1 full trace palette. */
  chroma: number;
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
  /** Switch the cursor effect. No-op for fields that never opted in. */
  setEffectMode: (mode: HorizonEffectMode | 'off') => void;
  getEffectMode: () => HorizonEffectMode | 'off';
  /**
   * Demonstrate the current mode at a fixed showcase point (canvas-box
   * fractions) — the effects menu calls this on chip hover/focus so the
   * preview is visible even when the pointer sits over occluded chrome.
   * Pins the cursor there until previewRelease() (or a 2.6s touch drain).
   */
  previewPulse: (x: number, y: number) => void;
  /** End a menu preview: unpin, and drain unless a real pointer is inside. */
  previewRelease: () => void;
  destroy: () => void;
};

/** The cursor-reactive modes the shader implements. */
export type HorizonEffectMode = 'lens' | 'dither' | 'redshift';

export type HorizonEffectsOptions = {
  /** Element whose pointer drives the effect — the field's host hero/plate. */
  host: HTMLElement;
  /** Modes this field offers (the menu lists them in this order). */
  modes: readonly HorizonEffectMode[];
  /** Mode engaged on mount. Defaults to the first of `modes`. */
  initial?: HorizonEffectMode | 'off';
};

export type HorizonOptions = {
  dpr?: number;
  speed?: number;
  params?: Partial<HorizonParams>;
  /**
   * Opt this field into cursor-reactive effects. Ignored entirely under
   * prefers-reduced-motion; fields that omit it behave exactly as before.
   */
  effects?: HorizonEffectsOptions;
};

const EFFECT_INDEX: Record<HorizonEffectMode, number> = {
  lens: 1,
  dither: 2,
  redshift: 3,
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
  lightGain: 1.0,
  exposure: 2.1,
  chroma: 0.55,
  doppler: 0.62,
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

/* SHADER NOTES — the narration that used to live inside the GLSL string
   (hoisted out so it never ships in the bundle; minifiers cannot strip
   comments inside template literals):
   - pal/toneMap are the house prismatic-field palette + tanh tone map.
   - lay() is a standard OVER onto a premultiplied accumulator.
   - Pixel coords are y-down so DOM measurements map directly.
   - The lens is a point mass with the Einstein radius pinned to the rim;
     outside, deflection decays with COMPACT SUPPORT so the paper is
     exactly flat again before the canvas edge; inside, the full map
     yields the flipped secondary image (rs < 0).
   - Layer 1 (rules): where lensing packs many rules per pixel, coverage
     resolves to the mean ink (crowd -> gauge/spacing wash), and the rules
     fade between uRuleFadeIn/Out. Layer 2 (guide rings): lensed the same
     way; the DOM draws their flat outer arcs, the shader owns the bent
     inner parts (uRingAlpha zeroes them per direction).
   - Layer 4 (accretion): the streak field is sampled in the SOURCE plane
     (thS adds pi inside the horizon); the extinction envelope is keyed to
     PROJECTED distance from the hole in rim units, with a dark notch
     holding the arcs off the ring hairline; the doppler flank brightens
     the approaching side. The tint must stay periodic BEFORE pal (pal
     scales phase by 1.3) — hence sin(thS), never a raw theta multiple.
   - Layer 5 (photon ring): a near-white hairline over a warm spectral
     glow and a wide bleed, rim-dopplered.
   - Every ramp is WIDE on purpose: sampled per pixel they band if
     narrower than a few device pixels.
   - CURSOR EFFECTS: uCursor is in the same y-down device-px space as px;
     uFxScale is device px per CSS px, so cd (the cursor distance) and every
     effect radius are PHYSICAL CSS px — one gesture reads the same at any
     dpr. uFxMode is 0 off · 1 lens · 2 dither · 3 redshift; everything is
     gated on uFxStrength so an idle field costs what it always did.
   - lens: rotation about the cursor with a capped angle (displacement θ·d
     vanishes at the cursor, so it bends like mass, never knots) plus a
     radial pinch, applied to px BEFORE the point-mass lens — everything
     downstream (rules, arcs, ring hairline, core edge) inherits the warp.
     The bend is killed by uRuleFadeIn (gate on the PRE-warp radius) so the
     shader's rules still land exactly on the CSS layer's flat rules across
     the handoff band, and the swirl angle breathes with velocity.
   - dither: bayer8 is BAYER_8 from src/lib/dither.ts via its recursive
     construction (m2(x,y) = 2x + 3y − 4xy; 8×8 = 16·m2(bit0) + 4·m2(bit1)
     + m2(bit2)); cells are 2 buffer px. Inside a velocity-breathing halo
     the premultiplied accumulator resolves to straight color, quantizes
     per channel AND in coverage (alpha through the same threshold — the
     0.07 rules become sparse full-ink cells), and re-premultiplies.
   - redshift: dop and rdop gain a strength/velocity-steepened flank term
     (uDopplerDir itself is blended toward the cursor's bearing on the
     CPU), the accretion tint's pal phase slides along the flank, and hdr
     brightens within the cursor falloff. */
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
uniform float uChroma;
uniform float uDoppler;
uniform vec2 uDopplerDir;
uniform float uBreathe;
uniform float uPeriod;
uniform vec3 uCore;
uniform vec3 uInk;
uniform vec2 uCursor;
uniform float uFxStrength;
uniform float uFxMode;
uniform float uFxVel;
uniform float uFxScale;
out vec4 outColor;
const float PI = 3.14159265;
const float TAU = 6.2831853;
float bayerCell(vec2 c) {
return 2.0 * c.x + 3.0 * c.y - 4.0 * c.x * c.y;
}
float bayer8(vec2 cell) {
vec2 b0 = mod(cell, 2.0);
vec2 b1 = mod(floor(cell / 2.0), 2.0);
vec2 b2 = mod(floor(cell / 4.0), 2.0);
float m = 16.0 * bayerCell(b0) + 4.0 * bayerCell(b1) + bayerCell(b2);
return (m + 0.5) / 64.0;
}
vec3 pal(float phase) {
return 0.9 + sin(phase * 1.3 - vec3(4.8, -0.4, 1.2));
}
vec3 toneMap(vec3 hdr) {
vec3 v = clamp(hdr / uExposure, vec3(-10.0), vec3(10.0));
vec3 e = exp(2.0 * v);
return clamp((e - 1.0) / max(e + 1.0, vec3(1e-4)), 0.0, 1.0);
}
void lay(inout vec4 acc, vec3 rgb, float a) {
acc.rgb = rgb * a + acc.rgb * (1.0 - a);
acc.a = a + acc.a * (1.0 - a);
}
float stroke(float distPx, float gaugePx) {
return 1.0 - smoothstep(gaugePx * 0.5 - 0.35, gaugePx * 0.5 + 0.9, distPx);
}
void main() {
vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
float on = step(2.0, uRadius);
float R = max(uRadius, 1.0) * (1.0 + uBreathe * sin(uTime * TAU / uPeriod));
float fxLens = (uFxMode > 0.5 && uFxMode < 1.5) ? 1.0 : 0.0;
float fxDither = (uFxMode > 1.5 && uFxMode < 2.5) ? 1.0 : 0.0;
float fxRed = step(2.5, uFxMode);
vec2 cvec = px - uCursor;
float cd = length(cvec) / max(uFxScale, 1e-3);
float cq = cd / 165.0;
float camt = uFxStrength * exp(-cq * cq);
float rPre = length(px - uCenter) / max(R, 1.0);
float bend = camt * fxLens * (1.0 - smoothstep(uRuleFadeIn - 0.3, uRuleFadeIn, rPre)) * on;
if (bend > 0.002) {
float thC = bend * (0.72 + 0.22 * min(uFxVel, 1.6));
float sC = sin(thC);
float cC = cos(thC);
px = uCursor + vec2(cC * cvec.x - sC * cvec.y, sC * cvec.x + cC * cvec.y) * (1.0 - bend * 0.19);
}
vec2 d = px - uCenter;
float rc = length(d);
float r = rc / R;
vec2 nd = d / max(rc, 1e-4);
float theta = atan(d.y, d.x);
float wOut = pow(1.0 - smoothstep(1.0, uDeflEnd, r), 1.6);
float w = mix(wOut, 1.0, step(r, 1.0)) * on;
float rs = r - w / max(r, 1e-3);
vec2 ps = nd * rs;
float worldY = uWorldOrigin.y + uCenter.y + ps.y * R;
float rho = (worldY - uGauge * 0.5) / uPitch;
float gpx = max(length(vec2(dFdx(rho), dFdy(rho))), 1e-6);
float rulePx = abs(rho - floor(rho + 0.5)) / gpx;
float ruleCover = stroke(rulePx, uGauge);
float density = clamp(uGauge * gpx, 0.0, 1.0);
float crowd = smoothstep(0.3, 0.75, density);
float ruleA = uRuleAlpha * mix(ruleCover, density, crowd);
ruleA *= 1.0 - smoothstep(uRuleFadeIn, uRuleFadeOut, r);
ruleA *= on;
float grs = max(length(vec2(dFdx(rs), dFdy(rs))), 1e-6);
float ringsA = 0.0;
for (int i = 0; i < 3; i++) {
float srcR = i == 0 ? uRingRadii.x : (i == 1 ? uRingRadii.y : uRingRadii.z);
float aI = i == 0 ? uRingAlpha.x : (i == 1 ? uRingAlpha.y : uRingAlpha.z);
float distPx = abs(rs - srcR) / grs;
ringsA = max(ringsA, stroke(distPx, uGauge) * aI);
}
ringsA *= on * step(1.0, r) * (1.0 - smoothstep(uRuleFadeIn, uRuleFadeOut, r));
float s = abs(rs);
float thS = theta + step(rs, 0.0) * PI;
float sw = uSwirl / (s + 0.32);
float t = uTime;
float band1 = sin(thS * 3.0 + sw + s * 5.0 - t * 0.52 + 1.7);
float band2 = sin(thS * 7.0 - sw * 1.6 - s * 9.0 + t * 0.74);
float band3 = sin(thS * 13.0 + s * 16.0 - t * 1.12 + 4.1);
float streak = 0.5 + 0.5 * (0.56 * band1 + 0.30 * band2 + 0.14 * band3);
streak = streak * streak;
streak = streak * streak;
float prof = exp(-s * s * 2.0);
float mu = clamp(1.0 / (s + 0.06), 0.0, 10.0);
float flank = dot(nd, uDopplerDir);
float dop = 1.0 + uDoppler * flank;
dop *= 1.0 + fxRed * uFxStrength * flank * (0.55 + 0.3 * min(uFxVel, 2.0));
float ringPx = rc - R;
float notch = smoothstep(-2.0 * uGauge, -9.0 * uGauge, ringPx);
float env = mix(
exp(-(r - 1.0) * 5.4),
smoothstep(0.6, 0.97, r) * 0.38 * notch,
step(r, 1.0)
);
float I = prof * (0.16 + 1.55 * streak) * mu * dop * env * on;
vec3 tint = mix(
vec3(1.0),
clamp(pal(s * 2.6 + 1.4 * sin(thS) + streak * 2.1 + 0.35 * flank + 0.4 + fxRed * uFxStrength * flank * 1.6), 0.0, 2.0),
uChroma
);
vec3 hdr = tint * I * uLightGain;
float hair = exp(-0.5 * pow(ringPx / (1.6 * uGauge), 2.0));
float glow = exp(-abs(ringPx) / (7.5 * uGauge));
float bleed = exp(-abs(ringPx) / (26.0 * uGauge));
float rdop = 1.0 + 0.6 * uDoppler * flank;
rdop *= 1.0 + fxRed * uFxStrength * flank * 0.5;
vec3 warm = mix(vec3(1.0, 0.9, 0.74), clamp(pal(0.5 * flank + 1.9), 0.0, 2.0), 0.35);
hdr += (hair * 10.0 * vec3(1.0, 0.99, 0.96) +
glow * 1.5 * warm +
bleed * 0.3 * vec3(1.0, 0.88, 0.7)) *
rdop * on;
hdr *= 1.0 + fxRed * camt * 0.55;
vec3 light = toneMap(hdr);
float lightA = max(light.r, max(light.g, light.b));
vec3 lightCol = light / max(lightA, 1e-4);
vec4 acc = vec4(0.0);
lay(acc, uInk, ruleA);
lay(acc, uInk, ringsA);
float coreA = (1.0 - smoothstep(0.0, 1.6 * uGauge, ringPx)) * on;
lay(acc, uCore, coreA);
lay(acc, lightCol, lightA);
float halo = fxDither * uFxStrength * on;
if (halo > 0.002) {
float hrad = 200.0 + min(uFxVel * 130.0, 180.0);
float inHalo = (1.0 - smoothstep(hrad * 0.3, hrad, cd)) * halo;
if (inHalo > 0.002) {
float thr = bayer8(floor(gl_FragCoord.xy / 2.0));
float qa = step(thr, acc.a);
vec3 q3 = step(vec3(thr), (acc.rgb / max(acc.a, 1e-4)) * 1.08) * qa;
acc = mix(acc, vec4(q3, qa), inHalo);
}
}
float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
acc.rgb += vec3((dn - 0.5) / 255.0) * acc.a;
outColor = acc;
}
`;

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  /**
   * Draws one frame at the given size and returns the GL canvas to blit from.
   * The trailing five numbers are the cursor-effect uniforms (cursor x/y in
   * device px, eased strength, mode index, smoothed velocity in kpx/s) and
   * dopAngle is the possibly cursor-blended doppler flank direction — all
   * neutral for a field with no effect engaged.
   */
  draw: (
    width: number,
    height: number,
    time: number,
    params: HorizonParams,
    dpr: number,
    fxX: number,
    fxY: number,
    fxStrength: number,
    fxMode: number,
    fxVel: number,
    dopAngle: number
  ) => HTMLCanvasElement;
};

/**
 * Per-field cursor-effect state — the same instrument the prismatic engine
 * ships. Positions are fractions of the field canvas's own box (top-left
 * origin); the draw converts them to device px at the field's current size.
 * `engaged` keeps the shared rAF alive while a cursor is inside the field or
 * the strength is still draining after it left.
 */
type EffectState = {
  host: HTMLElement;
  modes: readonly HorizonEffectMode[];
  mode: HorizonEffectMode | 'off';
  hovering: boolean;
  engaged: boolean;
  /** True while a menu preview pins the cursor to its showcase point. */
  pinned: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  strength: number;
  strengthTarget: number;
  vel: number;
  velRaw: number;
  lastMoveT: number;
  lastTickT: number;
  touchTimer: ReturnType<typeof setTimeout> | undefined;
  pulseTimer: ReturnType<typeof setTimeout> | undefined;
  engage: () => void;
  detach: () => void;
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
  effect?: EffectState;
};

let engine: Engine | null = null;
let engineFailed = false;
const subscribers = new Set<Subscriber>();
let frameId = 0;

/**
 * Debug probe for perf checks (rAF-idle and engagement assertions in the
 * screenshot harness). One mutated object, no per-frame allocation.
 */
const debugProbe = { ticks: 0, strength: 0, mode: 'off' };
if (typeof window !== 'undefined') {
  (window as Window & { __horizon?: typeof debugProbe }).__horizon = debugProbe;
}

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
  const uChroma = loc('uChroma');
  const uDoppler = loc('uDoppler');
  const uDopplerDir = loc('uDopplerDir');
  const uBreathe = loc('uBreathe');
  const uPeriod = loc('uPeriod');
  const uCore = loc('uCore');
  const uInk = loc('uInk');
  const uCursor = loc('uCursor');
  const uFxStrength = loc('uFxStrength');
  const uFxMode = loc('uFxMode');
  const uFxVel = loc('uFxVel');
  const uFxScale = loc('uFxScale');

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    engine = null;
  });

  engine = {
    canvas,
    gl: ctx,
    draw(width, height, time, params, dpr, fxX, fxY, fxStrength, fxMode, fxVel, dopAngle) {
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
      ctx.uniform1f(uChroma, params.chroma);
      ctx.uniform1f(uDoppler, params.doppler);
      ctx.uniform2f(uDopplerDir, Math.cos(dopAngle), Math.sin(dopAngle));
      ctx.uniform1f(uBreathe, params.breathe);
      ctx.uniform1f(uPeriod, params.period);
      ctx.uniform3f(uCore, params.core[0], params.core[1], params.core[2]);
      ctx.uniform3f(uInk, params.ink[0], params.ink[1], params.ink[2]);
      ctx.uniform2f(uCursor, fxX, fxY);
      ctx.uniform1f(uFxStrength, fxStrength);
      ctx.uniform1f(uFxMode, fxMode);
      ctx.uniform1f(uFxVel, fxVel);
      ctx.uniform1f(uFxScale, dpr);
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
  // Cursor uniforms: canvas-box fractions → the shader's y-down device-px
  // space (the same space uCenter lives in). Redshift additionally swings
  // the doppler flank toward the cursor's bearing from the hole — angle
  // blending happens here on the CPU (shortest arc, scaled by strength) so
  // the GLSL keeps a single uDopplerDir.
  const fx = sub.effect;
  let fxX = 0;
  let fxY = 0;
  let fxStrength = 0;
  let fxMode = 0;
  let fxVel = 0;
  let dopAngle = sub.params.dopplerAngle;
  if (fx && fx.mode !== 'off' && fx.strength > 0.001) {
    fxX = fx.x * width;
    fxY = fx.y * height;
    fxStrength = fx.strength;
    fxMode = EFFECT_INDEX[fx.mode];
    fxVel = fx.vel;
    if (fx.mode === 'redshift') {
      const cw = sub.target.clientWidth || 1;
      const ch = sub.target.clientHeight || 1;
      const dx = fx.x * cw - sub.params.center[0];
      const dy = fx.y * ch - sub.params.center[1];
      if (dx * dx + dy * dy > 4) {
        const delta = Math.atan2(dy, dx) - dopAngle;
        dopAngle += Math.atan2(Math.sin(delta), Math.cos(delta)) * fx.strength;
      }
    }
  }
  const source = active.draw(
    width,
    height,
    time,
    sub.params,
    sub.dpr,
    fxX,
    fxY,
    fxStrength,
    fxMode,
    fxVel,
    dopAngle
  );
  // The field carries alpha; clear so last frame's glow never accumulates.
  sub.blit.clearRect(0, 0, width, height);
  sub.blit.drawImage(source, 0, 0);
}

/**
 * Ease the cursor state toward its targets — exponential smoothing tuned to
 * feel critically damped (no overshoot, fast pursuit). When the strength has
 * fully drained after a pointerleave the field disengages, which is what
 * lets the shared rAF loop stop again.
 */
function stepEffect(fx: EffectState, now: number) {
  const dt = Math.min(Math.max((now - fx.lastTickT) / 1000, 0.001), 0.1);
  fx.lastTickT = now;
  const posK = 1 - Math.exp(-dt * 13);
  fx.x += (fx.targetX - fx.x) * posK;
  fx.y += (fx.targetY - fx.y) * posK;
  const strengthK = 1 - Math.exp(-dt * (fx.strengthTarget > fx.strength ? 7.5 : 4.5));
  fx.strength += (fx.strengthTarget - fx.strength) * strengthK;
  fx.vel += (fx.velRaw - fx.vel) * (1 - Math.exp(-dt * 9));
  fx.velRaw *= Math.exp(-dt * 5);
  if (fx.strengthTarget === 0 && fx.strength < 0.004) {
    fx.strength = 0;
    fx.vel = 0;
    fx.velRaw = 0;
    fx.engaged = false;
  }
  debugProbe.strength = fx.strength;
  debugProbe.mode = fx.mode;
}

function tick(now: number) {
  frameId = 0;
  debugProbe.ticks++;
  const hidden = typeof document !== 'undefined' && document.hidden;
  if (!hidden) {
    for (const sub of subscribers) {
      const engaged = sub.effect !== undefined && sub.effect.engaged;
      if ((!sub.running && !engaged) || !sub.visible) continue;
      if (engaged && sub.effect) stepEffect(sub.effect, now);
      renderSubscriber(sub, ((now - sub.startTime) / 1000) * sub.speed);
    }
  }
  schedule();
}

function schedule() {
  if (frameId) return;
  let anyActive = false;
  for (const sub of subscribers) {
    // A field draws while it animates — and also while a cursor is engaged
    // with it (hovering, or the strength still draining after leave).
    if ((sub.running || sub.effect?.engaged === true) && sub.visible) {
      anyActive = true;
      break;
    }
  }
  if (anyActive) frameId = requestAnimationFrame(tick);
}

/**
 * Wire pointer tracking on the field's host element — the same contract as
 * the prismatic engine. Mouse/pen: enter and move aim the cursor and ease
 * strength up; leave eases it down. Touch: a tap plants the cursor with a
 * burst of velocity and lets it ripple out.
 */
function attachEffects(sub: Subscriber, options: HorizonEffectsOptions): EffectState {
  const initial = options.initial ?? options.modes[0] ?? 'off';
  const state: EffectState = {
    host: options.host,
    modes: options.modes,
    mode: initial === 'off' || options.modes.includes(initial) ? initial : 'off',
    hovering: false,
    engaged: false,
    pinned: false,
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    strength: 0,
    strengthTarget: 0,
    vel: 0,
    velRaw: 0,
    lastMoveT: 0,
    lastTickT: 0,
    touchTimer: undefined,
    pulseTimer: undefined,
    engage: () => undefined,
    detach: () => undefined,
  };

  const engage = () => {
    if (state.mode === 'off') return;
    state.strengthTarget = 1;
    if (!state.engaged) {
      state.engaged = true;
      state.lastTickT = performance.now();
      // A fresh engagement snaps the cursor to the pointer instead of
      // flying in from wherever it last drained out.
      if (state.strength < 0.02) {
        state.x = state.targetX;
        state.y = state.targetY;
      }
      schedule();
    }
  };
  state.engage = engage;

  /**
   * Update the aim point from a pointer event; returns false off-box.
   * The point CLAMPS to the canvas box: the host (the whole hero) extends
   * well past the disc-and-annulus canvas, and the effect should track
   * along the field's nearest edge rather than fly offscreen. Velocity is
   * physical (kpx/s) so the halos breathe the same on every mount. A menu
   * preview pin owns the aim until it releases.
   */
  const aim = (event: PointerEvent): boolean => {
    if (state.pinned) return true;
    const rect = sub.target.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;
    const nx = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const ny = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    const t = performance.now();
    const dt = Math.max((t - state.lastMoveT) / 1000, 1 / 240);
    state.velRaw = Math.min(
      Math.hypot((nx - state.targetX) * rect.width, (ny - state.targetY) * rect.height) / dt / 1000,
      3
    );
    state.targetX = nx;
    state.targetY = ny;
    state.lastMoveT = t;
    return true;
  };

  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    state.hovering = true;
    if (state.mode === 'off') return;
    if (aim(event)) engage();
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || state.mode === 'off') return;
    state.hovering = true;
    if (aim(event)) engage();
  };
  const onLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    state.hovering = false;
    state.strengthTarget = 0;
  };
  const onDown = (event: PointerEvent) => {
    if (event.pointerType !== 'touch' || state.mode === 'off') return;
    if (!aim(event)) return;
    state.velRaw = 2.4; // the tap ripples the effect open
    engage();
    clearTimeout(state.touchTimer);
    state.touchTimer = setTimeout(() => {
      state.strengthTarget = 0;
    }, 900);
  };

  options.host.addEventListener('pointerenter', onEnter);
  options.host.addEventListener('pointermove', onMove);
  options.host.addEventListener('pointerleave', onLeave);
  options.host.addEventListener('pointerdown', onDown);
  state.detach = () => {
    options.host.removeEventListener('pointerenter', onEnter);
    options.host.removeEventListener('pointermove', onMove);
    options.host.removeEventListener('pointerleave', onLeave);
    options.host.removeEventListener('pointerdown', onDown);
    clearTimeout(state.touchTimer);
    clearTimeout(state.pulseTimer);
  };
  return state;
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
  // Effects are pointer-driven motion: under reduced motion they never
  // attach, so the field stays exactly the static frame it always was.
  if (!reduced && options.effects && options.effects.modes.length > 0) {
    sub.effect = attachEffects(sub, options.effects);
  }
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
    setEffectMode(mode) {
      const fx = sub.effect;
      if (!fx || fx.mode === mode) return;
      if (mode !== 'off' && !fx.modes.includes(mode)) return;
      fx.mode = mode;
      // Switching off drains gracefully; switching modes while the pointer
      // is already inside re-engages so the new mode shows immediately.
      if (mode === 'off') fx.strengthTarget = 0;
      else if (fx.hovering) fx.engage();
    },
    getEffectMode() {
      return sub.effect?.mode ?? 'off';
    },
    previewPulse(x, y) {
      const fx = sub.effect;
      if (!fx || fx.mode === 'off') return;
      fx.pinned = true;
      fx.targetX = x;
      fx.targetY = y;
      if (fx.strength < 0.02) {
        fx.x = x;
        fx.y = y;
      }
      fx.velRaw = 1.4;
      fx.strengthTarget = 1;
      if (!fx.engaged) {
        fx.engaged = true;
        fx.lastTickT = performance.now();
      }
      schedule();
      // Touch has no chip-leave: unpin on a timer, and drain unless a real
      // pointer is inside the host keeping the effect alive.
      clearTimeout(fx.pulseTimer);
      fx.pulseTimer = setTimeout(() => {
        fx.pinned = false;
        if (!fx.hovering) fx.strengthTarget = 0;
      }, 2600);
    },
    previewRelease() {
      const fx = sub.effect;
      if (!fx) return;
      fx.pinned = false;
      clearTimeout(fx.pulseTimer);
      if (!fx.hovering) fx.strengthTarget = 0;
    },
    destroy() {
      sub.effect?.detach();
      sub.observer?.disconnect();
      subscribers.delete(sub);
      // The engine context is deliberately kept for the session — tearing it
      // down per unmount is what exhausted the browser's context budget.
    },
  };
}
