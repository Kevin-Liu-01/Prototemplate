/**
 * The shapes of the /components set, safe in client modules. The data is
 * read on the server by src/lib/component-library.ts and passed to the
 * viewer by the page.
 */

/**
 * The lazy modules the docs Components pages import their client plates
 * from. src/app/components/plates.ts maps each one to its exports, so a
 * module added here without a registry entry fails tsc, and a docs page
 * that imports a plate from any other module fails the build.
 */
export const LAZY_PLATE_MODULES = [
  '@/components/docs/demos/lazy',
  '@/components/docs/demos/2d-3d/lazy',
  '@/components/docs/demos/artifacts/lazy',
  '@/components/docs/demos/dither-lab/lazy',
  '@/components/docs/demos/interactables/lazy',
  '@/components/docs/demos/layouts/lazy',
  '@/components/docs/demos/pages/lazy',
] as const;

/** The plates with a server half: MarksDemo reads public/marks at build time. src/app/components/plates.ts maps each one to its client plate, fed from a prerendered route. */
export const SERVER_PLATE_MODULES = ['@/components/docs/demos/MarksDemo'] as const;

export type LazyPlateModule = (typeof LAZY_PLATE_MODULES)[number];
export type ServerPlateModule = (typeof SERVER_PLATE_MODULES)[number];

/** The plate a docs section mounts: the element, the module its page imports it from, and its props as the MDX writes them. */
export type LibraryPlate = { name: string; props: Readonly<Record<string, unknown>> } & (
  | { kind: 'lazy'; module: LazyPlateModule }
  | { kind: 'server'; module: ServerPlateModule }
);

export type LibraryEntry = {
  /** `<docs page>-<heading id>`, or `src-<export>` for an undocumented component */
  id: string;
  /** the padded position in the whole set */
  n: string;
  name: string;
  /** the export the entry shows: `StudioField`, `createDitherLoop` */
  code: string;
  /** the file or folder in the repository */
  path: string;
  /** the docs section that documents it; absent for an undocumented component */
  docs?: { href: string; title: string };
  /** one sentence, for an undocumented component */
  desc?: string;
  /** the live plate, for a documented component */
  plate?: LibraryPlate;
  /** the height the row reserves for the plate before it mounts: [viewport width, height] points in ascending width */
  reserve?: readonly (readonly [width: number, height: number])[];
  /** the same under reduced motion, for a plate whose height differs there (a plate that moves adds its still note) */
  reserveStill?: readonly (readonly [width: number, height: number])[];
};

export type LibraryBlock = { id: string; label: string; entries: readonly LibraryEntry[] };

/**
 * The height a row reserves at viewport width `width`: the straight line
 * between the measured points on either side of it, or the end point's
 * height outside them.
 */
export function reserveAt(points: readonly (readonly [number, number])[], width: number): number {
  const first = points[0];
  if (!first) return 0;
  if (width <= first[0]) return first[1];
  for (let i = 1; i < points.length; i += 1) {
    const [hiW, hiH] = points[i] ?? first;
    if (width > hiW) continue;
    const [loW, loH] = points[i - 1] ?? first;
    return Math.round(loH + ((hiH - loH) * (width - loW)) / (hiW - loW));
  }
  return points[points.length - 1]?.[1] ?? 0;
}
