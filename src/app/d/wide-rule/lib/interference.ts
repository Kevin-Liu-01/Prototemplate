/**
 * Analytic wave interference, rendered as LIGHT — two coherent sources whose
 * corridor is an exposure event on paper, not a line drawing.
 *
 * The mathematics is the motif, and there is deliberately NO noise in it: the
 * field is the exact sum of two circular waves, F = Re(e^{iφ1} + e^{iφ2}).
 * Writing the sum as a complex phasor C gives F = |C|·cos(arg C), so the fringe
 * lines are the level sets of arg C and the interference contrast is |C| — both
 * closed-form. Fringes render at constant ~1px screen gauge by dividing the
 * phase distance by the ANALYTIC gradient of arg C (dFdx across atan's branch
 * cut spikes at the seam; ∇θ = (Cx∇Cy − Cy∇Cx)/|C|² is exact and seam-free).
 *
 * THE LIGHT — everything below composes from the same closed-form field, so
 * the render stays analytic end to end (the only time term is a slow
 * low-frequency phase, never noise):
 *  1. A luminous core rides the corridor: a gaussian lift off paper around the
 *     axis (a few % — feathered above, longer below like the band's own tail),
 *     hottest around the source and modulated by cos²(arg C), so soft light
 *     crests sit exactly under the drawn wavefronts — the ink fringes ride ON
 *     the light. A thin-film shimmer tints the lift with the house prismatic
 *     cos-palette (src/lib/prismatic-field.ts), keyed on the slow path-sum
 *     phase (d1+d2), so hue travels outward with the rings.
 *  2. The gate is the SOURCE: a tight bloom at the pair's midpoint lifts even
 *     the ink into light (the brightest pixels on the page), wrapped in a
 *     wider unshadowed halo — the DOM ring and mark sit inside a halo, never a
 *     hole. Fringe ink is intensity-graded by distance from the source, so the
 *     geometry reads as light radiating from the gate and decaying.
 *  3. The null reads as SHADOW: the lift is scaled by the same contrast |C|/2
 *     that kills the fringes, so along the destructive seam the corridor dims
 *     smoothly to plain paper — the calm is the absence of light.
 *  4. A pressed edge frames the exposed strip: a faint multiplicative
 *     darkening straddling the corridor's feathered boundary (a film still's
 *     frame), fading where the shadow passes and with distance from the hot
 *     center.
 *
 * The pair is ANTI-phased and its MIDPOINT SITS ON THE GATE MARK at
 * (50%, axis). That placement is the composition: the fringes of a pair are
 * confocal ellipses around it — here, rings radiating from the gate — so the
 * band mask fills with fringe arcs at uniform λ/2 pitch across the FULL rail
 * width, both flanks, and the horizontal corridor reads as one light event
 * with the gate as its source. (An earlier draft parked the pair far
 * off-canvas up-right; its ellipse arcs fanned from one corner and the band
 * never read. The pair must live at the gate.) An anti-phased pair cancels
 * exactly along the perpendicular bisector of its baseline, and the baseline
 * is set perpendicular to the gate→headline direction — so the null is a
 * compact seam THROUGH the gate, widening as it descends to hold the measured
 * low-left headline block: a deliberate opening in the band, framed by the
 * gate ring, honest physics rather than a mask. Sub-half-λ separation keeps
 * the pair a near-dipole: one nodal seam, no extra families to clutter it.
 *
 * ARCHITECTURE — the hard lesson from this codebase: exactly ONE WebGL
 * context exists for this module for the whole session, no matter how many
 * fields mount. Per-component contexts exhausted Chrome's ~16-context budget
 * after a dozen client-side navigations and every canvas went silently black.
 * Subscribers register here; a single engine draws into one offscreen GL
 * canvas and blits into each subscriber's own 2D canvas. Never call
 * canvas.getContext('webgl*') from a component.
 */

