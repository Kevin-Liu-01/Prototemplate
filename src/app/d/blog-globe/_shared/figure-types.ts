/**
 * The two types the globe figures' stops.ts files take from gt-cloud's
 * Versions figure (apps/landing/src/components/blog/Versions.tsx and
 * VersionsFigure.tsx on k/blog-globe at 5ba413acfb), copied verbatim, so
 * the rounds keep their own type annotations without the figure itself.
 */
import type { ReactNode } from 'react';

export type LineProps = {
  /** The line's own marker, kept verbatim (α΄., IIII., 第一界：, 1.). */
  n?: string;
  children?: ReactNode;
};

export type VersionPanel = {
  lang: string;
  label: string;
  dir: 'ltr' | 'rtl' | 'auto';
  /** The version's panel, an ol.vf-panel or div.vf-panel with its lang and dir. */
  body: ReactNode;
};
