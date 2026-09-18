/**
 * The shapes /graphics shares between the server (which reads the manifest,
 * the exports and the posts from disk in src/lib/graphics.ts) and the
 * client viewer. Pure types and label helpers; no Node, no React, so the
 * client bundle can import them.
 */

/** One version of an image: the file, its size when known, and how it plays. */
export type Variant = {
  key: string;
  label: string;
  src: string;
  w?: number;
  h?: number;
  kind: 'image' | 'gif' | 'video';
};

/** One image of the set with every version it ships in. */
export type Entry = {
  id: string;
  /** the position in the whole set, padded (`007`) */
  n: string;
  title: string;
  why: string;
  /** the ground it sits on, when it is one of the set's exports */
  ground?: string;
  variants: readonly Variant[];
  /** the sidebar and grid thumbnail: the dark version under the dark theme, the light one under light */
  shot: { light: string; dark?: string };
};

/** One section of the viewer: an area of the post, the covers, the sheets, the grounds, an earlier post. */
export type Block = {
  id: string;
  label: string;
  /** the small line over the title: `Area A`, `Covers`, `Earlier in the series` */
  eyebrow: string;
  lead: string;
  ordinal: number;
  entries: readonly Entry[];
};

/** `u57` becomes `glyphfield export 57`; the cover variants name their treatment. */
export function backgroundLabel(bg: string): string {
  const user = /^u(\d+)$/.exec(bg);
  if (user) return `glyphfield export ${user[1]}`;
  const blue = /^blue(\d+)(light)?$/.exec(bg);
  if (blue) return `glyphfield export ${blue[1]}, ${blue[2] ? 'light ground' : 'blue duotone'}`;
  return bg;
}