export type WaveParams = {
  /** Wavelength in CSS px. Fringe pitch is λ/2 (crest and trough both draw). */
  lambda: number;
  /** Source separation as a fraction of λ. At or below 0.5 the pair stays a
      near-dipole — Δd never reaches λ, so the bisector is the ONLY null
      seam. Shrinking it widens the seam's angular wedge (the calm opening in
      the band grows); 0.5 keeps the dead zone at the band's edge to roughly
      the gate ring's own diameter, which is the framing the still wants. */
  pairSep: number;
  /** Band axis as a fraction of canvas height — mirrors the CSS --wr-axis. */
  axis: number;
  /** Band half-height as a fraction of canvas height (0.14 → a 28% band). */
  band: number;
  /** How far below the axis the ghost tail survives, fraction of height. */
  reach: number;
  /** Residual fringe strength in the tail below the band, 0..1. The mask is
      deliberately asymmetric (hard feather above, long tail below), matching
      the source still's 20%-top / 34%-bottom band feather. */
  ghost: number;
  /** Fringe stroke width in CSS px. */
  gauge: number;
  /** Max ink coverage of a fringe core, 0..1 — reached only AT the source;
      distance falloff grades it down along the corridor. */
  inkAlpha: number;
  /** 0..1 amount of thin-film pigment the strongest antinodal crests carry. */
  accentAmt: number;
  /** Carrier phase drift in rad/s. 0.035 ≈ one fringe step every 90s —
      near-still by doctrine; the null and the envelope never move at all. */
  drift: number;
  /** Peak of the luminous corridor lift, 0..1 — how far the core moves off
      paper toward `glow`. Keep low: the light is a few % by doctrine. */
  coreLift: number;
  /** Signed chroma amplitude of the thin-film shimmer inside the lift. The
      palette offsets add to `glow` per channel, so on a near-white glow the
      shimmer reads through subtle subtractive tints — pigment, never neon. */
  shimmer: number;
  /** Gate bloom strength, 0..1 — the source's own light. */
  bloom: number;
  /** Gaussian sigma of the tight bloom core, CSS px. A few dozen px: wide
      enough to wrap the DOM gate ring in a halo, never a spotlight. */
  bloomRadius: number;
  /** Gaussian sigma of the wide ambient halo, CSS px. */
  haloRadius: number;
  /** e-folding distance of the emission falloff, CSS px — fringes and light
      are brightest at the source and decay outward on this scale. */
  falloff: number;
  /** Pressed-edge darkening at the corridor boundary, 0..1, multiplicative —
      the exposed strip's frame. */
  press: number;
  ink: [number, number, number];
  paper: [number, number, number];
  /** Color the luminous core lifts toward (near-white and slightly warm on
      paper; a lifted slate on the dark plate). */
  glow: [number, number, number];
  /** Bloom core color — the brightest thing on the page, paper-relative. */
  bloomColor: [number, number, number];
  /** Center of the destructive null in CSS px, canvas-relative, y-down.
      [0, 0] means "not measured yet" and falls back to a low-left default. */
  nullCenter: [number, number];
};

export type WaveFieldHandle = {
  setParams: (patch: Partial<WaveParams>) => void;
  pause: () => void;
  resume: () => void;
  renderStatic: (time?: number) => void;
  destroy: () => void;
};

export type WaveOptions = {
  dpr?: number;
  speed?: number;
  params?: Partial<WaveParams>;
};

