import type { CSSProperties } from 'react';

// The props every brand mark under icons/ takes, the shape PythonLogo set:
// a mark fits the icon slots that size a glyph by class or by `size`, and
// it is announced only when a title is given.
export type BrandMarkProps = {
  // Applied to both dimensions unless width or height is given.
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  // Accepted for compatibility with stroke-based icon component slots.
  strokeWidth?: number;
  // 'brand' draws the mark in its own colors and 'monochrome' in
  // currentColor. A mark that is one color by nature draws currentColor
  // under both.
  variant?: 'brand' | 'monochrome';
  // Announces the mark with this name when set; otherwise it is decorative.
  title?: string;
};
