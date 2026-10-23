/* WGSL for the press covers: Glyphfield's Fluid Energy material (a stable
   fluids solver after Pavel Dobryakov's MIT-licensed WebGL Fluid
   Simulation) ported from its GLSL ES passes to WebGPU. The solver runs in
   texture space with +y down, which mirrors the fluid and changes nothing
   else. The display pass shades the dye as Glyphfield does, prints it in
   three of the cover's inks through an 8x8 Bayer screen, and sets the
   cover's type over it in the paper ink. */

export const FLUID_UNIFORM_BYTES = 208;
export const FLUID_SLOT_BYTES = 256;

export const FLUID_WGSL = /* wgsl */ `
struct P {
  texel: vec2f,
  dt: f32,
  curl: f32,
  velTexel: vec2f,
  dissipation: f32,
  edgeFade: f32,
  aspect: f32,
  count: f32,
  value: f32,
  time: f32,
  bg: vec4f,
  paper: vec4f,
  points: array<vec4f, 4>,
  values: array<vec4f, 4>,
};

@group(0) @binding(0) var<uniform> u: P;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var texA: texture_2d<f32>;
@group(0) @binding(3) var texB: texture_2d<f32>;

struct V {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vs(@builtin(vertex_index) i: u32) -> V {
  var corners = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  let p = corners[i];
  var o: V;
  o.pos = vec4f(p, 0.0, 1.0);
  o.uv = vec2f(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  return o;
}

fn ta(uv: vec2f) -> vec4f { return textureSampleLevel(texA, samp, uv, 0.0); }
fn tb(uv: vec2f) -> vec4f { return textureSampleLevel(texB, samp, uv, 0.0); }

@fragment
fn emit(i: V) -> @location(0) vec4f {
  var value = ta(i.uv).xyz;
  for (var k = 0; k < 4; k++) {
    if (f32(k) < u.count) {
      var delta = i.uv - u.points[k].xy;
      delta.x *= u.aspect;
      value += exp(-dot(delta, delta) / u.points[k].z) * u.values[k].xyz;
    }
  }
  return vec4f(value, 1.0);
}

@fragment
fn curl(i: V) -> @location(0) vec4f {
  let t = u.texel;
  let left = ta(i.uv - vec2f(t.x, 0.0)).y;
  let right = ta(i.uv + vec2f(t.x, 0.0)).y;
  let top = ta(i.uv + vec2f(0.0, t.y)).x;
  let bottom = ta(i.uv - vec2f(0.0, t.y)).x;
  return vec4f(0.5 * (right - left - top + bottom), 0.0, 0.0, 1.0);
}

@fragment
fn vorticity(i: V) -> @location(0) vec4f {
  let t = u.texel;
  let left = tb(i.uv - vec2f(t.x, 0.0)).x;
  let right = tb(i.uv + vec2f(t.x, 0.0)).x;
  let top = tb(i.uv + vec2f(0.0, t.y)).x;
  let bottom = tb(i.uv - vec2f(0.0, t.y)).x;
  let center = tb(i.uv).x;
  var force = 0.5 * vec2f(abs(top) - abs(bottom), abs(right) - abs(left));
  force = force / (length(force) + 0.0001) * u.curl * center;
  force.y = -force.y;
  let velocity = ta(i.uv).xy + force * u.dt;
  return vec4f(clamp(velocity, vec2f(-1000.0), vec2f(1000.0)), 0.0, 1.0);
}

@fragment
fn divergence(i: V) -> @location(0) vec4f {
  let t = u.texel;
  let center = ta(i.uv).xy;
  var left = ta(i.uv - vec2f(t.x, 0.0)).x;
  var right = ta(i.uv + vec2f(t.x, 0.0)).x;
  var top = ta(i.uv + vec2f(0.0, t.y)).y;
  var bottom = ta(i.uv - vec2f(0.0, t.y)).y;
  left = select(left, -center.x, i.uv.x - t.x < 0.0);
  right = select(right, -center.x, i.uv.x + t.x > 1.0);
  top = select(top, -center.y, i.uv.y + t.y > 1.0);
  bottom = select(bottom, -center.y, i.uv.y - t.y < 0.0);
  return vec4f(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
}

@fragment
fn scale(i: V) -> @location(0) vec4f {
  return u.value * ta(i.uv);
}

@fragment
fn pressure(i: V) -> @location(0) vec4f {
  let t = u.texel;
  let left = ta(i.uv - vec2f(t.x, 0.0)).x;
  let right = ta(i.uv + vec2f(t.x, 0.0)).x;
  let top = ta(i.uv + vec2f(0.0, t.y)).x;
  let bottom = ta(i.uv - vec2f(0.0, t.y)).x;
  let div = tb(i.uv).x;
  return vec4f((left + right + bottom + top - div) * 0.25, 0.0, 0.0, 1.0);
}

@fragment
fn gradient(i: V) -> @location(0) vec4f {
  let t = u.texel;
  let left = ta(i.uv - vec2f(t.x, 0.0)).x;
  let right = ta(i.uv + vec2f(t.x, 0.0)).x;
  let top = ta(i.uv + vec2f(0.0, t.y)).x;
  let bottom = ta(i.uv - vec2f(0.0, t.y)).x;
  let velocity = tb(i.uv).xy - vec2f(right - left, top - bottom);
  return vec4f(velocity, 0.0, 1.0);
}

@fragment
fn advect(i: V) -> @location(0) vec4f {
  let coord = i.uv - u.dt * ta(i.uv).xy * u.velTexel;
  // extra decay near the walls stops dye pooling along the frame
  let edge = min(i.uv, 1.0 - i.uv);
  let wall = 1.0 - smoothstep(0.0, 0.06, min(edge.x, edge.y));
  return tb(coord) / (1.0 + (u.dissipation + wall * u.edgeFade) * u.dt);
}

fn hash12(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn toSrgb(c: vec3f) -> vec3f {
  let x = max(c, vec3f(0.0));
  return select(1.055 * pow(x, vec3f(1.0 / 2.4)) - 0.055, x * 12.92, x < vec3f(0.0031308));
}

fn shoulder(c: vec3f) -> vec3f {
  let peak = max(max(c.r, c.g), c.b);
  if (peak <= 0.82) { return c; }
  let mapped = 0.82 + 0.18 * (1.0 - exp(-(peak - 0.82) / 0.18));
  return mix(c * (mapped / peak), vec3f(mapped), clamp((peak - 1.0) * 0.3, 0.0, 0.55));
}

fn bayer8(c: vec2f) -> f32 {
  let x = u32(c.x) & 7u;
  let y = u32(c.y) & 7u;
  let v = x ^ y;
  let b = ((v & 1u) << 5u) | ((y & 1u) << 4u) | ((v & 2u) << 2u) | ((y & 2u) << 1u) | ((v & 4u) >> 1u) | ((y & 4u) >> 2u);
  return (f32(b) + 0.5) / 64.0;
}

fn luma(c: vec3f) -> f32 { return dot(c, vec3f(0.2126, 0.7152, 0.0722)); }

/* The fluid, shaded as Glyphfield shades it, read at the centre of one
   dither cell. */
fn shade(uv: vec2f) -> vec3f {
  let t = u.texel;
  let dye = max(ta(uv).rgb, vec3f(0.0));
  // the dye's brightness gradient read as a soft surface normal, lit from the upper left
  let left = length(ta(uv - vec2f(t.x, 0.0)).rgb);
  let right = length(ta(uv + vec2f(t.x, 0.0)).rgb);
  let up = length(ta(uv - vec2f(0.0, t.y)).rgb);
  let down = length(ta(uv + vec2f(0.0, t.y)).rgb);
  let normal = normalize(vec3f(right - left, up - down, length(t) * 18.0));
  let shading = clamp(dot(normal, normalize(vec3f(-0.35, 0.45, 1.0))) + 0.18, 0.55, 1.15);
  var color = u.bg.rgb + dye * shading * 1.45;
  color = shoulder(color * pow(max(u.bg.w, 0.0), 2.2));
  return clamp(toSrgb(color), vec3f(0.0), vec3f(1.0));
}

@fragment
fn display(i: V) -> @location(0) vec4f {
  let res = u.velTexel;
  // the house material: three of the cover's own inks through an 8x8 Bayer screen, one cell at a time
  let size = max(1.0, u.points[0].x);
  let cell = floor(i.pos.xy / size);
  let centre = (cell + 0.5) * size / res;
  // the type's coverage rides in green, the crisp art in blue; the emblem's in red, read at the cell's centre so it
  // dithers with the fluid, unless the cover prints its red as a solid accent ink (points[1].w)
  let ink = tb(i.uv).g;
  let art = tb(i.uv).b;
  let accent = u.points[1];
  let solid = accent.w > 0.5;
  let emblem = select(tb(centre).r, 0.0, solid);
  // zoomed in on the middle of the fluid, so a cover carries a few large currents
  let zoom = select(1.0, u.points[0].w, u.points[0].w > 0.0);
  let lit = shade(0.5 + (centre - 0.5) * zoom);
  let inkA = u.values[0].rgb;
  let inkB = u.values[1].rgb;
  let inkC = u.values[2].rgb;
  var tone = clamp((luma(lit) - luma(inkA)) / max(luma(inkC) - luma(inkA), 0.05), 0.0, 1.0);
  // calmed overall, and quieter still under the title at the foot and the line at the head
  let calm = select(1.0, u.points[0].z, u.points[0].z > 0.0);
  tone *= calm;
  tone *= mix(1.0, 0.3, smoothstep(0.52, 0.92, centre.y)) * mix(0.55, 1.0, smoothstep(0.02, 0.16, centre.y));
  // the emblem prints over the quieted fluid in the cover's lighter inks
  tone = mix(tone, 0.4 + 0.6 * emblem, emblem * 0.9);
  let threshold = bayer8(cell);
  let level = min(tone * 2.0, 1.999);
  let step2 = floor(level) + step(threshold, fract(level));
  // the fluid's dots print in inks drawn halfway to the ground, so it sits back; the emblem keeps the full inks
  let soft = mix(0.5, 1.0, emblem);
  let dotB = mix(inkA, inkB, soft);
  let dotC = mix(inkA, inkC, soft);
  var d = select(select(dotC, dotB, step2 < 1.5), inkA, step2 < 0.5);
  if (u.points[0].y < 0.5) {
    d = lit;
  }
  // the art in its own solid ink, then the accent, then the type in the paper ink, screened a little darker where the fluid runs bright
  d = mix(d, u.values[3].rgb, art);
  if (solid) {
    d = mix(d, accent.rgb, tb(i.uv).r);
  }
  let letter = select(u.paper.rgb, u.paper.rgb * 0.8, tone > threshold + 0.35);
  d = mix(d, letter, ink);
  return vec4f(d, 1.0);
}
`;
