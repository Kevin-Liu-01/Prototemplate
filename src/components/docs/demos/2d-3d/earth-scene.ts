import {
  BufferGeometry,
  DataTexture,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  LineLoop,
  Mesh,
  PerspectiveCamera,
  RedFormat,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  UnsignedByteType,
} from 'three';

import { landAt } from '@/app/d/blog-globe/_rounds/r3/land';

import type { SceneEnv, SceneInstance } from './dither-stage';
import type { Turn } from './drag';
import { lightFrom, lightUniform, lineMaterial } from './materials';

/**
 * The Earth as a lit sphere. The land is the blog globe's 1 degree mask
 * (Natural Earth 4.1.0 through world-atlas, public domain), read at each
 * cell's centre into a 360 by 180 texture; the GPU's linear filter
 * interpolates between cells, so the coast is the 0.5 contour of a
 * smooth field. The fragment shader writes the light: land
 * takes more of the sun than the sea, the sea carries a specular glint,
 * and a thin rim brightens the day side's limb. It also draws two kinds of
 * hairline in screen pixels with fwidth: the coast at the mask's 0.5
 * contour and a 15 degree graticule. A ring at the limb, sized for the
 * perspective camera, outlines the night side on a dark ground.
 */

const TEX_W = 360;
const TEX_H = 180;
const TILT = (23.44 * Math.PI) / 180;
const FOV = 22;

let landData: Uint8Array | null = null;

/** Rows run south to north to match SphereGeometry's v; columns start at 180 degrees west. */
function landTexture(): DataTexture {
  if (!landData) {
    landData = new Uint8Array(TEX_W * TEX_H);
    for (let j = 0; j < TEX_H; j++) {
      const lat = -90 + ((j + 0.5) * 180) / TEX_H;
      for (let i = 0; i < TEX_W; i++) {
        const lon = -180 + ((i + 0.5) * 360) / TEX_W;
        landData[j * TEX_W + i] = Math.round(landAt(lat, lon) * 255);
      }
    }
  }
  const texture = new DataTexture(landData, TEX_W, TEX_H, RedFormat, UnsignedByteType);
  texture.wrapS = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const VERT = `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

/* Shader notes: land is the filtered mask (0.5 is the coast). The coast
   line is 1 at the 0.5 crossing and falls to 0 one pixel away
   (fwidth(land) is the mask's change per pixel); the graticule does the
   same with fract() over 24 meridians and 12 parallels. Lines go to blue
   at their strengths; the light goes to red. */
const FRAG = `
uniform sampler2D uLand;
uniform vec3 uLight;
uniform float uCoast;
uniform float uGrid;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;
float hair(float d, float w) {
  return 1.0 - smoothstep(0.0, 1.0, d / max(w, 1e-5));
}
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float land = texture2D(uLand, vUv).r;
  float isLand = smoothstep(0.42, 0.58, land);
  float d = dot(n, uLight);
  float lam = max(d, 0.0);
  float glint = pow(max(dot(n, normalize(uLight + v)), 0.0), 56.0) * (1.0 - isLand) * 0.5;
  float sea = 0.035 + 0.52 * lam + glint;
  float ground = 0.08 + 0.88 * lam;
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.4 * smoothstep(-0.1, 0.4, d);
  float t = mix(sea, ground, isLand) + rim;
  float line = uCoast * hair(abs(land - 0.5), fwidth(land)) * 0.9;
  vec2 g = vec2(vUv.x * 24.0, vUv.y * 12.0);
  vec2 gd = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-5));
  line = max(line, uGrid * (1.0 - min(min(gd.x, gd.y), 1.0)) * 0.42);
  gl_FragColor = vec4(clamp(t, 0.0, 1.0), 0.0, line, 1.0);
}
`;

export type EarthLines = 'coast' | 'grid' | 'both' | 'none';

export type EarthState = {
  turn: Turn;
  /** the sun's azimuth in degrees; negative is the viewer's left */
  sun: number;
  lines: EarthLines;
};

let sphere: SphereGeometry | null = null;
let ring: BufferGeometry | null = null;

function ringGeometry(): BufferGeometry {
  if (ring) return ring;
  const points: number[] = [];
  const steps = 256;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    points.push(Math.cos(a), Math.sin(a), 0);
  }
  ring = new BufferGeometry();
  ring.setAttribute('position', new Float32BufferAttribute(points, 3));
  return ring;
}

export function buildEarthScene(env: SceneEnv, read: () => EarthState): SceneInstance {
  sphere ??= new SphereGeometry(1, 160, 96);
  const limbGeometry = ringGeometry();
  const land = landTexture();
  const light = lightUniform();
  const coast = { value: 1 };
  const grid = { value: 1 };
  const material = new ShaderMaterial({
    uniforms: { uLand: { value: land }, uLight: light, uCoast: coast, uGrid: grid },
    vertexShader: VERT,
    fragmentShader: FRAG,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const limbMaterial = lineMaterial(0.6);

  const scene = new Scene();
  const axis = new Group();
  const globe = new Mesh(sphere, material);
  axis.add(globe);
  scene.add(axis);
  const limb = new LineLoop(limbGeometry, limbMaterial);
  scene.add(limb);

  const camera = new PerspectiveCamera(FOV, env.width / env.height, 0.1, 60);

  const fit = (width: number, height: number) => {
    camera.aspect = width / height;
    const half = Math.tan(((FOV / 2) * Math.PI) / 180);
    const across = Math.min(1, camera.aspect);
    const dist = 1.32 / (half * across) + 0.1;
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    /* the limb seen from distance d: a circle r²/d toward the camera, of radius r·sqrt(1 - r²/d²) */
    limb.position.set(0, 0, 1 / dist);
    const r = Math.sqrt(1 - 1 / (dist * dist));
    limb.scale.set(r, r, 1);
  };
  fit(env.width, env.height);

  return {
    scene,
    camera,
    onPaper: 'light',
    gain: { dark: 1, light: 0.82 },
    update(time) {
      const state = read();
      axis.rotation.set(0.32 + state.turn.pitch, 0, TILT, 'XYZ');
      globe.rotation.y = -1.9 + time * 0.16 + state.turn.yaw;
      lightFrom(state.sun, 18, light.value);
      coast.value = state.lines === 'coast' || state.lines === 'both' ? 1 : 0;
      grid.value = state.lines === 'grid' || state.lines === 'both' ? 1 : 0;
    },
    resize: fit,
    dispose() {
      sphere?.dispose();
      limbGeometry.dispose();
      land.dispose();
      material.dispose();
      limbMaterial.dispose();
    },
  };
}
