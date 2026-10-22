import { EdgesGeometry, ExtrudeGeometry, Group, LineSegments, Mesh, PerspectiveCamera, Scene } from 'three';
import type { BufferGeometry } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

import { REFERENCE_MARK } from '@/lib/marks';

import type { SceneEnv, SceneInstance } from './dither-stage';
import type { Turn } from './drag';
import { inkMaterial, lightFrom, lightUniform, lineMaterial } from './materials';

/**
 * The GT mark as a solid: REFERENCE_MARK, the doubled-line monogram's one
 * evenodd path (src/lib/marks.ts, the deck's #gt-mark), parsed by
 * SVGLoader into shapes with their holes and extruded 150 units deep with
 * no bevel, so every face is a flat plane and every wall between the
 * doubled lines catches the light on its own. EdgesGeometry at 28 degrees
 * keeps the front and back contours and the corners as hairlines and
 * drops the seams between the arc's short facets.
 */

const MARK_WIDTH = 2.4;
const DEPTH_UNITS = 150;
const FOV = 22;

let cached: { body: BufferGeometry; edges: BufferGeometry } | null = null;

/** Parsed and extruded once per page; each context uploads the same buffers again. */
function markGeometry(): { body: BufferGeometry; edges: BufferGeometry } {
  if (cached) return cached;
  const [, , vbWidth] = REFERENCE_MARK.viewBox.split(' ').map(Number);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${REFERENCE_MARK.viewBox}"><path fill-rule="evenodd" d="${REFERENCE_MARK.d}"/></svg>`;
  const shapes = new SVGLoader().parse(svg).paths.flatMap((path) => path.toShapes(false));
  const body = new ExtrudeGeometry(shapes, { depth: DEPTH_UNITS, bevelEnabled: false, curveSegments: 1 });
  /* SVG's y runs down: a half turn about x flips y and z together, which
     keeps the triangles' winding */
  body.rotateX(Math.PI);
  body.center();
  const scale = MARK_WIDTH / (vbWidth ?? 1213);
  body.scale(scale, scale, scale);
  const edges = new EdgesGeometry(body, 28);
  cached = { body, edges };
  return cached;
}

export type MarkState = {
  turn: Turn;
  /** the light's azimuth in degrees; negative is the viewer's left */
  light: number;
};

export function buildMarkScene(env: SceneEnv, read: () => MarkState): SceneInstance {
  const { body, edges } = markGeometry();
  const light = lightUniform();
  const material = inkMaterial({ light, ambient: 0.1, spec: 0.55, shine: 28 });
  const lines = lineMaterial(0.72);

  const scene = new Scene();
  const group = new Group();
  group.add(new Mesh(body, material));
  group.add(new LineSegments(edges, lines));
  scene.add(group);

  const camera = new PerspectiveCamera(FOV, env.width / env.height, 0.1, 60);

  const fit = (width: number, height: number) => {
    const aspect = width / height;
    camera.aspect = aspect;
    const half = Math.tan(((FOV / 2) * Math.PI) / 180);
    /* the mark is 2.4 by 1.53 units; leave room for the turn's depth and the corner tag */
    const byHeight = (1.53 * 1.5) / 2 / half;
    const byWidth = (MARK_WIDTH * 1.22) / 2 / (half * aspect);
    camera.position.set(0, 0, Math.max(byHeight, byWidth) + 0.2);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  fit(env.width, env.height);

  return {
    scene,
    camera,
    update(time) {
      const state = read();
      group.rotation.set(0.16 + state.turn.pitch, 0.95 * Math.sin(time * 0.5) + state.turn.yaw, 0, 'YXZ');
      lightFrom(state.light, 38, light.value);
    },
    resize: fit,
    dispose() {
      /* the geometry stays cached for the next context; dispose() frees only this context's buffers */
      body.dispose();
      edges.dispose();
      material.dispose();
      lines.dispose();
    },
  };
}