export const WAVE_DEFAULTS: WaveParams = {
  lambda: 84,
  pairSep: 0.5,
  axis: 0.36,
  band: 0.14,
  reach: 0.34,
  ghost: 0.1,
  gauge: 1.2,
  inkAlpha: 0.68,
  accentAmt: 0.55,
  drift: 0.035,
  coreLift: 0.85,
  shimmer: 0.06,
  bloom: 0.9,
  bloomRadius: 46,
  haloRadius: 150,
  falloff: 520,
  press: 0.032,
  ink: [0.059, 0.067, 0.075],
  paper: [0.984, 0.984, 0.98],
  glow: [1.0, 0.998, 0.99],
  bloomColor: [1.0, 1.0, 1.0],
  nullCenter: [0, 0],
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
uniform vec2 uS1;
uniform vec2 uS2;
uniform vec2 uGate;
uniform float uK;
uniform float uPhase;
uniform float uAxis;
uniform float uBandHalf;
uniform float uReach;
uniform float uGhost;
uniform float uGauge;
uniform float uInkAlpha;
uniform float uAccentAmt;
uniform float uCoreLift;
uniform float uShimmer;
uniform float uBloom;
uniform float uBloomR;
uniform float uHaloR;
uniform float uFalloff;
uniform float uPress;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uGlow;
uniform vec3 uBloomCol;

out vec4 outColor;

const float PI = 3.14159265358979;

/* The house prismatic cos-palette (src/lib/prismatic-field.ts), normalized
   from its HDR register to a 0..1 pigment — same phase offsets, so the
   thin-film hues here are the same family the light-shell pages trace. */
vec3 filmTint(float ph) {
  return 0.5 + 0.5 * sin(ph - vec3(4.8, -0.4, 1.2));
}

void main() {
  /* y-down pixel coords so DOM measurements map directly. */
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);

  vec2 r1 = px - uS1;
  vec2 r2 = px - uS2;
  float d1 = max(length(r1), 1.0);
  float d2 = max(length(r2), 1.0);

  /* Anti-phased pair: the +PI is the null. Both share one carrier drift, so
     the crests crawl outward while the nodal geometry stays bolted down. */
  float ph1 = uK * d1 - uPhase;
  float ph2 = uK * d2 - uPhase + PI;

  vec2 c = vec2(cos(ph1) + cos(ph2), sin(ph1) + sin(ph2));
  float amp = length(c);
  float theta = atan(c.y, c.x);

  /* Analytic gradient of arg C — exact, and immune to atan's branch cut,
     where screen-space derivatives spike into a one-pixel scar. */
  vec2 g1 = uK * r1 / d1;
  vec2 g2 = uK * r2 / d2;
  vec2 dcx = -sin(ph1) * g1 - sin(ph2) * g2;
  vec2 dcy = cos(ph1) * g1 + cos(ph2) * g2;
  vec2 gradTheta = (c.x * dcy - c.y * dcx) / max(amp * amp, 1e-5);
  float gt = max(length(gradTheta), 1e-6);

  /* Distance in screen px to the nearest fringe line (theta ≡ 0 mod π),
     held at constant gauge regardless of how the field compresses. The
     profile is a touch softer than a hairline: exposed lines, not ruled. */
  float idx = theta / PI;
  float dpx = abs(idx - floor(idx + 0.5)) * PI / gt;
  float aa = 1.0;
  float cover = 1.0 - smoothstep(uGauge * 0.5 - aa * 0.5, uGauge * 0.5 + aa * 1.1, dpx);

  /* Fringe visibility IS interference contrast: |C|/2 is 1 at a perfect
     antinode and 0 on the null, so lines are born and die by physics alone.
     Near the null gradTheta blows up, but vis reaches zero first. */
  float norm = amp * 0.5;
  float vis = smoothstep(0.22, 0.6, norm);

  /* The band: full strength around the axis with a feathered edge, then a
     long low tail below — ghost fringes that let the null read as a decision
     rather than an empty bottom half. Nothing above the band. */
  float dy = px.y - uAxis;
  float ady = abs(dy);
  float bandEnv = 1.0 - smoothstep(uBandHalf * 0.62, uBandHalf, ady);
  float tail = dy > 0.0 ? uGhost * (1.0 - smoothstep(uBandHalf, uReach, dy)) : 0.0;
  float envY = max(bandEnv, tail);

  /* ---------- the light ---------- */

  vec2 rg = px - uGate;
  float dGate = length(rg);

  /* Emission falloff: everything the source casts decays on one scale. */
  float fall = exp(-dGate / uFalloff);

  /* The null as shadow: the same contrast that kills the fringes dims the
     exposure, so the seam through the gate is the ABSENCE of light and the
     headline's calm reads as shade, not as a mask. The shade DEVELOPS with
     distance — near the source its own light floods the seam (no smoky
     blades through the bloom); by the headline the calm is fully open. */
  float shadow = smoothstep(0.06, 0.52, norm);
  float seamGrow = smoothstep(0.25, 1.0, dGate / uFalloff);
  float seam = mix(1.0, shadow, seamGrow);

  /* Luminous corridor: a gaussian exposure around the axis — harder feather
     above, longer below, matching the band mask's own bias — hottest around
     the source and closed fully just past the pressed edge. */
  float cyn = dy > 0.0 ? dy / (uBandHalf * 1.18) : dy / uBandHalf;
  float coreY = exp(-cyn * cyn * 1.7) * (1.0 - smoothstep(uBandHalf * 1.02, uBandHalf * 1.55, ady));
  float hotX = exp(-abs(rg.x) / (2.3 * uFalloff));
  float corridor = coreY * (0.38 + 0.62 * hotX);

  /* The carrier renders as light: cos²(arg C) banding aligned with the
     wavefront lines, so soft light crests sit exactly under the drawn
     fringes and the ink rides ON the light. vis flattens it near the seam
     before gradTheta can alias. */
  float waveBand = 0.5 + 0.5 * cos(2.0 * theta);
  float lift = uCoreLift * corridor * seam * (0.78 + 0.22 * waveBand * vis);

  /* The wide halo is the source's own ambience. The seam grazes it — a
     narrow, shallow dimming (tighter window than the corridor's shadow), so
     the null stays legible through the light without carving black blades
     out of it — and it is clipped softly so it never escapes the corridor's
     frame. */
  float halo = exp(-(dGate * dGate) / (uHaloR * uHaloR));
  halo *= 1.0 - smoothstep(uBandHalf * 1.12, uBandHalf * 1.9, ady);
  halo *= mix(1.0, 0.55 + 0.45 * smoothstep(0.02, 0.3, norm), seamGrow);
  lift = min(lift + uBloom * halo * 0.45, 1.0);

  /* Thin-film shimmer: pigment keyed on the slow path-sum phase, drifting
     with the carrier — an analytic low-frequency term, never noise. The
     offsets are luma-free (mean-subtracted) so the tint never dips the light
     into gray, and the film DEVELOPS with distance — the source itself stays
     neutral white, hue arriving as the wave travels. */
  float specPh = (d1 + d2) * uK * 0.085 + uPhase * 0.55;
  vec3 film = filmTint(specPh);
  float developed = 1.0 - exp(-dGate / uFalloff);
  vec3 tintOff = film - vec3(dot(film, vec3(1.0 / 3.0)));
  vec3 glowCol = uGlow + tintOff * (uShimmer * developed);

  vec3 bg = mix(uPaper, glowCol, clamp(lift, 0.0, 1.0));

  /* Pressed edge: the exposed strip's frame — a faint multiplicative
     darkening peaking exactly where the fringes die (the band boundary), so
     it reads as the exposure densifying at the strip's edge rather than a
     detached fog line. It follows the exposure — fading with the shadow and
     away from the hot center — so the seam's opening stays open and the far
     rail ends stay clean. */
  float pressBand = smoothstep(uBandHalf * 0.82, uBandHalf, ady)
    * (1.0 - smoothstep(uBandHalf, uBandHalf * 1.32, ady));
  float pressX = exp(-abs(rg.x) / (1.5 * uFalloff));
  float press = uPress * pressBand * (0.12 + 0.88 * pressX) * (0.2 + 0.8 * shadow);
  bg *= 1.0 - press;

  /* Fringe ink, intensity-graded by the emission falloff — strongest lines
     at the source, decaying along the corridor. */
  float grade = mix(0.4, 1.0, fall);
  float aOut = clamp(cover * vis * envY * uInkAlpha * grade, 0.0, 1.0);

  /* The chroma: antinodal crest lines (every other ring) carry the same
     thin-film pigment as the shimmer, mixed toward ink so it stays pigment,
     strongest against the antinodal axis and near the source. */
  float crest = 1.0 - mod(floor(idx + 0.5), 2.0);
  float accentMask = crest * smoothstep(0.8, 0.99, norm) * uAccentAmt * (0.3 + 0.7 * fall);
  vec3 pigment = mix(film, uInk, 0.42);
  vec3 lineCol = mix(uInk, pigment, accentMask);

  vec3 col = mix(bg, lineCol, aOut);

  /* The source itself: a tight bloom composited over the ink, so the fringes
     nearest the gate lift INTO the light — the DOM mark sits in a halo. */
  float bloomCore = exp(-(dGate * dGate) / (uBloomR * uBloomR));
  col = mix(col, uBloomCol, uBloom * bloomCore);

  outColor = vec4(col, 1.0);
}
`;

type Engine = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  draw: (width: number, height: number, time: number, params: WaveParams, dpr: number) => HTMLCanvasElement;
};

type Subscriber = {
  target: HTMLCanvasElement;
  blit: CanvasRenderingContext2D;
  params: WaveParams;
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
  if (!shader) throw new Error('interference: could not create shader');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`interference compile: ${gl.getShaderInfoLog(shader)}`);
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
  const uS1 = loc('uS1');
  const uS2 = loc('uS2');
  const uGate = loc('uGate');
  const uK = loc('uK');
  const uPhase = loc('uPhase');
  const uAxis = loc('uAxis');
  const uBandHalf = loc('uBandHalf');
  const uReach = loc('uReach');
  const uGhost = loc('uGhost');
  const uGauge = loc('uGauge');
  const uInkAlpha = loc('uInkAlpha');
  const uAccentAmt = loc('uAccentAmt');
  const uCoreLift = loc('uCoreLift');
  const uShimmer = loc('uShimmer');
  const uBloom = loc('uBloom');
  const uBloomR = loc('uBloomR');
  const uHaloR = loc('uHaloR');
  const uFalloff = loc('uFalloff');
  const uPress = loc('uPress');
  const uInk = loc('uInk');
  const uPaper = loc('uPaper');
  const uGlow = loc('uGlow');
  const uBloomCol = loc('uBloomCol');

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

      /* Source placement, derived per draw so it tracks resizes for free.
         The pair's midpoint IS the gate at (50%, axis): the fringe family —
         confocal ellipses around the pair — becomes rings radiating from the
         gate, so the band fills evenly across its full width. The baseline
         is set perpendicular to the gate→headline direction, which makes the
         perpendicular bisector — the dipole's exact null — the line from the
         gate through the measured headline center. */
      const axisPx = params.axis * height;
      const gx = width * 0.5;
      const gy = axisPx;
      let nx = params.nullCenter[0] * dpr;
      let ny = params.nullCenter[1] * dpr;
      if (nx < 1 && ny < 1) {
        nx = width * 0.3;
        ny = height * 0.78;
      }
      let ux = nx - gx;
      let uy = ny - gy;
      const ulen = Math.max(Math.hypot(ux, uy), 1);
      ux /= ulen;
      uy /= ulen;
      /* The headline must sit below the gate for the geometry to make sense;
         if a viewport ever folds it above, fall back to a steep default. */
      if (uy < 0.2) {
        ux = -0.38;
        uy = 0.93;
      }
      const sep = params.pairSep * params.lambda * dpr;
      const vx = -uy;
      const vy = ux;
      const pxc = gx;
      const pyc = gy;

      ctx.viewport(0, 0, width, height);
      ctx.uniform2f(uResolution, width, height);
      ctx.uniform2f(uS1, pxc + (vx * sep) / 2, pyc + (vy * sep) / 2);
      ctx.uniform2f(uS2, pxc - (vx * sep) / 2, pyc - (vy * sep) / 2);
      ctx.uniform2f(uGate, gx, gy);
      ctx.uniform1f(uK, (2 * Math.PI) / (params.lambda * dpr));
      ctx.uniform1f(uPhase, params.drift * time);
      ctx.uniform1f(uAxis, axisPx);
      ctx.uniform1f(uBandHalf, params.band * height);
      ctx.uniform1f(uReach, params.reach * height);
      ctx.uniform1f(uGhost, params.ghost);
      ctx.uniform1f(uGauge, params.gauge * dpr);
      ctx.uniform1f(uInkAlpha, params.inkAlpha);
      ctx.uniform1f(uAccentAmt, params.accentAmt);
      ctx.uniform1f(uCoreLift, params.coreLift);
      ctx.uniform1f(uShimmer, params.shimmer);
      ctx.uniform1f(uBloom, params.bloom);
      ctx.uniform1f(uBloomR, params.bloomRadius * dpr);
      ctx.uniform1f(uHaloR, params.haloRadius * dpr);
      ctx.uniform1f(uFalloff, params.falloff * dpr);
      ctx.uniform1f(uPress, params.press);
      ctx.uniform3f(uInk, params.ink[0], params.ink[1], params.ink[2]);
      ctx.uniform3f(uPaper, params.paper[0], params.paper[1], params.paper[2]);
      ctx.uniform3f(uGlow, params.glow[0], params.glow[1], params.glow[2]);
      ctx.uniform3f(uBloomCol, params.bloomColor[0], params.bloomColor[1], params.bloomColor[2]);
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
export function createWaveField(
  canvas: HTMLCanvasElement,
  options: WaveOptions = {}
): WaveFieldHandle | null {
  if (!getEngine()) return null;

  const blit = canvas.getContext('2d');
  if (!blit) return null;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...WAVE_DEFAULTS, ...options.params },
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
