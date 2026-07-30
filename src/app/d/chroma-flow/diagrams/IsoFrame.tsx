import type { CSSProperties, ReactNode } from 'react';

import './iso.css';

/**
 * The contract every illustration in this folder honours. Colour is not a
 * prop: the drawings inherit `currentColor` and read CSS custom properties,
 * so a page themes the whole family from one ancestor.
 */
export type IsoProps = {
  className?: string;
  /** Base stroke weight in viewBox units. Default 1.2. */
  strokeWidth?: number;
  /** Spend the accent hue on this drawing's one accent element. Default true. */
  accent?: boolean;
  /** Accessible name. Without one the drawing is decorative and hidden. */
  title?: string;
};

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

/** Every feature object shares this frame, which is what fixes their relative scale. */
export const ISO_VIEW_W = 240;
export const ISO_VIEW_H = 180;

type IsoFrameProps = IsoProps & {
  viewW?: number;
  viewH?: number;
  children: ReactNode;
};

export default function IsoFrame({
  className,
  strokeWidth = 1.2,
  accent = true,
  title,
  viewW = ISO_VIEW_W,
  viewH = ISO_VIEW_H,
  children,
}: IsoFrameProps) {
  const style: StyleVars = { '--iso-sw': strokeWidth };
  const classes = ['iso', accent ? 'iso-accent-on' : 'iso-accent-off', className].filter(Boolean).join(' ');

  return (
    <svg
      className={classes}
      viewBox={`0 0 ${viewW} ${viewH}`}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
