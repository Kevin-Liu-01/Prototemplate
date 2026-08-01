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
 * everything. w(r) is 1 inside and decays smoothly to 0 by 1.55 rim units, so
 * the warp has compact support and the canvas composites seamlessly with the
 * flat paper around it.
 *
 * Layers, back to front: the page's ruled hairlines re-rendered at the lensed
 * coordinate (fading to the CSS layer over 1.46→1.66 rim units, coverage
 * collapsing to a mean-ink wash where lensing crowds rules together); the
 * three guide rings, lensed the same way (per-direction visibility via the
 * ringAlpha param); the genuinely dark core; the accretion streak field in the
 * house trace palette, tanh tone map, doppler-weighted toward the lower-left
 * flank; the photon ring — near-white hairline, warm spectral glow, wide rim
 * bleed. Everything analytic; output premultiplied; a ±0.5/255 hash dither
 * kills banding.
 *
 * ARCHITECTURE — the house rule: exactly ONE WebGL context for this module per
 * session, shared by every subscriber (per-component contexts exhausted the
 * browser's ~16-context budget and went silently black). Subscribers register
 * here; the engine draws into one offscreen GL canvas and blits into each
 * subscriber's own 2D canvas.
 *
 * WEIGHT — the GLSL below is the MINIFIED build of the readable master kept in
 * the comment right above it (string literals ship verbatim; comments do not).
 * All parameters neither hero ever changes are folded in as literals; only
 * resolution/time/dpr, the disc geometry, the ink and the ring visibilities
 * remain uniforms. Keep `#version` on the literal's first line — a leading
 * newline kills the compile silently and the DOM fallback disc shows instead.
 */

export type HorizonParams = {
  /** Disc center in CSS px, canvas-relative, y-down. */
  center: [number, number];
  /** Horizon (rim) radius in CSS px; below 2 the shader draws nothing. */
  radius: number;
  /** Hero-space CSS-px position of this canvas's top-left corner. */
  worldOrigin: [number, number];
  /** Ink coverage of each guide ring (zeroed per direction). */
  ringAlpha: [number, number, number];
  /** The page's structural ink — bent rules and rings follow the theme. */
  ink: [number, number, number];
};

export type HorizonFieldHandle = {
  setParams: (patch: Partial<HorizonParams>) => void;
  destroy: () => void;
};

export type HorizonOptions = {
  dpr?: number;
  speed?: number;
  params?: Partial<HorizonParams>;
};

const DEFAULTS: HorizonParams = {
  center: [0, 0],
  radius: 0,
  worldOrigin: [0, 0],
  ringAlpha: [0.09, 0.063, 0.037],
  ink: [0.059, 0.067, 0.075],
};

/* An instant where the streak field is mid-arc and the breathe term is near
   zero — the reduced-motion still and any pre-measure frame use this. */
const STATIC_TIME = 11.3;

/* Uniforms, in upload order: resolution, time, center, radius, worldOrigin,
   dpr, ringAlpha, ink. */
const U = ['uR', 'uT', 'uC', 'uZ', 'uW', 'uD', 'uG', 'uI'] as const;

const VERT = `#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

/* READABLE MASTER of the fragment shader — edit THIS, then re-minify into
   FRAG below (fold nothing new: the folded literals are the old defaults —
   pitch 44, gauge 1 (both ×dpr = uD), ruleAlpha .07, fades 1.46→1.66, ring
   radii (1.24, 1.55, 1.94), deflEnd 1.55, swirl 1.15, exposure 2.1, chroma
   .55, doppler .62, dopplerDir (cos 2.55, sin 2.55) = (-0.830053508, 0.557683706),
   breathe .006, period 7.2, core (.02, .027, .043)):

precision highp float;
uniform vec2 uR;   // resolution (device px)
uniform float uT;  // seconds
uniform vec2 uC;   // disc center, device px
uniform float uZ;  // rim radius, device px
uniform vec2 uW;   // world origin of the canvas, device px
uniform float uD;  // device pixel ratio (gauge = 1css px = uD device px)
uniform vec3 uG;   // guide-ring alphas
uniform vec3 uI;   // structural ink
out vec4 O;
vec3 pal(float p){ return .9 + sin(p*1.3 - vec3(4.8,-.4,1.2)); }        // house trace palette
vec3 tm(vec3 h){                                                         // house tanh tone map, exposure 2.1
  vec3 v = clamp(h/2.1, vec3(-10.), vec3(10.));
  vec3 e = exp(2.*v);
  return clamp((e-1.)/max(e+1., vec3(1e-4)), 0., 1.);
}
void lay(inout vec4 a, vec3 c, float f){                                 // OVER onto premultiplied acc
  a.rgb = c*f + a.rgb*(1.-f);
  a.a   = f  + a.a  *(1.-f);
}
float st(float d, float g){ return 1.-smoothstep(g*.5-.35, g*.5+.9, d); } // stroke coverage
void main(){
  vec2 px = vec2(gl_FragCoord.x, uR.y-gl_FragCoord.y);                   // y-down device px
  float on = step(2., uZ);
  float R  = max(uZ,1.)*(1.+.006*sin(uT*6.2831853/7.2));                 // breathe
  vec2 d   = px-uC;
  float rc = length(d);
  float r  = rc/R;
  vec2 nd  = d/max(rc,1e-4);
  float th = atan(d.y,d.x);
  float wO = pow(1.-smoothstep(1.,1.55,r),1.6);                          // compact-support deflection
  float w  = mix(wO,1.,step(r,1.))*on;
  float rs = r-w/max(r,1e-3);
  vec2 ps  = nd*rs;
  float wy = uW.y+uC.y+ps.y*R;                                           // world y of the source sample
  float rho= (wy-uD*.5)/(44.*uD);                                        // rule lattice (pitch 44css, gauge 1css)
  float gp = max(length(vec2(dFdx(rho),dFdy(rho))),1e-6);
  float rp = abs(rho-floor(rho+.5))/gp;
  float rc2= st(rp,uD);
  float dn2= clamp(uD*gp,0.,1.);                                         // crowd → mean-ink wash
  float cw = smoothstep(.3,.75,dn2);
  float rA = .07*mix(rc2,dn2,cw)*(1.-smoothstep(1.46,1.66,r))*on;        // rules fade to the CSS layer
  float gr = max(length(vec2(dFdx(rs),dFdy(rs))),1e-6);
  vec3 RR  = vec3(1.24,1.55,1.94);                                       // guide-ring radii, rim units
  vec3 rgA = uG*vec3(st(abs(rs-RR.x)/gr,uD),st(abs(rs-RR.y)/gr,uD),st(abs(rs-RR.z)/gr,uD));
  float gA = max(rgA.x,max(rgA.y,rgA.z))*on*step(1.,r)*(1.-smoothstep(1.46,1.66,r));
  float s  = abs(rs);
  float tS = th+step(rs,0.)*3.14159265;                                  // source-plane angle (flips inside)
  float sw = 1.15/(s+.32);                                               // frame-drag swirl
  float b1 = sin(tS*3.+sw+s*5.-uT*.52+1.7);
  float b2 = sin(tS*7.-sw*1.6-s*9.+uT*.74);
  float b3 = sin(tS*13.+s*16.-uT*1.12+4.1);
  float sk = .5+.5*(.56*b1+.3*b2+.14*b3);
  sk = sk*sk; sk = sk*sk;
  float pf = exp(-s*s*2.);
  float mu = clamp(1./(s+.06),0.,10.);
  float fl = dot(nd,vec2(-.8300535,.5576837));                             // doppler flank (angle 2.55)
  float dp = 1.+.62*fl;
  float rx = rc-R;
  float nt = smoothstep(-2.*uD,-9.*uD,rx);                               // dark notch off the hairline
  float ev = mix(exp(-(r-1.)*5.4), smoothstep(.6,.97,r)*.38*nt, step(r,1.));
  float I  = pf*(.16+1.55*sk)*mu*dp*ev*on;
  vec3 tn  = mix(vec3(1.), clamp(pal(s*2.6+1.4*sin(tS)+sk*2.1+.35*fl+.4),0.,2.), .55);
  // ^ periodic BEFORE pal (pal scales phase by 1.3) — sin(tS), never raw theta
  vec3 h   = tn*I;
  float ha = exp(-.5*pow(rx/(1.6*uD),2.));                               // photon-ring hairline
  float gl = exp(-abs(rx)/(7.5*uD));                                     // warm glow
  float bl = exp(-abs(rx)/(26.*uD));                                     // wide rim bleed
  float rd = 1.+.6*.62*fl;                                                 // .6*doppler
  h += (ha*10.*vec3(1.,.99,.96)+gl*1.5*mix(vec3(1.,.9,.74),clamp(pal(.5*fl+1.9),0.,2.),.35)+bl*.3*vec3(1.,.88,.7))*rd*on;
  vec3 L   = tm(h);
  float lA = max(L.r,max(L.g,L.b));
  vec3 lC  = L/max(lA,1e-4);
  vec4 a   = vec4(0.);
  lay(a,uI,rA);
  lay(a,uI,gA);
  lay(a,vec3(.02,.027,.043),(1.-smoothstep(0.,1.6*uD,rx))*on);           // the core
  lay(a,lC,lA);
  float z  = fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
  a.rgb += vec3((z-.5)/255.)*a.a;                                        // hash dither
  O = a;
}
*/
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uR;uniform float uT;uniform vec2 uC;uniform float uZ;uniform vec2 uW;uniform float uD;uniform vec3 uG;uniform vec3 uI;out vec4 O;
vec3 pal(float p){return .9+sin(p*1.3-vec3(4.8,-.4,1.2));}
vec3 tm(vec3 h){vec3 v=clamp(h/2.1,vec3(-10.),vec3(10.));vec3 e=exp(2.*v);return clamp((e-1.)/max(e+1.,vec3(1e-4)),0.,1.);}
void lay(inout vec4 a,vec3 c,float f){a.rgb=c*f+a.rgb*(1.-f);a.a=f+a.a*(1.-f);}
float st(float d,float g){return 1.-smoothstep(g*.5-.35,g*.5+.9,d);}
void main(){
vec2 px=vec2(gl_FragCoord.x,uR.y-gl_FragCoord.y);
float on=step(2.,uZ);
float R=max(uZ,1.)*(1.+.006*sin(uT*6.2831853/7.2));
vec2 d=px-uC;
float rc=length(d);
float r=rc/R;
vec2 nd=d/max(rc,1e-4);
float th=atan(d.y,d.x);
float wO=pow(1.-smoothstep(1.,1.55,r),1.6);
float w=mix(wO,1.,step(r,1.))*on;
float rs=r-w/max(r,1e-3);
vec2 ps=nd*rs;
float wy=uW.y+uC.y+ps.y*R;
float rho=(wy-uD*.5)/(44.*uD);
float gp=max(length(vec2(dFdx(rho),dFdy(rho))),1e-6);
float rp=abs(rho-floor(rho+.5))/gp;
float rc2=st(rp,uD);
float dn2=clamp(uD*gp,0.,1.);
float cw=smoothstep(.3,.75,dn2);
float rA=.07*mix(rc2,dn2,cw)*(1.-smoothstep(1.46,1.66,r))*on;
float gr=max(length(vec2(dFdx(rs),dFdy(rs))),1e-6);
vec3 RR=vec3(1.24,1.55,1.94);
vec3 rgA=uG*vec3(st(abs(rs-RR.x)/gr,uD),st(abs(rs-RR.y)/gr,uD),st(abs(rs-RR.z)/gr,uD));
float gA=max(rgA.x,max(rgA.y,rgA.z))*on*step(1.,r)*(1.-smoothstep(1.46,1.66,r));
float s=abs(rs);
float tS=th+step(rs,0.)*3.14159265;
float sw=1.15/(s+.32);
float b1=sin(tS*3.+sw+s*5.-uT*.52+1.7);
float b2=sin(tS*7.-sw*1.6-s*9.+uT*.74);
float b3=sin(tS*13.+s*16.-uT*1.12+4.1);
float sk=.5+.5*(.56*b1+.3*b2+.14*b3);
sk=sk*sk;sk=sk*sk;
float pf=exp(-s*s*2.);
float mu=clamp(1./(s+.06),0.,10.);
float fl=dot(nd,vec2(-.8300535,.5576837));
float dp=1.+.62*fl;
float rx=rc-R;
float nt=smoothstep(-2.*uD,-9.*uD,rx);
float ev=mix(exp(-(r-1.)*5.4),smoothstep(.6,.97,r)*.38*nt,step(r,1.));
float I=pf*(.16+1.55*sk)*mu*dp*ev*on;
vec3 tn=mix(vec3(1.),clamp(pal(s*2.6+1.4*sin(tS)+sk*2.1+.35*fl+.4),0.,2.),.55);
vec3 h=tn*I;
float ha=exp(-.5*pow(rx/(1.6*uD),2.));
float gl=exp(-abs(rx)/(7.5*uD));
float bl=exp(-abs(rx)/(26.*uD));
float rd=1.+.6*.62*fl;
h+=(ha*10.*vec3(1.,.99,.96)+gl*1.5*mix(vec3(1.,.9,.74),clamp(pal(.5*fl+1.9),0.,2.),.35)+bl*.3*vec3(1.,.88,.7))*rd*on;
vec3 L=tm(h);
float lA=max(L.r,max(L.g,L.b));
vec3 lC=L/max(lA,1e-4);
vec4 a=vec4(0.);
lay(a,uI,rA);
lay(a,uI,gA);
lay(a,vec3(.02,.027,.043),(1.-smoothstep(0.,1.6*uD,rx))*on);
lay(a,lC,lA);
float z=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
a.rgb+=vec3((z-.5)/255.)*a.a;
O=a;
}`;

type Engine = {
  canvas: HTMLCanvasElement;
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

/** Builds the one shared context, or returns null once we know it cannot work. */
function getEngine(): Engine | null {
  if (engine) return engine;
  if (engineFailed) return null;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      /* transparent annulus; read back via drawImage in the same task */
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    }) as WebGL2RenderingContext | null;
    if (!gl) throw 0;

    const program = gl.createProgram();
    if (!program) throw 0;
    for (const [type, src] of [
      [gl.VERTEX_SHADER, VERT],
      [gl.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw 0;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw 0;
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw 0;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const [uR, uT, uC, uZ, uW, uD, uG, uI] = U.map((name) =>
      gl.getUniformLocation(program, name)
    );

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      engine = null;
    });

    engine = {
      canvas,
      draw(width, height, time, params, dpr) {
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        gl.viewport(0, 0, width, height);
        gl.uniform2f(uR, width, height);
        gl.uniform1f(uT, time);
        gl.uniform2f(uC, params.center[0] * dpr, params.center[1] * dpr);
        gl.uniform1f(uZ, params.radius * dpr);
        gl.uniform2f(uW, params.worldOrigin[0] * dpr, params.worldOrigin[1] * dpr);
        gl.uniform1f(uD, dpr);
        gl.uniform3f(uG, params.ringAlpha[0], params.ringAlpha[1], params.ringAlpha[2]);
        gl.uniform3f(uI, params.ink[0], params.ink[1], params.ink[2]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        return canvas;
      },
    };
    return engine;
  } catch {
    engineFailed = true;
    return null;
  }
}

function renderSubscriber(sub: Subscriber, time: number) {
  const active = getEngine();
  if (!active) return;
  const width = Math.max(1, Math.floor((sub.target.clientWidth || 1) * sub.dpr));
  const height = Math.max(1, Math.floor((sub.target.clientHeight || 1) * sub.dpr));
  if (sub.target.width !== width || sub.target.height !== height) {
    sub.target.width = width;
    sub.target.height = height;
  }
  const source = active.draw(width, height, time, sub.params, sub.dpr);
  /* the field carries alpha; clear so last frame's glow never accumulates */
  sub.blit.clearRect(0, 0, width, height);
  sub.blit.drawImage(source, 0, 0);
}

function tick(now: number) {
  frameId = 0;
  if (!document.hidden) {
    for (const sub of subscribers) {
      if (sub.running && sub.visible)
        renderSubscriber(sub, ((now - sub.startTime) / 1000) * sub.speed);
    }
  }
  schedule();
}

function schedule() {
  if (frameId) return;
  for (const sub of subscribers) {
    if (sub.running && sub.visible) {
      frameId = requestAnimationFrame(tick);
      return;
    }
  }
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

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sub: Subscriber = {
    target: canvas,
    blit,
    params: { ...DEFAULTS, ...options.params },
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
    destroy() {
      sub.observer?.disconnect();
      subscribers.delete(sub);
      /* the engine context is deliberately kept for the session — tearing it
         down per unmount is what exhausted the browser's context budget */
    },
  };
}
