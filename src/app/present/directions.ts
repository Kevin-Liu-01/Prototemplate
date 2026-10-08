import { DIRECTIONS, type Direction } from '@/lib/directions';

/**
 * The directions the presenter walks: the first 16 of the registry, in its
 * order, without Signal. Kevin asked (2026-09-09) that Signal stay out of the
 * presentation, and (2026-10-08) that the presenter show only the first 16
 * prototypes so the close beat's title stays on screen. The viewer's roll,
 * the grid, the dock count, the contact sheet and the verdict gallery all
 * read this one list.
 */
export const PRESENT_DIRECTIONS: readonly Direction[] = DIRECTIONS.filter(
  (d) => d.slug !== 'singularity-signal'
).slice(0, 16);
