import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The illustration set behind /graphics: the manifest
 * graphics/build/gen-visuals.js writes (one row per visual) joined with
 * the exports under public/static/blogs and the areas of the post they
 * illustrate. Read on the server at build time.
 */

export type Visual = {
  id: string;
  /** the area letter: A to F for the post's sections, H for covers */
  area: string;
  name: string;
  /** the background key from gen-lib.js's BG map */
  bg: string;
  why: string;
  w: number;
  h: number;
  animated: boolean;
};

export type Area = {
  id: string;
  name: string;
  /** where in the post the area's visuals sit */
  slot: string;
  visuals: readonly Visual[];
};

const AREA_NAMES: Readonly<Record<string, { name: string; slot: string }>> = {
  H: { name: 'Covers', slot: 'The header cover, the OpenGraph image, the wireframe-map direction, and the light-mode variant.' },
  A: { name: 'Intuitive flow and direction', slot: 'After the four-line list of screen areas.' },
  B: { name: 'Cleaning up mental clutter', slot: 'After the deleted lines, links and buttons.' },
  C: { name: 'One singular accordion', slot: 'After the sidebar becomes one accordion.' },
  D: { name: 'Drawing the eye', slot: 'After the visual-hierarchy list, and the quickstart before and after.' },
  E: { name: 'A unique GT flair', slot: 'The table-of-contents and sidebar clips, and the UI primitives.' },
  F: { name: 'The hit list', slot: 'The closing list of anti-patterns; the list itself now renders as text.' },
};

const AREA_ORDER = ['H', 'A', 'B', 'C', 'D', 'E', 'F'] as const;

/** The GIF a clip ships as, by visual id. */
const CLIPS: Readonly<Record<string, string>> = {
  'E1-hover-mask': '/static/blogs/designing-docs-toc-slide.gif',
  'E6-sidebar-mask': '/static/blogs/designing-docs-sidebar-mask.gif',
};

export function readManifest(): readonly Visual[] {
  const file = join(process.cwd(), 'graphics', 'build', 'manifest.json');
  return JSON.parse(readFileSync(file, 'utf8')) as Visual[];
}

/** The visuals grouped by area, covers first, in the manifest's order within each. */
export function getAreas(): readonly Area[] {
  const visuals = readManifest();
  return AREA_ORDER.map((id) => ({
    id,
    name: AREA_NAMES[id]?.name ?? id,
    slot: AREA_NAMES[id]?.slot ?? '',
    visuals: visuals.filter((v) => v.area === id),
  })).filter((area) => area.visuals.length > 0);
}

/** The 3840-wide export of a visual. */
export function visualSrc(id: string): string {
  return `/static/blogs/designing-docs-${id}.webp`;
}

/** The GIF of an animated visual, when it has one. */
export function clipSrc(id: string): string | undefined {
  return CLIPS[id];
}

/** `u57` becomes `glyphfield export 57`; the cover variants name their treatment. */
export function backgroundLabel(bg: string): string {
  const user = /^u(\d+)$/.exec(bg);
  if (user) return `glyphfield export ${user[1]}`;
  const blue = /^blue(\d+)(light)?$/.exec(bg);
  if (blue) return `glyphfield export ${blue[1]}, ${blue[2] ? 'light ground' : 'blue duotone'}`;
  return bg;
}
