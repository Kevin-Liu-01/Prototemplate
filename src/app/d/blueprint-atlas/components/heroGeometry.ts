/**
 * Ray geometry for the hero.
 *
 * The prismatic burst converges on a dark centre; every flowing component is
 * placed on a ray emanating from that same point, so screen position, depth and
 * scale all agree with the light. A ray is a straight line through the origin in
 * the projected image regardless of z (x and y are scaled by the same
 * perspective factor), which is why the drafted ray guides can be plain rotated
 * hairlines and still land exactly under the components.
 *
 * Components travel in mirrored PAIRS: one English card outbound on the left
 * arm of a ray and its translation outbound on the right arm of the same ray,
 * at identical offsets. The pairing is the whole point of the picture, so it is
 * built into the geometry rather than left to two independent loops drifting
 * apart.
 */

/**
 * Elevation of each ray, in degrees, mirrored on both sides of the lens. The
 * spread is wide enough that a card on one ray clears the card on the next:
 * at the radii these run at, 14° of separation is more than a card is tall.
 */
export const FAN_DEG = [-34, -20, -7, 7, 20, 34];

/** The fan is flattened vertically so it reads as a horizontal light band. */
export const Y_SQUASH = 0.76;

/** Deepest z (at the lens) and nearest z (at the outer rim). */
export const Z_FAR = -430;
export const Z_NEAR = 205;

/** Perspective distance declared on the stage in styles.css. */
export const PERSPECTIVE = 1150;

export type NodeFrame = {
  x: number;
  y: number;
  z: number;
  /** Perspective factor at this depth — screen offset ÷ layout offset. */
  project: number;
  /** Distance from the vanishing point in projected screen pixels. */
  screenR: number;
  /** Tangential stretch direction, degrees. */
  tangent: number;
  stretch: number;
  /** 0 = English metrics, 1 = translated metrics. */
  resize: number;
};

export const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** Screen angle of a ray, in degrees, after the vertical squash. */
export function rayScreenAngle(deg: number, side: -1 | 1): number {
  const a = (deg * Math.PI) / 180;
  return (Math.atan2(Math.sin(a) * Y_SQUASH, Math.cos(a) * side) * 180) / Math.PI;
}

/**
 * Resolve a component's visual state from its outward progress `u` (0 at the
 * lens, 1 at the rim). Opacity is deliberately NOT decided here: it depends on
 * the card's own measured width against the dial and the frame, which only the
 * component knows, so it is computed there from `screenR`.
 */
export function frameAt(u: number, deg: number, side: -1 | 1, rMax: number): NodeFrame {
  const r = rMax * Math.pow(u, 1.25);
  const z = Z_FAR + (Z_NEAR - Z_FAR) * u;

  // Near the lens the ray is bent away from the axis, so a component appears to
  // be flung out of the well rather than sliding down a ruled line.
  const bend = (1 - u) * (1 - u) * 12 * (deg >= 0 ? 1 : -1);
  const d = deg + bend;
  const a = (d * Math.PI) / 180;

  const x = Math.cos(a) * r * side;
  const y = Math.sin(a) * r * Y_SQUASH;

  const project = PERSPECTIVE / (PERSPECTIVE - z);

  return {
    x,
    y,
    z,
    project,
    screenR: Math.hypot(x, y) * project,
    tangent: rayScreenAngle(d, side) + 90,
    stretch: Math.pow(1 - u, 2) * 0.4,
    resize: smooth(0.16, 0.42, u),
  };
}

export function maxRadius(stageWidth: number): number {
  return Math.max(300, Math.min(stageWidth * 0.46, 700));
}
