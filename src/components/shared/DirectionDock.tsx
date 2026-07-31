'use client';

/**
 * Retired. The floating per-page switcher was replaced by the presenter's
 * unified dock: the index links straight into /present?d=<slug>, where the
 * same dock drives prototype switching, rating, and notes. The component
 * stays as a no-op so the thirty direction pages that mount it need no
 * edits, and direct /d/<slug> visits render chromeless (matching the
 * ?chrome=0 view the presenter and thumbnails always used).
 */
export default function DirectionDock(_props: { slug: string }) {
  return null;
}
