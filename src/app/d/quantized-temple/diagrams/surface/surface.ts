/**
 * The four small surfaces that sit around the SDK in the four-across row.
 *
 * They are deliberately NOT axonometric. At a quarter of the column each cell
 * is ~225px wide, which is enough room for a real string, a real number or
 * three lines of real config — and not enough for a drawn object to say
 * anything a caption could not. So these are built in the same hairline
 * vocabulary as the story's annotated mock: a window, a request, a config
 * fragment and a glossary table, each carrying something you could not delete
 * without losing information.
 */

export type SurfaceProps = {
  className?: string;
  /** Accessible name. Without one the panel is decorative and hidden. */
  title?: string;
};

export function surfaceClass(base: string, className?: string): string {
  return className ? `tcx ${base} ${className}` : `tcx ${base}`;
}

/** Named for a screen reader, or hidden — never both, never neither. */
export function surfaceA11y(title?: string): { role: 'img'; 'aria-label': string } | { 'aria-hidden': true } {
  return title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
}
