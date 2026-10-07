import type { MotionReview } from '@/lib/motion';

/**
 * The words the motion pages use for a film's records and cuts, shared by
 * the server blocks (records.tsx) and the client viewers, so a cut reads
 * the same everywhere. Pure, no Node and no React.
 */

/** `3065664` bytes becomes `3.1 MB`. */
export function megabytes(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/** `100 s cut` stays; `v2` becomes `v2 cut`; no label reads `cut`. */
export function cutWords(label: string | undefined): string {
  if (!label) return 'cut';
  return /\bcut$/.test(label) ? label : `${label} cut`;
}

/** `v2, 74.8 s`: what a cut in review shows, its label and its length and nothing else. */
export function reviewWords(review: MotionReview): string {
  return review.label ? `${review.label}, ${review.length}` : review.length;
}
