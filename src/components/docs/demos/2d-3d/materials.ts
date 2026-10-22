import { AddEquation, CustomBlending, OneFactor, ShaderMaterial, Vector3 } from 'three';
import type { Texture } from 'three';

/**
 * The three materials the dither stage's scenes draw with. Each writes data
 * into the stage's target (dither-stage.ts): red the light, green the
 * accent mark, blue a hairline's strength, alpha that a surface is there.
 *
 * - inkMaterial: a lambert term with a soft specular over an ambient floor,
 *   lit by one direction that the scene shares between its materials. Its
 *   faces are pushed back by a polygon offset so the hairlines drawn on
 *   their edges always win the depth test.
 * - lineMaterial: hairlines. It adds to blue (and to green for an accent
 *   line) and leaves the light and coverage under it untouched, so a cell
 *   keeps the tone of the face the line runs across.
 * - glyphMaterial: artwork laid in a face (glyphs, dots), drawn the same
 *   additive way from a texture's alpha.
 */

export type LightUniform = { value: Vector3 };

export function lightUniform(): LightUniform {
  return { value: new Vector3(-0.4, 0.75, 0.5).normalize() };
}

const INK_VERT = `
varying vec3 vN;
varying vec3 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const INK_FRAG = `
uniform vec3 uLight;
uniform float uAmbient;
uniform float uSpec;
uniform float uShine;
uniform float uAccent;
varying vec3 vN;
varying vec3 vW;
void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  vec3 v = normalize(cameraPosition - vW);
  float d = max(dot(n, uLight), 0.0);
  float s = pow(max(dot(n, normalize(uLight + v)), 0.0), uShine) * uSpec;
  gl_FragColor = vec4(clamp(uAmbient + (1.0 - uAmbient) * d + s, 0.0, 1.0), uAccent, 0.0, 1.0);
}
`;

export type InkMaterialOptions = {
  light: LightUniform;
  ambient?: number;
  spec?: number;
  shine?: number;
  accent?: boolean;
};

export function inkMaterial({ light, ambient = 0.12, spec = 0.18, shine = 36, accent = false }: InkMaterialOptions): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uLight: light,
      uAmbient: { value: ambient },
      uSpec: { value: spec },
      uShine: { value: shine },
      uAccent: { value: accent ? 1 : 0 },
    },
    vertexShader: INK_VERT,
    fragmentShader: INK_FRAG,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
}

const LINE_VERT = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LINE_FRAG = `
uniform float uStrength;
uniform float uAccent;
void main() {
  gl_FragColor = vec4(0.0, uAccent, uStrength, 0.0);
}
`;

const ADDITIVE = {
  transparent: true,
  depthWrite: false,
  blending: CustomBlending,
  blendEquation: AddEquation,
  blendSrc: OneFactor,
  blendDst: OneFactor,
} as const;

export function lineMaterial(strength: number, accent = false): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uStrength: { value: strength }, uAccent: { value: accent ? 1 : 0 } },
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    ...ADDITIVE,
  });
}

const GLYPH_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GLYPH_FRAG = `
uniform sampler2D uMap;
uniform float uStrength;
varying vec2 vUv;
void main() {
  if (texture2D(uMap, vUv).a < 0.5) discard;
  gl_FragColor = vec4(0.0, 0.0, uStrength, 0.0);
}
`;

export function glyphMaterial(map: Texture, strength = 1): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uMap: { value: map }, uStrength: { value: strength } },
    vertexShader: GLYPH_VERT,
    fragmentShader: GLYPH_FRAG,
    ...ADDITIVE,
  });
}

/** A light direction from an azimuth (0 faces the camera, negative is left) and an elevation, both in degrees. */
export function lightFrom(azimuth: number, elevation: number, out: Vector3): Vector3 {
  const a = (azimuth * Math.PI) / 180;
  const e = (elevation * Math.PI) / 180;
  return out.set(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).normalize();
}
