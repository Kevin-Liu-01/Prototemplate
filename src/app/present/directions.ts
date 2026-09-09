import { DIRECTIONS, type Direction } from '@/lib/directions';

/**
 * The directions the presenter walks. Kevin asked (2026-09-09) that Signal
 * stay out of the presentation, so the presenter filters it here and every
 * presenter view reads this list instead of the full registry.
 */
export const PRESENT_DIRECTIONS: readonly Direction[] = DIRECTIONS.filter((d) => d.slug !== 'singularity-signal');
